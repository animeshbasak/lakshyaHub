import type { ArchetypeGuide } from './ai-platform'

export const fullstackGuide: ArchetypeGuide = {
  slug: 'fullstack',
  archetype: 'fullstack',
  title: 'How to land a Full-Stack / Product Engineer role in 2026',
  metaDescription: 'A senior-IC playbook for landing Full-Stack / Product Engineer roles in 2026 — what hiring managers screen for at Linear / Vercel / Notion / Figma / startup-stage companies, the end-to-end loop, salary bands, and how to position breadth + depth on the career-ops A-G rubric.',
  tagline: 'Ship the whole feature. Backend through pixels.',
  publishedAt: '2026-04-25',
  updatedAt: '2026-04-25',

  intro: `
Full-Stack — sometimes branded "Product Engineer" at engineering-led shops — is the highest-leverage individual contributor role at the right company. You own a feature end-to-end: schema, API, frontend, observability, deploy, iteration. The bar is genuinely harder than backend OR frontend specialist roles because you have to maintain depth on both sides while moving fast on the seam between them.

In 2026 the labor market is sharply bifurcated. At engineering-led product companies (Linear, Vercel, Notion, Figma, smaller startups), Full-Stack / Product Engineer is the dominant senior-IC archetype and pays at the top of the market. At larger / more-specialized companies (FAANG, infra-heavy fintech), the role splits back into specialists and "fullstack" reads as junior-grade.

If you've shipped a feature where you owned schema design, API, UI, deploy, AND lived with the production consequences for at least 90 days, you're qualified. Lakshya's eval corpus has 220+ A-G evaluations against fullstack roles across 130 companies; the pattern that scores 4.0+ is the candidate who can articulate seam decisions explicitly.
  `.trim(),

  whoHires: [
    'Engineering-led product SaaS (Linear, Vercel, Figma, Notion, Asana, Monday, Pitch, Excalidraw)',
    'AI-native products (Cursor, Perplexity, Character.AI, Cohere consumer, Writer)',
    'Series A-D startups across verticals — fullstack is often the dominant IC role at this stage',
    'Devtools companies (GitHub, Sentry, Vercel, PostHog, Statsig)',
    'Smaller fintech where one engineer owns customer-facing surface end-to-end (Mercury smaller teams, Brex squads)',
  ],

  sections: [
    {
      heading: 'What this archetype actually does',
      body: `
Senior-IC Full-Stack / Product Engineer in 2026:

— **Feature ownership end-to-end.** Schema design, API shape, frontend implementation, deploy pipeline, telemetry instrumentation, customer-facing iteration. You\'re the single point of accountability for outcome.

— **Seam decisions.** When does state live on the server vs the client? When does a feature need its own service vs an extension of an existing one? When do you push complexity to the database vs application layer? Senior-IC bar: you can articulate the trade-off explicitly per decision, not just default-route everything.

— **Disciplined breadth.** You don\'t need to be world-class at every layer. You DO need to be senior-IC bar at one (typically backend or frontend, whichever you started in) and proficient in the other to a degree where you don\'t hand off implementation work to specialists.

— **API design as product work.** REST or GraphQL or RPC — you choose deliberately. Versioning, pagination, idempotency, error shapes you\'ve thought about. Your APIs survive being consumed by another team without breaking when you ship.

— **Database design for the actual workload.** Beyond ORM scaffolding. Indexes for the queries you actually run. Denormalization where read-heavy. Migrations that don\'t lock prod. The senior-IC differential: you\'ve owned a slow-query incident.

— **Frontend perf budget.** Even when you\'re backend-leaning, you understand LCP / CLS / INP and you don\'t casually break them. You\'ve fixed at least one perf regression that came from your own work.

— **Telemetry + iteration.** Every feature you ship has metrics. You read them. You iterate based on them. The 2026 senior-IC bar in product engineering: data-informed iteration, not just data-collected iteration.

— **Cross-disciplinary collaboration.** Pairing with PM on scope, design on edge cases, infra on deploy questions. Senior fullstack is half collaboration.

If you\'ve shipped 5-6 of these, you\'re at the senior-IC bar.
      `.trim(),
    },
    {
      heading: 'Why now (the 2026 fullstack market)',
      body: `
Three trends shape 2026 fullstack hiring:

— **AI tooling productivity gains favor fullstack.** Compresses bottom-50% of feature work (CRUD scaffolding, simple UIs, basic API endpoints). The seam decisions remain human-led. A senior fullstack who can use AI tooling for the rote work and judgment for the hard parts ships 3-4x faster than 2023 baseline. Companies with seat budgets are hiring fewer fullstack but at higher seniority.

— **Engineering-led shops dominate the senior-IC tier.** Linear, Vercel, Figma, Notion, Cursor — these companies are growing engineering headcount most aggressively in 2026 and the seat shape is overwhelmingly fullstack / product-engineer. If you target this tier you\'re competing for the most desirable IC seats in the market.

— **Generic "fullstack" at non-engineering-led companies is compressed.** Mid-tier B2B SaaS at non-engineering-led shops is hiring less aggressively post-2024-25 layoffs and AI tooling. If your background is generic fullstack at lower-tier shops, the 2026 path is to upgrade the company tier rather than chase senior comp at your current tier.
      `.trim(),
    },
    {
      heading: 'How to position your resume',
      body: `
Fullstack resumes get rejected most often on Block C ("operational specificity") and Block D ("trade-off articulation"). Below-4.0 patterns:

— **"Built X end-to-end" without depth.** Generic claims that imply breadth without surfacing any one decision the candidate actually owned. Reads as junior at scale.

— **Stack-tour resume.** "TypeScript, React, Next.js, Prisma, PostgreSQL, AWS." Catalog. Without scale numbers + trade-offs it reads as a tutorial-completion CV.

— **Backend or frontend bias unacknowledged.** Many fullstack resumes are backend-with-some-React or frontend-with-some-Node. Senior screeners want this acknowledged honestly so they can pattern-match correctly.

— **No DAU / scale numbers.** Without scale signal, fullstack work reads as side-project work.

Rewrite to surface:

— **Numbers that imply scale.** "Owned the share-link feature shipped to 110k DAU; designed schema, REST endpoints, React frontend, deployed via canary."
— **Trade-off explicitly named.** "Pushed comment-tree denormalization to write-time rather than read-time after RUM showed read-side query at p99 = 1.4s for trees > 50 nodes; accepted slight write-amplification cost for 80% read-latency improvement."
— **Failure modes you owned.** "Diagnosed N+1 query introduced by my own feature in a PR review I missed; designed query-batching helper that prevented the regression class across 8 endpoints."
— **Lean toward your strong side honestly.** "Backend-leaning fullstack — strong on schema + API; comfortable in React but defer to specialists for design-system work" sets honest expectations.

Lakshya\'s archetype detector classifies fullstack JDs only when they explicitly say "fullstack" or "product engineer" or "end-to-end" — JDs that lean backend or frontend resolve to those archetypes. If your resume is consistently classified as backend / frontend instead, your positioning is too lopsided for fullstack roles.
      `.trim(),
    },
  ],

  interviewLoop: [
    {
      stage: 'Recruiter screen',
      format: '20-30 min phone',
      signal: 'Logistics + comp + visa + which side are you stronger',
      prep: 'Pre-decide your "lean" answer. Be honest. Senior fullstack with self-awareness wins.',
    },
    {
      stage: 'Hiring manager call',
      format: '45-60 min',
      signal: 'Can you talk about an end-to-end feature with depth on both sides? Have you owned trade-offs?',
      prep: '2 stories of features you owned end-to-end. Pick ones with explicit seam decisions you can defend.',
    },
    {
      stage: 'Coding — practical',
      format: '60-90 min, often pair-programming',
      signal: 'Production-quality code on both sides. Naming, edge cases, tests, error handling.',
      prep: 'Practice 4 problem types: (1) implement a paginated API + matching React list with optimistic UI, (2) build a schema + API for a commenting system with N-deep nesting, (3) implement search with debounce + URL-state + server-rendered results, (4) write a polling-with-backoff hook + matching server endpoint with idempotency.',
    },
    {
      stage: 'System design — end-to-end',
      format: '60-90 min',
      signal: 'Can you architect a feature from schema through UI? Articulate trade-offs across the seam?',
      prep: 'Pre-draft 4 systems: (1) Linear-style issue tracker with real-time sync, (2) Stripe-style payment flow with webhook idempotency, (3) Notion-style document collaborative editing, (4) Vercel-style deploy preview system.',
    },
    {
      stage: 'Depth probe',
      format: '60 min',
      signal: 'Pick the side you said you were stronger on. Senior-IC bar on it specifically.',
      prep: 'Practice senior-IC backend OR frontend interviews per your lean. Don\'t pretend symmetry.',
    },
    {
      stage: 'Behavioral / values',
      format: '45 min',
      signal: 'Cross-disciplinary partnership, scope cuts, ambiguity, mentorship.',
      prep: '4 STAR+R stories — design partnership, PM disagreement on scope, customer escalation that became a roadmap signal, junior IC you mentored.',
    },
  ],

  skills: [
    {
      category: 'Required',
      skills: ['One strong backend language (Node/TS, Go, Python, Rust)', 'React + TypeScript at production', 'Postgres / MySQL fundamentals — indexes, transactions, query plans', 'REST or GraphQL API design + versioning + pagination', 'Build pipeline + deploy fluency', 'Observability — metrics + logs + traces, hands-on', 'Cross-disciplinary collaboration (design, PM)'],
    },
    {
      category: 'Preferred',
      skills: ['Multiple backend languages or polyglot signal', 'Modern React patterns (RSC, Suspense, streaming)', 'Database internals (MVCC, B-trees, write-ahead log) at intermediate depth', 'Real-user-monitoring hands-on', 'Feature-flag / A/B testing infrastructure', 'On-call ownership of features you shipped'],
    },
    {
      category: 'Bonus',
      skills: ['Author of a public RFC adopted by your team', 'Open-source contribution to a popular fullstack framework / lib', 'Live-talk on engineering blog or conference', 'Cross-platform experience (mobile + web)', 'Direct customer-facing time (sales calls, customer success rotations)'],
    },
  ],

  salaryBands: [
    { region: 'US (SF / NY)',     iC: '$170-260k',  staff: '$260-420k',  principal: '$420-700k+', source: 'levels.fyi 2026Q1, engineering-led product comp' },
    { region: 'US (Remote)',      iC: '$150-220k',  staff: '$220-340k',  principal: '$340-540k',  source: 'levels.fyi geo-adjusted fullstack' },
    { region: 'India (metro)',    iC: '₹30-55 LPA', staff: '₹55-110 LPA', principal: '₹110-220 LPA', source: 'levels.fyi India + Razorpay / Cred / Slice product engineer' },
    { region: 'Europe (London)',  iC: '£80-130k',   staff: '£130-200k',  principal: '£200-320k',  source: 'levels.fyi UK + Stripe London / Linear London' },
    { region: 'Europe (Berlin)',  iC: '€75-120k',   staff: '€120-180k',  principal: '€180-280k',  source: 'kununu + Pitch / N26 / Gitpod' },
  ],

  rejectionPatterns: [
    {
      pattern: '"Generic end-to-end claim"',
      why: 'Resume says "shipped X end-to-end" without naming any one trade-off. Senior screeners pattern-match to "candidate doesn\'t actually own decisions, just executes."',
      recovery: 'Pick 3 features per role. For each, surface: (a) the schema decision, (b) the API shape decision, (c) the UI seam. Trade-offs at each. Name what you optimized for and what you traded.',
    },
    {
      pattern: '"Lopsided fullstack"',
      why: 'Resume claims fullstack but body is 90% backend or 90% frontend. Senior screeners pattern-match to specialist applying to wrong archetype.',
      recovery: 'Be honest about your lean. "Backend-leaning fullstack" is a defensible position; "fullstack" with no UI work shipped recently is not. Apply to backend roles instead, or stretch on a side project for 8 weeks.',
    },
    {
      pattern: '"No telemetry / iteration story"',
      why: '2026 product-engineer bar increasingly screens for whether you read your own metrics post-ship. Resume features feature deliveries without iteration follow-up.',
      recovery: 'Add 1 bullet per role on iteration: "shipped X, monitored funnel, iterated to v2 based on Y signal, increased Z metric by N%." If you genuinely ship-and-leave at your current company, target a different role type or upgrade company tier.',
    },
    {
      pattern: '"Title-grade gap"',
      why: 'Senior or Staff title at smaller shop with lopsided / shallow fullstack work. Ships features but the seam decisions are absent.',
      recovery: 'Be honest about scope. Senior-IC at a 30-engineer company is fine; pretending it\'s Staff at a 300-engineer company through verbal gymnastics ages poorly in the loop.',
    },
  ],

  faq: [
    {
      q: 'Should I be a specialist or fullstack in 2026?',
      a: 'For senior-IC compensation at engineering-led product companies (Linear, Vercel, Notion): fullstack is the highest-leverage path. For senior-IC depth at FAANG or infra-heavy shops: pick a specialty (backend, frontend, mobile, SRE). Match the role to the company tier you target.',
    },
    {
      q: 'How do I pivot from backend or frontend to fullstack?',
      a: 'Ship one substantial cross-stack project at your current company before applying. The pattern: "I joined as a backend engineer; over 18 months I shipped 4 features that included the React UI and lived with them in production for 90+ days." That\'s the senior fullstack signal.',
    },
    {
      q: 'Is "Product Engineer" different from fullstack?',
      a: 'Same role with different framing. "Product Engineer" emphasizes product instinct + customer empathy on top of fullstack technical work. Engineering-led shops (Linear, Vercel, Figma) prefer this framing because it weights the iteration / data side. Apply to whichever framing the company uses.',
    },
    {
      q: 'Will agents replace fullstack?',
      a: 'Compresses bottom-50% (CRUD, simple feature scaffolding). Doesn\'t touch top-50% (seam decisions, trade-off articulation, schema-vs-API placement, telemetry-driven iteration). Senior IC fullstack gets MORE leveraged, not less, because agentic tooling amplifies the judgment work.',
    },
    {
      q: 'What\'s the realistic interview-to-offer ratio?',
      a: 'For senior fullstack with strong end-to-end stories: about 1 in 2-3 at top engineering-led shops, 1 in 1.5 at mid-tier startups. Volume of applications matters less than precision.',
    },
    {
      q: 'How does Lakshya help specifically for this archetype?',
      a: 'Three ways: (1) the archetype detector requires explicit fullstack signal — JDs that lean backend / frontend get classified accordingly, helping you target correctly. (2) The CV tailor surfaces seam decisions in your existing work without inventing trade-offs. (3) The story bank captures end-to-end-feature stories tagged "fullstack" — high reuse value because every loop probes seam decisions.',
    },
  ],
}
