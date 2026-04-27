import { ArrowUpRight, Mail } from 'lucide-react'
import { detectRegion } from '@/lib/geo'

interface Props {
  score: number | null
}

interface ResolvedPayment {
  url: string
  label: string
  currency: 'INR' | 'USD'
}

/**
 * Upgrade CTA on /eval/[id] — three modes, picked by env vars:
 *
 * 1. Beta-validation mode (default — both NEXT_PUBLIC_PAYMENT_LINK_* unset):
 *    Renders an "Interested in unlimited evals?" mailto CTA. Captures WTP
 *    signal as inbound email — zero billing infra needed. Use this until
 *    you've seen ≥5 paid-intent emails, then register Razorpay/Lemon Squeezy
 *    and flip the env vars.
 *
 * 2. Region-aware billing mode (one or both NEXT_PUBLIC_PAYMENT_LINK_*):
 *    India users see the IN link, everyone else sees the GLOBAL link. Falls
 *    back across regions if only one is configured. Legacy
 *    NEXT_PUBLIC_STRIPE_PAYMENT_LINK still works as a single global link.
 *
 * 3. Hidden mode (NEXT_PUBLIC_UPGRADE_CTA_DISABLE=1):
 *    Returns null entirely. Nuclear option for paid users / public share pages.
 *
 * Visibility threshold: NEXT_PUBLIC_UPGRADE_CTA_MAX_SCORE (default 5.0,
 * always shows). Set to 4.0 to gate to low-tier evals only.
 */
async function resolvePayment(): Promise<ResolvedPayment | null> {
  const linkIn = process.env.NEXT_PUBLIC_PAYMENT_LINK_IN
  const linkGlobal = process.env.NEXT_PUBLIC_PAYMENT_LINK_GLOBAL
  const linkLegacy = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK

  const region = await detectRegion()
  const wantsIN = region === 'IN'

  if (wantsIN && linkIn) return { url: linkIn, label: 'UPI / cards (India)', currency: 'INR' }
  if (!wantsIN && linkGlobal) return { url: linkGlobal, label: 'Cards (global)', currency: 'USD' }
  if (linkLegacy) return { url: linkLegacy, label: 'Cards', currency: 'USD' }
  if (wantsIN && linkGlobal) return { url: linkGlobal, label: 'Cards (USD checkout)', currency: 'USD' }
  return null
}

export async function UpgradeCta({ score }: Props) {
  if (process.env.NEXT_PUBLIC_UPGRADE_CTA_DISABLE === '1') return null

  const threshold = parseFloat(process.env.NEXT_PUBLIC_UPGRADE_CTA_MAX_SCORE ?? '5.0')
  if (score != null && score > threshold) return null

  const payment = await resolvePayment()

  // Beta-validation mode — no payment provider configured yet.
  // Show a mailto CTA so interested users self-identify.
  if (!payment) {
    const inbox = process.env.NEXT_PUBLIC_BETA_INTEREST_EMAIL ?? 'animeshsbasak@gmail.com'
    const subject = encodeURIComponent('Lakshya — interested in unlimited evals')
    const body = encodeURIComponent(
      'Hi — I just used Lakshya and would pay for unlimited evals + full report exports. Please let me know when paid plans launch.\n\n— '
    )
    return (
      <section
        aria-label="Beta interest"
        className="rounded-2xl border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/[0.06] p-5"
      >
        <h2 className="text-base font-semibold text-white">
          Like what you got? Help me decide what to build next.
        </h2>
        <p className="text-sm text-text-2 mt-1">
          Lakshya is in free beta. If unlimited evals + full report exports
          would be worth paying for, drop a note — I&apos;ll skip the Stripe
          rabbit hole until the signal&apos;s clear.
        </p>
        <a
          href={`mailto:${inbox}?subject=${subject}&body=${body}`}
          className="mt-3 inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-lg bg-[color:var(--accent)] text-black text-sm font-medium hover:opacity-90"
        >
          <Mail className="w-4 h-4" aria-hidden="true" />
          I&apos;d pay for this
        </a>
      </section>
    )
  }

  const priceCopy = payment.currency === 'INR'
    ? '₹1,499/mo · UPI / cards'
    : '$19/mo · cards'

  return (
    <section
      aria-label="Upgrade prompt"
      className="rounded-2xl border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/[0.06] p-5"
    >
      <h2 className="text-base font-semibold text-white">
        Get unlimited evaluations
      </h2>
      <p className="text-sm text-text-2 mt-1">
        Free plan: 3 evals/month. Pro: unlimited evals, full report exports,
        and priority provider routing — for the price of one bad application.
      </p>
      <a
        href={payment.url}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-3 inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-lg bg-[color:var(--accent)] text-black text-sm font-medium hover:opacity-90"
        title={payment.label}
      >
        Upgrade to Pro · {priceCopy}
        <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
      </a>
    </section>
  )
}
