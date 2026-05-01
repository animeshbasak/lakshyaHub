/**
 * Sentry init for the browser bundle.
 * Loads only when NEXT_PUBLIC_SENTRY_DSN is set — keeps dev quiet.
 */
import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    // 10% of sessions in production; capture every error in dev for triage.
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // No replay/profiling — they balloon bundle size and we have no UX use yet.
    integrations: [],
    // Suppress noisy third-party errors that aren't actionable from our side.
    ignoreErrors: [
      // Browser extension noise
      'top.GLOBALS',
      // ResizeObserver loop limit — Chrome's own bug, not ours
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      // Auth state churn during session refresh
      'NetworkError when attempting to fetch resource.',
    ],
    beforeSend(event) {
      // Strip query params from URLs — they may contain JD text or eval IDs.
      if (event.request?.url) {
        try {
          const u = new URL(event.request.url)
          u.search = ''
          event.request.url = u.toString()
        } catch { /* fall through with original URL */ }
      }
      return event
    },
  })
}
