import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/stats-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RevenueChart = dynamic(() => import("@/components/revenue-chart"), {
  loading: () => <div className="h-[300px] animate-pulse rounded bg-muted" />,
});

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function statusVariant(status: string) {
  switch (status) {
    case "APPROVED":
      return "approved";
    case "PENDING":
      return "pending";
    case "REJECTED":
      return "rejected";
    case "SUSPENDED":
      return "destructive";
    default:
      return "outline";
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ServerAnalyticsPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  const role = session.user.role ?? "USER";
  if (role !== "DEVELOPER" && role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;

  const server = await prisma.mcpServer.findFirst({
    where: { id, ownerId: session.user.id },
    include: {
      _count: { select: { subscriptions: true, reviews: true } },
    },
  });

  if (!server) notFound();

  // Fetch transactions for this server (last 30 days for daily chart)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentTransactions = await prisma.transaction.findMany({
    where: {
      serverId: server.id,
      status: "COMPLETED",
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { amount: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Build daily chart data for last 30 days
  const now = new Date();
  const dailyData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (29 - i));
    const label = d.toISOString().slice(0, 10);
    const revenue = recentTransactions
      .filter((t) => t.createdAt.toISOString().slice(0, 10) === label)
      .reduce((sum, t) => sum + t.amount, 0);
    return { month: label, revenue };
  });

  // Average rating
  const reviewAgg = await prisma.review.aggregate({
    where: { serverId: server.id },
    _avg: { rating: true },
  });
  const avgRating = reviewAgg._avg.rating ?? 0;

  // Check featured status
  const featuredListing = await prisma.featuredListing.findFirst({
    where: {
      serverId: server.id,
      paid: true,
      endDate: { gt: new Date() },
    },
  });
  const isFeatured = !!featuredListing || server.featured;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{server.name}</h1>
            <Badge
              variant={
                statusVariant(server.status) as Parameters<
                  typeof Badge
                >[0]["variant"]
              }
            >
              {server.status}
            </Badge>
            {isFeatured && <Badge variant="featured">Featured</Badge>}
          </div>
          {server.description && (
            <p className="mt-1 line-clamp-2 text-muted-foreground">
              {server.description}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/developer/servers/${server.id}/edit`}>
              Edit Server
            </Link>
          </Button>
          {!isFeatured && (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Link href={`/dashboard/developer/servers/${server.id}/featured`}>
                Get Featured
              </Link>
            </Button>
          )}
          {!server.managedHosting && (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-green-300 text-green-600 hover:bg-green-50"
            >
              <Link href={`/dashboard/developer/servers/${server.id}/hosting`}>
                Set Up Managed Hosting
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatsCard
          title="Subscribers"
          value={server._count.subscriptions.toLocaleString()}
          variant="subscribers"
          description="Active subscriptions"
        />
        <StatsCard
          title="Total Revenue"
          value={formatCents(server.totalRevenue)}
          variant="revenue"
          description="Gross all-time revenue"
        />
        <StatsCard
          title="Total Installs"
          value={server.installCount.toLocaleString()}
          description="Lifetime installs"
        />
        <StatsCard
          title="Avg Rating"
          value={avgRating > 0 ? `${avgRating.toFixed(1)} / 5` : "No ratings"}
          description={`${server._count.reviews} review${server._count.reviews !== 1 ? "s" : ""}`}
        />
      </div>

      {/* Daily analytics chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={dailyData} height={300} />
        </CardContent>
      </Card>
    </div>
  );
}
