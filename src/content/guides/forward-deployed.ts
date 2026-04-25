import type { ArchetypeGuide } from './ai-platform'

export const forwardDeployedGuide: ArchetypeGuide = {
  slug: 'forward-deployed',
  archetype: 'forward-deployed',
  title: 'How to land a Forward-Deployed Engineer role in 2026',
  metaDescription: 'A senior-IC playbook for landing Forward-Deployed Engineer (FDE) roles in 2026 — what hiring managers screen for at Anthropic / Palantir / OpenAI / Cognition, the customer-on-site loop, salary bands, and how to position rapid prototype experience on the career-ops A-G rubric.',
  tagline: 'Land at the customer site. Ship something that wasn\'t there yesterday.',
  publishedAt: '2026-04-25',
  updatedAt: '2026-04-25',

  intro: `
Forward-Deployed Engineer (FDE) is the role Palantir invented and the AI labs adopted. You parachute into a customer's office (literal or virtual), live inside their workflow for weeks or months, build whatever needs building, and leave behind a system the customer's team can run. The role is unglamorous: you write throwaway code, you take notes by hand, you eat catering with people who don't know what an embedding is.

It is also one of the most career-leveraged positions in AI right now. Two years as an FDE at Anthropic / OpenAI / Palantir gives you a customer rolodex and product instinct that most engineers spend a decade not earning.

If you've shipped a system inside another company's workflow — even as a consultant or contractor — you're an FDE candidate. This guide tells you how to position the experience and what the loop probes for.

Lakshya's corpus has 70+ A-G evaluations against FDE roles across 30 companies. The pattern that consistently scores 4.0+ overweights customer-immersion stories.
  `.trim(),

  whoHires: [
    'Foundation labs (Anthropic, OpenAI, Cognition / Devin, Reflection) — FDE teams shipping to design-partner accounts',
    'Defense / intelligence AI (Palantir, Anduril, Scale AI Federal) — original FDE archetype, security clearances often required',
    'Vertical AI SaaS at enterprise tier (Hippocratic, Harvey, Sierra, Lindy) — FDE during the first 5-15 strategic deployments',
    'AI infra at design-partner stage (Modal, Replicate, Together, Fireworks) — FDE supporting the 10 design-partner accounts before broader launch',
    'Big tech AI customer-success (Microsoft AI customer engineering, Google Cloud Customer Engineering — AI specialty)',
  ],

  sections: [
    {
      heading: 'What this archetype actually does',
      body: `
The FDE day-to-day varies wildly by company stage. Common shape:

— **On-site immersion.** You live in the customer's office (literally or via daily video) for 2-12 weeks. You attend their stand-ups. You eat their catering. The goal: see the workflow that an external consultant or vendor would never see.

— **Custom code.** You write code specific to this customer. Sometimes this is a thin wrapper around your company's product. Sometimes it's a full standalone system. The code rarely ships back upstream — it's customer-specific by design. You over-engineer nothing.

— **Trade-off translation.** Customer asks for X. You explain why X doesn't work and propose X' which does. You\'re negotiating constantly between what's possible, what's affordable, and what the customer's procurement team will actually approve.

— **Knowledge transfer.** You leave behind a runbook, a video walkthrough, and ideally an internal champion at the customer who can run the system after you exit. Your success is measured by whether the system survives 6 months without you.

— **Feedback loop to product.** Patterns you see across customers become roadmap input. The most senior FDEs influence product direction more than most PMs.

— **Unstructured time on weekends.** This isn't a 9-5 role. The flip side: most FDEs take 4-week sabbaticals between deployments, which most other roles don't allow.

If you've worked closely embedded inside another company's workflow — consulting, contracting, or an internal tools role — you're qualified. The most common positioning mistake is leading with "shipped X feature." Lead with "deployed X feature INSIDE customer Y who ran it for Z months."
      `.trim(),
    },
    {
      heading: 'Why now (the 2026 window)',
      body: `
Foundation labs and frontier AI startups are at the design-partner stage with their AI products. The standard pattern: 5-20 design-partner accounts, each with a dedicated FDE, validating product-market fit before broader release. This phase will last 18-36 months at most companies. Once products generalize, FDE teams shrink — the role gets repurposed into customer success or pre-sales.

The 2026 window favors FDE candidates who can land at frontier-AI companies during the design-partner phase. By 2028 the role compresses. If you want to ride the FDE leverage to a CTO / VP role at a vertical AI SaaS, the next 12-18 months is the entry window.

Caveat: FDE roles often require U.S. citizenship or in-territory presence, especially at defense/intelligence employers (Palantir, Anduril). Frontier AI labs are more flexible — Anthropic and OpenAI hire FDE in major US cities and increasingly in London + Tokyo.
      `.trim(),
    },
    {
      heading: 'How to position your resume',
      body: `
The career-ops rubric scores FDE candidates harshly on Block F ("evidence of customer immersion"). Resumes that read like ordinary engineering CVs without customer specificity score below 3.5. Rewrite to surface:

— **Customer immersion duration.** "Embedded with Customer X for 6 weeks; co-located with their data-science team" beats "delivered project for client X."
— **System hand-off success.** "Customer's engineering team operated the deployment for 14 months post-handoff with no escalations" — this is the gold-standard FDE bullet.
— **Decisions made under customer pressure.** "Pushed back on customer\'s feature request that would have introduced a SOC-2 audit gap; renegotiated to a compliant alternative within 48 hours" beats "supported customer requirements."
— **Patterns you fed back to product.** "Identified 3 deployment patterns from 5 design-partner deployments; product team built them into the roadmap." This signal separates FDE from generic consulting work.

Lakshya's CV tailor reframes consulting / SE work into FDE-aligned language without inventing facts. Run yours through /evaluate against an Anthropic FDE JD before applying — the rubric will tell you which signal is missing.
      `.trim(),
    },
  ],

  interviewLoop: [
    {
      stage: 'Recruiter screen',
      format: '20-30 min phone',
      signal: 'Customer-facing comfort + travel willingness + comp + clearance (for defense employers)',
      prep: 'One-line summary of your most-immersive customer engagement. Ready to discuss travel up to 50% during deployments.',
    },
    {
      stage: 'Hiring manager call',
      format: '45-60 min',
      signal: 'Can you tell customer-immersion stories with specificity? Have you survived weeks at someone else\'s desk?',
      prep: '2 stories: a deployment that worked and a deployment that didn\'t. The "didn\'t" story is more important — interviewers screen for self-awareness.',
    },
    {
      stage: 'Coding interview',
      format: '60-90 min, often pair-programming',
      signal: 'Production-near code under time pressure. Comfort with unfamiliar codebases and APIs.',
      prep: '3-4 problems oriented to customer integration: (1) wrap an unfamiliar third-party API in a clean adapter, (2) write a CSV → SQL ingest tolerant of dirty data, (3) build a prompt-template engine that customer engineers can extend, (4) implement a retry-with-circuit-breaker for an upstream LLM API.',
    },
    {
      stage: 'Customer simulation / scoping',
      format: '60 min',
      signal: 'Interviewer plays a skeptical customer with an ambiguous problem. You discover, scope, and propose a phased approach.',
      prep: 'Practice listening before proposing. Default to clarifying questions for the first 15 minutes. Build a 30/60/90 plan aloud. Bring trade-offs explicitly: "we can do X in 2 weeks if we accept Y constraint, OR Z in 6 weeks if we want X without Y."',
    },
    {
      stage: 'Architecture / system design',
      format: '60-90 min',
      signal: 'Can you architect a customer-specific integration end-to-end? Reason about hand-off, monitoring, and customer ownership post-deployment?',
      prep: 'Pre-draft 4 systems: (1) RAG over a customer\'s confidential corpus, (2) coding assistant integrated with their CI, (3) document classifier inside their existing review queue, (4) custom agent inside their CRM. Discuss runbook + handoff for each.',
    },
    {
      stage: 'Behavioral / values',
      format: '45-60 min, sometimes founder',
      signal: 'How do you handle ambiguity, customer pushback, scope creep, lonely deployments, weekends?',
      prep: '4 STAR+R stories: a customer disagreement you owned the resolution of, a project where you cut scope smartly mid-deployment, a hand-off that survived without you, a weekend / off-hours work-life balance challenge you handled.',
    },
  ],

  skills: [
    {
      category: 'Required',
      skills: ['Strong customer-facing communication (you\'ll be in front of CTOs)', 'Production code under time pressure (Python or TS preferred)', 'Comfort in unfamiliar codebases and stacks', 'API integration depth — REST, OpenAPI, OAuth, webhooks', 'Deployment knowledge: Docker, K8s basics, cloud-platform deploys', 'Documentation discipline (you write the runbook nobody else will write)', 'Quick recovery from setbacks at customer sites'],
    },
    {
      category: 'Preferred',
      skills: ['Hands-on Anthropic / OpenAI / Gemini API integration', 'Vector store deployment experience (pgvector, Weaviate, Pinecone)', 'Customer-data sensitivity (HIPAA / SOC-2 / ITAR depending on role)', 'Experience writing customer-facing case studies post-deployment', 'Travel mileage — used to flying within and across regions'],
    },
    {
      category: 'Bonus',
      skills: ['Security clearance (TS/SCI for Palantir / Anduril FDE)', 'Domain depth in one regulated vertical (finance, healthcare, defense, gov)', 'Multi-language fluency for international deployments', 'Prior consulting or solutions-engineering experience at scale', 'Open-source contribution to an integration framework / SDK'],
    },
  ],

  salaryBands: [
    { region: 'US (SF / NY)',     iC: '$200-280k',  staff: '$280-450k',  principal: '$450-700k+', source: 'levels.fyi 2026Q1 + Anthropic / OpenAI FDE public ranges' },
    { region: 'US (Remote)',      iC: '$180-260k',  staff: '$260-400k',  principal: '$400-600k',  source: 'levels.fyi geo-adjusted FDE' },
    { region: 'India (metro)',    iC: '₹45-85 LPA', staff: '₹85-160 LPA', principal: '₹160-300 LPA', source: 'levels.fyi India + Palantir India ranges' },
    { region: 'Europe (London)',  iC: '£100-160k',  staff: '£160-260k',  principal: '£260-400k',  source: 'levels.fyi UK + DeepMind / Anthropic London' },
    { region: 'Defense/Intel US', iC: '$160-220k',  staff: '$220-330k',  principal: '$330-450k',  source: 'Palantir / Anduril public ranges + clearance premium' },
  ],

  rejectionPatterns: [
    {
      pattern: '"Pure engineer with no customer time"',
      why: 'Strong engineering resume but every story is internal-team-facing. No customer name, no embedded duration, no scoping conversations. Hiring manager fears the candidate will freeze up at the customer site.',
      recovery: 'Pull from any customer-adjacent work: external partner integrations, supporting client projects on a contract basis, even strong cross-team work where another team functioned as a "customer." Lead with that.',
    },
    {
      pattern: '"Senior consultant without depth"',
      why: 'Strong customer-facing background but interviews surface technical depth gaps. Reads as "consultant trying to break into eng-titled role at higher comp."',
      recovery: 'Build a substantial side project end-to-end. Use modern stack (foundation models, vector DB, k8s deploy). Talk about it in technical interviews. The depth-signal pivot lands quickly when there\'s real code behind it.',
    },
    {
      pattern: '"No hand-off discipline"',
      why: 'Resume features customer wins but every project ended with the candidate still owning it. No story of leaving behind a system the customer\'s team operates without them.',
      recovery: 'Reframe at least one project around the post-handoff outcome. "Built X for customer Y; their team operated it for 14 months post-handoff with no escalations" is exactly the senior-IC FDE narrative.',
    },
    {
      pattern: '"Domain mismatch"',
      why: 'Strong FDE candidate but the entire prior career is in a different vertical from the target role. Defense lab won\'t hire from purely civilian background; healthcare AI won\'t hire from gaming.',
      recovery: 'Apply to FDE roles at companies whose vertical aligns with your background. Career-ops users who matched FDE archetype to their domain landed roles 4x faster than candidates who applied broadly across verticals.',
    },
  ],

  faq: [
    {
      q: 'How much travel is realistic for an AI FDE?',
      a: 'Frontier AI labs (Anthropic, OpenAI): 25-40% during active deployments, less between. Defense FDE (Palantir, Anduril): 40-60%, often weeks at single sites. Vertical AI SaaS: 20-30% with most deployment work remote. Set expectations honestly during the recruiter screen.',
    },
    {
      q: 'Do I need a security clearance for AI FDE roles?',
      a: 'For frontier AI labs no. For defense FDE (Palantir, Anduril, Scale Federal) yes — TS/SCI is the typical bar. If you don\'t have one, target frontier AI or vertical SaaS instead. Sponsorship for clearance is rare and slow.',
    },
    {
      q: 'Is FDE a long-term career or a stepping stone?',
      a: 'Both. FDE-to-PM, FDE-to-Director, FDE-to-startup-founder are all common 3-5 year arcs. Some senior FDEs stay in role 8+ years because the customer rolodex compounds. Treat it as optionality-rich.',
    },
    {
      q: 'Will agents replace FDE roles?',
      a: 'No. The role amplifies — agents handle more of the throwaway code, freeing the FDE to spend more time on customer conversation and pattern recognition. Senior-IC FDEs become more valuable, not less.',
    },
    {
      q: 'How does Lakshya help specifically for this archetype?',
      a: 'Three ways: (1) the archetype detector distinguishes FDE from solutions-architect from ai-platform on JDs that all use overlapping language. (2) The CV tailor surfaces customer-immersion duration and hand-off success metrics from existing experience. (3) The story bank captures customer-immersion stories tagged "forward-deployed" — high reuse value because every FDE loop probes similar themes (ambiguity tolerance, customer pushback, lonely deployment recovery).',
    },
  ],
}
