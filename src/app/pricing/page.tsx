import type { Metadata } from 'next'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Free 3 evals/mo · Pro $19 (50/mo) · Hunter $49 (200/mo) · BYOK $9 (unlimited with your own API key).',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Lakshya pricing',
    description: 'Free 3 evals/mo · Pro $19 · Hunter $49 · BYOK $9.',
  },
}

interface Tier {
  name: string
  price: string
  period: string
  blurb: string
  features: string[]
  cta: { label: string; href: string }
  highlight?: boolean
}

const TIERS: Tier[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    blurb: 'See if Lakshya fits your search.',
    features: [
      '3 A-G evaluations / month',
      'Tailored CV preview',
      'Archetype detection',
      'Single resume profile',
    ],
    cta: { label: 'Start free', href: '/login' },
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/mo',
    blurb: 'For active job hunts.',
    features: [
      '50 evaluations / month',
      'Tailored CV (HTML + LaTeX)',
      'Story bank (STAR+R)',
      'Public share pages',
      'Priority Claude routing',
    ],
    cta: { label: 'Start Pro', href: '/login?plan=pro' },
    highlight: true,
  },
  {
    name: 'Hunter',
    price: '$49',
    period: '/mo',
    blurb: 'When you mean business.',
    features: [
      '200 evaluations / month',
      'Auto-scan 20 portals nightly',
      'Liveness sweeps + cadence alerts',
      'Interview prep generator',
      'Priority support',
    ],
    cta: { label: 'Start Hunter', href: '/login?plan=hunter' },
  },
  {
    name: 'BYOK',
    price: '$9',
    period: '/mo',
    blurb: 'Bring your own API key.',
    features: [
      'Unlimited evaluations',
      'Use your Anthropic / Gemini key',
      'Encrypted at rest (AES-GCM)',
      'No proxy markup',
      'For power users',
    ],
    cta: { label: 'Start BYOK', href: '/login?plan=byok' },
  },
]

const FAQS = [
  {
    q: 'How many evaluations do I get on Free?',
    a: '3 per calendar month. Resets on the first of each month. No credit card required.',
  },
  {
    q: 'Can I upgrade or downgrade mid-cycle?',
    a: 'Yes. Upgrades prorate immediately. Downgrades take effect at the next billing cycle so you keep what you paid for.',
  },
  {
    q: 'Can I bring my own API key?',
    a: 'Yes — the BYOK plan is $9/mo for unlimited evaluations using your own Anthropic or Gemini key. Keys are encrypted at rest with AES-GCM and never logged.',
  },
  {
    q: 'How does Lakshya differ from Teal, Huntr, or Jobscan?',
    a: 'Lakshya runs the career-ops 7-block A-G evaluator (740+ real evals) — a full structured verdict on whether a job is worth applying to, with legitimacy detection and archetype classification. Other tools track applications or score ATS keywords; we tell you the answer.',
  },
  {
    q: 'Is there a student or open-source maintainer discount?',
    a: 'Yes — email us with proof of enrollment or a public open-source profile. We waive Pro for active students and OSS maintainers contributing to AI/dev-tools repos.',
  },
  {
    q: 'How do I cancel?',
    a: 'One click in /profile. No cancellation fees, no retention spam. You keep access until the end of your billing period.',
  },
]

export default function PricingPage() {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <main className="min-h-screen bg-[#07070b] text-white">
      <JsonLd data={faqLd} />

      <header className="border-b border-white/5 px-4 py-4 md:px-8">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold tracking-tight text-white hover:text-white/80">
            Lakshya
          </Link>
          <Link href="/login" className="text-xs text-text-2 hover:text-white">Sign in</Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-20">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-text-2 mb-3">Pricing</p>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
            Aim before you apply.
          </h1>
          <p className="text-sm md:text-base text-text-2 max-w-xl mx-auto">
            Free for casual hunts. Pro for active searches. Hunter for serious operators.
            BYOK if you&apos;d rather use your own API key.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIERS.map((tier) => (
            <article
              key={tier.name}
              className={`rounded-2xl p-5 md:p-6 flex flex-col border ${
                tier.highlight
                  ? 'border-[color:var(--accent)]/40 bg-[color:var(--accent)]/[0.04]'
                  : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              {tier.highlight && (
                <span className="self-start mb-2 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest bg-[color:var(--accent)]/15 text-[color:var(--accent)] border border-[color:var(--accent)]/30">
                  Most popular
                </span>
              )}
              <h2 className="text-lg font-semibold mb-1">{tier.name}</h2>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold tabular-nums">{tier.price}</span>
                <span className="text-xs text-text-2">{tier.period}</span>
              </div>
              <p className="text-xs text-text-2 mb-5">{tier.blurb}</p>
              <ul className="space-y-2 mb-6 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-white/85">
                    <Check size={14} className="mt-0.5 text-[color:var(--accent)] shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={tier.cta.href}
                className={`inline-flex items-center justify-center px-3 py-2.5 rounded-lg text-xs font-medium transition-colors min-h-[44px] ${
                  tier.highlight
                    ? 'bg-white text-[#07070b] hover:bg-white/90'
                    : 'border border-white/15 text-white hover:border-white/30'
                }`}
              >
                {tier.cta.label}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 pb-20 md:px-6">
        <h2 className="text-xl md:text-2xl font-semibold mb-6">FAQ</h2>
        <dl className="space-y-4">
          {FAQS.map((f) => (
            <div key={f.q} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 md:p-5">
              <dt className="text-sm font-semibold text-white">{f.q}</dt>
              <dd className="mt-2 text-[13px] text-text-2 leading-relaxed">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className="border-t border-white/5 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-5xl flex flex-wrap items-center justify-between gap-3 text-[11px] text-text-2">
          <span>
            Built on{' '}
            <a
              className="underline underline-offset-2 hover:text-white"
              href="https://github.com/santifer/career-ops"
              target="_blank"
              rel="noreferrer noopener"
            >
              career-ops
            </a>{' '}
            (santifer, MIT)
          </span>
          <Link href="/about" className="hover:text-white">About</Link>
        </div>
      </footer>
    </main>
  )
}
