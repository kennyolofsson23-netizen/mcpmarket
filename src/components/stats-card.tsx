import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  icon?: React.ReactNode
  description?: string
  variant?: 'default' | 'revenue' | 'subscribers'
}

export function StatsCard({
  title,
  value,
  change,
  icon,
  description,
  variant = 'default',
}: StatsCardProps) {
  const isPositiveChange = change && (change.startsWith('+') || (!change.startsWith('-') && !change.startsWith('0')))
  const isNegativeChange = change && change.startsWith('-')

  return (
    <Card
      className={cn(
        variant === 'revenue' && 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20',
        variant === 'subscribers' && 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20',
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon && (
            <div className="text-muted-foreground">{icon}</div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {change && (
          <p
            className={cn(
              'mt-1 text-xs font-medium',
              isPositiveChange && 'text-green-600 dark:text-green-400',
              isNegativeChange && 'text-red-600 dark:text-red-400',
              !isPositiveChange && !isNegativeChange && 'text-muted-foreground',
            )}
          >
            {change}
          </p>
        )}
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
