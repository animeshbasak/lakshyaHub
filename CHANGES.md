# lakshya-hub — Build Summary

**Date:** 2026-04-12  
**Build:** `npx next build` → ✅ 0 errors · 0 warnings · 15 routes  
**Source files:** 101 `.ts` / `.tsx` files  
**Merged from:** `insaneResume` (resume builder) + `Lakshya/lakshya-v2` (job tracker)

---

## Phase 0 — Auth + Infrastructure

| File | Status | What |
|---|---|---|
| `src/proxy.ts` | NEW | Auth guard proxy (Next.js 16 convention — replaces `middleware.ts`). Protects `/dashboard`, `/board`, `/resume`, `/discover`, `/profile`. Redirects logged-in users away from `/login`. |
| `src/app/auth/callback/route.ts` | NEW | OAuth callback: exchanges Supabase code for session, redirects to `/dashboard` on success, `/login?error=auth_failed` on failure. |
| `src/components/layout/AuthGate.tsx` | MODIFIED | Added try/catch around Supabase client init + session fetch. Now wires `OnboardingModal` (checks `resume_profiles` count on first login). |
| `src/components/nav/Sidebar.tsx` | MODIFIED | Real user from `supabase.auth.getUser()`, working logout → `/login`, correct nav links. |
| `src/app/login/page.tsx` | MODIFIED | Fixed `Github` → `GitBranch` icon (lucide-react compat). |
| `supabase/migrations/001_initial_schema.sql` | NEW | 6 tables with RLS: `resumes`, `resume_profiles`, `jobs` (explicit `fit_breakdown jsonb`), `applications`, `scrape_sessions`, `scrape_logs`. `updated_at` triggers on all tables. |
| `.env.local.example` | NEW | All required env vars documented. |

---

## Phase 1 — Resume Import Pipeline

Full port of `insaneResume/src/lib/resumeImport/` → `src/lib/resumeImport/` (10 files).

| File | What |
|---|---|
| `src/lib/resumeImport/types.ts` | Parser types: `ParsedResumeSchema`, `ParseConfidence`, `ParsedSectionKind` |
| `src/lib/resumeImport/schema.ts` | Line normalizers, regex helpers, `inferConfidence()` |
| `src/lib/resumeImport/extraction.ts` | PDF extraction (pdfjs-dist) + DOCX extraction (mammoth) |
| `src/lib/resumeImport/segmentation.ts` | Heading-driven section splitting |
| `src/lib/resumeImport/parserCore.ts` | `parseResumeArtifacts()` orchestrator |
| `src/lib/resumeImport/mapping.ts` | `ParsedSchema → CanonicalResumeDocument` (largest file, 37KB) |
| `src/lib/resumeImport/builderMapping.ts` | `ParsedSchema → ResumeData` (store shape) |
| `src/lib/resumeImport/validation.ts` | Per-section quality checks |
| `src/lib/resumeImport/evaluation.ts` | Parse quality scoring |
| `src/lib/resumeImport/pipeline.ts` | Public entrypoint: `parseResumeFile(file: File)` with `ResumeImportError` class + try/catch per stage |
| `src/lib/canonicalResume.ts` | Canonical resume model, fingerprint, staleness checks |
| `src/lib/atsEngine.ts` | 554-line ATS engine: `calculateATSScore()`, `scoreRawText()` |
| `src/lib/syncResumeProfile.ts` | `extractProfileFromResume()` + `syncResumeProfile()` using `@supabase/ssr` |
| `src/lib/utils/resumeContent.ts` | Resume content utilities |
| `src/lib/utils/resumeToText.ts` | Converts `ResumeData` → plain text for ATS/AI |
| `src/hooks/useAutosave.ts` | Debounced autosave hook (key: `lakshya_hub_autosave`) |

**Store extensions** (`src/features/resume-builder/store/useResumeStore.ts`):
- `applyImportedResume` — merge parsed resume into store
- `setImportReview` / `setReferenceText` — import metadata
- `saveToStorage` / `loadFromStorage` — localStorage (key: `lakshya_hub_resume_v1`)
- `saveSnapshot` / `getSnapshots` / `restoreSnapshot` — snapshot history (max 20, key: `lakshya_hub_snaps_v1`)

