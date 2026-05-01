/**
 * Sentry init for the Node.js runtime (API routes, server actions, RSCs).
 * Loads only when SENTRY_DSN is set.
 */
import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Server-side spans on every fetch + Supabase call — useful for tracking
    // LLM-call latency. Filter out noisy spans below.
    integrations: [],
    // Provider-side rate-limit / retry chatter is noise unless persistent.
    ignoreErrors: [
      'AbortError',
      'ProviderUnconfiguredError',  // user-side config error, surfaced as 424
    ],
    beforeSend(event) {
      // Same query-string scrubber as the client side — prevents JD text from
      // leaking into Sentry breadcrumbs.
      if (event.request?.url) {
        try {
          const u = new URL(event.request.url)
          u.search = ''
          event.request.url = u.toString()
        } catch { /* keep original */ }
      }
      // Drop Authorization / x-api-key headers from breadcrumbs.
      if (event.request?.headers) {
        const h = { ...event.request.headers }
        delete h['authorization']
        delete h['Authorization']
        delete h['x-api-key']
        delete h['cookie']
        event.request.headers = h
      }
      return event
    },
  })
}
