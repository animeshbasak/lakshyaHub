# User-side TODO — things only you can do

> Code is shipped behind every item. The product runs without these — but each toggle below unlocks a feature that's currently inert.
>
> Tick as you go. **No hurry — these are non-blocking. Order is "highest leverage first".**

---

## 🟢 Tier 1 — Already partly done, just paste the keys (~30 min total)

### ✅ Supabase + Groq (DONE — assumed working in prod)

If `/api/ai/evaluate` returns scores in production, this tier is already complete. If not, see `docs/CHECKLIST.md`.

### ⬜ Sentry (~10 min)

Adds error tracking + performance monitoring. **Free tier: 5k events/month.**

- [ ] https://sentry.io → create project (Platform = Next.js, name e.g. `lakshya-prod`)
- [ ] Copy the DSN
- [ ] Sentry → Settings → Auth Tokens → create with scopes `project:releases` + `org:read`. Copy the token (shown once).
- [ ] Vercel env → add 5 vars (mark all secret except `NEXT_PUBLIC_SENTRY_DSN`):
  - `SENTRY_DSN` = (the DSN)
  - `NEXT_PUBLIC_SENTRY_DSN` = same DSN
  - `SENTRY_AUTH_TOKEN` = the token
  - `SENTRY_ORG` = your org slug
  - `SENTRY_PROJECT` = your project slug
- [ ] Trigger a redeploy
- [ ] Verify: open DevTools console on prod → `throw new Error('sentry test')` → check Sentry dashboard within 30s

Full step-by-step: `docs/security/sentry-setup.md`.

### ⬜ Resend email sender (~10 min)

Unlocks the "Email me my due follow-ups" button + sets up the path for breach/DSAR notifications. **Free tier: 3,000 emails/month + 100/day.**

- [ ] https://resend.com → sign up + verify your email
- [ ] (Optional but recommended) Settings → Domains → add `getlakshya.vercel.app` or your custom domain → add DNS records (SPF + DKIM). Without this, you can only send from `onboarding@resend.dev`.
- [ ] API Keys → create one with **Sending access** scope. Copy.
- [ ] Vercel env (and `.env.local` for testing):
  - `RESEND_API_KEY` = the key
  - `RESEND_FROM_ADDRESS` = `Lakshya <hello@getlakshya.app>` (use your verified domain) or `Lakshya <onboarding@resend.dev>` (testing only)
- [ ] Verify: hit `POST /api/scan/cadence-digest` from the dashboard (button to be added) — check inbox.

### ⬜ Vercel function memory for liveness (~3 min)

Required for the headless Chromium probe to not OOM. Vercel **Pro plan only** ($20/mo) — Hobby max is 1024 MB.

- [ ] Vercel Dashboard → project `lakshyahub` → Settings → Functions → confirm `vercel.json` is being applied (the file is committed; auto-applies on deploy)
- [ ] If you're on Hobby tier: liveness will OOM with a clear "browser_failed" log. Either upgrade or skip this feature until paid.

Full setup + cost math: `docs/security/liveness-setup.md`.

---

## 🟡 Tier 2 — Validate first, register second (~1 hour, only after Tier 1)

### ⬜ Razorpay business registration (~30 min, deferred)

Per your call: defer until ≥5 "I'd pay for this" mailto signals arrive in your inbox (the beta-validation CTA on `/eval/[id]`).

When ready:
- [ ] https://dashboard.razorpay.com → sign up (you already have `getlakshya.vercel.app` for KYC)
- [ ] Complete KYC (PAN, GST optional, bank account)
- [ ] Payment Links → create one for "Lakshya Pro — ₹1,499/mo"
- [ ] Vercel env: `NEXT_PUBLIC_PAYMENT_LINK_IN` = the URL
- [ ] (Webhook for automated `is_pro` flip — Phase 4, defer)

### ⬜ Lemon Squeezy (~20 min, for non-India users)

Same gate (≥5 signals). Lemon Squeezy is merchant-of-record so they handle US tax for you.

- [ ] https://lemonsqueezy.com → sign up
- [ ] Create store → product "Lakshya Pro" — $19/mo
- [ ] Vercel env: `NEXT_PUBLIC_PAYMENT_LINK_GLOBAL` = checkout URL
- [ ] Webhook setup deferred to Phase 4

### ⬜ Beta-interest inbox (~30 sec)

