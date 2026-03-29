import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashApiKey, extractBearerToken } from "@/lib/api-keys";

function resolveKey(req: NextRequest, body: { key?: string }): string | null {
  if (body.key) return body.key;
  return extractBearerToken(req.headers.get("Authorization"));
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { key?: string };
  const rawKey = resolveKey(req, body);

  if (!rawKey) {
    return NextResponse.json(
      { error: "Invalid or revoked key" },
      { status: 401 },
    );
  }

  const keyHash = hashApiKey(rawKey);

  const apiKey = await prisma.apiKey.findUnique({ where: { keyHash } });

  if (!apiKey || !apiKey.isActive) {
    return NextResponse.json(
      { error: "Invalid or revoked key" },
      { status: 401 },
    );
  }

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsed: new Date() },
  });

  return NextResponse.json({
    valid: true,
    userId: apiKey.userId,
    serverId: apiKey.serverId,
    permissions: apiKey.permissions,
  });
}
