'use client'

import { useState } from 'react'
import { Search, Loader2, ExternalLink, MapPin, Building2, Calendar, Sparkles, AlertTriangle } from 'lucide-react'

interface JobResult {
  url: string
  title: string
  company: string
  location: string | null
  description: string | null
  postedAt: string | null
  source: string
  salary: string | null
  tags: string[]
}

interface AdapterStat {
  name: string
  count: number
  durationMs: number
  error: string | null
}

interface SearchResponse {
  ok: boolean
  error?: string
  retryAfter?: number
  summary?: {
    totalRaw: number
    totalDeduped: number
    durationMs: number
    adapters: AdapterStat[]
  }
  jobs?: JobResult[]
}

type Region = 'IN' | 'GLOBAL' | 'REMOTE'

const REGION_LABELS: Record<Region, string> = {
  IN: 'India',
  REMOTE: 'Remote',
  GLOBAL: 'Global',
}

const SOURCE_LABELS: Record<string, string> = {
  'remotive': 'Remotive',
  'remoteok': 'RemoteOK',
  'hn-whos-hiring': "HN Hiring",
  'weworkremotely': 'WWR',
  'naukri': 'Naukri',
  'ats-portals': 'Direct ATS',
}

/**
 * Unified search panel — one query box, one button, fan-out to all adapters.
 * Replaces the previous two-card layout (ATS-card + Apify-form). Apify
 * scrapers move to a secondary collapsed section below.
 */
export function UnifiedSearchPanel() {
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState<Region>('GLOBAL')
  const [state, setState] = useState<
    | { kind: 'idle' }
    | { kind: 'searching' }
    | { kind: 'done'; jobs: JobResult[]; summary: SearchResponse['summary'] }
    | { kind: 'rate_limited'; retryAfter: number }
    | { kind: 'error'; message: string }
  >({ kind: 'idle' })

  async function runSearch(e?: React.FormEvent) {
    e?.preventDefault()
    if (query.trim().length < 2) return
    setState({ kind: 'searching' })
    try {
      const res = await fetch('/api/search/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), region }),
      })
      const data: SearchResponse = await res.json()
      if (res.status === 429) {
        setState({ kind: 'rate_limited', retryAfter: data.retryAfter ?? 4 })
        return
      }
      if (!data.ok) {
        setState({ kind: 'error', message: data.error ?? `HTTP ${res.status}` })
        return
      }
      setState({ kind: 'done', jobs: data.jobs ?? [], summary: data.summary })
    } catch (err) {
      setState({ kind: 'error', message: err instanceof Error ? err.message : 'Network error' })
    }
  }

  return (
    <section aria-label="Job search" className="space-y-4">
      {/* Search bar */}
      <form onSubmit={runSearch} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex flex-wrap gap-3 items-stretch">
          <div className="relative flex-1 min-w-[260px]">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-2" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Try: Lead Frontend Engineer, AI Platform, Data Engineer…"
              className="w-full min-h-[44px] pl-10 pr-3 rounded-lg border border-white/10 bg-black/30 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-white/20"
              aria-label="Job title or keywords"
            />
          </div>

          <div className="inline-flex rounded-lg border border-white/10 bg-black/30 p-1" role="radiogroup" aria-label="Region">
            {(['IN', 'REMOTE', 'GLOBAL'] as const).map(r => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={region === r}
                onClick={() => setRegion(r)}
                className={`min-h-[36px] px-3 text-xs font-medium rounded ${
                  region === r ? 'bg-white text-black' : 'text-text-2 hover:text-white'
                }`}
              >
                {REGION_LABELS[r]}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={query.trim().length < 2 || state.kind === 'searching'}
            className="min-h-[44px] px-4 inline-flex items-center gap-2 rounded-lg bg-[color:var(--accent)] text-black text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {state.kind === 'searching' ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Sparkles className="w-4 h-4" aria-hidden="true" />}
            Search
          </button>
        </div>

        <p className="mt-3 text-[11px] text-text-2 leading-relaxed">
          Searches 6 sources in parallel: Remotive, RemoteOK, HN Who&apos;s Hiring, WeWorkRemotely, Naukri (India), and direct ATS boards (Greenhouse / Ashby / Lever). Free, no rate limits at our usage.
        </p>
      </form>

      {/* Loading state — prominent skeleton + spinner so it's clear search is running. */}
      {state.kind === 'searching' && <SearchingState />}

      {/* Result states */}
      {state.kind === 'rate_limited' && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] text-amber-300 px-4 py-3 text-sm inline-flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" aria-hidden="true" />
          Hold on {state.retryAfter}s before searching again.
        </div>
      )}

      {state.kind === 'error' && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/[0.06] text-red-300 px-4 py-3 text-sm inline-flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" aria-hidden="true" />
          {state.message}
        </div>
      )}

      {state.kind === 'done' && (
        <>
          <SourceStrip adapters={state.summary?.adapters ?? []} totalDeduped={state.summary?.totalDeduped ?? 0} elapsedMs={state.summary?.durationMs ?? 0} />
          {state.jobs.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center text-sm text-text-2">
              No matches across {state.summary?.adapters.length ?? 0} sources. Try a broader title or different region filter.
            </div>
          ) : (
            <ul className="divide-y divide-white/5 rounded-xl border border-white/10 bg-white/[0.02]">
              {state.jobs.map(j => <ResultRow key={j.url} job={j} />)}
            </ul>
          )}
        </>
      )}
    </section>
  )
}

