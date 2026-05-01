import type { ArchetypeGuide } from './ai-platform'

export const engineeringManagerGuide: ArchetypeGuide = {
  slug: 'engineering-manager',
  archetype: 'engineering-manager',
  title: 'How to land an Engineering Manager role in 2026',
  metaDescription: 'A senior playbook for landing Engineering Manager (EM) roles in 2026 — what hiring committees screen for at Stripe / Notion / Linear / scale-up SaaS, the people + technical loop, salary bands, and how senior IC engineers position the transition on the career-ops A-G rubric.',
  tagline: 'Lead engineers without losing the engineer.',
  publishedAt: '2026-04-25',
  updatedAt: '2026-04-25',

  intro: `
Engineering Manager is the most career-misunderstood role in tech. Many strong senior ICs assume EM is "the same job, with extra meetings." It isn't. EM is a fundamentally different practice with its own success metrics — team velocity, retention, pipeline development, scope alignment with the business — and no amount of technical strength compensates for being bad at the people work.

The 2026 EM market has two distinct flavors: **front-line EM** (managing 4-8 engineers, mostly hands-off code, heavy people work + scope ownership) and **senior EM / Director** (managing managers, almost no code, heavy strategy + cross-functional + executive stakeholder work). The interview loops differ sharply.

This guide is for the senior IC making the EM transition (most common) or the EM moving between companies (next most common). Lakshya's eval corpus has 140+ A-G evaluations against EM roles; the rubric weights leadership narrative more than any other archetype.
  `.trim(),

  whoHires: [
    'Engineering-led SaaS (Stripe, Notion, Linear, Figma, Vercel, Sentry, Datadog) — front-line EM with strong IC tilt',
    'Big tech ladders (Google, Meta, Amazon, Microsoft, Apple) — formalized EM tracks; long pipeline; competitive but scalable',
    'Fintech / regulated industries (Plaid, Brex, Mercury, large banks\' tech orgs) — EM with compliance + audit context',
    'Mid-stage startups (Series B-D) — EM-as-multi-hat-leader; you own engineering for an entire vertical',
    'AI-native companies (Anthropic, OpenAI, Cursor, Perplexity) — fewer EM seats; comp ladder steep; expectation: stay technical',
  ],

  sections: [
    {
      heading: 'What this archetype actually does',
      body: `
EM at the senior-IC level (front-line, 4-8 reports):

— **People work.** 1:1s every 1-2 weeks per direct report. Career conversations. Performance reviews. Compensation calibration with HR. Conflict mediation. Burnout detection. Hiring loops. Onboarding. Off-boarding. This is 30-40% of the job and the part most ICs underestimate.

— **Scope alignment.** Translating company strategy into team-level OKRs. Cutting scope when reality requires it. Defending team capacity when stakeholders want more than the team can deliver. Negotiating roadmap with PM, design, and adjacent EMs.

— **Technical leadership without coding much.** You're the one who has to read PRs to spot architectural drift, ask the question that surfaces a missing edge case, and identify the senior IC on the team who's drifting toward staff. You don't ship features yourself; you make sure the right ones get shipped.

— **Hiring + pipeline development.** The senior-IC bar moves with you. You staff your team's pipeline, run your own first-screen interviews, mentor your senior ICs into staff candidates over 12-18 months.

— **Up-and-out communication.** Quarterly business reviews. Cross-team postmortems. Company all-hands updates from your team. Slack threads with VPs. The seniority of the audience is half a level higher than your title.

— **Stay technical enough to be respected.** A good front-line EM still reads code, still pairs occasionally, still understands the system at architectural depth. They don't ship features themselves but they could if forced. The ICs read this difference instantly and the trust impact is enormous.

For senior EM / Director (managing managers): drop the 1:1s with ICs (you have skip-levels with key reports, but most direct work is with your EMs); add: strategy work, executive comms, multi-team scope ownership, manager performance reviews. The IC depth recedes further; you compensate with judgment and pattern recognition.
      `.trim(),
    },
    {
      heading: 'Why now (the 2026 EM market)',
      body: `
The 2025-26 macro shift compressed mid-level IC layoffs but EM hiring stayed relatively healthy because mid-stage and growth-stage SaaS companies need leaders to absorb the engineering pipeline. AI tooling adoption shifted ratios — fewer junior ICs needed per PM-defined feature, but the leverage on senior + EM judgment increased.

Two adjacent trends to know:

— **"Manager as IC" is back.** Some companies (Anthropic, Linear, smaller engineering-led shops) explicitly want EMs who still ship code 30-50% of the time. Other companies (Google, Stripe at L7+) explicitly do not. Match expectations to the company before applying.

— **AI-fluency is becoming an EM signal.** Companies want EMs who can read a model card, evaluate a prompt-engineering proposal from their senior IC, and reason about LLM-product trade-offs. EMs without basic AI fluency are pattern-matched to "legacy senior" — fewer roles open to them in 2026 than in 2024.

If you're a senior IC contemplating EM in 2026, the window is open but the bar is higher than it was — the AI fluency expectation didn't exist 24 months ago.
      `.trim(),
    },
    {
      heading: 'How to position your resume',
      body: `
EM resumes get rejected most often on Block E ("evidence of people impact") for IC-to-EM candidates, and on Block G ("evidence of organizational outcome") for EM-to-EM candidates. Below-4.0 resumes typically read as "senior IC who delivered things" without surfacing the people / leadership / scope work.

Rewrite to surface:

— **Headcount you led + retention.** "Hired and led 6 engineers, 0 regretted attrition over 24 months" is exactly the bullet hiring committees read for. Without retention numbers, the leadership claim has no evidence.
— **Team velocity / output.** "Doubled team weekly merged-PR rate over 9 months without increasing headcount" — quantitative leadership.
— **Career outcomes for your reports.** "Mentored 2 senior ICs into staff promotions; 1 IC promoted to senior" — the most-respected EM signal.
— **Cross-functional scope.** "Owned engineering for the Identity vertical; partnered with PM, design, security, and legal across 3 quarters of GDPR rollout" — establishes you operate beyond the team boundary.
— **Difficult decisions you made.** "Reduced team size by 1 through performance-managed exit; team velocity increased over the next quarter, retention of remaining 5 engineers held at 100%." Hiring committees in 2026 explicitly probe for evidence that EMs can make hard people decisions humanely.

Lakshya's rubric pattern-matches "senior IC with manager title" to a sub-3.5 score. The signal you want to send is "I made the practice transition, not the title transition." Run yours through /evaluate; the rubric will surface which block needs work.
      `.trim(),
    },
  ],

  interviewLoop: [
    {
      stage: 'Recruiter screen',
      format: '20-30 min phone',
      signal: 'Title + tenure as EM + comp + region. Often: "How many reports do you have currently?"',
      prep: 'One-line summary: "I lead a team of N at Company X, our charter is Y, key recent win Z." Have headcount + retention numbers ready.',
    },
    {
      stage: 'Hiring manager call',
      format: '45-60 min',
      signal: 'Can you talk about the people work specifically? Have you owned hard decisions?',
      prep: '2 stories — one team you scaled successfully, one performance-managed exit you handled humanely. Hiring committees screen for both.',
    },
    {
      stage: 'Skip-level / VP call',
      format: '45-60 min',
      signal: 'Can you operate at the level above your title? Strategic? Cross-functional?',
      prep: 'Have an opinion on the company\'s engineering strategy. Be ready to discuss org design, R&D vs platform investment ratios, hiring philosophy.',
    },
    {
      stage: 'People case interview',
      format: '60-90 min',
      signal: 'Live: interviewer plays a senior IC asking for a promotion you don\'t think they\'re ready for, OR a peer EM disagreeing with your scope position.',
      prep: 'Practice difficult conversations aloud. Lead with empathy + specific data. Avoid corporate-speak; senior interviewers screen against it.',
    },
    {
      stage: 'Technical / system design',
      format: '60 min',
      signal: 'Can you still operate at a senior-IC system-design level? Do you ask the right questions?',
      prep: 'Treat this like an IC system design loop — but expect probing on team / org structure: "How would you split this work across 3 engineers?" Bring opinions on staffing + delivery sequence.',
    },
    {
      stage: 'Behavioral / values',
      format: '45-60 min, often founder for Series B-D',
      signal: 'How do you handle conflict, scope cuts, ambiguity, performance issues, hiring mistakes?',
      prep: '5 STAR+R stories: difficult performance conversation, scope cut you defended, hiring mistake you owned, conflict you resolved, IC you developed into next-level. Lakshya\'s /stories with archetype "engineering-manager" tag is built for this archetype specifically.',
    },
  ],

  skills: [
    {
      category: 'Required',
      skills: ['1:1 cadence at scale + structured career conversations', 'Performance review writing — calibration, evidence-based feedback', 'Hiring loop ownership — rubrics, debriefs, calibration', 'Conflict mediation in team and cross-team contexts', 'Scope negotiation with PM / design / business stakeholders', 'Sufficient technical depth to read PRs and ask good questions', 'Quarterly OKRs / planning at team level'],
    },
    {
      category: 'Preferred',
      skills: ['Cross-functional org-design experience (e.g., split a 12-person team into 3 squads)', 'Difficult-conversation track record — performance-managed exits, layoffs handled humanely', 'AI-fluency at the manager level (capability + cost trade-offs, eval reasoning)', 'Senior EM mentorship of front-line EMs', 'Compensation calibration with HR + Finance', 'Public speaking — internal all-hands, external eng-leadership talks'],
    },
    {
      category: 'Bonus',
      skills: ['Authored team / engineering-org RFCs that shipped', 'Direct staff promotion of an IC under you', 'Org-wide change-management experience (e.g., remote → hybrid transition)', 'Hiring loop redesign — measurable improvement in interview signal quality', 'Public engineering blog posts on team practices'],
    },
  ],

  salaryBands: [
    { region: 'US (SF / NY)',     iC: '$240-360k',  staff: '$360-560k',  principal: '$560-900k+', source: 'levels.fyi 2026Q1 EM ladder, FAANG + scale-out' },
    { region: 'US (Remote)',      iC: '$210-300k',  staff: '$300-460k',  principal: '$460-700k',  source: 'levels.fyi geo-adjusted EM' },
    { region: 'India (metro)',    iC: '₹50-100 LPA', staff: '₹100-200 LPA', principal: '₹200-400 LPA', source: 'levels.fyi India + Razorpay / Cred / Slice EM bands' },
    { region: 'Europe (London)',  iC: '£110-170k',  staff: '£170-260k',  principal: '£260-420k',  source: 'levels.fyi UK + Stripe / Cloudflare / Wise EM' },
    { region: 'Europe (Berlin)',  iC: '€100-160k',  staff: '€160-240k',  principal: '€240-360k',  source: 'kununu + N26 / Tier / Personio EM bands' },
  ],

  rejectionPatterns: [
    {
      pattern: '"Senior IC with manager title"',
      why: 'Resume reads like an IC resume — features built, systems designed — with EM bullets bolted on as project-management language. Hiring committees pattern-match to "engineer who got promoted into management without learning the practice."',
      recovery: 'Dedicate the top 60% of EM bullets to people work: hiring done, retention numbers, IC career outcomes, difficult conversations. The technical work goes in the bottom 40%. Reverse the standard senior-IC resume structure.',
    },
    {
      pattern: '"Vague leadership claims"',
      why: 'Bullets like "Led team to deliver X feature on time" with no team size, no retention number, no IC career outcomes. Reads as performative; hiring committees discount them.',
      recovery: 'Every people-work bullet must include at least one number: team size, retention %, IC promotion count, hiring rate, on-time delivery rate. Without numbers it\'s noise.',
    },
    {
      pattern: '"No difficult-decision narrative"',
      why: 'Resume is all wins. No story of a performance-managed exit handled humanely, a scope cut you defended against pushback, a hiring mistake you owned. Hiring committees in 2026 explicitly screen for evidence of this — they\'ve been burned by EMs who can\'t make hard calls.',
      recovery: 'Add 1 bullet per role on a difficult decision you owned. Lead with the outcome, not the act ("Team velocity increased 20% the quarter following a performance-managed exit; retention held at 100%"). Avoid blame language.',
    },
    {
      pattern: '"No AI fluency at the manager level"',
      why: '2026-specific signal. EMs who can\'t reason about AI capability + cost + eval trade-offs are pattern-matched to "legacy senior." Increasingly important as AI features dominate roadmaps.',
      recovery: 'Add 1-2 bullets surfacing your team\'s AI-feature shipping work. Even if the IC did the implementation, your role was the strategic + scope decisions. Frame as: "Sponsored evaluation framework for our customer-support agent; used eval-driven decision-making to defer one feature and prioritize a different one."',
    },
  ],

  faq: [
    {
      q: 'Should I move to EM?',
      a: 'Move to EM if: (1) you genuinely want to spend 30-40% of your time on people work, (2) you find IC growth in scope rather than depth more compelling than going staff/principal, (3) you\'re willing to read code more than write it. Don\'t move if: you want pure technical depth, you find people work draining, or your motivation is hierarchy / title.',
    },
    {
      q: 'Can I do hybrid IC + EM (Tech Lead Manager)?',
      a: 'Yes — many smaller engineering-led companies want exactly this. Linear, Anthropic, smaller startups expect it. Larger companies (Google, Stripe at L7+) split the roles cleanly. Match the company\'s ladder to your preference.',
    },
    {
      q: 'Will I make less money as EM than as Staff IC?',
      a: 'Depends on the company. Big tech (Google, Meta) pays Staff EM and Staff IC at the same level — comp parity. Smaller companies typically pay EM 5-15% above equivalent IC because of supply scarcity. Foundation labs (Anthropic, OpenAI) often pay senior-IC research engineers above EM. Check levels.fyi for company-specific bands.',
    },
    {
      q: 'How do I prep for the people-case interview?',
      a: 'Practice 4 scenarios aloud: (1) IC asks for a promotion you don\'t think they\'re ready for, (2) peer EM disagrees with your scope position, (3) high-performing IC threatens to leave for a competitor, (4) two of your reports have a personal conflict affecting team dynamics. Lead with empathy + specific data; avoid corporate language.',
    },
    {
      q: 'Will agents replace EMs?',
      a: 'Long-term, no. Agents amplify EM productivity (auto-summarized 1:1 notes, performance-review draft scaffolding, hiring-loop coordination), but the difficult conversations, the calibration with HR, the trust-based decisions remain human-led. Bad EMs commoditize; good EMs become more leveraged.',
    },
    {
      q: 'How does Lakshya help specifically for this archetype?',
      a: 'Three ways: (1) the archetype detector tags JDs as engineering-manager vs ai-pm vs solutions-architect when language overlaps. (2) The CV tailor reframes IC-heavy resumes into people-work-forward narratives without inventing facts. (3) The story bank captures difficult-conversation stories tagged "engineering-manager" — extremely high reuse value because every EM loop probes the same 4-5 difficult-decision themes.',
    },
  ],
}
