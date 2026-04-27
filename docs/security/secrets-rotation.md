# Secrets Rotation Playbook (S5)

> **When:** any of the events listed under §1. **How:** §2 step-by-step per provider. **Verify:** §3.

This is a runbook, not a policy doc. Read top-to-bottom only when you need to rotate. Skim §1 monthly to confirm nothing is overdue.

---

## §1 Triggers

Rotate the relevant key immediately if ANY of these happen:

| Trigger | Scope |
|---|---|
| Key appears in a public commit / Gist / Slack / Notion | All keys |
| Laptop with `.env.local` lost or stolen | All keys |
| Vendor reports breach (Anthropic, Google, Groq, Supabase, Vercel, Stripe, Razorpay, Upstash, Sentry) | Affected provider |
| Ex-employee with access leaves the project | All keys + invalidate Supabase service-role + revoke Vercel team membership |
| Third-party agent / SaaS revoked unexpectedly | The keys configured on that integration |
| Key has been live ≥180 days and is high-impact (service-role, billing webhooks) | Just that key |
| Suspicious activity in audit_events or vendor dashboard | Affected provider |

Default scheduled rotation: **service-role + billing webhooks every 180 days.** Provider API keys (Groq/Gemini/Claude/Anthropic) on a 365-day cycle unless a trigger fires sooner.

---

## §2 Procedure (per key)

For every rotation, follow this order strictly: **mint new → deploy new → revoke old.** Doing it the other way around takes the site down for the rotation window.

### 2.1 Supabase service role key (CRITICAL)

Used by: feedback action, ATS-scan audit insert, future cron jobs.
RLS bypass — leak of this is full-database compromise.

1. Supabase Dashboard → Project → Settings → API → "Generate new service_role key" (or the equivalent rotation button — Supabase has had different UIs across versions; if no button, file a support request).
2. Copy the new key. **Do not delete the old yet.**
3. Vercel Dashboard → Project → Settings → Environment Variables → edit `SUPABASE_SERVICE_ROLE_KEY` → paste the new value → Save → tick Production AND Preview.
4. Trigger a redeploy (push an empty commit or click "Redeploy" on the latest build).
5. Smoke-test in Production: hit `/eval/[id]`, click thumbs-up, confirm no console error.
6. Once verified working: Supabase Dashboard → revoke the old key.
7. Audit log: append a line to `docs/security/audit-trail.md` with date + reason + who-rotated.

### 2.2 LLM provider keys (Groq / Gemini / Claude / Anthropic)

Used by: `/api/ai/evaluate`, `/api/ai/bullet-rewrite`, `/api/ai/cover-letter`, `/api/ai/interview-prep`, `/api/ai/resume-import-parse`.

1. Provider dashboard → create a new API key. **Do not revoke the old yet.**
2. Vercel env → update `GROQ_API_KEY` / `GEMINI_API_KEY` / `ANTHROPIC_API_KEY` (whichever applies). Apply to both Production and Preview.
3. Redeploy.
4. Smoke-test: run `/evaluate` against a test JD. The footer should show the provider you just rotated.
5. Provider dashboard → delete the old key.

### 2.3 Stripe / Razorpay / payment provider

Used by: payment-link CTAs (read-only public URLs — low risk) and future webhook signatures (high risk when shipped).

For the current state (Payment Link only, no webhook): the URL itself is public. There's no "key" to rotate — you'd just delete the Payment Link in the provider dashboard and create a new one, then update `NEXT_PUBLIC_PAYMENT_LINK_*` envs.

When the webhook ships (Phase 4):

1. Provider dashboard → roll the webhook signing secret. Both old + new will be valid for a grace period (Stripe gives 24h; Razorpay does not — coordinate carefully).
2. Vercel env → update `STRIPE_WEBHOOK_SECRET` / `RAZORPAY_WEBHOOK_SECRET`.
3. Redeploy.
4. Trigger a test webhook from the provider dashboard. Confirm receipt in Vercel logs.
5. Provider dashboard → revoke the old secret.

### 2.4 Upstash / QStash (when shipped)

Used by: rate-limit (S3 follow-up) and Phase 2 cron fan-out.

1. Upstash dashboard → Redis/QStash → Settings → Reset token.
2. Vercel env → update `UPSTASH_REDIS_REST_TOKEN` / `QSTASH_TOKEN` / `QSTASH_CURRENT_SIGNING_KEY` / `QSTASH_NEXT_SIGNING_KEY`.
3. Redeploy.
4. Smoke-test: ATS scan should still apply rate-limit; cron should still fire. Watch for 401s in logs.

### 2.5 Vercel deployment / project access

Used by: `gh` PRs trigger Vercel builds; team members can view logs + env.

If access needs revoking (ex-employee):

1. Vercel Dashboard → Team → Members → remove user.
2. GitHub repo → Settings → Manage access → remove user.
3. Rotate the GitHub PAT if it's been shared.
4. Sentry, Supabase, provider dashboards: remove user from each org.

### 2.6 GitHub access tokens (CI / `gh`)

If a PAT used by CI is leaked:

1. github.com/settings/tokens → revoke the leaked token.
2. Generate a new fine-grained token with the minimum required scope (`repo:status`, `pull_request:write`, etc. — NOT `repo:*`).
3. Update wherever it was set: Vercel env, Action secrets, etc.
4. Audit GitHub's "Audit Log" for any unexpected events using the leaked token.

---

## §3 Verification after rotation

For ANY rotation, confirm at least these three things before declaring done:

- [ ] Production deploy completed successfully (Vercel checks green)
- [ ] At least one end-user-facing flow that depends on the rotated key works in Production (smoke test the most-relevant route)
- [ ] Old key is revoked at the provider, not just removed from Vercel env

Then write a one-line entry in `docs/security/audit-trail.md`:
```
2026-MM-DD  rotated  <KEY_NAME>  reason: <trigger from §1>  by: <name>  verified: <route smoke-tested>
```

---

## §4 What we do NOT rotate

- Public envs (`NEXT_PUBLIC_*`) — these ship to the browser, are not secret, and rotating only invalidates user bookmarks.
- Supabase **anon** key — public-by-design, reaches the browser via SSR. Rotating it triggers a forced re-login for every active user; do this only on a Supabase-mandated event, never preemptively.
- Build-time env (`NODE_ENV`, etc.) — not a secret.

---

## §5 Open follow-ups

- [ ] Wire `audit-trail.md` to a `git commit -S`-signed log so rotation history is non-repudiable.
- [ ] Move from in-memory rate-limit to Upstash so a key rotation doesn't reset the rate-limit window. (Tracked in PROJECT-STATUS §0.5 backlog.)
- [ ] Sentry — when shipped — also rotates with `SENTRY_AUTH_TOKEN`; add a §2.7 stanza then.
