'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import NextError from 'next/error'

/**
 * Root error boundary — catches errors thrown during root-layout render
 * (the rare case where even the layout itself crashes). Reports to Sentry
 * if configured, then renders Next.js's default error page.
 *
 * App-router-specific: a sibling error.tsx file handles errors thrown
 * within /(dashboard) and other route groups.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  )
}
