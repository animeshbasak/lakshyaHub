# Sentry Setup (S10)

> **Time to flip from "not capturing errors" to "capturing errors":** ~10 min in the Sentry dashboard + a Vercel env-var paste. Zero code changes from here.

---

## What's already shipped (commit `…`)

- `@sentry/nextjs@10.50.x` installed
- `sentry.client.config.ts` — browser bundle init
- `sentry.server.config.ts` — Node.js runtime init (API routes, server actions, RSCs)
- `sentry.edge.config.ts` — Edge runtime init (proxy.ts middleware)
- `instrumentation.ts` — wires `register()` + `onRequestError` for Next.js 16
- `src/app/global-error.tsx` — root error boundary that sends to Sentry
- `next.config.ts` wrapped with `withSentryConfig` for source-map upload
- All four configs scrub `?queryString` from URLs and drop `Authorization` / `Cookie` headers from breadcrumbs (no JD text, no API keys leaked into Sentry)

**Inert until DSN is set.** No DSN → all four configs early-return without calling `Sentry.init()`. Zero runtime overhead.

---

## §1 Sentry-side setup (5 min)

1. Create or sign in at https://sentry.io.
2. Create a new project: **Platform = Next.js**. Name: `lakshya-prod` (or whatever).
3. Sentry shows you a DSN — copy it. Format: `https://<key>@<orgId>.ingest.sentry.io/<projectId>`.
4. Settings → Auth Tokens → Create new internal-integration token with scopes:
   - `project:releases` (upload source maps)
   - `org:read` (resolve org slug)
   Copy the token. It is shown **once**.
5. Note your `org slug` and `project slug` (visible in the URL: `sentry.io/organizations/<org>/projects/<project>/`).

---

## §2 Vercel-side setup (3 min)

Vercel Dashboard → project `lakshyahub` → Settings → Environment Variables.
Add the following. Mark all as **Secret** except where noted, and apply to **Production** + **Preview** + **Development**.

| Var | Value | Visibility |
|---|---|---|
| `SENTRY_DSN` | DSN from step 3 | secret |
| `NEXT_PUBLIC_SENTRY_DSN` | Same DSN (browser-side reads this) | NOT secret (NEXT_PUBLIC_ ships to browser by design) |
| `SENTRY_AUTH_TOKEN` | Token from step 4 | secret — build-time only |
| `SENTRY_ORG` | org slug | not secret |
| `SENTRY_PROJECT` | project slug | not secret |

Trigger a redeploy. Build logs should show `Uploaded source map for /...` lines (assuming `SENTRY_AUTH_TOKEN` is set; if not, builds still succeed but stack traces will be minified).

---

## §3 Verify it works (2 min)

1. Visit any authenticated page on Production.
2. Force a client-side error: open DevTools console, run `throw new Error('sentry test')`.
3. Within ~30 seconds, Sentry dashboard → Issues should show a new event titled "sentry test" with full stack trace pointing to the original source file (not minified `chunk-abc.js:1:2345`).
4. To test server-side: hit a 404'd API route via `curl https://<your-prod-url>/api/does-not-exist` — Sentry should record the error with the route name.

---

## §4 What you'll see in Sentry (operational)

Daily, the most useful views are:

- **Issues** → grouped by error fingerprint. Errors that fire in the same code path collapse into one row with a count and last-seen.
- **Performance** → 10% transaction sampling (configurable in `sentry.*.config.ts` — `tracesSampleRate`). Useful for spotting slow `/api/ai/evaluate` runs.
- **Releases** → matched to your git SHA. Each Vercel deploy creates a release; Sentry tags every event with the release that originated it.

Set up at minimum:
- Email alert on **new issues** (default profile picks this up).
- Slack alert on **issues > 100 events/hour** (catches DoS / loop-fail patterns).

---

## §5 What's deliberately NOT enabled

- **Session replay** (`@sentry/replay`): adds ~30 KB to client bundle and records every user click — privacy-heavy, not needed at MVP scale. Re-evaluate when you have ≥100 daily actives.
- **Profiling**: Node-side CPU profiling adds runtime overhead. Worth enabling only when chasing a specific perf regression.
- **PII auto-scrubbing**: Sentry has it on by default. Our `beforeSend` hooks scrub additional things (URL query strings, auth headers).

If you later want any of these, edit `sentry.client.config.ts` / `sentry.server.config.ts` accordingly — both have an `integrations: []` array ready to receive opt-ins.

---

## §6 Free-tier limits

Sentry free tier: 5,000 events/month + 10,000 spans + 50 attachments. A normal week of MVP usage burns ~200 events. Scale to paid only when monthly events are consistently > 4,000.

If you hit the cap, Sentry stops accepting new events for the rest of the month — no error during ingest, but you lose visibility. Set the email alert at 80% (Settings → Subscription → Notifications) so you can rotate to a higher plan or downsample.