function SearchingState() {
  const sources = ['Remotive', 'RemoteOK', 'HN Hiring', 'WWR', 'Naukri', 'Direct ATS']
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-center gap-3 mb-4">
        <Loader2 className="w-5 h-5 animate-spin text-[color:var(--accent)]" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-white">Searching 6 sources in parallel…</p>
          <p className="text-[11px] text-text-2 mt-0.5">Typically 2–10 seconds. Naukri (India) is slowest.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4" aria-hidden="true">
        {sources.map((s, i) => (
          <span
            key={s}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.03] text-[10px] text-text-2"
            style={{ animation: `pulse 1.6s ${i * 0.15}s ease-in-out infinite` }}
          >
            {s}
          </span>
        ))}
      </div>
      {/* Skeleton rows so result-area height stays roughly stable. */}
      <div className="space-y-2" aria-busy="true" aria-label="Searching">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="rounded-lg border border-white/10 bg-white/[0.02] p-3 animate-pulse">
            <div className="h-3.5 w-2/3 bg-white/10 rounded mb-2" />
            <div className="h-2.5 w-1/3 bg-white/[0.07] rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

function SourceStrip({ adapters, totalDeduped, elapsedMs }: { adapters: AdapterStat[]; totalDeduped: number; elapsedMs: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <p className="text-xs text-text-2">
          <span className="font-bold text-white tabular-nums">{totalDeduped}</span> unique jobs ·
          <span className="ml-1 tabular-nums">{(elapsedMs / 1000).toFixed(1)}s</span>
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {adapters.map(a => {
          const label = SOURCE_LABELS[a.name] ?? a.name
          const tone = a.error
            ? 'border-amber-500/30 bg-amber-500/[0.06] text-amber-300'
            : a.count > 0
              ? 'border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-300'
              : 'border-white/10 bg-white/[0.03] text-text-2'
          return (
            <span
              key={a.name}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] tabular-nums ${tone}`}
              title={a.error ? `${label}: ${a.error}` : `${label}: ${a.count} jobs in ${a.durationMs}ms`}
            >
              {label} <span className="opacity-70">{a.count}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

function ResultRow({ job }: { job: JobResult }) {
  const sourceLabel = SOURCE_LABELS[job.source] ?? job.source
  return (
    <li className="px-4 py-3 hover:bg-white/[0.02]">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <a
            href={job.url}
            target="_blank"
            rel="noreferrer noopener nofollow"
            className="text-sm font-medium text-white hover:text-[color:var(--accent)] inline-flex items-center gap-1.5"
          >
            {job.title}
            <ExternalLink className="w-3 h-3 opacity-60" aria-hidden="true" />
          </a>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-text-2">
            {job.company && (
              <span className="inline-flex items-center gap-1">
                <Building2 className="w-3 h-3" aria-hidden="true" />
                {job.company}
              </span>
            )}
            {job.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3" aria-hidden="true" />
                {job.location}
              </span>
            )}
            {job.postedAt && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" aria-hidden="true" />
                {formatPostedAt(job.postedAt)}
              </span>
            )}
            {job.salary && (
              <span className="text-emerald-400">{job.salary}</span>
            )}
          </div>
          {job.description && (
            <p className="mt-1.5 text-[12px] text-text-2 leading-relaxed line-clamp-2">
              {job.description}
            </p>
          )}
        </div>
        <span
          className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-[10px] text-text-2"
          title={`Source: ${sourceLabel}`}
        >
          {sourceLabel}
        </span>
      </div>
    </li>
  )
}

function formatPostedAt(iso: string): string {
  const ts = Date.parse(iso)
  if (Number.isNaN(ts)) return ''
  const days = Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'today'
  if (days === 1) return '1d ago'
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return months === 1 ? '1mo ago' : `${months}mo ago`
}
