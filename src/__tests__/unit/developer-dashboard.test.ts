// F006: Developer Dashboard
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    mcpServer: { findMany: jest.fn(), findUnique: jest.fn() },
    subscription: { count: jest.fn(), findMany: jest.fn() },
    transaction: { aggregate: jest.fn(), findMany: jest.fn() },
    usageRecord: { findMany: jest.fn() },
  },
}));

import { GET } from '@/app/api/developer/stats/route';
import { GET as getAnalytics } from '@/app/api/developer/servers/[id]/analytics/route';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// auth has complex overloads; cast via jest.Mock to avoid 'never' parameter errors
const mockAuth = auth as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/developer/stats', () => {
  it('returns subscriber count and revenue for developer', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'dev-1', role: 'DEVELOPER', email: 'dev@test.com' },
    } as any);

    (prisma.mcpServer.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'srv-1',
        name: 'My Server',
        status: 'APPROVED',
        installCount: 5,
        totalRevenue: 10000,
        _count: { subscriptions: 3 },
      },
    ]);

    (prisma.transaction.aggregate as jest.Mock).mockResolvedValue({
      _sum: { amount: 10000 },
    });

    (prisma.transaction.findMany as jest.Mock).mockResolvedValue([]);

    const req = new Request('http://localhost/api/developer/stats') as any;
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('totalSubscribers', 3);
    expect(data).toHaveProperty('totalRevenue', 10000);
    expect(data).toHaveProperty('totalInstalls', 5);
    expect(data).toHaveProperty('servers');
    expect(data.servers).toHaveLength(1);
    expect(data.servers[0]).toMatchObject({ id: 'srv-1', name: 'My Server', subscribers: 3 });
    expect(data).toHaveProperty('revenueChart');
    expect(Array.isArray(data.revenueChart)).toBe(true);
  });

  it('rejects non-developer with 403', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-1', role: 'USER', email: 'user@test.com' },
    } as any);

    const req = new Request('http://localhost/api/developer/stats') as any;
    const res = await GET(req);

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data).toHaveProperty('error', 'Forbidden');
  });
});

describe('GET /api/developer/servers/:id/analytics', () => {
  it('returns daily analytics for server owner', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'dev-1', role: 'DEVELOPER', email: 'dev@test.com' },
    } as any);

    (prisma.mcpServer.findUnique as jest.Mock).mockResolvedValue({
      id: 'srv-1',
      ownerId: 'dev-1',
      name: 'My Server',
    });

    (prisma.usageRecord.findMany as jest.Mock).mockResolvedValue([
      { createdAt: new Date() },
      { createdAt: new Date() },
    ]);

    (prisma.transaction.findMany as jest.Mock).mockResolvedValue([
      { amount: 500, createdAt: new Date() },
    ]);

    const req = new Request('http://localhost/api/developer/servers/srv-1/analytics') as any;
    const res = await getAnalytics(req, { params: { id: 'srv-1' } });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('daily');
    expect(Array.isArray(data.daily)).toBe(true);
    expect(data.daily).toHaveLength(30);

    const today = new Date().toISOString().slice(0, 10);
    const todaySlot = data.daily.find((d: { date: string }) => d.date === today);
    expect(todaySlot).toBeDefined();
    expect(todaySlot.installs).toBe(2);
    expect(todaySlot.revenue).toBe(500);
  });

  it('rejects non-owner with 403', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'other-user', role: 'USER', email: 'other@test.com' },
    } as any);

    (prisma.mcpServer.findUnique as jest.Mock).mockResolvedValue({
      id: 'srv-1',
      ownerId: 'dev-1',
      name: 'My Server',
    });

    const req = new Request('http://localhost/api/developer/servers/srv-1/analytics') as any;
    const res = await getAnalytics(req, { params: { id: 'srv-1' } });

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data).toHaveProperty('error', 'Forbidden');
  });
});
