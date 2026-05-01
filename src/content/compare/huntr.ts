import type { CompetitorContent } from './types'

export const huntrCompare: CompetitorContent = {
  slug: 'huntr',
  competitorName: 'Huntr',
  competitorUrl: 'https://huntr.co/',
  metaDescription: 'Lakshya vs Huntr — honest comparison of two job-search workflow tools. Where each one wins, who each is for, and how to pick between application tracking polish and pre-application evaluation depth.',

  intro: `
Huntr and Lakshya share a job-funnel target audience but solve different parts of the funnel. Huntr is mature application-tracker software — a Kanban for your job hunt, with a strong Chrome extension that saves jobs from any portal in two clicks. Lakshya is pre-application evaluation software — a 7-block A-G rubric that scores whether a job is worth applying to in the first place, with archetype detection across 14 tech roles.

Both products are good at what they do. The right tool depends on whether your bottleneck is "I have 80 saved jobs and can't tell which to prioritize" (Huntr) or "I'm about to spend 90 minutes on a tailored application and want a structured second opinion first" (Lakshya).
  `.trim(),

  whoEachIsFor: {
    lakshyaAudience: 'Senior IC / mid-level PM / career-switcher targeting backend, frontend, AI, mobile, devops, data, security, EM roles. Applies to fewer jobs (10-30/month) but wants structured fit + legitimacy verdict before each.',
    competitorAudience: 'Active job seeker tracking 50-150 applications, often across multiple verticals, who values tracking workflow polish + browser extension speed over pre-application evaluation depth.',
  },

  rows: [
    { capability: 'Pre-application evaluation depth',     lakshya: '7-block A-G rubric across 14 archetypes',                              competitor: 'Resume-to-JD keyword match + saved-job tagging',                                    notes: 'Different problems. Huntr scores fit at keyword level; Lakshya scores whether the job is actually worth applying.' },
    { capability: 'Archetype detection',                  lakshya: 'Yes — 14 archetypes (6 AI specialty + 8 general tech)',                  competitor: 'Manual tags — user-defined',                                                       notes: 'Lakshya unique on auto-classification.' },
    { capability: 'Legitimacy / scam-job detection',      lakshya: 'Yes — high / caution / suspicious tier',                                competitor: 'No',                                                                              notes: 'Ghost-job detection has become a real signal in 2026.' },
    { capability: 'Application tracker / Kanban',         lakshya: 'Yes — careerops state machine',                                         competitor: 'Yes — flagship feature, mature, polished',                                          notes: 'Huntr wins on UX polish.' },
    { capability: 'Chrome extension',                     lakshya: 'Not yet (Phase 7)',                                                     competitor: 'Yes — strong feature, save jobs from any portal in 2 clicks',                       notes: 'Huntr wins clearly today.' },
    { capability: 'Resume builder',                       lakshya: 'Yes — multi-template, with PDF export',                                 competitor: 'Yes — basic resume tailoring',                                                       notes: '' },
    { capability: 'CV tailoring per JD',                  lakshya: 'Yes (Phase 3) — operational reframing, never invents experience',       competitor: 'Yes — keyword-density-based tailoring',                                            notes: 'Different philosophies. Lakshya rewrites for archetype fit; Huntr rewrites for keyword density.' },
    { capability: 'LaTeX CV output',                      lakshya: 'Yes (Phase 3, planned)',                                                competitor: 'No — HTML / PDF only',                                                              notes: 'Matters for senior / academic / EU.' },
    { capability: 'BYOK (bring own LLM API key)',         lakshya: 'Yes ($9/mo, unlimited evals)',                                          competitor: 'No',                                                                              notes: 'Lakshya unique.' },
    { capability: 'Story bank (STAR+R)',                  lakshya: 'Yes — STAR+R, archetype tags',                                          competitor: 'No',                                                                              notes: 'Lakshya unique. Useful at interview stage.' },
    { capability: 'Public eval share pages',              lakshya: 'Yes — opt-in, 3 anonymization levels',                                  competitor: 'No',                                                                              notes: '' },
    { capability: 'Free tier',                            lakshya: '3 evals / month',                                                       competitor: 'Limited tracking + 1 resume',                                                      notes: 'Different free-tier shapes.' },
    { capability: 'Pro tier price (USD)',                 lakshya: '$19 / mo',                                                              competitor: '$39 / mo (Huntr Pro)',                                                              notes: 'Lakshya cheaper.' },
    { capability: 'Pro tier price (INR, India)',          lakshya: '₹499 / mo (PPP-adjusted)',                                              competitor: 'No native INR pricing — pay USD',                                                  notes: 'Lakshya unique for Indian market.' },
    { capability: 'Open-source attribution',              lakshya: 'Built on career-ops (santifer, MIT)',                                   competitor: 'Closed source',                                                                     notes: '' },
  ],

  competitorWins: [
    'Chrome extension is mature and polished. Saving jobs from LinkedIn / Indeed / company pages is essentially friction-free.',
    'Application-tracker UX is significantly more polished than Lakshya\'s. Boards, custom fields, document attachments, contacts — all work well.',
    'Document storage (resume / cover letter / portfolio) at the application level is a legit feature Lakshya doesn\'t have today.',
    'Larger user base (~750k+ users) means better case studies, more stable feature set, more support content.',
    'Job board / Discover-style integration with LinkedIn data is more polished.',
  ],

  lakshyaWins: [
    'Pre-application evaluation depth — A-G rubric goes far beyond keyword matching.',
    'Archetype detection across 14 tech roles — not just AI; includes backend, frontend, mobile, devops, data eng, security, EM.',
    'Legitimacy detection — ghost-job and scam tier classification.',
    'BYOK tier — bring your own API key for unlimited evals at $9/mo.',
    'INR pricing for Indian audience — ₹499/mo PPP-adjusted vs forced USD conversion.',
    'Story bank with STAR+R structure — interview prep across loops.',
    'Public share pages — share evaluations with mentors / peers (opt-in, anonymizable).',
    'Open-source methodology (career-ops, MIT) — auditable rubric.',
    'Significantly cheaper Pro tier ($19 vs $39).',
  ],

  whenToPick: {
    pickLakshya: 'You apply to fewer jobs (10-30/month) but want a structured verdict before each one. You target tech roles where archetype fit drives interview-rate. You want INR pricing or BYOK. You value evaluation depth + interview prep over tracker workflow polish.',
    pickCompetitor: 'You apply to many jobs (50-150/month) and need workflow + tracking polish. You want a mature Chrome extension. You\'re managing applications across multiple verticals (not just tech). You\'re comfortable paying $39/mo for that polish.',
  },

  faq: [
    {
      q: 'Can I use both?',
      a: 'Yes — Huntr as your application-tracker hub (Chrome extension to save jobs), Lakshya as your pre-application evaluator (paste JDs into /evaluate before saving them to Huntr). They cover different funnel stages, so stacking is rational for serious job hunters.',
    },
    {
      q: 'Does Lakshya plan a Chrome extension?',
      a: 'Yes — Phase 7 of the careerops integration plan. Not shipped today.',
    },
    {
      q: 'Why doesn\'t Lakshya have document storage like Huntr?',
      a: 'It\'s not on the immediate roadmap. The current resume-builder + CV tailor flow has different ergonomics — you regenerate per JD rather than maintaining a static doc library. If document attachment per application is your primary need, Huntr fits better today.',
    },
    {
      q: 'Will Lakshya work for non-tech jobs?',
      a: 'Today, no — the 14 archetypes are tech-specific. The rubric is generalizable but the prompts are tuned for tech roles in 2026. Multi-vertical expansion is post-launch.',
    },
    {
      q: 'How do I migrate from Huntr to Lakshya?',
      a: 'Export your Huntr applications as CSV (Huntr supports this) and import into Lakshya — the import flow is on the Phase 7 roadmap. Today you can paste JD descriptions into /evaluate one at a time.',
    },
  ],

  publishedAt: '2026-04-25',
  updatedAt: '2026-04-25',
}
