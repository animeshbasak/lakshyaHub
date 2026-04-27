'use client'

import { useState } from 'react'
import { Sparkles, Loader2, ExternalLink, AlertTriangle } from 'lucide-react'

interface ScanSummary {
  // Inline mode
  portalsAttempted?: number
  jobsReturned?: number
  jobsAfterTitleFilter?: number
  newJobs?: number
  errors?: number
  durationMs?: number
  // QStash mode
  portalsEnqueued?: number
  portalsFailed?: number
}

interface ScanJobOut {
  title: string
  company: string
  url: string
  portal: string
}

interface ScanResponse {
  ok: boolean
  error?: string
  mode?: 'qstash'   // omitted on inline mode
  summary?: ScanSummary
  jobs?: ScanJobOut[]
}

/**
 * Free ATS scan — hits Greenhouse / Ashby / Lever public APIs directly,
 * zero Apify, zero rate limits at our usage. Curated portal seed list
 * lives in src/data/portal-seeds.ts; users can request additions there.
 */
export function AtsScanCard() {
  const [state, setState] = useState<
    | { kind: 'idle' }
    | { kind: 'running' }
    | { kind: 'done'; summary: ScanSummary; jobs: ScanJobOut[]; mode?: 'qstash' }
    | { kind: 'error'; message: string }
  >({ kind: 'idle' })

  async function runScan(country: 'BOTH' | 'IN' | 'GLOBAL') {
    setState({ kind: 'running' })
    try {
      const res = await fetch('/api/scan/ats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country }),
      })
      const data: ScanResponse = await res.json()
      if (!data.ok) {
        setState({ kind: 'error', message: data.error ?? `HTTP ${res.status}` })
        return
      }
      setState({ kind: 'done', summary: data.summary!, jobs: data.jobs ?? [], mode: data.mode })
    } catch (e) {
      setState({ kind: 'error', message: e instanceof Error ? e.message : 'Network error' })
    }
  }

  return (
    <section
      aria-label="Free ATS scan"
      className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5"
    >
      <header className="flex items-start gap-3 mb-3">
        <Sparkles className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <h2 className="text-base font-semibold text-white">Free ATS scan</h2>
          <p className="text-xs text-text-2 mt-0.5 leading-relaxed">
            Direct Greenhouse / Ashby / Lever API queries against ~35 curated companies. Zero Apify usage, no rate limits, results in seconds.
          </p>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => runScan('BOTH')}
          disabled={state.kind === 'running'}
          className="min-h-[40px] px-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500 text-black text-sm font-medium hover:bg-emerald-400 disabled:opacity-60"
        >
          {state.kind === 'running' ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
          Scan all (IN + GLOBAL)
        </button>
        <button
          type="button"
          onClick={() => runScan('IN')}
          disabled={state.kind === 'running'}
          className="min-h-[40px] px-3 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] text-sm text-text-2 hover:text-white hover:border-white/20"
        >
          India only
        </button>
        <button
          type="button"
          onClick={() => runScan('GLOBAL')}
          disabled={state.kind === 'running'}
          className="min-h-[40px] px-3 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] text-sm text-text-2 hover:text-white hover:border-white/20"
        >
          Global only
        </button>
      </div>

      {state.kind === 'done' && (
        <div className="mt-4 space-y-3">
          <SummaryStrip s={state.summary} mode={state.mode} />
          {state.mode === 'qstash' ? (
            <p className="text-sm text-text-2">
              {state.summary.portalsEnqueued ?? 0} portals queued · running in the background.
              Open <span className="text-white">/board</span> in ~30s to see new jobs as they trickle in.
              {(state.summary.portalsFailed ?? 0) > 0 && (
                <span className="block text-amber-400 mt-1">
                  {state.summary.portalsFailed} failed to enqueue (check Upstash QStash logs).
                </span>
              )}
            </p>
          ) : state.jobs.length === 0 ? (
            <p className="text-sm text-text-2">
              No new jobs matched your title filter. Tighten it on /profile or try the broader country option.
            </p>
          ) : (
            <ul className="divide-y divide-white/5 rounded-xl border border-white/10 bg-white/[0.02] max-h-72 overflow-y-auto">
              {state.jobs.slice(0, 30).map((j, i) => (
                <li key={i} className="flex items-start justify-between gap-3 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{j.title}</p>
                    <p className="text-[11px] text-text-2 truncate">{j.company} · {j.portal.replace('-api', '')}</p>
                  </div>
                  <a
                    href={j.url}
                    target="_blank"
                    rel="noreferrer noopener nofollow"
                    className="shrink-0 inline-flex items-center gap-1 text-[11px] text-text-2 hover:text-white"
                  >
                    Open <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
          {state.jobs.length > 30 && (
            <p className="text-[11px] text-text-2">
              Showing first 30 of {state.jobs.length} new jobs. The rest are saved to your pipeline.
            </p>
          )}
        </div>
      )}

      {state.kind === 'error' && (
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/[0.06] text-red-300 text-sm">
          <AlertTriangle className="w-4 h-4" aria-hidden="true" />
          {state.message}
        </div>
      )}
    </section>
  )
}

function SummaryStrip({ s, mode }: { s: ScanSummary; mode?: 'qstash' }) {
  // QStash mode returns "Enqueued/Failed" instead of "Returned/Match/New"
  // because results are async and not in this response.
  const items = mode === 'qstash'
    ? [
        { label: 'Portals',  value: s.portalsAttempted ?? 0 },
        { label: 'Enqueued', value: s.portalsEnqueued ?? 0 },
        { label: 'Failed',   value: s.portalsFailed ?? 0 },
        { label: 'Mode',     value: 'queue' },
        { label: 'Time',     value: `${((s.durationMs ?? 0) / 1000).toFixed(1)}s` },
      ]
    : [
        { label: 'Portals',  value: s.portalsAttempted ?? 0 },
        { label: 'Returned', value: s.jobsReturned ?? 0 },
        { label: 'Match',    value: s.jobsAfterTitleFilter ?? 0 },
        { label: 'New',      value: s.newJobs ?? 0 },
        { label: 'Time',     value: `${((s.durationMs ?? 0) / 1000).toFixed(1)}s` },
      ]
  return (
    <div className="grid grid-cols-5 gap-2">
      {items.map(it => (
        <div key={it.label} className="rounded-lg border border-white/10 bg-white/[0.02] p-2 text-center">
          <p className="text-[10px] uppercase tracking-widest text-text-2">{it.label}</p>
          <p className="text-base font-bold text-white tabular-nums mt-0.5">{it.value}</p>
        </div>
      ))}
    </div>
  )
}
