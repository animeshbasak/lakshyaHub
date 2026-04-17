# lakshya-hub Ship Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all critical blockers and high-priority bugs so lakshya-hub is fully shippable.

**Architecture:** Next.js 15 app with Supabase auth/db, multi-provider AI router, resume builder (react-pdf), and Apify-powered job scraping. Fixes are isolated — each task targets one broken subsystem.

**Tech Stack:** Next.js 15, TypeScript, Supabase, pdfjs-dist v5, react-pdf, Tailwind, Zustand

---

## Files Touched

| File | Change |
|------|--------|
| `.env.local` | Fix env var key names for AI router |
| `src/lib/ai/router.config.ts` | Add fallback env var reading (GEMINI_API_KEY → AI_PROVIDER_GEMINI_API_KEY) |
| `src/app/auth/callback/route.ts` | Add OTP/magic-link handling |
| `src/features/job-board/components/KanbanCard.tsx` | Replace inline FitBadge with shared component |
| `next.config.ts` | Add webpack config to emit pdfjs worker to static chunks |
| `src/lib/resumeImport/pdfWorker.ts` | New: sets GlobalWorkerOptions.workerSrc |
| `src/features/resume-builder/components/StarterExperience.tsx` | Import pdfWorker before parseResumeFile |
| `src/app/(dashboard)/resume/page.tsx` | Fix handleUploadClick + fix handleSave to sync profile |
| `src/app/(dashboard)/discover/page.tsx` | Show board link when Supabase fetch fails silently |
| `src/features/resume-builder/components/PDFDownloadButton.tsx` | Use selected template not hardcoded Harvard |
| `src/components/nav/Sidebar.tsx` | Add try/catch to handleLogout |

---

## Task 1: Fix AI Provider Env Var Mismatch

**Problem:** `.env.local` has `GEMINI_API_KEY` / `GROQ_API_KEY` but router reads `AI_PROVIDER_GEMINI_API_KEY` / `AI_PROVIDER_GROQ_API_KEY`. All AI features silently fail.

**Files:**
- Modify: `.env.local`
- Modify: `src/lib/ai/router.config.ts`

- [ ] **Step 1: Add correctly-named keys to `.env.local`**

Add these lines to `.env.local` (keep the originals too):
```
AI_PROVIDER_GEMINI_API_KEY=REDACTED_GEMINI_KEY
AI_PROVIDER_GROQ_API_KEY=REDACTED_GROQ_KEY
AI_PROVIDER_OPENROUTER_API_KEY=
AI_PROVIDER_GEMINI_ENABLED=true
AI_PROVIDER_GROQ_ENABLED=true
```

- [ ] **Step 2: Add fallback reading in router.config.ts**

In `src/lib/ai/router.config.ts`, update `readEnvValue` to also check legacy key names:

```typescript
function readEnvValue(name: string) {
  const val = process.env[name] || '';
  if (val) return val;
  // fallback: strip AI_PROVIDER_ prefix and try bare key
  const bare = name.replace(/^AI_PROVIDER_/, '').replace(/_API_KEY$/, '_API_KEY');
  return process.env[bare] || '';
}
```

- [ ] **Step 3: Verify AI router returns a provider**

Start dev server and open browser console. Run:
```bash
curl -X POST http://localhost:3000/api/ai-test 2>/dev/null || echo "no test route — check router in next step"
```

In `src/app/api/health/route.ts` (create if missing):
```typescript
import { NextResponse } from 'next/server'
import { buildRuntimeConfig } from '@/lib/ai/router.config'
export async function GET() {
  const config = buildRuntimeConfig()
  const enabled = Object.entries(config.providers)
    .filter(([, v]) => v.enabled && v.apiKey)
    .map(([k]) => k)
  return NextResponse.json({ enabled })
}
```

Hit `http://localhost:3000/api/health` — response must include `gemini` or `groq` in `enabled`.

- [ ] **Step 4: Commit**

```bash
git add .env.local src/lib/ai/router.config.ts src/app/api/health/route.ts
git commit -m "fix: align AI provider env var names — router now reads GEMINI_API_KEY correctly"
```

---

## Task 2: Fix Magic Link / OTP Auth Callback

