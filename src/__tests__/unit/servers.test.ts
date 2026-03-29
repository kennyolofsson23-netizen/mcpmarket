// F001: Server Listing & Publishing
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
  requireAuth: jest.fn(),
  requireRole: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
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

import { POST } from "@/app/api/servers/route";
import { GET as getDetail, PUT } from "@/app/api/servers/[slug]/route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const mockAuth = auth as jest.Mock;
const mockFindUnique = prisma.mcpServer.findUnique as jest.Mock;
const mockCreate = prisma.mcpServer.create as jest.Mock;
const mockUpdate = prisma.mcpServer.update as jest.Mock;

const baseServerBody = {
  name: "My Server",
  description: "A test server description here",
  pricingModel: "FREE",
  managedHosting: false,
  endpointUrl: "https://api.example.com",
  category: "general",
  tags: [],
};

const mockServer = {
  id: "server-1",
  name: "My Server",
  slug: "my-server",
  description: "A test server description here",
  longDescription: null,
  logoUrl: null,
  repoUrl: null,
  websiteUrl: null,
  category: "general",
  tags: "[]",
  status: "APPROVED",
  pricingModel: "FREE",
  price: 0,
  usagePrice: null,
  freeCallLimit: null,
  endpointUrl: "https://api.example.com",
  managedHosting: false,
  installCount: 0,
  avgRating: null,
  ownerId: "user-1",
  featured: false,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  owner: {
    id: "user-1",
    name: "Dev User",
    email: "dev@example.com",
    image: null,
  },
  _count: { subscriptions: 0, reviews: 0 },
};

function makeSlugContext(slug: string) {
  return { params: Promise.resolve({ slug }) };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/servers", () => {
  it("creates a server for authenticated developer", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: "user-1",
        role: "DEVELOPER",
        name: "Dev",
        email: "dev@example.com",
      },
      expires: "2099-01-01",
    } as any);
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ ...mockServer, status: "PENDING" } as any);

    const req = new Request("http://localhost/api/servers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(baseServerBody),
    }) as any;

    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.slug).toBe("my-server");
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "PENDING", ownerId: "user-1" }),
      }),
    );
  });

  it("rejects unauthenticated requests with 401", async () => {
    mockAuth.mockResolvedValue(null);

    const req = new Request("http://localhost/api/servers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(baseServerBody),
    }) as any;

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("rejects non-developer role with 403", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: "user-2",
        role: "USER",
        name: "Regular",
        email: "user@example.com",
      },
      expires: "2099-01-01",
    } as any);

    const req = new Request("http://localhost/api/servers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(baseServerBody),
    }) as any;

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("validates required fields", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: "user-1",
        role: "DEVELOPER",
        name: "Dev",
        email: "dev@example.com",
      },
      expires: "2099-01-01",
    } as any);

    const req = new Request("http://localhost/api/servers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "X" }), // too short, missing required fields
    }) as any;

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Validation failed");
    expect(data.details).toBeDefined();
  });

  it("rejects duplicate slugs with 409", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: "user-1",
        role: "DEVELOPER",
        name: "Dev",
        email: "dev@example.com",
      },
      expires: "2099-01-01",
    } as any);
    mockFindUnique.mockResolvedValue(mockServer as any);

    const req = new Request("http://localhost/api/servers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(baseServerBody),
    }) as any;

    const res = await POST(req);
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toMatch(/slug/i);
  });

  it("allows ADMIN role to create server", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: "admin-1",
        role: "ADMIN",
        name: "Admin",
        email: "admin@example.com",
      },
      expires: "2099-01-01",
    } as any);
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      ...mockServer,
      ownerId: "admin-1",
      status: "PENDING",
    } as any);

    const req = new Request("http://localhost/api/servers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(baseServerBody),
    }) as any;

    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});

describe("GET /api/servers/:slug", () => {
  it("returns server details for approved server", async () => {
    mockFindUnique.mockResolvedValue(mockServer as any);

    const req = new Request("http://localhost/api/servers/my-server") as any;
    const res = await getDetail(req, makeSlugContext("my-server") as any);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.slug).toBe("my-server");
    expect(data.name).toBe("My Server");
    expect(data.status).toBe("APPROVED");
  });

  it("returns 404 for unknown slug", async () => {
    mockFindUnique.mockResolvedValue(null);

    const req = new Request(
      "http://localhost/api/servers/does-not-exist",
    ) as any;
    const res = await getDetail(req, makeSlugContext("does-not-exist") as any);

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });
});

describe("PUT /api/servers/:slug", () => {
  it("updates server for owner", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: "user-1",
        role: "DEVELOPER",
        name: "Dev",
        email: "dev@example.com",
      },
      expires: "2099-01-01",
    } as any);
    mockFindUnique.mockResolvedValue(mockServer as any);
    const updatedServer = { ...mockServer, name: "Updated Server" };
    mockUpdate.mockResolvedValue(updatedServer as any);

    const req = new Request("http://localhost/api/servers/my-server", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated Server" }),
    }) as any;

    const res = await PUT(req, makeSlugContext("my-server") as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe("Updated Server");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: "my-server" } }),
    );
  });

  it("rejects update from non-owner with 403", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: "other-user",
        role: "USER",
        name: "Other",
        email: "other@example.com",
      },
      expires: "2099-01-01",
    } as any);
    mockFindUnique.mockResolvedValue(mockServer as any);

    const req = new Request("http://localhost/api/servers/my-server", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Hijacked Name" }),
    }) as any;

    const res = await PUT(req, makeSlugContext("my-server") as any);
    expect(res.status).toBe(403);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("allows ADMIN to update any server", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: "admin-1",
        role: "ADMIN",
        name: "Admin",
        email: "admin@example.com",
      },
      expires: "2099-01-01",
    } as any);
    mockFindUnique.mockResolvedValue(mockServer as any);
    mockUpdate.mockResolvedValue({
      ...mockServer,
      name: "Admin Updated",
    } as any);

    const req = new Request("http://localhost/api/servers/my-server", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Admin Updated" }),
    }) as any;

    const res = await PUT(req, makeSlugContext("my-server") as any);
    expect(res.status).toBe(200);
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const req = new Request("http://localhost/api/servers/my-server", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Anything" }),
    }) as any;

    const res = await PUT(req, makeSlugContext("my-server") as any);
    expect(res.status).toBe(401);
  });

  it("returns 404 when server slug does not exist", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: "user-1",
        role: "DEVELOPER",
        name: "Dev",
        email: "dev@example.com",
      },
      expires: "2099-01-01",
    } as any);
    mockFindUnique.mockResolvedValue(null);

    const req = new Request("http://localhost/api/servers/ghost-server", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Ghost" }),
    }) as any;

    const res = await PUT(req, makeSlugContext("ghost-server") as any);
    expect(res.status).toBe(404);
  });
});
