# Lakshya Hub — Low-Level Design

## Architecture overview

Lakshya Hub is a Next.js 16 App Router project (React 19) with a Supabase Postgres backend, Supabase Auth for identity, and a provider-agnostic AI router that fans tasks out across Gemini, Groq, and OpenRouter. Scraping runs server-side via Apify actors plus direct public APIs (Greenhouse, Lever, RemoteOK). Heavy PDF rendering runs client-side via `@react-pdf/renderer` and resume parsing uses `pdfjs-dist` + `mammoth` in the browser.

```
  ┌────────────────────────────────────────────────────────────────┐
  │  Browser (Next 16 App Router)                                  │
  │                                                                │
  │  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌──────────────┐   │
  │  │/dashboard│  │ /discover │  │ /board   │  │ /resume      │   │
  │  └────┬─────┘  └─────┬─────┘  └────┬─────┘  └──────┬───────┘   │
  │       │              │             │               │           │
  │       │      ┌───────▼─────┐       │       ┌───────▼────────┐  │
  │       │      │ Server      │       │       │ Client import  │  │
  │       │      │ Action:     │       │       │ pdfjs/mammoth  │  │
  │       │      │ scrapeJobs  │       │       │ + rule parser  │  │
  │       │      └───────┬─────┘       │       └───────┬────────┘  │
  │       │              │             │               │           │
  │       │              │      (use server)           │  fetch    │
  │       │              ▼             ▼               ▼           │
  └───────┼────────── Supabase SSR / client ── API routes ─────────┘
          │                    │                  │
          │                    │                  │
          ▼                    ▼                  ▼
   ┌────────────────────────────────────┐   ┌──────────────────────┐
   │  Supabase (Postgres + Auth + RLS)  │   │ /api/ai/*  +  router │
   │  resumes, resume_profiles, jobs,   │   │ Gemini → Groq →      │
   │  applications, scrape_sessions,    │   │ OpenRouter (fallback)│
   │  scrape_logs                       │   └──────────┬───────────┘
   └────────────────────────────────────┘              │
                                                       ▼
                              Apify actors (LinkedIn, Naukri, Google Jobs,
                              RAG browser), Greenhouse / Lever / RemoteOK APIs
```

## Directory structure

| Folder | Purpose |
| --- | --- |
| `src/app/` | Next.js App Router entrypoints (auth routes, `(dashboard)` group, `/api/*`). |
| `src/app/(dashboard)/` | Authenticated surfaces: `dashboard`, `discover`, `board`, `resume`, `profile`. |
| `src/app/api/` | Route handlers: `ai/*` (bullet-rewrite, cover-letter, interview-prep, jd-match, jd-match-5d, resume-import-parse), `rescore`, `health`. |
| `src/actions/` | Server Actions (`'use server'`): `scrapeJobs.ts`, `addJobToBoard.ts`, `updateApplication.ts`, `resumeActions.ts`. |
| `src/features/job-board/` | Pipeline Kanban + JobDrawer + JdMatchPanel + AddJobModal. |
| `src/features/resume-builder/` | Zustand store, FormPanel, PreviewPanel, AIPanel, 13 templates, PDF export. |
| `src/components/nav/` | `Sidebar`, `Topbar`, `CmdKProvider`, `TweaksProvider`, `BrandMark`. |
| `src/components/layout/` | `AuthGate` — session check + onboarding modal trigger. |
| `src/components/onboarding/` | 5-step `OnboardingModal`. |
| `src/components/ui/` | Shared atomic components (`FitBadge`). |
| `src/hooks/` | `useAutosave` for resume drafts. |
| `src/lib/ai/` | Router (`router.ts`), adapters (`router.adapters.ts`), per-task runners (`taskRunner.ts`), validators (`taskValidators.ts`), config (`router.config.ts`). |
| `src/lib/resumeImport/` | Extraction → segmentation → mapping → validation pipeline + schema + types. |
| `src/lib/scrapers/` | Apify actor registry (`actorIds.ts`), runner (`apifyRunner.ts`), direct sources (`directSources.ts`), orchestrator (`index.ts`), `enrichJobDetails`. |
| `src/lib/filters/` | `jobFilters.ts` (India filter + dedup). |
| `src/lib/supabase/` | `client.ts` (browser) + `server.ts` (SSR / server actions). |
| `src/lib/` | `atsEngine.ts`, `canonicalResume.ts`, `syncResumeProfile.ts`, `formatters.ts`, `dedup.ts`. |
| `src/types/index.ts` | Canonical type definitions (Job, Application, ResumeData, FitBreakdown, JdMatch5dResult, etc.). |
| `supabase/migrations/` | SQL schema + RLS policies + triggers. |
| `scripts/` | Utilities (build helpers). |
| `public/` | Static assets + pdfjs worker. |

