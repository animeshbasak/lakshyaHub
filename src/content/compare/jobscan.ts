import type { CompetitorContent } from './types'

export const jobscanCompare: CompetitorContent = {
  slug: 'jobscan',
  competitorName: 'Jobscan',
  competitorUrl: 'https://www.jobscan.co/',
  metaDescription: 'Lakshya vs Jobscan — honest comparison of AI-assisted resume optimization. Where each one wins, who each is for, and how to pick between A-G evaluation and keyword-density scoring.',

  intro: `
Jobscan and Lakshya share a starting premise: paste a JD and your resume, get a score, get suggestions. The mechanics differ sharply. Jobscan measures keyword overlap density between your resume and the JD — its score is essentially "how well your resume passes ATS keyword filters." Lakshya runs a 7-block A-G rubric that scores fit on archetype, legitimacy, operational specificity, gaps, and recommendations.

Both produce numbers. Jobscan's is older (founded 2014) and more established in the resume-optimization space. Lakshya is newer, narrower in audience, and weights different signals. The right tool depends on what you actually want to optimize for.
  `.trim(),

  whoEachIsFor: {
    lakshyaAudience: 'Senior IC / mid-level PM / career-switcher who wants a structured verdict on whether the job is worth applying to, with archetype-aware feedback that goes beyond ATS keyword matching.',
    competitorAudience: 'Job seekers (often new grads, mid-career, or career-changers) who want to maximize ATS pass-through and get keyword-level resume edits before applying.',
  },

  rows: [
    { capability: 'Scoring methodology',                  lakshya: '7-block A-G rubric covering archetype fit, legitimacy, gaps, and recommendations (qualitative + quantitative)', competitor: 'Keyword density match between resume and JD (quantitative — % match)', notes: 'Apples-to-oranges. Jobscan answers "will my resume pass keyword filters"; Lakshya answers "is this job actually a good fit and worth applying."' },
    { capability: 'Archetype detection',                  lakshya: 'Yes — 6 careerops archetypes',                                          competitor: 'No',                                                                              notes: '' },
    { capability: 'Legitimacy / scam-job detection',      lakshya: 'Yes — high / caution / suspicious tier',                                competitor: 'No',                                                                              notes: '' },
    { capability: 'ATS keyword optimization',             lakshya: 'Ethical keyword reformulation in CV tailor (Phase 3) — never invents',  competitor: 'Flagship feature — keyword-by-keyword recommendations + match %',                  notes: 'Jobscan wins on raw keyword optimization depth.' },
    { capability: 'LinkedIn profile optimization',        lakshya: 'Not yet',                                                               competitor: 'Yes — LinkedIn Optimization tool',                                                  notes: 'Jobscan wins clearly.' },
    { capability: 'Cover-letter generation',              lakshya: 'Not yet',                                                               competitor: 'Yes — generates cover letter from JD + resume',                                     notes: 'Jobscan wins. Lakshya might add in Phase 4+ but it\'s not on the immediate roadmap.' },
    { capability: 'Application-tracker / Kanban',         lakshya: 'Yes — careerops state machine',                                         competitor: 'No — Jobscan is single-feature focused on resume optimization',                     notes: '' },
    { capability: 'Story bank (STAR+R)',                  lakshya: 'Yes — STAR+R structure, archetype tags',                                competitor: 'No',                                                                              notes: 'Lakshya unique.' },
    { capability: 'CV tailoring per JD',                  lakshya: 'Yes (Phase 3) — operational reframing, never invents',                  competitor: 'Yes — keyword-density driven tailoring',                                            notes: 'Different philosophies. Lakshya rewrites for archetype fit; Jobscan rewrites for ATS pass-through.' },
    { capability: 'Public eval share pages',              lakshya: 'Yes — opt-in, anonymizable',                                            competitor: 'No',                                                                              notes: '' },
    { capability: 'BYOK (own LLM API key)',               lakshya: 'Yes ($9/mo, unlimited evals)',                                          competitor: 'No',                                                                              notes: 'Lakshya unique.' },
    { capability: 'Free tier evaluations',                lakshya: '3 / month',                                                             competitor: '5 scans / month (free tier — limited)',                                              notes: '' },
    { capability: 'Pro tier price (USD)',                 lakshya: '$19 / mo',                                                              competitor: '$49.95 / mo (Premium)',                                                              notes: 'Lakshya is significantly cheaper for active job hunters.' },
    { capability: 'Pro tier price (INR, India)',          lakshya: '₹499 / mo (PPP-adjusted)',                                              competitor: 'No native INR pricing — pay USD (~₹4,200/mo)',                                       notes: 'Lakshya unique for Indian market — almost 9x cheaper at PPP.' },
    { capability: 'Open-source attribution',              lakshya: 'Built on career-ops (santifer, MIT)',                                   competitor: 'Closed source',                                                                     notes: '' },
  ],

  competitorWins: [
    'Mature ATS keyword optimization — 12 years of incremental improvement on this specific feature.',
    'LinkedIn profile optimization is a strong adjacent feature Lakshya doesn\'t cover.',
    'Cover-letter generation works out of the box.',
    'Established trust — many bootcamps, career coaches, and university career offices recommend Jobscan.',
    'Larger user base means more case studies and visibility into edge cases.',
  ],

  lakshyaWins: [
    'A-G evaluation depth dwarfs keyword-density scoring — measures things that actually predict interview success.',
    'Archetype detection — only Lakshya classifies the role and gives archetype-aware advice.',
    'Legitimacy detection — flags scam JDs and ghost jobs that Jobscan scores normally.',
    'Application tracking + story bank + share pages — full-funnel tooling, not single-feature.',
    'BYOK tier saves heavy users money — $9/mo unlimited with your own key.',
    'INR pricing for Indian audience — ₹499/mo vs ~₹4,200/mo at direct USD conversion of Jobscan Premium.',
    'Open-source methodology — verifiable rubric vs proprietary keyword algorithm.',
    'Significantly cheaper Pro tier ($19 vs $49.95).',
  ],

  whenToPick: {
    pickLakshya: 'You want a structured pre-application verdict, archetype-aware feedback, full-funnel tooling, INR pricing, or significantly lower Pro tier cost. You target AI / engineering / product roles where the archetype rubric matches your career.',
    pickCompetitor: 'Your single biggest pain is "my resume doesn\'t pass ATS keyword filters" and you want 12 years of refinement focused on that exact problem. You also want LinkedIn optimization or auto-generated cover letters that Lakshya doesn\'t ship today.',
  },

  faq: [
    {
      q: 'Should I use both?',
      a: 'For most users — pick one. Lakshya covers the broader funnel (evaluation + tracking + interview prep). Jobscan goes deeper on the narrower keyword-optimization problem. Stacking both is overkill unless you\'re applying to 100+ jobs and want every edge.',
    },
    {
      q: 'Why does Lakshya not focus on ATS keyword density?',
      a: 'We deprecated keyword-density scoring in 2026 because most modern ATS pipelines pass through to human reviewers within seconds. The signal that actually predicts interview rates in current data is archetype fit + operational specificity, which is what the A-G rubric measures. Jobscan\'s focus is valid for resumes optimized for first-pass automated filters; we optimize for the human reviewer.',
    },
    {
      q: 'Does Lakshya have a LinkedIn optimization tool?',
      a: 'Not today. We have it on the Phase 7 backlog. If LinkedIn optimization is your single biggest priority, Jobscan or LinkedIn\'s own paid features are better-fit today.',
    },
    {
      q: 'I just need a cover letter — can Lakshya help?',
      a: 'Today, no. Cover-letter generation is on the post-launch backlog. If that\'s your immediate need, Jobscan or other dedicated tools are better-fit today.',
    },
    {
      q: 'Is the keyword approach really obsolete?',
      a: 'It\'s not obsolete — keyword optimization still helps for first-pass filters at large enterprises. But it\'s a smaller percentage of your interview-rate variance than it was in 2018-2020. The market has shifted; tools should too.',
    },
  ],

  publishedAt: '2026-04-25',
  updatedAt: '2026-04-25',
}
