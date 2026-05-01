# Lakshya — UI Evolution Plan

> **Decision locked (2026-04-24):** Hybrid/Option C — incremental evolution, NOT full revamp. See `memory/project_lakshya_ui_decision.md`.
> **Parent context:** `2026-04-24-careerops-integration.md` § Features, `2026-04-24-seo-plan.md` § SEO-0.
> **Target branch:** `feat/ui-evolution` (split from `feat/careerops-phase-0-1` when scope clarified).
> **Scope:** 5 UI phases (UI-0 through UI-4), ~22–30 hours total, shippable in 2-3 evenings.

---

## Strategic Context

The current app has two aesthetics coexisting: the new landing page (editorial dark `#07070b`, sharp tracking) and the legacy dashboard (cyan→purple gradient, `var(--cyan)`/`var(--purple)` tokens). The shell (Sidebar, Topbar, CmdK, layout) is high quality. Full revamp would cost 4-6 weeks and deliver no user value. What we need is:

1. Fix three embarrassing bugs blocking launch (brand strings, dead route, SEO gap)
2. Unify the color palette so the app feels like one product
3. Build the new careerops surfaces (eval detail, share page, archetype dashboard) in the new aesthetic from day one
4. Polish passes: micro-interactions, empty states, a11y

Everything below is additive. No component deletion except replacing cyan/purple tokens.

---

## Non-negotiables

1. Keep: Sidebar, Topbar, CmdKProvider, AuthGate, Kanban board, Resume builder three-panel editor, PDF templates. They work.
2. Every new public page MUST export `metadata` or `generateMetadata`. No `'use client'` at the route root.
3. No component rewrites of existing working features (Kanban, resume builder, job board) unless they block new careerops flow.
4. WCAG 2.2 AA compliance on new surfaces; existing surfaces get axe-core baseline + fix critical/serious only.
5. All new surfaces use the unified editorial palette (`#07070b` background, white text, accent from single source of truth in `globals.css`).
6. Never commit screenshot / figma / design assets without compression. Never > 500KB images in repo.

## Deferred

- Figma file for the design system (create post-launch once patterns are proven)
- Full component library extraction (shadcn/ui migration — evaluate after Phase 3)
- Dark/light mode toggle (stay dark-only for v1; adding theming is 2-3 days)
- Mobile-native app (web responsive only; separate project)

---

## Phase UI-0 — Critical Fixes (2–3 hours, ship before anything else)

Blocks: Phase 2 (scan/liveness) launches, SEO-0 rescue, paid launch.

### Task UI-0.1: Brand string sweep (15 min)

**Files:**
- Modify: `src/app/layout.tsx:17`
- Modify: `src/app/page.tsx:33`
- Modify: `src/app/page.tsx:146`
- Modify: `src/components/nav/CmdKProvider.tsx:411`

- [ ] **Step 1:** Update all 4 locations: "Lakshya Hub" → "Lakshya".
- [ ] **Step 2:** Update layout.tsx meta description from "Merge job tracking with AI-powered resume building. Land your dream job, systematically." → "AI-powered job evaluation, tailored CVs, and archetype-driven search. Aim before you apply."
- [ ] **Step 3:** `git grep -i "lakshya[\s-]*hub"` should return zero results after. Commit.

### Task UI-0.2: Fix JdMatchPanel silent 404 (30 min)

`JdMatchPanel.tsx:78` and `AIPanel.tsx:174` fetch `/api/ai/jd-match-5d` which was deleted in Task 0.3.

**Files:**
- Modify: `src/features/job-board/components/JdMatchPanel.tsx`
- Modify: `src/features/resume-builder/components/AIPanel.tsx` (the JD match part, not ATS score)

- [ ] **Step 1:** Wrap the fetch in feature flag check:

```typescript
const JD_MATCH_LEGACY_ENABLED = false  // flipped to true only when /api/ai/evaluate UI adapter ships

if (!JD_MATCH_LEGACY_ENABLED) {
  return (
    <div className="text-xs text-text-muted p-4 border border-dashed border-white/10 rounded-lg">
      JD Match is being rebuilt as the A-G evaluator. <Link href="/evaluate" className="underline">Use the new evaluator →</Link>
    </div>
  )
}
// ... existing legacy fetch code untouched below
```

