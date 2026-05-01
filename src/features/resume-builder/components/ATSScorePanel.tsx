'use client'
// src/features/resume-builder/components/ATSScorePanel.tsx

import { useState, useReducer } from 'react'
import { CheckCircle2, XCircle, ChevronDown, ChevronRight, Info } from 'lucide-react'
import type { ATSResult } from '@/types'

interface ATSScorePanelProps {
  result: ATSResult | null
  loading?: boolean
  parseConfidence?: 'high' | 'medium' | 'low' | null
}

function ScoreCircle({ score }: { score: number }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const tierColor =
    score >= 85
      ? { stroke: 'url(#ats-grad-excellent)', text: 'text-emerald-400' }
      : score >= 70
      ? { stroke: 'url(#ats-grad-good)', text: 'text-white' }
      : score >= 55
      ? { stroke: 'url(#ats-grad-fair)', text: 'text-amber-400' }
      : { stroke: 'url(#ats-grad-poor)', text: 'text-red-400' }

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        aria-label={`ATS score: ${score} out of 100`}
        role="img"
      >
        <defs>
          <linearGradient id="ats-grad-excellent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--fg)" />
            <stop offset="100%" stopColor="var(--fg-3)" />
          </linearGradient>
          <linearGradient id="ats-grad-good" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--fg)" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="ats-grad-fair" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id="ats-grad-poor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
        />
        {/* Progress */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={tierColor.stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1)' }}
        />
        <text
          x="50"
          y="46"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="22"
          fontWeight="700"
          fill="#f1f5f9"
          fontFamily="inherit"
        >
          {score}
        </text>
        <text
          x="50"
          y="62"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="9"
          fill="#94a3b8"
          fontFamily="inherit"
        >
          / 100
        </text>
      </svg>
    </div>
  )
}

function getTierLabel(score: number): { label: string; colorClass: string } {
  if (score >= 85) return { label: 'Excellent', colorClass: 'text-emerald-400' }
  if (score >= 70) return { label: 'Good', colorClass: 'text-white' }
  if (score >= 55) return { label: 'Fair', colorClass: 'text-amber-400' }
  return { label: 'Needs Work', colorClass: 'text-red-400' }
}

// CheckRow accepts both failing items (which have specificTip) and passing items (which don't)
type CheckItem = {
  id: string
  label: string
  tip?: string
  passed?: boolean
  specificTip?: string
}

function CheckRow({ check }: { check: CheckItem }) {
  const passed = check.passed
  return (
    <div className="flex items-start gap-2 py-1.5">
      <span className="mt-0.5 shrink-0" aria-hidden="true">
        {passed ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        ) : (
          <XCircle className="w-4 h-4 text-red-400" />
        )}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-white leading-snug">{check.label}</p>
        {!passed && (
          <p className="text-[11px] text-text-2 mt-0.5 leading-relaxed">
            {('specificTip' in check ? check.specificTip : undefined) ?? check.tip}
          </p>
        )}
      </div>
    </div>
  )
}

