import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function buildDailySlots() {
  const slots: Array<{ date: string; installs: number; revenue: number }> = [];
  const now = new Date();
  const todayUtc = now.toISOString().slice(0, 10);
  const todayMs = Date.UTC(
    parseInt(todayUtc.slice(0, 4)),
    parseInt(todayUtc.slice(5, 7)) - 1,
    parseInt(todayUtc.slice(8, 10)),
  );
  for (let i = 29; i >= 0; i--) {
    const d = new Date(todayMs - i * 86400000);
    slots.push({ date: d.toISOString().slice(0, 10), installs: 0, revenue: 0 });
  }
  return slots;
}

function mergeDailyData(
  slots: Array<{ date: string; installs: number; revenue: number }>,
  usageRecords: { createdAt: Date }[],
  transactions: { amount: number; createdAt: Date }[],
) {
  for (const record of usageRecords) {
    const date = record.createdAt.toISOString().slice(0, 10);
    const slot = slots.find((s) => s.date === date);
    if (slot) slot.installs += 1;
  }
  for (const tx of transactions) {
    const date = tx.createdAt.toISOString().slice(0, 10);
    const slot = slots.find((s) => s.date === date);
    if (slot) slot.revenue += tx.amount;
  }
  return slots;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const server = await prisma.mcpServer.findUnique({ where: { id } });
  if (!server) {
    return NextResponse.json({ error: 'Server not found' }, { status: 404 });
  }

  if (server.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const usageRecords = await prisma.usageRecord.findMany({
    where: { serverId: id, createdAt: { gte: since } },
    select: { createdAt: true },
  });

  const transactions = await prisma.transaction.findMany({
    where: { serverId: id, status: 'COMPLETED', createdAt: { gte: since } },
    select: { amount: true, createdAt: true },
  });

  const slots = buildDailySlots();
  const daily = mergeDailyData(slots, usageRecords, transactions);

  return NextResponse.json({ daily });
}
