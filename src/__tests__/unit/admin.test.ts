// F012: Admin Dashboard
jest.mock('@/lib/auth', () => ({ auth: jest.fn() }));
jest.mock('@/lib/prisma', () => ({
  prisma: {
    mcpServer: { count: jest.fn(), findMany: jest.fn(), update: jest.fn() },
    user: { count: jest.fn(), findMany: jest.fn() },
    subscription: { count: jest.fn() },
    transaction: { aggregate: jest.fn() },
  },
}));

import { GET as adminStats } from '@/app/api/admin/stats/route';
import { GET as pendingServers } from '@/app/api/admin/servers/pending/route';
import { POST as approveServer } from '@/app/api/admin/servers/[id]/approve/route';
import { POST as rejectServer } from '@/app/api/admin/servers/[id]/reject/route';
import { GET as adminUsers } from '@/app/api/admin/users/route';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const mockAuth = auth as jest.MockedFunction<typeof auth>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/admin/stats', () => {
  it('returns platform stats for admin', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN', email: 'admin@test.com' } } as any);
    (prisma.mcpServer.count as jest.Mock)
      .mockResolvedValueOnce(3)   // PENDING
      .mockResolvedValueOnce(10); // total
    (prisma.user.count as jest.Mock).mockResolvedValue(50);
    (prisma.subscription.count as jest.Mock).mockResolvedValue(25);
    (prisma.transaction.aggregate as jest.Mock)
      .mockResolvedValueOnce({ _sum: { amount: 10000 } })
      .mockResolvedValueOnce({ _sum: { platformFee: 500 } });

    const req = new Request('http://localhost/api/admin/stats') as any;
    const res = await adminStats(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.pendingServers).toBe(3);
    expect(data.totalUsers).toBe(50);
    expect(data.totalServers).toBe(10);
    expect(data.activeSubscriptions).toBe(25);
    expect(data.totalRevenue).toBe(10000);
    expect(data.platformFeeEarned).toBe(500);
  });

  it('rejects non-admin with 403', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1', role: 'USER', email: 'user@test.com' } } as any);

    const req = new Request('http://localhost/api/admin/stats') as any;
    const res = await adminStats(req);

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });
});

describe('GET /api/admin/servers/pending', () => {
  it('returns pending servers for admin', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN', email: 'admin@test.com' } } as any);
    (prisma.mcpServer.findMany as jest.Mock).mockResolvedValue([
      { id: 'srv-1', name: 'Pending Server', slug: 'pending-server', status: 'PENDING', createdAt: new Date(), owner: { id: 'dev-1', name: 'Dev', email: 'dev@test.com' } },
    ]);

    const req = new Request('http://localhost/api/admin/servers/pending') as any;
    const res = await pendingServers(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.servers).toHaveLength(1);
    expect(data.servers[0].status).toBe('PENDING');
    expect(data.servers[0].owner.email).toBe('dev@test.com');
  });
});

describe('POST /api/admin/servers/:id/approve', () => {
  it('approves server and notifies developer', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN', email: 'admin@test.com' } } as any);
    (prisma.mcpServer.update as jest.Mock).mockResolvedValue({
      id: 'srv-1', name: 'My Server', status: 'APPROVED',
    });

    const req = new Request('http://localhost/api/admin/servers/srv-1/approve', {
      method: 'POST',
    }) as any;

    const res = await approveServer(req, { params: { id: 'srv-1' } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.server.status).toBe('APPROVED');
    expect(prisma.mcpServer.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'srv-1' }, data: { status: 'APPROVED' } }),
    );
  });
});

describe('POST /api/admin/servers/:id/reject', () => {
  it('rejects server with reason', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN', email: 'admin@test.com' } } as any);
    (prisma.mcpServer.update as jest.Mock).mockResolvedValue({
      id: 'srv-1', name: 'My Server', status: 'REJECTED',
    });

    const req = new Request('http://localhost/api/admin/servers/srv-1/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Violates ToS' }),
    }) as any;

    const res = await rejectServer(req, { params: { id: 'srv-1' } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(prisma.mcpServer.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'srv-1' } }),
    );
  });
});

describe('GET /api/admin/users', () => {
  it('returns all users for admin', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN', email: 'admin@test.com' } } as any);
    (prisma.user.findMany as jest.Mock).mockResolvedValue([
      { id: 'user-1', name: 'Alice', email: 'alice@test.com', role: 'USER', createdAt: new Date(), _count: { servers: 0, subscriptions: 2 } },
      { id: 'user-2', name: 'Bob', email: 'bob@test.com', role: 'DEVELOPER', createdAt: new Date(), _count: { servers: 3, subscriptions: 0 } },
    ]);

    const req = new Request('http://localhost/api/admin/users') as any;
    const res = await adminUsers(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.users).toHaveLength(2);
    expect(data.users[0].email).toBe('alice@test.com');
    expect(data.users[1]._count.servers).toBe(3);
  });
});
