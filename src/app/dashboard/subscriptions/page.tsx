import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import type { SubscriptionWithServer } from '@/types'
import { SubscriptionCard } from '@/components/subscription-card'
import { EmptyState } from '@/components/empty-state'

async function getUserSubscriptions(userId: string): Promise<SubscriptionWithServer[]> {
  return prisma.subscription.findMany({
    where: { userId },
    include: { server: true },
    orderBy: { createdAt: 'desc' },
  })
}

function SubscriptionGroup({
  title,
  subscriptions,
}: {
  title: string
  subscriptions: SubscriptionWithServer[]
}) {
  if (subscriptions.length === 0) return null
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {subscriptions.map((sub) => (
          <SubscriptionCard key={sub.id} subscription={sub} />
        ))}
      </div>
    </section>
  )
}

export default async function SubscriptionsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin?callbackUrl=/dashboard/subscriptions')

  const subscriptions = await getUserSubscriptions(session.user.id)

  const active = subscriptions.filter((s) => s.status === 'ACTIVE')
  const past = subscriptions.filter((s) => s.status !== 'ACTIVE')

  if (subscriptions.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Subscriptions</h1>
        <EmptyState
          title="No subscriptions yet"
          description="Browse the marketplace and subscribe to an MCP server to get started."
          action={{ label: 'Browse Servers', href: '/servers' }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Subscriptions</h1>
      <SubscriptionGroup title="Active" subscriptions={active} />
      <SubscriptionGroup title="Past / Canceled" subscriptions={past} />
    </div>
  )
}
