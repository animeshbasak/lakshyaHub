'use client'
// src/app/(dashboard)/discover/page.tsx
import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  MapPin,
  Globe,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  ExternalLink,
  Plus,
} from 'lucide-react'
import { scrapeJobs } from '@/actions/scrapeJobs'
import { saveJobToBoard } from '@/actions/updateApplication'
import { createClient } from '@/lib/supabase/client'
import type { ScrapeLog, Job } from '@/types'
import type { UserSource } from '@/lib/scrapers/types'
import { FitBadge } from '@/components/ui/FitBadge'

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'running' | 'done'

interface LocalLog {
  id: string
  type: ScrapeLog['type']
  message: string
  timestamp: string
}

const ALL_SOURCES: { key: UserSource; label: string }[] = [
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'naukri', label: 'Naukri' },
  { key: 'indeed', label: 'Indeed' },
  { key: 'glassdoor', label: 'Glassdoor' },
]

// ─── Log entry ────────────────────────────────────────────────────────────────

function LogEntry({ log }: { log: LocalLog }) {
  const iconMap: Record<LocalLog['type'], React.ReactNode> = {
    info: <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />,
    success: <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />,
    warn: <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />,
    error: <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-2.5 py-2 border-b border-white/[0.04] last:border-0"
    >
      {iconMap[log.type]}
      <div className="min-w-0">
        <p className="text-xs text-text-2">{log.message}</p>
        <p className="text-[10px] text-text-muted mt-0.5 font-mono">{log.timestamp}</p>
      </div>
    </motion.div>
  )
}

// ─── Job result card ──────────────────────────────────────────────────────────

