import { JsonLd } from './JsonLd'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lakshya.app'

const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Lakshya',
  url: SITE,
  logo: `${SITE}/icon.png`,
  description: 'AI-powered job evaluation, tailored CVs, and archetype-driven career search built on the career-ops methodology.',
  sameAs: [
    'https://github.com/santifer/career-ops',
  ],
}

const website = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Lakshya',
  url: SITE,
  inLanguage: 'en',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

const softwareApp = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Lakshya',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'Paste a job description, get a 7-block A-G evaluation in 30 seconds — score, archetype fit, legitimacy, gaps, recommendations.',
  offers: [
    { '@type': 'Offer', name: 'Free',   price: '0',  priceCurrency: 'USD', description: '3 evaluations / month' },
    { '@type': 'Offer', name: 'Pro',    price: '19', priceCurrency: 'USD', description: '50 evaluations / month' },
    { '@type': 'Offer', name: 'Hunter', price: '49', priceCurrency: 'USD', description: '200 evaluations / month' },
    { '@type': 'Offer', name: 'BYOK',   price: '9',  priceCurrency: 'USD', description: 'Unlimited with your own API key' },
  ],
  aggregateRating: undefined,
}

export function RootSchemas() {
  return (
    <>
      <JsonLd data={organization} />
      <JsonLd data={website} />
      <JsonLd data={softwareApp} />
    </>
  )
}
