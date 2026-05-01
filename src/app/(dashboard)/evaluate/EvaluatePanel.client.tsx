'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight } from 'lucide-react'

const MIN_CHARS = 50
const MAX_CHARS = 20_000

type Provider = 'groq' | 'gemini' | 'claude'

interface EvalResponse {
  evaluation?: { id: string }
  error?: string | unknown
  code?: string
  provider?: string
  envVar?: string
  hint?: string
}

const PROVIDER_OPTIONS: { value: Provider; label: string; sub: string }[] = [
  { value: 'groq',   label: 'Groq',   sub: 'Free · fastest · Llama 3.3 70B' },
  { value: 'gemini', label: 'Gemini', sub: 'Free tier · Gemini 2.5 Flash' },
  { value: 'claude', label: 'Claude', sub: 'BYOK · highest quality (paid)' },
]

export function EvaluatePanel() {
  const router = useRouter()
  const [jdText, setJdText] = useState('')
  const [jdUrl, setJdUrl] = useState('')
  const [provider, setProvider] = useState<Provider>('groq')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const len = jdText.length
  const canSubmit = !loading && len >= MIN_CHARS && len <= MAX_CHARS

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/evaluate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jdText, jdUrl: jdUrl || undefined, provider }),
      })
      const data = (await res.json()) as EvalResponse
      if (!res.ok || !data.evaluation?.id) {
        // Friendlier error for the missing-API-key case
        if (data.code === 'provider_unconfigured' && data.envVar) {
          throw new Error(
            `${data.provider ?? 'Provider'} is not configured. Set ${data.envVar} in .env.local. ` +
            `${data.hint ?? ''} Or pick a different provider above.`
          )
        }
        const msg =
          typeof data.error === 'string' ? data.error :
          data.error ? JSON.stringify(data.error) :
          `Request failed (${res.status})`
        throw new Error(msg)
      }
      router.push(`/eval/${data.evaluation.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to evaluate')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="jd-url" className="block text-xs uppercase tracking-widest text-text-2 mb-2">
          Job URL <span className="opacity-50 normal-case">(optional)</span>
        </label>
        <input
          id="jd-url"
          type="url"
          inputMode="url"
          value={jdUrl}
          onChange={(e) => setJdUrl(e.target.value)}
          placeholder="https://job-boards.greenhouse.io/anthropic/jobs/12345"
          className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="jd-text" className="block text-xs uppercase tracking-widest text-text-2 mb-2">
          Job description <span className="opacity-50 normal-case">(paste full posting)</span>
        </label>
        <textarea
          id="jd-text"
          required
          rows={14}
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Senior AI Engineer at Acme. Build LLM observability infrastructure. Requirements: 5+ years experience…"
          className="w-full min-h-[200px] bg-white/[0.02] border border-white/10 rounded-lg px-3 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none leading-relaxed font-mono"
        />
        <div className="mt-1.5 flex justify-between text-[11px] text-text-2">
          <span>
            {len < MIN_CHARS ? `${MIN_CHARS - len} more chars to enable` :
             len > MAX_CHARS ? `${len - MAX_CHARS} chars over limit — trim to ${MAX_CHARS}` :
             'Looks good'}
          </span>
          <span className={len > MAX_CHARS ? 'text-red-400' : ''}>
            {len.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </span>
        </div>
      </div>

      <fieldset>
        <legend className="block text-xs uppercase tracking-widest text-text-2 mb-2">Model</legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PROVIDER_OPTIONS.map((p) => (
            <label
              key={p.value}
              className={`flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors min-h-[60px] ${
                provider === p.value
                  ? 'border-[color:var(--accent)]/40 bg-[color:var(--accent)]/[0.05]'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20'
              }`}
            >
              <input
                type="radio"
                name="provider"
                value={p.value}
                checked={provider === p.value}
                onChange={() => setProvider(p.value)}
                className="sr-only"
              />
              <span className="text-xs font-semibold text-white">{p.label}</span>
              <span className="text-[10px] text-text-2 leading-tight">{p.sub}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {error && (
        <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2.5 text-xs text-red-300">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full inline-flex items-center justify-center gap-2 bg-white text-[#07070b] font-medium px-4 py-3 rounded-lg hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Evaluating ({provider})…
          </>
        ) : (
          <>
            Run A-G evaluation
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <p className="text-[11px] text-text-2 leading-relaxed">
        Each evaluation runs the same 7-block rubric used in career-ops&apos;s 740+ real evals.
        We never auto-submit applications. Score &lt; 4.0/5 → you&apos;ll be advised against applying.
      </p>
    </form>
  )
}
