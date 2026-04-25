import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ARCHETYPES } from '@/lib/careerops/archetypes'
import { Target } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Archetypes',
  description: 'Your evaluation distribution across the 6 careerops archetypes.',
  robots: { index: false, follow: false },
}

interface AggregateRow {
  archetype: string | null
  count: number
  avg_score: number | null
  high_count: number
  mid_count: number
  low_count: number
}

const MIN_EVALS_FOR_INSIGHTS = 5

export default async function ArchetypesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Pull all user evaluations; aggregate in memory (small N per user).
  const { data: rows } = await supabase
    .from('evaluations')
    .select('archetype, score')
    .eq('user_id', user.id)

  const evals = (rows ?? []) as { archetype: string | null; score: number | null }[]
  const total = evals.length

  // Aggregate per archetype
  const stats = new Map<string, AggregateRow>()
  for (const a of [...ARCHETYPES, 'unclassified']) {
    stats.set(a, { archetype: a, count: 0, avg_score: null, high_count: 0, mid_count: 0, low_count: 0 })
  }
  const scoreSumByArchetype = new Map<string, number>()

  for (const e of evals) {
    const key = e.archetype && (ARCHETYPES as readonly string[]).includes(e.archetype) ? e.archetype : 'unclassified'
    const row = stats.get(key)!
    row.count += 1
    if (typeof e.score === 'number') {
      scoreSumByArchetype.set(key, (scoreSumByArchetype.get(key) ?? 0) + e.score)
      if (e.score >= 4.0) row.high_count += 1
      else if (e.score >= 3.0) row.mid_count += 1
      else row.low_count += 1
    }
  }
  for (const [key, row] of stats) {
    const sum = scoreSumByArchetype.get(key) ?? 0
    row.avg_score = row.count > 0 ? sum / row.count : null
  }

  const ordered = [...stats.values()]
    .filter(r => r.count > 0)
    .sort((a, b) => (b.avg_score ?? 0) - (a.avg_score ?? 0))

  const maxCount = Math.max(1, ...ordered.map(r => r.count))

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-text-2 mb-2">careerops · archetypes</p>
        <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2">Your archetype mix</h1>
        <p className="text-sm text-text-2 max-w-xl leading-relaxed">
          Each evaluation classifies the role into one of 6 careerops archetypes.
          Track which archetypes you score highest on — that&apos;s where you should focus.
        </p>
      </header>

      {total === 0 ? (
        <EmptyState />
      ) : total < MIN_EVALS_FOR_INSIGHTS ? (
        <PartialState total={total} need={MIN_EVALS_FOR_INSIGHTS - total} />
      ) : (
        <section aria-label="Archetype distribution" className="space-y-3">
          {ordered.map((row) => (
            <ArchetypeRow key={row.archetype} row={row} maxCount={maxCount} />
          ))}
        </section>
      )}

      <p className="mt-8 text-[11px] text-text-2 leading-relaxed border-t border-white/5 pt-6">
        Total evaluations: <span className="text-white">{total}</span>.
        Insights unlock at {MIN_EVALS_FOR_INSIGHTS}+ evaluations.
      </p>
    </div>
  )
}

function tier(score: number | null): 'high' | 'mid' | 'low' | 'none' {
  if (score == null) return 'none'
  if (score >= 4.0) return 'high'
  if (score >= 3.0) return 'mid'
  return 'low'
}

function ArchetypeRow({ row, maxCount }: { row: AggregateRow; maxCount: number }) {
  const widthPct = (row.count / maxCount) * 100
  const t = tier(row.avg_score)
  const barColor =
    t === 'high' ? 'var(--tier-high)' :
    t === 'mid'  ? 'var(--tier-mid)'  :
                   'var(--tier-low)'

  const label = row.archetype === 'unclassified' ? 'Unclassified' : row.archetype

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-white/15 transition-colors">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[color:var(--accent)]/10 border border-[color:var(--accent)]/20 text-[color:var(--accent)]">
            <Target size={14} />
          </span>
          <span className="text-sm font-medium text-white truncate">{label}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-text-2 shrink-0">
          <span className="tabular-nums">
            <span className="text-white font-semibold">{row.avg_score?.toFixed(1) ?? '—'}</span>
            <span className="opacity-50">/5 avg</span>
          </span>
          <span className="tabular-nums">
            <span className="text-white">{row.count}</span> eval{row.count === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden" aria-hidden="true">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${widthPct}%`, background: barColor }}
        />
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
        {row.high_count > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-[color:var(--tier-high-dim)] text-[color:var(--tier-high)] tabular-nums">
            {row.high_count} ≥ 4.0
          </span>
        )}
        {row.mid_count > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-[color:var(--tier-mid-dim)] text-[color:var(--tier-mid)] tabular-nums">
            {row.mid_count} 3.0–3.9
          </span>
        )}
        {row.low_count > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-[color:var(--tier-low-dim)] text-[color:var(--tier-low)] tabular-nums">
            {row.low_count} &lt; 3.0
          </span>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10 text-center">
      <h2 className="text-base font-semibold text-white mb-1">No evaluations yet</h2>
      <p className="text-sm text-text-2 mb-5 max-w-md mx-auto">
        Run your first A-G evaluation to start mapping your archetype mix.
      </p>
      <Link
        href="/evaluate"
        className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-white text-[#07070b] font-medium text-sm hover:bg-white/90 transition-colors min-h-[44px]"
      >
        Evaluate a job →
      </Link>
    </div>
  )
}

function PartialState({ total, need }: { total: number; need: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
      <h2 className="text-sm font-semibold text-white mb-1">
        {total} evaluation{total === 1 ? '' : 's'} so far — {need} more for full insights
      </h2>
      <p className="text-[12px] text-text-2 mb-4 max-w-md mx-auto">
        Distribution charts unlock at {MIN_EVALS_FOR_INSIGHTS}+ evals.
      </p>
      <Link
        href="/evaluate"
        className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-white/15 text-white text-xs hover:border-white/30 transition-colors min-h-[36px]"
      >
        Evaluate another job
      </Link>
    </div>
  )
}