**Problem:** `auth/callback/route.ts` only handles `?code=` (OAuth). OTP magic links send `?token=...&type=magiclink` → these are silently ignored → user redirected to login error.

**Files:**
- Modify: `src/app/auth/callback/route.ts`

- [ ] **Step 1: Update route to handle both OAuth code and OTP token**

Replace the entire file:
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token = searchParams.get('token')
  const type = searchParams.get('type') as 'magiclink' | 'recovery' | 'signup' | null
  const next = searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()

  // OAuth PKCE flow
  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) return NextResponse.redirect(`${origin}${next}`)
      console.error('[auth/callback] OAuth exchange error:', error.message)
    } catch (err) {
      console.error('[auth/callback] OAuth unexpected error:', err)
    }
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  // OTP / magic link flow
  if (token && type) {
    try {
      const { error } = await supabase.auth.verifyOtp({ token_hash: token, type })
      if (!error) return NextResponse.redirect(`${origin}${next}`)
      console.error('[auth/callback] OTP verify error:', error.message)
    } catch (err) {
      console.error('[auth/callback] OTP unexpected error:', err)
    }
    return NextResponse.redirect(`${origin}/login?error=otp_failed`)
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
```

- [ ] **Step 2: Test by triggering a magic link**

In Supabase dashboard → Auth → Users → send magic link to your email. Click the link. Should land on `/dashboard`, not `/login?error=auth_failed`.

- [ ] **Step 3: Commit**

```bash
git add src/app/auth/callback/route.ts
git commit -m "fix: auth callback now handles OTP magic link token+type params"
```

---

## Task 3: Fix FitBadge Inline Duplicate in KanbanCard

**Problem:** `KanbanCard.tsx` has its own inline `FitBadge` with thresholds 80/60. Shared `FitBadge` uses 75/50. Same score shows differently on Discover vs Board.

**Files:**
- Modify: `src/features/job-board/components/KanbanCard.tsx`

- [ ] **Step 1: Remove inline FitBadge, import shared component**

In `KanbanCard.tsx`, find and remove the inline `FitBadge` function (the one with 80/60 thresholds).

Add import at top:
```typescript
import { FitBadge } from '@/components/ui/FitBadge'
```

The existing usage `<FitBadge score={job.fit_score} />` at the bottom of the card already calls it correctly — it just needs to use the imported version.

- [ ] **Step 2: Verify both pages show same colour for same score**

Open Discover page and Board page side-by-side. A job with score 70 should show amber (medium) on both. A score of 80 should show green on both.

- [ ] **Step 3: Commit**

```bash
git add src/features/job-board/components/KanbanCard.tsx
git commit -m "fix: KanbanCard uses shared FitBadge — consistent 75/50 thresholds across Discover and Board"
```

---

## Task 4: Fix pdfjs Worker for Next.js

**Problem:** `extraction.ts` imports pdfjs but never sets `GlobalWorkerOptions.workerSrc`. In Next.js, Vite's `?url` import syntax doesn't work. PDF import silently hangs.

**Files:**
- Modify: `next.config.ts`
- Create: `src/lib/resumeImport/pdfWorker.ts`
- Modify: `src/features/resume-builder/components/StarterExperience.tsx`
- Modify: `src/app/(dashboard)/resume/page.tsx`

- [ ] **Step 1: Configure webpack to emit pdfjs worker as static asset**

Replace `next.config.ts`:
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias['canvas'] = false
    return config
  },
}

export default nextConfig
```

- [ ] **Step 2: Create pdfWorker utility**

Create `src/lib/resumeImport/pdfWorker.ts`:
```typescript
export async function initPdfWorker() {
  const pdfjsLib = await import('pdfjs-dist')
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    // Use the legacy build worker which works without Vite ?url syntax
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString()
  }
}
```

- [ ] **Step 3: Call initPdfWorker before PDF parsing in StarterExperience**

In `src/features/resume-builder/components/StarterExperience.tsx`, find the `handleFileChange` function. Add the worker init before `parseResumeFile`:

```typescript
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return
  e.target.value = ''
  setStage('uploading')
  try {
    const { initPdfWorker } = await import('@/lib/resumeImport/pdfWorker')
    await initPdfWorker()
    const { parseResumeFile, mapParsedResumeToBuilder } = await import('@/lib/resumeImport/pipeline')
    // ... rest unchanged
```

- [ ] **Step 4: Call initPdfWorker in resume/page.tsx handleImportFile**

In `src/app/(dashboard)/resume/page.tsx`, inside `handleImportFile`:
```typescript
const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return
  e.target.value = ''
  setIsImporting(true)
  try {
    const { initPdfWorker } = await import('@/lib/resumeImport/pdfWorker')
    await initPdfWorker()
    const { parseResumeFile, mapParsedResumeToBuilder } = await import('@/lib/resumeImport/pipeline')
    // ... rest unchanged
```

- [ ] **Step 5: Test PDF import end-to-end**

Start dev server. Go to `/resume`. Upload a PDF. Watch the import stages complete. Should reach `done` without hanging.

- [ ] **Step 6: Commit**

```bash
git add next.config.ts src/lib/resumeImport/pdfWorker.ts src/features/resume-builder/components/StarterExperience.tsx "src/app/(dashboard)/resume/page.tsx"
git commit -m "fix: configure pdfjs worker for Next.js — PDF import no longer hangs"
```

---

## Task 5: Fix handleUploadClick in resume/page.tsx

**Problem:** `handleUploadClick` calls `setHydrated(true)` but never triggers `importFileRef.current?.click()` — the toolbar upload button does nothing.

**Files:**
- Modify: `src/app/(dashboard)/resume/page.tsx`

- [ ] **Step 1: Fix handleUploadClick to trigger file input**

Find:
```typescript
const handleUploadClick = () => {
  setHydrated(true)
}
```

Replace with:
```typescript
const handleUploadClick = () => {
  setHydrated(true)
  // Defer to next tick so hydration state propagates before input click
  setTimeout(() => importFileRef.current?.click(), 0)
}
```

- [ ] **Step 2: Test**

Go to `/resume` (with existing resume data so StarterExperience is hidden). Click the Upload/Import button in the toolbar. File picker dialog should open.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(dashboard)/resume/page.tsx"
git commit -m "fix: handleUploadClick now triggers file input after setting hydrated"
```

---

## Task 6: Fix handleSave to Sync Resume Profile

**Problem:** `handleSave` calls `saveResume(data)` only. `resume_profiles` table is never updated on manual save → AI job matching uses stale skills/text.

**Files:**
- Modify: `src/app/(dashboard)/resume/page.tsx`

- [ ] **Step 1: Import saveAndSyncProfile action**

At the top of `src/app/(dashboard)/resume/page.tsx`, update the import:
```typescript
import { saveResume, saveAndSyncProfile } from '@/actions/resumeActions'
```

- [ ] **Step 2: Replace saveResume call with saveAndSyncProfile in handleSave**

Find in `handleSave`:
```typescript
await saveResume(data)
toast.success('Resume saved!')
```

Replace with:
```typescript
await saveAndSyncProfile(data)
toast.success('Resume saved!')
```

- [ ] **Step 3: Verify saveAndSyncProfile exists and handles the same data shape**

```bash
grep -n "saveAndSyncProfile\|export" src/actions/resumeActions.ts | head -20
```

If `saveAndSyncProfile` doesn't exist, use:
```typescript
await saveResume(data)
// Best-effort profile sync — non-blocking
import('@/lib/syncResumeProfile').then(({ syncResumeProfile }) =>
  syncResumeProfile(data).catch(console.error)
)
toast.success('Resume saved!')
```

- [ ] **Step 4: Commit**

```bash
git add "src/app/(dashboard)/resume/page.tsx"
git commit -m "fix: handleSave now syncs resume_profiles — AI matching no longer uses stale data"
```

---

## Task 7: Fix Discover Page Silent Failure

**Problem:** When Supabase fetch fails after scrape, the `catch` block is silent — user sees "Done" but no jobs render, and has no idea they should go to /board.

**Files:**
- Modify: `src/app/(dashboard)/discover/page.tsx`

- [ ] **Step 1: Replace silent catch with helpful message**

Find:
```typescript
} catch {
  // Non-fatal — jobs are still on the board
}
```

Replace with:
```typescript
} catch {
  addLog('warning', 'Could not load jobs inline — view results on the Board page.')
}
```

- [ ] **Step 2: Show a Board link when phase is 'done' and jobs array is empty**

Find the "done" phase render block. Add after the success message:
```tsx
{phase === 'done' && jobs.length === 0 && (
  <div className="mt-3 text-sm text-amber-400">
    Jobs saved to board.{' '}
    <a href="/board" className="underline text-cyan-400 hover:text-cyan-300">
      View on Board →
    </a>
  </div>
)}
```

- [ ] **Step 3: Test**

Run a scrape. After it completes, verify either jobs render inline OR the board link appears. No more silent "Done" with blank results.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(dashboard)/discover/page.tsx"
git commit -m "fix: discover page shows board link when inline job fetch fails silently"
```