**StarterExperience** (`src/features/resume-builder/components/StarterExperience.tsx`):
- File input wired to `parseResumeFile()` with 5-stage progress UI
- Accepts `.pdf`, `.doc`, `.docx`

---

## Phase 2A — Resume Form Editor

### Section Components (`src/features/resume-builder/components/sections/`)

| File | What |
|---|---|
| `ContactSection.tsx` | Name, title, email, phone, location, LinkedIn, portfolio, GitHub |
| `SummarySection.tsx` | 3-line professional summary with char count |
| `ExperienceSection.tsx` | Sortable job list using `@dnd-kit/sortable` |
| `JobCard.tsx` | Job entry with sortable bullets, double-tap delete (replaces `window.confirm`) |
| `BulletRow.tsx` | Bullet with AI rewrite via `runBulletRewriteTask` + original text restore |
| `SkillsSection.tsx` | Sortable skill rows (category + values) |
| `EducationSection.tsx` | Degree, institution, period, grade |
| `ProjectsSection.tsx` | Projects + ongoing-learning entries with bullets |
| `CompetenciesSection.tsx` | Tag-chip input with drag-drop reorder via `@dnd-kit` |

### Layout Components

| File | What |
|---|---|
| `FormPanel.tsx` | Sticky tab nav + accordion sections, reads from `useResumeStore` directly |
| `PreviewPanel.tsx` | Template switcher pill row + live PDF preview via `ResumePDFView` |
| `TemplatePicker.tsx` | Responsive grid picker, cyan ring on selected, prop-based design |

### Server Actions (`src/actions/resumeActions.ts`)
`saveResume`, `loadResume`, `listResumes`, `deleteResume` — all `'use server'`, Supabase upsert pattern.

---

## Phase 2B — AI Panel + ATS Score

| File | What |
|---|---|
| `src/features/resume-builder/components/AIPanel.tsx` | 4-section right panel: JD Match (textarea + `/api/ai/jd-match-5d`), ATS Score (debounced 800ms), Bullet Improve All (200ms stagger), Reference Text. Reads `?jd_id=` URL param to pre-fill JD. |
| `src/features/resume-builder/components/ATSScorePanel.tsx` | SVG score circle (cyan→purple gradient stroke), tier label, pillar breakdown, passing/failing checks list, skeleton loading. Props: `{ result: ATSResult \| null; loading?: boolean }` |

---

## Phase 3 — Resume Templates (13 total)

All in `src/features/resume-builder/templates/`:

| Template | Style |
|---|---|
| `HarvardTemplate` | Classic academic serif |
| `ModernTemplate` | Clean two-column |
| `ModernBlueTemplate` | Blue accent sidebar |
| `ExecutiveTemplate` | Bold header, senior-focused |
| `MinimalTemplate` | Maximum whitespace |
| `FAANGTemplate` | Dense, metrics-forward |
| `TealSidebarTemplate` | Teal left column |
| `CompactProTemplate` | High density, single page |
| `WarmSerifTemplate` | Humanist serif, warm tones |
| `DarkHeaderTemplate` | Dark hero header band |
| `IndiaTechTemplate` | India tech job market optimized |
| `ClassicTemplate` | Traditional chronological |
| `CreativeTemplate` | Bold creative industry |

`templates/index.ts` exports `TEMPLATE_COMPONENTS`, `TEMPLATE_NAMES`, `TEMPLATE_LIST`.  
`TemplateType` extended to include `'modern' | 'classic' | 'creative'`.

---

## Phase 5A — Scraper Infrastructure + AI Routes

### Scraper Infrastructure

| File | What |
|---|---|
| `src/lib/scrapers/actorIds.ts` | All Apify actor IDs (LinkedIn primary/fallback, Naukri, Indeed, Glassdoor, Wellfound, Google Jobs) |
| `src/lib/scrapers/apifyRunner.ts` | Apify actor run + result polling |
| `src/lib/scrapers/buildSearchQuery.ts` | Query builder for each platform |
| `src/lib/scrapers/enrichJobDetails.ts` | Job detail enrichment |
| `src/lib/scrapers/index.ts` | Barrel export |
| `src/lib/scrapers/types.ts` | Scraper-specific types |
| `src/lib/filters/jobFilters.ts` | Salary, location, seniority filters |
| `src/lib/dedup.ts` | SHA256-based job deduplication |

