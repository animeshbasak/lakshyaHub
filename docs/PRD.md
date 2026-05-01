# Lakshya Hub — Product Requirements Document

## Vision

Lakshya Hub is an AI-native job search operating system for a single candidate. It collapses the full job-search loop — discovery, resume tailoring, application tracking, and interview prep — into one workspace where the candidate's resume is the canonical source of truth that every other surface reads from and writes back into. Instead of juggling a spreadsheet, a job board, a resume editor, and a notes app, the candidate runs one command and the system scrapes jobs, scores each against their resume, highlights gaps, and lays out a pipeline to act on.

## Target user

Primary: an individual active job-seeker (initially India-focused — see `src/lib/filters/jobFilters.ts`) at the early-to-mid career stage who is applying to many roles in parallel and wants to stop manually copy-pasting job descriptions into ChatGPT to get a fit score. The product assumes the user has an existing resume (PDF / DOCX) or is willing to fill in a structured builder, and that they are comfortable giving the tool their own AI provider keys (Gemini, Groq, OpenRouter) and an Apify token for scraping.

Out of band: recruiters, teams, or referrers. The app is single-tenant per login — every Supabase table is gated by `user_id = auth.uid()` RLS (see `supabase/migrations/001_initial_schema.sql`).

## Core pillars

### 1. Discover
The user types a role and a location, picks which job sources to hit (LinkedIn, Naukri, Indeed, Glassdoor, Web), and the app runs them in parallel through Apify actors, falls back to free Greenhouse / Lever / RemoteOK APIs, filters the result to India-relevant postings, deduplicates, and scores the top 50 jobs against the user's resume across five dimensions. See `src/lib/scrapers/index.ts` and `src/actions/scrapeJobs.ts`.

### 2. Resume
A full resume builder with 13 templates, section-by-section editing, PDF export via `@react-pdf/renderer`, ATS scoring, AI bullet rewriting, and bidirectional import from an existing PDF or DOCX. The imported resume is extracted (pdfjs / mammoth), segmented into sections by heuristics, and LLM-enhanced for bullets the rule-based parser missed. See `src/features/resume-builder/` and `src/lib/resumeImport/`.

### 3. Pipeline
A Kanban board (`saved → applied → interview → offer → rejected`) built on `@dnd-kit`, persisting every move to a Supabase `applications` table. Each card opens a drawer with the job, the fit breakdown, notes, and the JD Match panel. See `src/features/job-board/components/KanbanBoard.tsx`.

### 4. ATS / JD Match
Two complementary scoring systems: (a) a rule-based ATS engine (`src/lib/atsEngine.ts`) that checks the user's own resume against keyword / positioning / baseline pillars and returns a 0–100 with actionable tips; (b) an LLM-based 5-dimension JD match (skills, title, seniority, location, salary) that compares a specific job's description against the user's resume and returns a grade, verdict, and top gaps. The 5-D match runs server-side via `runJdMatch5dTask` invoked from `src/actions/scrapeJobs.ts` (per-job UI panel `src/features/job-board/components/JdMatchPanel.tsx` is feature-flagged off pending the A–G evaluator adapter rebuild).

## User journeys

1. **First-time onboarding.** User signs up via Supabase Auth → `AuthGate` (`src/components/layout/AuthGate.tsx`) detects a missing `resume_profile` → `OnboardingModal` (`src/components/onboarding/OnboardingModal.tsx`) collects name, current role, target role, years of experience, and skills across 5 steps → profile is written to `resume_profiles`.
2. **Import an existing resume.** `/resume` → "Upload PDF/DOCX" → `parseResumeFile()` extracts text → `parseResumeArtifacts()` segments + maps → `tryAiEnhanceParse()` (POST `/api/ai/resume-import-parse`) fills gaps → store is populated → user reviews flagged low-confidence sections.
3. **Daily job check.** User opens `/discover` → enters "Senior Frontend Engineer, Bangalore", selects LinkedIn + Naukri + Web → clicks Find Jobs → live scrape log streams in → top 50 jobs appear sorted by fit score with grade badges → user clicks "Save" on promising ones, which `upsert`s an `application` row at status=`saved`.
4. **Apply to a job.** From `/discover` or `/board`, user opens the JobDrawer → clicks the external URL, applies on the ATS → drags the card to "Applied" in `/board` → adds notes → `updateApplicationStatus()` writes back.
5. **Tune resume for a JD.** From a job card, "Match against my resume" → `/resume?jd_id=...` → JD Match panel shows 5-dimension breakdown + missing keywords → user edits bullets (optionally via AI rewrite) → ATS panel live-updates → Save triggers `syncResumeProfile()` so the next scrape scores against the new resume.
6. **Track pipeline.** `/board` → Kanban with 5 columns → drag-and-drop status changes → `/dashboard` shows funnel counts, average fit score, and recent apps.

## Feature list by surface

| Surface | Route | Status |
| --- | --- | --- |
| Home / Dashboard | `/dashboard` | Shipped |
| Discover | `/discover` | Shipped |
| Pipeline | `/board` | Shipped |
| Resume Builder | `/resume` | Shipped |
| Settings / Profile | `/profile` | Shipped |
| Tweaks panel | global (accent / density / gradient) | Shipped |
| CmdK palette | global (`Cmd+K`) | Shipped |
| Login | `/login` | Shipped |

