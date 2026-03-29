// F009: Stripe Connect Payouts
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';
process.env.NEXT_PUBLIC_URL = 'http://localhost:3000';

jest.mock('@/lib/auth', () => ({ auth: jest.fn() }));
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn(), update: jest.fn() },
    transaction: { findMany: jest.fn() },
  },
}));
jest.mock('@/lib/stripe', () => ({
  createConnectAccount: jest.fn(),
  createConnectOnboardingLink: jest.fn(),
}));

import { POST as onboard } from '@/app/api/billing/connect/onboard/route';
import { GET as connectStatus } from '@/app/api/billing/connect/status/route';
import { GET as transactions } from '@/app/api/developer/transactions/route';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createConnectAccount, createConnectOnboardingLink } from '@/lib/stripe';

const mockAuth = auth as jest.MockedFunction<typeof auth>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/billing/connect/onboard', () => {
  it('creates Stripe Connect account and returns onboarding URL', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'dev-1', role: 'DEVELOPER', email: 'dev@test.com' },
    } as any);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'dev-1',
      email: 'dev@test.com',
      stripeConnectId: null,
      connectOnboarded: false,
    });
    (createConnectAccount as jest.Mock).mockResolvedValue({ id: 'acct_test123' });
    (prisma.user.update as jest.Mock).mockResolvedValue({});
    (createConnectOnboardingLink as jest.Mock).mockResolvedValue({
      url: 'https://connect.stripe.com/onboard/acct_test123',
    });

    const req = new Request('http://localhost/api/billing/connect/onboard', {
      method: 'POST',
    }) as any;

    const res = await onboard(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.url).toBe('https://connect.stripe.com/onboard/acct_test123');
    expect(createConnectAccount).toHaveBeenCalledWith('dev@test.com');
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { stripeConnectId: 'acct_test123' } }),
    );
  });

  it('rejects non-developer with 403', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-1', role: 'USER', email: 'user@test.com' },
    } as any);

    const req = new Request('http://localhost/api/billing/connect/onboard', {
      method: 'POST',
    }) as any;

    const res = await onboard(req);
    expect(res.status).toBe(403);
    expect(createConnectAccount).not.toHaveBeenCalled();
  });
});

describe('GET /api/billing/connect/status', () => {
  it('returns connect account status for developer', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'dev-1', role: 'DEVELOPER', email: 'dev@test.com' },
    } as any);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'dev-1',
      stripeConnectId: 'acct_test123',
      connectOnboarded: true,
    });

    const req = new Request('http://localhost/api/billing/connect/status') as any;
    const res = await connectStatus(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.stripeConnectId).toBe('acct_test123');
    expect(data.connectOnboarded).toBe(true);
    expect(data.hasConnectAccount).toBe(true);
  });
});

describe('GET /api/developer/transactions', () => {
  it('returns transaction history for developer', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'dev-1', role: 'DEVELOPER', email: 'dev@test.com' },
    } as any);
    const mockTransactions = [
      {
        id: 'txn-1',
        amount: 1000,
        status: 'COMPLETED',
        serverId: 'server-1',
        sellerId: 'dev-1',
        createdAt: new Date(),
        server: { name: 'My Server', slug: 'my-server' },
      },
    ];
    (prisma.transaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);

    const req = new Request('http://localhost/api/developer/transactions') as any;
    const res = await transactions(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.transactions).toHaveLength(1);
    expect(data.transactions[0].id).toBe('txn-1');
    expect(prisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { sellerId: 'dev-1' } }),
    );
  });
});
