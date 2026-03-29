import { prisma } from "@/lib/prisma";
import { hashApiKey } from "@/lib/api-keys";

export async function recordApiCall(opts: {
  apiKey: string;
  serverId: string;
  endpoint: string;
  statusCode: number;
}) {
  const keyHash = hashApiKey(opts.apiKey);
  const key = await prisma.apiKey.findUnique({
    where: { keyHash, isActive: true },
  });
  if (!key) throw new Error("Invalid API key");

  await prisma.usageRecord.create({
    data: {
      apiKeyId: key.id,
      serverId: opts.serverId,
      userId: key.userId,
      endpoint: opts.endpoint,
      statusCode: opts.statusCode,
    },
  });

  const server = opts.serverId
    ? await prisma.mcpServer.findUnique({ where: { id: opts.serverId } })
    : null;

  return { key, server };
}

export async function getUsageSummary(userId: string, serverId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const count = await prisma.usageRecord.count({
    where: { userId, serverId, createdAt: { gte: startOfMonth } },
  });

  return { callsThisMonth: count, periodStart: startOfMonth, periodEnd: now };
}
