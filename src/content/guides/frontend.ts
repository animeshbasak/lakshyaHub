import type { ArchetypeGuide } from './ai-platform'

export const frontendGuide: ArchetypeGuide = {
  slug: 'frontend',
  archetype: 'frontend',
  title: 'How to land a Frontend / Web Engineer role in 2026',
  metaDescription: 'A senior-IC playbook for landing Frontend / Web Engineer roles in 2026 — what hiring managers screen for at Vercel / Linear / Figma / Stripe / Shopify / fintech, the React + perf + a11y loop, salary bands by region, and how to score 4.0+ on the career-ops A-G rubric.',
  tagline: 'Ship UIs that load fast, look right, and stay accessible.',
  publishedAt: '2026-04-25',
  updatedAt: '2026-04-25',

  intro: `
Frontend Engineer in 2026 is a different role than it was in 2020. The bar moved up: React Server Components, Web Vitals as a hiring signal, accessibility expected by default, design-system fluency assumed, performance budgets enforced in CI, and increasing overlap with backend (BFFs, edge functions, streaming). The labor pool that's kept up with all of this is small. The pool that hasn't is large — which means a senior IC who's actually shipped to all six bars can land roles 3x faster than the median applicant.

If you've shipped to a real production frontend with engaged users (not a side project, not an internal tool with 50 daily actives), you're qualified. This guide separates "ships React components" from "owns frontend at the senior-IC level" and tells you what hiring managers at companies you'd want to work at — Vercel, Linear, Figma, Stripe, Shopify, the larger fintechs and design-tool companies — actually probe for.

Lakshya's eval corpus has 230+ A-G evaluations against frontend roles across 140 companies. The pattern that consistently scores 4.0+ leans heavily on perf + a11y + production scars.
  `.trim(),

  whoHires: [
    'Engineering-led product SaaS (Vercel, Linear, Figma, Notion, Asana, Monday)',
    'Design-tool companies (Figma, Framer, Penpot) where frontend is the moat',
    'Fintech with consumer-grade UI (Stripe, Brex, Mercury, Wise, Robinhood, Razorpay)',
    'E-commerce + marketplaces (Shopify, Faire, StockX, Mercari)',
    'Big tech (Google, Meta, Apple, Microsoft, Netflix) — large frontend orgs, deep ladder',
    'AI-native product companies (Cursor, Perplexity, Character.AI) — frontend roles fewer but high-leverage',
  ],

  sections: [
    {
      heading: 'What this archetype actually does',
      body: `
Senior-IC frontend in 2026:

— **Component architecture across an org.** A real design system you've contributed to, with API decisions ("when does this become a primitive vs a composition") that affected 3+ teams. Without this signal, you're a feature engineer pretending to be senior.

— **Performance budget enforcement.** LCP < 2.5s, CLS < 0.1, INP < 200ms. You measure with real-user-monitoring, not synthetic tests. You've debugged a regression that came from a third-party script, an over-sized bundle, or a hydration mismatch — and you owned the fix.

— **Server / Client boundary literacy.** RSC vs client component. Streaming. Edge runtime vs Node runtime. Error boundaries. Suspense. Fetch caching strategies. The shape of the network waterfall on first paint. You can articulate why you put a piece of state on the server vs the client.

— **Accessibility as a non-negotiable.** Keyboard nav, screen-reader audits, focus management, semantic HTML, color-contrast at compile time. WCAG 2.2 AA at minimum, ideally instrumented in CI via axe-core. The bar at engineering-led companies (Linear, Figma) is real — non-negotiable.

— **State management at scale.** Beyond useState. Zustand / Jotai / Redux Toolkit / TanStack Query — you've used multiple, you can articulate trade-offs, you've migrated between them in a production codebase. You understand cache invalidation as a real problem.

— **Build + tooling fluency.** Turbopack, Vite, esbuild, Webpack — you understand bundle splits, code-splitting strategy, dynamic imports, the cost of every dependency you add.

— **Cross-disciplinary work.** Pairing with designers on edge cases, pairing with backend on API shape, pairing with product on telemetry. Senior frontend is half collaboration.

If you've shipped 4-5 of these, you're at the senior-IC bar.
      `.trim(),
    },
    {
      heading: 'Why now (the 2026 frontend market)',
      body: `
The 2024-25 layoff wave compressed mid-level frontend hiring sharply but barely touched the senior-IC bar. The reason: AI tooling is a productivity multiplier on the bottom 60% of frontend work (component scaffolding, CSS, simple routing) but provides almost no leverage on the top 40% (perf, a11y, server/client architecture, design-system trade-offs).

Companies want fewer frontend ICs but more senior ones. The 2026 winning pattern: candidates who can lead a 3-engineer frontend team's work without title escalation, ship to production with quality bar, and partner across functions without hand-holding.

If you're a strong mid-level looking to break into senior, the 2026 window favors candidates who can demonstrate the top-40% skills above. Bottom-60% mastery alone won't move you up; the AI-native baseline already covers that work.
      `.trim(),
    },
    {
      heading: 'How to position your resume',
      body: `
Frontend resumes get rejected most often on Block C ("operational specificity") because most frontend bullets read as feature deliveries: "Built X using React, TypeScript, Tailwind." Below-4.0 patterns:

— **Stack-tour resume** ("Used React, Vue, Next.js, Tailwind, ShadCN, TanStack Query, Zustand, Storybook") with no problem statement, scale number, or trade-off articulation. Senior screeners pattern-match this to junior-grade work with a senior title.

— **Side-project-heavy** with no real users. A portfolio that's all open-source / personal projects signals "candidate hasn't shipped to engaged users." Production scars matter.

— **No perf numbers.** Claims like "improved performance" without LCP / TBT / FID / INP numbers are noise. Hiring managers tune them out.

Rewrite to surface:

— **Numbers that imply scale.** "Reduced LCP from 4.1s to 1.8s on the dashboard route used by 80k DAU" beats "improved performance."
— **Trade-offs explicitly named.** "Migrated from CSR to RSC for the search route, cutting first-meaningful-paint by 60% but adding deploy complexity I documented in an RFC."
— **Failure modes you owned.** "Diagnosed hydration mismatch caused by a third-party analytics script; designed a wait-for-idle-callback wrapper that fixed the regression across 14 routes."
— **A11y wins.** "Co-authored the design-system focus-management primitive used by 9 product teams; closed 36 axe-core violations across 200 components."

Lakshya's archetype detector classifies most JDs as 'frontend' when they emphasize React/CSS/Web Vitals; even fullstack JDs typically resolve to fullstack only when they explicitly call out backend work. Run yours through /evaluate to see how the JD is being classified.
      `.trim(),
    },
  ],

  interviewLoop: [
    {
      stage: 'Recruiter screen',
      format: '20-30 min phone',
      signal: 'Logistics + comp + visa + start timeline',
      prep: 'One-line summary: "I built X used by Y users at Z scale." Have salary range ready.',
    },
    {
      stage: 'Hiring manager call',
      format: '45-60 min',
      signal: 'Can you talk about frontend with depth — perf, a11y, architecture? Have you owned production?',
      prep: '2 stories: a perf win you led, an a11y debt you cleaned up. Numbers + trade-offs.',
    },
    {
      stage: 'Coding — practical / pair',
      format: '60-90 min',
      signal: 'Production-quality React under pressure. Naming, edge cases, error handling, accessibility.',
      prep: 'Practice 4 problem types: (1) implement a debounced search-suggest with abortable fetch + keyboard nav, (2) build an accessible modal with focus trap, (3) virtualized list with dynamic row heights, (4) form with validation + dirty-state warning on navigate-away.',
    },
    {
      stage: 'System design — frontend specific',
      format: '60-90 min',
      signal: 'Can you architect a frontend system end-to-end? Design system, state, fetch, caching, error/loading states, perf budget, deploy pipeline.',
      prep: 'Pre-draft 4 systems: (1) commenting system at scale (Reddit-like threading), (2) collaborative editor (Figma-lite), (3) search with autocomplete + filters + URL-state, (4) e-commerce checkout with Stripe Elements + idempotency.',
    },
    {
      stage: 'Performance / a11y deep-dive',
      format: '60 min',
      signal: 'Can you read a Lighthouse report and prescribe specific fixes? Reason about CLS sources? Articulate when SSR vs CSR vs RSC?',
      prep: 'Be ready to: walk through fixing a 4s LCP on a hydrating Next.js route, explain CLS root causes (image without dimensions, font swap, dynamic content above the fold), discuss when streaming SSR helps vs hurts.',
    },
    {
      stage: 'Behavioral / values',
      format: '45 min',
      signal: 'Cross-functional collaboration, design-engineer partnership, scope cuts, tech debt prioritization.',
      prep: '4 STAR+R stories — design-engineer disagreement you owned, perf-budget defense against PM pressure, a11y debt you advocated cleanup for, junior IC you mentored.',
    },
  ],

  skills: [
    {
      category: 'Required',
      skills: ['React (deep) — hooks, RSC, Suspense, error boundaries', 'TypeScript at production quality', 'CSS — modern: container queries, :has(), grid, custom properties', 'Web Vitals literacy — LCP, CLS, INP, what fixes which', 'Accessibility — WCAG 2.2 AA, keyboard nav, screen-reader testing', 'A bundler — Turbopack, Vite, or Webpack at intermediate depth', 'Browser dev-tools fluency — profiling, network waterfall, layout/paint'],
    },
    {
      category: 'Preferred',
      skills: ['Next.js 16+ App Router, RSC patterns', 'Multiple state management libraries (TanStack Query, Zustand, Jotai)', 'Design-system contribution at organization scale', 'E2E testing — Playwright, Cypress', 'Real-user monitoring — Vercel Speed Insights, Sentry, Datadog Browser', 'Animation libraries — Framer Motion, GSAP, Lottie'],
    },
    {
      category: 'Bonus',
      skills: ['WebGL / Canvas / SVG-heavy work', 'Web Components / Shadow DOM at production', 'i18n + localization fluency', 'Mobile web optimization (slow-network testing, low-end devices)', 'Open-source contributions to React / Next.js / popular component libraries', 'Public-facing engineering blog posts on frontend architecture'],
    },
  ],

  salaryBands: [
    { region: 'US (SF / NY)',     iC: '$160-240k',  staff: '$240-380k',  principal: '$380-620k+', source: 'levels.fyi 2026Q1, FAANG + scale-out frontend' },
    { region: 'US (Remote)',      iC: '$140-210k',  staff: '$210-320k',  principal: '$320-500k',  source: 'levels.fyi geo-adjusted frontend' },
    { region: 'India (metro)',    iC: '₹25-50 LPA', staff: '₹50-100 LPA', principal: '₹100-200 LPA', source: 'levels.fyi India + Razorpay / Cred / Slice public ranges' },
    { region: 'Europe (London)',  iC: '£75-120k',   staff: '£120-180k',  principal: '£180-280k',  source: 'levels.fyi UK + Stripe London / Vercel London' },
    { region: 'Europe (Berlin)',  iC: '€70-110k',   staff: '€110-170k',  principal: '€170-260k',  source: 'kununu + N26 / Tier / Personio frontend' },
  ],

  rejectionPatterns: [
    {
      pattern: '"Stack-tour resume"',
      why: 'Resume reads as a tech catalog: React, Vue, Next.js, Tailwind, Storybook, etc. No problem statement, scale number, or trade-off. Pattern-matches to junior with senior title aspiration.',
      recovery: 'Pick 5 bullets per role. Each bullet must contain: the problem, the technical choice, a number that implies scale (DAU, ops/sec, bundle KB), and the trade-off. Drop everything else.',
    },
    {
      pattern: '"All side projects, no production"',
      why: 'Portfolio links to GitHub repos but no real-user signal. Hiring manager fears the candidate has never owned a production incident or live bug.',
      recovery: 'Surface the production work first. Even contract / consulting work counts as long as you can name the audience size and the failure modes you debugged.',
    },
    {
      pattern: '"No perf numbers"',
      why: 'Resume claims "improved performance" or "optimized loading time" without LCP / TBT / INP / bundle-size deltas. Senior screeners discount these claims.',
      recovery: 'For every perf claim, attach 2 numbers: before and after. Without numbers, drop the bullet — replace with something measurable.',
    },
    {
      pattern: '"Title-grade gap"',
      why: 'Senior or Staff title at a smaller company, but the systems shipped are landing-page / form-heavy / CRUD-grade. No design-system contribution, no perf-budget ownership, no real user scale.',
      recovery: 'For each line on your resume, ask: would a frontend hiring manager assume this implies 100k+ DAU and a multi-team design-system context? If the answer is no, drop the senior modifier or rephrase to match scope.',
    },
  ],

  faq: [
    {
      q: 'Should I learn Vue / Svelte / Solid to land senior frontend roles?',
      a: 'Not unless you target a Vue / Svelte shop specifically. The senior bar at most companies is React + RSC depth. Other frameworks are credit but not differentiator unless you have specific experience with them at scale (e.g., GitLab Vue, Tubi Solid).',
    },
    {
      q: 'How important is design-system experience?',
      a: 'Critical at engineering-led product companies (Linear, Figma, Vercel, Stripe). They probe specifically for: have you contributed design-system primitives, what API decisions did you defend, how did you migrate consumers off a deprecated component. Without this signal, you cap at mid-IC at those companies.',
    },
    {
      q: 'Will agents replace frontend engineers?',
      a: 'Compresses bottom-60% work (component scaffolding, CSS layout, basic routing). Doesn\'t touch top-40% (perf budget defense, a11y at scale, server/client architecture, design-system trade-offs). Senior IC frontend gets more leveraged, not less.',
    },
    {
      q: 'How do I show a11y depth without an a11y title?',
      a: 'Specifics. "Co-authored Modal primitive with focus-trap, scroll-lock, and keyboard escape." "Closed N axe-core violations across the design system over 6 weeks." "Sat on the W3C ARIA Authoring Practices working group." Generic "I care about a11y" is noise.',
    },
    {
      q: 'Frontend → fullstack — is that the right path?',
      a: 'It\'s the most common career arc and pays better than pure frontend in 2026. The challenge: most companies pattern-match candidates by their last 18 months of work. To pivot, ship one substantial backend project at your current company before applying.',
    },
    {
      q: 'How does Lakshya help specifically for this archetype?',
      a: 'Three ways: (1) the archetype detector classifies frontend JDs even when they mention "AI" — JDs that look fullstack-y but emphasize design-system + perf + a11y resolve correctly. (2) The CV tailor reframes side-project work into production-implicit language without inventing user numbers. (3) The story bank captures perf-debugging + a11y-cleanup stories tagged "frontend" — high reuse value because every loop probes them.',
    },
  ],
}
