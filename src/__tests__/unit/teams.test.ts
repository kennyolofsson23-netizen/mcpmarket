// F016: Team Accounts
jest.mock('@/lib/auth', () => ({ auth: jest.fn() }));
jest.mock('@/lib/prisma', () => ({
  prisma: {
    team: { create: jest.fn(), findUnique: jest.fn() },
    teamMember: { create: jest.fn() },
    user: { findUnique: jest.fn() },
  },
}));

import { POST as createTeam } from '@/app/api/teams/route';
import { POST as addMember } from '@/app/api/teams/[id]/members/route';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const mockAuth = auth as jest.MockedFunction<typeof auth>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/teams', () => {
  it('creates team for authenticated user', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-1', role: 'DEVELOPER' },
    } as any);

    const mockTeam = {
      id: 'team-1',
      name: 'My Team',
      slug: 'my-team',
      ownerId: 'user-1',
      billingEmail: null,
      members: [{ id: 'mem-1', teamId: 'team-1', userId: 'user-1', role: 'OWNER' }],
    };
    (prisma.team.create as jest.Mock).mockResolvedValue(mockTeam);

    const req = new Request('http://localhost/api/teams', {
      method: 'POST',
      body: JSON.stringify({ name: 'My Team' }),
    }) as any;

    const res = await createTeam(req);

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.team.name).toBe('My Team');
    expect(data.team.slug).toBe('my-team');
    expect(prisma.team.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ ownerId: 'user-1' }),
      }),
    );
  });
});

describe('POST /api/teams/:id/members', () => {
  it('adds member to team', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'owner-1', role: 'DEVELOPER' },
    } as any);

    (prisma.team.findUnique as jest.Mock).mockResolvedValue({
      id: 'team-1',
      ownerId: 'owner-1',
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'member-1',
      email: 'member@example.com',
    });
    (prisma.teamMember.create as jest.Mock).mockResolvedValue({
      id: 'tm-1',
      teamId: 'team-1',
      userId: 'member-1',
      role: 'MEMBER',
    });

    const req = new Request('http://localhost/api/teams/team-1/members', {
      method: 'POST',
      body: JSON.stringify({ email: 'member@example.com', role: 'MEMBER' }),
    }) as any;
    const context = { params: { id: 'team-1' } };

    const res = await addMember(req, context);

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.member.role).toBe('MEMBER');
    expect(prisma.teamMember.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'member-1', teamId: 'team-1' }),
      }),
    );
  });

  it('rejects invite from non-owner', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'not-owner', role: 'DEVELOPER' },
    } as any);

    (prisma.team.findUnique as jest.Mock).mockResolvedValue({
      id: 'team-1',
      ownerId: 'owner-1',
    });

    const req = new Request('http://localhost/api/teams/team-1/members', {
      method: 'POST',
      body: JSON.stringify({ email: 'member@example.com' }),
    }) as any;
    const context = { params: { id: 'team-1' } };

    const res = await addMember(req, context);

    expect(res.status).toBe(403);
  });
});
