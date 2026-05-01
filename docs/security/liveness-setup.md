# Liveness checker setup

> Headless-Chromium probe that classifies job postings as `active` / `expired` / `uncertain`. Surfaces dead postings before users waste time on them.

---

## Architecture

```
User clicks "Check liveness" / cron fires
        │
        ▼
POST /api/scan/liveness                  (auth, RLS, picks ≤30 stale jobs)
        │
        │ enqueue per-job
        ▼
QStash (queue + signature + retry)
        │
        ▼
POST /api/qstash/check-liveness          (signature-verified, runs Chromium)
        │
        ▼
Supabase: UPDATE jobs SET liveness_status, liveness_checked_at
```

Stale = `liveness_checked_at IS NULL` OR `< now - staleDays days` (default 3 days).

---

## What you need to do (one-time setup)

### 1. Vercel function memory (CRITICAL)

`@sparticuz/chromium@147` needs **≥1769 MB** to launch. We pin both relevant routes to **3008 MB** via `vercel.json` — Vercel's hosted limit on the Pro plan.

**`vercel.json` already commits this config.** No dashboard action needed.

If you're on Hobby tier (max 1024 MB), liveness will OOM. Upgrade or skip the feature until paid.

### 2. QStash creds

Already wired (S10 / Sentry pass also covered QStash for the ATS scan). The same three env vars apply:
- `QSTASH_TOKEN`
- `QSTASH_CURRENT_SIGNING_KEY`
- `QSTASH_NEXT_SIGNING_KEY`

Without them, `/api/scan/liveness` returns 503 with a hint — won't OOM, won't run inline.

### 3. (Optional) Daily cron

Add a Vercel Cron entry to refresh the freshest 30 jobs nightly:

```jsonc
// vercel.json — extend the "crons" key (Vercel Pro feature)
"crons": [{
  "path": "/api/scan/liveness",
  "schedule": "0 2 * * *"
}]
```

Caveat: Vercel cron POSTs without a Supabase session, so the route's `auth.getUser()` returns null and the call 401s. To enable cron-driven liveness, use QStash's Schedules feature instead (UI: Upstash console → QStash → Schedules → New). Point it at `/api/qstash/check-liveness` for a specific user — or, if you want to fan out across ALL users, write a `/api/cron/liveness-sweep` route that uses the service-role key and walks the users table. Defer until ≥10 daily actives signal it's worth it.

---

## Cost math

Per probe:
- Chromium: ~250 MB × 8s wall = ~2 GB-s
- Vercel Pro: $0.18 / M GB-s = **~$0.36 per 1000 probes**

User triggers `/api/scan/liveness` with limit=30 → 30 probes → ~$0.011 per click.

Daily auto-sweep at 100 active jobs/user × 50 users = 5,000 probes/day → **~$54/mo** at scale. Compared to LLM cost of ~$0.12/eval at scale, liveness is ~10× cheaper but adds up; revisit pricing when revenue starts flowing.

---

## Verifying it works

1. After deploy: hit `https://<your-prod-url>/api/health/browser` (no auth, returns `{ ok: true, version: '147.x' }` if Chromium boots; 500 if mem too low).
2. From an authenticated session: `curl -X POST https://<prod>/api/scan/liveness -H "Cookie: ..." -d '{"limit": 5}'` should return `{ ok: true, summary: { enqueued: 5 } }`.
3. Watch Upstash dashboard → QStash → Logs for 5 deliveries succeeding (green check, ~5-10s each).
4. Query `select id, url, liveness_status, liveness_checked_at from jobs where user_id = ... order by liveness_checked_at desc nulls last limit 5;` — fresh rows should show status filled.

---

## What can go wrong

| Symptom | Likely cause | Fix |
|---|---|---|
| `/api/health/browser` returns 500 with OOM | Function memory < 1769 MB | Confirm `vercel.json` deployed; manually set memory on dashboard if override |
| Receiver returns `browser_failed` for every probe | `@sparticuz/chromium` binary missing or wrong version vs Playwright | Match Chromium major version to `playwright-core` (currently chromium 147 + playwright-core 1.59) |
| All probes return `uncertain` | Site uses heavy bot detection (Cloudflare challenge / FunCaptcha) | Liveness classifier already buckets these as 'uncertain' — accept the signal, don't over-engineer |
| QStash 401 in logs | Signing-key rotation pending | Verify both CURRENT and NEXT keys are set in Vercel env |
| Cron not firing | Vercel cron doesn't carry user session | Use QStash Schedules instead (see §3 above) |
