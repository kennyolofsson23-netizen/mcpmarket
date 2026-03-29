import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/api-keys';
import { recordApiCall } from '@/lib/metering';
import { prisma } from '@/lib/prisma';

async function isFreeLimitExceeded(userId: string, serverId: string, freeCallLimit: number) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const count = await prisma.usageRecord.count({
    where: { userId, serverId, createdAt: { gte: startOfMonth } },
  });
  return count >= freeCallLimit;
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const apiKey = extractBearerToken(authHeader);
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing or invalid API key' }, { status: 401 });
    }

    const body = await req.json();
    const { serverId, endpoint, statusCode } = body as {
      serverId: string;
      endpoint: string;
      statusCode: number;
    };

    let result: Awaited<ReturnType<typeof recordApiCall>>;
    try {
      result = await recordApiCall({ apiKey, serverId, endpoint, statusCode });
    } catch {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const { key, server } = result;
    if (
      server &&
      server.freeCallLimit &&
      server.freeCallLimit > 0 &&
      server.pricingModel === 'USAGE_BASED'
    ) {
      const exceeded = await isFreeLimitExceeded(key.userId, serverId, server.freeCallLimit);
      if (exceeded) {
        return NextResponse.json({ error: 'Free tier limit exceeded' }, { status: 429 });
      }
    }

    return NextResponse.json({ recorded: true });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
