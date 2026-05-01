import type { CompetitorContent } from './types'

export const loopcvCompare: CompetitorContent = {
  slug: 'loopcv',
  competitorName: 'LoopCV',
  competitorUrl: 'https://www.loopcv.pro/',
  metaDescription: 'Lakshya vs LoopCV — honest comparison of two job-search tools with fundamentally different ethical models. Where each one wins, the auto-apply question, and how to pick.',

  intro: `
LoopCV and Lakshya represent the most ideologically opposed pair in the job-search-tooling space. LoopCV is auto-apply software: configure preferences once, the system finds matching jobs and submits applications on your behalf with minimal further input. Lakshya is structured-evaluation software: paste a JD, get a 7-block A-G verdict, only apply to jobs that pass the rubric — every application is human-reviewed.

The auto-apply philosophy has legitimate defenders: candidates in tight markets, candidates with limited time, candidates who genuinely benefit from broad-cast applications. The structured-evaluation philosophy has different defenders: senior IC who values their cover-letter time, career-switchers wanting fit confidence, candidates worried about brand impact.

Career-ops's non-negotiable #2 is "never auto-submit applications." Lakshya inherits this rule. If auto-submission is your hard requirement, LoopCV is the right tool — we won't pretend otherwise.
  `.trim(),

  whoEachIsFor: {
    lakshyaAudience: 'Senior IC / mid-level PM / career-switcher who applies to 10-30 carefully-evaluated jobs / month. Wants structured A-G verdict before any application. Values brand + fit + interview-rate over throughput.',
    competitorAudience: 'Job seeker (often early-career, mid-career-switcher, candidates in tight markets) who values throughput and is comfortable letting software submit applications on their behalf. Auto-apply is their hard requirement.',
  },

  rows: [
    { capability: 'Auto-apply / submit on user\'s behalf',  lakshya: 'No — never auto-submits (career-ops non-negotiable rule)',                competitor: 'Yes — flagship feature, multiple portal integrations',                              notes: 'Most fundamental philosophical difference between the two products.' },
    { capability: 'Pre-application evaluation',            lakshya: '7-block A-G rubric across 14 archetypes',                                competitor: 'Basic JD-CV match score before queue addition',                                       notes: '' },
    { capability: 'Archetype detection',                   lakshya: 'Yes — 14 archetypes (6 AI specialty + 8 general tech)',                  competitor: 'No',                                                                              notes: '' },
    { capability: 'Legitimacy / scam-job detection',       lakshya: 'Yes — high / caution / suspicious tier',                                competitor: 'No — auto-applies to whatever matches preferences',                                  notes: 'Lakshya unique. Auto-apply philosophy has reduced incentive to filter.' },
    { capability: 'Application tracker',                   lakshya: 'Yes — careerops state machine, manual progression',                      competitor: 'Yes — automatic from auto-apply submission',                                       notes: '' },
    { capability: 'Resume builder',                        lakshya: 'Yes — multi-template, PDF export',                                       competitor: 'Yes — basic builder',                                                              notes: '' },
    { capability: 'CV tailoring per JD',                   lakshya: 'Yes (Phase 3) — operational reframing, never invents experience',        competitor: 'Yes — automated keyword tailoring',                                                  notes: 'Different philosophies. Lakshya rewrites for archetype fit; LoopCV rewrites for keyword density at scale.' },
    { capability: 'Story bank (STAR+R)',                   lakshya: 'Yes — STAR+R, archetype tags',                                          competitor: 'No',                                                                              notes: 'Lakshya unique.' },
    { capability: 'Public eval share pages',               lakshya: 'Yes — opt-in, 3 anonymization levels',                                  competitor: 'No',                                                                              notes: '' },
    { capability: 'BYOK (own LLM API key)',                lakshya: 'Yes ($9/mo, unlimited evals)',                                          competitor: 'No',                                                                              notes: '' },
    { capability: 'Free tier',                             lakshya: '3 evals / month',                                                       competitor: 'Limited auto-apply runs / month',                                                  notes: 'Different shapes.' },
    { capability: 'Pro tier price (USD)',                  lakshya: '$19 / mo',                                                              competitor: '$30-90 / mo (varies by plan)',                                                       notes: 'Lakshya cheaper.' },
    { capability: 'Pro tier price (INR, India)',           lakshya: '₹499 / mo (PPP-adjusted)',                                              competitor: 'No native INR pricing — pay USD',                                                  notes: 'Lakshya unique for Indian market.' },
    { capability: 'Open-source attribution',               lakshya: 'Built on career-ops (santifer, MIT)',                                   competitor: 'Closed source',                                                                     notes: '' },
  ],

  competitorWins: [
    'Auto-apply is the strongest in market. If you have hard time constraints (active job hunt + day job), auto-apply genuinely saves hours.',
    'Multi-portal integration breadth — handles many ATS portals automatically.',
    'Multi-vertical fit — works for tech, sales, marketing, finance, etc.',
    'Email alerts + scheduled-apply features — set-and-forget operating mode.',
    'For tight job markets where volume is the strategy, the philosophy is well-defended.',
  ],

  lakshyaWins: [
    'Pre-application evaluation depth — A-G rubric goes far beyond keyword matching.',
    'Archetype detection across 14 tech roles — only Lakshya classifies the role meaningfully.',
    'Legitimacy detection — flags ghost jobs and scams LoopCV will auto-apply you into.',
    'Brand protection — you control which companies see your application. LoopCV may auto-apply you to companies you didn\'t evaluate, which can show up later in inbound recruiter outreach databases.',
    'Story bank with STAR+R structure — interview prep across loops.',
    'Public share pages — auditable evaluations.',
    'BYOK tier for power users.',
    'INR pricing for Indian audience — ₹499/mo PPP-adjusted vs forced USD.',
    'Open-source methodology — auditable rubric.',
    'Significantly cheaper Pro tier ($19 vs $30-90).',
  ],

  whenToPick: {
    pickLakshya: 'You apply to fewer jobs (10-30/month) and value brand + fit confidence + cover-letter quality. You target tech roles where archetype fit is a real lever. You worry about being seen by a hiring manager whose company you don\'t actually want to work at. You want INR pricing.',
    pickCompetitor: 'Time is your hardest constraint. Volume strategy is acceptable in your market segment. You\'re fine with software submitting applications you haven\'t personally reviewed. You\'re comfortable with the brand-impact trade-off.',
  },

  faq: [
    {
      q: 'Is auto-apply ethically problematic?',
      a: 'It\'s philosophically contested. Defenders: it\'s software automating tedious work the candidate would do anyway, no harm to the recipient. Critics: it normalizes spray-and-pray which floods recruiter inboxes and erodes the cover-letter feedback loop. Career-ops\'s position (which Lakshya inherits) is that auto-apply degrades the signal in the labor market over time. We don\'t auto-submit. LoopCV reasonably disagrees.',
    },
    {
      q: 'Should I use both?',
      a: 'Probably not. The philosophies are too opposed. If you commit to volume strategy, LoopCV is your tool; the eval depth Lakshya offers becomes a wasted artifact when applications go out automatically. If you commit to precision strategy, LoopCV undermines the gating Lakshya provides.',
    },
    {
      q: 'Does Lakshya plan auto-apply?',
      a: 'A selective version is on the Phase 7 backlog (post-launch, not committed) — only auto-apply to jobs scoring 4.0+ on the A-G rubric AND with high legitimacy tier. That\'s a different shape from LoopCV\'s "auto-apply broadly" model. May ship in 2026Q4 or 2027.',
    },
    {
      q: 'Will LoopCV-style auto-apply hurt my career long-term?',
      a: 'Recruiter inbox patterns suggest yes for senior-level applications — recruiters notice repeated bulk-template applications and downscore them in inbound triage. For early-career or true broad-cast strategies it\'s less impactful. Calibrate based on your career stage.',
    },
    {
      q: 'Can I export from LoopCV to Lakshya?',
      a: 'No formal import path today. Manually copy the 5-10 jobs you actually want to evaluate properly into Lakshya. The auto-apply queue items typically aren\'t worth migrating — by Lakshya\'s philosophy, most of them shouldn\'t have been applied to.',
    },
  ],

  publishedAt: '2026-04-25',
  updatedAt: '2026-04-25',
}