function JobResultCard({
  job,
  savedIds,
  onSave,
  index,
}: {
  job: Job
  savedIds: Set<string>
  onSave: (id: string) => void
  index: number
}) {
  const isSaved = savedIds.has(job.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: index * 0.05 }}
      className="bg-[#111118] border border-white/[0.06] rounded-[14px] p-5 hover:border-white/10 transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.4)] group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
              {job.source}
            </span>
          </div>
          <h3 className="text-base font-semibold text-white leading-tight mb-0.5 truncate">
            {job.title}
          </h3>
          <p className="text-sm text-text-2 font-medium">{job.company}</p>
          {job.location && (
            <p className="text-[11px] text-text-muted mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {job.location}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 flex flex-col items-end gap-1">
          {job.fit_score > 0 && <FitBadge score={job.fit_score} size="default" />}
          {(() => {
            const grade = (job.fit_breakdown as unknown as { grade?: string } | null)?.grade
            if (!grade) return null
            const cls =
              grade === 'A' ? 'bg-emerald-500/15 text-emerald-400' :
              grade === 'B' ? 'bg-green-500/15 text-green-400' :
              grade === 'C' ? 'bg-amber-500/15 text-amber-400' :
              grade === 'D' ? 'bg-orange-500/15 text-orange-400' :
              'bg-red-500/15 text-red-400'
            return <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md ${cls}`}>{grade}</span>
          })()}
        </div>
      </div>

      {job.description && (
        <p className="text-sm text-text-2 mt-3 line-clamp-2 leading-relaxed">
          {job.description}
        </p>
      )}

      {job.salary_range && (
        <p className="text-xs text-text-2 mt-2 font-medium">{job.salary_range}</p>
      )}

      <div className="flex items-center justify-between mt-4 gap-2">
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Job
          </a>
        )}
        <div className="flex-1" />
        <button
          onClick={() => onSave(job.id)}
          disabled={isSaved}
          aria-label={isSaved ? 'Already saved to board' : 'Add to board'}
          className={`min-h-[44px] flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:outline-none ${
            isSaved
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
              : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:opacity-90'
          }`}
        >
          {isSaved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Saved
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add to Board
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DiscoverPage() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [selectedSources, setSelectedSources] = useState<UserSource[]>(['linkedin'])
  const [phase, setPhase] = useState<Phase>('idle')
  const [logs, setLogs] = useState<LocalLog[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [sourceErrors, setSourceErrors] = useState<string[]>([])
  const logEndRef = useRef<HTMLDivElement>(null)

  // Load latest session results on mount so results persist across navigation
  useEffect(() => {
    const supabase = createClient()
    void (async () => {
      try {
        const { data: session } = await supabase
          .from('scrape_sessions')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        if (!session) return
        const { data: sessionJobs } = await supabase
          .from('jobs')
          .select('*')
          .eq('session_id', session.id)
          .order('fit_score', { ascending: false })
        if (sessionJobs && sessionJobs.length > 0) {
          setJobs(sessionJobs as Job[])
          setPhase('done')
        }
      } catch {
        // Silently ignore — page loads empty if no previous session
      }
    })()
  }, [])

  const addLog = useCallback((type: LocalLog['type'], message: string) => {
    const entry: LocalLog = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      message,
      timestamp: new Date().toLocaleTimeString(),
    }
    setLogs((prev) => [...prev, entry])
    setTimeout(() => {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }, [])

  const toggleSource = (src: UserSource) => {
    setSelectedSources((prev) =>
      prev.includes(src) ? prev.filter((s) => s !== src) : [...prev, src]
    )
  }

  const handleRunSearch = async () => {
    if (!query.trim()) return
    setPhase('running')
    setLogs([])
    setJobs([])
    setError(null)
    setSourceErrors([])
    addLog('info', `Starting search for "${query}" in "${location || 'any location'}"...`)
    addLog('info', `Sources: ${selectedSources.join(', ')}`)

    try {
      const result = await scrapeJobs({
        query: query.trim(),
        location: location.trim(),
        sources: selectedSources,
        limit: 50,
      })

      if ('error' in result && result.error) {
        addLog('error', result.error)
        setError(result.error)
        setPhase('idle')
        return
      }

      if ('success' in result && result.success) {
        addLog('success', `Found ${result.jobsFound} jobs, saved ${result.jobsSaved}.`)
        if (result.errors && result.errors.length > 0) {
          setSourceErrors(result.errors)
        }

        // Fetch saved jobs for this session from Supabase
        if (result.sessionId) {
          try {
            const supabase = createClient()
            const { data: sessionJobs } = await supabase
              .from('jobs')
              .select('*')
              .eq('session_id', result.sessionId)
              .order('fit_score', { ascending: false })

            if (sessionJobs && sessionJobs.length > 0) {
              setJobs(sessionJobs as Job[])
            }
          } catch {
            addLog('warn', 'Could not load jobs inline. Check your Job Board for results.')
          }
        }

        setPhase('done')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed'
      addLog('error', message)
      setError(message)
      setPhase('idle')
    }
  }

  const handleSave = async (jobId: string) => {
    const result = await saveJobToBoard(jobId)
    if (!result.error) {
      setSavedIds((prev) => new Set([...prev, jobId]))
    }
  }

  const isRunning = phase === 'running'

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Discover Jobs</h1>
        <p className="text-sm text-text-2 mt-1">
          Scrape live listings and find your best-fit roles
        </p>
      </div>

      {sourceErrors.length > 0 && (
        <div className="mb-5 flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-400 mb-1">Some sources had issues — results may be incomplete</p>
            <ul className="space-y-0.5">
              {sourceErrors.map((e, i) => (
                <li key={i} className="text-[11px] text-amber-400/70 font-mono">{e}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* ── Left column: Query builder ──────────────────────────────── */}
        <div className="w-[400px] flex-shrink-0">
          <div className="bg-[#111118] border border-white/[0.06] rounded-[14px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.4)] sticky top-8">
            <h2 className="text-base font-semibold text-white mb-5">Search Query</h2>

            {/* Role input */}
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-widest text-text-2 mb-2">
                Role / Title
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Senior Product Manager"
                  className="w-full bg-[#1a1a24] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-text-muted focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all min-h-[44px]"
                  onKeyDown={(e) => e.key === 'Enter' && !isRunning && handleRunSearch()}
                />
              </div>
            </div>

            {/* Location input */}
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-widest text-text-2 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bangalore, Remote"
                  className="w-full bg-[#1a1a24] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-text-muted focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all min-h-[44px]"
                />
              </div>
            </div>

            {/* Sources multi-select */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-widest text-text-2 mb-2">
                Sources
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_SOURCES.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => toggleSource(key)}
                    aria-pressed={selectedSources.includes(key)}
                    className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold border transition-all focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:outline-none ${
                      selectedSources.includes(key)
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        : 'bg-white/[0.03] text-text-2 border-white/10 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 inline mr-1.5" />
                    {label}
                  </button>
                ))}
              </div>
              {selectedSources.length === 0 && (
                <p className="text-xs text-amber-400 mt-2">Select at least one source</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20" role="alert">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Run button */}
            <button
              onClick={handleRunSearch}
              disabled={isRunning || !query.trim() || selectedSources.length === 0}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold px-5 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:outline-none"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching…
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Run Search
                </>
              )}
            </button>

            {phase === 'done' && (
              <button
                onClick={() => { setPhase('idle'); setLogs([]); setJobs([]) }}
                className="w-full min-h-[44px] mt-3 flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-text-2 font-medium px-5 py-3 rounded-xl hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:outline-none text-sm"
              >
                New Search
              </button>
            )}
          </div>
        </div>

        {/* ── Right column: Session log + results ─────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Session log (shown while running or has logs) */}
          <AnimatePresence>
            {logs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-[#111118] border border-white/[0.06] rounded-[14px] p-5 mb-5 shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
              >
                <div className="flex items-center gap-2 mb-4">
                  {isRunning && (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  )}
                  <h2 className="text-sm font-semibold text-white">
                    {isRunning ? 'Searching…' : 'Session Log'}
                  </h2>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {logs.map((log) => (
                    <LogEntry key={log.id} log={log} />
                  ))}
                  <div ref={logEndRef} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Job results */}
          {jobs.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">
                  {jobs.length} Results
                </h2>
                <span className="text-xs text-text-muted">
                  {savedIds.size} saved to board
                </span>
              </div>
              <div className="flex flex-col gap-4">
                {jobs.map((job, i) => (
                  <JobResultCard
                    key={job.id}
                    job={job}
                    savedIds={savedIds}
                    onSave={handleSave}
                    index={i}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pre-search empty state */}
          {phase === 'idle' && logs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-80 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                <Search className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-semibold text-white mb-1">
                  Configure your search above
                </h3>
                <p className="text-sm text-text-2">
                  Enter a role and location, pick your sources, then hit Run Search
                </p>
              </div>
            </div>
          )}

          {/* Done state with no jobs fetched inline */}
          {phase === 'done' && jobs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
              <p className="text-sm text-text-2 text-center">
                Search complete. Jobs saved to your board.{' '}
                <a href="/board" className="text-cyan-400 hover:underline">
                  View board →
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
