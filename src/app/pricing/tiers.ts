import type { Currency } from '@/lib/geo'

export interface Tier {
  name: 'Free' | 'Pro' | 'Hunter' | 'BYOK'
  blurb: string
  features: string[]
  cta: { label: string; href: string }
  highlight?: boolean
}

interface Price {
  amount: string
  period: string
  ariaLabel: string
}

const PRICES: Record<Tier['name'], Record<Currency, Price>> = {
  Free: {
    USD: { amount: '$0',     period: '/mo', ariaLabel: 'Free plan, zero US dollars per month' },
    INR: { amount: '₹0',     period: '/mo', ariaLabel: 'Free plan, zero Indian rupees per month' },
  },
  Pro: {
    USD: { amount: '$19',    period: '/mo', ariaLabel: '19 US dollars per month' },
    INR: { amount: '₹499',   period: '/mo', ariaLabel: '499 Indian rupees per month' },
  },
  Hunter: {
    USD: { amount: '$49',    period: '/mo', ariaLabel: '49 US dollars per month' },
    INR: { amount: '₹1,299', period: '/mo', ariaLabel: '1,299 Indian rupees per month' },
  },
  BYOK: {
    USD: { amount: '$9',     period: '/mo', ariaLabel: '9 US dollars per month' },
    INR: { amount: '₹229',   period: '/mo', ariaLabel: '229 Indian rupees per month' },
  },
}

export function priceOf(tier: Tier['name'], currency: Currency): Price {
  return PRICES[tier][currency]
}

export const TIERS: Tier[] = [
  {
    name: 'Free',
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

export const FAQS = [
  {
    q: 'How many evaluations do I get on Free?',
    a: '3 per calendar month. Resets on the first of each month. No credit card required.',
  },
  {
    q: 'Are prices in INR for India?',
    a: 'Yes — pricing is automatically shown in INR for visitors from India and other South-Asian locales. You can switch currency manually with the toggle on the pricing page. INR pricing reflects PPP, not direct conversion: Pro is ₹499/mo (a fair AI-tool tier in India), not the ~₹1,600 a 1:1 conversion would imply.',
  },
  {
    q: 'Can I upgrade or downgrade mid-cycle?',
    a: 'Yes. Upgrades prorate immediately. Downgrades take effect at the next billing cycle so you keep what you paid for.',
  },
  {
    q: 'Can I bring my own API key?',
    a: 'Yes — the BYOK plan is $9/mo (or ₹229/mo) for unlimited evaluations using your own Anthropic or Gemini key. Keys are encrypted at rest with AES-GCM and never logged.',
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
