// F015: Managed Hosting
jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    mcpServer: { findUnique: jest.fn(), update: jest.fn() },
  },
}));
jest.mock("@/lib/hosting", () => ({
  provisionHosting: jest.fn(),
  getHostingStatus: jest.fn(),
}));

import { POST as provision } from "@/app/api/hosting/provision/route";
import { GET as hostingStatus } from "@/app/api/hosting/[serverId]/status/route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { provisionHosting, getHostingStatus } from "@/lib/hosting";

const mockAuth = auth as jest.MockedFunction<typeof auth>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/hosting/provision", () => {
  it("provisions hosting for server owner", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "owner-1", role: "DEVELOPER" },
    } as any);

    (prisma.mcpServer.findUnique as jest.Mock).mockResolvedValue({
      id: "srv-1",
      ownerId: "owner-1",
      managedHosting: true,
    });
    (provisionHosting as jest.Mock).mockResolvedValue({
      endpointUrl: "https://hosted.mcpmarket.com/srv-1",
    });

    const req = new Request("http://localhost/api/hosting/provision", {
      method: "POST",
      body: JSON.stringify({ serverId: "srv-1" }),
    }) as any;

    const res = await provision(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.endpointUrl).toBe("https://hosted.mcpmarket.com/srv-1");
    expect(provisionHosting).toHaveBeenCalledWith("srv-1");
  });

  it("rejects non-owner with 403", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "other-user", role: "USER" },
    } as any);

    (prisma.mcpServer.findUnique as jest.Mock).mockResolvedValue({
      id: "srv-1",
      ownerId: "owner-1",
      managedHosting: true,
    });

    const req = new Request("http://localhost/api/hosting/provision", {
      method: "POST",
      body: JSON.stringify({ serverId: "srv-1" }),
    }) as any;

    const res = await provision(req);

    expect(res.status).toBe(403);
  });
});

describe("GET /api/hosting/:serverId/status", () => {
  it("returns hosting status for server owner", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "owner-1", role: "DEVELOPER" },
    } as any);

    (prisma.mcpServer.findUnique as jest.Mock).mockResolvedValue({
      id: "srv-1",
      ownerId: "owner-1",
    });
    (getHostingStatus as jest.Mock).mockResolvedValue({
      status: "RUNNING",
      endpointUrl: "https://hosted.mcpmarket.com/srv-1",
    });

    const req = new Request("http://localhost/api/hosting/srv-1/status") as any;
    const context = { params: { serverId: "srv-1" } };

    const res = await hostingStatus(req, context);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("RUNNING");
    expect(data.endpointUrl).toBe("https://hosted.mcpmarket.com/srv-1");
  });
});
