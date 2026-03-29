import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

async function getDashboardData(userId: string) {
  const [subscriptions, apiKeys] = await Promise.all([
    prisma.subscription.findMany({
      where: { userId },
      include: { server: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.apiKey.findMany({ where: { userId } }),
  ])
  const activeCount = await prisma.subscription.count({
    where: { userId, status: 'ACTIVE' },
  })
  return { subscriptions, apiKeys, activeCount }
}

const STATUS_VARIANT: Record<string, 'approved' | 'secondary' | 'warning'> = {
  ACTIVE: 'approved',
  CANCELED: 'secondary',
  PAST_DUE: 'warning',
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin?callbackUrl=/dashboard')

  const { subscriptions, apiKeys, activeCount } = await getDashboardData(
    session.user.id,
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Subscriptions</CardDescription>
            <CardTitle className="text-3xl">{activeCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="link" className="px-0">
              <Link href="/dashboard/subscriptions">View all</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>API Keys</CardDescription>
            <CardTitle className="text-3xl">{apiKeys.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="link" className="px-0">
              <Link href="/dashboard/api-keys">Manage keys</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Subscriptions</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/subscriptions">View all</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No subscriptions yet.{' '}
              <Link href="/servers" className="underline hover:text-foreground">
                Browse servers
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {subscriptions.map((sub) => (
                <li key={sub.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/servers/${sub.server.slug}`}
                      className="truncate font-medium hover:underline"
                    >
                      {sub.server.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {sub.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[sub.status] ?? 'secondary'}>
                    {sub.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
