# Lakshya — Project Status Dashboard

> **Canonical source of truth for all pending work, priorities, review findings, and blockers.**
> Last updated: 2026-04-27 ~21:15 IST
> Branch: `feat/careerops-phase-0-1` (69 commits, **138/138 tests** + 1 skipped + 11 todo, build clean, PR #1 open)

This file is the single place any agent or human should open first. It aggregates every plan, every pending task, every review finding, and every blocker that needs user input.

---

## 0.0 Backlog closure pass — 2026-04-27 evening

Done in this pass (mostly closing tasks that were marked pending but already shipped earlier in the week):

| Task | Status | Notes |
|---|---|---|
| #11 UI-3 marketing surfaces | ✅ closed | All 4 pages exist (`/about`, `/pricing`, `/guides`, `/compare`); 14 archetype guides + 6 compare pages already shipped 2026-04-26 |
| #12 UI-4 polish + a11y | ✅ closed | Skeleton primitives + 3 loading.tsx files already in place; new `/insights/loading.tsx` added; favicon (Next.js dynamic icon.tsx) + apple-icon + opengraph-image all present |
| #15 P1 Phase 2 routes | 🟡 partial | `/api/scan/ats` shipped (ATS-API path; 20 portals live, 3,184 jobs verified). `/api/liveness` BLOCKED — needs Vercel mem 3008MB + QStash provisioning (user-side) |
| #18 P2 Phase 2 crons (2.9+2.10) | 🔴 BLOCKED | QStash provisioning required (user-side) |
| #19 P2 Security S3+S4+S6 | ✅ closed | S3 LLM rate-limit (6s per-user) + S4 daily eval cap (50/day, env-tunable) added to `/api/ai/evaluate`. S6 CSP-with-nonce already shipped via `proxy.ts`. ATS scan also rate-limited 30s/user |
| #20 P2 SEO-2+SEO-3+ai-platform guide | ✅ closed | JSON-LD + dynamic OG + ai-platform guide all already shipped via earlier SEO commits |
| #21 P3 Security S5+S10+S11 | 🟡 partial | S5 secrets-rotation playbook + S11 incident-response runbook shipped as docs (`docs/security/{secrets-rotation,incident-runbook}.md`). S10 Sentry integration BLOCKED (`npm install @sentry/nextjs` not approved) |
| #22 P4 5 guides + 6 compares + STAR stories | ✅ closed | All 14 guides, 6 compares, AND full STAR-stories CRUD (server actions + UI panel) already shipped |
| #23 P4 Security S8+S9+S12 | 🔴 BLOCKED | S8 Playwright a11y BLOCKED on `npm install @axe-core/playwright`. S9 Stripe webhook BLOCKED on business registration. S12 GDPR DSAR endpoint not started — needs schema decisions |

Bonus wins in this pass:
- **Block G ghost-job detection** — strengthened the operating-rules prompt with a 7-point red-flag screen (reposting age, vague responsibilities + generous comp, stack mismatches, no company URL, gmail/yahoo apply, MLM signals, recruiter-only contact). Free quality bump on every eval.

What this leaves on the genuine pending list (NOT counted as bugs — just user-side action waiting):
- Liveness route + Phase 2 crons → user provisions QStash + Vercel mem upgrade
- Sentry integration → user approves `npm install @sentry/nextjs` (or we do it together)
- Stripe webhook → user registers business (per their call to defer)
- Playwright a11y runner → user approves `npm install @axe-core/playwright @playwright/test`
- GDPR DSAR endpoint → needs scope decision (90/180/30 day retention + which tables)

---

## 0. Today's Session — 2026-04-26 (live)

### Shipped (committed)
- `bec9c2d` — Fix 2 dev-mode bugs blocking profile setup + eval flow (column mismatch, 424 provider_unconfigured handling)
- `1b05302` — Frontend archetype guide + Lakshya vs Huntr compare
- `172c453` — Mobile + devops-sre guides + Careerflow + Simplify compare
- `be4385d` — Fullstack + data-engineering + security guides + LoopCV compare → **content roadmap COMPLETE (14/14 guides, 6/6 compare pages)**
- `7610b7a` — Refresh of this doc earlier today

### Fixed but **NOT yet committed** (this session)
| File | What |
|---|---|
| `src/proxy.ts` | CSP: `worker-src 'self' blob:`, `frame-src ... blob: data:`, `connect-src ... blob: data:` so pdfjs worker + react-pdf preview load |
| `src/lib/careerops/promptLoader.ts` | Operating rules force English output + verbatim `## Block X — heading` format + JD-as-untrusted handling (career-ops prompts are Spanish; LLM was emitting Spanish + `## A)` headers) |
| `src/app/(dashboard)/eval/[id]/BlockAccordion.tsx` | Flexible regex accepts 5 header forms; dedupe + sort A→G |
| `src/lib/careerops/parseScoreSummary.ts` | Spanish/inline fallback (`**Empresa:**`, `**Score:** 4.0/5`) so legacy evals still render score + role |
| `src/lib/atsEngine.ts` | Restored 574-line heuristic engine deleted in `3eaf8e2` (was deleted prematurely; A-G evaluator and ATS solve different problems and now coexist) |
| `src/types/index.ts` | ATSCheck/ATSResult re-export from `atsEngine` (single source of truth) |
| `src/features/resume-builder/components/AIPanel.tsx` | `setAtsResult(null)` stub → `setAtsResult(calculateATSScore(data))` |
| `tests/lib/careerops/parseScoreSummary.test.ts` | New test locks in Spanish-fallback behavior |

**Build**: `npm run build` clean, 51/51 SSG pages, all routes intact. **Tests**: 79 pass.

### Open issues from today's testing
- **Eval still rendered "Unknown role" / `/ 5`** on user's last test (after the prompt fixes). Two possibilities: (1) viewing a previously-saved eval row from before the fix → fallback parser will retro-fix on next render; (2) LLM still ignored operating rules → needs a fresh eval to confirm. **Next test step**: fresh `/evaluate` run with new JD.
- ATS scorer untested in dev — needs a `/resume` reload to confirm panel populates
- 4-file fix batch awaiting your approve before commit + push
- 11 other modified files (resumeImport/, ai/router.adapters, ai/taskRunner, scrapers/index, layout, settings) are unrelated work streams — not part of this fix batch

---

---

## 0.5. Direction Check — "Are we going in the right direction?"

> Honest read against the CEO REDUCE prescription (2026-04-25). Not a status; a verdict.

### What's working ✅
- **Eval loop is the wedge** and it's the most-built thing in the repo. Correct call.
- **Security fundamentals shipped before any auth'd traffic** — proxy.ts middleware, IDOR fixes, LLM input bounds, prompt-injection sanitize, RLS scaffold, audit_events. Doing this *now* (cheap) instead of post-incident (expensive) is the right call.
- **Provider chain is now Groq-default, free** — eliminated the per-eval billing risk that would have killed unit economics during validation. Good move.
- **Schema + auth bugs all closed** — every Eng BLOCK item is fixed (Tasks #13, #24, #25, #26).
- **Reframe to "all tech job seekers, not just AI"** — 6 → 14 archetypes — fixed the unforced TAM mistake.
- **INR pricing + unified marketing nav** — removed the two friction points the user named explicitly.

### What's drifting ⚠️
- **CEO said REDUCE; reality is EXPAND.** All 14 archetype guides + all 6 compare pages shipped today. CEO's prescription was: "Phase 0 + Phase 1 + UI-0 + UI-2.1 + UI-2.2 = minimum product. Everything else (scan, liveness, LaTeX, outreach, story bank, **SEO content, compare pages**) = dead weight until users return to eval a 2nd job." We did the dead-weight content anyway. Net effect: ~6–10h spent on SEO content that compounds at 6+ week horizon, while user count is still 0.
- **Still no validated WTP.** CEO move #3 was "Manual Stripe Payment Link for first 10 Pro conversions" — has not happened. Pricing still set on intuition ($19/$49 → INR equivalents).
- **Eval pipeline broke twice today** — Spanish output + 0-block parsing + ATS regression. The wedge surface is fragile because it stitches together LLM output from a Spanish prompt source we don't control. Needs golden-fixture tests against real LLM responses, not just unit tests on parsers.
- **`/api/scan` + `/api/liveness` still unbuilt.** This was P2-deferred for good reason (cost math says Vercel Lambda is wrong execution model below 30k jobs/day). But the Phase 2 plan still exists in docs, which means future sessions will keep gravitating toward it. **Recommendation: explicitly mark Phase 2 "DEFERRED PENDING WTP VALIDATION" in docs to stop the gravity.**
- **PR #1 has 61 commits open against main.** Original plan was to split into PR-A/B/C/D. That split never happened. Risk: when this PR finally merges, blast radius is enormous and rollback is impractical.

### What's the minimum to declare "right direction" ✓
The CEO kill-switch was: **60 days, 200+ signups, <5% return rate to eval second job.** None of the inputs to that test exist yet. Concrete next bar:

1. **Commit + merge today's eval fix batch** (1h)
2. **Run 10 evals through the live flow** (yourself or 1 friend) to lock parser confidence (2h)
3. **Push the branch / merge PR #1** (decide split or single — pragmatically, single is fine if tests pass) (1h)
4. **Manual Stripe Payment Link in landing CTA** (2h, no code)
5. **Post the eval link in 1 community where AI/ML job-seekers gather** (HN Show, /r/cscareerquestions, X) (1h)

That's a 7-hour push to first signal. Everything else (Phase 2, S5–S12, training/project evaluators, Chrome ext) is overhead until that signal arrives.

### Verdict
**Direction is right; cadence is drifting toward "build more" instead of "validate more."** The eval wedge works locally; the next 5 commits should be about getting it in front of strangers, not adding surfaces. If users return to eval a 2nd job, *then* invest in scan/liveness/content depth. If they don't, those investments would have been lost anyway.

The good news: nothing shipped today is actively wrong. It's just early.

---

## 1. Branch State

- **Branch:** `feat/careerops-phase-0-1`
- **Commits since main:** 56
- **Tests:** 78 passing + 1 skipped + 11 todo (12 test suites)
- **Build:** clean (`npm run build` succeeds with Turbopack + `serverExternalPackages` for chromium/playwright)
- **PR open:** [#1](https://github.com/animeshbasak/lakshyaHub/pull/1)

### What's shipped (full inventory)

| Phase | Scope |
|---|---|
| 0 cleanup | vitest, runtime deps, removed atsEngine, migration 002, copied 17 career-ops prompts |
| 1 eval loop | canonicalStates · archetypes (14) · liveness classifier · prompt loader · parseScoreSummary · evaluator + `/api/ai/evaluate` route |
| 2 libs | scanAtsApi (Greenhouse/Ashby/Lever) · browserDriver (chromium) · urlGuard (SSRF) · livenessDriver · `/api/health/browser` · liveness schema |
| Routes (public) | `/`, `/pricing` (USD/INR toggle), `/about`, `/guides`, `/guides/[archetype]` (14 SSG, 9 with full content), `/compare`, `/compare/[competitor]` (6 SSG, 3 with full content), `/share/[id]`, `/og` (dynamic), `/sitemap.xml`, `/robots.txt`, `/icon`, `/apple-icon`, `/opengraph-image` |
| Routes (authed) | `/dashboard`, `/board`, `/discover`, `/profile`, `/resume`, `/evaluate`, `/eval/[id]`, `/archetypes`, `/stories` |
| Security | proxy.ts middleware (CSP-with-nonce, HSTS, X-Frame-Options, Permissions-Policy, COOP), 3 IDOR fixes (loadResume/deleteResume/evaluate cvId), LLM input validation (`.max(20000)` + prompt-injection sanitize), provider-fallback chain (Groq → Gemini → Claude), audit_events append-only schema, RLS test scaffold, threat model doc |
| Marketing | brand sweep `Lakshya Hub` → `Lakshya`, MarketingHeader unified across `/`, `/pricing`, `/about`, INR pricing for India geo-detect, broader-tech audience reframe |
| SEO | sitemap + robots, JSON-LD (Organization, WebSite, SoftwareApplication, Article on share + guides + compare, FAQPage, BreadcrumbList), dynamic OG via next/og, **14/14 archetype guides + 6/6 compare pages COMPLETE** (as of today) |
| UI | Skeleton primitives, loading.tsx for /eval/[id] /archetypes /stories, ScoreHero (responsive 120px desktop / 80px mobile), BlockAccordion (A-G parser), ShareToggle with 3 anonymization tiers, CadenceBadge for Kanban, EmptyState + Evaluate CTA on /board /dashboard, branded icon/apple-icon/og |
| Docs | careerops integration master plan, security plan (S0-S12), SEO plan, Phase 2 detail, UI evolution plan, S0 threat model, SETUP.md, PROJECT-STATUS.md (this file), 9 archetype guide content files, 3 compare page content files, secret-scan + env-audit scripts |
| Infra | next.config.ts (turbopack alias, serverExternalPackages, outputFileTracingIncludes for prompts, security headers), CSP-with-nonce middleware, dynamic OG route on edge runtime |

### What's NOT shipped

- **Eval pipeline fix batch** — 4 files modified this session, awaiting commit approval (see §0)
- `/api/scan` + `/api/liveness` routes — blocked on QStash provisioning + Vercel Lambda mem 3008MB
- Phase 2 cron endpoints (2.9, 2.10) — same blocker
- ~~5 remaining archetype guides~~ — **COMPLETE 2026-04-26**
- ~~3 remaining compare pages~~ — **COMPLETE 2026-04-26**
- Stripe billing + automated webhook — Phase 4 (manual Payment Links recommended for first 10 conversions per CEO)
- Playwright a11y runner (scaffold + 6 .todo cases live; needs @axe-core/playwright wiring)
- Phase 3 CV LaTeX generator + ethical keyword injector
- Phase 5 interview-prep generator + pattern analytics
- Phase 6 training/project evaluators
- Phase 7 Chrome extension + i18n + referral engine
- **First paying user** — 0 sign-ups, 0 WTP evidence (CEO's killer concern)

---

## 2. Priority Roster — REPRIORITIZED 2026-04-25 after CEO + Eng reviews

**Strategic pivot:** CEO review = REDUCE. Ship eval loop + get 20 real users + manual Stripe before building scan/liveness/content/full-security. Eng review = BLOCK PR-B on schema fix. Priorities below reflect both.

### P0 — Must ship before any user sees this

| # | Track | Task | Effort | Source |
|---|---|---|---|---|
| 13 | 🔴 Bug | Fix schema: `cv_documents`→`resumes`, `user_profiles`→`resume_profiles`, `markdown`→`data jsonb`, `narrative`→`full_resume_text` in `src/app/api/ai/evaluate/route.ts:56-66` | 1h | Eng BLOCK #1 |
| 24 | 🔴 Bug NEW | Fix prompt loader: convert `fs.readFile` in `promptLoader.ts` to `import ... as ...?raw` OR add `outputFileTracingIncludes` to `next.config.ts` | 1h | Eng BLOCK #2 |
| 25 | 🟡 Bug NEW | Idempotency: pre-insert `pending` row + `unique(user_id, jd_url)` + handle empty LLM as 502 not silent insert | 1h | Eng Needs-Fix #3 |
| 26 | 🟡 Bug NEW | `next.config.ts`: migrate `webpack(canvas: false)` to `turbopack.resolveAlias.canvas` | 30m | Eng Needs-Fix #5 |
| 8 | UI | UI-0 critical fixes (brand strings, JdMatch 404, landing RSC+metadata) | 2-3h | UI audit |
| 10-a | UI | UI-2.1 + UI-2.2 minimal: `/evaluate` + `/eval/[id]` (shipping the wedge) | 4h | CEO move #1 |
| 27 | 🟢 GTM | Manual Stripe Payment Link + `is_pro` flip for first 10 Pro conversions | 2h | CEO move #3 |
| 14 | Git | Split 22 commits into PR-A (core lib) + PR-B (route, BLOCKED) + PR-C (Phase 2 lib) + PR-D (docs); open PR-A + PR-C + PR-D | 1h | Eng PR-readiness |

**P0 total: ~13 hours.** This is the new critical path to first paying user.

### P1 — Minimum viable security + first org traffic

| # | Track | Task | Effort | Source |
|---|---|---|---|---|
| 16 | Security | S1 RLS audit + tests (required before auth'd traffic) | 2h | CEO move #2 |
| 19-a | Security | S3 zod + requireUser standardization + S5 env hygiene (NEXT_PUBLIC_ audit, trufflehog) + S6 CSP headers | 4h | CEO move #2 |
| 17 | SEO | SEO-1 `robots.ts` + `sitemap.ts` | 1h | — |
| 9 | UI | UI-1 color token sweep | 2h | design-review gate |
| 28 | Bug NEW | Migration renumbering collision: plan's `003_portals_table.sql` → `004_portals_table.sql`; plan's `004_liveness_columns.sql` already shipped as `003_liveness_columns.sql` → update plan | 15m | Eng Needs-Fix #4 |

**P1 total: ~9 hours.** Ship only when P0 validates WTP with paying users.

### P2 — Deferred until >=5 paid conversions validate WTP

| # | Track | Task | Effort | Notes |
|---|---|---|---|---|
| 10-b | UI | UI-2 remainder: /share/:evalId + /archetypes + /stories + cadence badges + LaTeX toggle | 6-8h | Post-P0 validation |
| 15 | Phase 2 | Routes 2.4 + 2.5 + 2.7 (portals, /api/scan, /api/liveness) | 4h | BLOCKER: QStash tokens + Vercel mem 3008MB + slug verify. **Reconsider if cost math changes** (~$480/mo Vercel + $72/mo QStash at 240k/day — Fly.io worker better below 30k/day). |
| 18 | Phase 2 | Crons 2.9 + 2.10 | 2h | BLOCKER: QStash |
| 19-b | Security | S4 LLM abuse (quota guard, injection hardening, PII filter, cost kill-switch) | 5h | — |
| 20 | SEO | SEO-2 JSON-LD + SEO-3 OG + ai-platform archetype guide (first) | 6h | — |
| 12 | UI | UI-4 polish + a11y | 4-6h | Before Stripe flip |

### P3 — Once automated Stripe ships

| # | Track | Task | Effort | Notes |
|---|---|---|---|---|
| 11 | UI | UI-3 marketing surfaces (/pricing, /about, compare, remaining guides) | 6-10h | — |
| 21 | Security | S5 rotation playbook + S10 Sentry + S11 IR runbooks | 7h | — |
| 23 | Security | S8 Playwright hardening + S9 Stripe signature verify + S12 GDPR DSAR/erasure | 8h | Before EU launch |

### P4 — Compounding growth

| # | Track | Task | Effort | Notes |
|---|---|---|---|---|
| 22 | Content | 5 remaining archetype guides + 6 compare pages + 50 STAR stories | weeks | Ongoing editorial |

**Revised total critical path to first dollar:** ~13h (P0). **To org-ready launch:** P0+P1 = ~22h. **To feature-complete MVP:** +P2 = ~45h. The previous "55-70h" estimate was for everything; CEO says defer half.

---

## 3. Review Findings (as they land)

### 3.1 Design pressure-test (UI plan) — LANDED 2026-04-25

**Verdict:** Ship with modifications. Three critical gaps to close before execution:

**Scores:** IA 7, Visual Hierarchy 6, Brand 7, A11y 6, Mobile 4 ⚠, Microcopy 8, Interaction 7, Conversion 7, Disambiguation 8, Design System 5.

**Required fixes before UI execution starts:**

1. **Tokens-first gate** — `globals.css` currently only `@import "tailwindcss"`. The UI-1 plan describes tokens in prose but they must exist in the file as a prerequisite before ANY component is built. Move UI-1.1 Step 2 from "add tokens" → "tokens must exist in the file as a gate condition."

2. **Mobile contract per UI-2 task** — plan's mobile story is one line in Phase 6. The three revenue-critical surfaces `/evaluate`, `/eval/[id]`, `/share/[id]` need per-surface breakpoint specs: `< 640px` stack full-width, `ScoreHero` ring `120px`→`80px`, touch targets ≥ 44px, textarea min-h-200px. 30 min to write, prevents broken funnel on launch.

3. **ScoreHero layout spec** — the most important data moment in the product (user's score in a ring). Currently specified by component name only. Add explicit: ring `120px` desktop `80px` mobile, score `3xl bold` inside, company `xl` below, archetype badge + legitimacy pill inline `sm`, Apply CTA full-width bottom. One paragraph eliminates all developer discretion.

**Other gaps (below 7/10):**
- A11y: add `--focus-ring: 2px solid #a68aff` + `outline-offset: 2px` globally to `:focus-visible` before any surface ships.
- Visual hierarchy: add explicit spacing scale to ScoreHero (32px / 16px / 8px).
- Design system maturity: tokens live only in plan doc, not in any file — move them to `globals.css` first commit.

**Action:** Patch UI plan with these three additions in 45 minutes before executing UI-0.

### 3.2 Product / CEO lens review — LANDED 2026-04-25

**Verdict: REDUCE.** Plan stack is technically sound but fighting five battles at once (product, infra, marketing, security, content) with zero paying customers and no willingness-to-pay evidence. Compress to thinnest shippable slice that proves users return.

**Forcing-question answers:**
- **Customer:** Senior IC / career-switcher, AI/ML roles, $150k+, 2-5 YoE, applying to 20-50 jobs — BUT ICP split between "new grad" and "Head of X" needs to pick one.
- **Wedge:** A-G evaluator. Paste JD → 7-block verdict + legitimacy in 30s. Nothing else in the market does this with career-ops-grade depth.
- **Why now:** AI job market bifurcated 2025-26; archetype-driven targeting outperforms volume applications.
- **10x:** Quality of signal per job evaluated, not volume features. Structured verdict + legitimacy + archetype + cadence loop.
- **Evidence of demand:** **CRITICAL GAP** — n=1 (founder, 740 evals). No user interviews, no waitlist, no pilot. Pricing ($19/$49) priced on intuition.
- **Kill-switch:** 60 days, 200+ signups, <5% return rate to eval second job → shut A-G down, pivot to tracker-first.

**Red flags:**
- TAM unbound; "sophisticated AI job-seekers" is narrow slice; Free 3/mo cannibalizes conversion.
- Unit economics: A-G eval $0.12 margin OK, but Playwright at 3008MB Lambda + QStash $72/mo = monthly burn before revenue.
- Moat: career-ops prompts are MIT — any competitor can copy today. Post-1k-evals corpus is unrealized moat.
- Execution: solo dev, 40-50h critical path before first dollar, no buffers, no "minimum viable security" tier.
- GTM: SEO plan is 6+ week horizon; cold-start unaddressed; santifer partnership unconfirmed.

**Top-3 scope moves for next 30 days (CEO prescribes):**

1. **Ship eval loop + 20 real users first.** Phase 0 + Phase 1 + UI-0 + UI-2.1 + UI-2.2 = minimum product. Everything else (scan, liveness, LaTeX, outreach, story bank, SEO content, compare pages) = dead weight until users return to eval a 2nd job.
2. **Cut security to pre-payment minimum.** S1 (RLS), S3 (zod+requireUser), S5 (env hygiene), S6 (CSP). S2, S4, S7-S12 = post-first-dollar. Current 14h critical path → actual minimum 6-7h.
3. **Validate WTP before billing infra.** Manual Stripe Payment Links for first 10 Pro conversions. Flip `is_pro` boolean manually. Only after 5 paid → build automated webhook. Plan's Phase 4 billing = 2-hour week-2 experiment instead.

### 3.3 Eng / architecture review — LANDED 2026-04-25

**Verdict: Needs Changes — BLOCK PR-B on schema fix.** Split the 22 commits into 4 PRs.

**Top-5 must-fix before merging:**

1. **🔴 BLOCK — Schema mismatch.** `evaluate/route.ts:56-66` queries `cv_documents.markdown` + `user_profiles.narrative`. Schema has `resumes(data jsonb, …)` + `resume_profiles(full_resume_text)`. Every auth'd call → `{error: 'no active CV'}` because Supabase 42P01 masked as empty row. **Already tracked as Task #13 — promote to absolute P0.**

2. **🔴 BLOCK — Prompt loader FS reads fail on Vercel Lambda.** `promptLoader.ts:29,38,47` uses `fs.readFile(process.cwd() + 'src/prompts/...')`. Turbopack only traces imported files; runtime `fs.readFile` of markdown does NOT trigger output tracing. Expected: ENOENT on first prod eval. **NEW P0 — add `outputFileTracingIncludes` in `next.config.ts` OR convert to `import x from '@/prompts/...?raw'` imports.**

3. **🟡 Idempotency on LLM spend.** Route billing a user $0.12 per submit; no `unique(user_id, jd_url)`, no pending row pre-LLM. Double-submit = double bill. Add pending insert before LLM + unique constraint.

4. **🟡 Migration collision.** Phase-2 plan's `003_portals_table.sql` conflicts with shipped `003_liveness_columns.sql`. Renumber plan to 004/005.

5. **🟡 Turbopack/webpack collision.** `next.config.ts:5-10` defines `webpack` fn alongside `turbopack: {}`. `canvas: false` alias is dead in Turbopack dev/build. Migrate to `turbopack.resolveAlias`. Will surface as pdfjs-dist build failure on server import.

**Other needs-fix:**
- No streaming in evaluator (8-15s blocking on Claude Sonnet; fix before UI-2.2 ships).
- N+1 scan: Task 2.5 `for (job of jobs) { eq(url) }` = 1000 roundtrips. Batch via `url = ANY($urls)`.
- Liveness cost math missing: ~12.3M GB-s/day ≈ $480/mo Vercel bill at 240k/day (plan quoted QStash $72 but missed Lambda). **Fly.io Playwright worker attractive below 30k/day.**
- No `AbortSignal` plumbed — Lambda runs 300s if user navigates away.
- `scanAtsApi` tests mock fetch only; no golden-fixture test against real Greenhouse/Ashby/Lever shape. Schema drift ships silently.
- Empty Gemini response silently persists empty report — should 502, not insert blank row.
- QStash DLQ unstated; after retries exhaust, job lost. Add final-failure handler marking `uncertain, reason='qstash-retry-exhausted'`.
- No `outputFileTracingIncludes` for `/api/ai/evaluate` prompt dir.

**PR split prescription:**
- PR-A (core lib + Phase 0, schema 002, tests) — clean, reviewable
- PR-B (`d11f623` evaluate route) — **BLOCK until schema + FS-read + idempotency fixes**
- PR-C (Phase 2 libs: Playwright, urlGuard, scanAtsApi, livenessDriver, schema 003)
- PR-D (plan docs only — trivial)

**Merit side:** pure-fn split clean, SSRF guard thorough (IMDS + IPv6 ULA + link-local), TDD RED→GREEN discipline, commit hygiene excellent.

### 3.4 Security audit (OWASP + LLM Top-10) — LANDED 2026-04-25

**Verdict: NOT SAFE TO SHIP.** 1 Critical, 4 High, 5 Medium, 2 Low.

**🔴 CRITICAL — `src/proxy.ts` is dead code; middleware never runs.**
Next.js expects `src/middleware.ts` — the file is misnamed `proxy.ts` and never loaded. Every `PROTECTED_PATHS` redirect + session refresh is decorative. Only auth check on routes is client-side `AuthGate.tsx` — bypassable by direct API calls. **All API routes and dashboard pages are publicly accessible.** Fix: rename file + redeploy.

**🟠 HIGH — IDOR on `loadResume` + `deleteResume`.** `src/actions/resumeActions.ts:52-57, 66-69` query `resumes.eq('id', id)` with NO `user_id` filter. Any auth'd user can read/delete any resume UUID. Fix: add `.eq('user_id', user.id)`.

**🟠 HIGH — IDOR on `/api/ai/evaluate` cvId branch.** `route.ts:56` — `cvId` lookup has no ownership check. Auth'd user POSTs victim's cvId → receives victim's full CV markdown. Cross-user LLM06 data leak. Fix: add `.eq('user_id', user.id)`.

**🟠 HIGH — `user_profiles` table queried but never migrated.** Route reads `user_profiles.narrative` but no migration file defines it. Either missing or manually created without RLS. Fix: add `004_user_profiles.sql` with RLS policy — OR adapt route to use `resume_profiles.full_resume_text` (resolves with Task #13 schema fix).

**🟠 HIGH — LLM04 Model DoS.** `jdText` zod schema `.min(50)` has no upper bound. 500KB JD → full 8192-token Claude response = $0.15-0.50/call. 1000 abusive calls = $150-500 before alarm. Fix: `.max(20000)` + per-user rate limit via Upstash.

**🟠 HIGH — LLM01 Prompt injection.** JD text concatenated into system prompt in `═══` section markers without sanitization. Malicious JD with `═══` sequences can override scoring rules or exfiltrate CV. Fix: strip/encode `═══` in jdText before compose + explicit "untrusted input" instruction.

**🟡 MEDIUM — No security headers.** `next.config.ts` has no `headers()` export. No CSP, no X-Frame-Options, no HSTS. Fully clickjackable.

**🟡 MEDIUM — `/api/health` leaks provider config to unauth callers.** Returns `{enabled: ['gemini', 'groq', 'openrouter']}` publicly. Targeted DoS vector.

**🟡 MEDIUM — `/api/health/browser` DoS vector.** No auth check. Each GET spawns Chromium ~200MB RAM × 60s. Flood exhausts Lambda concurrency. Fix: `HEALTH_SECRET` header check.

**🟡 MEDIUM — LLM output cast to DB without schema validation.** `src/actions/scrapeJobs.ts:83-87` + `taskRunner.ts:82-86` cast LLM output as `Record<string, unknown>` and insert into `fit_breakdown jsonb`. Fix: run through existing Zod schema first.

**🟡 MEDIUM — APIFY token presence logged to stdout on cold start.** `scrapeJobs.ts:13` + `apifyRunner.ts:19` log inputs to CloudWatch 30+ days unredacted.

**🔵 LOW — `@xmldom/xmldom@0.8.12` via mammoth has HIGH CVE** (uncontrolled recursion DoS, XML injection). Exploitable via crafted DOCX in resume importer.

**🔵 LOW — `AuthGate` uses `getSession()` (client-cached unverified JWT) instead of `getUser()`.**

**Top-3 must-fix before any prod deploy:**
1. Rename `src/proxy.ts` → `src/middleware.ts` (Critical)
2. Add `.eq('user_id', user.id)` IDOR filters to `loadResume`, `deleteResume`, `/api/ai/evaluate` cvId branch (High)
3. Add `.max(20000)` + Upstash rate limit to every `/api/ai/*` (High)

### 3.4 Security audit (OWASP + LLM Top-10) — PENDING

Agent running. Severity-ranked findings on current code vs security plan.

---

## 4. Blockers / Decisions Needed from User

### B-DB — Table name resolution
`/api/ai/evaluate` references `cv_documents` + `user_profiles`. Schema has `resumes` + `resume_profiles`. Options:
- **(A)** Adapt route to `resumes` (field rename `markdown` → verify column name) + `resume_profiles` (field rename `narrative` → verify).
- **(B)** Add migration to create `cv_documents` + `user_profiles` as planned.

Recommendation: **A** — cheaper, reuses existing data; rename in plan if needed.

### B1 — Vercel Lambda memory
`@sparticuz/chromium` 147 needs ≥1769MB. Default Pro = 1024MB. Must raise to **3008MB** on `/api/liveness`, `/api/health/browser`. Billing impact: GB-seconds consumed.

### B2 — Queue provider for liveness fan-out
Default recommendation: **Upstash QStash** (~$72/mo at 240k/day, at-least-once). Alternative: Inngest (~$720/mo). Choose before Task 2.10.

### B3 — 20 seeded portals slug verification
Companies rename boards. `curl https://boards-api.greenhouse.io/v1/boards/{slug}/jobs` returns 404 for stale. Suggested list in phase-2 plan — verify before migration applies.

### B4 — GDPR retention
`scan_history` + `evaluations` = personal data. Pick retention policy (default: 90 days rolling delete via nightly cron).

### B5 — Env provisioning
Need: `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`, `CRON_SECRET`, `GEMINI_API_KEY`, `BYOK_MASTER_KEY` (for S4), `SENTRY_DSN` (for S10).

### B-UI-DESIGN — UI plan patch before execution
Three design-review fixes (tokens-first gate, mobile contract, ScoreHero layout) need merging into `ui-evolution.md` before UI-0 starts. 45 min writing.

---

## 5. Known Runtime Bugs (flagged in commits, not tracked as tasks)

- `/api/ai/evaluate` → 400 on any call (table mismatch, see B-DB above) — Task #13
- `JdMatchPanel.tsx:78` + `AIPanel.tsx:174` → silent 404 on deleted `/api/ai/jd-match-5d` — rolled into UI-0 (Task #8)
- Landing `page.tsx` is `'use client'` → zero metadata → SEO broken — rolled into UI-0 (Task #8)
- 4 stale "Lakshya Hub" brand strings — rolled into UI-0 (Task #8)

---

## 6. Multi-Agent Deployment Log

| Date | Agent | Model | Purpose | Status |
|---|---|---|---|---|
| 2026-04-24 | Phase 0+1 executor | opus | Ship Phase 0+1 tasks | ⚠ blocked by sandbox, re-executed by main |
| 2026-04-24 | Security plan writer | sonnet | Write security plan | ⚠ blocked on Write, main wrote |
| 2026-04-24 | SEO plan writer | sonnet | Write SEO plan | ⚠ blocked on Write, main wrote |
| 2026-04-25 | UI audit | sonnet | Research UI state + recommend | ✓ landed |
| 2026-04-25 | Phase 2 research | sonnet | Scope Phase 2 technical risks | ✓ landed |
| 2026-04-25 | Design review | sonnet | Pressure-test UI plan | ✓ landed (3 required fixes) |
| 2026-04-25 | CEO review | sonnet | Product strategy pressure-test | ⏳ running |
| 2026-04-25 | Eng review | opus | Architecture + code pressure-test | ⏳ running |
| 2026-04-25 | Security audit | sonnet | OWASP + LLM Top-10 audit on current code | ⏳ running |

**Lesson learned:** subagent Write tool is sandbox-blocked in this environment. Dispatch pattern: **research + review agents only**, main session does writes.

---

## 7. Model Assignment Strategy

- **Main session (opus 4.7, 1M context):** orchestration, plan authoring, file writes, execution
- **Research agents (sonnet):** codebase audits, technical research, plan reviews
- **Architecture reviews (opus):** when tradeoff density is high (eng review)
- **Mechanical execution (sonnet):** file writes, TDD cycles — when sandbox allows

Cost optimization: Phase 3+ should pipe mechanical TDD execution through sonnet agents (4× cheaper than opus). Opus reserved for design decisions, complex refactors, code reviews.

---

## 8. Next Actions

**When user returns (or on next autonomous pass):**

1. Wait for remaining 3 review agents (CEO, eng, security) to land; synthesize findings into this doc.
2. Patch UI plan with 3 design-review fixes (45 min).
3. User decision on B-DB, B1, B2, B3, B4, B5.
4. Execute P0 work: UI-0 critical fixes → table fix → open PR.
5. P1 parallelization: Security S0+S1 agent (read-only) while main does UI-1 + Phase 2 routes.
6. UI execution uses **ui-ux-pro-max** skill inline for surface-level design intelligence.

---

## 9. Related Files

- `docs/superpowers/plans/2026-04-24-careerops-integration.md` — master integration plan (Phase 0-7)
- `docs/superpowers/plans/2026-04-24-security-plan.md` — 13 phases S0-S12
- `docs/superpowers/plans/2026-04-24-seo-plan.md` — 14 phases SEO-0 to SEO-12
- `docs/superpowers/plans/2026-04-25-phase-2-scan-liveness.md` — Phase 2 detail
- `docs/superpowers/plans/2026-04-25-ui-evolution.md` — UI plan (needs design-review patch)

---

## 10. Memory Pointers (claude-mem + mempalace)

- `~/.claude/projects/-Users-animeshbasak-Desktop-ai-lab-projects/memory/MEMORY.md` — index
- `…/project_lakshya_current_state.md` — execution state
- `…/project_lakshya_ui_decision.md` — Hybrid/Option C decision (NOT full revamp)
- `…/project_lakshya_brand.md` — brand rename 2026-04-24
- `…/career_ops_overview.md` — source methodology

claude-mem indexes files under project dir automatically at session end. Agents can `mcp__plugin_claude-mem_mcp-search__search` to find this file.
