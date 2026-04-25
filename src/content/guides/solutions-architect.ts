import type { ArchetypeGuide } from './ai-platform'

export const solutionsArchitectGuide: ArchetypeGuide = {
  slug: 'solutions-architect',
  archetype: 'solutions-architect',
  title: 'How to land an AI Solutions Architect role in 2026',
  metaDescription: 'A senior playbook for landing AI Solutions Architect roles in 2026 — what enterprise hiring managers screen for at Anthropic / OpenAI / Snowflake / Databricks, the customer-facing loop, salary bands, and how to position pre-sales technical depth on the career-ops A-G rubric.',
  tagline: 'Translate model capability into enterprise contract.',
  publishedAt: '2026-04-25',
  updatedAt: '2026-04-25',

  intro: `
The AI Solutions Architect job sits between sales and engineering. You walk into an enterprise meeting where one VP wants to "use AI for X," scope what's actually possible, and walk out with a 6-month implementation plan their engineering team can execute and their procurement team can pay for. You're equal parts engineer, consultant, and translator.

If you've shipped a customer-specific AI integration end-to-end — discovery, scoping, POC, hand-off — you're already an SA. If you're a strong solutions/sales engineer trying to break into AI specifically, this guide tells you what to position, where the openings are, and how the loop differs from generic SE work.

Lakshya's eval corpus has 110+ A-G evaluations on AI SA roles across 70 companies. The pattern that scores 4.0/5+ leans heavily on customer narrative — more than any other archetype.
  `.trim(),

  whoHires: [
    'Foundation labs (Anthropic, OpenAI, Google Cloud AI) — Forward-Deployed SA blurs into FDE; SA is more pre-sales',
    'Enterprise AI infra (Snowflake, Databricks, Vertex AI, AWS Bedrock, Azure OpenAI) — SA / Specialist SA roles in pre-sales orgs',
    'Vertical AI SaaS at enterprise tier (Glean, Harvey, Hippocratic, Sierra) — SA-as-implementation-lead during 6-month rollouts',
    'Devtools companies with enterprise tier (Cursor for Enterprise, GitHub, Sentry, Datadog AI) — Solutions specialists',
    'Big consultancies (Deloitte AI, Accenture, McKinsey QuantumBlack, BCG X) — usually titled Lead Architect or Principal',
  ],

  sections: [
    {
      heading: 'What this archetype actually does',
      body: `
Two flavors split here: **pre-sales SA** (live during deal cycle, exits after contract signs) and **post-sales / customer-success SA** (lives through the implementation). Both share the day-to-day:

— **Discovery + scoping calls.** A VP says "we want AI for legal review." You spend 90 minutes asking what kind of contracts, who reviews them today, what's the volume, what regulatory framework, what's the procurement timeline. Half your work is decoding what the customer thinks they want vs what they actually need.

— **Reference architectures.** You draw the system on a whiteboard / Miro: customer's S3 bucket → ingestion → embedding → retrieval → LLM → review queue → audit log. Trade-offs surfaced: managed vs self-hosted, on-prem deployment if data sovereignty matters, cost per query at projected volume.

— **POC engineering.** You write the throwaway code that proves the architecture works on the customer's actual data. POC code is high-pressure: it has to demo well, but you'll never own it long-term, so engineering trade-offs are different than production work.

— **Procurement translation.** You attend the meeting where the customer's CIO and your AE talk pricing. You're the technical conscience: when the AE promises something the model can't do, you intervene politely.

— **Implementation hand-off.** You write the runbook for the customer's engineering team. Sometimes you stay through cutover, sometimes you exit at contract signing.

— **Reference customer creation.** Successful deployments become case studies. You write the case study with the customer's marketing team. This is undervalued by ICs but compensated heavily for senior+ levels.

If you've shipped 3-4 of these, you're qualified.
      `.trim(),
    },
    {
      heading: 'Why now (the 2026 window)',
      body: `
2024-25 was when AI moved from "experiment" to "buy committee." Enterprise procurement now has line items for AI tooling. The bottleneck is no longer "should we use AI" — it's "which AI vendor and how do we integrate it without ripping our SOC2 controls."

Foundation labs and AI infra companies are hiring SA aggressively because every enterprise deal larger than $100k ARR involves a 4-8 week SA engagement. The pool of candidates with both AI depth AND enterprise sales muscle is genuinely small. Career-switchers from cloud SE roles (AWS, GCP, Azure) into AI SA are the most successful pattern we see.

If you're an experienced SA on traditional cloud / data products, your AI SA pivot window is open through 2027 — after that the labor market catches up.
      `.trim(),
    },
    {
      heading: 'How to position your resume',
      body: `
The career-ops rubric scores SA resumes hardest on Block E ("evidence of revenue impact"). Resumes that read "supported sales team" without a deal-size number score below 3.5. Rewrite to surface:

— **Deal sizes you closed or supported.** "Lead SA on $2.4M Snowflake AI deployment for Fortune-500 retailer" beats "supported AI sales pursuits."
— **Customer outcomes, not your activity.** "Customer reduced contract review time from 12 days to 18 hours, cited as reference for 3 follow-on deals" beats "designed contract review architecture."
— **Time-to-value numbers.** "POC delivered in 4 weeks, production cutover in 11 weeks" beats "led implementation."
— **Translation work explicitly named.** "Worked with Customer's CISO to map our SOC-2 controls to their procurement matrix; closed deal blocked on compliance for 9 months" — exactly the senior-IC SA narrative hiring managers want.

Lakshya's archetype detector flags SA resumes lacking deal-context as ai-platform mismatches. If your resume reads like an engineering CV, the rubric will tell you that's why you're not landing SA loops.
      `.trim(),
    },
  ],

  interviewLoop: [
    {
      stage: 'Recruiter screen',
      format: '20-30 min phone',
      signal: 'Sales/SE background + AI exposure + comp + region (SA roles often have territory)',
      prep: 'One-line summary of your largest deal (or POC) + the customer outcome. Ready to discuss territory + travel expectations.',
    },
    {
      stage: 'Hiring manager call',
      format: '45-60 min',
      signal: 'Can you talk about customers without selling? Have you driven actual outcomes vs been a meeting attendee?',
      prep: '2 customer stories with $ outcomes + technical specifics. Be ready to discuss a deal you LOST and what you learned.',
    },
    {
      stage: 'Customer simulation / role-play',
      format: '60-90 min',
      signal: 'Live: interviewer plays a skeptical CTO/VP. You discover, scope, and propose. They probe for technical AND commercial depth.',
      prep: 'Pre-build 4 reference architectures: (1) RAG over confidential docs, (2) coding assistant for an existing engineering org, (3) customer-support agent, (4) document classification at enterprise scale. Practice 30/60/90 day discovery → POC → cutover plans aloud.',
    },
    {
      stage: 'Technical: architecture deep-dive',
      format: '60 min',
      signal: 'Can you reason about a large enterprise integration end-to-end? Identify the SOC2 / GDPR / VPC / data-residency landmines?',
      prep: 'Be ready to design a customer integration on a whiteboard. Know the actual deployment models: SaaS multi-tenant, dedicated tenant, customer\'s VPC, on-prem. Discuss when to use each.',
    },
    {
      stage: 'Cross-functional / sales partnership',
      format: '45 min, often with AE leadership',
      signal: 'Can you partner with sales without becoming sales? Can you push back on overcommit politely?',
      prep: 'Story: a deal where you said "no, the model can\'t do that" to your own AE. How you reframed and saved the deal vs walking away.',
    },
    {
      stage: 'Executive / VP-of-engineering',
      format: '45-60 min',
      signal: 'Strategic depth. Can you operate beyond a single account?',
      prep: 'Have an opinion on the company\'s ICP, current GTM motion, the deal types they should chase vs avoid. Founders read passivity as no-hire.',
    },
  ],

  skills: [
    {
      category: 'Required',
      skills: ['Customer-facing presentation experience (executive audience)', 'Reference architecture drawing (Miro / Lucidchart / whiteboard)', 'POC engineering — Python or TypeScript at production-near quality', 'SQL fluency for data-related discoveries', 'AI-stack literacy: foundation models, RAG, agents, evals', 'Procurement / SOC-2 / contract terminology comfort', 'Cloud-platform fluency in at least 2 of AWS / GCP / Azure'],
    },
    {
      category: 'Preferred',
      skills: ['Hands-on with at least one Anthropic / OpenAI / Gemini API integration in production', 'Salesforce or similar CRM hygiene', 'Experience writing internal sell-thru kits + battle cards', 'Public speaking — webinars, conferences, customer events', 'Experience scoping deployments in regulated industries (finance, healthcare, gov)'],
    },
    {
      category: 'Bonus',
      skills: ['Prior pre-sales or post-sales engineering at AWS / GCP / Snowflake / Databricks', 'Multi-language fluency for non-English-speaking territories', 'Co-authored case study published by your company\'s marketing team', 'Domain depth in one regulated vertical', 'Direct VP-of-engineering customer relationships you brought to your last company'],
    },
  ],

  salaryBands: [
    { region: 'US (SF / NY)',     iC: '$180-260k OTE', staff: '$260-400k OTE', principal: '$400-600k+ OTE', source: 'levels.fyi 2026Q1, RepVue OTE bands SA / Pre-sales' },
    { region: 'US (Remote)',      iC: '$160-230k OTE', staff: '$230-340k OTE', principal: '$340-500k OTE',  source: 'levels.fyi geo-adjusted SA' },
    { region: 'India (metro)',    iC: '₹40-75 LPA',    staff: '₹75-140 LPA',   principal: '₹140-260 LPA',   source: 'levels.fyi India SA + Salesforce/AWS public ranges' },
    { region: 'Europe (London)',  iC: '£90-150k OTE',  staff: '£150-240k OTE', principal: '£240-360k OTE',  source: 'levels.fyi UK SA' },
    { region: 'Europe (Amsterdam)',iC: '€90-140k OTE', staff: '€140-210k OTE', principal: '€210-310k OTE',  source: 'kununu + AWS / Snowflake EU bands' },
  ],

  rejectionPatterns: [
    {
      pattern: '"Engineer in SA clothing"',
      why: 'Strong technical resume, but everything reads as an engineering output (built X, shipped Y). No customer conversation, no deal context, no outcome tied to the customer\'s metric.',
      recovery: 'Rewrite every customer-facing engineering project with the customer\'s outcome first, your technical work second. "Reduced our enterprise customer\'s legal review SLA from 12 days to 18 hours" beats "Built a contract-classification pipeline."',
    },
    {
      pattern: '"Sales without depth"',
      why: 'Strong customer-facing background, transitioned to AI from a generic SE role, but interviews surface that the candidate can\'t reason about model failure modes / cost / latency at scale. Hiring manager fears the SA will overcommit and ship technical debt to customers.',
      recovery: 'Spend 3-4 weeks shipping a small AI POC against a real public dataset. Build it end-to-end. Then talk about THAT specifically in interviews — the depth signal lands.',
    },
    {
      pattern: '"No regulated-industry exposure"',
      why: 'Senior+ SA candidate at a foundation lab can\'t articulate how SOC-2 / HIPAA / FedRAMP / GDPR shape an AI deployment\'s architecture. In 2026 enterprise AI deals are >50% in regulated verticals — this is a hard senior bar.',
      recovery: 'Read your target company\'s public compliance docs (Trust Center pages). Prep specific architectures: how does data residency change with EU customers? What controls flip when HIPAA applies? Bring this to the architecture interview.',
    },
    {
      pattern: '"No deal narrative"',
      why: 'Resume lists technical implementations but no $ tied to any of them, no customer name (even anonymized: "Top-3 US bank"), no commercial outcome. Reads as "individual contributor who happened to be near sales."',
      recovery: 'For each customer-facing project, surface: anonymized customer profile, deal size or comparable proxy (project budget, license value), the commercial outcome (renewed, expanded, referenced), and the time-to-value. Lakshya\'s CV tailor reformats this without inventing numbers.',
    },
  ],

  faq: [
    {
      q: 'Do I need a sales background to land AI SA?',
      a: 'You need customer-facing comfort, not a sales background per se. Engineers who\'ve led customer-specific deployments, ex-consultants, or strong support engineers can transition in. The bar is whether you can run a discovery call without panicking.',
    },
    {
      q: 'Will commission really hit if I switch from a base-only role?',
      a: 'Realistic OTE attainment for AI SA in 2026 is 75-105% of plan in the first year — much higher than traditional SaaS SA (50-70%) because the deals are easier to close in a hot market. Set expectations: 30-40% of comp is variable, with quarterly accelerators.',
    },
    {
      q: 'Foundation lab SA vs cloud-platform SA (AWS / GCP) — which?',
      a: 'Foundation labs pay better but have shorter career ladders and fewer customers per SA. Cloud platforms offer career stability, larger territories, and more enterprise depth. If you optimize for OTE, go foundation lab; if you optimize for tenure-survivable career, cloud platform.',
    },
    {
      q: 'Will agents replace SA roles?',
      a: 'No. Agents amplify SA productivity (auto-drafted POC scaffolding, auto-generated reference architectures, auto-summarized customer calls) but the customer wants a human translating capability into commitment. The role gets more leveraged, not eliminated.',
    },
    {
      q: 'How does Lakshya help specifically for this archetype?',
      a: 'Three ways: (1) the archetype detector distinguishes AI SA from AI Platform from Forward-Deployed when JD language overlaps. (2) The CV tailor reformats engineering projects through a customer-outcome lens without inventing $ figures. (3) The story bank captures discovery / objection-handling stories tagged "solutions-architect" — high reuse value across SA loops which all probe similar themes.',
    },
  ],
}
