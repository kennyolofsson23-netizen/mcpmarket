// F008: API Key Management
jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    apiKey: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
  },
}));
jest.mock("@/lib/api-keys", () => ({
  generateApiKey: jest.fn().mockReturnValue({
    key: "mcpm_testkey1234567890",
    keyHash: "abc123hash",
    keyPrefix: "mcpm_test",
  }),
  hashApiKey: jest.fn((key: string) => "hashed_" + key),
  extractBearerToken: jest.fn(),
}));

import { GET, POST } from "@/app/api/keys/route";
import { DELETE } from "@/app/api/keys/[id]/route";
import { POST as verifyKey } from "@/app/api/verify-key/route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateApiKey, hashApiKey, extractBearerToken } from "@/lib/api-keys";

const mockAuth = auth as jest.MockedFunction<typeof auth>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/keys", () => {
  it("creates API key for authenticated user", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", role: "USER", email: "user@test.com" },
    } as any);
    (prisma.apiKey.create as jest.Mock).mockResolvedValue({
      id: "key-1",
      name: "My Key",
      keyPrefix: "mcpm_test",
      createdAt: new Date(),
      userId: "user-1",
    });

    const req = new Request("http://localhost/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "My Key" }),
    }) as any;

    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toHaveProperty("key");
    expect(data.key).toBe("mcpm_testkey1234567890");
  });

  it("returns plaintext key only once", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", role: "USER", email: "user@test.com" },
    } as any);
    (prisma.apiKey.create as jest.Mock).mockResolvedValue({
      id: "key-2",
      name: "Once Key",
      keyPrefix: "mcpm_test",
      createdAt: new Date(),
      userId: "user-1",
    });

    const req = new Request("http://localhost/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Once Key" }),
    }) as any;

    const res = await POST(req);
    const data = await res.json();
    // Raw key is present in POST response
    expect(data.key).toBeDefined();
    // keyHash must NOT be exposed
    expect(data.keyHash).toBeUndefined();
  });

  it("stores hashed key in database", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", role: "USER", email: "user@test.com" },
    } as any);
    (prisma.apiKey.create as jest.Mock).mockResolvedValue({
      id: "key-3",
      name: "Hash Key",
      keyPrefix: "mcpm_test",
      createdAt: new Date(),
      userId: "user-1",
    });

    const req = new Request("http://localhost/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Hash Key" }),
    }) as any;

    await POST(req);

    expect(generateApiKey).toHaveBeenCalled();
    const createCall = (prisma.apiKey.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.keyHash).toBe("abc123hash");
    // The raw key must not be stored
    expect(createCall.data.key).toBeUndefined();
  });
});

describe("DELETE /api/keys/:id", () => {
  it("deletes key owned by current user", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", role: "USER", email: "user@test.com" },
    } as any);
    (prisma.apiKey.findUnique as jest.Mock).mockResolvedValue({
      id: "key-1",
      userId: "user-1",
    });
    (prisma.apiKey.delete as jest.Mock).mockResolvedValue({});

    const req = new Request("http://localhost/api/keys/key-1", {
      method: "DELETE",
    }) as any;
    const res = await DELETE(req, { params: { id: "key-1" } });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(prisma.apiKey.delete).toHaveBeenCalledWith({
      where: { id: "key-1" },
    });
  });

  it("rejects deletion of another user's key", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", role: "USER", email: "user@test.com" },
    } as any);
    (prisma.apiKey.findUnique as jest.Mock).mockResolvedValue({
      id: "key-99",
      userId: "other-user",
    });

    const req = new Request("http://localhost/api/keys/key-99", {
      method: "DELETE",
    }) as any;
    const res = await DELETE(req, { params: { id: "key-99" } });

    expect(res.status).toBe(403);
    expect(prisma.apiKey.delete).not.toHaveBeenCalled();
  });
});

describe("POST /api/verify-key", () => {
  it("returns subscription info for valid key", async () => {
    (extractBearerToken as jest.Mock).mockReturnValue(null);
    (hashApiKey as jest.Mock).mockReturnValue("hashed_mcpm_testkey1234567890");
    (prisma.apiKey.findUnique as jest.Mock).mockResolvedValue({
      id: "key-1",
      userId: "user-1",
      serverId: "server-1",
      permissions: '["read"]',
      isActive: true,
    });
    (prisma.apiKey.update as jest.Mock).mockResolvedValue({});

    const req = new Request("http://localhost/api/verify-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "mcpm_testkey1234567890" }),
    }) as any;

    const res = await verifyKey(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.valid).toBe(true);
    expect(data.userId).toBe("user-1");
    expect(data.serverId).toBe("server-1");
  });

  it("returns 401 for invalid or revoked key", async () => {
    (extractBearerToken as jest.Mock).mockReturnValue(null);
    (hashApiKey as jest.Mock).mockReturnValue("hashed_badkey");
    (prisma.apiKey.findUnique as jest.Mock).mockResolvedValue(null);

    const req = new Request("http://localhost/api/verify-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "badkey" }),
    }) as any;

    const res = await verifyKey(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Invalid or revoked key");
  });
});
