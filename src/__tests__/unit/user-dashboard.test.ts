// F007: User Dashboard
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';

jest.mock('@/lib/auth', () => ({ auth: jest.fn() }));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    subscription: { findMany: jest.fn(), findUnique: jest.fn() },
    apiKey: { findFirst: jest.fn() },
    user: { findUnique: jest.fn() },
  },
}));

jest.mock('@/lib/stripe', () => ({
  createBillingPortalSession: jest.fn(),
}));

import { GET as getSubscriptions } from '@/app/api/subscriptions/route';
import { GET as getConfig } from '@/app/api/subscriptions/[id]/config/route';
import { POST as billingPortal } from '@/app/api/billing/portal/route';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createBillingPortalSession } from '@/lib/stripe';

// auth has complex overloads; cast via jest.Mock to avoid 'never' parameter errors
const mockAuth = auth as unknown as jest.Mock;
const mockCreatePortal = createBillingPortalSession as jest.MockedFunction<
  typeof createBillingPortalSession
>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/subscriptions', () => {
  it('returns user subscriptions', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-1', role: 'USER', email: 'user@test.com' },
    } as any);

    (prisma.subscription.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'sub-1',
        userId: 'user-1',
        serverId: 'srv-1',
        status: 'ACTIVE',
        cancelAtPeriodEnd: false,
        server: { id: 'srv-1', name: 'My Server', slug: 'my-server' },
      },
    ]);

    const req = new Request('http://localhost/api/subscriptions') as any;
    const res = await getSubscriptions(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('subscriptions');
    expect(data.subscriptions).toHaveLength(1);
    expect(data.subscriptions[0]).toMatchObject({ id: 'sub-1', status: 'ACTIVE' });
    expect(data.subscriptions[0].server).toMatchObject({ slug: 'my-server' });
  });

  it('rejects unauthenticated requests', async () => {
    mockAuth.mockResolvedValue(null);

    const req = new Request('http://localhost/api/subscriptions') as any;
    const res = await getSubscriptions(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data).toHaveProperty('error', 'Unauthorized');
  });
});

describe('GET /api/subscriptions/:id/config', () => {
  it('returns MCP config snippet for subscriber', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-1', role: 'USER', email: 'user@test.com' },
    } as any);

    (prisma.subscription.findUnique as jest.Mock).mockResolvedValue({
      id: 'sub-1',
      userId: 'user-1',
      serverId: 'srv-1',
      server: {
        id: 'srv-1',
        slug: 'my-server',
        endpointUrl: 'https://mcp.example.com',
        ownerId: 'dev-1',
      },
    });

    (prisma.apiKey.findFirst as jest.Mock).mockResolvedValue({
      id: 'key-1',
      keyPrefix: 'mk_abc',
      isActive: true,
    });

    const req = new Request('http://localhost/api/subscriptions/sub-1/config') as any;
    const res = await getConfig(req, { params: { id: 'sub-1' } });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('config');
    expect(data.config.mcpServers).toHaveProperty('my-server');
    expect(data.config.mcpServers['my-server']).toMatchObject({
      url: 'https://mcp.example.com',
      apiKey: 'mk_abc...',
    });
  });

  it('rejects non-subscriber with 403', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'other-user', role: 'USER', email: 'other@test.com' },
    } as any);

    (prisma.subscription.findUnique as jest.Mock).mockResolvedValue({
      id: 'sub-1',
      userId: 'user-1',
      serverId: 'srv-1',
      server: { id: 'srv-1', slug: 'my-server', endpointUrl: 'https://mcp.example.com' },
    });

    const req = new Request('http://localhost/api/subscriptions/sub-1/config') as any;
    const res = await getConfig(req, { params: { id: 'sub-1' } });

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data).toHaveProperty('error', 'Forbidden');
  });
});

describe('POST /api/billing/portal', () => {
  it('creates Stripe billing portal session', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-1', role: 'USER', email: 'user@test.com' },
    } as any);

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-1',
      stripeCustomerId: 'cus_test123',
    });

    mockCreatePortal.mockResolvedValue({ url: 'https://billing.stripe.com/session/test' } as any);

    const req = new Request('http://localhost/api/billing/portal', { method: 'POST' }) as any;
    const res = await billingPortal(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('url', 'https://billing.stripe.com/session/test');
    expect(mockCreatePortal).toHaveBeenCalledWith({
      customerId: 'cus_test123',
      returnUrl: '/dashboard',
    });
  });
});
