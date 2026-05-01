'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Download, Loader2, AlertTriangle } from 'lucide-react'

interface Props {
  evalId: string
  jdText: string | null
  jdUrl: string | null
  reportMd: string | null
  currentProvider: string | null
  candidateName: string | null
}

const PROVIDERS = ['groq', 'gemini', 'claude'] as const
type Provider = typeof PROVIDERS[number]

const LABEL: Record<Provider, string> = {
  groq:   'Groq · llama-3.3-70b · fast',
  gemini: 'Gemini · 2.5 flash · balanced',
  claude: 'Claude · sonnet · highest quality',
}

/**
 * Two actions on an existing eval:
 *   - Re-run with a different provider (e.g. groq report was thin →
 *     try claude). Creates a NEW evaluation row + redirects to it.
 *   - Export the report as markdown (.md) — useful for sharing with
 *     mentors / saving outside the app.
 */
export function EvalActions({ evalId, jdText, jdUrl, reportMd, currentProvider, candidateName }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  const otherProviders = PROVIDERS.filter(p => p !== currentProvider)

  function rerun(provider: Provider) {
    if (!jdText) {
      setError('Original JD text is missing — can\'t re-run this eval.')
      return
    }
    setError(null)
    setPickerOpen(false)
    startTransition(async () => {
      try {
        const res = await fetch('/api/ai/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jdText,
            jdUrl: jdUrl ?? undefined,
            provider,
          }),
        })
        const data = await res.json() as { evaluation?: { id?: string }; error?: string }
        const newId = data.evaluation?.id
        if (!res.ok || !newId) {
          setError(data.error ?? `HTTP ${res.status}`)
          return
        }
        router.push(`/eval/${newId}`)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Network error')
      }
    })
  }

  function exportMarkdown() {
    if (!reportMd) return
    const filename = `${(candidateName || 'eval').replace(/\s+/g, '_').toLowerCase()}-${evalId.slice(0, 8)}.md`
    const blob = new Blob([reportMd], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <section
      aria-label="Eval actions"
      className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        {/* Re-run with different provider */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setPickerOpen(o => !o)}
            disabled={pending || !jdText}
            className="min-h-[40px] px-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-sm text-white hover:border-white/20 disabled:opacity-50"
            aria-haspopup="menu"
            aria-expanded={pickerOpen}
          >
            {pending ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
            )}
            Re-run with another provider
          </button>
          {pickerOpen && !pending && (
            <div
              role="menu"
              className="absolute top-full left-0 mt-1 z-10 min-w-[260px] rounded-lg border border-white/10 bg-black/90 backdrop-blur p-1 shadow-xl"
            >
              {otherProviders.map(p => (
                <button
                  key={p}
                  role="menuitem"
                  type="button"
                  onClick={() => rerun(p)}
                  className="block w-full text-left px-3 py-2 rounded text-sm text-white hover:bg-white/[0.06]"
                >
                  {LABEL[p]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export markdown */}
        <button
          type="button"
          onClick={exportMarkdown}
          disabled={!reportMd}
          className="min-h-[40px] px-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-sm text-white hover:border-white/20 disabled:opacity-50"
          title="Download the full report as markdown"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          Export .md
        </button>
      </div>

      {error && (
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/[0.06] text-red-300 text-xs">
          <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
          {error}
        </div>
      )}

      {pending && (
        <p className="mt-2 text-[11px] text-text-2">
          New eval running — this can take 5–15 seconds depending on the provider…
        </p>
      )}
    </section>
  )
}
