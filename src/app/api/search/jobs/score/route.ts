export const runtime = 'nodejs'
export const maxDuration = 30

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

/**
 * Lightweight fit-score for a single search result. NOT the full A-G evaluator
 * — that's expensive and meant for "I'm seriously considering this role."
 * This is the quick triage signal in the search list:
 *   "is this worth opening?"
 *
 * Uses Groq's llama-3.1-8b-instant (free tier, ~10x cheaper + faster than 70b).
 * Returns { score: 0-100, gaps: [str], strengths: [str] }.
 *
 * Per-user rate-limit: 30/minute (1 every 2 seconds). Generous because
 * users naturally click "Score" on multiple rows back-to-back.
 */

const Body = z.object({
  title: z.string().min(2).max(200),
  company: z.string().max(120).optional(),
  description: z.string().max(8_000).optional(),
})

const RATE_LIMIT_MS = 2_000
const lastByUser = new Map<string, number>()

interface ScoreResult {
  score: number          // 0-100
  gaps: string[]
  strengths: string[]
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 })
  }

  const last = lastByUser.get(user.id) ?? 0
  const since = Date.now() - last
  if (since < RATE_LIMIT_MS) {
    const retryAfter = Math.ceil((RATE_LIMIT_MS - since) / 1000)
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

  // Pull resume signal — RLS-bound. We only need a few summary fields.
  const { data: profile } = await supabase
    .from('resume_profiles')
    .select('full_resume_text, target_titles, skills, target_locations')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.full_resume_text) {
    return NextResponse.json({
      ok: false,
      error: 'no_resume',
      hint: 'Complete your profile to score job fits — /profile',
    }, { status: 412 })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      error: 'provider_unconfigured',
      hint: 'GROQ_API_KEY missing — set in Vercel env',
    }, { status: 424 })
  }

  // Resume context — keep tight, the 8b model handles ~6k tokens before
  // quality drops. We trim resume + JD to fit within ~4k input tokens total.
  const resumeShort = (profile.full_resume_text as string).slice(0, 3_000)
  const targetTitles = (profile.target_titles as string[] | null)?.slice(0, 8).join(', ') || '—'
  const skills = (profile.skills as string[] | null)?.slice(0, 30).join(', ') || '—'

  const jdShort = (parsed.data.description ?? `${parsed.data.title} at ${parsed.data.company ?? '—'}`).slice(0, 3_000)

  const prompt = `You are an ATS-aware resume reviewer. Score how well this candidate fits the job below.

CANDIDATE RESUME (truncated):
${resumeShort}

CANDIDATE TARGET TITLES: ${targetTitles}
CANDIDATE SKILLS: ${skills}

JOB:
Title: ${parsed.data.title}
Company: ${parsed.data.company ?? '—'}
Description: ${jdShort}

Return ONLY a JSON object on a single line, no markdown, no prose:
{"score": <0-100 integer>, "gaps": ["short phrase", "short phrase"], "strengths": ["short phrase", "short phrase"]}

Scoring rubric:
- 80-100 = strong match, candidate would clear the screen
- 60-79  = decent fit; tailor the resume + apply
- 40-59  = stretch; only apply if you really want this company
- 0-39   = bad fit; don't waste the effort
Pick at most 3 gaps and 3 strengths. Each item ≤ 8 words.`

  const start = Date.now()
  const llmRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      max_tokens: 400,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!llmRes.ok) {
    const text = await llmRes.text().catch(() => '')
    return NextResponse.json({
      ok: false,
      error: 'llm_failed',
      status: llmRes.status,
      detail: text.slice(0, 200),
    }, { status: 502 })
  }

  const llmJson = await llmRes.json() as { choices?: Array<{ message?: { content?: string } }> }
  const raw = llmJson.choices?.[0]?.message?.content ?? ''
  const parsedScore = parseScoreJson(raw)
  if (!parsedScore) {
    return NextResponse.json({
      ok: false,
      error: 'unparseable',
      sample: raw.slice(0, 200),
    }, { status: 502 })
  }

  return NextResponse.json({
    ok: true,
    score: parsedScore.score,
    gaps: parsedScore.gaps,
    strengths: parsedScore.strengths,
    durationMs: Date.now() - start,
  })
}

function parseScoreJson(raw: string): ScoreResult | null {
  // Defensive: Groq sometimes wraps JSON in ```json fences despite the
  // `response_format` request. Strip + parse.
  const cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```$/, '').trim()
  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    return null
  }
  if (typeof parsed !== 'object' || parsed === null) return null
  const obj = parsed as { score?: unknown; gaps?: unknown; strengths?: unknown }
  if (typeof obj.score !== 'number') return null
  const score = Math.max(0, Math.min(100, Math.round(obj.score)))
  const gaps = Array.isArray(obj.gaps)
    ? (obj.gaps as unknown[]).filter((s): s is string => typeof s === 'string').slice(0, 3)
    : []
  const strengths = Array.isArray(obj.strengths)
    ? (obj.strengths as unknown[]).filter((s): s is string => typeof s === 'string').slice(0, 3)
    : []
  return { score, gaps, strengths }
}
