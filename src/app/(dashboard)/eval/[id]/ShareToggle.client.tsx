'use client'

import { useState, useTransition } from 'react'
import { Globe, Lock, Copy, Check } from 'lucide-react'
import { setEvaluationPublic, type AnonLevel } from '@/actions/evaluationActions'

interface Props {
  id: string
  initialIsPublic: boolean
  initialAnonLevel: AnonLevel
}

const ANON_OPTIONS: { value: AnonLevel; label: string; hint: string }[] = [
  { value: 'full_anon',     label: 'Fully anonymous', hint: 'Hide company + role detail' },
  { value: 'company_only',  label: 'Company only',    hint: 'Show company; mask candidate identity' },
  { value: 'user_named',    label: 'Named',           hint: 'Show everything — your call' },
]

export function ShareToggle({ id, initialIsPublic, initialAnonLevel }: Props) {
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [anonLevel, setAnonLevel] = useState<AnonLevel>(initialAnonLevel)
  const [pending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/share/${id}` : `/share/${id}`

  function update(nextPublic: boolean, nextAnon: AnonLevel) {
    setError(null)
    startTransition(async () => {
      const result = await setEvaluationPublic(id, nextPublic, nextAnon)
      if (!result.ok) {
        setError(result.error ?? 'Update failed')
        return
      }
      setIsPublic(result.is_public ?? nextPublic)
      setAnonLevel(nextAnon)
    })
  }

  function copyShareUrl() {
    if (typeof navigator === 'undefined') return
    void navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <section
      aria-label="Share controls"
      className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-6"
    >
      <div className="flex items-start gap-3 mb-4">
        <span className="mt-1 inline-flex w-9 h-9 rounded-lg bg-[color:var(--accent)]/10 border border-[color:var(--accent)]/20 items-center justify-center text-[color:var(--accent)]">
          {isPublic ? <Globe size={16} /> : <Lock size={16} />}
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-white">
            {isPublic ? 'Public — anyone with the link can view' : 'Private — only you can see this'}
          </h2>
          <p className="text-[12px] text-text-2 mt-0.5">
            Public reports get a shareable URL + OG image. Anonymization controls how much identifying info shows.
          </p>
        </div>
        <button
          type="button"
          onClick={() => update(!isPublic, anonLevel)}
          disabled={pending}
          aria-pressed={isPublic}
          className={`shrink-0 inline-flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-colors min-h-[36px] disabled:opacity-50 ${
            isPublic
              ? 'bg-[color:var(--accent)]/15 border border-[color:var(--accent)]/30 text-white'
              : 'bg-white text-[#07070b] hover:bg-white/90'
          }`}
        >
          {pending ? '…' : isPublic ? 'Make private' : 'Make public'}
        </button>
      </div>

      {isPublic && (
        <>
          <fieldset className="space-y-1.5">
            <legend className="text-[11px] uppercase tracking-widest text-text-2 mb-2">Anonymization</legend>
            {ANON_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors min-h-[44px] ${
                  anonLevel === opt.value
                    ? 'border-[color:var(--accent)]/40 bg-[color:var(--accent)]/5'
                    : 'border-white/5 hover:border-white/15'
                }`}
              >
                <input
                  type="radio"
                  name="anon-level"
                  value={opt.value}
                  checked={anonLevel === opt.value}
                  onChange={() => update(true, opt.value)}
                  disabled={pending}
                  className="mt-1 accent-[color:var(--accent)]"
                />
                <span className="flex-1 min-w-0">
                  <span className="block text-xs font-medium text-white">{opt.label}</span>
                  <span className="block text-[11px] text-text-2 mt-0.5">{opt.hint}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2">
            <code className="flex-1 truncate text-[12px] text-white/80 font-mono">{shareUrl}</code>
            <button
              type="button"
              onClick={copyShareUrl}
              className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium border border-white/10 text-white hover:bg-white/5 transition-colors min-h-[32px]"
              aria-label="Copy share URL"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </>
      )}

      {error && (
        <p role="alert" className="mt-3 text-[11px] text-red-400">{error}</p>
      )}
    </section>
  )
}
