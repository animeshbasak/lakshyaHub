'use client'
// src/features/resume-builder/components/AIPanel.tsx

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  ChevronDown,
  ChevronRight,
  Sparkles,
  Loader2,
  Zap,
  FileText,
  Minimize2,
  Undo2,
  GitCompare,
} from 'lucide-react'
import { diffTokens, diffStats } from '@/lib/utils/textDiff'
import { useResumeStore } from '@/features/resume-builder/store/useResumeStore'
import { useShallow } from 'zustand/shallow'
import { ATSScorePanel } from '@/features/resume-builder/components/ATSScorePanel'
import { JdMatchPanel } from '@/features/job-board/components/JdMatchPanel'
import { calculateATSScore, type ATSResult } from '@/lib/atsEngine'
import { resumeToText } from '@/lib/utils/resumeToText'
import type { JdMatch5dResult, ResumeData } from '@/types'
import { createClient } from '@/lib/supabase/client'

// ─── helpers ────────────────────────────────────────────────────────────────

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}

// Narrow store slice to only what we actually need — avoids re-render on
// unrelated store slice changes.
function selectResumeSlice(s: ReturnType<typeof useResumeStore.getState>) {
  return {
    id: s.id,
    name: s.name,
    template: s.template,
    header: s.header,
    summary: s.summary,
    skills: s.skills,
    experience: s.experience,
    education: s.education,
    projects: s.projects,
    competencies: s.competencies,
    referenceText: s.referenceText,
    isRefPanelCollapsed: s.isRefPanelCollapsed,
    importReview: s.importReview,
    resumeOrigin: s.resumeOrigin,
    setReferenceText: s.setReferenceText,
    updateBullet: s.updateBullet,
    rewriteBullet: s.rewriteBullet,
    revertAllBullets: s.revertAllBullets,
    revertBullet: s.revertBullet,
    setBulletImproving: s.setBulletImproving,
  }
}

// ─── Section card ────────────────────────────────────────────────────────────

interface SectionCardProps {
  title: string
  icon: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
  badge?: string
}

