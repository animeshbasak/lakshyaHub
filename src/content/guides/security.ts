import type { ArchetypeGuide } from './ai-platform'

export const securityGuide: ArchetypeGuide = {
  slug: 'security',
  archetype: 'security',
  title: 'How to land a Security Engineer role in 2026',
  metaDescription: 'A senior-IC playbook for landing Security Engineer / AppSec / Cloud Security roles in 2026 — what hiring managers screen for at Cloudflare / Stripe / fintech / Snyk / Wiz, the threat-model + audit loop, salary bands, and how candidates score on the career-ops A-G rubric.',
  tagline: 'Reduce attack surface without breaking the ship-velocity.',
  publishedAt: '2026-04-25',
  updatedAt: '2026-04-25',

  intro: `
Security Engineering bifurcated through 2024-25 into recognizable specialties — Application Security (AppSec), Cloud / Infrastructure Security, Detection / SIEM, Identity & Access (IAM), Compliance Engineering. Most JDs in 2026 require senior IC depth in at least one specialty plus working knowledge across the others. The work is fundamentally judgment-heavy: identify what realistic attackers do, decide which controls actually move the threat curve, and ship the controls without becoming the team that everyone routes around.

The 2026 senior-IC bar combines technical depth (you can read code, you can read packet captures) with risk-judgment (you can articulate why this control is worth shipping and that one isn't) and cross-functional collaboration (you partner with engineering rather than gatekeep them).

If you've shipped controls that engineering teams adopted voluntarily — not just security recommendations they grudgingly implemented — you're qualified for senior-IC. Lakshya's eval corpus has 100+ A-G evaluations against security roles across 70 companies; the pattern that scores 4.0+ centers on threat-model articulation + measurable risk reduction.
  `.trim(),

  whoHires: [
    'Security-as-product (Cloudflare, Snyk, Wiz, Aqua, Crowdstrike, Cyera, Lacework, Sysdig)',
    'Infra-heavy companies with serious security needs (Stripe, Plaid, Cloudflare itself, Mercury, Brex)',
    'Big tech security orgs (Google Security, Meta Security, AWS Security, Microsoft MSRC)',
    'AI-native companies with new threat models (Anthropic, OpenAI, Mistral) — emerging AppSec for LLM products',
    'Government / defense (Palantir, Anduril, DOD contractors) — clearance-required roles',
  ],

  sections: [
    {
      heading: 'What this archetype actually does',
      body: `
Senior-IC security in 2026:

— **Threat modeling.** STRIDE, attack trees, MITRE ATT&CK reference. You can sit with a feature team and articulate the realistic attacker goals, capabilities, and likely paths. Senior bar: you produce threat models that engineering teams use, not just file-and-forget docs.

— **Code review for security.** AppSec specialists read PRs for SQLi, XSS, CSRF, SSRF, IDOR, deserialization, auth bypass. Cloud security specialists read Terraform / IaC for misconfigurations. The senior-IC differential: you find the bug that the static analyzer missed.

— **Identity and access.** OAuth flows in detail, SAML, OIDC, JWT pitfalls, session management, MFA enforcement, IAM least-privilege. You\'ve owned an IAM cleanup in production.

— **Cloud security.** AWS / GCP / Azure — security groups, network segmentation, service-to-service auth, secrets management, key rotation. The hands-on bar matters; "I read AWS docs" doesn\'t cut it for senior.

— **Vulnerability management.** SCA + SAST + DAST tooling. Dependency triage at 100+ daily alerts scale. Decision-making on which CVEs actually matter for your stack. You\'ve owned the pipeline that doesn\'t produce alert fatigue.

— **Detection and response.** SIEM tuning at production. Detection-as-code (Sigma rules, KQL). Incident response runbooks. You\'ve been on call for security incidents.

— **Compliance mapping.** SOC 2 Type 2, ISO 27001, HIPAA, GDPR. Mapping controls to actual technical mechanisms (not just docs). You\'ve been through at least one audit cycle.

— **AI / LLM security (emerging 2026).** Prompt injection, training-data poisoning, model exfiltration, output sanitization at scale. Senior bar in 2026 increasingly asks for at least familiarity here.

— **Cross-functional partnership.** Working with engineering rather than blocking them. Senior-IC bar: engineering teams want you in their planning meetings.

If you\'ve shipped 5-6 of these with clear specialty depth in at least one, you\'re at the senior-IC bar.
      `.trim(),
    },
    {
      heading: 'Why now (the 2026 security market)',
      body: `
Three trends shape 2026 hiring:

— **AppSec for LLM products is a new specialty.** Companies shipping LLM-product features want security engineers who understand prompt injection, output filtering, training-data hygiene, and the spectrum of jailbreak techniques. Lakshya\'s own security plan has explicit S4 LLM-abuse prevention work — every AI-shipping company in 2026 has the same need. Candidates with AppSec + LLM security crossover are the most-hired specialty in 2026.

— **Cloud security at scale-out infra companies.** Cloudflare, Stripe, Plaid, AWS itself — these companies hire cloud security engineers at premium comp. The bar combines IaC-review depth with identity / secrets-management / incident-response coverage.

— **Compliance engineering as a hiring lane.** Post-2023 regulatory tightening (EU AI Act, US state privacy laws, SOC 2 universalization), compliance engineering is a separate hiring lane at fintech and regulated industries. Senior-IC compliance engineers translate regulator requirements into Terraform modules + dbt models + IAM policies.

If you\'re a backend engineer pivoting into security, the 2026 path is AppSec + cloud security with hands-on Terraform + IaC linting. Avoid generic "security generalist" framing; specialty-anchored applications outperform.
      `.trim(),
    },
    {
      heading: 'How to position your resume',
      body: `
Security resumes get rejected most often on Block C ("operational specificity") and Block E ("evidence of risk reduction"). Below-4.0 patterns:

— **Audit / compliance focus without engineering.** Resume reads as policy work — wrote security docs, ran audits, attended meetings. No technical mechanisms shipped. Engineering-led shops pattern-match this to GRC (governance, risk, compliance) rather than security engineering.

— **Tool-tour resume.** "Used Burp, Snyk, Wiz, Crowdstrike, Splunk." Catalog without findings, fix-rate, or reduced-risk numbers. Senior screeners discount.

— **No specialty.** Generic "security engineer" without specialty anchor reads as junior at scale. Senior-IC bar wants AppSec / Cloud / IAM / Detection lean.

— **Findings-without-fixes culture.** Resume features bugs found but no follow-through to fix-rate, remediation timeline, or coordination with engineering. Hiring committee fears candidate is finding-machine without shipping discipline.

Rewrite to surface:

— **Numbers that imply scale.** "Owned AppSec for 3.4M LOC across 80 services; closed 240 critical / high findings over 18 months with mean fix-time 11 days."
— **Trade-offs explicitly named.** "Recommended deferring CVE-2024-XXXX for 8 weeks because exploitation vector required attacker network position we already mitigated; documented decision in risk-acceptance record signed by EVP Eng."
— **Failure modes you owned.** "Diagnosed credential-leak from CI logs; designed redaction-at-emit policy that prevented the regression class across 200+ pipeline jobs; postmortem authored."
— **Risk-reduction numbers.** "Reduced unmanaged AWS IAM users from 380 to 12 over 6 months; partnered with engineering managers on access-review cadence."

Lakshya\'s archetype detector classifies security JDs cleanly via appsec / IAM / SOC 2 / pentest / zero-trust keywords. Distinct from devops-sre and backend.
      `.trim(),
    },
  ],

  interviewLoop: [
    {
      stage: 'Recruiter screen',
      format: '20-30 min phone',
      signal: 'Logistics + comp + visa + clearance (for gov / defense) + specialty lean',
      prep: 'Pre-decide your specialty: AppSec, Cloud Security, IAM, Detection, Compliance Engineering. Specific.',
    },
    {
      stage: 'Hiring manager call',
      format: '45-60 min',
      signal: 'Can you talk about security with depth and specialty? Have you owned actual risk reduction?',
      prep: '2 stories: a critical finding you found + closed (with timeline), an ongoing risk-acceptance you defended. Numbers + clear specialty signal.',
    },
    {
      stage: 'Specialty deep-dive (e.g., AppSec)',
      format: '60-90 min',
      signal: 'Pick a CVE class. Walk through real exploitation, real detection, real remediation across the stack.',
      prep: 'Practice 4 specialty topics aloud: SSRF (Server-Side Request Forgery — discovery, exploitation, remediation), prototype pollution + supply-chain JS, privilege escalation in K8s RBAC, OAuth2 PKCE / token-binding pitfalls.',
    },
    {
      stage: 'Threat-modeling exercise',
      format: '60-90 min',
      signal: 'Live: design a threat model for a feature the interviewer describes. Adversary capability, attack paths, control choices, residual risk.',
      prep: 'Pre-draft 4 threat models: (1) payment-form on a SaaS, (2) third-party-data ingestion pipeline, (3) customer-facing API with rate limits + auth, (4) LLM-product chat with file upload. Practice STRIDE + attack trees aloud.',
    },
    {
      stage: 'Coding / IaC review',
      format: '60 min',
      signal: 'Read code or Terraform. Find the security bugs. Articulate impact + fix.',
      prep: 'Practice secure-code review aloud on small samples: 50-line Python web handler, 100-line Terraform module, 30-line K8s manifest. Aim for finding 2-3 issues per sample.',
    },
    {
      stage: 'Behavioral / values',
      format: '45 min',
      signal: 'Cross-team partnership without gatekeeping. Risk-acceptance discipline. Incident response stress.',
      prep: '4 STAR+R stories — risk-acceptance you negotiated, security finding you communicated to engineering team you partnered with, security incident you owned, mentorship.',
    },
  ],

  skills: [
    {
      category: 'Required (one specialty deep + working knowledge across)',
      skills: ['AppSec: SQLi/XSS/CSRF/SSRF/IDOR/auth-bypass at code-review depth', 'OR Cloud Security: AWS / GCP / Azure security at IAM + network + secrets depth', 'OR IAM: OAuth/OIDC/SAML/JWT in detail + IAM least-privilege at scale', 'OR Detection: SIEM tuning + Sigma / KQL detection-as-code', 'OR Compliance: SOC 2 / ISO 27001 / GDPR control mapping to technical mechanisms', 'Threat modeling — STRIDE, attack trees, MITRE ATT&CK', 'Vulnerability management — SCA + SAST + DAST triage', 'One scripting language for tooling (Python, Go)', 'Incident response participation'],
    },
    {
      category: 'Preferred',
      skills: ['Hands-on penetration testing (CTFs / bug bounties / professional pentests)', 'CIS benchmark / NIST CSF mapping', 'Terraform / Pulumi security review at production', 'OAuth / SSO implementation at scale', 'Detection engineering at production (custom Sigma / KQL rules)', 'Auditor-facing communication'],
    },
    {
      category: 'Bonus',
      skills: ['CVE assigned in your name', 'Published security research / blog / conference talk', 'Open-source security tool authored or maintained', 'AI / LLM security depth (prompt injection, training-data poisoning research)', 'Security clearance for government / defense roles', 'Bug-bounty hall-of-fame at major company'],
    },
  ],

  salaryBands: [
    { region: 'US (SF / NY)',     iC: '$170-260k',  staff: '$260-420k',  principal: '$420-700k+', source: 'levels.fyi 2026Q1, FAANG security + scale-out infra' },
    { region: 'US (Remote)',      iC: '$150-220k',  staff: '$220-340k',  principal: '$340-540k',  source: 'levels.fyi geo-adjusted security' },
    { region: 'India (metro)',    iC: '₹30-55 LPA', staff: '₹55-110 LPA', principal: '₹110-220 LPA', source: 'levels.fyi India + Razorpay / Cred / Slice security' },
    { region: 'Europe (London)',  iC: '£85-135k',   staff: '£135-210k',  principal: '£210-330k',  source: 'levels.fyi UK + Cloudflare London / Stripe London' },
    { region: 'Europe (Berlin)',  iC: '€80-125k',   staff: '€125-190k',  principal: '€190-290k',  source: 'kununu + N26 / Tier security' },
  ],

  rejectionPatterns: [
    {
      pattern: '"GRC in security clothing"',
      why: 'Resume reads as policy work — wrote security policies, ran audits, presented to executives. No technical mechanisms shipped. Engineering-led shops pattern-match to compliance role, not engineering.',
      recovery: 'Surface technical work first. Even if 70% of your time was governance / risk / compliance, lead with the 30% that was actual code review, IaC hardening, control implementation. Or apply to GRC roles where this is the right framing.',
    },
    {
      pattern: '"No specialty"',
      why: 'Generic "security engineer" framing without specialty anchor. Hiring managers can\'t pattern-match what to put you on.',
      recovery: 'Pick AppSec / Cloud / IAM / Detection / Compliance Engineering as your primary specialty. Lead with depth in that lane. Demonstrate working knowledge across the others as background, not equal-weight claims.',
    },
    {
      pattern: '"Findings without follow-through"',
      why: 'Resume features bugs found but no fix-rate, no remediation timeline, no engineering partnership story. Reads as security finding-machine without ship discipline.',
      recovery: 'For each finding category, surface mean fix-time, fix-rate %, partnered-with-team count. Senior-IC security is half the finding, half the partnership to fix.',
    },
    {
      pattern: '"No risk-reduction numbers"',
      why: 'Senior+ candidate talks "improved security posture" without quantification. In 2026 this is a hard senior bar.',
      recovery: 'Quantify by category: critical findings closed, IAM-cleanup count, MFA-coverage %, audit-control-mapping count. Without numbers it reads as junior-grade work.',
    },
  ],

  faq: [
    {
      q: 'Can I move from backend to security?',
      a: 'Yes — AppSec is the most-natural pivot from backend. The investment: 6-12 months on OWASP Top 10 depth, secure-code-review practice, threat modeling, one specialty hands-on (Burp Suite for AppSec, IaC scanners for cloud security). Bug bounty platforms (HackerOne, Bugcrowd) accelerate the practical bar significantly.',
    },
    {
      q: 'CISSP / OSCP / CEH — which certs matter for senior-IC security?',
      a: 'OSCP signals practical hands-on ability — meaningful for AppSec / pentesting roles. CISSP signals breadth — useful for senior+ Compliance Engineering or roles with management track. CEH is increasingly discounted. For senior-IC engineering, hands-on output (CTF performance, bug bounties, public security research) outweighs certs.',
    },
    {
      q: 'AI / LLM security — separate specialty?',
      a: 'Emerging in 2026. Companies shipping LLM products want AppSec engineers with LLM-specific knowledge: prompt injection, training-data poisoning, output sanitization, jailbreak technique awareness. Bonus, not required, but increasingly weighted.',
    },
    {
      q: 'Will agents replace security engineering?',
      a: 'Compresses bottom-50% (basic vulnerability scanning, alert triage, common-CVE response). Doesn\'t touch top-50% (threat modeling, novel-attack discovery, risk-acceptance judgment, cross-team partnership). Senior IC security gets more leveraged. Junior security analyst roles compress meaningfully.',
    },
    {
      q: 'Bug bounties — useful or distraction?',
      a: 'Useful for early-career to mid-IC pivot — accelerates practical hands-on bar significantly. For senior-IC bar at engineering-led shops, bug bounty alone isn\'t enough; you need partnership / shipping / risk-judgment narrative on top.',
    },
    {
      q: 'How does Lakshya help specifically for this archetype?',
      a: 'Three ways: (1) the archetype detector classifies security JDs cleanly via appsec / IAM / SOC 2 / pentest / zero-trust keywords. (2) The CV tailor reframes finding-heavy work into risk-reduction language. (3) The story bank captures threat-model + risk-acceptance + incident stories tagged "security" — high reuse value because every loop probes the same 4-5 senior-IC themes.',
    },
  ],
}
