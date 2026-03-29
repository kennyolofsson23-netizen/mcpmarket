import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateWebhookSecret } from '@/lib/webhooks';

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const webhooks = await prisma.developerWebhook.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        url: true,
        events: true,
        isActive: true,
        description: true,
        secretPrefix: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ webhooks });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role ?? 'USER';
    if (role !== 'DEVELOPER' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { url, events, description } = body as {
      url: string;
      events: string[];
      description?: string;
    };

    if (!url || !url.startsWith('https://')) {
      return NextResponse.json({ error: 'URL must use HTTPS' }, { status: 400 });
    }

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: 'events array is required' }, { status: 400 });
    }

    const { secret, secretHash, secretPrefix } = generateWebhookSecret();

    const webhook = await prisma.developerWebhook.create({
      data: {
        userId: session.user.id,
        url,
        events: JSON.stringify(events),
        secretHash,
        secretPrefix,
        isActive: true,
        description: description ?? null,
      },
    });

    return NextResponse.json({ webhook, secret }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
