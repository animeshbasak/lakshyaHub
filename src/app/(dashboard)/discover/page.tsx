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
  Zap,
  ChevronDown,
  ArrowUpDown,
  Building2,
  DollarSign,
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
  const colorFor: Record<LocalLog['type'], string> = {
    info: 'var(--fg-3)',
    success: 'var(--emerald)',
    warn: 'var(--amber)',
    error: 'var(--red)',
  }
  const iconMap: Record<LocalLog['type'], React.ReactNode> = {
    info: <Info size={11} style={{ color: colorFor.info }} />,
    success: <CheckCircle size={11} style={{ color: colorFor.success }} />,
    warn: <AlertTriangle size={11} style={{ color: colorFor.warn }} />,
    error: <XCircle size={11} style={{ color: colorFor.error }} />,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="mono"
      style={{
        display: 'grid',
        gridTemplateColumns: '70px 18px 1fr',
        gap: 8,
        alignItems: 'center',
        padding: '3px 0',
        fontSize: 11.5,
      }}
    >
      <span style={{ color: 'var(--fg-4)' }}>{log.timestamp}</span>
      {iconMap[log.type]}
      <span style={{ color: colorFor[log.type] }}>{log.message}</span>
    </motion.div>
  )
}

// ─── Grade badge ──────────────────────────────────────────────────────────────

