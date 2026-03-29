import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { StripeConnectBanner } from '@/components/stripe-connect-banner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function transactionStatusVariant(status: string) {
  switch (status) {
    case 'COMPLETED': return 'approved'
    case 'PENDING': return 'pending'
    case 'REFUNDED': return 'destructive'
    default: return 'outline'
  }
}

export default async function PayoutsPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')
  const role = session.user.role ?? 'USER'
  if (role !== 'DEVELOPER' && role !== 'ADMIN') redirect('/dashboard')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { connectOnboarded: true, stripeConnectId: true },
  })

  const isOnboarded = user?.connectOnboarded ?? false

  let transactions: Array<{
    id: string
    createdAt: Date
    amount: number
    platformFee: number
    developerPayout: number
    status: string
    server: { name: string; slug: string }
  }> = []

  if (isOnboarded) {
    transactions = await prisma.transaction.findMany({
      where: { sellerId: session.user.id },
      include: { server: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>

      {!isOnboarded ? (
        <StripeConnectBanner />
      ) : (
        <div className="space-y-6">
          {/* Summary totals */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Gross</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCents(transactions.reduce((s, t) => s + t.amount, 0))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Platform Fees (20%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCents(transactions.reduce((s, t) => s + t.platformFee, 0))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Your Net Payout (80%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCents(transactions.reduce((s, t) => s + t.developerPayout, 0))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions table */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {transactions.length === 0 ? (
                <div className="px-6 py-12 text-center text-muted-foreground">
                  No transactions yet. Once users subscribe to your servers, transactions will appear here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                        <th className="px-4 py-3 text-left font-medium">Date</th>
                        <th className="px-4 py-3 text-left font-medium">Server</th>
                        <th className="px-4 py-3 text-right font-medium">Gross</th>
                        <th className="px-4 py-3 text-right font-medium">Platform Fee (20%)</th>
                        <th className="px-4 py-3 text-right font-medium">Net Payout (80%)</th>
                        <th className="px-4 py-3 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx, idx) => (
                        <tr
                          key={tx.id}
                          className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                        >
                          <td className="px-4 py-3 text-muted-foreground">{formatDate(tx.createdAt)}</td>
                          <td className="px-4 py-3 font-medium">{tx.server.name}</td>
                          <td className="px-4 py-3 text-right">{formatCents(tx.amount)}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            -{formatCents(tx.platformFee)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400">
                            {formatCents(tx.developerPayout)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={transactionStatusVariant(tx.status) as Parameters<typeof Badge>[0]['variant']}>
                              {tx.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