---

## Task 8: Fix PDFDownloadButton Hardcoded Template

**Problem:** `PDFDownloadButton` always renders `<HarvardTemplate>` regardless of which template the user selected.

**Files:**
- Modify: `src/features/resume-builder/components/PDFDownloadButton.tsx`

- [ ] **Step 1: Accept template prop and use TEMPLATE_COMPONENTS**

Replace the file:
```typescript
'use client'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { TEMPLATE_COMPONENTS } from '../templates'
import { ResumeData } from '@/types'
import { Download, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface PDFDownloadButtonProps {
  data: ResumeData
  template?: string
  className?: string
}

export function PDFDownloadButton({ data, template = 'harvard', className }: PDFDownloadButtonProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  const TemplateComponent = TEMPLATE_COMPONENTS[template] ?? TEMPLATE_COMPONENTS['harvard']

  return (
    <PDFDownloadLink
      document={<TemplateComponent data={data} />}
      fileName={`${data.header.name || 'Resume'}.pdf`}
      className={className}
    >
      {({ loading }) => (
        <span className="flex items-center gap-2">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download PDF
            </>
          )}
        </span>
      )}
    </PDFDownloadLink>
  )
}
```

- [ ] **Step 2: Pass template from resume page**

In `src/app/(dashboard)/resume/page.tsx`, find the `PDFDownloadButton` usage and pass template:
```tsx
<PDFDownloadButton data={resumeData} template={store.template} />
```