### Home / Dashboard (`src/app/(dashboard)/dashboard/page.tsx`)
- Greeting + active-interviews callout.
- Four stat cards: Applications, Interviews, Offers, Avg fit score.
- Pipeline funnel visualisation across the 5 statuses.
- Recent 5 applications with quick-jump to `/board`.
- CTA to run a new search.

### Discover (`src/app/(dashboard)/discover/page.tsx`)
- Query + location input with source toggles (LinkedIn, Naukri, Indeed, Glassdoor, Web/Company sites).
- Live scrape log streamed from `scrape_logs` table (info / success / warn / error).
- Parallel multi-actor scraping with per-source fallback chain (see LLD).
- Post-scrape: India filter + dedup + enrichment of top 50 via Apify RAG browser.
- Inline fit score + grade (A–F) + top_gaps + salary + remote badge.
- Save-to-board and open-original-URL actions.

### Resume Builder (`src/app/(dashboard)/resume/page.tsx` + `src/features/resume-builder/`)
- Three-panel layout: FormPanel, PreviewPanel, AIPanel.
- Starter experience: upload, demo persona, or blank.
- 13 templates (Harvard, FAANG, Modern, Classic, Minimal, Executive, Creative, Dark Header, Teal Sidebar, Warm Serif, Compact Pro, Modern Blue, India Tech).
- Import pipeline with confidence badges + unclassified-line warnings.
- ATS score panel with keyword, positioning, and baseline pillars.
- AI-powered bullet rewriting, cover letter draft, interview prep generation.
- PDF export via `@react-pdf/renderer`.
- JD-match mode when navigated with `?jd_id=` query param.
- Autosave via `useAutosave` (`src/hooks/useAutosave.ts`) + manual save that calls `saveAndSyncProfile()`.

### Pipeline (`src/app/(dashboard)/board/page.tsx` + `src/features/job-board/`)
- 5-column Kanban: Saved, Applied, Interview, Offer, Rejected.
- Drag-and-drop with `@dnd-kit`.
- Column counters + total.
- Add-job-manually modal (`AddJobModal`).
- Job drawer with fit breakdown, notes, JD match panel, external link.
- Filter + sort controls (designed — present in `KanbanBoard.tsx` header).

### Settings / Profile (`src/app/(dashboard)/profile/page.tsx`)
- Inline-editable target titles, skills, target locations, years of experience, display name.
- Stats: applications, interviews, offers.
- Destructive actions (e.g. clear profile) — Designed, not shipped (imports `ShieldAlert` + `Trash2` but verify scope).

### Tweaks (`src/components/nav/TweaksProvider.tsx`)
- Runtime theme knobs: accent hue (cyan / purple / emerald / amber / mono), gradient intensity (flat / signature / full), density (compact / cozy / roomy), sidebar-collapsed default, show-badges toggle.
- Persisted to `localStorage` under `lk_tweaks`.

### CmdK (`src/components/nav/CmdKProvider.tsx`)
- `⌘K` / `Ctrl+K` opens palette; `⌘J` jumps straight to Discover.
- Groups: Navigate (Home, Discover, Pipeline, Resume, Settings) and Actions (Run new job search, Add job to pipeline, Import resume).
- Arrow-key + Enter navigation, Esc to close.

## Success metrics

What "working well" looks like for a single user:

| Metric | Target signal |
| --- | --- |
| Job discovery yield | ≥ 30 unique India-relevant jobs per scrape without Apify budget blowing up |
| Fit score trust | User's saved jobs have a mean fit score ≥ 70 and their offers have ≥ 80 |
| Resume import fidelity | Parse confidence `high` on ≥ 80% of well-formed PDFs; every experience entry has ≥ 1 bullet |
| Time to first apply | < 5 minutes from login to first "Applied" move |
| AI availability | < 2% of AI calls fall through all three providers (Gemini → Groq → OpenRouter) |
| Pipeline adoption | ≥ 80% of saved jobs progress at least once (saved → applied) |
| Funnel visibility | Dashboard counts match Supabase row counts exactly (no stale cache) |

## Out of scope

- **Not a recruiter tool.** No ATS ingest, no candidate pipelines, no multi-seat teams. Every row in Supabase is scoped to one `auth.uid()`.
- **Not a social network.** No profiles visible to other users, no feed, no messaging.
- **Not a job board.** Lakshya Hub never hosts job postings; it scrapes public boards and caches results per user.
- **Not a global product at v1.** Post-scrape filter (`filterToIndia`) explicitly drops US / UK / EU / APAC postings and surfaces India cities + "remote". Localisation to other regions is a Proposed, not Shipped, extension.
- **Not a Claude-branded app internally.** Despite `@anthropic-ai/sdk` appearing in dependencies, the AI router does not route to Anthropic. All tasks fan out across Gemini / Groq / OpenRouter (see `src/lib/ai/router.config.ts`). The SDK dependency is unused in shipped code paths.
- **Not an email / calendar integrator.** Interview prep returns 10 questions as JSON; it does not book meetings or sync with Gmail.
- **Not a referral or networking graph.** Out of scope for v1 and not present in the schema.
