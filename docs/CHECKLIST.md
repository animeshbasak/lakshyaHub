# Lakshya — User Action Checklist

> Tick each box as you complete it. Add notes/findings inline below each step
> using `> ` blockquote prefix. I (Claude) will read your comments before the
> next session.
>
> **Branch:** `feat/careerops-phase-0-1` · last commit `b1d7f81` (2026-04-26 02:08 IST)
> **Status:** local build clean, 98 tests pass, pushed to GitHub Preview, NOT deployed to Production

---

## Block 1 — Verify the wedge actually works (5 min)

Goal: confirm today's eval-pipeline + ATS + PDF fixes are real, not just compiling.

### Step 1.1 — Eval flow end-to-end

- [>] Open `http://localhost:3000/evaluate`
- [>] Paste a real JD into the textarea
- [>] Click "Evaluate" and wait ~5–10s -> 

**Pass criteria:**
- [>] Report renders in **English** (not Spanish)
- [X] ScoreHero shows actual company name + score (not "Unknown role" / "/ 5")
- [X] All 7 blocks (A through G) appear and expand on click
- [>] Footer shows provider used (`groq`, `gemini`, or `claude`)
- [>] No console errors

/ 5
Evaluated

Unknown role
Score below 4.0/5 — career-ops rule says don't apply
View original posting →

