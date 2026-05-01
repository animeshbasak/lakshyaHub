/**
 * Pattern Analyzer — DB-backed port of career-ops/analyze-patterns.mjs
 *
 * Aggregates a user's evaluations + applications to surface:
 *   - Funnel: eval → apply → interview → offer (or rejected)
 *   - Archetype win rates (which roles convert best?)
 *   - Score distribution (low/mid/high) + how each tier converts
 *   - Legitimacy mix (am I evaluating ghost jobs?)
 *   - Top 3 actionable recommendations
 *
 * Pure data shaping — no LLM calls. Runs on every /dashboard/insights load.
 */

export interface EvaluationRow {
  id: string
  archetype: string | null
  score: number | null
  legitimacy_tier: 'high' | 'caution' | 'suspicious' | null
  company: string | null
  role: string | null
  created_at: string | null
}

export interface ApplicationRow {
  id: string
  status: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'
  applied_at: string | null
  job_id: string | null
}

export interface PatternFunnel {
  totalEvaluations: number
  applied: number
  interview: number
  offer: number
  rejected: number
  applyRate: number       // applied / totalEvaluations
  interviewRate: number   // interview / applied
  offerRate: number       // offer / interview
}

export interface ArchetypeBreakdown {
  archetype: string
  evaluations: number
  averageScore: number
  applied: number
  interview: number
  offer: number
  conversionRate: number  // (interview + offer) / evaluations
}

export interface ScoreBucket {
  bucket: 'low' | 'mid' | 'high'      // <3 / 3–4 / 4+
  count: number
  averageScore: number
}

export interface LegitimacyMix {
  high: number
  caution: number
  suspicious: number
  unknown: number
}

export interface Recommendation {
  severity: 'info' | 'warning' | 'critical'
  title: string
  body: string
}

export interface PatternAnalysis {
  funnel: PatternFunnel
  archetypeBreakdown: ArchetypeBreakdown[]
  scoreDistribution: ScoreBucket[]
  legitimacyMix: LegitimacyMix
  recommendations: Recommendation[]
  generatedAt: string
}

const EMPTY_FUNNEL: PatternFunnel = {
  totalEvaluations: 0,
  applied: 0,
  interview: 0,
  offer: 0,
  rejected: 0,
  applyRate: 0,
  interviewRate: 0,
  offerRate: 0,
}

export function analyzePatterns(
  evaluations: EvaluationRow[],
  applications: ApplicationRow[]
): PatternAnalysis {
  const total = evaluations.length

  if (total === 0) {
    return {
      funnel: EMPTY_FUNNEL,
      archetypeBreakdown: [],
      scoreDistribution: [],
      legitimacyMix: { high: 0, caution: 0, suspicious: 0, unknown: 0 },
      recommendations: [{
        severity: 'info',
        title: 'Run your first evaluation',
        body: 'Paste a JD on /evaluate to get a 7-block career-ops verdict.',
      }],
      generatedAt: new Date().toISOString(),
    }
  }

  const applied = applications.filter(a => a.status === 'applied').length
  const interview = applications.filter(a => a.status === 'interview').length
  const offer = applications.filter(a => a.status === 'offer').length
  const rejected = applications.filter(a => a.status === 'rejected').length

  const funnel: PatternFunnel = {
    totalEvaluations: total,
    applied,
    interview,
    offer,
    rejected,
    applyRate: total ? round2(applied / total) : 0,
    interviewRate: applied ? round2(interview / applied) : 0,
    offerRate: interview ? round2(offer / interview) : 0,
  }

  // Archetype breakdown — group evals by archetype, then count downstream apps.
  const byArchetype = new Map<string, EvaluationRow[]>()
  for (const e of evaluations) {
    const k = e.archetype ?? 'unknown'
    if (!byArchetype.has(k)) byArchetype.set(k, [])
    byArchetype.get(k)!.push(e)
  }

  const archetypeBreakdown: ArchetypeBreakdown[] = Array.from(byArchetype.entries())
    .map(([archetype, evals]) => {
      const scoreSum = evals.reduce((s, e) => s + (e.score ?? 0), 0)
      const scored = evals.filter(e => e.score != null).length
      // Cross-ref applications: any application linked to a job that matches a
      // company+role pair from these evals counts. We don't have a direct
      // FK between evaluations and applications today, so this is a best-effort
      // count by matching company.
      const matchedApps = applications.filter(a =>
        a.job_id && evals.some(e => e.id === a.job_id) // exact id match if linked
      )
      const aApplied = matchedApps.filter(a => a.status === 'applied').length
      const aInterview = matchedApps.filter(a => a.status === 'interview').length
      const aOffer = matchedApps.filter(a => a.status === 'offer').length

      return {
        archetype,
        evaluations: evals.length,
        averageScore: scored ? round2(scoreSum / scored) : 0,
        applied: aApplied,
        interview: aInterview,
        offer: aOffer,
        conversionRate: evals.length ? round2((aInterview + aOffer) / evals.length) : 0,
      }
    })
    .sort((a, b) => b.evaluations - a.evaluations)

  // Score distribution (3 buckets)
  const buckets: Record<ScoreBucket['bucket'], number[]> = { low: [], mid: [], high: [] }
  for (const e of evaluations) {
    if (e.score == null) continue
    if (e.score < 3) buckets.low.push(e.score)
    else if (e.score < 4) buckets.mid.push(e.score)
    else buckets.high.push(e.score)
  }
  const scoreDistribution: ScoreBucket[] = (['low', 'mid', 'high'] as const).map(b => ({
    bucket: b,
    count: buckets[b].length,
    averageScore: buckets[b].length
      ? round2(buckets[b].reduce((s, n) => s + n, 0) / buckets[b].length)
      : 0,
  }))

  // Legitimacy mix
  const legitimacyMix: LegitimacyMix = {
    high: evaluations.filter(e => e.legitimacy_tier === 'high').length,
    caution: evaluations.filter(e => e.legitimacy_tier === 'caution').length,
    suspicious: evaluations.filter(e => e.legitimacy_tier === 'suspicious').length,
    unknown: evaluations.filter(e => e.legitimacy_tier == null).length,
  }

  return {
    funnel,
    archetypeBreakdown,
    scoreDistribution,
    legitimacyMix,
    recommendations: buildRecommendations({
      total,
      funnel,
      archetypeBreakdown,
      scoreDistribution,
      legitimacyMix,
    }),
    generatedAt: new Date().toISOString(),
  }
}

