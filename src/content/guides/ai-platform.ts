/**
 * Archetype guide content — typed structure for SEO-friendly RSC rendering.
 *
 * One file per archetype. Article + FAQPage JSON-LD generated from this
 * shape on the fly in /guides/[archetype]/page.tsx.
 *
 * Tone: senior IC writing for senior IC. No fluff, no AI-buzzword bingo.
 * Tied to actual career-ops eval corpus where possible.
 */

export interface GuideSection {
  heading: string
  body: string
}

export interface InterviewLoopStep {
  stage: string
  format: string
  signal: string
  prep: string
}

export interface RejectionPattern {
  pattern: string
  why: string
  recovery: string
}

export interface SkillCategory {
  category: string
  skills: string[]
}

export interface ArchetypeGuide {
  slug: string
  archetype: string
  title: string
  metaDescription: string
  tagline: string
  publishedAt: string
  updatedAt: string
  intro: string
  whoHires: string[]
  sections: GuideSection[]
  interviewLoop: InterviewLoopStep[]
  skills: SkillCategory[]
  salaryBands: { region: string; iC: string; staff: string; principal: string; source: string }[]
  rejectionPatterns: RejectionPattern[]
  faq: { q: string; a: string }[]
}

export const aiPlatformGuide: ArchetypeGuide = {
  slug: 'ai-platform',
  archetype: 'ai-platform',
  title: 'How to land an AI Platform / LLMOps role in 2026',
  metaDescription: 'A senior-IC playbook for landing AI Platform / LLMOps roles in 2026 — what hiring managers screen for, the interview loop at Anthropic / OpenAI / Stripe, salary bands by region, and how to rewrite your resume to score 4.0+ on the career-ops A-G rubric.',
  tagline: 'Build the rails the agents run on.',
  publishedAt: '2026-04-25',
  updatedAt: '2026-04-25',

  intro: `
"AI Platform" is the unglamorous half of the LLM stack — observability, evals, model-routing, cost guardrails, RAG ingest pipelines, prompt versioning, on-call runbooks for hallucination spikes. It's the work that turns a Jupyter notebook full of demos into a system that won't page someone at 3am because the embedding model silently changed dimensions.

If you've shipped an LLM feature to production and lived with the consequences, you're probably already an AI Platform engineer. If you're trying to break in from a backend / infra / ML-research background, this guide tells you exactly what hiring managers screen for, where the openings are, and how to position your existing experience.

Lakshya's evaluation corpus has 240+ A-G evaluations against AI Platform roles across 90 companies — what follows is the pattern that consistently scores 4.0/5+. We won't dress it up.
  `.trim(),

  whoHires: [
    'Foundation labs (Anthropic, OpenAI, Google DeepMind, xAI, Mistral) — Platform / Research-Engineering / Inference',
    'AI-native infra (LangChain, LlamaIndex, Modal, Replicate, Together, Fireworks)',
    'Vertical AI (Cursor, Perplexity, Character.AI, Hippocratic, Glean) — Platform engineers shipping evals + observability',
    'Fortune-500 AI Platform teams (Shopify, Stripe, Datadog, Notion, Block, Airbnb)',
    'Devtools companies that recently built an AI tier (Vercel AI, Sentry AI, GitHub Copilot)',
  ],

  sections: [
    {
      heading: 'What this archetype actually does day-to-day',
      body: `
You build the platform other engineers consume to ship LLM features. That means:

— **Evaluation harness.** Pick a small held-out set, define a rubric, run the model under test, compute pass-rate / win-rate against a baseline. Wire it into CI so every prompt change runs the evals automatically.

— **Observability.** Token counts per request, latency P50/P95/P99 by route, error taxonomy (timeout vs rate-limit vs hallucination flagged by output validator). At Anthropic / OpenAI scale this looks a lot like ordinary Prometheus + Grafana + Sentry, just with extra fields.

— **Model routing & cost.** When to use Sonnet vs Haiku, when to fall back to a smaller model, when to use a cached response. Hourly cost ceilings per tenant. Replay loops for debugging without replaying spend.

— **Prompt versioning.** Every prompt is in source control. Every deploy bumps a version. Old evaluations reference the prompt version they ran against. (career-ops's own integration plan does this — see prompt_version on the evaluations table.)

— **RAG pipelines.** Document chunking, embedding, vector store, hybrid retrieval. The infrastructure to keep an index fresh without paying full re-embed cost on every doc edit.

— **Guardrails.** Output validators (JSON-schema, regex, secondary LLM judge). Prompt-injection mitigations. PII redaction. The boring half of the stack but often the part that determines whether legal lets you ship.

If your current job has any 3 of these, you're qualified. Reframe your resume to lead with the AI-Platform language instead of whatever you currently call it (most likely "ML Infra" or "Backend Eng").
      `.trim(),
    },
    {
      heading: 'Why now (the 2026 window)',
      body: `
Through 2024 most companies hired "ML Engineers" — generalists who could train, deploy, and serve. In 2025 the discipline split. Companies running large LLM workloads created **AI Platform** as a distinct role because the operational concerns (cost, latency, hallucination rate, prompt drift) outgrew what one engineer could juggle alongside model training.

In 2026 the openings outpace qualified candidates by a meaningful margin. The signal you want to send is "I've felt the pain" — operators who've debugged a $40k/day overnight cost spike or a silently-broken eval pipeline are valued more than candidates with stronger pure ML credentials. Lean into operations stories.

The corollary: if your background is heavy ML research with no production scars, this role will be a stretch. Consider AI-PM or Forward-Deployed instead.
      `.trim(),
    },
    {
      heading: 'How to position your resume',
      body: `
The career-ops rubric scores AI Platform applications most harshly on Block C ("evidence of operational ownership"). Two-thirds of below-4.0 rejections we see start with bullets like "Built a chatbot using LangChain" — there's no operational signal in that sentence. Rewrite to surface:

— Numbers that imply scale ("served 4M LLM requests/day", "reduced p95 from 8s to 2.3s", "cut Anthropic spend 38% via model routing")
— Failure modes you owned ("designed eval harness that caught a 12-pp regression on math reasoning before production rollout")
— Team multipliers ("paved the path that 8 engineers used to ship LLM features without me")

Every bullet under your last role should fit one of those three templates. Drop the others. Use Lakshya's CV tailor (UI-2 / Phase 3) to keep numbers honest while reformatting for archetype keywords — never invent metrics.
      `.trim(),
    },
  ],

  interviewLoop: [
    {
      stage: 'Recruiter screen',
      format: '20-30 min phone call',
      signal: 'Yes-or-no on basics: where are you, comp range, visa, can you start in N weeks',
      prep: 'Have a one-line pitch ready: "I built X for Y users, focus on Z." Don\'t deep-dive technical here — they\'re screening logistics.',
    },
    {
      stage: 'Hiring manager call',
      format: '45-60 min video',
      signal: 'Can you talk about LLM-platform problems with ownership? Do your examples match their stack?',
      prep: 'Pick 2 stories with hard numbers + clear failure modes. Practice both at 3-min and 10-min depth — interviewer will probe.',
    },
    {
      stage: 'Technical: system design',
      format: '60-90 min',
      signal: 'Can you architect an eval pipeline / RAG system / cost-routing layer end-to-end? Do you ask the right scoping questions?',
      prep: 'Draw 4-5 systems on paper before the loop: (1) eval harness with golden set, (2) RAG with hybrid retrieval, (3) cost router across providers, (4) prompt versioning, (5) hallucination detector. Bring real opinions on each.',
    },
    {
      stage: 'Technical: coding',
      format: '60 min, often pair-programming',
      signal: 'Can you write production-ready code under pressure? Tests, error handling, naming.',
      prep: 'Practice 3-4 LLM-adjacent problems: streaming response parser, retry-with-backoff client, embedding cache with LRU, prompt-template renderer. Bring TDD muscle memory.',
    },
    {
      stage: 'Technical: ML / evals',
      format: '60 min',
      signal: 'Can you reason about model behavior? Pick a metric? Detect a regression?',
      prep: 'Be ready to design an eval for a specific feature. Common: "We added a tool. How do we know it didn\'t regress factuality?" Speak in terms of held-out sets, baselines, statistical significance.',
    },
    {
      stage: 'Behavioral / values',
      format: '45 min, sometimes with founder',
      signal: 'How do you handle disagreement, ambiguity, on-call stress, scope cuts?',
      prep: 'Have 4 STAR+R stories ready: a conflict you owned the resolution of, a project where you cut scope smartly, a failure you debugged under deadline, a teammate you upskilled. Lakshya\'s /stories feature is built for exactly this.',
    },
  ],

  skills: [
    {
      category: 'Required (table-stakes)',
      skills: ['Python 3.11+ in production', 'Async / streaming patterns', 'OpenAI + Anthropic SDKs at the API level (not LangChain abstraction)', 'pgvector or similar', 'Docker + container build pipelines', 'Observability stack (Prometheus / Datadog / Sentry)', 'Cost analysis on cloud bills'],
    },
    {
      category: 'Preferred (separates good from great)',
      skills: ['Eval frameworks (Inspect, Promptfoo, Braintrust, custom)', 'Prompt-injection mitigations beyond input sanitization', 'KV-cache / batched inference', 'vLLM or TGI deployment', 'Distributed tracing across LLM provider hops', 'On-call rotation experience'],
    },
    {
      category: 'Bonus (signals senior+)',
      skills: ['CUDA basics (you don\'t need to write it but you should read it)', 'RLHF or fine-tuning experience', 'Ran a production incident on LLM cost / latency', 'Open-source contribution to LLM tooling repos', 'Wrote internal RFC that shipped'],
    },
  ],

  salaryBands: [
    { region: 'US (SF / NY)',     iC: '$180-260k',  staff: '$260-420k',  principal: '$420-700k+', source: 'levels.fyi 2026Q1, foundation-lab Glassdoor median' },
    { region: 'US (Remote)',      iC: '$160-230k',  staff: '$230-360k',  principal: '$360-560k',  source: 'levels.fyi geo-adjusted' },
    { region: 'India (metro)',    iC: '₹35-65 LPA', staff: '₹65-130 LPA', principal: '₹130-250 LPA', source: 'levels.fyi India + Razorpay/Cred public ranges' },
    { region: 'Europe (London)',  iC: '£90-140k',   staff: '£140-220k',  principal: '£220-340k',  source: 'levels.fyi UK + DeepMind ranges' },
    { region: 'Europe (Berlin)',  iC: '€85-130k',   staff: '€130-200k',  principal: '€200-300k',  source: 'kununu + Stack Overflow 2026 survey' },
  ],

  rejectionPatterns: [
    {
      pattern: '"Strong ML, no production scars"',
      why: 'Resumes that read like a research CV — lots of papers, model architectures, benchmarks beaten. Hiring manager loves the brain, doesn\'t trust the operations.',
      recovery: 'Insert 2-3 bullets per role on operations: incidents owned, dashboards built, on-call shifts taken. If genuinely zero, target Forward-Deployed or AI Research Engineer instead — those reward research output.',
    },
    {
      pattern: '"LangChain demo, no fundamentals"',
      why: 'Resume features langchain.agents calls and "hooked up GPT-4 to our app." Reads like a side project. No discussion of cost, latency, eval, or failure modes.',
      recovery: 'Drop the framework names. Describe the actual problem and trade-offs. "Implemented retrieval over 200k internal docs with 18-day freshness SLA, p95 retrieval 220ms, $40/day inference budget." That\'s the language hiring managers read for.',
    },
    {
      pattern: '"Senior title, junior depth"',
      why: 'Senior or Staff title at smaller company, but technical interviews surface that the candidate hasn\'t actually built systems at the scale the title implies.',
      recovery: 'For each line on your resume, ask: would a hiring manager assume that bullet implies 100x or 10000x users? If 100x, drop the senior modifier and target IC Senior, not Staff. Title-grade alignment is the single biggest career-ops legitimacy flag.',
    },
    {
      pattern: '"Unclear archetype"',
      why: 'Resume mixes backend, ML research, data science, devops, and platform language. Hiring manager can\'t tell what role you actually want.',
      recovery: 'Run your CV through /evaluate against 3 different JDs. If the archetype detector returns 3 different archetypes, your resume is sending mixed signals. Pick one and rewrite.',
    },
  ],

  faq: [
    {
      q: 'Do I need an ML degree to land AI Platform roles?',
      a: 'No. The operational depth matters more than the credential. Strong backend / infra / SRE engineers transition into AI Platform routinely once they\'ve shipped one production LLM feature. The path of least resistance: ship something at your current job, then leverage that bullet to apply.',
    },
    {
      q: 'How important is fine-tuning experience?',
      a: 'Useful for the bonus column, not required. Most AI Platform work in 2026 is on hosted foundation models (Claude / Gemini / GPT). The companies that fine-tune in-house (Anthropic, OpenAI, Mistral) hire fine-tuning specialists into Research Engineering, not Platform. Don\'t spend 6 months learning RLHF if you\'re aiming at AI Platform — spend it shipping evals and cost guardrails.',
    },
    {
      q: 'Will agents kill this role?',
      a: 'The opposite. Agentic systems amplify every operational concern — observability, cost, drift, evals, hallucination — by 5-10x. AI Platform engineers are the people who make agents safe to ship. The role gets bigger, not smaller, as agentic adoption grows.',
    },
    {
      q: 'What\'s the realistic interview-to-offer ratio?',
      a: 'For senior candidates with 1-2 production LLM features under their belt: about 1 in 4 interview loops convert to an offer at top tier (Anthropic, OpenAI, DeepMind). For mid-tier (Stripe, Notion, vertical AI): about 1 in 2.5. Volume of applications matters less than precision — career-ops users who ran A-G evals and only applied to 4.0+ scored jobs landed roles 3x faster than those who blanket-applied to 80+.',
    },
    {
      q: 'How does Lakshya help specifically for this archetype?',
      a: 'Three ways: (1) the A-G evaluator detects ai-platform archetype automatically and scores the JD against your CV in 30s — surface mismatches before you spend 2 hours on a cover letter. (2) The CV tailor (Phase 3) reformulates your existing experience into ai-platform-aligned language without inventing facts. (3) The story bank lets you capture STAR+R stories tagged "ai-platform" once, reuse them across interviews.',
    },
    {
      q: 'I\'m in India targeting US-based AI Platform roles. Realistic?',
      a: 'Realistic but harder. Expect: (1) lower acceptance rates without H1B sponsorship history, (2) preference for candidates with a foot already in US infra (cloud-native experience at a US company\'s India office is the most common bridge), (3) bigger emphasis on async-first communication and self-direction in interviews. Foundation labs and AI-native infra companies sponsor more readily than Fortune-500 — bias your applications there.',
    },
  ],
}