function SectionCard({
  title,
  icon,
  defaultOpen = true,
  children,
  badge,
}: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  const reducedMotion = useReducedMotion()

  return (
    <div className="relative bg-[#111118] border border-white/[0.06] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:outline-none"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-white shrink-0" aria-hidden="true">
            {icon}
          </span>
          <span className="text-sm font-semibold text-white truncate">{title}</span>
          {badge && (
            <span className="shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 text-white border border-white/10">
              {badge}
            </span>
          )}
        </div>
        <span
          className="text-text-muted shrink-0"
          style={{
            transition: reducedMotion ? 'none' : 'transform 150ms ease-out',
            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
          }}
          aria-hidden="true"
        >
          <ChevronDown className="w-4 h-4" />
        </span>
      </button>

      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

// ─── JD Match section ────────────────────────────────────────────────────────

interface JdSectionProps {
  resumeData: ResumeData
  initialJdId?: string | null
}

function JdSection({ resumeData, initialJdId }: JdSectionProps) {
  const [jdText, setJdText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<JdMatch5dResult | null>(null)
  const [prefilling, setPrefilling] = useState(false)

  // Auto-fetch JD from Supabase if jd_id param present
  useEffect(() => {
    if (!initialJdId) return
    let cancelled = false

    const fetchJd = async () => {
      setPrefilling(true)
      try {
        const supabase = createClient()
        const { data, error: sbError } = await supabase
          .from('jobs')
          .select('description')
          .eq('id', initialJdId)
          .single()

        if (!cancelled && !sbError && data?.description) {
          setJdText(data.description as string)
        }
      } catch {
        // silently fail — user can still paste manually
      } finally {
        if (!cancelled) setPrefilling(false)
      }
    }

    fetchJd()
    return () => {
      cancelled = true
    }
  }, [initialJdId])

  const handleAnalyze = async () => {
    if (!jdText.trim()) return
    setLoading(true)
    setError(null)
    try {
      const resumeText = resumeToText(resumeData)
      const res = await fetch('/api/ai/jd-match-5d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jd: jdText }),
      })
      const data = (await res.json()) as {
        success: boolean
        data?: JdMatch5dResult
        error?: string
      }
      if (!data.success || !data.data) {
        throw new Error(data.error ?? 'Analysis failed')
      }
      setResult(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Textarea */}
      <div>
        <label
          htmlFor="ai-panel-jd-textarea"
          className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-1.5"
        >
          Paste Job Description
        </label>
        <textarea
          id="ai-panel-jd-textarea"
          value={prefilling ? '' : jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder={prefilling ? 'Loading job description…' : 'Paste the job description here…'}
          disabled={prefilling || loading}
          rows={6}
          className="w-full bg-[#1a1a24] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-text-muted focus:border-white/25 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Job description input"
        />
        {prefilling && (
          <p className="text-[11px] text-text-muted mt-1 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Loading job description…
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={loading || prefilling || !jdText.trim()}
        className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-gradient-to-r from-white to-white/60 text-white font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:outline-none text-sm"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing…
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Analyze Match
          </>
        )}
      </button>

      {/* Result */}
      {result && (
        <JdMatchPanel
          jobId={initialJdId ?? 'local'}
          fitBreakdown={result}
          jobDescription={jdText}
        />
      )}
    </div>
  )
}

// ─── Bullet improve section ──────────────────────────────────────────────────

interface BulletSectionProps {
  experience: ResumeData['experience']
  referenceText: string
  mode: 'improve' | 'compact' | 'skim'
  rewriteBullet: (jobId: string, bulletId: string, text: string) => void
  setBulletImproving: (jobId: string, bulletId: string, improving: boolean) => void
}

function BulletSection({
  experience,
  referenceText,
  mode,
  rewriteBullet,
  setBulletImproving,
}: BulletSectionProps) {
  const allBullets = experience.flatMap((job) =>
    job.bullets.map((b) => ({ jobId: job.id, bulletId: b.id, text: b.text }))
  )
  const totalBullets = allBullets.length
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef(false)

  const handleImproveAll = async () => {
    if (totalBullets === 0 || running) return
    abortRef.current = false
    setRunning(true)
    setError(null)
    setProgress({ done: 0, total: totalBullets })

    for (let i = 0; i < allBullets.length; i++) {
      if (abortRef.current) break
      const { jobId, bulletId, text } = allBullets[i]
      if (!text.trim()) {
        setProgress({ done: i + 1, total: totalBullets })
        continue
      }

      setBulletImproving(jobId, bulletId, true)
      try {
        const res = await fetch('/api/ai/bullet-rewrite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bulletText: text,
            jobContext: referenceText.slice(0, 500) || undefined,
            mode,
          }),
        })
        const data = (await res.json()) as {
          success: boolean
          improved?: unknown
          error?: string
        }
        if (data.success && typeof data.improved === 'string' && data.improved.trim()) {
          rewriteBullet(jobId, bulletId, data.improved.trim())
        }
      } catch {
        // continue on individual bullet error
      } finally {
        setBulletImproving(jobId, bulletId, false)
        setProgress({ done: i + 1, total: totalBullets })
      }

      // 200ms stagger between bullets
      if (i < allBullets.length - 1 && !abortRef.current) {
        await new Promise((r) => setTimeout(r, 200))
      }
    }

    setRunning(false)
  }

  const handleStop = () => {
    abortRef.current = true
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-2">
          <span className="font-bold text-white">{totalBullets}</span>{' '}
          {totalBullets === 1 ? 'bullet' : 'bullets'} in your resume
        </p>
        {progress && running && (
          <p className="text-[11px] text-text-muted font-mono tabular-nums">
            {progress.done}/{progress.total}
          </p>
        )}
      </div>

      {/* Progress bar */}
      {progress && (
        <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-white to-white/60 rounded-full transition-all duration-300"
            style={{
              width: `${(progress.done / progress.total) * 100}%`,
            }}
          />
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}

      {!running ? (
        <button
          onClick={handleImproveAll}
          disabled={totalBullets === 0}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-gradient-to-r from-white to-white/60 text-white font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:outline-none text-sm"
        >
          {mode === 'compact' ? (
            <Minimize2 className="w-4 h-4" />
          ) : mode === 'skim' ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          {mode === 'compact'
            ? 'Compact All Bullets'
            : mode === 'skim'
              ? 'Skim All Bullets'
              : 'Improve All Bullets'}
        </button>
      ) : (
        <button
          onClick={handleStop}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-medium px-4 py-2.5 rounded-xl hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:outline-none text-sm"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          Improving… (click to stop)
        </button>
      )}

      {progress && !running && progress.done === progress.total && (
        <p className="text-xs text-emerald-400 text-center font-medium">
          All bullets improved!
        </p>
      )}

      {totalBullets === 0 && (
        <p className="text-[11px] text-text-muted text-center">
          Add experience bullets first to use this feature.
        </p>
      )}
    </div>
  )
}

// ─── Compact / Skim section ──────────────────────────────────────────────────

interface CompactSectionProps {
  experience: ResumeData['experience']
  referenceText: string
  rewriteBullet: (jobId: string, bulletId: string, text: string) => void
  setBulletImproving: (jobId: string, bulletId: string, improving: boolean) => void
}

function CompactSection({
  experience,
  referenceText,
  rewriteBullet,
  setBulletImproving,
}: CompactSectionProps) {
  const [pickedMode, setPickedMode] = useState<'compact' | 'skim'>('compact')
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef(false)

  const allBullets = experience.flatMap((job) =>
    job.bullets.map((b) => ({ jobId: job.id, bulletId: b.id, text: b.text }))
  )
  const totalBullets = allBullets.length

  const handleRun = async () => {
    if (totalBullets === 0 || running) return
    abortRef.current = false
    setRunning(true)
    setError(null)
    setProgress({ done: 0, total: totalBullets })

    for (let i = 0; i < allBullets.length; i++) {
      if (abortRef.current) break
      const { jobId, bulletId, text } = allBullets[i]
      if (!text.trim()) {
        setProgress({ done: i + 1, total: totalBullets })
        continue
      }
      setBulletImproving(jobId, bulletId, true)
      try {
        const res = await fetch('/api/ai/bullet-rewrite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bulletText: text,
            jobContext: referenceText.slice(0, 500) || undefined,
            mode: pickedMode,
          }),
        })
        const data = (await res.json()) as {
          success: boolean
          improved?: unknown
          error?: string
        }
        if (data.success && typeof data.improved === 'string' && data.improved.trim()) {
          rewriteBullet(jobId, bulletId, data.improved.trim())
        }
      } catch {
        // continue on individual bullet error
      } finally {
        setBulletImproving(jobId, bulletId, false)
        setProgress({ done: i + 1, total: totalBullets })
      }
      if (i < allBullets.length - 1 && !abortRef.current) {
        await new Promise((r) => setTimeout(r, 200))
      }
    }

    setRunning(false)
  }

  const handleStop = () => {
    abortRef.current = true
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-text-muted leading-relaxed">
        Same AI brain as Rewrite — but tuned to shrink. Compact trims ~25% and
        kills filler. Skim reduces each bullet to a single ~12-word line. All
        metrics are preserved. Original text is kept so you can revert.
      </p>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setPickedMode('compact')}
          disabled={running}
          className={`h-9 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 ${
            pickedMode === 'compact'
              ? 'bg-white/10 border-white/30 text-white'
              : 'bg-transparent border-white/10 text-text-2 hover:bg-white/5'
          }`}
        >
          Compact (-25%)
        </button>
        <button
          type="button"
          onClick={() => setPickedMode('skim')}
          disabled={running}
          className={`h-9 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 ${
            pickedMode === 'skim'
              ? 'bg-white/10 border-white/30 text-white'
              : 'bg-transparent border-white/10 text-text-2 hover:bg-white/5'
          }`}
        >
          Skim (one line)
        </button>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-text-2">
          <span className="font-bold text-white">{totalBullets}</span>{' '}
          {totalBullets === 1 ? 'bullet' : 'bullets'} ·{' '}
          <span className="mono" style={{ color: 'var(--fg)' }}>{pickedMode}</span>
        </p>
        {progress && running && (
          <p className="text-[11px] text-text-muted font-mono tabular-nums">
            {progress.done}/{progress.total}
          </p>
        )}
      </div>

      {progress && (
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ background: 'var(--bg-inset)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${(progress.done / progress.total) * 100}%`,
              background: 'var(--fg)',
            }}
          />
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}

      {!running ? (
        <button
          onClick={handleRun}
          disabled={totalBullets === 0}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 font-bold px-4 py-2.5 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-none text-sm"
          style={{ background: 'var(--fg)', color: 'var(--bg)' }}
        >
          <Minimize2 className="w-4 h-4" />
          {pickedMode === 'compact'
            ? 'Run Compact on all bullets'
            : 'Run Skim on all bullets'}
        </button>
      ) : (
        <button
          onClick={handleStop}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-medium px-4 py-2.5 rounded-xl hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-none text-sm"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          Running… (click to stop)
        </button>
      )}

      {progress && !running && progress.done === progress.total && (
        <p className="text-xs text-emerald-400 text-center font-medium">
          All bullets {pickedMode === 'compact' ? 'compacted' : 'skimmed'}!
        </p>
      )}

      {totalBullets === 0 && (
        <p className="text-[11px] text-text-muted text-center">
          Add experience bullets first to use this feature.
        </p>
      )}
    </div>
  )
}

