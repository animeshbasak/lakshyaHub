'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { TIERS, priceOf } from './tiers'
import type { Currency } from '@/lib/geo'

interface Props {
  defaultCurrency: Currency
  detectedRegion: 'IN' | 'US' | 'OTHER'
}

const CURRENCY_LABEL: Record<Currency, string> = {
  USD: 'USD',
  INR: 'INR',
}

export function PricingTable({ defaultCurrency, detectedRegion }: Props) {
  const [currency, setCurrency] = useState<Currency>(defaultCurrency)

  return (
    <>
      <div className="flex items-center justify-center mb-8 gap-3">
        <fieldset
          aria-label="Currency"
          className="inline-flex rounded-full border border-white/10 bg-white/[0.02] p-0.5"
        >
          {(['USD', 'INR'] as const).map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={currency === c}
              onClick={() => setCurrency(c)}
              className={`px-3 py-1.5 text-[12px] rounded-full transition-colors min-h-[32px] ${
                currency === c
                  ? 'bg-white text-[#07070b] font-medium'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {CURRENCY_LABEL[c]}
            </button>
          ))}
        </fieldset>
        {detectedRegion === 'IN' && currency === 'INR' && (
          <span className="text-[11px] text-text-2">Detected India · pricing in ₹</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TIERS.map((tier) => {
          const p = priceOf(tier.name, currency)
          return (
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
              <div className="flex items-baseline gap-1 mb-1" aria-label={p.ariaLabel}>
                <span className="text-3xl font-bold tabular-nums">{p.amount}</span>
                <span className="text-xs text-text-2">{p.period}</span>
              </div>
              <p className="text-xs text-text-2 mb-5">{tier.blurb}</p>
              <ul className="space-y-2 mb-6 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-white/85">
                    <Check size={14} className="mt-0.5 text-[color:var(--accent)] shrink-0" aria-hidden="true" />
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
          )
        })}
      </div>

      {currency === 'INR' && (
        <p className="mt-6 text-center text-[11px] text-text-2 max-w-2xl mx-auto leading-relaxed">
          INR pricing is PPP-adjusted, not a direct USD conversion. We bill via UPI / cards in INR
          for Indian customers. Switch back to USD any time.
        </p>
      )}
    </>
  )
}