A
Role Summary
| Dimension | Detail |
|:----------|:-------|
| Archetype | Lead Frontend Engineer (Architecture & Performance Focus) |
| Domain | Unified Customer Experience Management (Unified-CXM) Platform |
| Function | Build, Architect, Lead, Optimize, Evangelize |
| Seniority | Lead (requires 3+ years, but responsibilities align with 7+ years experience) |
| Remote | Not specified (assume onsite/hybrid in Gurugram/India) |
| Team size | Not mentioned |
| TL;DR | A Lead Frontend Engineer role at Sprinklr focused on driving architectural decisions, performance optimization, and cross-functional collaboration for high-scale web applications within a Unified-CXM platform. |
| JD Requirement | Match from CV | Notes |
|:---------------|:--------------|:------|
| **Cross-Functional Collaboration** | "Work closely with product managers, UX designers, and backend engineers to ensure seamless integration of features." <br> **CV:** "Coordinated feature releases with cross-functional stakeholders across product, QA, and backend teams" (Sparklin). "Collaborated with product and design via Figma for accessible, precise UI delivery" (MakeMyTrip). "Collaborated with backend teams to integrate Spring Boot services" (Paytm). "Serve as tech lead on a 5–7 engineer full-stack team, owning technical direction, architecture decisions, and code quality" (Airtel). "Drive end-to-end technical design for MWeb and DWeb features — authoring HLD and LLD documents with Architect sign-off" (Airtel). | Strong match. Candidate consistently demonstrates collaboration across product, design, and backend teams, including leading technical design discussions. |
| **Technical Excellence (Architecture, Best Practices)** | "Drive architectural decisions, promote modern best practices, and ensure long-term viability." <br> "Guide teams on implementing new frameworks or libraries, ensuring consistent adoption." <br> "Architect next-generation frontend applications and micro-frontends." <br> **CV:** "Lead Frontend Engineer with 7+ years building high-scale web platforms... owning technical direction, architecture decisions, and delivery outcomes end-to-end." (Summary). "Designed and implemented React/TypeScript architecture for Airtel MWeb and DWeb acquisition journeys (~150M MAU)" (Airtel). "Drive end-to-end technical design for MWeb and DWeb features — authoring HLD and LLD documents with Architect sign-off, contributing to a shared design system and widget library" (Airtel). "Designed modular, reusable React component architecture across the Hotels platform" (MakeMyTrip). "Led migration of legacy merchant platform workflows to modern React architecture" (Paytm). **Core Competencies:** "Frontend Architecture", "Component Design Systems", "Technical Leadership". | Excellent match. Candidate has extensive experience driving architecture, leading teams, and implementing modern React/TypeScript solutions for high-scale platforms. |
| **Performance Optimization** | "Continuously monitor and evaluate application performance across various devices and browsers." <br> "Profile and debug performance bottlenecks, ensuring optimal load times." <br> "Implement advanced tooling and instrumentation for proactive performance tuning." <br> **CV:** "Specialist in React, TypeScript, SSR, Core Web Vitals, and A/B experimentation — with deep command of browser rendering pipeline, critical rendering path, async execution models, and PWA performance tuning for high-traffic production systems." (Summary). "Optimised SSR-based Hotels booking funnel... improving average Lighthouse performance score from ~6 to 8–9 through SSR flow tuning, LCP optimisation, and critical rendering path improvements" (MakeMyTrip). "Led migration... improving... Lighthouse performance scores from ~6 to 8–9" (Paytm). "Own delivery across critical acquisition journeys — coordinating PageSpace integration, V2L monitoring, Jenkins CI/CD, and Kibana observability" (Airtel). **Skills:** "Performance: SSR, Core Web Vitals, Lighthouse, Code Splitting, Lazy Loading, Asset Preloading". | Outstanding match. Performance optimization, Core Web Vitals, Lighthouse, SSR, and monitoring tools are central to the candidate's expertise and achievements. |
| **Outbound Evangelism** | "Represent the team at conferences and technical meetups, sharing insights and best practices." <br> "Write and publish technical blog posts to showcase innovations and thought leadership." <br> "Collaborate with marketing to highlight product achievements and engineering stories." <br> **CV:** "Ability to clearly articulate complex technical concepts to both technical and non-technical audiences" (Soft Skills, implied). **AI Projects & Side Builds:** (insaneResumake, cravingTrust, insaneFit). | **Gap:** No explicit experience speaking at conferences, publishing blog posts, or collaborating with marketing for evangelism. Candidate's "AI Projects & Side Builds" could be framed as content for such activities. |
| **Educational Qualifications and Experience** | "BE/BTech degree in software engineering, computer science, or a related field." <br> "3+ years of professional software engineering experience focused on web technologies focusing on React." <br> **CV:** "B.Tech – Computer Science & Engineering 2014 – 2018" (Education). "Lead Frontend Engineer with 7+ years building high-scale web platforms" (Summary). | Excellent match. Candidate exceeds the experience requirement with 7+ years and holds the relevant degree. |
| **Technical Skills (Front-End Architecture)** | "Expertise in Front-End Architecture: Deep understanding of modern front-end technologies, including advanced JavaScript (ESNext features), TypeScript for type safety, bundlers (e.g., Webpack) to optimize build processes and ensure cross-browser compatibility and React." <br> **CV:** "Languages: JavaScript (ES6+), TypeScript. Frontend: ReactJS... DevOps & Tooling: Webpack, Vite, Babel" (Skills). "Designed and implemented React/TypeScript architecture for Airtel MWeb and DWeb acquisition journeys" (Airtel). | Excellent match. Candidate's skills and experience directly align with these requirements. |
| **Technical Skills (CSS Expertise)** | "Proficiency in modern CSS techniques including SCSS, CSS Modules, and CSS-in-JS libraries like Styled Components and Emotion to create scalable, maintainable, and responsive user interfaces. Knowledge in creating component-driven styles and implementing design systems for consistent UI/UX." <br> **CV:** "Frontend: CSS3, SCSS" (Skills). "Designed modular, reusable React component architecture... standardising UI patterns, and accelerating feature delivery" (MakeMyTrip). "Contributing to a shared design system and widget library for reusable component delivery" (Airtel). | Strong match for SCSS, component-driven styles, and design systems. **Minor Gap:** No explicit mention of CSS Modules or CSS-in-JS libraries (Styled Components, Emotion). |
| **Technical Skills (Frontend Performance Optimization)** | "Proven track record in performance profiling and optimization for web applications using tools such as React Profiler, Lighthouse, and Webpack Bundle Analyzer. Focus on optimizing for fast load times, memory management, and rendering efficiency." <br> **CV:** "Performance: SSR, Core Web Vitals, Lighthouse, Code Splitting, Lazy Loading, Asset Preloading" (Skills). "Optimised SSR-based Hotels booking funnel... improving average Lighthouse performance score from ~6 to 8–9" (MakeMyTrip). "Led migration... improving... Lighthouse performance scores from ~6 to 8–9" (Paytm). "Deep command of browser rendering pipeline, critical rendering path, async execution models, and PWA performance tuning" (Summary). | Excellent match. Candidate has a strong, demonstrated track record with specific metrics and tools. React Profiler and Webpack Bundle Analyzer are implied by deep Webpack/Vite experience and performance focus. |
| **Technical Skills (Micro Frontend Architecture)** | "Experience in architecting and implementing scalable micro frontend solutions, leveraging frameworks such as Next.js for SSR/SSG, ensuring seamless integration, and supporting large, distributed teams working on independent components." <br> **CV:** "Performance: SSR" (Skills). "Micro Frontend Architecture: Experience in architecting and implementing scalable micro frontend solutions, leveraging frameworks such as Next.js for SSR/SSG" (Skills, listed in profile). "Designed and implemented React/TypeScript architecture for Airtel MWeb and DWeb acquisition journeys (~150M MAU)" (Airtel). "Designed modular, reusable React component architecture" (MakeMyTrip). | Strong match for SSR, modular architecture, and large-scale systems. **Minor Gap:** While Next.js is in skills and SSR is heavily used, explicit "micro-frontend architecture" experience with Next.js is not detailed in the experience section. However, the foundational experience is present. |
| **CI/CD and DevOps Practices** | "Hands-on experience in setting up and maintaining continuous integration and continuous delivery (CI/CD) pipelines using tools like Jenkins, GitHub Actions, and CircleCI to automate testing, deployment, and delivery processes for faster release cycles." <br> **CV:** "DevOps & Tooling: GitHub Actions, Jenkins, Kibana" (Skills). "Coordinating... Jenkins CI/CD" (Airtel). "Strengthened release reliability by achieving ~90%+ test coverage using Vitest, Jest, and React Testing Library" (MakeMyTrip). **Core Competencies:** "CI/CD & Observability". | Strong match for Jenkins and GitHub Actions. **Minor Gap:** No explicit mention of CircleCI. |
| **Cloud Platforms & Containerization** | "Proficient in containerization with Docker and Kubernetes for scalable and reproducible development environments, as well as deploying frontend applications on cloud platforms like AWS, Azure, and GCP to ensure high availability and resilience." <br> **CV:** "DevOps & Tooling: Docker" (Skills). | Strong match for Docker. **Gap:** No explicit mention of Kubernetes or specific cloud platforms (AWS, Azure, GCP) in experience, though deployment on such platforms is implied by CI/CD and large-scale operations. |
| **Soft Skills** | "Exceptional problem-solving abilities." <br> "Ability to clearly articulate complex technical concepts to both technical and non-technical audiences." <br> "Strong teamwork and communication skills." <br> "Ability to thrive in a dynamic, fast-paced environment." <br> **CV:** "Identified and resolved a systemic bug responsible for 1,000+ Sentry errors... within 48 hours" (MakeMyTrip). "Coordinated feature releases with cross-functional stakeholders" (Sparklin). "Collaborated with backend and QA teams" (Infosys). "Serve as tech lead... owning technical direction, architecture decisions, and code quality" (Airtel). **Core Competencies:** "Cross-Functional Delivery", "Technical Leadership". | Excellent match. Demonstrated through various leadership, problem-solving, and collaboration examples. |
| **Past Experience speaking at conferences, contributing to open-source projects, or writing technical content.** | **CV:** No explicit mention. Candidate has "AI Projects & Side Builds" which could be topics for content. | **Gap:** No direct evidence of this. |


