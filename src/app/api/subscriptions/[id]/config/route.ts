import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const subscription = await prisma.subscription.findUnique({
    where: { id },
    include: { server: true },
  });

  if (!subscription) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
  }

  if (subscription.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { server } = subscription;

  const apiKey = await prisma.apiKey.findFirst({
    where: {
      userId: session.user.id,
      serverId: server.id,
      isActive: true,
    },
  });

  const config = {
    mcpServers: {
      [server.slug]: {
        url: server.endpointUrl,
        apiKey: apiKey ? `${apiKey.keyPrefix}...` : null,
      },
    },
  };

  return NextResponse.json({ config });
}
