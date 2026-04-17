'use client'
// src/features/job-board/components/JdMatchPanel.tsx
import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Sparkles } from 'lucide-react'
import type { JdMatch5dResult, ResumeData } from '@/types'
import { resumeToText } from '@/lib/utils/resumeToText'

const RESUME_STORAGE_KEY = 'lakshya_hub_resume_v1'

function getStoredResumeText(): string {
  try {
    const raw = localStorage.getItem(RESUME_STORAGE_KEY)
    if (!raw) return ''
    const parsed = JSON.parse(raw) as ResumeData
    return resumeToText(parsed)
  } catch {
    return ''
  }
}

interface JdMatchPanelProps {
  jobId: string
  fitBreakdown: JdMatch5dResult | null
  jobDescription: string
}

const DIMENSION_LABELS: Record<keyof JdMatch5dResult['dimensions'], string> = {
  skills: 'Skills',
  title: 'Title Match',
  seniority: 'Seniority',
  location: 'Location',
  salary: 'Salary',
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color =
    score >= 80
      ? { fill: 'from-emerald-500 to-emerald-400', text: 'text-emerald-400' }
      : score >= 60
      ? { fill: 'from-amber-500 to-amber-400', text: 'text-amber-400' }
      : { fill: 'from-red-500 to-red-400', text: 'text-red-400' }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-text-2 font-medium w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-white/[0.06] rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color.fill} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-xs font-bold tabular-nums w-8 text-right ${color.text}`}>
        {score}
      </span>
    </div>
  )
}

function computeGrade(overall: number): { letter: string; color: string } {
  if (overall >= 90) return { letter: 'A', color: 'text-emerald-400' }
  if (overall >= 80) return { letter: 'B', color: 'text-cyan-400' }
  if (overall >= 70) return { letter: 'C', color: 'text-amber-400' }
  if (overall >= 60) return { letter: 'D', color: 'text-orange-400' }
  return { letter: 'F', color: 'text-red-400' }
}

export function JdMatchPanel({ jobId, fitBreakdown, jobDescription }: JdMatchPanelProps) {
  const [result, setResult] = useState<JdMatch5dResult | null>(fitBreakdown)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRunAnalysis = async () => {
    setLoading(true)
    setError(null)
    try {
      const resumeText = getStoredResumeText()
      const res = await fetch('/api/ai/jd-match-5d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd: jobDescription, resumeText }),
      })
      const data = (await res.json()) as { success: boolean; data?: JdMatch5dResult; error?: string }
      if (!data.success || !data.data) {
        throw new Error(data.error ?? 'Analysis failed')
      }
      setResult(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run analysis')
    } finally {
      setLoading(false)
    }
  }

  // No data yet
  if (!result) {
    return (
      <div className="rounded-[14px] bg-white/[0.02] border border-white/[0.06] p-5">
        <h3 className="text-sm font-semibold text-white mb-3">JD Match Analysis</h3>
        {error && (
          <p className="text-xs text-red-400 mb-3" role="alert">
            {error}
          </p>
        )}
        <button
          onClick={handleRunAnalysis}
          disabled={loading || !jobDescription}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold px-5 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:outline-none text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analysing…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Run Analysis
            </>
          )}
        </button>
        {!jobDescription && (
          <p className="text-xs text-text-muted text-center mt-2">
            No job description available to analyse
          </p>
        )}
      </div>
    )
  }

  const grade = result.grade
    ? { letter: result.grade, color: computeGrade(result.overall_score).color }
    : computeGrade(result.overall_score)

  return (
    <div className="rounded-[14px] bg-white/[0.02] border border-white/[0.06] p-5">
      {/* Header: grade + overall score */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">JD Match Analysis</h3>
        <div className="flex items-center gap-2">
          <span className={`text-3xl font-black leading-none ${grade.color}`}>
            {grade.letter}
          </span>
          <div>
            <p className={`text-lg font-bold tabular-nums leading-none ${grade.color}`}>
              {result.overall_score}
            </p>
            <p className="text-[10px] text-text-muted font-medium">overall</p>
          </div>
        </div>
      </div>

      {/* Verdict */}
      {result.verdict && (
        <p className="text-xs text-text-2 mb-4 leading-relaxed">{result.verdict}</p>
      )}

      {/* Dimension bars */}
      <div className="flex flex-col gap-3 mb-4">
        {(
          Object.entries(result.dimensions) as [
            keyof JdMatch5dResult['dimensions'],
            number | { score: number; note?: string }
          ][]
        ).map(([key, val]) => {
          const score = typeof val === 'number' ? val : val.score
          return (
            <ScoreBar
              key={key}
              label={DIMENSION_LABELS[key] ?? key}
              score={score}
            />
          )
        })}
      </div>

      {/* Top gaps */}
      {result.top_gaps && result.top_gaps.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">
            Top Gaps
          </p>
          <div className="flex flex-wrap gap-1.5">
            {result.top_gaps.map((gap) => (
              <span
                key={gap}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20"
              >
                {gap}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tailor Resume CTA */}
      <Link
        href={`/resume?jd_id=${jobId}`}
        className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:outline-none text-sm"
      >
        <Sparkles className="w-4 h-4 text-cyan-400" />
        Tailor Resume
      </Link>
    </div>
  )
}