- [ ] **Step 2:** Same treatment in AIPanel.tsx at line 174.
- [ ] **Step 3:** `curl http://localhost:3000/api/ai/jd-match-5d -X POST` confirms 404 (expected). UI now shows graceful CTA instead of spinner-forever. Commit.

### Task UI-0.3: Landing page SEO-0 rescue (1.5 hr)

Convert `src/app/page.tsx` from `'use client'` to RSC. Hoist interactive blocks into a client child.

**Files:**
- Modify: `src/app/page.tsx` (becomes RSC)
- Create: `src/app/(marketing)/_components/LandingShell.client.tsx`
- Modify: `src/app/layout.tsx` (upgrade root metadata to template)

- [ ] **Step 1:** Move all of `page.tsx`'s JSX body into `LandingShell.client.tsx` (as a `'use client'` component). Keep interactive hooks there.

- [ ] **Step 2:** Rewrite `page.tsx`:

```typescript
// src/app/page.tsx — RSC
import type { Metadata } from 'next'
import { LandingShell } from '@/app/(marketing)/_components/LandingShell.client'

export const metadata: Metadata = {
  title: 'Lakshya — Aim before you apply',
  description: 'AI-powered job evaluation, tailored CVs, and archetype-driven career search built on the career-ops methodology (740+ real evaluations).',
  keywords: ['AI job evaluator', 'ATS resume', 'archetype career', 'career-ops'],
  alternates: { canonical: 'https://lakshya.app/' },
  openGraph: {
    title: 'Lakshya — Aim before you apply',
    description: 'Rebuild your job search on the career-ops methodology.',
    url: 'https://lakshya.app/',
    siteName: 'Lakshya',
    type: 'website',
    locale: 'en',
    images: [{ url: '/og?page=home', width: 1200, height: 630, alt: 'Lakshya' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lakshya — Aim before you apply',
    description: 'AI-powered job evaluation + tailored CVs.',
    images: ['/og?page=home'],
  },
}

export default function HomePage() {
  return <LandingShell />
}
```

- [ ] **Step 3:** Upgrade root layout metadata:

```typescript
// src/app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://lakshya.app'),
  title: { default: 'Lakshya — Aim before you apply', template: '%s · Lakshya' },
  description: 'AI-powered job evaluation, tailored CVs, and archetype-driven career search.',
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico' },
}
```

- [ ] **Step 4:** Verify: `npm run build && npm run start` → `curl -s localhost:3000 | grep -E '<title>|<meta name="description"'` returns non-empty tags.

- [ ] **Step 5:** Surface tagline visibly in LandingShell hero: add `<p class="text-sm tracking-widest uppercase text-text-muted">Aim before you apply</p>` above the H1.

- [ ] **Step 6:** Commit.

---

## Phase UI-1 — Color Token Sweep (2 hours)

Unify palette across the 4 dashboard pages that still use `var(--cyan)`, `var(--purple)`, and hardcoded `#a855f7 → #22d3ee` gradients (per UI audit).

### Task UI-1.1: Extend `globals.css` canonical tokens (30 min)

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1:** Audit current tokens.

```bash
grep -E "^\s*--" src/app/globals.css | head -30
```

- [ ] **Step 2:** Add unified accent tokens (do not delete old ones yet — redirect them):

```css
:root {
  /* Editorial accents — unified palette */
  --accent:          #a68aff;   /* indigo-violet, primary action */
  --accent-muted:    #6d5ec8;
  --accent-contrast: #ffffff;
  --accent-gradient: linear-gradient(135deg, #a68aff 0%, #5d9fff 100%);

  /* Semantic tier colors (kanban, eval scores) */
  --tier-high:       #4ade80;   /* emerald-400 */
  --tier-mid:        #fbbf24;   /* amber-400 */
  --tier-low:        #f87171;   /* red-400 */

  /* LEGACY (redirect — do not use in new code) */
  --cyan:   var(--accent);
  --purple: var(--accent-muted);
}
```

