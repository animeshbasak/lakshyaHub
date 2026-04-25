'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight } from 'lucide-react'

const MIN_CHARS = 50
const MAX_CHARS = 20_000

type Provider = 'claude' | 'gemini'

interface EvalResponse {
  evaluation?: { id: string }
  error?: unknown
}

export function EvaluatePanel() {
  const router = useRouter()
  const [jdText, setJdText] = useState('')
  const [jdUrl, setJdUrl] = useState('')
  const [provider, setProvider] = useState<Provider>('claude')
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

      <div>
        <span className="block text-xs uppercase tracking-widest text-text-2 mb-2">Model</span>
        <div className="inline-flex rounded-lg border border-white/10 p-0.5 bg-white/[0.02]">
          {(['claude', 'gemini'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setProvider(p)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors min-h-[36px] ${
                provider === p ? 'bg-white text-[#07070b] font-medium' : 'text-white/70 hover:text-white'
              }`}
            >
              {p === 'claude' ? 'Claude (recommended)' : 'Gemini (fast, free tier)'}
            </button>
          ))}
        </div>
      </div>

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
