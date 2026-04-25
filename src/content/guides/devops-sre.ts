import type { ArchetypeGuide } from './ai-platform'

export const devopsSreGuide: ArchetypeGuide = {
  slug: 'devops-sre',
  archetype: 'devops-sre',
  title: 'How to land a DevOps / SRE role in 2026',
  metaDescription: 'A senior-IC playbook for landing DevOps / SRE / Platform Engineering roles in 2026 — what hiring managers screen for at Cloudflare / Datadog / Stripe / fintech / infra companies, the on-call + system-design loop, salary bands, and how to position incident-ownership on the career-ops A-G rubric.',
  tagline: 'Keep production up and the budget under control.',
  publishedAt: '2026-04-25',
  updatedAt: '2026-04-25',

  intro: `
DevOps / SRE / Platform Engineering — three names for overlapping work that owns the runtime substrate the rest of the company depends on. The discipline matured through 2020-25; the senior-IC bar is now sharply defined: you've owned a production incident at $1M+ revenue exposure, you can read a Grafana dashboard in 30 seconds and find the root cause, and you've shipped infrastructure-as-code that other engineers actually trust.

If you've held an on-call rotation for a critical system, debugged a cascading failure under deadline, or stood up an observability stack from scratch, you're qualified. The 2026 market is healthy at the senior-IC bar; mid-level is more competitive.

Lakshya's eval corpus has 180+ A-G evaluations against DevOps / SRE / Platform roles across 110 companies. The pattern that scores 4.0+ leans heavily on incident-ownership and capacity-planning narratives.
  `.trim(),

  whoHires: [
    'Infra-as-product (Cloudflare, Datadog, Vercel, Sentry, Supabase, Neon, Replicate)',
    'Fintech with stringent uptime requirements (Stripe, Plaid, Brex, Mercury, Razorpay, Cred)',
    'Big tech (Google SRE, Meta Production Engineering, Amazon Operations, Microsoft Azure SRE)',
    'AI infra (OpenAI Infrastructure, Anthropic Compute, AWS Bedrock backend, Modal, Together)',
    'Productivity SaaS at scale (Notion, Linear, Slack, Atlassian, Asana platform teams)',
  ],

  sections: [
    {
      heading: 'What this archetype actually does',
      body: `
Senior-IC DevOps / SRE / Platform in 2026:

— **Infrastructure-as-code at scale.** Terraform / Pulumi / OpenTofu modules used by 10+ engineering teams. Module versioning. Drift detection. Plan-review discipline. You\'ve owned a Terraform refactor that touched production safely.

— **Kubernetes depth.** Beyond \"I know kubectl.\" Operators / CRDs. StatefulSet patterns. PDB / HPA tuning. Network policies. Service mesh (Istio / Linkerd). You\'ve debugged a CrashLoopBackOff that wasn\'t the obvious one.

— **Observability stack ownership.** Prometheus + Grafana / Datadog / New Relic at production. SLO definition + error-budget management. Distributed tracing (OpenTelemetry, Jaeger). You\'ve cut MTTD or MTTR materially via dashboard improvements.

— **CI/CD pipelines.** GitHub Actions / GitLab CI / Buildkite at scale. Parallelization. Caching. Reproducible builds. Deploy-to-prod gates. Canary / blue-green / progressive rollouts. You\'ve owned the pipeline through 100+ deploys / week.

— **On-call ownership.** You\'ve held a rotation for a critical system. You\'ve been paged at 3am, found the root cause, written the postmortem, and shipped the fix. The senior-IC bar in 2026 explicitly screens for this story.

— **Capacity + cost.** AWS / GCP / Azure cost analysis as a regular practice. Reservations / Savings Plans. Right-sizing. Spot-instance strategy. You\'ve cut a non-trivial bill (15%+) on a real workload.

— **Security baseline.** IAM policies. Secrets management (Vault / SOPS / cloud-native KMS). Network segmentation. SOC 2 control mapping. You can map a control to an actual technical mechanism.

— **Incident response discipline.** Severity definitions. Communication during outages. Stakeholder updates. Postmortem authorship. The bar at engineering-led shops (Stripe, Cloudflare) is real.

If you\'ve shipped 5-6 of these, you\'re at the senior-IC bar.
      `.trim(),
    },
    {
      heading: 'Why now (the 2026 DevOps market)',
      body: `
Three trends shape 2026 hiring:

— **Platform Engineering as the dominant title.** Through 2024 most JDs said "DevOps Engineer" or "SRE." 2026 winning JDs say "Platform Engineer." The work is the same; the framing emphasizes treating internal infra as a product with engineering-customer empathy.

— **Cost discipline is back.** Post-2022 macro shift made cloud bill optimization a senior-IC differentiator again. Candidates who can articulate FinOps work — Reserved Instances, Spot strategy, autoscaling tuning, tiered storage — outpace candidates who only know "deploy and ship."

— **Agentic ops on the horizon.** Coding-agent companies (Cognition, Cursor) and AI-product companies are starting to use agents for incident triage, runbook execution, and capacity-planning analysis. Senior IC SRE who can both shape what agents do AND debug when they go wrong are emerging as the most valuable specialty.

If your background is ops without recent IaC depth, the 2026 senior bar is harder to clear. Spend 4-6 months getting Terraform / Pulumi production work behind you before applying senior.
      `.trim(),
    },
    {
      heading: 'How to position your resume',
      body: `
SRE resumes get rejected most often on Block D ("trade-off articulation") and Block F ("evidence of incident ownership"). Below-4.0 patterns:

— **Tools-tour resume.** "Used Terraform, Kubernetes, Prometheus, Grafana, Datadog, ArgoCD, Spinnaker." Catalog without scale, problem statement, or trade-off. Senior screeners pattern-match to junior.

— **No SLO / error-budget work.** Mid-IC and below talks about "uptime." Senior-IC talks about defined SLOs, error-budget burn, and how the team prioritizes around it.

— **No incident ownership.** Resume describes operational work without naming an actual outage you debugged + postmortem you authored. The hiring committee fears the candidate will freeze in a real incident.

— **No cost numbers.** Claims of "optimized infra costs" without dollar amounts are noise.

Rewrite to surface:

— **Numbers that imply scale.** "Owned Kubernetes cluster running 800+ pods across 4 regions, supporting $50M ARR product." Specific.
— **Trade-offs explicitly named.** "Migrated from Helm to Kustomize for 12 services; gained per-environment overlay clarity at the cost of some templating power. Documented in RFC, accepted across team."
— **Failure modes you owned.** "Diagnosed cascading retry storm during downstream provider outage; designed circuit breaker that capped failure-mode amplification across 14 services. Postmortem available on request."
— **Cost wins.** "Cut AWS bill 22% over 3 quarters via right-sizing + Reserved Instance strategy + spot-instance migration on stateless workloads. Saved $480k annualized."
— **SLO + error-budget work.** "Defined and operated 3 SLOs (latency / availability / saturation) for the auth service; team prioritized infrastructure work using error-budget burn rate as the gating signal."

Lakshya's archetype detector classifies SRE / DevOps / Platform JDs cleanly under "devops-sre" archetype. The keyword tightening done in 2026-04-25 means observability-heavy AI Platform JDs no longer false-match here.
      `.trim(),
    },
  ],

  interviewLoop: [
    {
      stage: 'Recruiter screen',
      format: '20-30 min phone',
      signal: 'Logistics + comp + visa + on-call appetite',
      prep: 'One-line: "I owned X infrastructure at Y scale; on-call participated in Z rotation." Be honest about on-call willingness — this role gates on it.',
    },
    {
      stage: 'Hiring manager call',
      format: '45-60 min',
      signal: 'Can you talk about infra with depth — IaC, K8s, observability, on-call? Have you owned a real incident?',
      prep: '2 stories: a perf or cost win you led, an incident you owned the postmortem on. Numbers + before/after.',
    },
    {
      stage: 'Coding — practical',
      format: '60-90 min, often pair-programming',
      signal: 'Production-quality code under pressure. Bash / Go / Python. Error handling, idempotency, retry-safety.',
      prep: 'Practice 4 problem types: (1) write an idempotent Kubernetes operator-style reconcile loop, (2) implement a circuit breaker with sliding window, (3) build a parallelized rollout coordinator with rollback, (4) write a metric-emitter wrapper for an arbitrary HTTP client.',
    },
    {
      stage: 'System design — infrastructure',
      format: '60-90 min',
      signal: 'Can you architect a critical system end-to-end? IaC layout, K8s topology, observability strategy, on-call model, deploy pipeline?',
      prep: 'Pre-draft 4 systems: (1) multi-region payment processor with regulatory data-residency, (2) CI/CD pipeline that deploys 200 services to 3 environments, (3) observability stack for 100-engineer org, (4) Kubernetes platform-as-product team\'s service catalog.',
    },
    {
      stage: 'Incident simulation',
      format: '60 min',
      signal: 'Live: interviewer plays a simulated incident. You debug under pressure, communicate clearly, write the postmortem outline.',
      prep: 'Practice incident vocabulary aloud: severity definitions, blast radius, customer-facing impact, MTTR, MTTD. Lead with stabilizing the bleed; root-cause comes second.',
    },
    {
      stage: 'Behavioral / values',
      format: '45 min',
      signal: 'On-call burnout management, cross-team partnership, scope cuts, performance-review fairness.',
      prep: '4 STAR+R stories — incident postmortem you authored that shipped real fixes, on-call shift that stuck with you, infrastructure debt you advocated cleanup for, mentorship.',
    },
  ],

  skills: [
    {
      category: 'Required',
      skills: ['Terraform / Pulumi / OpenTofu — modules, state, plan-review discipline', 'Kubernetes depth (CRDs, operators, networking, RBAC)', 'Cloud platform fluency in 1-2 of AWS / GCP / Azure', 'Linux + bash + scripting (Python or Go)', 'Observability stack hands-on (Prometheus + Grafana, Datadog, OpenTelemetry)', 'CI/CD pipeline ownership at scale', 'On-call rotation experience'],
    },
    {
      category: 'Preferred',
      skills: ['SLO / error-budget operationalization', 'FinOps / cost optimization at $1M+ annual scale', 'Service mesh hands-on (Istio / Linkerd)', 'Multi-region / disaster-recovery design', 'Secrets management at scale (Vault / SOPS / KMS)', 'IaC linting + policy-as-code (OPA, Sentinel)'],
    },
    {
      category: 'Bonus',
      skills: ['Authored CNCF / open-source operator', 'Contributor to Terraform / K8s / Prometheus', 'Production incident at $10M+ exposure you owned', 'Security clearance (for gov / defense roles)', 'Postmortem published externally / on engineering blog'],
    },
  ],

  salaryBands: [
    { region: 'US (SF / NY)',     iC: '$180-260k',  staff: '$260-420k',  principal: '$420-700k+', source: 'levels.fyi 2026Q1, FAANG SRE + scale-out infra' },
    { region: 'US (Remote)',      iC: '$160-230k',  staff: '$230-360k',  principal: '$360-560k',  source: 'levels.fyi geo-adjusted SRE' },
    { region: 'India (metro)',    iC: '₹35-65 LPA', staff: '₹65-125 LPA', principal: '₹125-240 LPA', source: 'levels.fyi India + Razorpay / Cred / Slice / Flipkart SRE' },
    { region: 'Europe (London)',  iC: '£85-135k',   staff: '£135-210k',  principal: '£210-340k',  source: 'levels.fyi UK + Cloudflare London / Stripe London' },
    { region: 'Europe (Berlin)',  iC: '€80-125k',   staff: '€125-190k',  principal: '€190-290k',  source: 'kununu + Delivery Hero / N26 SRE' },
  ],

  rejectionPatterns: [
    {
      pattern: '"Tools-tour resume"',
      why: 'Resume reads as a tech catalog: Terraform, Kubernetes, Prometheus, Grafana, Datadog, ArgoCD, Spinnaker, Vault. No problem statement, scale, or trade-off.',
      recovery: 'Pick 5 bullets per role. Each bullet must contain: the operational problem, the technical choice, a number that implies scale (services, deploys, traffic), and the trade-off. Drop everything else.',
    },
    {
      pattern: '"No incident ownership"',
      why: 'Resume describes infra work but no story of an outage you owned the postmortem on. Hiring committee fears candidate will freeze in a real incident.',
      recovery: 'Add 1-2 bullets per role explicitly on incidents owned. Even a sev-2 internal-only outage counts. The narrative pattern is: "diagnosed [root cause] during [outage type]; designed [mechanism] that prevented the regression class."',
    },
    {
      pattern: '"No SLO / error-budget work"',
      why: 'Senior+ SRE candidate talks "uptime" generically. Hiring committee in 2026 expects defined SLOs and error-budget operationalization.',
      recovery: 'If you have it, add 1 bullet per role on SLO ownership. If you genuinely don\'t (smaller-team work without SLO discipline), be honest in interviews — the framing "we operated without formal SLOs but tracked X informally" is more credible than fake SLO claims.',
    },
    {
      pattern: '"No cost numbers"',
      why: 'Senior+ candidate at a Fortune-500 with no FinOps work to point to. In 2026 cost discipline is a senior-IC differentiator.',
      recovery: 'Calculate the cost of one workload you operated retroactively. Add 1 bullet quantifying impact even if the work was implicit ("contributed to autoscaling tuning that maintained ARR margin during 3x traffic spike").',
    },
  ],

  faq: [
    {
      q: 'DevOps / SRE / Platform Engineer — are these the same role?',
      a: 'Overlapping practice, different framings. DevOps is older and broader. SRE is Google\'s framing — error-budget-focused, often deployed in scale-out infra. Platform Engineering is the 2026 framing — emphasizes internal-engineering-customer empathy. Pick the framing your target company uses; the underlying skill set transfers.',
    },
    {
      q: 'How important is K8s depth in 2026?',
      a: 'Critical at scale-out infra companies. Less critical at smaller shops or those running serverless-first (Vercel, Cloudflare Workers). For senior bar at most companies, you should be able to debug a CrashLoopBackOff that isn\'t the obvious one.',
    },
    {
      q: 'Cost-optimization (FinOps) — separate role or part of SRE?',
      a: 'In 2026, part of senior SRE. Smaller companies may have a dedicated FinOps function but most senior-IC roles include FinOps responsibility implicitly.',
    },
    {
      q: 'Will agents replace SRE work?',
      a: 'Compresses bottom-40% (basic alerting, runbook execution, log search). Doesn\'t touch top-60% (incident debugging under pressure, capacity planning, SLO design, security architecture). Senior IC SRE who shape what agents do AND debug when they go wrong are emerging as the most valuable specialty.',
    },
    {
      q: 'How do I show on-call ownership without an SRE title?',
      a: 'Specifics. "Held primary on-call rotation for the auth service; 4-week cycle, 11 incidents owned over 18 months." Generic "I\'ve been on-call" reads as low-confidence.',
    },
    {
      q: 'How does Lakshya help specifically for this archetype?',
      a: 'Three ways: (1) the archetype detector classifies SRE / DevOps / Platform JDs cleanly into "devops-sre" — distinct from ai-platform (which has its own observability work) and backend (which has its own perf work). (2) The CV tailor reframes ops work into operationally-specific language. (3) The story bank captures incident-postmortem stories tagged "devops-sre" — every loop probes them.',
    },
  ],
}
