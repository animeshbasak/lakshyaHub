# Lakshya — Threat Model (S0)

> **Status:** baseline 2026-04-25. Owner: founder. Revisit after every major surface ships, after any incident, and quarterly minimum.
> **Cross-refs:** `docs/superpowers/plans/2026-04-24-security-plan.md` (full S0–S12 plan), `docs/PROJECT-STATUS.md` (live).

---

## 1. Assets + Classifications

| Asset | Classification | Storage | Retention |
|---|---|---|---|
| User CV (resumes.data jsonb) | PII | Supabase | until user deletes |
| User CV text (resume_profiles.full_resume_text) | PII | Supabase | until user deletes |
| Evaluation reports (evaluations.report_md) | PII + inferred employer data | Supabase | 90 days default (S12 / GDPR) |
| Job pipeline (applications, jobs, scan_history) | PII (intent + status) | Supabase | until user deletes |
| Story bank (story_bank STAR+R) | PII | Supabase | until user deletes |
| Session JWTs | Secret | Supabase Auth, browser cookie | 4h sliding (post-S2) |
| Anthropic / Gemini API keys | Secret | Vercel env (server only) | rotate quarterly (S5) |
| BYOK user-provided LLM keys | Secret | Supabase ciphertext (pgcrypto) | until user revokes |
| Stripe customer ID | Internal | Supabase | until account deletion |
| Audit log (audit_events) | Internal | Supabase append-only | 1 year retention |
| Cron secret + QStash signing keys | Secret | Vercel env | rotate semi-annually |

## 2. Trust Boundaries

```
   Browser  ⇄  Vercel Edge (CSP + security headers, S6)
       ⇕
   Vercel Lambda Node runtime
       ⇕
       ┌─ Supabase Auth (JWT verify)
       ⇕
       ├─ Supabase Postgres (RLS = the wall)
       ├─ Anthropic / Google GenAI APIs
       ├─ Playwright @sparticuz/chromium → ATS portals
       ├─ Stripe API + webhooks
       └─ Upstash Redis (rate limit + QStash)
```

Each `⇕` is a trust boundary; data crossing is validated by Zod (in) and RLS (out).

## 3. STRIDE × Top Risks

| # | Threat (STRIDE) | Path | Mitigation status |
|---|---|---|---|
| T1 | **Spoofing** — attacker registers victim email to harvest magic-link | /auth signup | Email verification enforced (S2 pending). Aggressive rate limit on /auth/* (S3 pending). |
| T2 | **Tampering** — RLS bypass via service-role key in client bundle | NEXT_PUBLIC_* leak | Audited 2026-04-25; only NEXT_PUBLIC_SUPABASE_URL + ANON_KEY exposed. CI lint pending (S5). |
| T3 | **Repudiation** — user deletes embarrassing eval after dispute | /api/account/delete or DELETE eval | audit_events append-only (this commit). Soft-delete with deleted_at TODO. |
| T4 | **Info disclosure (LLM06)** — eval prompt leaks user A's CV to user B | /api/ai/evaluate | Per-request prompt compose with single user_id; never concatenate users. Output PII filter pending (S4). **2026-04-25 audit closed: cvId IDOR fixed.** |
| T5 | **DoS (LLM04)** — abuse loop drains Anthropic quota | /api/ai/evaluate | jdText .max(20000) shipped. Per-user Upstash quota pending (S3+S4). Hourly cost ceiling pending (S4). |
| T6 | **Elevation (Injection)** — SQL injection via raw JD in DB filter | n/a (Supabase parameterizes) | Confirmed: all DB access via supabase-js client. |
| T7 | **Prompt injection (LLM01)** — JD overrides scoring rules via `═══` markers | evaluator | sanitizeUntrusted() shipped 2026-04-25. Output validator pending (S4). |
| T8 | **SSRF** — malicious URL → Playwright navigates internal IP | /api/liveness | urlGuard.ts shipped (RFC 1918 + IMDS + IPv6 ULA). Per-request fresh Chromium context. |
| T9 | **IDOR (Broken access)** — auth user reads any UUID | actions/*, /api/* | 3 IDORs closed 2026-04-25 (loadResume, deleteResume, evaluate cvId). |
| T10 | **Webhook spoofing** — fake Stripe / QStash webhook | /api/stripe/*, /api/liveness | QStash signature verify in liveness route. Stripe constructEvent pending (S9, Phase 4). |

## 4. Failed-Closed Defaults

- Missing CV / profile narrative → 400, never default to empty CV in eval prompt
- Empty LLM response → 502, never persist blank row
- Missing HEALTH_SECRET → /api/health returns minimal `{ok: true}`, /api/health/browser returns 401
- DNS lookup failure in urlGuard → throw `lookup_failed`, never proceed
- Cloudflare 403 on liveness → 'uncertain', never 'expired'

## 5. What's NOT Modeled (intentionally deferred)

- Supply-chain takeover of `@anthropic-ai/sdk` / `@google/genai` (S7 ongoing audit)
- DNS-rebinding past initial lookup (post-launch — Vercel egress IPs aren't in browser-accessible space)
- Insider threat (single-founder for now; revisit at first hire)
- Quantum-safe crypto for BYOK keys (overkill for SaaS at this scale)

## 6. Action Log

| Date | Item | Status |
|---|---|---|
| 2026-04-25 | Threat model authored | ✓ this commit |
| 2026-04-25 | Schema mismatch + 3 IDORs closed | ✓ commit `9dc3cef` |
| 2026-04-25 | LLM DoS + prompt injection mitigations | ✓ commit `9dc3cef` |
| 2026-04-25 | proxy.ts → middleware.ts (auth was dead) | ✓ commit `a243e01` |
| 2026-04-25 | audit_events table + RLS hardening migration | ✓ this commit (migration 004) |
| 2026-04-25 | Security headers baseline | ✓ commit `5e5d4ad` |
| TBD | S2 Supabase auth dashboard hardening | user action |
| TBD | S3 Upstash rate limits across /api/ai/* | needs UPSTASH_REDIS_* env |
| TBD | S4 LLM quota + cost ceiling + BYOK vault | post-MVP |
| TBD | S6 CSP-with-nonce in middleware | next iteration |