### AI Routes (`src/app/api/ai/`)

| Route | Method | Purpose |
|---|---|---|
| `bullet-rewrite/route.ts` | POST | Rewrite single bullet with context |
| `jd-match/route.ts` | POST | Basic JD ↔ resume match score |
| `jd-match-5d/route.ts` | POST | 5-dimension match (skills, title, seniority, location, salary) |
| `cover-letter/route.ts` | POST | Draft cover letter |
| `interview-prep/route.ts` | POST | Interview questions + prep guide |
| `src/app/api/rescore/route.ts` | POST | On-demand fit rescore for a saved job |

### AI Task Registry Extensions

**`src/lib/ai/router.types.ts`** — 4 new `AiTask` values:
`cover_letter_draft`, `interview_prep`, `profile_summary_gen`, `resume_import_parse`

**`src/lib/ai/taskRunner.ts`** — 3 new exported functions:
`runCoverLetterDraftTask`, `runInterviewPrepTask`, `runProfileSummaryGenTask`

**`src/lib/ai/taskValidators.ts`** — 3 new validators for above tasks.

### Server Action (`src/actions/scrapeJobs.ts`)
`'use server'` — creates `scrape_sessions`, runs actors in parallel, enriches top jobs, scores with `runJdMatch5dTask()` (not raw Groq), batch-inserts to `jobs` + `applications` with `fit_breakdown`.

---

## Phase B — Dashboard + Discover + Job Board

### Pages

| File | Type | What |
|---|---|---|
| `src/app/(dashboard)/dashboard/page.tsx` | Server Component | 4 stat cards (Applications/Interviews/Offers/ATS Avg), pipeline funnel bars, recent 5 activity, quick-action links |
| `src/app/(dashboard)/discover/page.tsx` | Client Component | QueryBuilder (role/location/sources/run), session log with type icons, job result cards with FitBadge + stagger animation, "Add to Board" |
| `src/app/(dashboard)/board/page.tsx` | Server Component | Loads initial jobs+applications from Supabase, passes to `<KanbanBoard>` |
| `src/app/(dashboard)/resume/page.tsx` | Client Component | 3-panel layout (FormPanel 40% / PreviewPanel 35% / AIPanel 25%), top bar with editable name + save + TemplatePicker + PDF download, `useAutosave` wired, `?jd_id=` banner |

### Job Board Components (`src/features/job-board/components/`)

| File | What |
|---|---|
| `KanbanBoard.tsx` | 5-column Kanban with `@dnd-kit` drag-drop. On drop → `updateApplication` server action. "+" opens `AddJobModal`, card click opens `JobDrawer`. |
| `KanbanCard.tsx` | Card: company (xs muted), title (sm semibold), location, source badge, FitBadge (green ≥80 / amber 60-79 / red <60 / gray null). Dragging: scale + cyan border. |
| `KanbanColumn.tsx` | Column header with count badge + add button |
| `AddJobModal.tsx` | `AnimatePresence` modal, ESC + backdrop close, fields: Title* / Company* / Location / URL / Notes, calls `addJobToBoard` action |
| `JobDrawer.tsx` | Framer Motion slide from x:480. Full job details, embedded `JdMatchPanel`, sticky action bar: "Mark Applied" (gradient) / "Cover Letter" / "Interview Prep" (both disable during loading). |
| `JdMatchPanel.tsx` | 5 dimension bars with gradient fill, letter grade (A/B/C/D/F), top gaps chips, "Tailor Resume" → `/resume?jd_id=`, "Run Analysis" when `fit_breakdown` null. |

### Server Actions

| File | What |
|---|---|
| `src/actions/addJobToBoard.ts` | Manual job add: inserts `jobs` + `applications` (status='saved', source='manual') |
| `src/actions/updateApplication.ts` | Status update + `fit_breakdown` patch |

---

## Phase C — Profile + Onboarding