- [ ] **Step 3:** Commit tokens only (no consumer changes yet, so regression-safe).

### Task UI-1.2: Sweep consumers (1 hr)

**Files to grep + replace:**

```bash
# Find all cyan/purple + hardcoded gradient uses
grep -rln "var(--cyan)\|var(--purple)\|#a855f7\|#22d3ee" src/ --include='*.ts' --include='*.tsx' --include='*.css'
```

Expected hits (per UI audit): `Sidebar` avatar gradient, `src/app/(dashboard)/*` pages, `CmdKProvider`, some chart components in dashboard.

- [ ] **Step 1:** For each hit, replace:
  - `var(--cyan)` → `var(--accent)`
  - `var(--purple)` → `var(--accent-muted)`
  - `linear-gradient(135deg, #a855f7, #22d3ee)` (any order / rotation) → `var(--accent-gradient)`

- [ ] **Step 2:** Visual spot-check each dashboard page — sidebar avatar, kanban column headers, chart accents, board status badges, discover grade badges.

- [ ] **Step 3:** Commit the sweep. Keep legacy `--cyan`/`--purple` aliases live for 1 week (migration safety), delete in UI-1.3.

### Task UI-1.3: Remove legacy aliases (15 min, after UI-1.2 stable)

- [ ] **Step 1:** Delete `--cyan` + `--purple` from `:root` in `globals.css`.
- [ ] **Step 2:** `grep -rn "var(--cyan)\|var(--purple)"` returns nothing.
- [ ] **Step 3:** Commit.

---

## Phase UI-2 — Careerops New Surfaces (Week 1 of integration, 8–12 hours)

Unlock features from `careerops-integration.md` Phases 1–2. Each surface is a route + page + optional components. All use unified palette + RSC-first + metadata.

### Task UI-2.1: Evaluate CTA entry + `/evaluate` page (2 hr)

Route where user pastes a JD → triggers `/api/ai/evaluate` → streams / displays A-G report.

**Files:**
- Create: `src/app/(dashboard)/evaluate/page.tsx` (RSC metadata + client shell)
- Create: `src/app/(dashboard)/evaluate/_components/EvaluatePanel.client.tsx`
- Create: `src/app/(dashboard)/evaluate/_components/AGReportView.tsx`

- [ ] **Step 1:** `/evaluate` page = JD paste textarea + CV picker + provider toggle (Claude / Gemini) + submit. On submit, POST to `/api/ai/evaluate`, store result, navigate to `/eval/[id]`.

- [ ] **Step 2:** Client-side validation: min 50 chars (matches route zod), max 40k chars (~10k tokens — JDs that long are noise).

- [ ] **Step 3:** Loading state: skeleton of 7 A-G blocks, animated shimmer.

- [ ] **Step 4:** On response, navigate to `/eval/[id]`. Commit.

### Task UI-2.2: Eval detail page `/eval/[id]` (2 hr)

**Files:**
- Create: `src/app/(dashboard)/eval/[id]/page.tsx`
- Create: `src/app/(dashboard)/eval/[id]/_components/ScoreHero.tsx`
- Create: `src/app/(dashboard)/eval/[id]/_components/BlockAccordion.tsx`
- Create: `src/app/(dashboard)/eval/[id]/_components/ArchetypeBadge.tsx`
- Create: `src/app/(dashboard)/eval/[id]/_components/LegitimacyPill.tsx`

- [ ] **Step 1:** Server-side RSC fetch from Supabase `evaluations` table (RLS scopes to user). If not found → 404.

