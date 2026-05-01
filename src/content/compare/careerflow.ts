import type { CompetitorContent } from './types'

export const careerflowCompare: CompetitorContent = {
  slug: 'careerflow',
  competitorName: 'Careerflow',
  competitorUrl: 'https://www.careerflow.ai/',
  metaDescription: 'Lakshya vs Careerflow — honest comparison of AI-assisted job-search tools. Where each one wins, who each is for, and how to pick between LinkedIn-first profile optimization and pre-application JD evaluation.',

  intro: `
Careerflow and Lakshya have AI assistance in common but optimize for different parts of the job hunt. Careerflow is LinkedIn-first — its core value is profile optimization, headline generation, "About" section rewriting, all geared toward making a candidate more discoverable to recruiters reaching out. Lakshya is pre-application JD-first — its core value is the 7-block A-G evaluation that scores whether a specific job is worth applying to.

Both products help. The right tool depends on whether your bottleneck is "recruiters don't find me on LinkedIn" (Careerflow) or "I have 50 saved JDs and can't tell which to prioritize" (Lakshya).
  `.trim(),

  whoEachIsFor: {
    lakshyaAudience: 'Senior IC / mid-level PM / career-switcher targeting tech roles. Already has decent inbound from LinkedIn but spends too much time on outbound applications that don\'t fit. Wants structured fit verdict before each application.',
    competitorAudience: 'Active job seeker whose primary acquisition channel is LinkedIn — wants better profile, headline, "About" section, and content output to attract recruiter outreach. Less concerned with structured pre-application evaluation.',
  },

  rows: [
    { capability: 'Pre-application evaluation depth',     lakshya: '7-block A-G rubric across 14 archetypes',                              competitor: 'JD-resume keyword overlap match',                                                  notes: 'Different problems entirely. Careerflow scores fit at keyword level; Lakshya scores whether the job is worth applying.' },
    { capability: 'Archetype detection',                  lakshya: 'Yes — 14 archetypes (6 AI specialty + 8 general tech)',                  competitor: 'No',                                                                              notes: '' },
    { capability: 'Legitimacy / scam-job detection',      lakshya: 'Yes — high / caution / suspicious tier',                                competitor: 'No',                                                                              notes: '' },
    { capability: 'LinkedIn profile optimization',        lakshya: 'Not yet (Phase 7)',                                                     competitor: 'Yes — flagship feature',                                                            notes: 'Careerflow wins clearly today.' },
    { capability: 'LinkedIn headline / About generator',  lakshya: 'Not yet',                                                               competitor: 'Yes — strong feature',                                                              notes: 'Careerflow unique today.' },
    { capability: 'Content / post generator (LinkedIn)',  lakshya: 'No',                                                                    competitor: 'Yes — AI-assisted post drafting',                                                  notes: '' },
    { capability: 'Application tracker / Kanban',         lakshya: 'Yes — careerops state machine',                                         competitor: 'Yes — basic tracker',                                                              notes: 'Lakshya tracker more disciplined; Careerflow tracker simpler.' },
    { capability: 'Resume builder',                       lakshya: 'Yes — multi-template, with PDF export',                                 competitor: 'Yes — basic resume builder',                                                       notes: '' },
    { capability: 'Story bank (STAR+R)',                  lakshya: 'Yes — STAR+R, archetype tags',                                          competitor: 'No',                                                                              notes: 'Lakshya unique.' },
    { capability: 'Public eval share pages',              lakshya: 'Yes — opt-in, 3 anonymization levels',                                  competitor: 'No',                                                                              notes: '' },
    { capability: 'BYOK (bring own LLM API key)',         lakshya: 'Yes ($9/mo, unlimited evals)',                                          competitor: 'No',                                                                              notes: 'Lakshya unique.' },
    { capability: 'Free tier',                            lakshya: '3 evals / month',                                                       competitor: 'Limited LinkedIn optimizations',                                                   notes: '' },
    { capability: 'Pro tier price (USD)',                 lakshya: '$19 / mo',                                                              competitor: '$39-49 / mo (varies by plan)',                                                      notes: 'Lakshya cheaper.' },
    { capability: 'Pro tier price (INR, India)',          lakshya: '₹499 / mo (PPP-adjusted)',                                              competitor: 'No native INR pricing — pay USD',                                                  notes: 'Lakshya unique for Indian market.' },
    { capability: 'Open-source attribution',              lakshya: 'Built on career-ops (santifer, MIT)',                                   competitor: 'Closed source',                                                                     notes: '' },
  ],

  competitorWins: [
    'LinkedIn profile optimization is the strongest in market. Headlines, About sections, work-experience rewrites — all polished.',
    'LinkedIn-content generator gives recruiter-attracting posts as a side feature.',
    'Stronger inbound-attract focus — well-suited for candidates whose pain is "recruiters don\'t reach out."',
    'Multi-vertical fit — works for tech, sales, marketing, finance roles.',
    'Larger feature surface — covers more of the job-search funnel breadth-wise (LinkedIn + tracker + resume + cover letter).',
  ],

  lakshyaWins: [
    'Pre-application evaluation depth — A-G rubric goes far beyond keyword matching.',
    'Archetype detection across 14 tech roles — only Lakshya classifies the role into a meaningful taxonomy.',
    'Legitimacy detection — flags ghost jobs and scams Careerflow scores normally.',
    'BYOK tier — bring your own API key for unlimited evals at $9/mo.',
    'INR pricing for Indian audience — ₹499/mo PPP-adjusted vs forced USD conversion.',
    'Story bank with STAR+R structure — interview prep across loops.',
    'Public share pages — share evaluations with mentors / peers (opt-in, anonymizable).',
    'Open-source methodology (career-ops, MIT) — auditable rubric.',
    'Significantly cheaper Pro tier ($19 vs $39-49).',
  ],

  whenToPick: {
    pickLakshya: 'You already get reasonable inbound on LinkedIn but spend too much time on bad applications. You target tech roles where archetype fit is a real lever. You want INR pricing or BYOK. You value evaluation depth + interview prep over LinkedIn optimization.',
    pickCompetitor: 'Your primary pain is LinkedIn discoverability — recruiters don\'t reach out, your "About" section is weak, you don\'t post regularly. You want a polished suite that covers profile + tracker + content. You\'re comfortable paying $39-49/mo for that breadth.',
  },

  faq: [
    {
      q: 'Can I use both?',
      a: 'Yes — Careerflow as your LinkedIn presence tool, Lakshya as your pre-application evaluator. They cover different parts of the funnel (inbound attract vs outbound qualify), so stacking is rational.',
    },
    {
      q: 'Does Lakshya plan LinkedIn optimization features?',
      a: 'It\'s on the Phase 7 backlog (post-launch, not committed). If LinkedIn is your single biggest acquisition channel, Careerflow or LinkedIn\'s own paid features are better-fit today.',
    },
    {
      q: 'Will Lakshya work for sales / marketing / finance roles like Careerflow does?',
      a: 'Today, no — the 14 archetypes are tech-specific (backend, frontend, mobile, devops, data, security, EM + 6 AI specialty). Multi-vertical expansion is post-launch.',
    },
    {
      q: 'What if I just need a better LinkedIn profile?',
      a: 'Careerflow or LinkedIn\'s own AI features (LinkedIn Premium\'s "AI Coaching") are the right tools. Lakshya doesn\'t solve this problem today.',
    },
    {
      q: 'How do I migrate from Careerflow?',
      a: 'No formal import path today. Manually copy your saved jobs into Lakshya\'s tracker once you have an account; resume profile is rebuilt from scratch (it takes 5-10 minutes).',
    },
  ],

  publishedAt: '2026-04-25',
  updatedAt: '2026-04-25',
}
