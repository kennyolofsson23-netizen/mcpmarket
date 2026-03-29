// F018: Server Version Management
jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    mcpServer: { findUnique: jest.fn() },
    serverVersion: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { GET, POST } from "@/app/api/servers/[slug]/versions/route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const mockAuth = auth as jest.MockedFunction<typeof auth>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/servers/:slug/versions", () => {
  it("creates new version for server owner", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "owner-1", role: "DEVELOPER" },
    } as any);

    (prisma.mcpServer.findUnique as jest.Mock).mockResolvedValue({
      id: "srv-1",
      slug: "my-server",
      ownerId: "owner-1",
    });
    (prisma.serverVersion.updateMany as jest.Mock).mockResolvedValue({
      count: 1,
    });
    (prisma.serverVersion.create as jest.Mock).mockResolvedValue({
      id: "ver-2",
      serverId: "srv-1",
      version: "1.1.0",
      changelog: "Bug fixes",
      isLatest: true,
      createdAt: new Date().toISOString(),
    });

    const req = new Request("http://localhost/api/servers/my-server/versions", {
      method: "POST",
      body: JSON.stringify({ version: "1.1.0", changelog: "Bug fixes" }),
    }) as any;
    const context = { params: { slug: "my-server" } };

    const res = await POST(req, context);

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.version.version).toBe("1.1.0");
    expect(data.version.isLatest).toBe(true);
  });

  it("sets new version as latest", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "owner-1", role: "DEVELOPER" },
    } as any);

    (prisma.mcpServer.findUnique as jest.Mock).mockResolvedValue({
      id: "srv-1",
      slug: "my-server",
      ownerId: "owner-1",
    });
    (prisma.serverVersion.updateMany as jest.Mock).mockResolvedValue({
      count: 2,
    });
    (prisma.serverVersion.create as jest.Mock).mockResolvedValue({
      id: "ver-3",
      serverId: "srv-1",
      version: "2.0.0",
      changelog: null,
      isLatest: true,
      createdAt: new Date().toISOString(),
    });

    const req = new Request("http://localhost/api/servers/my-server/versions", {
      method: "POST",
      body: JSON.stringify({ version: "2.0.0" }),
    }) as any;
    const context = { params: { slug: "my-server" } };

    const res = await POST(req, context);

    expect(res.status).toBe(201);
    expect(prisma.serverVersion.updateMany).toHaveBeenCalledWith({
      where: { serverId: "srv-1" },
      data: { isLatest: false },
    });
    const data = await res.json();
    expect(data.version.isLatest).toBe(true);
  });

  it("rejects non-owner with 403", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "other-user", role: "USER" },
    } as any);

    (prisma.mcpServer.findUnique as jest.Mock).mockResolvedValue({
      id: "srv-1",
      slug: "my-server",
      ownerId: "owner-1",
    });

    const req = new Request("http://localhost/api/servers/my-server/versions", {
      method: "POST",
      body: JSON.stringify({ version: "1.0.1" }),
    }) as any;
    const context = { params: { slug: "my-server" } };

    const res = await POST(req, context);

    expect(res.status).toBe(403);
  });
});

describe("GET /api/servers/:slug/versions", () => {
  it("returns version history for server", async () => {
    (prisma.mcpServer.findUnique as jest.Mock).mockResolvedValue({
      id: "srv-1",
      slug: "my-server",
    });
    (prisma.serverVersion.findMany as jest.Mock).mockResolvedValue([
      {
        id: "ver-2",
        version: "1.1.0",
        isLatest: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "ver-1",
        version: "1.0.0",
        isLatest: false,
        createdAt: new Date().toISOString(),
      },
    ]);

    const req = new Request(
      "http://localhost/api/servers/my-server/versions",
    ) as any;
    const context = { params: { slug: "my-server" } };

    const res = await GET(req, context);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.versions).toHaveLength(2);
    expect(data.versions[0].version).toBe("1.1.0");
  });
});
