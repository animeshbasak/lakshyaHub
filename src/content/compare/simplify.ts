import type { CompetitorContent } from './types'

export const simplifyCompare: CompetitorContent = {
  slug: 'simplify',
  competitorName: 'Simplify',
  competitorUrl: 'https://simplify.jobs/',
  metaDescription: 'Lakshya vs Simplify — honest comparison of two job-search tools with very different philosophies. Where each one wins, who each is for, and the ethical question of high-volume autofill vs structured pre-application evaluation.',

  intro: `
Simplify and Lakshya represent two genuinely different philosophies of job hunting. Simplify is built for high-volume application: its Chrome extension auto-fills application forms across 100+ companies, letting users apply to 50-200 jobs / week with minimal friction. Lakshya is built for low-volume precision: paste a JD, get a structured 7-block verdict, only apply to jobs that score 4.0/5+.

Both philosophies have legitimate users. The high-volume approach has its place (early-career, broad-cast strategies, exhausted veterans willing to play numbers). The pre-application evaluation approach has a different place (senior IC who values their cover-letter time, career-switchers wanting fit confidence). Pick based on your actual strategy, not a generic "more applications = better" assumption.
  `.trim(),

  whoEachIsFor: {
    lakshyaAudience: 'Senior IC / mid-level PM / career-switcher who applies to 10-30 carefully-evaluated jobs / month. Wants structured A-G verdict before committing 60-90 minutes to a tailored application. Values precision over throughput.',
    competitorAudience: 'Job seeker (often new grad, recent layoff, broad-cast strategy) applying to 50-200 jobs / week. Values speed, autofill, and low-friction submission across many portals over evaluation depth.',
  },

  rows: [
    { capability: 'Pre-application evaluation depth',     lakshya: '7-block A-G rubric across 14 archetypes',                              competitor: 'No structured evaluation — focus is application speed',                            notes: 'Different philosophies. Simplify accepts you\'ll apply broadly; Lakshya argues you should apply narrowly.' },
    { capability: 'Application autofill (Chrome)',        lakshya: 'No (Phase 7 backlog)',                                                  competitor: 'Yes — flagship feature, 100+ portal integrations',                                  notes: 'Simplify wins clearly today.' },
    { capability: 'Archetype detection',                  lakshya: 'Yes — 14 archetypes',                                                   competitor: 'No',                                                                              notes: 'Lakshya unique.' },
    { capability: 'Legitimacy / scam-job detection',      lakshya: 'Yes — high / caution / suspicious tier',                                competitor: 'No — applies to whatever you click',                                                notes: 'Lakshya unique. Simplify\'s philosophy is volume, not selectivity.' },
    { capability: 'Application tracker',                  lakshya: 'Yes — careerops state machine',                                         competitor: 'Yes — automatic tracking from autofill',                                            notes: '' },
    { capability: 'Resume builder',                       lakshya: 'Yes — multi-template, PDF export',                                      competitor: 'Yes — basic builder',                                                              notes: '' },
    { capability: 'Job aggregation / discover',           lakshya: 'Yes — Apify-backed scrapers',                                           competitor: 'Yes — large aggregated job board',                                                  notes: 'Simplify\'s job board is more polished today.' },
    { capability: 'Story bank (STAR+R)',                  lakshya: 'Yes — STAR+R, archetype tags',                                          competitor: 'No',                                                                              notes: 'Lakshya unique.' },
    { capability: 'Public eval share pages',              lakshya: 'Yes — opt-in, 3 anonymization levels',                                  competitor: 'No',                                                                              notes: '' },
    { capability: 'BYOK (bring own LLM API key)',         lakshya: 'Yes ($9/mo, unlimited evals)',                                          competitor: 'No',                                                                              notes: '' },
    { capability: 'Free tier',                            lakshya: '3 evals / month',                                                       competitor: 'Free for autofill + tracker (paid: premium analytics)',                            notes: 'Different shapes.' },
    { capability: 'Pro tier price (USD)',                 lakshya: '$19 / mo',                                                              competitor: 'Free + ad-supported (premium tier limited)',                                         notes: 'Simplify\'s free model is its key differentiator.' },
    { capability: 'Pro tier price (INR, India)',          lakshya: '₹499 / mo (PPP-adjusted)',                                              competitor: 'Free in India',                                                                     notes: 'Simplify is free for everyone; Lakshya pricing matters less for it.' },
    { capability: 'Open-source attribution',              lakshya: 'Built on career-ops (santifer, MIT)',                                   competitor: 'Closed source',                                                                     notes: '' },
  ],

  competitorWins: [
    'Free tier covers most of the product — accessible to anyone regardless of budget.',
    'Autofill speed is unmatched — 50 applications can be submitted in 90 minutes through good portals.',
    'Job board aggregation is broad and well-maintained.',
    'Mass-application strategy is genuinely useful for early-career or post-layoff candidates targeting many entry-level roles.',
    'Multi-vertical fit — works for any job, not just tech.',
  ],

  lakshyaWins: [
    'Pre-application evaluation depth — structured A-G verdict you simply don\'t get from autofill.',
    'Archetype detection across 14 tech roles.',
    'Legitimacy detection — Simplify will autofill you into ghost jobs without warning.',
    'Story bank with STAR+R structure — interview prep across loops.',
    'Public share pages — share evaluations with mentors / peers.',
    'BYOK tier for power users wanting unlimited evals.',
    'INR pricing for paying users in India (Simplify is free, so price comparison less relevant).',
    'Open-source methodology — auditable.',
  ],

  whenToPick: {
    pickLakshya: 'You apply to 10-30 jobs / month and value the 60-90 minutes of cover-letter time per application. You target tech roles where archetype fit drives interview-rate. You\'ve already tried mass-application and want a different approach.',
    pickCompetitor: 'Your strategy is genuinely high-volume — early-career, post-layoff, recent grad. You want to apply to 50-200 jobs / week and accept the lower hit rate. You\'re multi-vertical (not just tech). You value free over premium features.',
  },

  faq: [
    {
      q: 'Should I use both?',
      a: 'Sometimes. Use Simplify for the broad-cast tier of your hunt (50-100 lower-stakes applications). Use Lakshya for the high-stakes 5-10 dream applications you actually want to invest 90 minutes per cover letter on. Different tiers of the funnel.',
    },
    {
      q: 'Is mass-application bad?',
      a: 'It\'s a strategy. For some candidates (early career, broad-cast, post-layoff) it\'s the right strategy. For others (senior IC, narrow target, brand-conscious) it\'s suboptimal. Lakshya is built for the second group; Simplify is built for the first. The product divergence is real.',
    },
    {
      q: 'Does Lakshya plan an autofill Chrome extension?',
      a: 'It\'s on the Phase 7 backlog (post-launch, not committed). If autofill is your single biggest priority, Simplify is the right tool today. We may build a slower, more selective autofill (only for jobs that score 4.0+) in 2026Q4, but that\'s aspirational.',
    },
    {
      q: 'Will Lakshya work for non-tech jobs?',
      a: 'Today, no — the 14 archetypes are tech-specific. Simplify\'s broader vertical coverage is a real differentiator if you\'re multi-vertical.',
    },
    {
      q: 'How do I migrate from Simplify?',
      a: 'No formal import path. The tracker data on Simplify is more granular per-application; manually re-add the 5-10 jobs you actually care about into Lakshya. The volume jobs aren\'t worth migrating — by Lakshya\'s philosophy, most of them shouldn\'t have been applied to anyway.',
    },
  ],

  publishedAt: '2026-04-25',
  updatedAt: '2026-04-25',
}
