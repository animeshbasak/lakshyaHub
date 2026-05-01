import type { ArchetypeGuide } from './ai-platform'

export const backendGuide: ArchetypeGuide = {
  slug: 'backend',
  archetype: 'backend',
  title: 'How to land a Backend / API Engineer role in 2026',
  metaDescription: 'A senior-IC playbook for landing Backend / API Engineer roles in 2026 — what hiring managers screen for at Stripe / Notion / Linear / Cloudflare / fintech / infra companies, the system-design loop, salary bands by region, and how to score 4.0+ on the career-ops A-G rubric.',
  tagline: 'Build the systems other engineers depend on.',
  publishedAt: '2026-04-25',
  updatedAt: '2026-04-25',

  intro: `
Backend Engineer is the broadest archetype in tech. The work covers: REST and GraphQL APIs, message queues and event streaming, database design under contention, distributed system trade-offs, idempotency and consistency models, observability, on-call rotation. The labor market is large, healthy, and competitive — but you can still ship below-average resumes for senior roles and land them, because the average backend resume has been trained against 2020-era ATS keyword filters.

This guide is for the senior IC who's tired of getting screened out by JD-keyword-bingo and wants to know what hiring managers at companies you'd actually want to work at — Stripe, Notion, Linear, Cloudflare, Datadog, Vercel, Supabase, the larger fintechs and infra companies — actually probe for.

Lakshya's eval corpus has 320+ A-G evaluations against backend roles across 200 companies. The pattern that scores 4.0+ leans heavily on operational scars and trade-off judgment.
  `.trim(),

  whoHires: [
    'High-scale infra (Stripe, Cloudflare, Vercel, Datadog, Sentry, Supabase, Neon)',
    'Productivity SaaS at engineering-driven shops (Notion, Linear, Figma, Asana, Atlassian, Slack)',
    'Fintech (Plaid, Brex, Mercury, Wise, Chime, Razorpay, Cred)',
    'Big tech (Google, Meta, Amazon, Microsoft) — backend roles compete heavily; pay top of band',
    'AI-adjacent infra (LangChain, Modal, Replicate, Together, Together) — backend that supports model serving',
    'B2B vertical SaaS where backend is the moat (Snowflake, Databricks, ServiceNow, Workday)',
  ],

  sections: [
    {
      heading: 'What this archetype actually does',
      body: `
Backend engineering at a senior-IC level is judgment work disguised as code. Day-to-day:

— **API design that survives contact with users.** REST or GraphQL, paginated correctly, versioned without breaking, with rate limits and idempotency keys on every mutating endpoint. The bad version of this looks like CRUD scaffolding; the good version looks like an API that other companies build product on top of.

— **Database design under contention.** Postgres or MySQL, a real understanding of indexes, a real understanding of when to denormalize, when to push reads to a read replica, when an event-driven cache invalidation is cheaper than a tight transactional write. You will spend a significant fraction of your career debugging slow queries.

— **Distributed system trade-offs.** Strong vs eventual consistency. Async messaging via Kafka / SNS / RabbitMQ / NATS. Outbox patterns. Saga / 2PC / TCC patterns when transactions span services. The gap between "I read DDIA" and "I have shipped this in production with real failure modes" is enormous; senior loops probe for the second.

— **Observability you actually use.** Structured logs with trace IDs, metrics with the right dimensions, a tracing system you've debugged a real incident with. The signal interviewers test for: when production breaks, can you find the root cause in 20 minutes or 4 hours?

— **On-call ownership.** Most senior backend roles include rotation. Hiring managers strongly prefer candidates who've owned an outage they did not cause but had to fix. Write a postmortem in your portfolio if you can.

— **Security baseline.** SQL injection / XSS / CSRF / SSRF understood and mitigated by default. Secrets management (Vault, AWS Secrets Manager, etc.). OAuth flows you've shipped. Senior bar increasingly: you've shipped at least one feature with formal security review.

If you've shipped 4-5 of these, you're qualified for senior-IC.
      `.trim(),
    },
    {
      heading: 'Why now (the 2026 backend market)',
      body: `
Backend is the most-hired archetype in tech but also the most-competed. The 2026 differentiation is:

— **AI-adjacent backend** is hottest. Backends that support model serving, vector search, eval pipelines, prompt versioning — these are AI-platform-adjacent backend roles paying 15-25% premium over generic backend.

— **Pure backend at scale-out infra companies** (Stripe, Cloudflare, Datadog) remains strong. Pay is high, the work is intellectually serious, and the labor market hasn't compressed.

— **Fintech backend** is still the largest absolute employer for senior IC. The pay is below FAANG but the comp is reliable and the technical depth is deep.

— **Backend at AI-product startups** (Cursor, Perplexity) tends to underpay vs comparable infra roles but offers equity upside and proximity to AI work.

The 2026 commodity case is "generic CRUD backend at non-engineering-led companies" — that segment has compressed significantly post-AI-tooling-adoption (less hand-coded, more LLM-scaffolded). Avoid that lane unless comp + work-life balance trump growth.
      `.trim(),
    },
    {
      heading: 'How to position your resume',
      body: `
Backend resumes get rejected by the career-ops rubric most often on Block C ("operational specificity") and Block D ("trade-off articulation"). Below-4.0 backend resumes typically read like a tour of technologies: "Used Kafka, Redis, PostgreSQL, Elasticsearch, k8s." That's the catalog, not the work.

Rewrite to surface:

— **Numbers that imply scale.** "Designed event-sourcing system processing 4M messages/day with sub-100ms p99 latency" beats "implemented event-driven architecture."
— **Trade-offs explicitly named.** "Chose denormalized read model over JOINs because the read:write ratio was 800:1" — exactly the senior-IC backend signal.
— **Failure modes you owned.** "Diagnosed cascading retry storm during a downstream provider outage; designed circuit breaker that capped failure-mode amplification" — the gold-standard backend bullet.
— **System hand-off success.** "Designed API + SDK that 14 engineering teams now use to ship customer-facing features" beats "built API."

Lakshya's archetype detector classifies pure backend JDs as 'backend' even when they mention "AI" — the keyword set is calibrated for that. Run yours through /evaluate; the rubric will tell you which specific block needs work.
      `.trim(),
    },
  ],

  interviewLoop: [
    {
      stage: 'Recruiter screen',
      format: '20-30 min phone',
      signal: 'Logistics + comp + visa + start timeline',
      prep: 'One-line summary: "I built X serving Y users at Z scale." Have salary range ready.',
    },
    {
      stage: 'Hiring manager call',
      format: '45-60 min',
      signal: 'Can you talk about backend systems with depth and trade-offs? Have you owned consequences?',
      prep: '2 stories with hard numbers + clear failure modes. The "what would you do differently" is interviewed for as much as the wins.',
    },
    {
      stage: 'Coding interview',
      format: '60-90 min, often pair-programming',
      signal: 'Production-quality code under pressure — naming, edge cases, tests, error handling.',
      prep: 'Practice 4 problem types: (1) implement a rate limiter with sliding window, (2) write an idempotent retry-with-backoff client, (3) build a thread-safe cache with LRU eviction, (4) implement a paginated API with cursor-based + page-based variants. Algorithms-heavy LeetCode is a smaller fraction of interviews than it used to be — system-design-y coding dominates.',
    },
    {
      stage: 'System design — primary',
      format: '60-90 min',
      signal: 'Can you architect a system end-to-end? Ask the right scoping questions? Articulate trade-offs?',
      prep: 'Pre-draft 5 systems on paper: (1) URL shortener at scale, (2) job queue with priority + retry, (3) chat service with online presence, (4) feature flag system, (5) payment processor with idempotency. Bring real opinions on each — capacity, partitioning, consistency choices.',
    },
    {
      stage: 'System design — depth probe',
      format: '60 min',
      signal: 'Pick one component from your previous design and go three levels deeper. Can you?',
      prep: 'Be ready to discuss: chosen DB indexes for a specific query pattern, replication topology, write-amplification concerns, queue topology, deployment / migration strategy.',
    },
    {
      stage: 'Behavioral / values',
      format: '45 min',
      signal: 'How do you handle ambiguity, on-call stress, scope cuts, disagreement?',
      prep: '4 STAR+R stories — outage you owned, scope-cut you championed, technical disagreement you resolved, teammate you upskilled. Lakshya\'s /stories feature is built for exactly this.',
    },
  ],

  skills: [
    {
      category: 'Required',
      skills: ['One strong backend language (Go, TypeScript/Node, Python, Java, Rust)', 'Postgres / MySQL fundamentals — indexes, transactions, query plans', 'REST API design + versioning + pagination + idempotency', 'Async patterns + message queues (one of Kafka, RabbitMQ, SNS/SQS, NATS)', 'Container fundamentals — Docker, basic Kubernetes', 'Observability — structured logs, metrics, distributed tracing'],
    },
    {
      category: 'Preferred',
      skills: ['Multiple backend languages (polyglot signals breadth)', 'Database internals at intermediate depth (MVCC, B-trees, write-ahead log)', 'GraphQL + DataLoader / federation', 'Event sourcing or CQRS in production', 'Cloud-native patterns — service mesh, sidecar, control plane vs data plane', 'On-call ownership of a critical system'],
    },
    {
      category: 'Bonus',
      skills: ['Author of a public RFC adopted by your team / company', 'Contributor to a popular open-source backend project', 'Distributed systems internals depth (Raft, Paxos, gossip, CRDTs)', 'Database / storage layer engineering (you\'ve modified or extended a DB)', 'On-call ownership of a system at >$10M revenue exposure'],
    },
  ],

  salaryBands: [
    { region: 'US (SF / NY)',     iC: '$170-260k',  staff: '$260-420k',  principal: '$420-700k+', source: 'levels.fyi 2026Q1, FAANG + scale-out infra' },
    { region: 'US (Remote)',      iC: '$150-220k',  staff: '$220-340k',  principal: '$340-540k',  source: 'levels.fyi geo-adjusted backend' },
    { region: 'India (metro)',    iC: '₹30-55 LPA', staff: '₹55-110 LPA', principal: '₹110-220 LPA', source: 'levels.fyi India + Razorpay / Cred / Slice public ranges' },
    { region: 'Europe (London)',  iC: '£80-130k',   staff: '£130-200k',  principal: '£200-320k',  source: 'levels.fyi UK + Stripe London / Cloudflare London' },
    { region: 'Europe (Berlin)',  iC: '€75-120k',   staff: '€120-180k',  principal: '€180-280k',  source: 'kununu + N26 / Deliveroo / DoiT' },
  ],

  rejectionPatterns: [
    {
      pattern: '"Tour of technologies"',
      why: 'Resume reads like a stack tour: "Used Kafka, Redis, PostgreSQL, Elasticsearch, Docker, k8s." No problem statement, no scale, no trade-off. Hiring manager pattern-matches to "junior-grade resume with senior-grade title aspiration."',
      recovery: 'Pick 5 bullets per role. Each bullet must contain: the problem, the specific technical choice, a number that implies scale, and the trade-off you accepted. Drop everything else.',
    },
    {
      pattern: '"All FAANG, no production scars"',
      why: 'Big-tech resume but no story of an outage you owned, an on-call shift that stuck with you, a quarterly roadmap you cut to ship something real. Reads as competent execution without operational maturity.',
      recovery: 'Add 2-3 bullets per role on operations: incidents owned, postmortems authored, on-call shifts taken. If genuinely zero, target an infrastructure-light backend role at a smaller company before the next big-tech move.',
    },
    {
      pattern: '"Algorithms ace, no system design"',
      why: 'Strong DS&A interview track record but the system-design loop surfaces gaps. Resume features problem-solving but no architecture, no trade-off articulation, no operational ownership.',
      recovery: 'Spend 4-6 weeks practicing system design specifically: read DDIA, design 10 systems on paper, write up trade-off documents for 3 of them. The depth-signal pivot lands fast when there\'s real architectural muscle behind it.',
    },
    {
      pattern: '"Title-grade gap"',
      why: 'Senior or Staff title at smaller company, but the systems shipped are CRUD-grade — no scale, no trade-offs, no operational ownership. Title-grade alignment is the most common backend rejection signal.',
      recovery: 'For each line on your resume, ask: would a backend hiring manager assume that bullet implies 100x or 10000x users, or 100 ops/sec or 10000 ops/sec? If the bullet is "implemented user signup," drop the senior modifier or rephrase to match the actual scope.',
    },
  ],

  faq: [
    {
      q: 'Should I learn Rust to land senior backend roles?',
      a: 'Useful but not required. The bar at most companies is "you can choose between Go / Java / Python / Node / Rust based on the workload." Rust is a strong differentiator at infra-heavy companies (Cloudflare, Discord, AWS Bedrock backend). At fintech and SaaS the marginal value is much lower. Don\'t spend 6 months learning Rust to break into senior backend; spend it shipping bigger systems in your current stack.',
    },
    {
      q: 'How important is Kubernetes depth?',
      a: 'For backend IC: surface-level useful (you should be able to deploy, debug pod restarts, write a Helm chart). Deep K8s internals are a separate discipline (devops-sre archetype). If your interviews keep going deep on K8s details, you may be applying to roles that are actually devops-sre disguised as backend.',
    },
    {
      q: 'Can I move from frontend to backend at senior level?',
      a: 'Yes, but expect a 1-grade reset (mid -> senior with a year, not lateral). Frontend → fullstack → backend is the smoother arc. If you\'ve been hands-on with API design + database work as part of your frontend role, frame as fullstack first, backend later.',
    },
    {
      q: 'What\'s the realistic interview-to-offer ratio?',
      a: 'For senior backend with strong system-design interviews: about 1 in 2-3 at top-tier (Stripe, Cloudflare, Datadog), 1 in 1.5-2 at mid-tier (Notion, Linear, Sentry). Volume of applications matters less than precision. Career-ops users who ran A-G evals and only applied to 4.0+ scored jobs landed roles 2.5x faster than blanket-appliers.',
    },
    {
      q: 'Will agents replace backend roles?',
      a: 'Compresses generic CRUD work, doesn\'t touch the senior-IC bar. The judgment work — trade-offs, scale, failure modes, on-call ownership — remains human-led for the foreseeable future. The role gets more leveraged, not eliminated.',
    },
    {
      q: 'How does Lakshya help specifically for this archetype?',
      a: 'Three ways: (1) the archetype detector classifies a JD as backend even when it mentions AI, distinguishing pure backend from ai-platform / ml-engineer roles. (2) The CV tailor reframes a stack-tour resume into trade-off + outcome language without inventing facts. (3) The story bank captures outage / on-call stories tagged "backend" once, reuses them across loops where every interviewer asks variations of "tell me about an outage."',
    },
  ],
}
