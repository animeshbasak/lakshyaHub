'use client'

import { useState, useRef } from 'react'
import { Wand2, Loader2, Undo2 } from 'lucide-react'
import type { ResumeData } from '@/types'

interface Props {
  experience: ResumeData['experience']
  rewriteBullet: (jobId: string, bulletId: string, text: string) => void
  setBulletImproving: (jobId: string, bulletId: string, improving: boolean) => void
  /** Optional pre-fill — passed from /resume?jd_id=… or eval-context handoff. */
  initialJd?: string
}

const CONCURRENCY = 3
const MAX_JD_LEN = 12_000

/**
 * Pastes a JD, then ATS-tailors every experience bullet against it in one
 * pass. Hits the existing /api/ai/bullet-rewrite endpoint with `jobContext`
 * set to the JD — the route + prompt already know how to use it.
 *
 * Each rewrite preserves the original via store.rewriteBullet's built-in
 * originalText snapshot — user can revert per-bullet via the existing
 * BulletRow undo button.
 */
export function TailorToJdSection({
  experience,
  rewriteBullet,
  setBulletImproving,
  initialJd = '',
}: Props) {
  const [jdText, setJdText] = useState(initialJd)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<{ rewritten: number; skipped: number; failed: number } | null>(null)
  const abortRef = useRef(false)

  const allBullets = experience.flatMap(job =>
    job.bullets.map(b => ({ jobId: job.id, bulletId: b.id, text: b.text }))
  )
  const total = allBullets.length

  async function rewriteOne(b: { jobId: string; bulletId: string; text: string }, jd: string): Promise<'rewritten' | 'skipped' | 'failed'> {
    if (!b.text.trim()) return 'skipped'
    setBulletImproving(b.jobId, b.bulletId, true)
    try {
      const res = await fetch('/api/ai/bullet-rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulletText: b.text, jobContext: jd, mode: 'improve' }),
      })
      const data = (await res.json()) as { success: boolean; improved?: unknown; error?: string }
      if (data.success && typeof data.improved === 'string' && data.improved.trim()) {
        rewriteBullet(b.jobId, b.bulletId, data.improved.trim())
        return 'rewritten'
      }
      return 'failed'
    } catch {
      return 'failed'
    } finally {
      setBulletImproving(b.jobId, b.bulletId, false)
    }
  }

  async function handleRun() {
    const jd = jdText.trim()
    if (!jd) {
      setError('Paste a job description first.')
      return
    }
    if (jd.length > MAX_JD_LEN) {
      setError(`JD too long (${jd.length.toLocaleString()} chars; max ${MAX_JD_LEN.toLocaleString()}).`)
      return
    }
    if (total === 0) {
      setError('No experience bullets to tailor. Add at least one role first.')
      return
    }
    if (running) return

    abortRef.current = false
    setRunning(true)
    setError(null)
    setSummary(null)
    setProgress({ done: 0, total })

    let rewritten = 0, skipped = 0, failed = 0
    let done = 0

    // Concurrency-limited queue. Per-bullet errors do not abort the batch.
    let cursor = 0
    async function worker() {
      while (true) {
        if (abortRef.current) return
        const idx = cursor++
        if (idx >= allBullets.length) return
        const result = await rewriteOne(allBullets[idx], jd)
        if (result === 'rewritten') rewritten++
        else if (result === 'skipped') skipped++
        else failed++
        done++
        setProgress({ done, total })
      }
    }
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, total) }, worker))

    setRunning(false)
    setSummary({ rewritten, skipped, failed })
  }

  function handleStop() {
    abortRef.current = true
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-text-2 leading-relaxed">
        Paste a JD. We rewrite every experience bullet with that JD as ATS context — keeping all real numbers + tool names, swapping verbs to match the role&apos;s priorities. Original text is preserved per-bullet for one-click revert.
      </p>

      <textarea
        value={jdText}
        onChange={e => setJdText(e.target.value)}
        placeholder="Paste the full JD…"
        rows={6}
        maxLength={MAX_JD_LEN}
        disabled={running}
        className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-white/20 resize-y font-mono leading-relaxed"
      />
      <p className="text-[10px] text-text-muted text-right tabular-nums">
        {jdText.length.toLocaleString()} / {MAX_JD_LEN.toLocaleString()}
      </p>

      {progress && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-2">Tailoring bullets…</span>
            <span className="text-[11px] tabular-nums text-text-muted">{progress.done}/{progress.total}</span>
          </div>
          <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full transition-all duration-300"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400" role="alert">{error}</p>
      )}

      {summary && !running && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] p-3 text-xs text-emerald-300 space-y-1">
          <p>
            <span className="font-bold">{summary.rewritten}</span> rewritten ·{' '}
            <span className="font-bold">{summary.skipped}</span> skipped ·{' '}
            <span className="font-bold">{summary.failed}</span> failed
          </p>
          <p className="text-[11px] text-emerald-300/70 inline-flex items-center gap-1">
            <Undo2 className="w-3 h-3" aria-hidden="true" />
            Each bullet has a per-bullet revert in the experience section.
          </p>
        </div>
      )}

      {!running ? (
        <button
          type="button"
          onClick={handleRun}
          disabled={!jdText.trim() || total === 0}
          className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold px-4 py-2.5 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <Wand2 className="w-4 h-4" aria-hidden="true" />
          Tailor all bullets to this JD ({total})
        </button>
      ) : (
        <button
          type="button"
          onClick={handleStop}
          className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 text-white font-medium px-4 py-2.5 hover:bg-white/10"
        >
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          Tailoring… (click to stop)
        </button>
      )}
    </div>
  )
}
