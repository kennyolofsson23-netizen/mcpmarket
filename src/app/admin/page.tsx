import Link from "next/link";
import { Users, Server, DollarSign, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

async function getAdminStats() {
  const [pendingCount, totalUsers, recentPending, revenueAgg] =
    await Promise.all([
      prisma.mcpServer.count({ where: { status: "PENDING" } }),
      prisma.user.count(),
      prisma.mcpServer.findMany({
        where: { status: "PENDING" },
        take: 10,
        include: { owner: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.transaction.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true, platformFee: true },
      }),
    ]);

  return {
    pendingCount,
    totalUsers,
    recentPending,
    totalRevenue: revenueAgg._sum.amount ?? 0,
    platformFeeEarned: revenueAgg._sum.platformFee ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const {
    pendingCount,
    totalUsers,
    recentPending,
    totalRevenue,
    platformFeeEarned,
  } = await getAdminStats();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-4">
        <StatCard
          icon={<Server className="h-5 w-5 text-amber-600" />}
          label="Pending Servers"
          value={pendingCount}
          variant="amber"
          href="/admin/servers?status=PENDING"
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-blue-600" />}
          label="Total Users"
          value={totalUsers}
          variant="blue"
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
          label="Total Revenue"
          value={`$${(totalRevenue / 100).toFixed(2)}`}
          variant="green"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
          label="Platform Fees"
          value={`$${(platformFeeEarned / 100).toFixed(2)}`}
          variant="purple"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Pending Servers</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/servers?status=PENDING">View all</Link>
          </Button>
        </div>

        {recentPending.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">
            No pending servers. All caught up!
          </p>
        ) : (
          <div className="border rounded-lg divide-y">
            {recentPending.map((server) => (
              <div
                key={server.id}
                className="flex items-center justify-between p-4 gap-4"
              >
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/admin/servers?status=PENDING`}
                    className="font-medium hover:underline truncate block"
                  >
                    {server.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    by {server.owner.name ?? server.owner.email} &middot;{" "}
                    {new Date(server.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="pending">Pending</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  variant: "amber" | "blue" | "green" | "purple";
  href?: string;
}

function StatCard({ icon, label, value, variant, href }: StatCardProps) {
  const bgMap = {
    amber: "bg-amber-50 border-amber-200",
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    purple: "bg-purple-50 border-purple-200",
  };

  const content = (
    <div className={`rounded-lg border p-4 ${bgMap[variant]}`}>
      <div className="flex items-center gap-2 mb-1">{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
