/**
 * ScoreHero — top-of-page summary for /eval/[id].
 *
 * Layout spec (per UI design review fix #3):
 *   Desktop:
 *     - Score ring 120×120, score number 3xl bold centered
 *     - Company role on right, xl
 *     - Archetype badge + legitimacy pill inline, sm
 *     - "Recommendation" CTA full-width below
 *   Mobile (< 640px):
 *     - Stack: ring 80×80 first, role/company below, badges below, CTA last
 *     - Touch targets ≥ 44px
 */

interface Props {
  evaluation: {
    company: string | null
    role: string | null
    archetype: string | null
    score: number | null
    legitimacy_tier: 'high' | 'caution' | 'suspicious' | null
    jd_url: string | null
  }
}

const RING_DIAMETER_DESKTOP = 120
const RING_DIAMETER_MOBILE = 80
const STROKE = 8
const MAX_SCORE = 5

function tierFromScore(score: number | null): 'high' | 'mid' | 'low' {
  if (score == null) return 'low'
  if (score >= 4.0) return 'high'
  if (score >= 3.0) return 'mid'
  return 'low'
}

function ScoreRing({ score, mobile }: { score: number | null; mobile?: boolean }) {
  const d = mobile ? RING_DIAMETER_MOBILE : RING_DIAMETER_DESKTOP
  const r = (d - STROKE) / 2
  const circ = 2 * Math.PI * r
  const fill = score ? Math.min(score / MAX_SCORE, 1) : 0
  const offset = circ - fill * circ
  const tier = tierFromScore(score)
  const stroke =
    tier === 'high' ? 'var(--tier-high)' :
    tier === 'mid'  ? 'var(--tier-mid)'  :
                      'var(--tier-low)'

  return (
    <div className="relative" style={{ width: d, height: d }}>
      <svg width={d} height={d} aria-hidden="true">
        <circle cx={d/2} cy={d/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={STROKE} />
        <circle
          cx={d/2} cy={d/2} r={r} fill="none"
          stroke={stroke}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${d/2} ${d/2})`}
        />
      </svg>
      <div className={`absolute inset-0 flex flex-col items-center justify-center ${mobile ? 'text-2xl' : 'text-3xl'} font-bold tabular-nums text-white`}>
        {score != null ? score.toFixed(1) : '—'}
        <span className="text-[10px] font-medium opacity-50 -mt-1">/ {MAX_SCORE}</span>
      </div>
    </div>
  )
}

function LegitimacyPill({ tier }: { tier: 'high' | 'caution' | 'suspicious' | null }) {
  if (!tier) return null
  const palette: Record<string, string> = {
    high:       'bg-[color:var(--tier-high-dim)] text-[color:var(--tier-high)] border-[color:var(--tier-high)]/20',
    caution:    'bg-[color:var(--tier-mid-dim)]  text-[color:var(--tier-mid)]  border-[color:var(--tier-mid)]/20',
    suspicious: 'bg-[color:var(--tier-low-dim)]  text-[color:var(--tier-low)]  border-[color:var(--tier-low)]/30',
  }
  const label =
    tier === 'high'       ? 'Legit · high confidence' :
    tier === 'caution'    ? 'Legit · caution'         :
                            'Likely scam · review carefully'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${palette[tier]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}

export function ScoreHero({ evaluation }: Props) {
  const tier = tierFromScore(evaluation.score)
  const ctaCopy =
    tier === 'high' ? 'Strong fit — apply with tailored CV' :
    tier === 'mid'  ? 'Decent fit — review block C and D before applying' :
                      'Score below 4.0/5 — career-ops rule says don\'t apply'

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-8" aria-label="Evaluation summary">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8 sm:items-start">
        <div className="hidden sm:block"><ScoreRing score={evaluation.score} /></div>
        <div className="sm:hidden"><ScoreRing score={evaluation.score} mobile /></div>

        <div className="flex-1 text-center sm:text-left min-w-0">
          <p className="text-xs uppercase tracking-widest text-text-2 mb-1">Evaluated</p>
          <h1 className="text-xl md:text-2xl font-semibold text-white leading-tight break-words">
            {evaluation.role ?? 'Unknown role'}
            {evaluation.company && (
              <span className="block text-base md:text-lg text-white/60 font-normal mt-1">
                at {evaluation.company}
              </span>
            )}
          </h1>

          <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {evaluation.archetype && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[color:var(--accent)]/10 border border-[color:var(--accent)]/20 text-[11px] font-medium text-[color:var(--accent)]">
                {evaluation.archetype}
              </span>
            )}
            <LegitimacyPill tier={evaluation.legitimacy_tier} />
          </div>
        </div>
      </div>

      <div className={`mt-6 rounded-lg border p-3 text-sm ${
        tier === 'high' ? 'border-[color:var(--tier-high)]/20 bg-[color:var(--tier-high-dim)] text-[color:var(--tier-high)]' :
        tier === 'mid'  ? 'border-[color:var(--tier-mid)]/20  bg-[color:var(--tier-mid-dim)]  text-[color:var(--tier-mid)]'  :
                          'border-[color:var(--tier-low)]/30  bg-[color:var(--tier-low-dim)]  text-[color:var(--tier-low)]'
      }`}>
        {ctaCopy}
      </div>

      {evaluation.jd_url && (
        <a
          href={evaluation.jd_url}
          target="_blank"
          rel="noreferrer noopener nofollow"
          className="mt-4 inline-flex items-center justify-center w-full sm:w-auto px-4 py-2.5 rounded-lg border border-white/10 text-xs text-white/70 hover:text-white hover:border-white/30 transition-colors min-h-[44px]"
        >
          View original posting →
        </a>
      )}
    </section>
  )
}
