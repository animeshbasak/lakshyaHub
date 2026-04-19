'use client'
// src/features/job-board/components/JobDrawer.tsx
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ExternalLink,
  MapPin,
  Building2,
  DollarSign,
  Globe,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { updateApplicationStatus, updateApplicationNotes } from '@/actions/updateApplication'
import { parseSalaryRange } from '@/lib/utils/salaryParser'
import { JdMatchPanel } from './JdMatchPanel'
import type { Job, ApplicationStatus, JdMatch5dResult } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface JobDrawerProps {
  job: Job | null
  applicationId: string | null
  initialNotes?: string | null
  isOpen: boolean
  onClose: () => void
  onStatusChange: (id: string, status: string) => void
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<
  ApplicationStatus,
  { label: string; badge: string }
> = {
  saved: {
    label: 'Saved',
    badge: 'bg-white/5 text-white border-white/10',
  },
  applied: {
    label: 'Applied',
    badge: 'bg-white/5 text-white/90 border-white/10',
  },
  interview: {
    label: 'Interview',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  offer: {
    label: 'Offer',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  rejected: {
    label: 'Rejected',
    badge: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
}

// ─── AI result expandable section ────────────────────────────────────────────

function AiResultSection({
  title,
  content,
  onClose,
}: {
  title: string
  content: string | string[]
  onClose: () => void
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="mt-4 rounded-[14px] bg-white/[0.03] border border-white/[0.06] overflow-hidden">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-white hover:bg-white/[0.02] transition-colors focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:outline-none"
      >
        <span>{title}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onClose() }}
            className="text-text-muted hover:text-white transition-colors p-0.5"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {Array.isArray(content) ? (
                <ol className="list-decimal list-inside space-y-2">
                  {content.map((item, i) => (
                    <li key={i} className="text-sm text-text-2 leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-text-2 leading-relaxed whitespace-pre-wrap">
                  {content}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export function JobDrawer({
  job,
  applicationId,
  initialNotes,
  isOpen,
  onClose,
  onStatusChange,
}: JobDrawerProps) {
  const [currentStatus, setCurrentStatus] = useState<ApplicationStatus>('saved')
  const [markingApplied, setMarkingApplied] = useState(false)
  const [notes, setNotes] = useState(initialNotes ?? '')

  // Reset notes when switching to a different job
  useEffect(() => { setNotes(initialNotes ?? '') }, [initialNotes])
  const [coverLetterLoading, setCoverLetterLoading] = useState(false)
  const [interviewPrepLoading, setInterviewPrepLoading] = useState(false)
  const [coverLetterContent, setCoverLetterContent] = useState<string | null>(null)
  const [interviewPrepContent, setInterviewPrepContent] = useState<string[] | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  // ESC key
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const handleMarkApplied = async () => {
    if (!applicationId) return
    setMarkingApplied(true)
    try {
      const result = await updateApplicationStatus(applicationId, 'applied')
      if (!result.error) {
        setCurrentStatus('applied')
        onStatusChange(applicationId, 'applied')
      }
    } finally {
      setMarkingApplied(false)
    }
  }

  const handleCoverLetter = async () => {
    if (!job) return
    setCoverLetterLoading(true)
    setAiError(null)
    try {
      const res = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, resumeId: job.user_id }),
      })
      const data = (await res.json()) as { success: boolean; content?: string; error?: string }
      if (!data.success) throw new Error(data.error ?? 'Failed')
      setCoverLetterContent(data.content ?? '')
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Cover letter generation failed')
    } finally {
      setCoverLetterLoading(false)
    }
  }

  const handleInterviewPrep = async () => {
    if (!job) return
    setInterviewPrepLoading(true)
    setAiError(null)
    try {
      const res = await fetch('/api/ai/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id }),
      })
      const data = (await res.json()) as { success: boolean; questions?: string[]; error?: string }
      if (!data.success) throw new Error(data.error ?? 'Failed')
      setInterviewPrepContent(data.questions ?? [])
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Interview prep generation failed')
    } finally {
      setInterviewPrepLoading(false)
    }
  }

  const statusStyle = STATUS_STYLES[currentStatus] ?? STATUS_STYLES.saved

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Scrim */}
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            ref={drawerRef}
            initial={{ x: 480 }}
            animate={{ x: 0 }}
            exit={{ x: 480 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 h-full w-[480px] bg-[#111118] border-l border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.6)] z-[200] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label={job ? `${job.title} at ${job.company}` : 'Job details'}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-white/[0.06] flex-shrink-0">
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusStyle.badge}`}
                  >
                    {statusStyle.label}
                  </span>
                  {job?.source && (
                    <span className="text-[10px] text-text-muted font-medium uppercase tracking-widest">
                      {job.source}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white leading-tight">
                  {job?.title ?? '—'}
                </h2>
                <p className="text-sm text-text-2 mt-0.5 font-medium">
                  {job?.company ?? '—'}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close drawer"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-colors flex-shrink-0 focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {job && (
                <>
                  {/* Meta info */}
                  <div className="flex flex-col gap-2 mb-5">
                    {job.location && (
                      <div className="flex items-center gap-2 text-sm text-text-2">
                        <MapPin className="w-4 h-4 text-text-muted flex-shrink-0" />
                        {job.location}
                      </div>
                    )}
                    {job.company && (
                      <div className="flex items-center gap-2 text-sm text-text-2">
                        <Building2 className="w-4 h-4 text-text-muted flex-shrink-0" />
                        {job.company}
                      </div>
                    )}
                    {job.salary_range && (() => {
                      const parsed = parseSalaryRange(job.salary_range)
                      return (
                        <div className="flex items-center gap-2 text-sm text-text-2">
                          <DollarSign className="w-4 h-4 text-text-muted flex-shrink-0" />
                          {parsed ? parsed.display : job.salary_range}
                        </div>
                      )
                    })()}
                    {job.url && (
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-white hover:text-white/80 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 flex-shrink-0" />
                        View original listing
                      </a>
                    )}
                    {job.source && (
                      <div className="flex items-center gap-2 text-sm text-text-muted">
                        <Globe className="w-4 h-4 flex-shrink-0" />
                        via {job.source}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {job.description && (
                    <div className="mb-6">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">
                        Job Description
                      </h3>
                      <p className="text-sm text-text-2 leading-relaxed whitespace-pre-line">
                        {job.description}
                      </p>
                    </div>
                  )}

                  {/* AI error */}
                  {aiError && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20" role="alert">
                      <p className="text-sm text-red-400">{aiError}</p>
                    </div>
                  )}

                  {/* Cover letter result */}
                  {coverLetterContent && (
                    <AiResultSection
                      title="Cover Letter"
                      content={coverLetterContent}
                      onClose={() => setCoverLetterContent(null)}
                    />
                  )}

                  {/* Interview prep result */}
                  {interviewPrepContent && (
                    <AiResultSection
                      title="Interview Questions"
                      content={interviewPrepContent}
                      onClose={() => setInterviewPrepContent(null)}
                    />
                  )}

                  {/* JD Match panel */}
                  <div className="mt-6">
                    <JdMatchPanel
                      jobId={job.id}
                      fitBreakdown={
                        job.fit_breakdown
                          ? (job.fit_breakdown as unknown as JdMatch5dResult)
                          : null
                      }
                      jobDescription={job.description ?? ''}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Notes */}
            {applicationId && (
              <div className="px-6 pb-4">
                <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={() => {
                    if (applicationId) updateApplicationNotes(applicationId, notes)
                  }}
                  placeholder="Add notes about this application…"
                  rows={3}
                  className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-text-muted focus:border-white/25 focus:ring-2 focus:ring-white/10 focus:outline-none transition-all resize-none"
                />
              </div>
            )}

            {/* Sticky action bar */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-white/[0.06] bg-[#111118]">
              <div className="flex items-center gap-3">
                {/* Mark Applied */}
                <button
                  onClick={handleMarkApplied}
                  disabled={markingApplied || currentStatus === 'applied' || !applicationId}
                  className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-gradient-to-r from-white to-white/60 text-white font-bold px-5 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:outline-none text-sm"
                >
                  {markingApplied ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : currentStatus === 'applied' ? (
                    'Applied ✓'
                  ) : (
                    'Mark Applied'
                  )}
                </button>

                {/* Cover Letter */}
                <button
                  onClick={handleCoverLetter}
                  disabled={coverLetterLoading}
                  aria-label="Generate cover letter"
                  className="min-h-[44px] px-4 py-3 rounded-xl text-sm font-medium border border-white/10 text-text-2 hover:text-white hover:border-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:outline-none flex items-center gap-1.5"
                >
                  {coverLetterLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : null}
                  Cover Letter
                </button>

                {/* Interview Prep */}
                <button
                  onClick={handleInterviewPrep}
                  disabled={interviewPrepLoading}
                  aria-label="Generate interview prep questions"
                  className="min-h-[44px] px-4 py-3 rounded-xl text-sm font-medium border border-white/10 text-text-2 hover:text-white hover:border-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:outline-none flex items-center gap-1.5"
                >
                  {interviewPrepLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : null}
                  Interview Prep
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
