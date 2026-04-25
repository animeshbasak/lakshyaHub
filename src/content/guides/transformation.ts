import type { ArchetypeGuide } from './ai-platform'

export const transformationGuide: ArchetypeGuide = {
  slug: 'transformation',
  archetype: 'transformation',
  title: 'How to land an AI Transformation / change-management role in 2026',
  metaDescription: 'A senior playbook for landing AI Transformation / change-management roles in 2026 — what enterprise hiring managers screen for at McKinsey QuantumBlack / Deloitte / Accenture / big-bank AI offices, the strategic loop, salary bands, and how to position non-technical influence on the career-ops A-G rubric.',
  tagline: 'Move organizations, not models.',
  publishedAt: '2026-04-25',
  updatedAt: '2026-04-25',

  intro: `
The AI Transformation role is the half of AI that has nothing to do with code. You walk into a 50,000-person enterprise, identify which workflows AI can compress, build the business case, design the change-management plan, train the workforce, and exit when your KPIs (cost saved, cycle-time reduced, adoption rate, retention through transition) hit their thresholds. The work is half consulting, half people-leadership, half political navigation. It\'s the highest-paying non-technical AI role and the least understood by engineers.

If you\'ve led an enterprise transformation before — digital, cloud, agile — you\'re already an AI Transformation candidate. The skills transfer. AI is the substrate, but the hard part remains human.

If you\'re an engineer or PM thinking about transitioning, this is the only AI archetype where adding an MBA or a consulting tour helps. Lakshya\'s eval corpus has 60+ evaluations on AI Transformation roles; the rubric weights leadership and stakeholder narrative far above technical depth.
  `.trim(),

  whoHires: [
    'Big consultancies\' AI offices (McKinsey QuantumBlack, BCG X, Deloitte AI, Accenture Applied Intelligence) — Lead Architect / Principal / Partner-track',
    'Big-bank / insurance AI offices (JPMorgan, Goldman Sachs AI, Allianz, Lloyds Banking) — typically VP+ titles in 2026',
    'Healthcare systems with AI initiatives (Mayo Clinic AI, Kaiser Permanente, Cleveland Clinic, NHS England Digital)',
    'Big-tech enterprise AI advisory (Microsoft Industry Solutions Engineering, Google Cloud Industry, AWS Industry Specialists)',
    'Tier-2 AI services + boutiques (Redapt, Slalom, Element AI / ServiceNow consulting, Capgemini Engineering)',
  ],

  sections: [
    {
      heading: 'What this archetype actually does',
      body: `
Transformation work is mostly meetings with people who don\'t share a vocabulary. Day-to-day:

— **Workflow audits.** You spend the first 4-8 weeks watching the customer\'s actual workflow — at someone\'s desk, in their Slack, in their daily stand-ups. You\'re identifying the 5-10 high-leverage choke points where AI compresses a step from hours to minutes.

— **Business case construction.** You quantify: current cost, projected cost after AI, change-management investment required, payback period. CFOs read this. The numbers must be defensible to the customer\'s audit committee.

— **Stakeholder mapping.** You diagram the political landscape: who sponsors, who blocks, who\'s neutral, who can be flipped. A transformation that\'s technically perfect but politically unsupported dies on month 4. Half your job is keeping it alive.

— **Pilot → scale plan.** You design a 90-day pilot with 50 users, success criteria, kill criteria. Then a 6-month scale plan covering 500. Then 18 months for org-wide. Each phase has a kill condition the sponsor agreed to in writing.

— **Workforce transition planning.** AI transformations affect jobs. A senior transformation lead has a humane plan for retraining, role-shifting, and (where unavoidable) severance. The reputational cost of doing this badly is severe; the upside of doing it well is referenceable.

— **Executive communication.** You present to C-suite quarterly. Slides not pages. Questions you can\'t answer become followups, never bluffs.

— **Change-management execution.** You run training programs, town halls, "AI ambassadors" cohort-of-50, and 1:1s with skeptical middle management. You touch every level of the organization eventually.

The seniority bar is real — most successful AI Transformation candidates have 8+ years of enterprise experience before this role. Don\'t target it as a first AI move unless you bring strong consulting / change-management depth.
      `.trim(),
    },
    {
      heading: 'Why now (the 2026 window)',
      body: `
Through 2024, enterprise AI was a research topic. 2025 was the year boards demanded AI strategies. 2026 is when those strategies have to ship. Every Fortune 500 has an AI transformation budget for 2026-27 — usually $50M-$500M depending on size. The shortage is in candidates who can run those programs end-to-end.

The closest analog is the 2010-2014 cloud transformation wave. The senior-IC roles paid 30-50% premiums during that window and compressed within 3-4 years. Same dynamic now. If you have prior digital / cloud / agile transformation experience, your AI transformation pivot window is widest in 2026.

If you\'re early-career, this is the wrong archetype to target. Consider AI-PM or solutions-architect instead.
      `.trim(),
    },
    {
      heading: 'How to position your resume',
      body: `
The career-ops rubric scores transformation resumes hardest on Block G ("evidence of organizational outcome"). Resumes that read as project management without strategic outcomes score below 3.5. Rewrite to surface:

— **$ saved or revenue created at organizational scale.** "Led AI workflow redesign for 3,400-person ops org; reduced annual run-rate cost by $14M" is the gold-standard transformation bullet. Without an organizational-scale dollar figure your resume gets pattern-matched to "project manager."
— **Workforce numbers affected.** "Designed 6-month retraining program for 380 affected analysts; 89% retained, 4% voluntary departure, 7% role-shifted within 12 months" — the "humane transition" signal is increasingly weighted by hiring committees.
— **Sponsor-level access.** "Reported to the EVP of Operations; presented quarterly to the COO + 4 EVPs" — establishes you have political muscle, not just project muscle.
— **Pilot → scale narrative.** "Pilot at 50 users → 6-month scale to 500 → 18-month rollout to 4,200" tells the hiring manager you\'ve seen all three phases.

Lakshya\'s archetype detector flags "AI manager" or "AI program manager" resumes lacking organizational-outcome dollar figures as solutions-architect mismatches. If your wins read as project-level, the rubric will tell you what\'s missing.
      `.trim(),
    },
  ],

  interviewLoop: [
    {
      stage: 'Recruiter screen',
      format: '20-30 min phone',
      signal: 'Title + tenure + comp + region. Often: "Tell me about your largest transformation."',
      prep: 'Largest transformation by $ impact, with one number. Ready to discuss travel + project-based engagement model.',
    },
    {
      stage: 'Hiring manager / partner call',
      format: '45-60 min',
      signal: 'Can you talk about transformations with specificity? Are your wins narratives or numbers?',
      prep: '2 transformation stories with $ outcomes, workforce numbers, and sponsor-level access. The "lessons learned" is interviewed for as much as the wins.',
    },
    {
      stage: 'Case interview',
      format: '60-90 min, often whiteboard',
      signal: 'Given a prompt like "design AI transformation for Fortune-500 retailer\'s customer-service org," can you scope, prioritize, structure, build the business case, anticipate political blockers, and propose a sequenced plan?',
      prep: 'Practice the McKinsey/Bain case format aloud. Pre-build 4 cases: (1) ops-org transformation, (2) sales-org transformation, (3) finance / treasury transformation, (4) HR / talent acquisition transformation. Have an opinion on each and the pitfalls.',
    },
    {
      stage: 'Stakeholder simulation',
      format: '60 min',
      signal: 'Live: interviewer plays a hostile mid-level manager whose job is at risk. Can you communicate honestly without panicking?',
      prep: 'Practice difficult conversations aloud. Lead with empathy + facts. Bring data on retention / role-shifting outcomes from prior transformations.',
    },
    {
      stage: 'Strategic / partner-level',
      format: '60-90 min',
      signal: 'Can you operate beyond a single account? Identify trends across deployments? Influence the firm\'s AI POV?',
      prep: 'Have an opinion on the firm\'s GTM, the deal types they should chase vs avoid, and the next 18-month transformation theme (e.g., agentic transformation, FinOps for AI). Partners read passivity as no-hire.',
    },
    {
      stage: 'Executive / C-suite presence',
      format: '45-60 min',
      signal: 'Can you hold your own with a real CFO / COO / CTO? Calm, honest, prepared, not promotional.',
      prep: 'Brush up on financial fluency: NPV, IRR, payback period, OpEx vs CapEx, business-unit P&L. Big-consultancy partners often probe this brutally.',
    },
  ],

  skills: [
    {
      category: 'Required',
      skills: ['Enterprise transformation experience (digital, cloud, agile, M&A — any flavor)', 'Business-case construction at $10M+ scale', 'Stakeholder mapping and political navigation', 'Workforce transition planning (retraining, role-shifting, severance)', 'C-suite presentation (slides not pages)', 'Project-program-portfolio management at scale', 'Comfort with foundation-model capabilities at the executive-summary level (not API-level)'],
    },
    {
      category: 'Preferred',
      skills: ['Big-consultancy or in-house transformation track record', 'Industry depth in 1-2 verticals (finance / healthcare / retail / manufacturing)', 'Direct relationships with C-suite at target customers', 'Published thought leadership on AI transformation (whitepapers, conference talks)', 'Experience with regulated vertical compliance (SOC-2, HIPAA, financial regulation)'],
    },
    {
      category: 'Bonus',
      skills: ['MBA from a top-tier school (signals consulting muscle)', 'Multi-language fluency for international engagements', 'Co-authored case studies in Harvard Business Review or McKinsey Quarterly', 'Board-level advisory experience', 'Direct experience with one regulated vertical\'s AI rollout (FedRAMP, NHS, etc.)'],
    },
  ],

  salaryBands: [
    { region: 'US (SF / NY)',         iC: '$220-340k', staff: '$340-550k', principal: '$550-1.1M+', source: 'McKinsey QuantumBlack / BCG X / Deloitte AI partner-track 2026' },
    { region: 'US (Remote)',          iC: '$190-280k', staff: '$280-440k', principal: '$440-700k',  source: 'levels.fyi geo-adjusted Big-3 consulting' },
    { region: 'India (metro)',        iC: '₹50-100 LPA', staff: '₹100-200 LPA', principal: '₹200-450 LPA', source: 'India consulting partner-track + AI premium' },
    { region: 'Europe (London)',      iC: '£120-180k', staff: '£180-300k', principal: '£300-560k',  source: 'McKinsey UK + Deloitte UK partner-track' },
    { region: 'Big-bank in-house US', iC: '$220-320k', staff: '$320-500k', principal: '$500-800k',  source: 'JPM AI Office / Goldman + AI premium' },
  ],

  rejectionPatterns: [
    {
      pattern: '"Project manager in transformation clothing"',
      why: 'Resume reads as project-level wins (delivered project, on-time, on-budget) without organizational-outcome metrics. Hiring committees pattern-match to "PM-IV" not "transformation lead."',
      recovery: 'Surface the organizational outcome of each project: $ saved or revenue created, FTE-equivalent freed up, cycle-time reduction at unit-of-org scale, adoption rate at 6 / 12 / 18 months. If the project genuinely had no organizational outcome, target solutions-architect or AI-PM instead.',
    },
    {
      pattern: '"Strong consulting, no AI depth"',
      why: 'Strong general transformation background but interviews surface that the candidate can\'t articulate AI capability vs limitation at the executive-summary level. Hiring manager fears the candidate will overpromise to clients.',
      recovery: 'Spend 4-6 weeks getting fluent on foundation-model capabilities: what they\'re reliably good at, what they\'re unreliable on, what cost structure looks like, what plumbing is required. Subscribe to Stratechery, read Anthropic / OpenAI papers monthly, talk to engineers daily.',
    },
    {
      pattern: '"No workforce-transition story"',
      why: 'Senior+ transformation candidate can\'t describe a humane transition plan in a hostile-manager simulation. In 2026 this is a hard senior bar — boards are paying explicit attention to AI transformation reputational risk.',
      recovery: 'Add 1-2 bullets explicitly on workforce-transition outcomes: retention rate post-transition, role-shifting %, voluntary-departure %, training program scale. In behavioral interviews lead with the difficult conversation you handled, not the system you shipped.',
    },
    {
      pattern: '"No financial fluency"',
      why: 'Senior transformation candidate can\'t hold their own in a CFO simulation. NPV, IRR, payback period, OpEx vs CapEx come across as memorized vocabulary rather than instinct.',
      recovery: 'Take a 4-week refresher on corporate finance fundamentals (Coursera, Lynda, or a textbook). Build 3-4 NPV / IRR models for prior transformations from your career, even retroactively. Bring those models to the case interview.',
    },
  ],

  faq: [
    {
      q: 'Do I need an MBA?',
      a: 'For partner-track at the Big-3 consultancies (McKinsey, BCG, Bain) — practically yes. For in-house transformation at a Fortune-500, no, but it accelerates the path. For boutique / tier-2 consultancy: not required. The signal an MBA sends — that you can sit with senior executives without imposter syndrome — can be replicated through 8-10 years of progressive enterprise leadership.',
    },
    {
      q: 'Can I move from engineering into transformation?',
      a: 'Yes, but typically via a consulting tour first or via a senior-PM bridge. The pure engineering → transformation jump is rare. Most successful pivots: engineering → senior PM at a Fortune-500 → transformation lead at a consultancy. 4-7 year arc.',
    },
    {
      q: 'Is this travel-heavy?',
      a: 'Yes. Big-consultancy transformation: 60-80% travel. In-house transformation at a Fortune-500: 30-50%. Boutique / tier-2: 40-60%. If travel is a hard constraint, target in-house roles or remote-first boutiques.',
    },
    {
      q: 'Will this role disappear as AI transformations become commoditized?',
      a: 'Long-term it shifts. The "specific AI transformation" service compresses as patterns standardize. The "next-thing transformation" emerges (probably agentic transformation in 2027-28). Senior transformation leads who can flex onto the next wave keep the role; those who can\'t commoditize.',
    },
    {
      q: 'How does Lakshya help specifically for this archetype?',
      a: 'The least directly. Lakshya\'s technical archetypes are weighted toward IC roles where the rubric maps cleanly to engineering / PM / SE work. For transformation, the archetype detector is a useful filter (distinguishes you from solutions-architect or program-manager mismatches), but the CV tailor and story bank are most useful for getting the *senior IC role first*, then layering on transformation responsibility within that role over 2-4 years.',
    },
  ],
}
