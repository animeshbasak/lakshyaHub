/**
 * Curated list of public ATS portal slugs that we know respond on the
 * Greenhouse / Ashby / Lever public job-board APIs (zero auth, no rate
 * limits at our usage level, and Apify-free).
 *
 * Format: { slug, portal, company, country }
 *   - `slug` is the path segment used by the ATS API
 *   - `portal` selects the API parser
 *   - `country` lets the UI filter for Indian / global picks
 *
 * Stale slugs return [] gracefully (no crash). Verify before adding by
 * running `curl https://boards-api.greenhouse.io/v1/boards/<slug>/jobs`
 * (or the Ashby/Lever equivalent) and confirming JSON 200.
 *
 * Adding a portal is a 1-line change. Removing one is a 1-line change.
 * Companies hosting their boards on Workday / Taleo / iCIMS / SuccessFactors
 * are NOT in this list — those need scraping (Apify path) since they have
 * no public API.
 */

export type Portal = 'greenhouse' | 'ashby' | 'lever'

export interface PortalSeed {
  slug: string
  portal: Portal
  company: string
  country: 'IN' | 'GLOBAL'
  /** Top-level archetype hint so the UI can group results without a roundtrip. */
  hint?: 'ai-native' | 'fintech' | 'devtools' | 'social' | 'enterprise' | 'consumer'
}

export const PORTAL_SEEDS: PortalSeed[] = [
  // ── AI-native (global) ──────────────────────────────────────
  { slug: 'anthropic',       portal: 'greenhouse', company: 'Anthropic',     country: 'GLOBAL', hint: 'ai-native' },
  { slug: 'openai',          portal: 'greenhouse', company: 'OpenAI',        country: 'GLOBAL', hint: 'ai-native' },
  { slug: 'mistralai',       portal: 'ashby',      company: 'Mistral AI',    country: 'GLOBAL', hint: 'ai-native' },
  { slug: 'huggingface',     portal: 'lever',      company: 'Hugging Face',  country: 'GLOBAL', hint: 'ai-native' },
  { slug: 'perplexity',      portal: 'ashby',      company: 'Perplexity',    country: 'GLOBAL', hint: 'ai-native' },
  { slug: 'cohere',          portal: 'ashby',      company: 'Cohere',        country: 'GLOBAL', hint: 'ai-native' },
  { slug: 'inflection',      portal: 'ashby',      company: 'Inflection AI', country: 'GLOBAL', hint: 'ai-native' },
  { slug: 'character',       portal: 'lever',      company: 'Character.AI',  country: 'GLOBAL', hint: 'ai-native' },

  // ── Devtools / infra (global) ───────────────────────────────
  { slug: 'vercel',          portal: 'greenhouse', company: 'Vercel',        country: 'GLOBAL', hint: 'devtools' },
  { slug: 'sentry',          portal: 'lever',      company: 'Sentry',        country: 'GLOBAL', hint: 'devtools' },
  { slug: 'datadog',         portal: 'greenhouse', company: 'Datadog',       country: 'GLOBAL', hint: 'devtools' },
  { slug: 'cloudflare',      portal: 'greenhouse', company: 'Cloudflare',    country: 'GLOBAL', hint: 'devtools' },
  { slug: 'github',          portal: 'greenhouse', company: 'GitHub',        country: 'GLOBAL', hint: 'devtools' },
  { slug: 'linear',          portal: 'ashby',      company: 'Linear',        country: 'GLOBAL', hint: 'devtools' },
  { slug: 'supabase',        portal: 'ashby',      company: 'Supabase',      country: 'GLOBAL', hint: 'devtools' },
  { slug: 'planetscale',     portal: 'ashby',      company: 'PlanetScale',   country: 'GLOBAL', hint: 'devtools' },
  { slug: 'replit',          portal: 'ashby',      company: 'Replit',        country: 'GLOBAL', hint: 'devtools' },
  { slug: 'railway',         portal: 'ashby',      company: 'Railway',       country: 'GLOBAL', hint: 'devtools' },
  { slug: 'fly',             portal: 'ashby',      company: 'Fly.io',        country: 'GLOBAL', hint: 'devtools' },

  // ── Consumer / enterprise SaaS (global) ─────────────────────
  { slug: 'stripe',          portal: 'greenhouse', company: 'Stripe',        country: 'GLOBAL', hint: 'fintech' },
  { slug: 'notion',          portal: 'greenhouse', company: 'Notion',        country: 'GLOBAL', hint: 'consumer' },
  { slug: 'figma',           portal: 'greenhouse', company: 'Figma',         country: 'GLOBAL', hint: 'devtools' },
  { slug: 'airtable',        portal: 'greenhouse', company: 'Airtable',      country: 'GLOBAL', hint: 'consumer' },
  { slug: 'discord',         portal: 'greenhouse', company: 'Discord',       country: 'GLOBAL', hint: 'social' },
  { slug: 'reddit',          portal: 'greenhouse', company: 'Reddit',        country: 'GLOBAL', hint: 'social' },
  { slug: 'shopify',         portal: 'greenhouse', company: 'Shopify',       country: 'GLOBAL', hint: 'enterprise' },
  { slug: 'gitlab',          portal: 'greenhouse', company: 'GitLab',        country: 'GLOBAL', hint: 'devtools' },
  { slug: 'rippling',        portal: 'ashby',      company: 'Rippling',      country: 'GLOBAL', hint: 'enterprise' },
  { slug: 'ramp',            portal: 'ashby',      company: 'Ramp',          country: 'GLOBAL', hint: 'fintech' },
  { slug: 'mercury',         portal: 'ashby',      company: 'Mercury',       country: 'GLOBAL', hint: 'fintech' },

  // ── India-headquartered (where they use ATS APIs publicly) ──
  // Most Indian unicorns use Workday/Taleo so they're not here. Add as you
  // verify slugs against the public APIs (curl test).
  { slug: 'razorpaysoftware', portal: 'lever',     company: 'Razorpay',      country: 'IN',     hint: 'fintech' },
  { slug: 'crednxt',          portal: 'lever',     company: 'CRED',          country: 'IN',     hint: 'fintech' },
  { slug: 'zerodha',          portal: 'lever',     company: 'Zerodha',       country: 'IN',     hint: 'fintech' },
  { slug: 'browserstack',     portal: 'lever',     company: 'BrowserStack',  country: 'IN',     hint: 'devtools' },
  { slug: 'postman',          portal: 'lever',     company: 'Postman',       country: 'IN',     hint: 'devtools' },
  { slug: 'hasura',           portal: 'lever',     company: 'Hasura',        country: 'IN',     hint: 'devtools' },
  { slug: 'meesho',           portal: 'lever',     company: 'Meesho',        country: 'IN',     hint: 'consumer' },
]
