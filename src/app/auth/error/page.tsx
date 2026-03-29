'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const ERROR_DESCRIPTIONS: Record<string, { title: string; message: string }> =
  {
    Configuration: {
      title: 'Server Configuration Error',
      message:
        'There is a problem with the server configuration. Please contact support.',
    },
    AccessDenied: {
      title: 'Access Denied',
      message:
        'You do not have permission to sign in. Your account may have been suspended.',
    },
    Verification: {
      title: 'Verification Failed',
      message:
        'The sign-in link is no longer valid. It may have been used already or it may have expired.',
    },
    Default: {
      title: 'Authentication Error',
      message:
        'An unexpected error occurred during authentication. Please try again.',
    },
  }

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') ?? 'Default'
  const info = ERROR_DESCRIPTIONS[error] ?? ERROR_DESCRIPTIONS.Default

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Authentication Error</h1>
          <p className="mt-1 text-sm font-medium text-destructive">
            {info.title}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            {info.message}
          </p>
          {error !== 'Default' && (
            <div className="rounded-md bg-muted px-4 py-2 text-center text-xs text-muted-foreground">
              Error code: <span className="font-mono">{error}</span>
            </div>
          )}
          <Button asChild className="w-full">
            <Link href="/auth/signin">Back to Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  )
}
