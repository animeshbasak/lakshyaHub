export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenAI } from '@google/genai'
import { createClient } from '@/lib/supabase/server'
import { runEvaluation, type LLMFn } from '@/lib/careerops/evaluator'

/**
 * Security notes (from 2026-04-25 security audit):
 * - jdText MUST be length-bounded; an unbounded LLM input is a direct cost DoS.
 * - jdText boundary markers must be stripped; `═══` can hijack the prompt-loader
 *   section dividers and override scoring rules.
 *
 * Provider strategy:
 * - groq    (free, fastest)  — DEFAULT. Llama 3.3 70B on Groq's free tier.
 * - gemini  (free)           — Gemini 2.5 Flash. Paid tier required at scale.
 * - claude  (paid / BYOK)    — Sonnet 4.6. Highest quality. BYOK on /pricing.
 */

const MAX_JD_CHARS = 20_000

const BodySchema = z.object({
  jdText: z.string().min(50).max(MAX_JD_CHARS),
  jdUrl: z.string().url().optional(),
  provider: z.enum(['groq', 'gemini', 'claude']).default('groq'),
})

function sanitizeUntrusted(input: string): string {
  // Strip prompt-loader section markers ('═══') and decorative en/em dashes
  // sometimes used as fake section dividers. Earlier version had a buggy
  // regex `/[ --]/g` (a U+0020 to U+002D range) that silently stripped
  // !"#$%()*+,- from JD + CV — fixed 2026-04-25 after code review caught it.
  return input
    .replace(/═{3,}/g, '[redacted-boundary]')
    .replace(/[–—]{3,}/g, '[redacted-boundary]')  // 3+ en/em dashes only
}

class ProviderUnconfiguredError extends Error {
  constructor(public provider: string, public envVar: string) {
    super(`${provider} provider not configured — set ${envVar} in .env.local`)
    this.name = 'ProviderUnconfiguredError'
  }
}

const groqLLM: LLMFn = async (system, user) => {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new ProviderUnconfiguredError('Groq', 'GROQ_API_KEY')

  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 8000,
      temperature: 0.4,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })
  if (!resp.ok) {
    const errText = await resp.text().catch(() => `${resp.status}`)
    throw new Error(`Groq API ${resp.status}: ${errText.slice(0, 200)}`)
  }
  const data = (await resp.json()) as { choices?: Array<{ message?: { content?: string } }> }
  return data.choices?.[0]?.message?.content ?? ''
}

const geminiLLM: LLMFn = async (system, user) => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new ProviderUnconfiguredError('Gemini', 'GEMINI_API_KEY')

  const client = new GoogleGenAI({ apiKey })
  const resp = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: user,
    config: {
      systemInstruction: system,
      temperature: 0.4,
      maxOutputTokens: 8192,
    },
  })
  return resp.text ?? ''
}

const claudeLLM: LLMFn = async (system, user) => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new ProviderUnconfiguredError('Claude', 'ANTHROPIC_API_KEY')

  const client = new Anthropic({ apiKey })
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system,
    messages: [{ role: 'user', content: user }],
  })
  const block = resp.content[0]
  return block.type === 'text' ? block.text : ''
}

type ProviderName = z.infer<typeof BodySchema>['provider']

const PROVIDERS: Record<ProviderName, LLMFn> = {
  groq: groqLLM,
  gemini: geminiLLM,
  claude: claudeLLM,
}

/**
 * Fallback chain per primary choice. If the user picked Groq and Groq fails,
 * try Gemini, then Claude. The route returns the actual provider used so the
 * UI can surface 'served by Gemini (Groq fell back)' if needed.
 */
const FALLBACK_CHAIN: Record<ProviderName, ProviderName[]> = {
  groq:   ['groq',   'gemini', 'claude'],
  gemini: ['gemini', 'groq',   'claude'],
  claude: ['claude', 'groq',   'gemini'],
}

/** Returns true for transient errors that should trigger a retry on the same provider. */
function isTransient(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  const msg = err.message
  // 5xx, timeouts, network resets, Gemini "high demand" 503, Groq rate-limit 429
  return /\b(429|500|502|503|504)\b/.test(msg) ||
         /timeout|ETIMEDOUT|ECONNRESET|UNAVAILABLE|high demand|overloaded/i.test(msg)
}

const TRANSIENT_BACKOFF_MS = [800, 1600]  // two retries with linear-ish backoff

interface ProviderResult {
  text: string
  providerUsed: ProviderName
  fellBack: boolean
}

