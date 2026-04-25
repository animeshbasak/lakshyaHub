import { ArrowUpRight } from 'lucide-react'

interface Props {
  score: number | null
}

/**
 * GTM hook: nudge upgrade on the eval result page.
 *
 * Renders ONLY when:
 *   - NEXT_PUBLIC_STRIPE_PAYMENT_LINK env var is set (so adding the URL is a
 *     1-line config change, no code deploy)
 *   - eval score is below the threshold (default: any non-null score; can
 *     be tightened via NEXT_PUBLIC_UPGRADE_CTA_MAX_SCORE env)
 *
 * Returns null otherwise — zero footprint when not configured.
 */
export function UpgradeCta({ score }: Props) {
  const link = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK
  if (!link) return null

  const threshold = parseFloat(process.env.NEXT_PUBLIC_UPGRADE_CTA_MAX_SCORE ?? '5.0')
  if (score != null && score > threshold) return null

  return (
    <section
      aria-label="Upgrade prompt"
      className="rounded-2xl border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/[0.06] p-5"
    >
      <h2 className="text-base font-semibold text-white">
        Get unlimited evaluations
      </h2>
      <p className="text-sm text-text-2 mt-1">
        Free plan: 3 evals/month. Pro: unlimited evals, full report exports, and
        priority provider routing — for the price of one bad application.
      </p>
      <a
        href={link}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-3 inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-lg bg-[color:var(--accent)] text-black text-sm font-medium hover:opacity-90"
      >
        Upgrade to Pro
        <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
      </a>
    </section>
  )
}