## Data flow per feature

### Resume import

Entry: `/resume` → "Upload PDF/DOCX" or `StarterExperience`. All parsing runs in the browser; LLM enhancement roundtrips to the server.

| Step | Module | What happens |
| --- | --- | --- |
| 1. Extraction | `src/lib/resumeImport/extraction.ts` | PDF → `pdfjs-dist` text items with x/y positions; DOCX → `mammoth` raw text. Output: `ExtractedResumeBlock[]` with bullet hints, uppercase ratio, token count. |
| 2. Parse orchestration | `src/lib/resumeImport/pipeline.ts` → `parseResumeFile()` | Wraps extraction, catches `ResumeImportError` with `stage: extraction | parsing | mapping`. |
| 3. Segmentation | `src/lib/resumeImport/segmentation.ts` | Headings matched against `SECTION_ALIASES` (summary, experience, education, skills, sideProjects, projects, certifications, achievements, languages, links, contact). Substring fallbacks for compound headings. |
| 4. Mapping | `src/lib/resumeImport/mapping.ts` | Section blocks → `ParsedResumeSchema` (basics, summary, experience, education, skills, sideProjects). |
| 5. Validation | `src/lib/resumeImport/validation.ts` | `validateParsedResume()` produces `structuralSummary`, `headingRecoveryFailures`, per-section confidence. |
| 6. LLM enhancement | `src/lib/resumeImport/pipeline.ts` → `tryAiEnhanceParse()` → `POST /api/ai/resume-import-parse` → `runResumeImportParseTask()` (raw text truncated to 10 000 chars, max_tokens 3000, temperature 0.1). | Merges AI output into rule-based result where fields are empty (`mergeAiIntoParsed`). |
| 7. Builder mapping | `src/lib/resumeImport/builderMapping.ts` → `mapParsedResumeToBuilder()` | Shape into `BuilderImportPayload` (header, summary, experience, education, projects, skills, competencies, referenceText, importReview). |
| 8. Store apply | `src/features/resume-builder/store/useResumeStore.ts` → `applyImportedResume()` | Zustand store populated; `localStorage` backed via `loadFromStorage()`. |
| 9. UI badges | `AIPanel`, `FormPanel` | Review badges, low-confidence toasts, unclassified lines callout. |

### Job discovery

Entry: `/discover` → `scrapeJobs()` server action.

| Step | Module | What happens |
| --- | --- | --- |
| 1. Auth + profile fetch | `src/actions/scrapeJobs.ts` | Creates `scrape_session` row; fetches user's `resume_profile`. |
| 2. Query expansion | `src/lib/scrapers/buildSearchQuery.ts` | Generates LinkedIn search variants (only partially wired — noted for future use). |
| 3. Parallel source fan-out | `src/lib/scrapers/index.ts` → `scrapeJobsWithFallback()` | For each user-selected source, walks its `SOURCE_ACTORS` chain; first successful actor wins per source; runs `Promise.allSettled` across sources. |
| 4. Actor invocation | `src/lib/scrapers/apifyRunner.ts` → `runActor()` | POSTs to `api.apify.com/v2/acts/{id}/runs`; polls until finished; handles 403 "rent required" as a soft error. |
| 5. Google Jobs backfill | `scrapeJobsWithFallback` | Runs `google_jobs` actor if user picked Web or per-source yield < limit. |
| 6. Direct public APIs | `src/lib/scrapers/directSources.ts` | Fetches Greenhouse board API, Lever postings API, RemoteOK JSON — no auth, always run. |
| 7. Filter + dedup | `src/lib/filters/jobFilters.ts` → `applyPostScrapeFilters()` | `filterToIndia()` drops US / UK / EU / APAC; `deduplicateJobs()` keys on `(company, title)`. |
| 8. Top-50 enrichment | `src/lib/scrapers/enrichJobDetails.ts` | For jobs with short descriptions, re-fetches the job URL via Apify `rag-web-browser` actor; cap at 5 000 chars. |
| 9. Fit scoring | `src/actions/scrapeJobs.ts` → `runJdMatch5dTask()` | Per-job LLM call with resume + JD → 5-dim score + grade + verdict + top_gaps (JSON, validated). |
| 10. Metadata extraction | `runJobStructureTask()` | Pulls seniority, remote_type, tech_stack, salary — stored in `raw_data.structured`. |
| 11. Persist | Supabase `jobs` batch insert | Includes `dedup_hash` from `computeDedupHash(title, company)`; unique on `(user_id, dedup_hash)`. |
| 12. Close session | `scrape_sessions.update` | Sets `completed`, `jobs_found`, `jobs_saved`. |