---

**Gaps and Mitigation Strategy:**

1.  **Outbound Evangelism (Conferences, Blog Posts, Marketing Collaboration):**
    *   **Hard blocker or nice-to-have?** Nice-to-have, but a strong signal for a Lead role.
    *   **Adjacent experience?** Candidate has strong technical communication skills (HLD/LLD, guiding teams) and several impressive side projects.
    *   **Portfolio project?** The AI projects (`insaneResumake`, `cravingTrust`, `insaneFit`) are perfect topics for blog posts or tech talks.
    *   **Mitigation:** In the cover letter and interviews, frame the side projects as examples of innovation and thought leadership. Emphasize the ability to articulate complex technical concepts clearly, which is foundational for evangelism. Express enthusiasm for contributing to the company's technical brand.

2.  **Kubernetes & Cloud Platforms (AWS/Azure/GCP):**
    *   **Hard blocker or nice-to-have?** Nice-to-have for a Lead role, especially for a platform company.
    *   **Adjacent experience?** Candidate has strong Docker, CI/CD (Jenkins, GitHub Actions), and observability (Kibana, Superset) experience, which are typically integrated with cloud platforms. Experience with high-scale systems (~150M MAU) implies exposure to resilient deployment patterns.
    *   **Mitigation:** Highlight Docker and CI/CD experience, emphasizing the understanding of scalable, reproducible deployment environments. Express eagerness to deepen expertise in Kubernetes and specific cloud platforms, noting that the underlying principles of distributed systems and high availability are well understood.

