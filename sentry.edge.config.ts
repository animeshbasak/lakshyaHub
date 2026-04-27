/**
 * Sentry init for the Edge runtime (proxy.ts middleware + edge routes).
 * Edge runtime can't use most Node-native libs, so this config is minimal.
 */
import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  })
}
