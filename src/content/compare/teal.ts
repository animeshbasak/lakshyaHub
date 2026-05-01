import type { CompetitorContent } from './types'

export const tealCompare: CompetitorContent = {
  slug: 'teal',
  competitorName: 'Teal',
  competitorUrl: 'https://www.tealhq.com/',
  metaDescription: 'Lakshya vs Teal — honest comparison of two AI-assisted job-search tools. Where each one wins, who each is for, and how to pick.',

  intro: `
Teal and Lakshya are both job-search tools with AI assistance, but they target the user at different points in the funnel. Teal helps you organize the job hunt — track applications, tailor resumes, save jobs from a Chrome extension. Lakshya goes earlier in the loop: it tells you whether a job is worth applying to in the first place, with a 7-block A-G evaluation that covers archetype fit, legitimacy detection, and operational specificity.

Both products are real, both have genuine users, and both have legitimate use cases. The right tool depends on which problem hurts more for you right now: "I have 50 saved jobs and can't tell which to prioritize" (Teal) or "I'm about to spend 2 hours on a cover letter and want a structured second opinion first" (Lakshya).
  `.trim(),

  whoEachIsFor: {
    lakshyaAudience: 'Senior IC / mid-level PM / career-switcher targeting AI / engineering / product roles, applying to fewer jobs with higher precision. Wants a structured verdict before committing time to an application.',
    competitorAudience: 'Active job seeker tracking 30-100 applications across multiple verticals, who values workflow + organization over pre-application evaluation depth.',
  },

  rows: [
    { capability: 'Pre-application evaluation depth',     lakshya: '7-block A-G rubric (skills, archetype, legitimacy, etc.)',                competitor: 'Resume-to-JD keyword overlap match score (0-100)',                                  notes: 'Different problems. Teal scores fit; Lakshya scores whether the job is worth your time at all.' },
    { capability: 'Archetype detection',                  lakshya: 'Yes — 14 archetypes (6 AI specialty + 8 general tech)',                  competitor: 'No',                                                                                notes: '' },
    { capability: 'Legitimacy / scam-job detection',      lakshya: 'Yes — high / caution / suspicious tier',                                competitor: 'No',                                                                                notes: 'Hiring managers re-list ghost jobs more than ever in 2026.' },
    { capability: 'Application tracking / Kanban',        lakshya: 'Yes — careerops state machine (Saved → Evaluated → Applied → Interview → Offer)', competitor: 'Yes — flagship feature with rich filtering',                                        notes: 'Teal\'s tracker has more polish; Lakshya\'s is functional.' },
    { capability: 'Chrome extension',                     lakshya: 'Not yet (Phase 7)',                                                     competitor: 'Yes — strong feature, save jobs from any portal',                                  notes: 'Teal wins clearly here today.' },
    { capability: 'Resume builder + ATS score',           lakshya: 'Resume builder yes, ATS score deprecated in favor of A-G eval',         competitor: 'Yes — resume builder + ATS keyword scorer',                                       notes: '' },
    { capability: 'CV tailoring per JD',                  lakshya: 'Yes (Phase 3) — ethical keyword injection, never invents experience',  competitor: 'Yes — keyword optimization + tailored bullet suggestions',                         notes: 'Both rewrite. Lakshya skews toward operational reframing; Teal toward keyword density.' },
    { capability: 'LaTeX CV output',                      lakshya: 'Yes (Phase 3, planned)',                                                competitor: 'No — HTML / PDF only',                                                              notes: 'Matters for senior / academic / EU markets.' },
    { capability: 'BYOK (your own LLM API key)',          lakshya: 'Yes ($9/mo, unlimited evals)',                                          competitor: 'No',                                                                                notes: 'Lakshya unique.' },
    { capability: 'Story bank (STAR+R)',                  lakshya: 'Yes — STAR+R structure, archetype tags',                                competitor: 'No',                                                                                notes: 'Lakshya unique. Most useful at interview stage.' },
    { capability: 'Public eval share pages',              lakshya: 'Yes — opt-in, 3 anonymization levels',                                  competitor: 'No',                                                                                notes: 'Useful for sharing structured evaluation with mentors / peers.' },
    { capability: 'Free tier evaluations',                lakshya: '3 / month',                                                             competitor: 'Limited keyword scores (free), unlimited tracking',                                notes: 'Different free-tier shapes. Compare actual usage.' },
    { capability: 'Pro tier price (USD)',                 lakshya: '$19 / mo',                                                              competitor: '$9 / mo (Teal+)',                                                                  notes: 'Teal is cheaper for casual users.' },
    { capability: 'Pro tier price (INR, India)',          lakshya: '₹499 / mo (PPP-adjusted)',                                              competitor: 'No native INR pricing — pay USD',                                                  notes: 'Lakshya unique for Indian market.' },
    { capability: 'Open-source attribution',              lakshya: 'Built on career-ops (santifer, MIT) — credited every page',             competitor: 'Closed source, founder-led product',                                                notes: '' },
  ],

  competitorWins: [
    'Chrome extension is mature and useful — saving jobs from any portal works smoothly.',
    'Application-tracker UX is more polished. Filters, custom fields, and bulk actions all work well.',
    'Larger ecosystem — Teal Academy, podcast, community Discord. More content per dollar.',
    'Cheaper Pro tier ($9/mo vs $19/mo) — better fit for casual job seekers cycling through 50-100 applications.',
    'Multi-vertical fit. Works for any job, not just AI / tech / engineering.',
  ],

  lakshyaWins: [
    'Pre-application evaluation depth — A-G rubric goes far beyond keyword matching.',
    'Archetype detection — only Lakshya classifies the role into a meaningful taxonomy that affects how you should apply.',
    'Legitimacy detection — high / caution / suspicious tier flags ghost jobs and scams.',
    'BYOK tier — bring your own Anthropic / Gemini key for unlimited evals at $9/mo.',
    'INR pricing for Indian audience — PPP-adjusted ₹499/mo Pro tier vs forced USD conversion.',
    'Story bank with STAR+R structure — captures interview-prep narratives once, reuses them across loops.',
    'Open-source methodology (career-ops, MIT) — verifiable, auditable, transparent.',
  ],

  whenToPick: {
    pickLakshya: 'You apply to fewer jobs (10-30/month) but want a structured verdict before each one. You target AI / engineering / product roles where archetype fit is a real lever. You want INR pricing for an Indian audience. You want to share evaluations or maintain a story bank.',
    pickCompetitor: 'You apply to many jobs across multiple verticals (50-100/month) and need workflow + tracking polish more than evaluation depth. You want a mature Chrome extension. You\'re budget-sensitive at the casual job-seeker tier.',
  },

  faq: [
    {
      q: 'Can I use both?',
      a: 'Yes. Teal as your application-tracker hub (with the Chrome extension), Lakshya as your pre-application evaluator (paste JDs into /evaluate before saving them to Teal). They don\'t conflict; they cover different parts of the funnel.',
    },
    {
      q: 'Does Lakshya plan a Chrome extension?',
      a: 'Yes — Phase 7 of the careerops integration plan. Not shipped today.',
    },
    {
      q: 'Why doesn\'t Lakshya have ATS keyword scoring like Teal?',
      a: 'We deprecated it. ATS keyword density is a 2018-era metric — most modern ATS systems pass through to a human reviewer in seconds. The 7-block A-G rubric measures archetype fit, legitimacy, operational specificity, and gaps — signals that actually predict whether you\'ll get an interview. We\'d rather measure something that matters.',
    },
    {
      q: 'Will Lakshya work for non-tech jobs?',
      a: 'Yes for tech roles — 14 archetypes today: 6 AI specialty (ai-platform, agentic, ai-pm, solutions-architect, forward-deployed, transformation) and 8 general tech (backend, frontend, fullstack, mobile, devops/SRE, data engineering, security, engineering-manager). Non-tech vertical expansion is post-launch.',
    },
    {
      q: 'How do I migrate from Teal to Lakshya?',
      a: 'Phase 7 of the careerops plan adds a "import from Teal" tool. Today, you can paste your JD descriptions one at a time. The story bank and resume profile import will accept Teal exports when shipped.',
    },
  ],

  publishedAt: '2026-04-25',
  updatedAt: '2026-04-25',
}
