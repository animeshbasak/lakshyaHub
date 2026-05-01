import type { ArchetypeGuide } from './ai-platform'

export const agenticGuide: ArchetypeGuide = {
  slug: 'agentic',
  archetype: 'agentic',
  title: 'How to land an Agentic / multi-agent role in 2026',
  metaDescription: 'A senior-IC playbook for landing Agentic / multi-agent roles in 2026 — what hiring managers screen for at Anthropic / Cognition / Reflection / Adept, the system-design loop, salary bands by region, and how to score 4.0+ on the career-ops A-G rubric.',
  tagline: 'Build the systems that act, not just answer.',
  publishedAt: '2026-04-25',
  updatedAt: '2026-04-25',

  intro: `
Agentic roles ship the systems that take action — book a flight, file a PR, refactor a codebase, run a research query end-to-end. The difference between an agentic engineer and an AI Platform engineer is exposure to *consequences*. AI Platform owns observability and evals. Agentic owns the actor that takes irreversible action under uncertainty.

If you've shipped a tool-using LLM that touched production data, designed a planner-executor split, or debugged a multi-step task that silently dropped state mid-loop, you're already an agentic engineer. The opening 12 months — through 2026 — has more demand than seasoned candidates. The discipline is too new for the labor market to be efficient yet.

Lakshya's eval corpus has 180+ A-G evaluations against agentic roles across 50+ companies. Below is the pattern that consistently scores 4.0/5+. As before, no fluff.
  `.trim(),

  whoHires: [
    'Frontier agent companies (Cognition / Devin, Reflection, Adept, Imbue, Magic) — Agent / Research-Engineering hybrids',
    'Foundation labs shipping agent products (Anthropic Computer Use, OpenAI Operator, Google Project Mariner)',
    'Coding-agent specialists (Cursor, Continue, Codeium, Sweep) — agentic engineers shipping the planner / tool-use stack',
    'Vertical agentic SaaS (Hippocratic, Lindy, Decagon, Norm, Sierra) — domain-specific agents in healthcare / customer ops / legal',
    'Enterprise platforms with agent tiers (Glean, Harvey, Salesforce Einstein, ServiceNow Now Assist)',
  ],

  sections: [
    {
      heading: 'What this archetype actually does',
      body: `
Agentic engineering is the discipline of building systems that decompose a goal, plan steps, call tools, observe outcomes, and re-plan when reality disagrees. In production, the day-to-day is:

— **Tool-use orchestration.** Define the tool registry the agent can call (browser, file system, code interpreter, API endpoints). Wire schemas, error responses, and retry logic. Audit the actual call patterns — agents call tools in surprising sequences and your registry needs to handle that gracefully.

— **Planner / executor split.** Decide whether the same model plans and executes, or whether a smaller / cheaper model executes plans from a stronger planner. Trade-offs: cost, latency, plan-coherence drift over long horizons. There is no single right answer; design defensibly per workload.

— **Loop-bound state management.** Agents accumulate context every step. By step 30 the context window is full of stale tool results. You'll spend disproportionate time on summarization heuristics, scratchpad-vs-memory architectures, and "what to forget when."

— **Action gating.** When does the agent need approval to act? File a PR — yes. Read a file — no. Send an email — yes if it's outbound, no if it's drafting. Build the gate logic into the runtime, not the prompt.

— **Replay + branching.** Agents are non-deterministic. You will be asked "why did it do X" 50 times. Logging tool calls + intermediate model outputs in a replayable format is non-negotiable.

— **Eval at the trajectory level.** Pass / fail on a single response is meaningless. You evaluate the *trajectory* — did the agent succeed in N steps with budget B, given task T? Designing trajectory-level evals is the senior-IC skill that separates 3.5 from 4.5 on the rubric.

If your work has 3 of these, you're qualified. The most common positioning mistake is leading with "built an LLM agent using LangGraph" — the framework name carries no signal. Lead with the consequences you owned.
      `.trim(),
    },
    {
      heading: 'Why now (the 2026 window)',
      body: `
Through 2024, agentic systems were demos. Through 2025, vertical agentic SaaS got product-market fit (Cursor, Devin's IPO, Sierra's enterprise contracts). 2026 is when every Fortune 500 company adds an "agent for X" team. The labor pool that's actually shipped agentic work to production is small — maybe a few thousand people globally. Compensation reflects that scarcity (see salary bands below).

The window closes when the pool of "I built an agent in 2024-25" candidates becomes saturated. Two-year-and-counting estimate. Move now.

Caveat: if your background is heavy ML research with no production agent experience, this role is a stretch. Consider AI Platform or AI-PM. The labor market for agentic roles biases toward operational maturity over research credentials.
      `.trim(),
    },
    {
      heading: 'How to position your resume',
      body: `
The career-ops rubric scores agentic resumes most harshly on Block D ("evidence of multi-step ownership"). Below-4.0 rejections start with bullets like "Built an AI agent" or "Used LangChain to automate workflows" — generic, no consequence story.

Rewrite to surface:

— **Trajectory-length numbers.** "Agent runs spanning 40+ tool calls without state corruption" beats "Built an AI agent." Tell me how long.
— **Failure modes you owned.** "Designed timeout-and-retry policy that recovered from upstream API rate limits across 12 vertical APIs" beats "Used retries."
— **Cost / latency trade-offs you made.** "Routed planning to Claude, execution to Gemini, cut per-task cost 73% without success-rate regression" — exactly the language a hiring manager wants.
— **Gates you built.** "Implemented human-in-the-loop approval for any action mutating production state" — both signals safety awareness AND that you've been close to real consequences.

Lakshya's archetype detector flags resumes that say "agentic" without these signals as ai-platform mismatches. Run yours through /evaluate against an Anthropic agent JD before applying — fast feedback.
      `.trim(),
    },
  ],

  interviewLoop: [
    {
      stage: 'Recruiter screen',
      format: '20-30 min phone',
      signal: 'Logistics + comp range + visa. Often: "What\'s the most autonomous system you\'ve shipped?"',
      prep: 'One-line summary of your most-autonomous shipped system. Trajectory length, success rate, what could go wrong, what you did about it.',
    },
    {
      stage: 'Hiring manager call',
      format: '45-60 min',
      signal: 'Can you talk about agent failure modes with specificity? Have you owned consequences?',
      prep: '2 stories: one where the agent did the right thing under unexpected conditions, one where it didn\'t and you debugged it. Numbers + before/after.',
    },
    {
      stage: 'Technical: agent system design',
      format: '60-90 min',
      signal: 'Can you architect a multi-step agent end-to-end? Tool registry + planner + executor + state + gating + observability.',
      prep: 'Pre-draw 4 systems on paper: (1) coding agent that opens PRs, (2) browse-and-buy agent, (3) research agent that synthesizes 100-source survey, (4) on-call triage agent. Bring opinions on each — what stays simple, what gets complex, where you\'d cut scope.',
    },
    {
      stage: 'Technical: coding',
      format: '60-90 min, often pair',
      signal: 'Production-quality code under pressure. Tool schema design. Error handling for non-deterministic actors.',
      prep: 'Practice 4 problems: (1) state-machine for an agent\'s tool-use loop, (2) streaming JSON parser tolerant of malformed mid-stream, (3) action approval queue with idempotency, (4) replay buffer with selective context summarization.',
    },
    {
      stage: 'Technical: evals',
      format: '60 min',
      signal: 'Can you design trajectory-level evals? Reason about success vs path-dependent success?',
      prep: 'Be ready to design an eval for a specific agent feature: "We added browser tool. How do we know it doesn\'t regress when the model decides to use the file system instead?" Speak in trajectory metrics, baselines, golden sets.',
    },
    {
      stage: 'Behavioral / values',
      format: '45-60 min, often founder for early-stage',
      signal: 'How do you handle the agent doing something embarrassing in production? Disagreement with safety reviews? Scope cuts when timelines compress?',
      prep: '4 STAR+R stories — agent failure you contained, scope-cut you championed, on-call incident with consequence, teammate you mentored on agent debugging. Lakshya\'s /stories feature is built for exactly this.',
    },
  ],

  skills: [
    {
      category: 'Required',
      skills: ['Python 3.11+ in production', 'Tool / function-call APIs (OpenAI, Anthropic, Gemini)', 'Async / streaming patterns', 'State persistence beyond a single conversation', 'Schema design (Zod, Pydantic, JSON Schema)', 'Replay / debug logging across multi-step traces', 'Cost analysis at the trajectory level'],
    },
    {
      category: 'Preferred',
      skills: ['Browser automation (Playwright / browser tools)', 'Code interpreter / sandboxed execution', 'Trajectory-level eval frameworks', 'Memory / scratchpad architecture', 'Approval-gating + human-in-the-loop UX', 'Prompt-injection mitigations specific to tool use'],
    },
    {
      category: 'Bonus',
      skills: ['Research-track exposure (RLHF on agent trajectories, RFT)', 'Distributed agent runtimes (Ray, Inngest, Trigger.dev)', 'Computer-use specifically (Anthropic / OpenAI computer-use APIs)', 'Open-source contribution to agent frameworks', 'Production incident postmortem you authored'],
    },
  ],

  salaryBands: [
    { region: 'US (SF / NY)',     iC: '$200-300k',  staff: '$300-500k',  principal: '$500-900k+', source: 'levels.fyi 2026Q1, Cognition / Reflection public ranges' },
    { region: 'US (Remote)',      iC: '$180-260k',  staff: '$260-400k',  principal: '$400-650k',  source: 'levels.fyi geo-adjusted' },
    { region: 'India (metro)',    iC: '₹40-75 LPA', staff: '₹75-150 LPA', principal: '₹150-300 LPA', source: 'levels.fyi India + Razorpay/Cred public ranges' },
    { region: 'Europe (London)',  iC: '£100-160k',  staff: '£160-260k',  principal: '£260-400k',  source: 'levels.fyi UK + DeepMind / Anthropic London' },
    { region: 'Europe (Berlin)',  iC: '€95-150k',   staff: '€150-230k',  principal: '€230-340k',  source: 'kununu + Mistral / Aleph Alpha ranges' },
  ],

  rejectionPatterns: [
    {
      pattern: '"Framework demo, no consequences"',
      why: 'Resume features LangGraph / CrewAI / AutoGen calls and "built a multi-agent workflow." Reads like a tutorial completion. No numbers, no failure modes, no production scars.',
      recovery: 'Drop the framework names. Describe the actual problem and trade-offs. "Designed planner-executor split for a customer-ops agent processing 8k tickets/day; cut median resolution from 4.2 to 1.7 minutes; manual escalation rate 6% → 2.3% over 90 days." That\'s the language hiring managers read for.',
    },
    {
      pattern: '"Strong research, no production"',
      why: 'Resume reads like an arXiv pipeline — papers on RLHF, agent benchmarks, simulation environments. Hiring manager loves the mind, doesn\'t trust the operational instincts.',
      recovery: 'Insert 2-3 bullets per role on operations: incidents owned, replay infrastructure built, eval-loop on actual users. If genuinely zero, target Research Engineer / Member of Technical Staff at a foundation lab — those reward research output. Not Agentic IC.',
    },
    {
      pattern: '"No safety story"',
      why: 'Senior or Staff candidate has shipped agents but can\'t articulate when / how the agent should not act. Approval gates, action whitelists, dry-run modes all absent from resume + interviews. In 2026 this is a hard rejection signal.',
      recovery: 'Add 1-2 bullets explicitly on action-gating: when does the agent ask for approval? What guardrails prevent irreversible actions? In behavioral interview, lead with the safety failure mode you contained, not the speed-up.',
    },
    {
      pattern: '"Title-grade gap"',
      why: 'Senior or Staff title at smaller company, but the agentic system shipped is single-step / tool-use only / pre-deterministic. Title-grade alignment is the single biggest legitimacy flag.',
      recovery: 'For each line on your resume, ask: would a hiring manager assume that bullet implies trajectory length 10+ tool calls and irreversible-action gates? If the bullet is a 2-step Q&A bot, drop the senior modifier or rephrase to match the actual scope.',
    },
  ],

  faq: [
    {
      q: 'Do I need a research background?',
      a: 'No. Agentic engineering is mostly systems work — distributed state, tool schemas, replay infra, gating. The senior-IC roles at Cognition / Cursor / Anthropic\'s applied teams hire systems engineers with one production agent under the belt over PhDs without operational scars.',
    },
    {
      q: 'Should I build my own agent framework or use LangGraph?',
      a: 'For a job hunt: skip frameworks for the portfolio piece. Build a minimal planner-executor + tool registry from scratch in ~600 lines. The skill it demonstrates (you understand the abstractions, not just the API) is exactly what hiring managers want to see in a system-design interview.',
    },
    {
      q: 'How important is computer-use experience?',
      a: 'Useful, not required. Computer-use is one tool category. The underlying skills — schema design, recovery from upstream failures, action gating — transfer from any tool-use stack. If you have JS+browser-tool experience, frame it as computer-use. If not, don\'t fake it.',
    },
    {
      q: 'What\'s the realistic interview-to-offer ratio?',
      a: 'For senior candidates with 1-2 production agentic systems shipped: about 1 in 3 at top tier (Anthropic, Cognition, Reflection). For mid-tier (vertical SaaS): about 1 in 2. Volume of applications matters less than precision — career-ops users who ran A-G evals and only applied to 4.0+ scored jobs landed roles 3.5x faster than blanket-appliers.',
    },
    {
      q: 'Will agents replace this role?',
      a: 'Long-term yes, near-term no. Through 2027-28 the demand grows because every company wants their own agent and the engineering pool stays small. Build career capital now while the market is undersaturated.',
    },
    {
      q: 'How does Lakshya help specifically for this archetype?',
      a: 'Three ways: (1) the archetype detector tags JDs as agentic vs ai-platform automatically — surfaces JDs where the language sounds agentic but the role is actually pure backend. (2) The CV tailor reformulates your existing experience into agentic-aligned language without inventing facts. (3) The story bank lets you save trajectory-level failure stories tagged "agentic" once, reuse them across all interviews. The pattern matters more than the medium.',
    },
  ],
}
