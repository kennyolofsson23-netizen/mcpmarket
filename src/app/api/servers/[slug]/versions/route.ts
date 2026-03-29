import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = { params: Promise<{ slug: string }> };

async function resolveSlug(context: RouteContext): Promise<string> {
  const params = await context.params;
  return params.slug;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const slug = await resolveSlug(context);
    const server = await prisma.mcpServer.findUnique({ where: { slug } });
    if (!server) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }

    const versions = await prisma.serverVersion.findMany({
      where: { serverId: server.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ versions });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const slug = await resolveSlug(context);
    const server = await prisma.mcpServer.findUnique({ where: { slug } });
    if (!server) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }

    const role = session.user.role ?? 'USER';
    if (server.ownerId !== session.user.id && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { version, changelog, endpointUrl } = body as {
      version: string;
      changelog?: string;
      endpointUrl?: string;
    };

    if (!version) {
      return NextResponse.json({ error: 'version is required' }, { status: 400 });
    }

    await prisma.serverVersion.updateMany({
      where: { serverId: server.id },
      data: { isLatest: false },
    });

    const newVersion = await prisma.serverVersion.create({
      data: {
        serverId: server.id,
        version,
        changelog: changelog ?? null,
        endpointUrl: endpointUrl ?? null,
        isLatest: true,
      },
    });

    return NextResponse.json({ version: newVersion }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