// ─── Changes / Diff transparency section ─────────────────────────────────────

interface ChangesSectionProps {
  experience: ResumeData['experience']
  revertAllBullets: () => void
  revertBullet: (jobId: string, bulletId: string) => void
}

function ChangesSection({ experience, revertAllBullets, revertBullet }: ChangesSectionProps) {
  const changes = experience.flatMap((job) =>
    job.bullets
      .filter((b) => typeof b.originalText === 'string' && b.originalText !== b.text)
      .map((b) => ({
        jobId: job.id,
        bulletId: b.id,
        company: job.company,
        before: b.originalText ?? '',
        after: b.text,
      }))
  )

  if (changes.length === 0) {
    return (
      <p className="text-[11px] text-text-muted leading-relaxed">
        No AI rewrites to show. Run Rewrite, Compact, or Skim and the exact
        before/after diff will appear here — nothing is changed silently.
      </p>
    )
  }

  const totals = changes.reduce(
    (acc, c) => {
      const s = diffStats(c.before, c.after)
      return {
        beforeWords: acc.beforeWords + s.beforeWords,
        afterWords: acc.afterWords + s.afterWords,
      }
    },
    { beforeWords: 0, afterWords: 0 }
  )
  const totalDelta = totals.afterWords - totals.beforeWords
  const totalPct =
    totals.beforeWords === 0
      ? 0
      : Math.round((totalDelta / totals.beforeWords) * 100)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-2">
          <span className="font-bold text-white">{changes.length}</span>{' '}
          {changes.length === 1 ? 'change' : 'changes'} ·{' '}
          <span className="font-mono tabular-nums">
            {totals.beforeWords} → {totals.afterWords} words
          </span>{' '}
          <span
            className={`font-mono tabular-nums ${totalDelta <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}
          >
            ({totalDelta > 0 ? '+' : ''}
            {totalPct}%)
          </span>
        </p>
        <button
          type="button"
          onClick={revertAllBullets}
          className="flex items-center gap-1.5 h-7 px-2 rounded-md border border-white/10 text-[11px] text-text-2 hover:bg-white/5 hover:text-white transition-colors"
        >
          <Undo2 className="w-3 h-3" /> Revert all
        </button>
      </div>

      <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
        {changes.map((c) => {
          const stats = diffStats(c.before, c.after)
          const tokens = diffTokens(c.before, c.after)
          return (
            <div
              key={`${c.jobId}:${c.bulletId}`}
              className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wide text-text-muted">
                  {c.company || 'Experience'}
                </span>
                <span
                  className={`text-[10px] font-mono tabular-nums ${stats.delta <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}
                >
                  {stats.beforeWords} → {stats.afterWords}w{' '}
                  ({stats.delta > 0 ? '+' : ''}
                  {stats.pct}%)
                </span>
              </div>
              <div className="text-[11px] leading-snug" aria-label="Before">
                <span className="mr-1 rounded px-1 py-[1px] text-[9px] font-mono uppercase tracking-wide text-text-muted bg-white/5">
                  Before
                </span>
                {tokens.map((tok, idx) => {
                  if (tok.kind === 'added') return null
                  const cls =
                    tok.kind === 'removed'
                      ? 'bg-red-500/15 text-red-300 rounded px-0.5 line-through decoration-red-300/60'
                      : 'text-text-3'
                  return (
                    <span key={`b-${idx}`} className={cls}>
                      {tok.text}
                    </span>
                  )
                })}
              </div>
              <div className="text-[12px] leading-snug" aria-label="After">
                <span className="mr-1 rounded px-1 py-[1px] text-[9px] font-mono uppercase tracking-wide text-emerald-300 bg-emerald-500/15">
                  After
                </span>
                {tokens.map((tok, idx) => {
                  if (tok.kind === 'removed') return null
                  const cls =
                    tok.kind === 'added'
                      ? 'bg-emerald-500/20 text-emerald-200 rounded px-0.5'
                      : 'text-text-1'
                  return (
                    <span key={`a-${idx}`} className={cls}>
                      {tok.text}
                    </span>
                  )
                })}
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => revertBullet(c.jobId, c.bulletId)}
                  className="flex items-center gap-1 h-6 px-2 rounded-md border border-white/10 text-[10px] text-text-2 hover:bg-white/5 hover:text-white transition-colors"
                  title="Revert this bullet to its original text"
                >
                  <Undo2 className="w-3 h-3" /> Revert
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Reference text section ───────────────────────────────────────────────────

interface RefSectionProps {
  referenceText: string
  setReferenceText: (t: string) => void
}

function RefSection({ referenceText, setReferenceText }: RefSectionProps) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] text-text-2 leading-relaxed">
        Used as context for AI bullet improvements. Paste a job description or notes here.
      </p>
      <label
        htmlFor="ai-panel-ref-textarea"
        className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-1"
      >
        Reference Text
      </label>
      <textarea
        id="ai-panel-ref-textarea"
        value={referenceText}
        onChange={(e) => setReferenceText(e.target.value)}
        placeholder="Paste reference context here (optional)…"
        rows={5}
        className="w-full bg-[#1a1a24] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-text-muted focus:border-white/25 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all resize-none"
        aria-label="Reference text for AI bullet improvements"
      />
    </div>
  )
}

