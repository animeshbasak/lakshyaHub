export const runtime = 'nodejs'
export const maxDuration = 30

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isQStashConfigured, publishBatch } from '@/lib/qstash/client'

/**
 * User-facing trigger to refresh liveness on stale jobs in the user's
 * pipeline. Picks up to N jobs that have either:
 *   (a) never been checked (liveness_checked_at IS NULL), OR
 *   (b) were checked over `staleDays` days ago.
 *
 * Each pick is enqueued via QStash to /api/qstash/check-liveness, which
 * runs the headless probe. We don't run probes inline here — Chromium needs
 * 200-300 MB and a 5-10s wall clock per call, multiplied by the batch.
 *
 * Without QStash configured this route returns 503 with a hint, since
 * doing N Chromium launches in one Lambda would OOM and be slow regardless.
 */

const Body = z.object({
  limit: z.number().int().min(1).max(30).optional().default(10),
  staleDays: z.number().int().min(1).max(30).optional().default(3),
})

const PER_USER_INTERVAL_MS = 60_000  // 1/min
const lastTriggerByUser = new Map<string, number>()

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 })
  }

  const last = lastTriggerByUser.get(user.id) ?? 0
  const since = Date.now() - last
  if (since < PER_USER_INTERVAL_MS) {
    const retryAfter = Math.ceil((PER_USER_INTERVAL_MS - since) / 1000)
    return NextResponse.json(
      { ok: false, error: 'rate_limited', retryAfter },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  if (!isQStashConfigured()) {
    return NextResponse.json({
      ok: false,
      error: 'qstash_required',
      hint: 'Set QSTASH_TOKEN + QSTASH_CURRENT_SIGNING_KEY + QSTASH_NEXT_SIGNING_KEY in Vercel env. See docs/security/sentry-setup.md style for QStash setup.',
    }, { status: 503 })
  }

  const json = await req.json().catch(() => ({}))
  const parsed = Body.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_input', details: parsed.error.flatten() }, { status: 400 })
  }
  const { limit, staleDays } = parsed.data

  // Find jobs eligible for a probe: either never-checked or older than the
  // staleness threshold. Sort oldest-checked first so we cover the worst
  // first if the limit truncates.
  const cutoff = new Date(Date.now() - staleDays * 24 * 60 * 60 * 1000).toISOString()
  const { data: stale, error } = await supabase
    .from('jobs')
    .select('id, url, liveness_checked_at')
    .eq('user_id', user.id)
    .or(`liveness_checked_at.is.null,liveness_checked_at.lt.${cutoff}`)
    .not('url', 'is', null)
    .order('liveness_checked_at', { ascending: true, nullsFirst: true })
    .limit(limit)

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  const targets = (stale ?? []).filter((r): r is { id: string; url: string; liveness_checked_at: string | null } =>
    typeof r.id === 'string' && typeof r.url === 'string' && r.url.length > 0
  )

  if (targets.length === 0) {
    lastTriggerByUser.set(user.id, Date.now())
    return NextResponse.json({
      ok: true,
      summary: { eligible: 0, enqueued: 0 },
      hint: 'No stale jobs to probe — everything has been checked within the staleness window.',
    })
  }

  const baseUrl = req.nextUrl.origin
  const utcDay = new Date().toISOString().slice(0, 10)

  const summary = await publishBatch(
    targets.map(t => ({
      url: `${baseUrl}/api/qstash/check-liveness`,
      body: { userId: user.id, jobId: t.id, url: t.url },
      // One probe per job per day max; protects against accidental spam.
      idempotencyKey: `liveness:${user.id}:${t.id}:${utcDay}`,
      retries: 2,
      timeoutSeconds: 60,
    }))
  )

  lastTriggerByUser.set(user.id, Date.now())

  return NextResponse.json({
    ok: true,
    summary: {
      eligible: targets.length,
      enqueued: summary.enqueued,
      failed: summary.failed,
    },
    enqueueErrors: summary.errors,
  })
}
