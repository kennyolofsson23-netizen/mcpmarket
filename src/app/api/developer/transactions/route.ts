import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'DEVELOPER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const transactions = await prisma.transaction.findMany({
    where: { sellerId: session.user.id },
    include: { server: { select: { name: true, slug: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ transactions });
}