- [ ] **Step 3: Test**

Switch to "Modern Blue" template in the picker. Download PDF. Verify the downloaded PDF uses Modern Blue layout, not Harvard.

- [ ] **Step 4: Commit**

```bash
git add src/features/resume-builder/components/PDFDownloadButton.tsx "src/app/(dashboard)/resume/page.tsx"
git commit -m "fix: PDFDownloadButton uses selected template — no longer hardcoded to Harvard"
```

---

## Task 9: Fix Sidebar Logout Error Handling

**Problem:** `handleLogout` calls `signOut()` with no error handling — if it fails, user navigates to `/login` with an active Supabase session still running.

**Files:**
- Modify: `src/components/nav/Sidebar.tsx`

- [ ] **Step 1: Wrap logout in try/catch**

Find `handleLogout` in `Sidebar.tsx`. Replace with:
```typescript
const handleLogout = async () => {
  try {
    const supabase = createClient()
    await supabase.auth.signOut()
  } catch (err) {
    console.error('[logout] signOut failed:', err)
  } finally {
    router.push('/login')
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/nav/Sidebar.tsx
git commit -m "fix: sidebar logout uses try/catch — navigation to login always happens"
```

---

## Task 10: Final Smoke Test

- [ ] **Step 1: Run production build**

```bash
cd /Users/animeshbasak/Desktop/ai-lab/projects/lakshya-hub
npm run build
```

Expected: `✓ Compiled successfully` with zero errors.

- [ ] **Step 2: Start prod server and verify all flows**

```bash
npm run start
```

Check each flow:
- [ ] `/login` → magic link email → click link → lands on `/dashboard`
- [ ] `/resume` → Upload PDF → stages complete → resume fills in
- [ ] `/resume` → edit something → Save → no error toast
- [ ] `/resume` → change template → Download PDF → PDF matches selected template
- [ ] `/discover` → run a search → jobs appear inline OR board link shown
- [ ] `/board` → job cards show consistent FitBadge colours

- [ ] **Step 3: Commit final tag**

```bash
git add -A
git commit -m "chore: lakshya-hub v1 — all critical blockers fixed, ship-ready"
```