// ─── Main AIPanel ─────────────────────────────────────────────────────────────

export function AIPanel() {
  const store = useResumeStore(useShallow(selectResumeSlice))
  const searchParams = useSearchParams()
  const jdId = searchParams.get('jd_id')

  const [atsResult, setAtsResult] = useState<ATSResult | null>(null)
  const [atsLoading, setAtsLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Build a stable snapshot of the resume for ATS scoring
  const resumeData: ResumeData = {
    id: store.id,
    name: store.name,
    template: store.template,
    header: store.header,
    summary: store.summary,
    skills: store.skills,
    experience: store.experience,
    education: store.education,
    projects: store.projects,
    competencies: store.competencies,
    referenceText: store.referenceText,
    isRefPanelCollapsed: store.isRefPanelCollapsed,
    importReview: store.importReview,
    resumeOrigin: store.resumeOrigin,
  }

  // Debounced ATS scoring on resume data change
  const scoreResume = useCallback(
    (data: ResumeData) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      setAtsLoading(true)
      debounceRef.current = setTimeout(() => {
        try {
          const result = calculateATSScore(data)
          setAtsResult(result)
        } catch {
          setAtsResult(null)
        } finally {
          setAtsLoading(false)
        }
      }, 800)
    },
    []
  )

  // Re-score when relevant store fields change. Use a JSON fingerprint of the
  // fields that affect ATS score (avoids stale closure issues).
  const resumeFingerprint = JSON.stringify({
    header: store.header,
    summary: store.summary,
    skills: store.skills,
    experience: store.experience,
    education: store.education,
    projects: store.projects,
  })

  useEffect(() => {
    scoreResume(resumeData)
    // We only want to run when the fingerprint changes, not resumeData reference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeFingerprint, scoreResume])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">
      {/* JD Match section */}
      <SectionCard
        title="JD Match"
        icon={<Sparkles className="w-4 h-4" />}
        defaultOpen={!!jdId}
      >
        <JdSection resumeData={resumeData} initialJdId={jdId} />
      </SectionCard>

      {/* ATS Score section */}
      <SectionCard
        title="ATS Score"
        icon={<ChevronRight className="w-4 h-4" />}
        defaultOpen
        badge={
          atsResult && !atsLoading
            ? String(atsResult.score)
            : undefined
        }
      >
        <ATSScorePanel result={atsResult} loading={atsLoading} parseConfidence={store.importReview?.confidence ?? null} />
      </SectionCard>

      {/* Bullet Improve section */}
      <SectionCard
        title="Bullet Rewrite"
        icon={<Zap className="w-4 h-4" />}
        defaultOpen={false}
      >
        <BulletSection
          experience={store.experience}
          referenceText={store.referenceText ?? ''}
          mode="improve"
          rewriteBullet={store.rewriteBullet}
          setBulletImproving={store.setBulletImproving}
        />
      </SectionCard>

      {/* Compact / Skim section */}
      <SectionCard
        title="Compact & Skim"
        icon={<Minimize2 className="w-4 h-4" />}
        defaultOpen={false}
      >
        <CompactSection
          experience={store.experience}
          referenceText={store.referenceText ?? ''}
          rewriteBullet={store.rewriteBullet}
          setBulletImproving={store.setBulletImproving}
        />
      </SectionCard>

      {/* Changes / Diff transparency */}
      <SectionCard
        title="AI Changes"
        icon={<GitCompare className="w-4 h-4" />}
        defaultOpen={false}
      >
        <ChangesSection
          experience={store.experience}
          revertAllBullets={store.revertAllBullets}
          revertBullet={store.revertBullet}
        />
      </SectionCard>

      {/* Reference text section */}
      <SectionCard
        title="Reference Text"
        icon={<FileText className="w-4 h-4" />}
        defaultOpen={false}
      >
        <RefSection
          referenceText={store.referenceText ?? ''}
          setReferenceText={store.setReferenceText}
        />
      </SectionCard>
    </div>
  )
}