async function tryWithFallback(
  primary: ProviderName,
  system: string,
  user: string
): Promise<ProviderResult> {
  const chain = FALLBACK_CHAIN[primary]
  let lastError: Error | null = null
  const unconfigured: ProviderUnconfiguredError[] = []

  for (let i = 0; i < chain.length; i++) {
    const name = chain[i]
    const fn = PROVIDERS[name]

    // Try this provider, with retry-on-transient
    for (let attempt = 0; attempt <= TRANSIENT_BACKOFF_MS.length; attempt++) {
      try {
        const text = await fn(system, user)
        if (!text.trim()) throw new Error(`${name}: empty response`)
        return { text, providerUsed: name, fellBack: name !== primary }
      } catch (err) {
        // Skip to next provider immediately if this one isn't configured
        if (err instanceof ProviderUnconfiguredError) {
          unconfigured.push(err)
          break
        }
        lastError = err as Error
        if (attempt < TRANSIENT_BACKOFF_MS.length && isTransient(err)) {
          await new Promise((r) => setTimeout(r, TRANSIENT_BACKOFF_MS[attempt]))
          continue
        }
        // Non-transient error -> break to next provider in chain
        break
      }
    }
  }

  // Every provider failed.
  // If EVERY provider in the chain was unconfigured -> surface the unconfigured
  // signal so UI can prompt the user to set at least one key.
  // (Earlier version only surfaced this when lastError was null, which lost
  // the signal when chain was [groq(unconfigured), gemini(503), claude(unconfigured)].)
  if (unconfigured.length === chain.length) throw unconfigured[0]

  // Mixed failure: some unconfigured + at least one runtime error. Bubble up
  // the runtime error (more diagnostic) but include the unconfigured set in
  // a custom property so the route handler can include it in the response.
  if (lastError && unconfigured.length > 0) {
    ;(lastError as Error & { unconfiguredProviders?: string[] }).unconfiguredProviders =
      unconfigured.map((u) => u.provider)
  }
  throw lastError ?? new Error('all providers failed')
}

export async function POST(req: NextRequest) {
  const parsed = BodySchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 })
  }
  const body = parsed.data

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('resume_profiles')
    .select('full_resume_text, target_titles, skills, target_locations')
    .eq('id', user.id)
    .single()

  if (!profile?.full_resume_text) {
    return NextResponse.json(
      { error: 'complete your profile first — no resume text on file' },
      { status: 400 }
    )
  }

  const titles = (profile.target_titles as string[] | null)?.filter(Boolean) ?? []
  const skills = (profile.skills as string[] | null)?.filter(Boolean) ?? []
  const locations = (profile.target_locations as string[] | null)?.filter(Boolean) ?? []

  const userProfile = [
    titles.length ? `Target roles: ${titles.join(', ')}` : '',
    skills.length ? `Skills: ${skills.join(', ')}` : '',
    locations.length ? `Target locations: ${locations.join(', ')}` : '',
  ].filter(Boolean).join('\n')

  const safeJdText = sanitizeUntrusted(body.jdText)
  const safeCvText = sanitizeUntrusted(profile.full_resume_text as string)

  let report: string
  let summary: ReturnType<typeof JSON.parse>
  let promptVersion: string
  let providerUsed: ProviderName = body.provider
  let fellBack = false
  try {
    // Wrap the provider call with fallback chain so a Gemini 503 / Groq 429
    // doesn't dead-end the user — try the next free provider, then BYOK.
    const llmWithFallback: LLMFn = async (system, user) => {
      const result = await tryWithFallback(body.provider, system, user)
      providerUsed = result.providerUsed
      fellBack = result.fellBack
      return result.text
    }
    const result = await runEvaluation(
      { jdText: safeJdText, cvMarkdown: safeCvText, userProfile },
      { llm: llmWithFallback }
    )
    report = result.report
    summary = result.summary
    promptVersion = result.promptVersion
  } catch (err) {
    if (err instanceof ProviderUnconfiguredError) {
      return NextResponse.json(
        {
          error: err.message,
          code: 'provider_unconfigured',
          provider: err.provider,
          envVar: err.envVar,
          hint: 'Set the missing key in .env.local (or Vercel env vars), then restart the dev server. Or pick a different provider.',
        },
        { status: 424 }  // Failed Dependency — semantically correct for missing config
      )
    }
    const errAny = err as Error & { unconfiguredProviders?: string[] }
    const msg = err instanceof Error ? err.message : 'evaluator failed'
    return NextResponse.json(
      {
        error: msg,
        code: 'all_providers_failed',
        unconfiguredProviders: errAny.unconfiguredProviders,
        hint: errAny.unconfiguredProviders?.length
          ? `Other providers were rate-limited; ${errAny.unconfiguredProviders.join(', ')} not configured. Set their keys for fuller fallback coverage.`
          : 'All providers were unavailable. Try again in a moment, or set ANTHROPIC_API_KEY for paid Claude fallback.',
      },
      { status: 502 }
    )
  }

  if (!report.trim()) {
    return NextResponse.json(
      { error: 'LLM returned empty response', code: 'empty_response' },
      { status: 502 }
    )
  }

  const { data: saved, error } = await supabase.from('evaluations').insert({
    user_id: user.id,
    jd_url: body.jdUrl,
    jd_text: body.jdText,
    company: summary?.company,
    role: summary?.role,
    archetype: summary?.archetype,
    score: summary?.score,
    legitimacy_tier: summary?.legitimacy,
    report_md: report,
    blocks_json: { summary, providerRequested: body.provider, providerUsed, fellBack },
    prompt_version: promptVersion,
    llm_provider: providerUsed,  // record actual provider used, not requested
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    evaluation: saved,
    providerUsed,
    fellBack,
    providerRequested: body.provider,
  })
}