| File | What |
|---|---|
| `src/app/(dashboard)/profile/page.tsx` | Client page: initials avatar, editable name/headline/skills/locations/years_exp, job stats (Applications/Interviews/Offers), danger zone with double-tap clear. Upserts `resume_profiles` table. |
| `src/components/onboarding/OnboardingModal.tsx` | 5-step wizard (name → current role → target role → years exp → skills tags). Step indicator circles. Upserts `resume_profiles` on finish. `useReducedMotion()` guards all animations. |
| `src/components/layout/AuthGate.tsx` | Dynamically imports `OnboardingModal`. On first login (0 `resume_profiles` rows) → shows wizard. |

---

## Design System

| File | What |
|---|---|
| `design-system/MASTER.md` | Full design system: color tokens, typography scale, spacing, elevation, animation tokens, FitScore colors, status colors, z-index scale, accessibility rules |
| `design-system/pages/dashboard.md` | 3-zone grid layout, stat card specs |
| `design-system/pages/resume.md` | 3-panel layout spec, import badge patterns |
| `design-system/pages/discover.md` | QueryBuilder stepper, session log, result card specs |
| `design-system/pages/board.md` | Kanban columns, JobDrawer, JdMatchPanel, AddJobModal specs |
| `src/app/globals.css` | Extended: animation tokens, `--focus-ring`, shadow tokens, global `:focus-visible`, `@media (prefers-reduced-motion)`, `.skeleton` shimmer, custom scrollbar |

---

## Types Extended (`src/types/index.ts`)

Added / extended:
- `TemplateType` — added `'modern' | 'classic' | 'creative'`
- `YearsExperience` — `'<1' | '1-3' | '3-5' | '5-10' | '10+'`
- `ResumeProfile` — added `user_id`, `years_experience`
- `ResumeData` — added `importReview?: BuilderImportReviewState`
- `ScrapeSession`, `ScrapeLog`, `ATSCheck`, `ATSResult`, `JdMatch5dResult`, `ApplicationStatus`, `Application`, `Job`, `FitBreakdown` — all new

---

## Key Bug Fixes

| Bug | Fix |
|---|---|
| `middleware.ts` deprecated in Next.js 16 | Renamed to `proxy.ts`, export `proxy()` not `middleware()` |
| `Github` icon missing from lucide-react | Replaced with `GitBranch` |
| `fit_breakdown` column missing from PostgREST | Declared as explicit `jsonb` in schema migration |
| `window.confirm` blocks main thread | Replaced with 2-tap confirm state (3s auto-expire) in `JobCard` |
| Framer Motion `ease: 'easeOut'` TS error | Added `as const` type assertion |
| `accept=".pdf,.docx"` missing legacy Word | Extended to `.pdf,.doc,.docx` |
| Snapshot storage key had trailing underscore | Versioned to `lakshya_hub_snaps_v1` |

---

## Architecture Rules Enforced

1. AI keys server-side only — all AI calls go through `src/lib/ai/router.ts` or API routes
2. No raw `groq` / `@anthropic-ai` imports in client files or server actions
3. `'use server'` on all actions, `'use client'` only where React state/effects needed
4. Supabase: `@/lib/supabase/server` in server components, `@/lib/supabase/client` in client
5. All touch targets `min-h-[44px]` (WCAG AA)
6. `prefers-reduced-motion` respected via `useReducedMotion()` on all animated modals
7. `tsc --noEmit` exits 0 throughout all phases — never shipped with TS errors

---

## Dev Server

Running at `http://localhost:3000`

```bash
# Start
npm run dev

# Build check
npm run build

# Type check only
npx tsc --noEmit
```

## Deploy Checklist

- [ ] Fill `.env.local` from `.env.local.example`
- [ ] Run `supabase db push` to apply `supabase/migrations/001_initial_schema.sql`
- [ ] Verify `fit_breakdown` column is `jsonb` in Supabase dashboard
- [ ] Test `/login` → OAuth → `/dashboard` end-to-end
- [ ] Upload PDF → parsed → editor populated
- [ ] Confirm no AI keys visible in browser network tab
- [ ] `npm run build` passes clean before deploy