3.  **CSS Modules & CSS-in-JS (Styled Components, Emotion):**
    *   **Hard blocker or nice-to-have?** Minor nice-to-have. SCSS and design systems are more critical.
    *   **Adjacent experience?** Candidate has strong SCSS, component design system, and modular architecture experience.
    *   **Mitigation:** Emphasize proficiency in SCSS and experience with design systems for scalable UI. State adaptability to various styling solutions based on project needs and team preferences.

4.  **Next.js for Micro-frontends (explicit experience):**
    *   **Hard blocker or nice-to-have?** Nice-to-have, as the core architectural experience is there.
    *   **Adjacent experience?** Candidate has Next.js in skills, extensive SSR experience, and has designed modular React component architectures for large-scale systems (Airtel, MakeMyTrip).
    *   **Mitigation:** Explicitly connect the experience with designing modular React architectures and SSR to the principles of micro-frontends. Highlight Next.js from skills and express confidence in applying it to micro-frontend patterns.
    1.  **Level Detected vs. Candidate's Natural Level:**
    The JD asks for "3+ years of professional software engineering experience" but the responsibilities ("Drive architectural decisions," "Guide teams," "Architect next-generation frontend applications," "Outbound Evangelism") clearly align with a Senior Staff or Lead Engineer level. The candidate has 7+ years of experience, including a "Lead Engineer" role at Airtel, making them a strong fit for the "Lead" title and responsibilities outlined. The candidate's natural level for this archetype is Lead/Staff Frontend Engineer.

2.  **Plan "Sell Senior Without Lying":**
    *   **Highlight Leadership & Ownership:** Emphasize the "Lead Engineer" role at Airtel, specifically "owning technical direction, architecture decisions, and code quality across prepaid and postpaid journeys."
    *   **Quantify Impact:** Use metrics like "Designed and implemented React/TypeScript architecture for Airtel MWeb and DWeb acquisition journeys (~150M MAU)," "Optimised SSR-based Hotels booking funnel... improving average Lighthouse performance score from ~6 to 8–9," and "Led migration... improving... Lighthouse performance scores from ~6 to 8–9."
    *   **Architectural Depth:** Focus on "authoring HLD and LLD documents with Architect sign-off," "contributing to a shared design system and widget library," and "designing modular, reusable React component architecture."
    *   **Cross-Functional Influence:** Stress the coordination with product, design, and backend teams, and the role as "second-level code review gate" at Airtel.
    *   **Founder Mindset:** Frame the "AI Projects & Side Builds" as demonstrating initiative, end-to-end product thinking, and a proactive approach to exploring new technologies and building solutions, which are valuable traits for a technical leader.

3.  **Plan "If Downleveled":**
    If the offer comes in at a lower seniority level (e.g., Senior Software Engineer instead of Lead), the candidate should:
    *   **Evaluate Compensation:** Accept if the compensation package (base, bonus, equity) is competitive for the candidate

    formatting is not correct unable to understand anything, it should be formated properly with proper spacing


**Fail notes (paste any error / screenshot path here):**
> _(your notes)_

---

### Step 1.2 — ATS scorer on /resume

