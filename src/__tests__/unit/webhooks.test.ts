// F017: Webhook Notifications
jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    developerWebhook: { findMany: jest.fn(), create: jest.fn() },
    webhookLog: { findMany: jest.fn() },
  },
}));
jest.mock("@/lib/webhooks", () => ({
  deliverWebhook: jest.fn(),
  generateWebhookSecret: jest.fn().mockReturnValue({
    secret: "whsec_testsecret",
    secretHash: "hashed_secret",
    secretPrefix: "whsec_te",
  }),
}));

import { GET, POST } from "@/app/api/developer/webhooks/route";
import { GET as webhookLogs } from "@/app/api/developer/webhooks/logs/route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateWebhookSecret } from "@/lib/webhooks";

const mockAuth = auth as jest.MockedFunction<typeof auth>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/developer/webhooks", () => {
  it("creates webhook for developer", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "dev-1", role: "DEVELOPER" },
    } as any);

    const mockWebhook = {
      id: "wh-1",
      userId: "dev-1",
      url: "https://example.com/webhook",
      events: '["subscription.created"]',
      secretHash: "hashed_secret",
      secretPrefix: "whsec_te",
      isActive: true,
      description: null,
    };
    (prisma.developerWebhook.create as jest.Mock).mockResolvedValue(
      mockWebhook,
    );

    const req = new Request("http://localhost/api/developer/webhooks", {
      method: "POST",
      body: JSON.stringify({
        url: "https://example.com/webhook",
        events: ["subscription.created"],
      }),
    }) as any;

    const res = await POST(req);

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.webhook).toBeDefined();
    expect(data.secret).toBe("whsec_testsecret");
    expect(generateWebhookSecret).toHaveBeenCalled();
  });

  it("validates URL is HTTPS", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "dev-1", role: "DEVELOPER" },
    } as any);

    const req = new Request("http://localhost/api/developer/webhooks", {
      method: "POST",
      body: JSON.stringify({
        url: "http://example.com/webhook",
        events: ["subscription.created"],
      }),
    }) as any;

    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("HTTPS");
  });
});

describe("GET /api/developer/webhooks/logs", () => {
  it("returns webhook delivery logs", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "dev-1", role: "DEVELOPER" },
    } as any);

    (prisma.developerWebhook.findMany as jest.Mock).mockResolvedValue([
      { id: "wh-1" },
    ]);
    (prisma.webhookLog.findMany as jest.Mock).mockResolvedValue([
      {
        id: "log-1",
        webhookId: "wh-1",
        event: "subscription.created",
        success: true,
        statusCode: 200,
        createdAt: new Date().toISOString(),
      },
    ]);

    const req = new Request(
      "http://localhost/api/developer/webhooks/logs",
    ) as any;
    const res = await webhookLogs(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.logs).toHaveLength(1);
    expect(data.logs[0].event).toBe("subscription.created");
  });
});