### JD Match / ATS

Two parallel systems:

**Rule-based ATS** (`src/lib/atsEngine.ts`):
- 3 pillars: `keywords` (skills volume, skills-in-bullets, tool specificity), `position` (placement, ordering), `baseline` (contact info, summary length).
- Each check is a pure predicate over `ResumeData`, weighted. Score = sum of passed weights.
- Called synchronously in the builder preview; no network roundtrip.

**LLM JD Match (5-dimension)** (`src/app/api/ai/jd-match-5d/route.ts`):
1. Client posts `{ resumeText, jd }` to the route (or internally via `runJdMatch5dTask()` during scrape).
2. Route auths the user, builds a prompt truncating both inputs to 3 000 chars, calls `runJdMatch5dTask()` (max_tokens 1800, temperature 0.2).
3. Router picks `gemini → groq → openrouter`; retries `RATE_LIMIT`, `TIMEOUT`, `STRUCTURE_INVALID`.
4. `validateJdMatch5dOutput` checks the JSON schema before the response is accepted.
5. UI: `JdMatchPanel.tsx` renders dimension bars, grade, verdict, top gaps; also offered a "rescore" action via `POST /api/rescore` which re-runs the match and updates `jobs.fit_breakdown`.

### Pipeline

Entry: `/board` → server-side prefetch of `applications join jobs`.

| Operation | Module |
| --- | --- |
| List | `src/app/(dashboard)/board/page.tsx` — server component pulls `applications` + joined `job`. |
| Drag / status change | `src/features/job-board/components/KanbanBoard.tsx` → `updateApplicationStatus()` (server action). |
| Save from Discover | `src/actions/updateApplication.ts` → `saveJobToBoard()` — upsert `applications` with `status='saved'`. |
| Manual add | `src/actions/addJobToBoard.ts` → inserts a `jobs` row (dedup_hash prefixed `manual-`) + corresponding `applications` row. |
| Edit notes | `updateApplicationNotes()`. |
| View details | `JobDrawer.tsx` + `JdMatchPanel.tsx`. |

RLS (`supabase/migrations/001_initial_schema.sql`) plus explicit `.eq('user_id', user.id)` on every mutation.

## Key modules