- [>] Open `http://localhost:3000/resume`
- [>] Load any saved resume OR fill out the form
- [X] Wait ~1s after the last edit

**Pass criteria:**
- [X] ATS Score circle appears (0–100, with tier label)
- [X] 3-pillar breakdown shows (Keywords / Structure / Baseline)
- [X] "To Improve" list of failing checks appears
- [X] Score updates within ~1s of any field edit

**Fail notes:**
> _(your notes)_

---

### Step 1.3 — PDF upload + preview

- [>] On `/resume`, click resume import
- [>] Upload a PDF (any single-page PDF works)

**Pass criteria:**
- [>] No `worker-src` violation in browser console
- [>] PDF parses and shows extracted content -> but not correctly , sentences are not formatted correctly
- [>] No `frame-src blob:` violation
- [>] Preview iframe renders the resume PDF (if templates use react-pdf preview)

**Fail notes:**
> _(your notes)_
Resume that i uploaded and what it previewed based on templates has many difference, it is not formatted properly , missed out on information
---

### Step 1.4 — Feedback widget (only fully works after Step 4 sets service role key)

- [>] On `/eval/[id]` after running an eval, scroll past the blocks
- [>] Click "Useful" or "Not useful"
- [>] Optionally add a note and click Send

**Pass criteria:**
- [>] Buttons render with correct styling
- [>] On click → "Thanks — feedback noted" appears
- [>] (Persists to DB only after Step 4 below)

**Fail notes:**
> _(your notes)_

---

## Block 2 — Take it live (20 min, mostly clicks)

Goal: Production deploy with live GTM hooks.

### Step 2.1 — Set Supabase service role key

- [>] Open Supabase dashboard → project → Settings → API
- [>] Copy the **service_role** key (NOT anon key — service role bypasses RLS)
- [>] Open Vercel dashboard → project `lakshyahub` → Settings → Environment Variables
- [>] Add `SUPABASE_SERVICE_ROLE_KEY` = `<paste>` (mark as secret; apply to Production + Preview)

**Why:** Without it, thumbs-up/down on `/eval/[id]` silently drops (the action soft-no-ops by design so dev still works).

> _(your notes)_

---

### Step 2.2 — Create Stripe Payment Link

- [X] Stripe Dashboard → Payment Links → New
- [X] Set product: "Lakshya Pro" — $19/mo (or INR 1,499/mo for India)
- [X] Description: "Unlimited evals + full report exports + priority routing"
- [X] Save → copy the URL (looks like `https://buy.stripe.com/...`)

> _(your notes)_
instead of stripe now , can we use any india only payment methods like upi etc , as stripe is invite only in india, also i am making this a global job portal but indian users will also be using this, so configure this in way that everyone can use this
---

### Step 2.3 — Wire the link

- [X] Vercel → env vars → add `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` = `<URL from 2.2>` (Production + Preview)
- [X] Optionally add `NEXT_PUBLIC_UPGRADE_CTA_MAX_SCORE` = `4.0` (gates CTA to low-tier evals only; default 5.0 means always show)

**Why:** When set, the "Upgrade to Pro" CTA appears on `/eval/[id]`. When unset, the section renders nothing (zero footprint).

> _(your notes)_
Lets link payment methods at the very end, first we will be launching beta for first 10customers then based on their feedback lets monetize
---

### Step 2.4 — Investigate Vercel Preview failure