export function ATSScorePanel({ result, loading = false, parseConfidence }: ATSScorePanelProps) {
  const [atsInfoOpen, setAtsInfoOpen] = useState(false)
  const [showAllFailing, setShowAllFailing] = useState(false)
  const [showPassing, setShowPassing] = useState(false)

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading ATS score">
        <div className="animate-pulse bg-white/[0.05] rounded-full w-[100px] h-[100px] mx-auto" />
        <div className="animate-pulse bg-white/[0.05] rounded-lg h-4 w-24 mx-auto" />
        <div className="space-y-2 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white/[0.05] rounded-lg h-8 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <p className="text-xs text-text-muted text-center py-4">
        ATS score will appear as you fill in your resume.
      </p>
    )
  }

  if (result.error === 'unparseable') {
    return (
      <p className="text-xs text-text-2 text-center py-4">
        Resume data is too sparse to score. Add experience, skills, and contact info to see your ATS score.
      </p>
    )
  }

  const { label: tierLabel, colorClass: tierColor } = getTierLabel(result.score)
  const gradeDesc = result.grade?.desc ?? ''

  const failing = result.failing ?? []
  const passing = result.passing ?? []

  const visibleFailing = showAllFailing ? failing : failing.slice(0, 5)
  const pillarScores = result.pillarScores

  return (
    <div className="space-y-4">
      {/* Score Circle + Tier */}
      <div className="flex flex-col items-center gap-1">
        <ScoreCircle score={result.score} />
        <span className={`text-sm font-bold ${tierColor}`}>{tierLabel}</span>
        {gradeDesc && (
          <span className="text-[11px] text-text-2 text-center leading-snug">{gradeDesc}</span>
        )}
        {parseConfidence && parseConfidence !== 'high' && (
          <span
            title={`Resume parsed with ${parseConfidence} confidence. Some data may be missing.`}
            className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
              parseConfidence === 'medium'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}
          >
            {parseConfidence} parse
          </span>
        )}
      </div>

      {/* Pillar breakdown */}
      {pillarScores && (
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { key: 'keywords', label: 'Keywords' },
              { key: 'position', label: 'Structure' },
              { key: 'baseline', label: 'Baseline' },
            ] as const
          ).map(({ key, label }) => {
            const s = pillarScores[key]
            const color =
              s >= 80
                ? 'text-emerald-400'
                : s >= 60
                ? 'text-amber-400'
                : 'text-red-400'
            return (
              <div
                key={key}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-2 flex flex-col items-center gap-0.5"
              >
                <span className={`text-base font-bold tabular-nums ${color}`}>{s}</span>
                <span className="text-[10px] text-text-muted font-medium">{label}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Failing checks */}
      {failing.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">
            To Improve ({failing.length})
          </p>
          <div className="divide-y divide-white/[0.04]">
            {visibleFailing.map((check) => (
              <CheckRow key={check.id} check={check} />
            ))}
          </div>
          {failing.length > 5 && (
            <button
              onClick={() => setShowAllFailing((v) => !v)}
              className="mt-2 text-[11px] text-white hover:text-white/80 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:outline-none rounded"
            >
              {showAllFailing
                ? 'Show fewer'
                : `Show ${failing.length - 5} more issues`}
            </button>
          )}
        </div>
      )}

      {/* Passing checks — collapsible */}
      {passing.length > 0 && (
        <div>
          <button
            onClick={() => setShowPassing((v) => !v)}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-2 transition-colors w-full text-left mb-1 focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:outline-none rounded"
            aria-expanded={showPassing}
          >
            {showPassing ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            Passing ({passing.length})
          </button>
          {showPassing && (
            <div className="divide-y divide-white/[0.04]">
              {passing.map((check) => (
                <CheckRow key={check.id} check={check} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* "What is ATS?" collapsible */}
      <div className="border-t border-white/[0.06] pt-3">
        <button
          onClick={() => setAtsInfoOpen((v) => !v)}
          className="flex items-center gap-1.5 text-[11px] text-text-muted hover:text-text-2 font-medium transition-colors w-full text-left focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:outline-none rounded"
          aria-expanded={atsInfoOpen}
        >
          <Info className="w-3.5 h-3.5 shrink-0" />
          What is ATS?
          {atsInfoOpen ? (
            <ChevronDown className="w-3 h-3 ml-auto" />
          ) : (
            <ChevronRight className="w-3 h-3 ml-auto" />
          )}
        </button>
        {atsInfoOpen && (
          <p className="mt-2 text-[11px] text-text-2 leading-relaxed">
            An <strong className="text-white">Applicant Tracking System (ATS)</strong> is software
            used by recruiters to filter resumes before a human ever sees them. It parses your
            resume and scores it based on keyword presence, formatting, and structure. A higher ATS
            score means your resume is less likely to be filtered out. Scores ≥70 are considered
            competitive; aim for ≥85 for top roles.
          </p>
        )}
      </div>
    </div>
  )
}
