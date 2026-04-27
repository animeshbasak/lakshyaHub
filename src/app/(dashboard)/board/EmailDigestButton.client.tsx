'use client'

import { useState } from 'react'
import { Mail, Loader2, Check, AlertTriangle } from 'lucide-react'

type State =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent'; dueNow: number; later: number }
  | { kind: 'no_due' }
  | { kind: 'rate_limited'; retryAfter: number }
  | { kind: 'not_configured' }
  | { kind: 'error'; message: string }

/**
 * "Email me my follow-ups" — calls /api/scan/cadence-digest, which uses
 * Resend to send a single email to the authenticated user with their
 * dueNow + later cadence buckets.
 *
 * Inert until the user adds RESEND_API_KEY to env. Returns a friendly
 * state in that case so the user can self-diagnose.
 */
export function EmailDigestButton() {
  const [state, setState] = useState<State>({ kind: 'idle' })

  async function trigger() {
    setState({ kind: 'sending' })
    try {
      const res = await fetch('/api/scan/cadence-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      const data = await res.json()
      if (data.ok && data.sent) {
        setState({ kind: 'sent', dueNow: data.dueNowCount ?? 0, later: data.laterCount ?? 0 })
        return
      }
      if (data.ok && !data.sent && data.reason === 'no_followups_due') {
        setState({ kind: 'no_due' })
        return
      }
      if (res.status === 429) {
        setState({ kind: 'rate_limited', retryAfter: data.retryAfter ?? 60 })
        return
      }
      if (data.error === 'email_not_configured') {
        setState({ kind: 'not_configured' })
        return
      }
      setState({ kind: 'error', message: data.error ?? `HTTP ${res.status}` })
    } catch (e) {
      setState({ kind: 'error', message: e instanceof Error ? e.message : 'Network error' })
    }
  }

  if (state.kind === 'sent') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
        <Check className="w-3.5 h-3.5" aria-hidden="true" />
        Sent — {state.dueNow} due, {state.later} on track
      </span>
    )
  }

  if (state.kind === 'no_due') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-text-2">
        <Check className="w-3.5 h-3.5" aria-hidden="true" />
        Nothing due — clear inbox
      </span>
    )
  }

  if (state.kind === 'rate_limited') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-amber-400">
        Try again in {state.retryAfter}s
      </span>
    )
  }

  if (state.kind === 'not_configured') {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-xs text-text-2"
        title="Set RESEND_API_KEY + RESEND_FROM_ADDRESS in Vercel env"
      >
        <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
        Email not configured
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={trigger}
      disabled={state.kind === 'sending'}
      className="min-h-[36px] px-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-xs text-text-2 hover:text-white hover:border-white/20 disabled:opacity-60"
      title="Get a single email with all your overdue + due-today follow-ups"
    >
      {state.kind === 'sending' ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
      ) : (
        <Mail className="w-3.5 h-3.5" aria-hidden="true" />
      )}
      {state.kind === 'sending' ? 'Sending…' : 'Email me follow-ups'}
      {state.kind === 'error' && (
        <span className="text-red-400 ml-1">· {state.message}</span>
      )}
    </button>
  )
}
