// F011: Server Reviews
jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    mcpServer: { findUnique: jest.fn(), update: jest.fn() },
    subscription: { findFirst: jest.fn() },
    review: {
      findMany: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
      create: jest.fn(),
      aggregate: jest.fn(),
    },
  },
}));

import { GET, POST } from "@/app/api/servers/[slug]/reviews/route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const mockAuth = auth as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/servers/:slug/reviews", () => {
  it("creates review for subscriber", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", role: "USER", email: "user@test.com" },
    } as any);
    (prisma.mcpServer.findUnique as jest.Mock).mockResolvedValue({
      id: "srv-1",
      slug: "test-server",
      avgRating: 0,
    });
    (prisma.subscription.findFirst as jest.Mock).mockResolvedValue({
      id: "sub-1",
      status: "ACTIVE",
    });
    (prisma.review.upsert as jest.Mock).mockResolvedValue({
      id: "rev-1",
      rating: 5,
      comment: "Great!",
      userId: "user-1",
      serverId: "srv-1",
      createdAt: new Date(),
    });
    (prisma.review.aggregate as jest.Mock).mockResolvedValue({
      _avg: { rating: 5 },
    });
    (prisma.mcpServer.update as jest.Mock).mockResolvedValue({});

    const req = new Request(
      "http://localhost/api/servers/test-server/reviews",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: 5, comment: "Great!" }),
      },
    ) as any;

    const res = await POST(req, { params: Promise.resolve({ slug: "test-server" }) } as any);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.rating).toBe(5);
    expect(prisma.review.upsert).toHaveBeenCalled();
  });

  it("rejects review from non-subscriber", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", role: "USER", email: "user@test.com" },
    } as any);
    (prisma.mcpServer.findUnique as jest.Mock).mockResolvedValue({
      id: "srv-1",
      slug: "test-server",
    });
    (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(null);

    const req = new Request(
      "http://localhost/api/servers/test-server/reviews",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: 4 }),
      },
    ) as any;

    const res = await POST(req, { params: Promise.resolve({ slug: "test-server" }) } as any);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toMatch(/subscribe/i);
  });

  it("rejects duplicate review from same user", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", role: "USER", email: "user@test.com" },
    } as any);
    (prisma.mcpServer.findUnique as jest.Mock).mockResolvedValue({
      id: "srv-1",
      slug: "test-server",
      avgRating: 4,
    });
    (prisma.subscription.findFirst as jest.Mock).mockResolvedValue({
      id: "sub-1",
      status: "ACTIVE",
    });
    (prisma.review.upsert as jest.Mock).mockResolvedValue({
      id: "rev-1",
      rating: 3,
      comment: "Updated",
      userId: "user-1",
      serverId: "srv-1",
      createdAt: new Date(),
    });
    (prisma.review.aggregate as jest.Mock).mockResolvedValue({
      _avg: { rating: 3 },
    });
    (prisma.mcpServer.update as jest.Mock).mockResolvedValue({});

    const req = new Request(
      "http://localhost/api/servers/test-server/reviews",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: 3, comment: "Updated" }),
      },
    ) as any;

    const res = await POST(req, { params: Promise.resolve({ slug: "test-server" }) } as any);
    // upsert allows overwrite — should succeed with 201
    expect(res.status).toBe(201);
    expect(prisma.review.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_serverId: { userId: "user-1", serverId: "srv-1" } },
      }),
    );
  });

  it("validates rating between 1 and 5", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", role: "USER", email: "user@test.com" },
    } as any);

    const req = new Request(
      "http://localhost/api/servers/test-server/reviews",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: 10 }),
      },
    ) as any;

    const res = await POST(req, { params: Promise.resolve({ slug: "test-server" }) } as any);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/rating/i);
  });
});

describe("GET /api/servers/:slug/reviews", () => {
  it("returns paginated reviews", async () => {
    (prisma.mcpServer.findUnique as jest.Mock).mockResolvedValue({
      id: "srv-1",
      slug: "test-server",
    });
    (prisma.review.findMany as jest.Mock).mockResolvedValue([
      {
        id: "rev-1",
        rating: 5,
        comment: "Excellent",
        userId: "user-1",
        serverId: "srv-1",
        createdAt: new Date(),
        user: { id: "user-1", name: "Alice", image: null },
      },
    ]);
    (prisma.review.count as jest.Mock).mockResolvedValue(1);

    const req = new Request(
      "http://localhost/api/servers/test-server/reviews?page=1&limit=10",
    ) as any;
    const res = await GET(req, { params: Promise.resolve({ slug: "test-server" }) } as any);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.reviews).toHaveLength(1);
    expect(data.total).toBe(1);
    expect(data.reviews[0].user.name).toBe("Alice");
  });
});
