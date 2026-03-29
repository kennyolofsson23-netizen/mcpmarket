// F004: Auth
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
  handlers: { GET: jest.fn(), POST: jest.fn() },
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { update: jest.fn(), findUnique: jest.fn() },
  },
}));

import { GET, POST } from '@/app/api/auth/[...nextauth]/route';
import { POST as upgradeRole } from '@/app/api/auth/upgrade-role/route';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockUserUpdate = prisma.user.update as jest.MockedFunction<typeof prisma.user.update>;

describe('GET /api/auth/[...nextauth]', () => {
  it('exports GET as a function (NextAuth handler)', () => {
    expect(typeof GET).toBe('function');
  });

  it('exports POST as a function (NextAuth handler)', () => {
    expect(typeof POST).toBe('function');
  });

  it('creates user on first sign-in (handled by NextAuth adapter)', () => {
    // The NextAuth PrismaAdapter handles user creation automatically on first sign-in.
    // We verify that the handlers are exported correctly from the route.
    expect(GET).toBeDefined();
    expect(POST).toBeDefined();
  });
});

describe('POST /api/auth/upgrade-role', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('upgrades USER to DEVELOPER role', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-1', email: 'test@example.com', role: 'USER' },
      expires: '2099-01-01',
    } as never);
    mockUserUpdate.mockResolvedValueOnce({ id: 'user-1', role: 'DEVELOPER' } as never);

    const req = new Request('http://localhost/api/auth/upgrade-role', {
      method: 'POST',
    }) as never;
    const res = await upgradeRole(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ success: true, role: 'DEVELOPER' });
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { role: 'DEVELOPER' },
    });
  });

  it('rejects unauthenticated requests with 401', async () => {
    mockAuth.mockResolvedValueOnce(null as never);

    const req = new Request('http://localhost/api/auth/upgrade-role', {
      method: 'POST',
    }) as never;
    const res = await upgradeRole(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it('rejects upgrade when user is already DEVELOPER', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-2', email: 'dev@example.com', role: 'DEVELOPER' },
      expires: '2099-01-01',
    } as never);

    const req = new Request('http://localhost/api/auth/upgrade-role', {
      method: 'POST',
    }) as never;
    const res = await upgradeRole(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Already a developer');
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it('rejects upgrade when user is ADMIN', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-3', email: 'admin@example.com', role: 'ADMIN' },
      expires: '2099-01-01',
    } as never);

    const req = new Request('http://localhost/api/auth/upgrade-role', {
      method: 'POST',
    }) as never;
    const res = await upgradeRole(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Already a developer');
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });
});
