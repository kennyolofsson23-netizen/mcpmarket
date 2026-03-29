import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateApiKey } from '@/lib/api-keys';

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id, isActive: true },
  });

  const safeKeys = keys.map(({ keyHash: _keyHash, ...rest }) => rest);

  return NextResponse.json({ keys: safeKeys });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, serverId } = body as { name: string; serverId?: string };

  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const { key: rawKey, keyHash, keyPrefix } = generateApiKey();

  const created = await prisma.apiKey.create({
    data: {
      userId: session.user.id,
      serverId: serverId ?? null,
      name,
      keyHash,
      keyPrefix,
      permissions: '[]',
    },
  });

  return NextResponse.json(
    { key: rawKey, keyPrefix: created.keyPrefix, id: created.id, name: created.name, createdAt: created.createdAt },
    { status: 201 },
  );
}