interface RecoCtx {
  total: number
  funnel: PatternFunnel
  archetypeBreakdown: ArchetypeBreakdown[]
  scoreDistribution: ScoreBucket[]
  legitimacyMix: LegitimacyMix
}

function buildRecommendations(ctx: RecoCtx): Recommendation[] {
  const out: Recommendation[] = []

  // R1 — Apply rate is too low → user evaluates but doesn't pull the trigger
  if (ctx.total >= 5 && ctx.funnel.applyRate < 0.2) {
    out.push({
      severity: 'warning',
      title: 'You evaluate but rarely apply',
      body: `Only ${pct(ctx.funnel.applyRate)} of evaluated jobs converted to an application. ` +
        'If a JD scores 4.0+ and you trust the company, the eval has done its job — apply.',
    })
  }

  // R2 — Most evaluations are low-score (wasting LLM time + signal)
  const lowCount = ctx.scoreDistribution.find(s => s.bucket === 'low')?.count ?? 0
  if (ctx.total >= 5 && lowCount / ctx.total > 0.5) {
    out.push({
      severity: 'warning',
      title: 'Most JDs score below 3.0',
      body: `${lowCount}/${ctx.total} evaluations came back below 3.0/5. Either your search ` +
        'is too broad or the role-fit filters in /discover need tightening before you eval.',
    })
  }

  // R3 — One archetype is converting much better than the rest
  if (ctx.archetypeBreakdown.length >= 2) {
    const sorted = [...ctx.archetypeBreakdown].sort((a, b) => b.conversionRate - a.conversionRate)
    const best = sorted[0]
    const worst = sorted[sorted.length - 1]
    if (best.evaluations >= 3 && best.conversionRate >= 0.3 && best.conversionRate > worst.conversionRate + 0.2) {
      out.push({
        severity: 'info',
        title: `Double-down on ${best.archetype}`,
        body: `${best.archetype} converts at ${pct(best.conversionRate)} (interviews+offers / evals). ` +
          `${worst.archetype} is at ${pct(worst.conversionRate)}. Shift discovery toward ${best.archetype} roles.`,
      })
    }
  }

  // R4 — Lots of suspicious evals → user is browsing scam-heavy boards
  if (ctx.total >= 5 && ctx.legitimacyMix.suspicious / ctx.total > 0.2) {
    out.push({
      severity: 'critical',
      title: 'Too many suspicious postings',
      body: `${ctx.legitimacyMix.suspicious}/${ctx.total} evaluations flagged as suspicious. ` +
        'You are likely browsing aggregator boards that re-list ghost jobs. Switch to direct ATS portals (Greenhouse / Ashby / Lever).',
    })
  }

  // R5 — High applied count but no interviews → CV/resume is the bottleneck
  if (ctx.funnel.applied >= 5 && ctx.funnel.interviewRate < 0.1) {
    out.push({
      severity: 'critical',
      title: 'Applications going dark',
      body: `${ctx.funnel.applied} applications, only ${ctx.funnel.interview} interviews. ` +
        'The bottleneck is upstream of the interview — your resume or application channel is being filtered. ' +
        'Tailor the CV per JD using /resume + the AI bullet rewrite.',
    })
  }

  // Empty state — neutral nudge
  if (out.length === 0) {
    out.push({
      severity: 'info',
      title: 'Patterns look healthy',
      body: 'Keep evaluating. Patterns sharpen after ~10 applications and ~30 evaluations.',
    })
  }

  return out
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`
}
