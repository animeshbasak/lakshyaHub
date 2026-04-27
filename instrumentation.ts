/**
 * Next.js 16 instrumentation hook — runtime-aware Sentry init.
 *
 * register() is called once per server runtime (Node.js + Edge). We import
 * the matching config side-effect-only so Sentry attaches to the right
 * runtime context. The `if (dsn)` gate inside each config keeps dev quiet
 * when the env var is unset.
 *
 * onRequestError() captures errors thrown during render/route execution
 * that don't bubble to a try/catch — e.g. RSC streaming errors.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

// Re-export Sentry's onRequestError so Next.js picks it up. Direct re-export
// avoids the self-referencing-type problem and keeps the runtime gate
// (DSN-unset → no-op) handled by Sentry's own init guard.
import type * as Sentry from '@sentry/nextjs'
export const onRequestError: typeof Sentry.captureRequestError = async (...args) => {
  if (!process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN) return
  const SentryNs = await import('@sentry/nextjs')
  return SentryNs.captureRequestError(...args)
}
