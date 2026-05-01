import type { Metadata } from 'next'
import { JsonLd } from '@/components/seo/JsonLd'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { PricingTable } from './PricingTable.client'
import { FAQS } from './tiers'
import { detectDefaultCurrency, detectRegion } from '@/lib/geo'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Free 3 evals/mo · Pro $19 / ₹499 (50/mo) · Hunter $49 / ₹1,299 (200/mo) · BYOK $9 / ₹229 (unlimited with your own API key). PPP-adjusted INR pricing for India.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Lakshya pricing',
    description: 'Free 3 evals/mo · Pro $19 (₹499) · Hunter $49 (₹1,299) · BYOK $9 (₹229).',
  },
}

export default async function PricingPage() {
  const [currency, region] = await Promise.all([
    detectDefaultCurrency(),
    detectRegion(),
  ])

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
    <main className="min-h-screen bg-[#07070b] text-white flex flex-col">
      <JsonLd data={faqLd} />

      <MarketingHeader active="pricing" />

      <section className="mx-auto w-full max-w-5xl px-4 py-12 md:px-6 md:py-20 flex-1">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-text-2 mb-3">Pricing</p>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
            Aim before you apply.
          </h1>
          <p className="text-sm md:text-base text-text-2 max-w-xl mx-auto">
            Free for casual hunts. Pro for active searches. Hunter for serious operators.
            BYOK if you&apos;d rather use your own API key.
          </p>
        </div>

        <PricingTable defaultCurrency={currency} detectedRegion={region} />
      </section>

      <section className="mx-auto w-full max-w-2xl px-4 pb-20 md:px-6">
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
          <span>Lakshya v0.9</span>
        </div>
      </footer>
    </main>
  )
}
