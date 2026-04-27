export const runtime = 'nodejs'
export const maxDuration = 30

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { aggregate } from '@/lib/jobsearch/aggregator'

const Body = z.object({
  query: z.string().min(2).max(200),
  region: z.enum(['IN', 'GLOBAL', 'REMOTE']).default('GLOBAL'),
  limitPerAdapter: z.number().int().min(5).max(60).optional().default(30),
})

// Per-user rate limit — 1 search every 4s. Same in-memory pattern used by
// /api/scan/ats and /api/ai/evaluate; replace with Upstash later.
const RATE_LIMIT_MS = 4_000
const lastByUser = new Map<string, number>()

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 })
  }

  const last = lastByUser.get(user.id) ?? 0
  const sinceMs = Date.now() - last
  if (sinceMs < RATE_LIMIT_MS) {
    const retryAfter = Math.ceil((RATE_LIMIT_MS - sinceMs) / 1000)
    return NextResponse.json(
      { ok: false, error: 'rate_limited', retryAfter },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }
  lastByUser.set(user.id, Date.now())

  const json = await req.json().catch(() => ({}))
  const parsed = Body.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_input', details: parsed.error.flatten() }, { status: 400 })
  }

  const start = Date.now()
  const result = await aggregate(parsed.data)

  // Audit trail (fire-and-forget). Doesn't write the results — too much
  // payload — just summary stats.
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { createClient: createSb } = await import('@supabase/supabase-js')
    const admin = createSb(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    admin.from('audit_events').insert({
      user_id: user.id,
      action: 'jobs_search',
      resource_type: 'search',
      metadata: {
        query: parsed.data.query,
        region: parsed.data.region,
        adapters: result.byAdapter.map(r => ({ name: r.adapter, count: r.jobs.length, ms: r.durationMs, error: r.error })),
        totalDeduped: result.totalDeduped,
      },
    }).then(() => {}, () => {})
  }

  return NextResponse.json({
    ok: true,
    summary: {
      totalRaw: result.totalRaw,
      totalDeduped: result.totalDeduped,
      durationMs: result.durationMs,
      adapters: result.byAdapter.map(r => ({
        name: r.adapter,
        count: r.jobs.length,
        durationMs: r.durationMs,
        error: r.error ?? null,
      })),
    },
    jobs: result.jobs.slice(0, 100),
    elapsedMs: Date.now() - start,
  })
}
