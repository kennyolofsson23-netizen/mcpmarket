import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
      pendingServers,
      totalUsers,
      totalServers,
      activeSubscriptions,
      revenueAgg,
      feeAgg,
    ] = await Promise.all([
      prisma.mcpServer.count({ where: { status: "PENDING" } }),
      prisma.user.count(),
      prisma.mcpServer.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: "COMPLETED" },
      }),
      prisma.transaction.aggregate({
        _sum: { platformFee: true },
        where: { status: "COMPLETED" },
      }),
    ]);

    return NextResponse.json({
      pendingServers,
      totalUsers,
      totalServers,
      activeSubscriptions,
      totalRevenue: revenueAgg._sum.amount ?? 0,
      platformFeeEarned: Math.floor(feeAgg._sum.platformFee ?? 0),
    });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