The deploy on commit `bec9c2d` (before today's batch) failed. Need root cause before merging.

- [X] Run `npx vercel login` and authenticate
- [X] Run `npx vercel inspect dpl_DR6Hxd7sr7fCrV8BEEXisGZvLAd7 --logs | tail -100`

**OR (easier):**
- [>] Vercel dashboard → project → Deployments → click the failed one → Build Logs

Paste the failure cause below — I couldn't access it without an auth token in my session.

> _(your notes — paste the failure log / cause)_
02:05:34.540 Running build in Washington, D.C., USA (East) – iad1
02:05:34.541 Build machine configuration: 2 cores, 8 GB
02:05:34.677 Cloning github.com/animeshbasak/lakshyaHub (Branch: feat/careerops-phase-0-1, Commit: b1d7f81)
02:05:35.834 Cloning completed: 1.157s
02:05:36.113 Restored build cache from previous deployment (JCGF5Hd54TqsrrRLzHEat9tJWCE8)
02:05:36.491 Running "vercel build"
02:05:37.773 Vercel CLI 51.6.1
02:05:38.080 Installing dependencies...
02:05:41.039 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
02:05:43.530 
02:05:43.531 added 118 packages, and changed 4 packages in 5s
02:05:43.532 
02:05:43.532 172 packages are looking for funding
02:05:43.532   run `npm fund` for details
02:05:43.574 Detected Next.js version: 16.2.3
02:05:43.580 Running "npm run build"
02:05:43.686 
02:05:43.686 > lakshya@0.1.0 build
02:05:43.686 > next build
02:05:43.686 
02:05:44.386   Applying modifyConfig from Vercel
02:05:44.403 ▲ Next.js 16.2.3 (Turbopack)
02:05:44.404 
02:05:44.451   Creating an optimized production build ...
02:06:10.902 
02:06:10.903 > Build error occurred
02:06:10.908 Error: Turbopack build failed with 3 errors:
02:06:10.908 ./src/components/nav/Sidebar.tsx:25:1
02:06:10.909 Module not found: Can't resolve './TweaksProvider'
02:06:10.909   [90m23 |[0m [36mimport[0m { [33mBrandMark[0m } [36mfrom[0m [32m'./BrandMark'[0m
02:06:10.909   [90m24 |[0m [36mimport[0m { useCmdK } [36mfrom[0m [32m'./CmdKProvider'[0m
02:06:10.909 [31m[1m>[0m [90m25 |[0m [36mimport[0m { useTweaks } [36mfrom[0m [32m'./TweaksProvider'[0m
02:06:10.910   [90m   |[0m [31m[1m^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^[0m
02:06:10.910   [90m26 |[0m
02:06:10.910   [90m27 |[0m [36mconst[0m [33mNAV_ITEMS[0m = [
02:06:10.910   [90m28 |[0m   { href: [32m'/dashboard'[0m, label: [32m'Home'[0m, icon: [33mHome[0m },
02:06:10.910 
02:06:10.911 
02:06:10.911 
02:06:10.911 Import trace:
02:06:10.911   Server Component:
02:06:10.911     ./src/components/nav/Sidebar.tsx
02:06:10.912     ./src/app/(dashboard)/layout.tsx
02:06:10.912 
02:06:10.912 https://nextjs.org/docs/messages/module-not-found
02:06:10.912 
02:06:10.912 
02:06:10.912 ./src/components/nav/Topbar.tsx:6:1
02:06:10.913 Module not found: Can't resolve './TweaksProvider'
02:06:10.913   [90m4 |[0m [36mimport[0m { [33mBell[0m, [33mChevronRight[0m, [33mCommand[0m, [33mHome[0m, [33mSearch[0m, [33mKanban[0m, [33mFileText[0m, [33mPalette[0m } [36mfrom[0m [32m'lucid...[0m
02:06:10.914   [90m5 |[0m [36mimport[0m { useCmdK } [36mfrom[0m [32m'./CmdKProvider'[0m
02:06:10.914 [31m[1m>[0m [90m6 |[0m [36mimport[0m { useTweaks } [36mfrom[0m [32m'./TweaksProvider'[0m
02:06:10.914   [90m  |[0m [31m[1m^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^[0m
02:06:10.914   [90m7 |[0m [36mimport[0m { [33mBrandMark[0m } [36mfrom[0m [32m'./BrandMark'[0m
02:06:10.914   [90m8 |[0m
02:06:10.915   [90m9 |[0m [36mconst[0m [33mROUTE_META[0m: [33mRecord[0m<string, { title: string; crumb: string }> = {
02:06:10.915 
02:06:10.915 
02:06:10.915 
02:06:10.915 Import trace:
02:06:10.915   Server Component:
02:06:10.916     ./src/components/nav/Topbar.tsx
02:06:10.916     ./src/app/(dashboard)/layout.tsx
02:06:10.916 
02:06:10.916 https://nextjs.org/docs/messages/module-not-found
02:06:10.916 
02:06:10.916 
02:06:10.917 ./src/features/resume-builder/components/AIPanel.tsx:17:1
02:06:10.917 Module not found: Can't resolve '@/lib/utils/textDiff'
02:06:10.917   [90m15 |[0m   [33mGitCompare[0m,
02:06:10.917   [90m16 |[0m } [36mfrom[0m [32m'lucide-react'[0m
02:06:10.917 [31m[1m>[0m [90m17 |[0m [36mimport[0m { diffTokens, diffStats } [36mfrom[0m [32m'@/lib/utils/textDiff'[0m
02:06:10.918   [90m   |[0m [31m[1m^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^[0m
02:06:10.918   [90m18 |[0m [36mimport[0m { useResumeStore } [36mfrom[0m [32m'@/features/resume-builder/store/useResumeStore'[0m
02:06:10.923   [90m19 |[0m [36mimport[0m { useShallow } [36mfrom[0m [32m'zustand/shallow'[0m
02:06:10.924   [90m20 |[0m [36mimport[0m { [33mATSScorePanel[0m } [36mfrom[0m [32m'@/features/resume-builder/components/ATSScorePanel'[0m
02:06:10.924 
02:06:10.924 Import map: aliased to relative './src/lib/utils/textDiff' inside of [project]/
02:06:10.925 
02:06:10.925 
02:06:10.925 Import traces:
02:06:10.925   Client Component Browser:
02:06:10.925     ./src/features/resume-builder/components/AIPanel.tsx [Client Component Browser]
02:06:10.925     ./src/app/(dashboard)/resume/page.tsx [Client Component Browser]
02:06:10.926     ./src/app/(dashboard)/resume/page.tsx [Server Component]
02:06:10.926 
02:06:10.926   Client Component SSR:
02:06:10.926     ./src/features/resume-builder/components/AIPanel.tsx [Client Component SSR]
02:06:10.926     ./src/app/(dashboard)/resume/page.tsx [Client Component SSR]
02:06:10.926     ./src/app/(dashboard)/resume/page.tsx [Server Component]
02:06:10.927 
02:06:10.927 https://nextjs.org/docs/messages/module-not-found
02:06:10.927 
02:06:10.927 
02:06:10.927     at <unknown> (./src/components/nav/Sidebar.tsx:25:1)
02:06:10.927     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
02:06:10.928     at <unknown> (./src/components/nav/Topbar.tsx:6:1)
02:06:10.928     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
02:06:10.928     at <unknown> (./src/features/resume-builder/components/AIPanel.tsx:17:1)
02:06:10.928     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
02:06:11.013 Error: Command "npm run build" exited with 1

---

### Step 2.5 — Verify the new push (`b1d7f81`) deploys clean

- [ ] Run `gh pr checks 1` from the project dir
- [ ] Confirm `Vercel` row shows `pass` (not `fail`)
- [ ] If `fail`, capture the new log and paste in 2.4 notes

> _(your notes — paste check status)_

---

### Step 2.6 — Merge decision on PR #1 (62 commits)

Choose ONE:

- [ ] **(A) Pragmatic:** merge as-is once Preview is green. The PR-A/B/C/D split plan was abandoned weeks ago; merging now is fine.
- [ ] **(B) Pure:** cherry-pick into 4 sub-PRs. ~2h busywork, no safety benefit at this point.

> _(your decision + reasoning)_

---

### Step 2.7 — Merge to main → Production fires

- [ ] PR #1 → Merge button (use "Squash and merge" or "Merge commit" — your call)
- [ ] Vercel auto-deploys main → Production
- [ ] Smoke-test `https://<your-prod-url>/evaluate` with one fresh JD
- [ ] Repeat 1.1–1.4 against Production

> _(prod URL + smoke test notes)_

---

### Step 2.8 — Post the live link

- [ ] Choose ONE community to seed (HN Show / `/r/cscareerquestions` / `/r/learnprogramming` / X / a tech Slack you're in)
- [ ] Post the eval link with a 1–2 line context ("paste any AI/tech JD, get a 7-block career-ops verdict, free during launch")
- [ ] Goal: 20 evals + 5 thumbs in 48h

> _(which community + post URL)_

---

## Block 3 — Phase 2 unlocks (DO NOT start until Block 2 produces ≥10 signups + ≥1 thumbs-up)

### Step 3.1 — Queue provider decision

- [ ] Provision Upstash QStash (default — ~$72/mo at 240k jobs/day, at-least-once)
- [ ] Add to Vercel env: `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`, `CRON_SECRET`

> _(provider chosen + tokens added)_

---

### Step 3.2 — Vercel Lambda memory upgrade

- [ ] Vercel project → Settings → Functions → set memory to **3008 MB** for:
  - `/api/liveness`
  - `/api/health/browser`

**Why:** `@sparticuz/chromium` 147 needs ≥1769 MB. Default Pro = 1024 MB will OOM.

> _(confirmation)_

---

### Step 3.3 — Verify 20 seeded portals slugs

- [ ] Open `docs/superpowers/plans/2026-04-25-phase-2-scan-liveness.md` (look for the slug list)
- [ ] For each slug: `curl https://boards-api.greenhouse.io/v1/boards/<slug>/jobs` (or Ashby/Lever equivalent)
- [ ] Mark dead/renamed ones; replace before migration applies

> _(slugs verified / dead ones noted)_

---

### Step 3.4 — GDPR retention policy

Pick one (and tell me which so I can wire the cron):

- [ ] (A) 90-day rolling delete on `scan_history` + `evaluations` (default — recommended)
- [ ] (B) 180-day
- [ ] (C) 30-day
- [ ] (D) Manual export-and-delete on user request only (DSAR endpoint, more work)

> _(your choice)_

---

### Step 3.5 — Provision remaining env vars

- [ ] `GEMINI_API_KEY` (fallback provider)
- [ ] `BYOK_MASTER_KEY` (for S4 — encrypt user-provided API keys; generate via `openssl rand -base64 32`)
- [ ] `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_AUTH_TOKEN` (for S10 observability)

> _(which set, which deferred)_

---

## Block 4 — Loose ends in `git status` (your judgement call)

11 files were modified outside this session's scope. Triage each:

- [ ] `src/app/(dashboard)/layout.tsx`
- [ ] `src/app/api/ai/bullet-rewrite/route.ts`
- [ ] `src/lib/ai/router.adapters.ts`
- [ ] `src/lib/ai/taskRunner.ts`
- [ ] `src/lib/resumeImport/builderMapping.ts`
- [ ] `src/lib/resumeImport/extraction.ts`
- [ ] `src/lib/resumeImport/mapping.ts`
- [ ] `src/lib/resumeImport/pipeline.ts`
- [ ] `src/lib/resumeImport/segmentation.ts`
- [ ] `src/lib/resumeImport/validation.ts`
- [ ] `src/lib/scrapers/index.ts`

For each: `git diff <file>` → decide:
- ✅ Keep & commit (was WIP I want)
- ↩️ Revert (was experimental, unwanted)
- 📦 Stash for later

> _(triage decisions — list outcome per file or "all keep" / "all revert")_

---

## Block 5 — Backlog (post-launch, low priority)

From the code-review + security-audit agents this session:

- [ ] Add `sandbox` attribute to react-pdf preview iframes (defense-in-depth, not blocking)
- [ ] Cap LLM-text input length to ~100KB before regex (defense-in-depth ReDoS)
- [ ] Wire Playwright a11y runner (replace 6 `.todo` cases in `tests/a11y/`)
- [ ] Streaming on `/api/ai/evaluate` (8–15s blocking on Claude Sonnet today)
- [ ] Golden-fixture tests against real Greenhouse/Ashby/Lever API shapes (not just mocked fetch)

> _(any of these promote to P1?)_

---

## After you've ticked through

When you finish Block 1 (or anytime you want me to pick up):

1. Save this file with your `> ` notes inline
2. Tell me "pick up the checklist" — I'll read your notes, address what failed, and proceed to whichever block is next.

If everything in Block 1 passes cleanly, the natural next move is Block 2.
