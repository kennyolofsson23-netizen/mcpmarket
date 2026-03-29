// F014: Featured Listings
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';
process.env.NEXT_PUBLIC_URL = 'http://localhost:3000';

jest.mock('@/lib/auth', () => ({ auth: jest.fn() }));
jest.mock('@/lib/prisma', () => ({
  prisma: {
    mcpServer: { findMany: jest.fn(), findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
  },
}));
jest.mock('@/lib/stripe', () => ({
  createCheckoutSession: jest.fn(),
}));

import { GET as featuredServers } from '@/app/api/servers/featured/route';
import { POST as featuredCheckout } from '@/app/api/billing/featured/route';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createCheckoutSession } from '@/lib/stripe';

const mockAuth = auth as jest.MockedFunction<typeof auth>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/servers/featured', () => {
  it('returns currently featured servers', async () => {
    (prisma.mcpServer.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'srv-1',
        name: 'Featured Server',
        featured: true,
        status: 'APPROVED',
        owner: { id: 'dev-1', name: 'Dev', image: null },
      },
    ]);

    const req = new Request('http://localhost/api/servers/featured') as any;
    const res = await featuredServers(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.servers).toHaveLength(1);
    expect(data.servers[0].featured).toBe(true);
  });
});

describe('POST /api/billing/featured', () => {
  it('creates featured listing Stripe session', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-1', role: 'DEVELOPER' },
    } as any);

    (prisma.mcpServer.findUnique as jest.Mock).mockResolvedValue({
      id: 'srv-1',
      ownerId: 'user-1',
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-1',
      stripeCustomerId: 'cus_test',
    });
    (createCheckoutSession as jest.Mock).mockResolvedValue({
      url: 'https://checkout.stripe.com/pay/test',
    });

    const req = new Request('http://localhost/api/billing/featured', {
      method: 'POST',
      body: JSON.stringify({ serverId: 'srv-1' }),
    }) as any;

    const res = await featuredCheckout(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.url).toBe('https://checkout.stripe.com/pay/test');
    expect(createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: { serverId: 'srv-1', type: 'featured' } }),
    );
  });

  it('rejects non-developer with 403', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-2', role: 'USER' },
    } as any);

    const req = new Request('http://localhost/api/billing/featured', {
      method: 'POST',
      body: JSON.stringify({ serverId: 'srv-1' }),
    }) as any;

    const res = await featuredCheckout(req);

    expect(res.status).toBe(403);
  });
});
