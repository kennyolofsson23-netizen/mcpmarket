// F003: Server Detail Page
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

import { GET as getDetail } from '@/app/api/servers/[slug]/route';
import { prisma } from '@/lib/prisma';

const mockFindUnique = prisma.mcpServer.findUnique as jest.MockedFunction<typeof prisma.mcpServer.findUnique>;

const mockFullServer = {
  id: 'server-abc',
  name: 'Analytics MCP',
  slug: 'analytics-mcp',
  description: 'Real-time analytics powered by MCP protocol',
  longDescription: 'This server provides full analytics capabilities including dashboards and alerts.',
  logoUrl: 'https://example.com/logo.png',
  repoUrl: 'https://github.com/example/analytics-mcp',
  websiteUrl: 'https://analytics-mcp.example.com',
  category: 'analytics',
  tags: '["analytics","data","realtime"]',
  status: 'APPROVED',
  pricingModel: 'SUBSCRIPTION',
  price: 1999,
  usagePrice: null,
  freeCallLimit: null,
  endpointUrl: 'https://api.analytics-mcp.example.com/mcp',
  managedHosting: false,
  installCount: 250,
  avgRating: 4.7,
  ownerId: 'owner-1',
  featured: true,
  createdAt: new Date('2024-02-15'),
  updatedAt: new Date('2024-03-01'),
  owner: {
    id: 'owner-1',
    name: 'Analytics Co',
    email: 'team@analytics-mcp.example.com',
    image: 'https://example.com/team.png',
  },
  _count: { subscriptions: 42, reviews: 18 },
};

function makeSlugContext(slug: string) {
  return { params: { slug } };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Server Detail Page', () => {
  it('renders server name, description, pricing', async () => {
    mockFindUnique.mockResolvedValue(mockFullServer as any);

    const req = new Request('http://localhost/api/servers/analytics-mcp') as any;
    const res = await getDetail(req, makeSlugContext('analytics-mcp') as any);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe('Analytics MCP');
    expect(data.description).toBe('Real-time analytics powered by MCP protocol');
    expect(data.pricingModel).toBe('SUBSCRIPTION');
    expect(data.price).toBe(1999);
  });

  it('returns endpoint URL that supports config snippet for subscribers', async () => {
    mockFindUnique.mockResolvedValue(mockFullServer as any);

    const req = new Request('http://localhost/api/servers/analytics-mcp') as any;
    const res = await getDetail(req, makeSlugContext('analytics-mcp') as any);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.endpointUrl).toBe('https://api.analytics-mcp.example.com/mcp');
    expect(data.slug).toBe('analytics-mcp');
    // These fields allow the frontend to build a config snippet:
    expect(data.name).toBeDefined();
    expect(data.endpointUrl).toBeDefined();
  });

  it('returns 404 for unknown slug', async () => {
    mockFindUnique.mockResolvedValue(null);

    const req = new Request('http://localhost/api/servers/not-a-real-server') as any;
    const res = await getDetail(req, makeSlugContext('not-a-real-server') as any);

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('returns server with reviews data', async () => {
    mockFindUnique.mockResolvedValue(mockFullServer as any);

    const req = new Request('http://localhost/api/servers/analytics-mcp') as any;
    const res = await getDetail(req, makeSlugContext('analytics-mcp') as any);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.avgRating).toBe(4.7);
    expect(data._count.reviews).toBe(18);
    expect(data._count.subscriptions).toBe(42);
  });

  it('returns owner information with server', async () => {
    mockFindUnique.mockResolvedValue(mockFullServer as any);

    const req = new Request('http://localhost/api/servers/analytics-mcp') as any;
    const res = await getDetail(req, makeSlugContext('analytics-mcp') as any);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.owner).toBeDefined();
    expect(data.owner.id).toBe('owner-1');
    expect(data.owner.name).toBe('Analytics Co');
    // email included per GET spec
    expect(data.owner.email).toBe('team@analytics-mcp.example.com');
  });

  it('queries with APPROVED status filter and correct slug', async () => {
    mockFindUnique.mockResolvedValue(mockFullServer as any);

    const req = new Request('http://localhost/api/servers/analytics-mcp') as any;
    await getDetail(req, makeSlugContext('analytics-mcp') as any);

    expect(mockFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'analytics-mcp', status: 'APPROVED' },
      }),
    );
  });

  it('returns long description when present', async () => {
    mockFindUnique.mockResolvedValue(mockFullServer as any);

    const req = new Request('http://localhost/api/servers/analytics-mcp') as any;
    const res = await getDetail(req, makeSlugContext('analytics-mcp') as any);

    const data = await res.json();
    expect(data.longDescription).toBe(
      'This server provides full analytics capabilities including dashboards and alerts.',
    );
  });

  it('returns installCount and featured status', async () => {
    mockFindUnique.mockResolvedValue(mockFullServer as any);

    const req = new Request('http://localhost/api/servers/analytics-mcp') as any;
    const res = await getDetail(req, makeSlugContext('analytics-mcp') as any);

    const data = await res.json();
    expect(data.installCount).toBe(250);
    expect(data.featured).toBe(true);
  });
});
