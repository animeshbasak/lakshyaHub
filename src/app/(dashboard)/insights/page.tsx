import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { TrendingUp, AlertTriangle, AlertOctagon, Info, ArrowRight } from 'lucide-react'
import { getPatternAnalysis } from '@/actions/patternActions'
import type {
  PatternAnalysis,
  PatternFunnel,
  ArchetypeBreakdown,
  Recommendation,
  ScoreBucket,
} from '@/lib/careerops/patternAnalysis'

export const metadata: Metadata = {
  title: 'Insights · Lakshya',
  description: 'Pattern analysis across your evaluations and applications.',
  robots: { index: false, follow: false },
}

export default async function InsightsPage() {
  const result = await getPatternAnalysis()
  if (!result.ok) {
    if (result.error === 'unauthenticated') redirect('/login')
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
        <p className="text-sm text-red-400">Couldn&apos;t load insights ({result.error}).</p>
      </div>
    )
  }
  const data = result.data!
  const empty = data.funnel.totalEvaluations === 0

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12 space-y-8">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold text-white">Insights</h1>
        <p className="text-sm text-text-2 mt-1">
          Patterns across your evaluations and applications. Data-only — no LLM calls. Sharpens after ~10 applications + ~30 evaluations.
        </p>
      </header>

      {empty ? <EmptyState /> : (
        <>
          <FunnelCards funnel={data.funnel} />
          <RecommendationsList items={data.recommendations} />
          <ArchetypeTable rows={data.archetypeBreakdown} />
          <ScoreDistribution buckets={data.scoreDistribution} />
          <LegitimacyMix mix={data.legitimacyMix} />
        </>
      )}

      <footer className="text-[11px] text-text-2 pt-6 border-t border-white/5">
        Generated {new Date(data.generatedAt).toLocaleString()} · pulls last 500 of each table.
      </footer>
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
      <p className="text-sm text-text-2 mb-3">No evaluations yet — patterns appear once you start.</p>
      <Link
        href="/evaluate"
        className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90"
      >
        Run your first evaluation <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </div>
  )
}

function FunnelCards({ funnel }: { funnel: PatternFunnel }) {
  const items = [
    { label: 'Evaluations', value: funnel.totalEvaluations },
    { label: 'Applied', value: funnel.applied, sub: pct(funnel.applyRate) + ' apply rate' },
    { label: 'Interview', value: funnel.interview, sub: pct(funnel.interviewRate) + ' of applied' },
    { label: 'Offer', value: funnel.offer, sub: pct(funnel.offerRate) + ' of interview' },
    { label: 'Rejected', value: funnel.rejected },
  ]
  return (
    <section aria-label="Funnel">
      <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4" aria-hidden="true" /> Funnel
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {items.map(it => (
          <div key={it.label} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <p className="text-[10px] uppercase tracking-widest text-text-2">{it.label}</p>
            <p className="text-2xl font-bold text-white tabular-nums mt-1">{it.value}</p>
            {it.sub && <p className="text-[11px] text-text-2 mt-0.5">{it.sub}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}

function RecommendationsList({ items }: { items: Recommendation[] }) {
  if (!items.length) return null
  return (
    <section aria-label="Recommendations" className="space-y-2">
      <h2 className="text-sm font-semibold text-white">Recommendations</h2>
      {items.map((r, i) => {
        const Icon = r.severity === 'critical' ? AlertOctagon : r.severity === 'warning' ? AlertTriangle : Info
        const color = r.severity === 'critical'
          ? 'border-red-500/30 bg-red-500/[0.06] text-red-300'
          : r.severity === 'warning'
            ? 'border-amber-500/30 bg-amber-500/[0.06] text-amber-300'
            : 'border-white/10 bg-white/[0.02] text-text-2'
        return (
          <div key={i} className={`rounded-xl border p-4 ${color}`}>
            <div className="flex items-start gap-3">
              <Icon className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-semibold text-sm text-white">{r.title}</p>
                <p className="text-[13px] mt-1 leading-relaxed">{r.body}</p>
              </div>
            </div>
          </div>
        )
      })}
    </section>
  )
}

function ArchetypeTable({ rows }: { rows: ArchetypeBreakdown[] }) {
  if (!rows.length) return null
  return (
    <section aria-label="Archetype breakdown">
      <h2 className="text-sm font-semibold text-white mb-3">Archetype performance</h2>
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-widest text-text-2 border-b border-white/10">
              <th className="px-3 py-2">Archetype</th>
              <th className="px-3 py-2 text-right">Evals</th>
              <th className="px-3 py-2 text-right">Avg score</th>
              <th className="px-3 py-2 text-right">Applied</th>
              <th className="px-3 py-2 text-right">Interview</th>
              <th className="px-3 py-2 text-right">Offer</th>
              <th className="px-3 py-2 text-right">Conv.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.archetype} className="border-b border-white/[0.04] last:border-b-0">
                <td className="px-3 py-2 text-white">{r.archetype}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.evaluations}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.averageScore.toFixed(1)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.applied}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.interview}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.offer}</td>
                <td className="px-3 py-2 text-right tabular-nums">{pct(r.conversionRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function ScoreDistribution({ buckets }: { buckets: ScoreBucket[] }) {
  const total = buckets.reduce((s, b) => s + b.count, 0)
  if (total === 0) return null
  const labels = { low: 'Below 3.0', mid: '3.0 – 4.0', high: '4.0 +' } as const
  return (
    <section aria-label="Score distribution">
      <h2 className="text-sm font-semibold text-white mb-3">Score distribution</h2>
      <div className="grid grid-cols-3 gap-3">
        {buckets.map(b => (
          <div key={b.bucket} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <p className="text-[10px] uppercase tracking-widest text-text-2">{labels[b.bucket]}</p>
            <p className="text-2xl font-bold text-white tabular-nums mt-1">{b.count}</p>
            <p className="text-[11px] text-text-2 mt-0.5">avg {b.averageScore.toFixed(1)} / 5</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function LegitimacyMix({ mix }: { mix: { high: number; caution: number; suspicious: number; unknown: number } }) {
  const total = mix.high + mix.caution + mix.suspicious + mix.unknown
  if (total === 0) return null
  const items = [
    { label: 'High',       count: mix.high,       color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
    { label: 'Caution',    count: mix.caution,    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
    { label: 'Suspicious', count: mix.suspicious, color: 'text-red-400 border-red-500/30 bg-red-500/10' },
    { label: 'Unknown',    count: mix.unknown,    color: 'text-text-2 border-white/10 bg-white/[0.02]' },
  ]
  return (
    <section aria-label="Legitimacy mix">
      <h2 className="text-sm font-semibold text-white mb-3">Legitimacy mix</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map(i => (
          <div key={i.label} className={`rounded-xl border p-3 ${i.color}`}>
            <p className="text-[10px] uppercase tracking-widest opacity-70">{i.label}</p>
            <p className="text-2xl font-bold tabular-nums mt-1">{i.count}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`
}