- [ ] **Step 2:** Hero: score ring (0–5 / 5), company name, role, archetype badge, legitimacy pill, "Apply" button (disabled if score < 4.0/5 per career-ops non-negotiable #1, with warning microcopy).

- [ ] **Step 3:** Collapsible A-G blocks parsed from `blocks_json` + `report_md`. Each block expandable, syntax-highlighted if code-like, with "Copy" button per block.

- [ ] **Step 4:** Share CTA: "Make this public" toggle (writes `evaluations.is_public = true`, shows `/share/:id` link once on).

- [ ] **Step 5:** Commit.

### Task UI-2.3: Public share page `/share/[id]` (1.5 hr)

**Files:**
- Create: `src/app/share/[id]/page.tsx` (public, no auth required, indexable)
- Reuse: `ScoreHero`, `ArchetypeBadge`, `LegitimacyPill` from UI-2.2
- Create: `src/app/(marketing)/_components/CTAFooter.tsx`

- [ ] **Step 1:** `generateMetadata` with canonical + dynamic OG image (from SEO plan SEO-3).

- [ ] **Step 2:** Respect `evaluations.anon_level`: hide company name if `full_anon`, show only company if `company_only`, show everything if `user_named`.

- [ ] **Step 3:** Footer: "Get your own A-G evaluation — 3 free/mo" CTA routing to `/signup?ref=share`.

- [ ] **Step 4:** `rel="nofollow"` on outbound JD links.

- [ ] **Step 5:** JSON-LD `Article` schema for rich results (SEO plan SEO-2).

- [ ] **Step 6:** Commit.

### Task UI-2.4: Archetype dashboard `/archetypes` (1.5 hr)

Aggregates user's evaluations across 6 archetypes → shows distribution + conversion rate + recommended archetypes.

**Files:**
- Create: `src/app/(dashboard)/archetypes/page.tsx`
- Create: `src/app/(dashboard)/archetypes/_components/ArchetypeDistribution.tsx`
- Create: `src/app/(dashboard)/archetypes/_components/ConversionFunnel.tsx`

- [ ] **Step 1:** Supabase query: `SELECT archetype, status, count(*) FROM evaluations JOIN applications USING (job_id) WHERE user_id = ? GROUP BY 1, 2`.

- [ ] **Step 2:** Render: bar chart per archetype showing Evaluated → Applied → Responded → Interview → Offer counts. Highlight highest-converting archetype.

- [ ] **Step 3:** Empty state: "Evaluate 5+ jobs to unlock archetype insights."

- [ ] **Step 4:** Commit.

### Task UI-2.5: Kanban cadence badges (1 hr, uses existing jobs.cadence_flag column from Phase 0.4)

**Files:**
- Modify: `src/features/job-board/components/KanbanCard.tsx` (or equivalent)

- [ ] **Step 1:** If `application.cadence_flag === 'urgent'` → amber ring + "Follow up today" microcopy.
- [ ] **Step 2:** `'overdue'` → red ring + "Follow up overdue by N days".
- [ ] **Step 3:** `'cold'` → gray treatment + "Consider closing".
- [ ] **Step 4:** `'ok'` or null → default styling.
- [ ] **Step 5:** Wire through useState subscription so daily cron updates reflect in UI without refresh (poll every 5 min or Supabase realtime).

### Task UI-2.6: Resume builder LaTeX toggle (2 hr, Phase 3 dep but UI can prep now)

**Files:**
- Modify: `src/features/resume-builder/components/AIPanel.tsx` (or export panel)

- [ ] **Step 1:** Add `<ToggleGroup>` between "HTML/PDF" (default) and "LaTeX". State in `useResumeStore`.

- [ ] **Step 2:** LaTeX path renders a preview in monospace `<pre>` block with download button. Pipes to future `/api/cv/generate?format=latex` when Phase 3 ships.

- [ ] **Step 3:** Disable LaTeX if `format !== 'latex'` feature-flag checked — ships disabled until Phase 3 lands the backend.

- [ ] **Step 4:** Commit.

### Task UI-2.7: Story bank page `/stories` (2 hr)

**Files:**
- Create: `src/app/(dashboard)/stories/page.tsx`
- Create: `src/app/(dashboard)/stories/_components/StoryList.client.tsx`
- Create: `src/app/(dashboard)/stories/_components/StoryForm.client.tsx`

Schema already exists from Phase 0.4 migration 002 (`story_bank` table with STAR+R fields).

- [ ] **Step 1:** List view — table of stories with title, archetype tag, created_at.
- [ ] **Step 2:** Create / edit form with STAR+R fields (Situation, Task, Action, Result, Reflection) + tags + archetype select.
- [ ] **Step 3:** CRUD via Supabase client with RLS.
- [ ] **Step 4:** Commit.

### Task UI-2.8: Sidebar nav additions (30 min)

**Files:**
- Modify: `src/components/nav/Sidebar.tsx`

- [ ] **Step 1:** Add nav entries: `Evaluate` (with "New" badge), `Archetypes`, `Stories`. Group under "Careerops" section header.

- [ ] **Step 2:** Commit.

---

## Phase UI-3 — Public Marketing Surfaces (6–10 hours)

Unlocks SEO plan SEO-1 through SEO-6.

### Task UI-3.1: `/pricing` page (1.5 hr)

Tiers: Free / Pro $19 / Hunter $49 / BYOK $9. JSON-LD `SoftwareApplication` schema with Offer children.

**Files:** `src/app/pricing/page.tsx`, `_components/PricingTier.tsx`

- [ ] Step 1: Four-column table. Highlight Pro (most popular).
- [ ] Step 2: FAQ below pricing with `FAQPage` schema.
- [ ] Step 3: CTAs: "Start free" (to `/signup`) and "Talk to us" (mailto for BYOK enterprise).

### Task UI-3.2: `/about` page (1 hr)

- [ ] Step 1: Story of Lakshya, career-ops origin (credit santifer, MIT link).
- [ ] Step 2: Team section (even if team = 1).
- [ ] Step 3: Disambiguation footer (not Lakshya Mittal / 2004 film / drone).

### Task UI-3.3: `/guides/[archetype]` (6 pages, 3 hr)

Per SEO plan SEO-4. MDX content + shared layout.

- [ ] Step 1: MDX pipeline (`@next/mdx` or `contentlayer`). Assess with actual Next.js 16 compat.
- [ ] Step 2: One guide written end-to-end (`ai-platform`, 2500+ words). Then fan out to remaining 5 from same template.
- [ ] Step 3: Related content links, JSON-LD `Article` schema, FAQ section.

### Task UI-3.4: `/compare/[competitor]` (6 pages, 2 hr)

- [ ] Step 1: Data table from COMPETITORS const in SEO plan SEO-5.1.
- [ ] Step 2: Screenshot shots (same JD, both products) for 1–2 key competitors.
- [ ] Step 3: Migration CTA: "Moving from Teal? We import your saved jobs."

### Task UI-3.5: Dynamic OG image route (1 hr)

Per SEO plan SEO-3.1. `src/app/og/route.tsx` using `next/og` `ImageResponse`.

---

## Phase UI-4 — Polish + Accessibility (4–6 hours)

### Task UI-4.1: Empty states + loading skeletons (2 hr)

Audit every list/table/dashboard component. Each gets:
1. Empty state (illustration + CTA)
2. Loading skeleton (not just spinner)
3. Error state (with retry CTA)

Surfaces to cover:
- Dashboard KPI cards (loading / zero-state)
- Kanban columns (empty column states, drag hint)
- Resume builder empty state (first-time user)
- Discover empty (no searches yet)
- Archetypes (needs 5+ evals)
- Stories (first story CTA)
- Evaluations list (first eval CTA)

### Task UI-4.2: Micro-interactions (1 hr)

- Score ring: animated fill on load (`framer-motion`, already installed)
- Kanban drag: subtle shadow grow + destination highlight
- CmdK: debounced search, "no results" illustration
- Toast feedback (via `sonner`, already installed): on save, on copy, on share

### Task UI-4.3: Accessibility pass (2 hr)

Per SEO plan SEO-12 + security plan a11y implications.

- [ ] Step 1: `npm install -D @axe-core/playwright`. Write test for: `/`, `/pricing`, one guide, `/app/dashboard`, `/app/evaluate`, `/eval/[id]`, `/share/[id]`.
- [ ] Step 2: Fix every serious / critical violation. Log moderate ones for later.
- [ ] Step 3: Screen-reader smoke (VoiceOver): can I tab through landing, sign up, evaluate a JD, read the result? If anything doesn't announce, fix.
- [ ] Step 4: Every icon-only button gets `aria-label`. Every image gets `alt`. Every `next/image` decorative gets `alt=""` (not missing).

### Task UI-4.4: Favicon + branded icons (30 min)

- [ ] Step 1: Create `src/app/icon.tsx` with `ImageResponse` — Lakshya "ल" wordmark on gradient. Replace default `.ico`.
- [ ] Step 2: Create `src/app/apple-icon.tsx` (180×180).
- [ ] Step 3: Create `src/app/opengraph-image.tsx` as fallback default OG.
- [ ] Step 4: Delete `public/favicon.ico` (Next auto-serves `icon.tsx`).

---

## Self-Review Gate (end of UI-0)

Before merging UI-0 to main:

- [ ] `git grep -i "lakshya[- ]*hub"` returns 0 results
- [ ] `curl localhost:3000/api/ai/jd-match-5d -X POST` returns 404 (expected) AND UI shows graceful fallback (not broken spinner)
- [ ] `curl -s localhost:3000 | grep -c '<title>Lakshya'` returns >= 1
- [ ] Mozilla Observatory + Lighthouse SEO score >= 95 on `/`
- [ ] `npm run build && npm run test:run` green
- [ ] Open PR titled "feat(ui): UI-0 critical fixes (brand + JdMatch404 + SEO-0)"

## Self-Review Gate (end of UI-1)

- [ ] `git grep "var(--cyan)\|var(--purple)"` returns 0 (after UI-1.3)
- [ ] Visual inspection: sidebar avatar, kanban column headers, chart accents, board status badges all use the unified accent palette
- [ ] Landing page vs dashboard = same palette, different density

## Self-Review Gate (end of UI-2)

- [ ] User can end-to-end: paste JD → /evaluate → /eval/[id] → toggle public → see /share/[id] indexable page
- [ ] Archetype dashboard shows aggregate data (seed 10 fake evals to test)
- [ ] Kanban cards show cadence badges when `cadence_flag` populated
- [ ] Story bank CRUD works + RLS enforced (second user can't see first user's stories)

---

## Decision Log

| Decision | Rationale | Date |
|---|---|---|
| Hybrid incremental, NOT full revamp | Shell works; scope of debt is small (~40 token refs + 3 brand strings) | 2026-04-24 |
| Unified accent = `#a68aff` indigo-violet | Bridges current landing editorial dark + prior cyan/purple; not cliché blue | 2026-04-25 |
| Keep legacy `--cyan`/`--purple` aliases for 1 week | Migration safety for any missed consumers | 2026-04-25 |
| No shadcn/ui migration in this plan | 2-3 day detour for no user value; evaluate after Phase 3 | 2026-04-25 |
| MDX for guides (not DB) | SEO prefers static + RSC-first; content in repo is versioned with code | 2026-04-25 |
| Dark-only, no theming v1 | Adds 2-3 days; bottom-up SaaS in this niche overwhelmingly dark | 2026-04-25 |
| Disable LaTeX toggle UI until Phase 3 backend ships | Don't ship dead button; show grayed "Coming in Phase 3" state | 2026-04-25 |

---

## Cost / Effort Summary

| Phase | Effort | Blocks | Ship gate |
|---|---|---|---|
| UI-0 critical fixes | 2–3 h | launch | merge to main |
| UI-1 color sweep | 2 h | feel-unified | merge to main |
| UI-2 careerops surfaces | 8–12 h | Phase 2 UX | ship with Phase 2 routes |
| UI-3 marketing surfaces | 6–10 h | organic growth | ship in week 2 |
| UI-4 polish + a11y | 4–6 h | paid launch | ship before Stripe flip |
| **Total** | **22–33 h** | | |

**Critical path to paid launch:** UI-0 → UI-1 → UI-2 → UI-4 = 16–23 h. UI-3 can ship post-launch.

---

## Reference

- UI audit (source of recommendations): see `memory/project_lakshya_ui_decision.md` + earlier audit agent output in conversation (2026-04-24)
- SEO plan cross-refs: `2026-04-24-seo-plan.md` § SEO-0, SEO-3, SEO-4, SEO-5, SEO-12
- Security plan cross-refs: `2026-04-24-security-plan.md` § S6 (CSP affects landing), § S10 (accessibility / Sentry)
- Careerops plan: `2026-04-24-careerops-integration.md` § File Structure / Phases 1-5
