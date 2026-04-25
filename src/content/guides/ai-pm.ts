import type { ArchetypeGuide } from './ai-platform'

export const aiPmGuide: ArchetypeGuide = {
  slug: 'ai-pm',
  archetype: 'ai-pm',
  title: 'How to land an AI Product Manager role in 2026',
  metaDescription: 'A senior-IC PM playbook for landing AI Product Manager roles in 2026 — what hiring managers screen for at Anthropic / OpenAI / Cursor / Notion AI, the loop, salary bands, and how to score 4.0+ on the career-ops A-G rubric without being a CS PhD.',
  tagline: 'Define what to build when no one knows what\'s possible.',
  publishedAt: '2026-04-25',
  updatedAt: '2026-04-25',

  intro: `
The AI Product Manager job is product management on a foundation that ships a new model every six weeks. PRDs you wrote in March are obsolete by September. Your roadmap has to flex around capability surprises. Your stakeholder model includes researchers who don't think product, founders who think every problem is solvable in two weeks, and customers who oscillate between "this magic" and "this is broken."

If you've shipped any AI feature where the success metric was tied to model output quality (not just engagement / retention / conversion), you're already an AI PM. If you're a strong PM trying to break in, this guide tells you what to position, where the openings are, and which interviewer types you'll meet.

Lakshya's corpus has 90+ A-G evaluations on AI PM roles across 60 companies. Below is the pattern that scores 4.0/5+. Less polished than the engineering archetypes — the AI PM market is younger and the rubric is still settling.
  `.trim(),

  whoHires: [
    'Foundation labs (Anthropic, OpenAI, Google DeepMind) — Product on Claude / ChatGPT / Gemini consumer + API surfaces',
    'AI-first product companies (Cursor, Perplexity, Character.AI, Replit, ElevenLabs) — usually 2-4 PMs covering all surfaces',
    'Big tech AI bets (Microsoft Copilot, Notion AI, Atlassian Rovo, Salesforce Einstein) — AI PM in pre-existing PM ladder, often Director+',
    'Vertical AI SaaS (Harvey, Hippocratic, Decagon, Sierra, Glean) — typically 1-2 PMs and you own a vertical end-to-end',
    'Devtools companies adding AI tier (Vercel AI, GitHub, Sentry, Linear) — AI PM as a shadow specialist embedded in existing product surfaces',
  ],

  sections: [
    {
      heading: 'What this archetype actually does',
      body: `
Two archetypes split here: **AI Surface PM** (you own a UX surface — chat, autocomplete, agents) and **AI Platform PM** (you own developer-facing API or SDK). Both share core day-to-day:

— **PRDs on a moving floor.** Capability changes every model release. Your PRD doesn't list features — it lists *capabilities you bet are stable*. When they aren't, you re-plan in days, not quarters.

— **Eval-first product spec.** Before "what does the UX look like?" you ask "what does success look like quantitatively?" Then you write the eval before the feature. PMs who can't reason about evals don't make the cut.

— **Pricing + cost together.** AI features have unit economics. A free tier that gives 100 evals/month at $0.20 each loses money fast. PMs who don't model unit economics get blindsided by margin compression.

— **Failure-mode storytelling.** When the agent does something embarrassing (and it will), you need to explain to stakeholders / customers / press in language that doesn't blame the model and doesn't promise impossible fixes. This is half the senior-IC AI PM job.

— **Researcher + engineer translation.** You're often the bridge between a researcher saying "the model has these capabilities" and an engineer saying "we can ship in 8 weeks." Neither understands the other's language. You convert.

— **Customer voice, but skeptically.** Customers will ask for "make it better" without specifying what better means. AI PM senior-IC differential is *staying close enough to the model output to know which complaints are real and which are vibes-based.*

If you've shipped 3 of these, you're qualified.
      `.trim(),
    },
    {
      heading: 'Why now (the 2026 window)',
      body: `
Most existing PM ranks didn't grow up with AI in the stack. The ratio of "PMs who can read an eval rubric" to "PMs who currently have AI on their roadmap" is starkly skewed. Companies are hiring at every level — APM through Director — and offering 20-40% premiums over base PM compensation in the same companies. That premium will compress as the labor pool catches up. 2026 is the year to lock it in.

If your background is engineering with PM stretches, this is your strongest window to transition. The "PM who can read a model card" beats "PM who has 10 years of B2B SaaS" in current AI PM hiring.
      `.trim(),
    },
    {
      heading: 'How to position your resume',
      body: `
AI PM resumes get rejected on Block C ("operational specificity") even more harshly than engineering resumes. Buzzwords like "leveraged AI to drive engagement" are immediate signals to skip. Rewrite to surface:

— **Numerical wins tied to model behavior.** "Cut hallucination rate from 12% to 4.2% by reframing the eval rubric to weight false confidence" beats "improved AI quality."
— **Pricing decisions you owned.** "Designed BYOK tier ($9/mo) that captured 18% of free users without cannibalizing Pro" — exactly what AI PM hiring asks for.
— **Eval frameworks you defined.** "Wrote the evaluation rubric for a coding-agent feature, including 15 trajectory-level cases that became the team's CI gate."
— **Failure modes you contained.** "When the agent began surfacing competitor mentions, partnered with safety + legal to design a 12-rule output filter that didn't break the helpful 80% case."

Lakshya's /evaluate at 4.0+ on AI PM JDs filters resumes that already have these signals. If yours doesn't, the rubric will tell you what's missing.
      `.trim(),
    },
  ],

  interviewLoop: [
    {
      stage: 'Recruiter screen',
      format: '20-30 min phone',
      signal: 'PM ladder + AI exposure + comp + start timeline',
      prep: 'One-line summary of your most-AI-exposed product win. Lead with a number, not a feature name.',
    },
    {
      stage: 'Hiring manager call',
      format: '45-60 min',
      signal: 'Can you talk about AI products without buzzwords? Do you have opinions on what to ship next?',
      prep: '2 stories with quantitative outcomes. Have a thesis on the company\'s next move and be ready to defend it.',
    },
    {
      stage: 'Product / strategy case',
      format: '60-90 min',
      signal: 'Given a prompt like "design Notion\'s next AI feature," can you scope, prioritize, anticipate failure modes, and price it?',
      prep: 'Pre-draft 4 cases: (1) net-new AI feature inside an existing product, (2) pricing redesign for an AI tier, (3) what to deprecate after a capability jump, (4) how to recover from a public AI gaffe. Practice 30/60/90-day plans aloud.',
    },
    {
      stage: 'Eval / metrics deep-dive',
      format: '60 min',
      signal: 'Can you design an eval for a specific feature? Reason about regression detection? Think about distribution shift?',
      prep: 'Be ready to write an eval rubric on a whiteboard. "We added a coding tool. How do you know it didn\'t regress on math reasoning?" — speak in golden sets, win-rate, statistical significance.',
    },
    {
      stage: 'Cross-functional / collaboration',
      format: '45 min',
      signal: 'Can you work with researchers + designers + engineers without being a bottleneck? Resolve disagreement?',
      prep: '3 STAR+R stories — disagreement with researcher you resolved, scope-cut you championed against engineering pushback, customer escalation you turned into a feature decision.',
    },
    {
      stage: 'Founder / executive',
      format: '45-60 min, sometimes longer',
      signal: 'Do you understand the company\'s thesis? Can you operate at the strategic level the role requires?',
      prep: 'Read their last 3 blog posts. Have an opinion on their roadmap. Be ready to push back politely if you think they\'re wrong about something. Founders read passivity as a "no-hire."',
    },
  ],

  skills: [
    {
      category: 'Required',
      skills: ['PM fundamentals (PRDs, prioritization, OKRs)', 'Eval rubric design at the feature level', 'Unit economics modeling for token-priced features', 'Customer-research mechanics (interviews, surveys, NPS)', 'SQL for self-serve metrics', 'Reading an Anthropic / OpenAI model card with comprehension', 'Comfort with model non-determinism — features that "mostly work"'],
    },
    {
      category: 'Preferred',
      skills: ['Eval frameworks hands-on (Inspect, Promptfoo, Braintrust)', 'A/B testing infrastructure design (not just running experiments)', 'API product management (developer experience, docs, SDK design)', 'Pricing experimentation including BYOK tiers', 'Safety / compliance partnership experience'],
    },
    {
      category: 'Bonus',
      skills: ['Engineering background (you can read code)', 'Published thought leadership on AI products', 'Open-source contribution', 'Direct LLM API experimentation in your daily workflow', 'Network in the foundation-lab ecosystem'],
    },
  ],

  salaryBands: [
    { region: 'US (SF / NY)',     iC: '$200-280k',  staff: '$280-450k',  principal: '$450-700k+', source: 'levels.fyi 2026Q1 PM ladder, AI premium adjusted' },
    { region: 'US (Remote)',      iC: '$170-240k',  staff: '$240-380k',  principal: '$380-580k',  source: 'levels.fyi geo-adjusted PM' },
    { region: 'India (metro)',    iC: '₹35-65 LPA', staff: '₹65-130 LPA', principal: '₹130-220 LPA', source: 'levels.fyi India PM + AI premium' },
    { region: 'Europe (London)',  iC: '£90-140k',   staff: '£140-220k',  principal: '£220-340k',  source: 'levels.fyi UK PM ladder' },
    { region: 'Europe (Berlin)',  iC: '€85-130k',   staff: '€130-200k',  principal: '€200-300k',  source: 'kununu + AI-PM premium' },
  ],

  rejectionPatterns: [
    {
      pattern: '"Buzzword AI PM"',
      why: 'Resume reads "leveraged AI to drive engagement," "owned AI roadmap," "drove cross-functional AI initiative." No specific eval, no failure mode, no number tied to model behavior.',
      recovery: 'Replace every "leveraged AI" line with one specific bet you made about what the model could do, whether it worked, and what number changed.',
    },
    {
      pattern: '"Senior PM, no AI judgment"',
      why: 'Strong B2B / consumer PM background, recent stretch into AI features, but interviews surface that the candidate can\'t reason about model failure modes specifically. Pattern-matched as "PM doing AI without understanding it."',
      recovery: 'Spend 2 weeks shipping something using foundation-model APIs (Anthropic / OpenAI / Gemini) directly. Even a small evaluator side project. Then talk about *that* specifically in interviews — the ROI on hands-on exposure is huge.',
    },
    {
      pattern: '"Researcher in PM clothing"',
      why: 'Heavy ML research background, transitioned to PM, but the resume + interview signal show product instincts (tradeoffs, prioritization, customer empathy) are weak. Hiring manager fears the candidate will rebuild research instead of shipping product.',
      recovery: 'Lead with PM stories — scope cuts, customer interviews, prioritization decisions — even from your researcher days. The product instinct is what the role needs; back it up with the technical depth.',
    },
    {
      pattern: '"No pricing fluency"',
      why: 'Senior+ AI PM candidate can\'t articulate how to price a token-cost feature. In 2026 this is a hard senior-IC bar.',
      recovery: 'Get fluent on per-token economics: model cost per call, cost-to-serve at percentile traffic, free tier cannibalization risk, BYOK as a cost-shift lever. Build a spreadsheet model for a real product before your next round.',
    },
  ],

  faq: [
    {
      q: 'Do I need an engineering background to land an AI PM role?',
      a: 'Helps but not required. The differential is whether you can read code + understand model APIs without translation. PMs who hand-wave away technical details lose to PMs who can ship a quick prototype to validate an assumption.',
    },
    {
      q: 'How important is direct LLM API experience?',
      a: 'Surprisingly important. Senior-IC AI PMs at top companies are expected to have called the Anthropic / OpenAI / Gemini APIs directly within the last 30 days. Use the model your company uses. Notice the failures yourself.',
    },
    {
      q: 'Foundation lab vs vertical SaaS — which to target?',
      a: 'Vertical SaaS pays less but gives you full ownership of a roadmap. Foundation labs pay more but you\'ll own a slice of a chat surface that 200M people use, which is exposure-heavy and trade-off-heavy. Pick based on whether you want depth or scale.',
    },
    {
      q: 'Will agents replace AI PMs?',
      a: 'No. They\'ll *change* AI PM the way A/B test platforms changed traditional PM. The role becomes more about choosing what to evaluate and why, less about running the evaluations manually.',
    },
    {
      q: 'How does Lakshya help specifically for this archetype?',
      a: 'Two ways most: (1) the archetype detector flags ai-pm vs ai-platform vs solutions-architect on JDs that all sound similar in headline. (2) The CV tailor surfaces your existing PM wins through an AI-PM lens without inventing claims. Especially useful for PMs with adjacent backgrounds (developer-tools, fintech) trying to land their first AI PM role.',
    },
  ],
}