function GradeBadge({ grade }: { grade: string }) {
  const variant =
    grade === 'A' ? 'emerald' :
    grade === 'B' ? 'cyan' :
    grade === 'C' ? 'amber' :
    grade === 'D' ? 'amber' :
    'red'
  return <span className={`badge ${variant}`}>Grade {grade}</span>
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
  const grade = (job.fit_breakdown as unknown as { grade?: string } | null)?.grade

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut', delay: index * 0.04 }}
      className="card card-pad"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 16,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--fg)' }}>{job.title}</span>
          <span className="badge">{job.source}</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 8,
            fontSize: 12.5,
            color: 'var(--fg-2)',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Building2 size={12} style={{ color: 'var(--fg-4)' }} /> {job.company}
          </span>
          {job.location && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <MapPin size={12} style={{ color: 'var(--fg-4)' }} /> {job.location}
            </span>
          )}
          {job.salary_range && (
            <span
              className="mono"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--emerald)' }}
            >
              <DollarSign size={12} /> {job.salary_range}
            </span>
          )}
        </div>
        {job.description && (
          <p
            className="text-3"
            style={{
              fontSize: 12.5,
              margin: '0 0 10px',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {job.description}
          </p>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 10,
          minWidth: 120,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {job.fit_score > 0 && <FitBadge score={job.fit_score} size="default" />}
          {grade && <GradeBadge grade={grade} />}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn sm ghost"
              title="View original"
              aria-label="View original job posting"
            >
              <ExternalLink size={12} />
            </a>
          )}
          <button
            onClick={() => onSave(job.id)}
            disabled={isSaved}
            aria-label={isSaved ? 'Already saved to board' : 'Add to board'}
            className={`btn sm ${isSaved ? '' : 'primary'}`}
            style={isSaved ? { color: 'var(--emerald)' } : {}}
          >
            {isSaved ? (
              <>
                <CheckCircle size={12} /> Saved
              </>
            ) : (
              <>
                <Plus size={12} /> Save
              </>
            )}
          </button>
        </div>
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
  const [fitFilter, setFitFilter] = useState<'all' | '90' | '80' | '70'>('all')
  const [sortMode, setSortMode] = useState<'fit' | 'new'>('fit')
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

  // Derive filtered + sorted jobs
  const filteredJobs = (() => {
    let list = [...jobs]
    if (fitFilter === '90') list = list.filter((j) => j.fit_score >= 90)
    else if (fitFilter === '80') list = list.filter((j) => j.fit_score >= 80 && j.fit_score < 90)
    else if (fitFilter === '70') list = list.filter((j) => j.fit_score >= 70 && j.fit_score < 80)
    if (sortMode === 'fit') list.sort((a, b) => b.fit_score - a.fit_score)
    return list
  })()

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '360px 1fr',
        minHeight: 'calc(100vh - var(--topbar-h))',
      }}
    >
      {/* ─── Left column: query panel ───────────────────────────────── */}
      <div
        style={{
          borderRight: '1px solid var(--hair)',
          padding: 22,
          background: 'var(--bg-1)',
          overflow: 'auto',
        }}
      >
        <div style={{ marginBottom: 18 }}>
          <h1 className="h1" style={{ fontSize: 19, marginBottom: 4 }}>
            Discover jobs
          </h1>
          <p className="text-3" style={{ fontSize: 12, margin: 0 }}>
            Live scrape · AI-scored against your resume
          </p>
        </div>

        <div className="eyebrow" style={{ marginBottom: 8 }}>Role / Title</div>
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <Search
            size={14}
            style={{ position: 'absolute', left: 11, top: 10, color: 'var(--fg-4)' }}
          />
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Senior Product Manager"
            style={{ paddingLeft: 32 }}
            onKeyDown={(e) => e.key === 'Enter' && !isRunning && handleRunSearch()}
          />
        </div>

        <div className="eyebrow" style={{ marginBottom: 8 }}>Location</div>
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <MapPin
            size={14}
            style={{ position: 'absolute', left: 11, top: 10, color: 'var(--fg-4)' }}
          />
          <input
            className="input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Bangalore, Remote"
            style={{ paddingLeft: 32 }}
          />
        </div>

        <div className="eyebrow" style={{ marginBottom: 8 }}>Sources</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {ALL_SOURCES.map(({ key, label }) => {
            const active = selectedSources.includes(key)
            return (
              <button
                key={key}
                onClick={() => toggleSource(key)}
                aria-pressed={active}
                className={`chip ${active ? 'active' : ''}`}
              >
                <span
                  className="dot"
                  style={{ background: active ? 'var(--cyan)' : 'var(--fg-4)' }}
                />
                {label}
              </button>
            )
          })}
        </div>
        {selectedSources.length === 0 && (
          <p style={{ fontSize: 11.5, color: 'var(--amber)', marginTop: -6, marginBottom: 10 }}>
            Select at least one source
          </p>
        )}

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="card"
            style={{
              padding: '10px 12px',
              marginBottom: 12,
              borderColor: 'rgba(239,68,68,0.25)',
              background: 'rgba(239,68,68,0.05)',
            }}
          >
            <p style={{ fontSize: 12, color: 'var(--red)', margin: 0 }}>{error}</p>
          </div>
        )}

        <button
          onClick={handleRunSearch}
          disabled={isRunning || !query.trim() || selectedSources.length === 0}
          className="btn primary lg"
          style={{ width: '100%', marginBottom: 10 }}
        >
          {isRunning ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Scraping...
            </>
          ) : (
            <>
              <Zap size={14} fill="currentColor" strokeWidth={2} />
              Run search
              <span
                className="mono"
                style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.5 }}
              >
                ⏎
              </span>
            </>
          )}
        </button>

        {phase === 'done' && (
          <button
            onClick={() => {
              setPhase('idle')
              setLogs([])
              setJobs([])
            }}
            className="btn ghost"
            style={{ width: '100%', marginBottom: 10 }}
          >
            New search
          </button>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 11px',
            border: '1px solid var(--hair)',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(168,85,247,0.04)',
            fontSize: 11.5,
            color: 'var(--fg-3)',
          }}
        >
          <Globe size={14} style={{ color: 'var(--purple)', flexShrink: 0 }} />
          <span>
            Also searches{' '}
            <span style={{ color: 'var(--fg-2)', fontWeight: 500 }}>40+ company portals</span>{' '}
            via Greenhouse & Lever
          </span>
        </div>
      </div>

      {/* ─── Right column: results / logs ───────────────────────────── */}
      <div style={{ overflow: 'auto' }}>
        {/* Idle empty state */}
        {phase === 'idle' && logs.length === 0 && jobs.length === 0 && (
          <div style={{ display: 'grid', placeItems: 'center', padding: 40, minHeight: 400 }}>
            <div style={{ textAlign: 'center', maxWidth: 400 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  margin: '0 auto 18px',
                  borderRadius: 16,
                  background: 'var(--bg-2)',
                  border: '1px solid var(--hair)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--cyan)',
                  boxShadow: 'inset 0 0 40px rgba(34,211,238,0.06)',
                }}
              >
                <Search size={24} />
              </div>
              <h3 className="h2" style={{ marginBottom: 6 }}>Ready when you are</h3>
              <p className="text-3" style={{ fontSize: 13, margin: '0 0 18px' }}>
                Configure your search on the left, then press{' '}
                <span className="kbd">⏎</span>.
              </p>
            </div>
          </div>
        )}

        {/* Running: live log stream */}
        {isRunning && (
          <div style={{ padding: '22px 26px', maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Loader2 size={14} className="animate-spin" style={{ color: 'var(--cyan)' }} />
              <span style={{ fontSize: 13 }}>Scraping live job boards...</span>
            </div>
            <div
              className="card"
              style={{ padding: '14px 16px', background: 'var(--bg-1)' }}
            >
              <AnimatePresence initial={false}>
                {logs.map((log) => (
                  <LogEntry key={log.id} log={log} />
                ))}
              </AnimatePresence>
              <div ref={logEndRef} />
            </div>
          </div>
        )}

        {/* Done */}
        {phase === 'done' && (
          <div style={{ padding: '18px 26px 60px' }}>
            {/* Collapsed log */}
            {logs.length > 0 && (
              <details
                style={{
                  padding: '8px 12px',
                  marginBottom: 14,
                  background: 'var(--bg-2)',
                  border: '1px solid var(--hair)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12,
                  color: 'var(--fg-3)',
                }}
              >
                <summary
                  style={{
                    cursor: 'pointer',
                    listStyle: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <CheckCircle size={12} style={{ color: 'var(--emerald)' }} />
                  <span>
                    Scrape complete ·{' '}
                    <span className="mono" style={{ color: 'var(--fg-2)' }}>
                      {jobs.length} jobs
                    </span>
                  </span>
                  <ChevronDown size={12} style={{ marginLeft: 'auto' }} />
                </summary>
                <div style={{ marginTop: 10 }}>
                  {logs.map((log) => (
                    <LogEntry key={log.id} log={log} />
                  ))}
                </div>
              </details>
            )}

            {/* Source errors banner */}
            {sourceErrors.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  padding: '10px 14px',
                  background: 'rgba(251,191,36,0.05)',
                  border: '1px solid rgba(251,191,36,0.2)',
                  borderRadius: 10,
                  marginBottom: 14,
                }}
              >
                <AlertTriangle size={14} style={{ color: 'var(--amber)', marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 12, minWidth: 0 }}>
                  <div style={{ color: 'var(--amber)', fontWeight: 600, marginBottom: 2 }}>
                    Some sources had issues — results may be incomplete
                  </div>
                  <ul className="mono text-3" style={{ fontSize: 11, margin: 0, padding: 0, listStyle: 'none' }}>
                    {sourceErrors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Toolbar */}
            {jobs.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 14,
                  flexWrap: 'wrap',
                }}
              >
                <span className="mono" style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>
                  {filteredJobs.length} results
                </span>
                <span style={{ color: 'var(--fg-4)', fontSize: 11.5 }}>
                  · {savedIds.size} saved
                </span>
                <span style={{ flex: 1 }} />
                <div
                  style={{
                    display: 'flex',
                    gap: 4,
                    background: 'var(--bg-inset)',
                    padding: 2,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--hair)',
                  }}
                >
                  {[
                    { id: 'all' as const, l: 'All' },
                    { id: '90' as const, l: '90+' },
                    { id: '80' as const, l: '80–89' },
                    { id: '70' as const, l: '70–79' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFitFilter(f.id)}
                      style={{
                        height: 24,
                        padding: '0 10px',
                        fontSize: 11.5,
                        borderRadius: 5,
                        color: fitFilter === f.id ? 'var(--fg)' : 'var(--fg-3)',
                        background: fitFilter === f.id ? 'var(--bg-3)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {f.l}
                    </button>
                  ))}
                </div>
                <button
                  className="btn sm ghost"
                  onClick={() => setSortMode(sortMode === 'fit' ? 'new' : 'fit')}
                >
                  <ArrowUpDown size={12} /> {sortMode === 'fit' ? 'By fit' : 'By date'}
                </button>
              </div>
            )}

            {/* Results */}
            {jobs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredJobs.map((job, i) => (
                  <JobResultCard
                    key={job.id}
                    job={job}
                    savedIds={savedIds}
                    onSave={handleSave}
                    index={i}
                  />
                ))}
                {filteredJobs.length === 0 && (
                  <div
                    className="text-3"
                    style={{ textAlign: 'center', fontSize: 13, padding: '30px 0' }}
                  >
                    No jobs match this filter.
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  padding: '40px 0',
                }}
              >
                <CheckCircle size={32} style={{ color: 'var(--emerald)' }} />
                <p className="text-2" style={{ fontSize: 13, margin: 0, textAlign: 'center' }}>
                  Search complete. Jobs saved to your board.{' '}
                  <a
                    href="/board"
                    style={{ color: 'var(--cyan)', textDecoration: 'none' }}
                  >
                    View board →
                  </a>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