The beta-validation CTA defaults to `animeshsbasak@gmail.com`. Override if you'd rather not co-mingle with personal mail:

- [ ] Vercel env: `NEXT_PUBLIC_BETA_INTEREST_EMAIL` = whichever inbox you'll actually monitor.

---

## 🔵 Tier 3 — Provisioning, when you have data to manage (defer until ≥10 weekly actives)

### ⬜ Upstash Redis (~5 min) — for global rate-limiting

Today: rate-limits use in-memory `Map<userId, ts>` — survives within a Lambda warm-pool, fine for MVP. Upstash Redis fixes:
- Cross-region enforcement (a user can't bypass by hitting a different Vercel edge)
- Survives Lambda cold starts

- [ ] https://upstash.com → Redis → create DB → free tier
- [ ] Vercel env:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
- [ ] Code change: replace `lastEvalByUser` Maps in `/api/ai/evaluate` + `/api/scan/ats` + `/api/scan/liveness` with Upstash Redis checks. (~1h of my time when you green-light this.)

### ⬜ QStash Schedules (when ready for daily auto-digest)

Today: cadence digest is **user-triggered** ("Email me my follow-ups" button — not yet wired into UI). To make it daily:

- [ ] Upstash Console → QStash → Schedules → New
- [ ] Cron: `0 8 * * *` (daily at 8am UTC)
- [ ] Destination: `https://getlakshya.vercel.app/api/qstash/cadence-digest-sweep` (this route doesn't exist yet — needs to walk all users, ~1h to build when greenlit)

---

## 🟣 Tier 4 — Compliance + Hardening (only when paying users exist)

### ⬜ GDPR retention policy decision

Pick one (and tell me which so I can wire the cron):

- [ ] (A) **90-day rolling delete** on `scan_history` + `evaluations` (default — recommended)
- [ ] (B) 180-day
- [ ] (C) 30-day
- [ ] (D) Manual export-and-delete on user request only (DSAR endpoint, more work)

### ⬜ DSAR endpoint (Subject Access Request)

Required by GDPR Art. 15. Lets a user export ALL their data.
- [ ] Decide: self-service button on `/profile` (more work) vs. mailto-only flow (file via support email).
- [ ] If self-service: ~3h to build (`/api/profile/export` returns a ZIP of every row across 8 tables, RLS-bound).

### ⬜ npm install approvals

These each unlock a specific capability. None are urgent.

- [ ] `npm install @axe-core/playwright @playwright/test` — unlocks the 6 `it.todo` a11y test cases. ~2h to wire.
- [ ] `npm install resend` — only if you outgrow my zero-dep Resend wrapper (e.g. need attachments or batch).
- [ ] `npm audit fix` (no `--force`) — addresses 3 moderate-severity transitive postcss/next CVEs introduced with Sentry. Safe.

---

## 🔴 Tier 5 — Strategic decisions (no rush)

### ⬜ Domain

`getlakshya.vercel.app` is fine for KYC. But for marketing + email deliverability you'll eventually want a custom domain.

- [ ] Register `lakshya.app` / `getlakshya.com` / similar
- [ ] Vercel → project → Domains → add → follow DNS instructions
- [ ] Update Resend FROM_ADDRESS to use the new domain
- [ ] Update beta-validation mailto + canonical URL in metadata

### ⬜ Privacy policy + Terms of service

Required when you start collecting paid users. Templates: https://getterms.io.

- [ ] Generate base templates
- [ ] Customize with: "We use Supabase, Groq/Gemini, Resend, Sentry, Vercel" disclosure
- [ ] Link from footer

### ⬜ Analytics

Vercel Analytics is enabled by default on Pro. Enough for traffic + conversion at MVP. PostHog adds session replay + funnels for free up to 1M events/mo — defer until you have ≥100 weekly actives.

---

## What I (Claude) am building **right now** without waiting on any of the above

- ✅ Sentry wiring (committed `f03bfed`) — inert until your DSN is set
- ✅ Liveness checker route + receiver (committed; needs Vercel mem 3008 MB to actually run)
- ✅ Resend wrapper + cadence-digest route (committed; needs your Resend key to actually send)
- 🔄 Adding a "Email me my follow-ups" button on `/board` so the digest route is reachable from UI

Each of these costs you nothing to ship as code. They activate **only** when you paste the corresponding env var.
