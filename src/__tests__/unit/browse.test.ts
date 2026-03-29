// F002: Server Discovery & Browse
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
  requireAuth: jest.fn(),
  requireRole: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    mcpServer: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
}));

import { GET } from '@/app/api/servers/route';
import { prisma } from '@/lib/prisma';

const mockFindMany = prisma.mcpServer.findMany as jest.MockedFunction<typeof prisma.mcpServer.findMany>;
const mockCount = prisma.mcpServer.count as jest.MockedFunction<typeof prisma.mcpServer.count>;

function makeServer(overrides: Record<string, unknown> = {}) {
  return {
    id: 'server-1',
    name: 'Test Server',
    slug: 'test-server',
    description: 'A test server description',
    category: 'data',
    tags: '[]',
    status: 'APPROVED',
    pricingModel: 'FREE',
    price: 0,
    installCount: 100,
    avgRating: 4.5,
    ownerId: 'user-1',
    featured: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    owner: { id: 'user-1', name: 'Dev', email: 'dev@example.com', image: null },
    _count: { subscriptions: 10, reviews: 5 },
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/servers (browse)', () => {
  it('returns paginated list of approved servers', async () => {
    const servers = [makeServer(), makeServer({ id: 'server-2', slug: 'server-two' })];
    mockFindMany.mockResolvedValue(servers as any);
    mockCount.mockResolvedValue(2);

    const req = new Request('http://localhost/api/servers') as any;
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.servers).toHaveLength(2);
    expect(data.total).toBe(2);
    expect(data.page).toBe(1);
    expect(data.totalPages).toBe(1);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'APPROVED' }),
        skip: 0,
        take: 20,
      }),
    );
  });

  it('returns correct page and totalPages for paginated results', async () => {
    mockFindMany.mockResolvedValue([makeServer()] as any);
    mockCount.mockResolvedValue(45);

    const req = new Request('http://localhost/api/servers?page=2&limit=20') as any;
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.page).toBe(2);
    expect(data.total).toBe(45);
    expect(data.totalPages).toBe(3);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 20 }),
    );
  });

  it('filters by category', async () => {
    const dataServers = [makeServer({ category: 'data' })];
    mockFindMany.mockResolvedValue(dataServers as any);
    mockCount.mockResolvedValue(1);

    const req = new Request('http://localhost/api/servers?category=data') as any;
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.servers).toHaveLength(1);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ category: 'data', status: 'APPROVED' }),
      }),
    );
  });

  it('filters by pricing model', async () => {
    const freeServers = [makeServer({ pricingModel: 'FREE' })];
    mockFindMany.mockResolvedValue(freeServers as any);
    mockCount.mockResolvedValue(1);

    const req = new Request('http://localhost/api/servers?pricingModel=FREE') as any;
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.servers).toHaveLength(1);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ pricingModel: 'FREE', status: 'APPROVED' }),
      }),
    );
  });

  it('searches by name and description', async () => {
    const matchedServers = [makeServer({ name: 'Postgres MCP', description: 'A postgres data server' })];
    mockFindMany.mockResolvedValue(matchedServers as any);
    mockCount.mockResolvedValue(1);

    const req = new Request('http://localhost/api/servers?search=postgres') as any;
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.servers).toHaveLength(1);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { name: { contains: 'postgres', mode: 'insensitive' } },
            { description: { contains: 'postgres', mode: 'insensitive' } },
          ],
        }),
      }),
    );
  });

  it('sorts by popular (installCount desc)', async () => {
    mockFindMany.mockResolvedValue([makeServer()] as any);
    mockCount.mockResolvedValue(1);

    const req = new Request('http://localhost/api/servers?sort=popular') as any;
    await GET(req);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { installCount: 'desc' } }),
    );
  });

  it('sorts by newest (createdAt desc)', async () => {
    mockFindMany.mockResolvedValue([makeServer()] as any);
    mockCount.mockResolvedValue(1);

    const req = new Request('http://localhost/api/servers?sort=newest') as any;
    await GET(req);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
    );
  });

  it('sorts by rating (avgRating desc)', async () => {
    mockFindMany.mockResolvedValue([makeServer()] as any);
    mockCount.mockResolvedValue(1);

    const req = new Request('http://localhost/api/servers?sort=rating') as any;
    await GET(req);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { avgRating: 'desc' } }),
    );
  });

  it('defaults to newest sort when no sort param provided', async () => {
    mockFindMany.mockResolvedValue([makeServer()] as any);
    mockCount.mockResolvedValue(1);

    const req = new Request('http://localhost/api/servers') as any;
    await GET(req);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
    );
  });

  it('includes owner and _count in results', async () => {
    mockFindMany.mockResolvedValue([makeServer()] as any);
    mockCount.mockResolvedValue(1);

    const req = new Request('http://localhost/api/servers') as any;
    const res = await GET(req);

    const data = await res.json();
    expect(data.servers[0].owner).toBeDefined();
    expect(data.servers[0].owner.id).toBe('user-1');
    expect(data.servers[0]._count).toBeDefined();
    expect(data.servers[0]._count.subscriptions).toBe(10);
    expect(data.servers[0]._count.reviews).toBe(5);
  });

  it('combines multiple filters together', async () => {
    mockFindMany.mockResolvedValue([makeServer({ category: 'data', pricingModel: 'FREE' })] as any);
    mockCount.mockResolvedValue(1);

    const req = new Request('http://localhost/api/servers?category=data&pricingModel=FREE&search=test') as any;
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'APPROVED',
          category: 'data',
          pricingModel: 'FREE',
        }),
      }),
    );
  });
});
