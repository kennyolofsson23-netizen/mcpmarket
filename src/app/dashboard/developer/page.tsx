import { redirect } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { StatsCard } from '@/components/stats-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DeveloperStats } from '@/types'

const RevenueChart = dynamic(
  () => import('@/components/revenue-chart'),
  { loading: () => <div className="h-[300px] animate-pulse rounded bg-muted" /> },
)

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

function statusVariant(status: string) {
  switch (status) {
    case 'APPROVED': return 'approved'
    case 'PENDING': return 'pending'
    case 'REJECTED': return 'rejected'
    case 'SUSPENDED': return 'destructive'
    default: return 'outline'
  }
}

async function getDeveloperStats(userId: string): Promise<DeveloperStats> {
  const servers = await prisma.mcpServer.findMany({
    where: { ownerId: userId },
    include: { _count: { select: { subscriptions: true } } },
  })

  const serverIds = servers.map((s) => s.id)

  const allTransactions = await prisma.transaction.findMany({
    where: { serverId: { in: serverIds }, status: 'COMPLETED' },
    select: { amount: true, createdAt: true },
  })

  const totalRevenue = allTransactions.reduce((sum, t) => sum + t.amount, 0)
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthlyRevenue = allTransactions
    .filter((t) => t.createdAt.toISOString().slice(0, 7) === currentMonth)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalSubscribers = servers.reduce((sum, s) => sum + s._count.subscriptions, 0)
  const totalInstalls = servers.reduce((sum, s) => sum + s.installCount, 0)

  const now = new Date()
  const revenueChart = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
    const label = d.toISOString().slice(0, 7)
    const revenue = allTransactions
      .filter((t) => t.createdAt.toISOString().slice(0, 7) === label)
      .reduce((sum, t) => sum + t.amount, 0)
    return { month: label, revenue }
  })

  const serverStats = servers.map((s) => ({
    id: s.id,
    name: s.name,
    subscribers: s._count.subscriptions,
    revenue: s.totalRevenue,
    status: s.status,
  }))

  return {
    totalSubscribers,
    totalRevenue,
    monthlyRevenue,
    totalInstalls,
    servers: serverStats,
    revenueChart,
  }
}

export default async function DeveloperDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')
  const role = session.user.role ?? 'USER'
  if (role !== 'DEVELOPER' && role !== 'ADMIN') redirect('/dashboard')

  const stats = await getDeveloperStats(session.user.id)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Developer Dashboard</h1>
        <Button asChild>
          <Link href="/dashboard/developer/servers/new">List New Server</Link>
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Subscribers"
          value={stats.totalSubscribers.toLocaleString()}
          variant="subscribers"
          description="Active across all servers"
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatCents(stats.monthlyRevenue)}
          variant="revenue"
          description="Current month (your 80%)"
        />
        <StatsCard
          title="All-Time Revenue"
          value={formatCents(stats.totalRevenue)}
          variant="revenue"
          description="Total gross revenue"
        />
        <StatsCard
          title="Total Installs"
          value={stats.totalInstalls.toLocaleString()}
          description="Lifetime installs"
        />
      </div>

      {/* Revenue chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue (Last 12 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={stats.revenueChart} height={300} />
        </CardContent>
      </Card>

      {/* Server list */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Your Servers</h2>
        {stats.servers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p className="mb-4">You have not listed any servers yet.</p>
              <Button asChild>
                <Link href="/dashboard/developer/servers/new">List Your First Server</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {stats.servers.map((server) => (
              <Card key={server.id} className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{server.name}</span>
                        <Badge variant={statusVariant(server.status) as Parameters<typeof Badge>[0]['variant']}>
                          {server.status}
                        </Badge>
                      </div>
                      <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
                        <span>{server.subscribers} subscribers</span>
                        <span>{formatCents(server.revenue)} revenue</span>
                      </div>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/developer/servers/${server.id}`}>View Analytics</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
