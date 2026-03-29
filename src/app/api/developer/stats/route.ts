import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function buildRevenueChart(transactions: { amount: number; createdAt: Date }[]) {
  const now = new Date();
  const months: Array<{ month: string; revenue: number }> = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toISOString().slice(0, 7);
    const revenue = transactions
      .filter((t) => t.createdAt.toISOString().slice(0, 7) === label)
      .reduce((sum, t) => sum + t.amount, 0);
    months.push({ month: label, revenue });
  }

  return months;
}

function getCurrentMonthRevenue(transactions: { amount: number; createdAt: Date }[]) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  return transactions
    .filter((t) => t.createdAt.toISOString().slice(0, 7) === currentMonth)
    .reduce((sum, t) => sum + t.amount, 0);
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'DEVELOPER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const servers = await prisma.mcpServer.findMany({
    where: { ownerId: session.user.id },
    include: { _count: { select: { subscriptions: true } } },
  });

  const serverIds = servers.map((s) => s.id);

  const revenueAgg = await prisma.transaction.aggregate({
    where: { serverId: { in: serverIds }, status: 'COMPLETED' },
    _sum: { amount: true },
  });

  const allTransactions = await prisma.transaction.findMany({
    where: { serverId: { in: serverIds }, status: 'COMPLETED' },
    select: { amount: true, createdAt: true },
  });

  const totalRevenue = revenueAgg._sum.amount ?? 0;
  const monthlyRevenue = getCurrentMonthRevenue(allTransactions);
  const totalSubscribers = servers.reduce((sum, s) => sum + s._count.subscriptions, 0);
  const totalInstalls = servers.reduce((sum, s) => sum + s.installCount, 0);

  const serverStats = servers.map((s) => ({
    id: s.id,
    name: s.name,
    subscribers: s._count.subscriptions,
    revenue: s.totalRevenue,
    status: s.status,
  }));

  const revenueChart = buildRevenueChart(allTransactions);

  return NextResponse.json({
    totalSubscribers,
    totalRevenue,
    monthlyRevenue,
    totalInstalls,
    servers: serverStats,
    revenueChart,
  });
}