| Module | Purpose | Notes |
| --- | --- | --- |
| `src/lib/ai/router.ts` | Task execution with provider fallback + retry. | Returns `AiResponse { success, provider, model, output, latencyMs }`. |
| `src/lib/ai/router.config.ts` | Per-task provider ordering (`DEFAULT_TASK_ROUTING`) and provider enabled/keys from env. | `AI_TASK_<TASK>_PRIMARY` env vars can override primary provider per task. |
| `src/lib/ai/router.adapters.ts` | HTTP adapters for Gemini / Groq / OpenRouter / NVIDIA. | Strips ```json fences, parses JSON for structured tasks. |
| `src/lib/ai/taskRunner.ts` | Typed per-task runners (jd_match, jd_match_5d, bullet_rewrite, cover_letter_draft, interview_prep, profile_summary_gen, resume_import_parse, job_structure). | Sets `maxTokens` + `temperature` per task; passes `validate:` function. |
| `src/lib/ai/taskValidators.ts` | Structural JSON validators per task. | Throws `STRUCTURE_INVALID` → triggers router retry. |
| `src/lib/atsEngine.ts` | Rule-based ATS scoring + parse-quality assessment. | No network. |
| `src/lib/canonicalResume.ts` | Bridges resume builder state ↔ text-for-AI. | `resumeToText()` + `isJDMatchResumeReady()`. |
| `src/lib/syncResumeProfile.ts` | Pushes builder state into `resume_profiles` so scraper has up-to-date resume text. | Called from `saveAndSyncProfile()` server action. |
| `src/lib/dedup.ts` | `computeDedupHash(title, company)` — SHA-based key for job uniqueness. | |
| `src/lib/scrapers/index.ts` | Parallel multi-source scrape orchestrator. | `scrapeJobsWithFallback()`. |
| `src/lib/scrapers/actorIds.ts` | Apify actor registry keyed by source with `buildInput` / `normalizeJob`. | Tier 1 (India-first: LinkedIn, Naukri), Tier 2, Tier 3 (Google Jobs). |
| `src/lib/scrapers/directSources.ts` | Free, no-auth Greenhouse / Lever / RemoteOK fetchers. | Always runs as a safety net. |
| `src/lib/scrapers/enrichJobDetails.ts` | RAG-browser enrichment for short JDs. | Top-50 only to cap cost. |
| `src/lib/filters/jobFilters.ts` | India filter + dedup. | Applied post-scrape. |
| `src/lib/resumeImport/pipeline.ts` | End-to-end parse orchestration + AI merge. | Exposes `parseResumeFile` + `mapParsedResumeToBuilder`. |
| `src/features/resume-builder/store/useResumeStore.ts` | Zustand store — single source of truth for builder state. | Backs localStorage (`lakshya_hub_resume_v1`). |
| `src/features/resume-builder/templates/*.tsx` | 13 resume templates. | Rendered in preview + PDF via `rendering.tsx`. |
| `src/features/job-board/components/KanbanBoard.tsx` | Kanban DnD + drawer triggers. | `@dnd-kit`. |
| `src/features/job-board/components/JdMatchPanel.tsx` | JD match visualisation + rescore trigger. | |
| `src/components/nav/CmdKProvider.tsx` | CmdK palette + global shortcuts. | `⌘K`, `⌘J`. |
| `src/components/nav/TweaksProvider.tsx` | Runtime theme tuning. | Writes CSS variables on `:root`. |
| `src/components/layout/AuthGate.tsx` | Session guard + onboarding trigger. | Wraps every dashboard route. |
| `src/hooks/useAutosave.ts` | Debounced save-to-localStorage for builder. | |

## AI provider routing

Defined in `src/lib/ai/router.config.ts`. Each task has an ordered list of providers; the router attempts them in order, retrying only on `RATE_LIMIT`, `TIMEOUT`, `ECONNRESET`, `TEMPORARY`, `HTTP_5xx`, or `STRUCTURE_INVALID`:

| Task | Primary | Fallbacks | Runner |
| --- | --- | --- | --- |
| `resume_parse` | gemini | groq, openrouter | — |
| `section_map` | gemini | groq, openrouter | — |
| `ats_score` | groq | gemini, openrouter | — |
| `jd_match` | gemini | groq, openrouter | `runJdMatchTask` (1400 tok / 0.2) |
| `jd_match_5d` | gemini | groq, openrouter | `runJdMatch5dTask` (1800 tok / 0.2) |
| `bullet_rewrite` | openrouter | groq, gemini | `runBulletRewriteTask` (300 tok / 0.3) |
| `cover_letter_draft` | gemini | openrouter, groq | `runCoverLetterDraftTask` (2000 tok / 0.7) |
| `interview_prep` | gemini | groq, openrouter | `runInterviewPrepTask` (1500 tok / 0.5) |
| `profile_summary_gen` | gemini | groq, openrouter | `runProfileSummaryGenTask` (400 tok / 0.4) |
| `resume_import_parse` | gemini | groq, openrouter | `runResumeImportParseTask` (3000 tok / 0.1) |
| `job_structure` | groq | gemini, openrouter | `runJobStructureTask` (400 tok / 0.1) |
| `assistant_chat` | gemini | groq, openrouter | — |

Default models (overridable via env):
- Gemini: `gemini-2.0-flash`
- Groq: `llama-3.3-70b-versatile`
- OpenRouter: `meta-llama/llama-3.3-70b-instruct:free`
- NVIDIA: none (disabled unless `AI_PROVIDER_NVIDIA_MODEL` is set).

Retry limit defaults to 1 (env `AI_ROUTER_RETRY_LIMIT`). Each task's primary provider can be overridden via `AI_TASK_<TASK>_PRIMARY` (e.g. `AI_TASK_JD_MATCH_5D_PRIMARY=groq`).

Note: `@anthropic-ai/sdk` is a declared dependency but not wired into any task route — Claude/Anthropic is not used in shipped code paths.

## Storage & auth

Auth: Supabase Auth (`@supabase/ssr`, `@supabase/supabase-js`). Server components use `createClient()` from `src/lib/supabase/server.ts`; client components use `src/lib/supabase/client.ts`. `AuthGate` redirects unauthenticated users to `/login`.

Tables (see `supabase/migrations/001_initial_schema.sql`):

| Table | Key columns | Notes |
| --- | --- | --- |
| `resumes` | `id`, `user_id`, `name`, `data jsonb`, `template`, `created_at`, `updated_at` | One row per saved resume draft. |
| `resume_profiles` | `id = auth.uid()`, `target_titles text[]`, `skills text[]`, `target_locations text[]`, `full_resume_text`, `min_salary_lpa`, `max_salary_lpa`, `source` (`insaneresumake`/`pdf`/`manual`) | Bridge table — the resume text the scraper scores against. |
| `jobs` | `id`, `user_id`, `session_id`, `source`, `title`, `company`, `location`, `description`, `url`, `salary_range`, `fit_score`, `fit_breakdown jsonb`, `raw_data jsonb`, `dedup_hash`, `scraped_at` | Unique `(user_id, dedup_hash)`. |
| `applications` | `id`, `user_id`, `job_id` (FK, cascade), `status` (saved/applied/interview/offer/rejected), `applied_at`, `notes`, `resume_version`, `updated_at` | Unique `(user_id, job_id)`. |
| `scrape_sessions` | `id`, `user_id`, `source`, `query`, `status` (running/completed/failed), `jobs_found`, `jobs_saved`, `error_message`, `completed_at`, `created_at` | One row per scrape invocation. |
| `scrape_logs` | `id`, `session_id` (FK, cascade), `type` (info/success/warn/error), `message`, `created_at` | Live log stream surfaced in `/discover`. |

RLS: every table has `row level security` enabled with a `user_id = auth.uid()` policy (or equivalent for `resume_profiles.id`). `scrape_logs` reads are gated by session ownership via subquery. All mutations additionally pass `.eq('user_id', user.id)` in server actions as defence-in-depth. `updated_at` triggers installed on `resumes`, `applications`, `resume_profiles`.

## Extension points

**Adding a new job source**
1. Add an actor entry to `ACTORS` in `src/lib/scrapers/actorIds.ts` with a `buildInput(query, location, limit)` + `normalizeJob(raw)` pair.
2. Register it under `SOURCE_ACTORS[<source>]` as an ordered fallback chain.
3. Add the `UserSource` to `src/lib/scrapers/types.ts` and to `ALL_SOURCES` in `src/app/(dashboard)/discover/page.tsx`.
4. If the source is a free public API, add a fetcher to `src/lib/scrapers/directSources.ts` and call it from `scrapeJobsWithFallback` (currently runs Greenhouse / Lever / RemoteOK unconditionally).

**Adding a new resume template**
1. Create `src/features/resume-builder/templates/<Name>Template.tsx` exporting a component accepting `ResumeData`.
2. Register it in `src/features/resume-builder/templates/index.ts` and in `rendering.tsx` so the PDF renderer knows it.
3. Add the `TemplateType` value to `src/types/index.ts`.
4. Ensure the template respects the shared ATS/typography constraints used by `ATSScorePanel`.

**Adding a new CmdK action**
1. Edit `items` in `src/components/nav/CmdKProvider.tsx`.
2. Each item: `{ grp, label, hint, Icon, run }`. Group names currently used: `Navigate`, `Actions`.
3. For global shortcut, add a branch in the `onKey` effect alongside `⌘K` / `⌘J`.

**Adding a new AI task**
1. Add the task key to the `AiTask` union in `src/lib/ai/router.types.ts`.
2. Add default routing in `DEFAULT_TASK_ROUTING` (`src/lib/ai/router.config.ts`).
3. Add a validator in `src/lib/ai/taskValidators.ts`.
4. Add a runner in `src/lib/ai/taskRunner.ts` with appropriate `maxTokens` and `temperature`.
5. Expose via either (a) an `/api/ai/<task>` route for client-callable use or (b) directly from a server action.

**Adding a new scraper filter**
Add a predicate to `src/lib/filters/jobFilters.ts` and chain it into `applyPostScrapeFilters`.
