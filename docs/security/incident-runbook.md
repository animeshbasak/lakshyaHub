# Incident Response Runbook (S11)

> **When you suspect a security event, this is the order. Don't improvise.**
>
> The runbook is short on purpose. If you're reading this during an incident, you don't have time for a 50-page document.

---

## §1 Severity ladder (10-second triage)

| Tier | Definition | Initial response time |
|---|---|---|
| **P0 / Critical** | Active data breach, ransom note, RCE, account-takeover at scale, payment processor freeze, public secret leak | **15 min** — drop everything |
| **P1 / High** | Single-account compromise, leaked dev secret, RLS bypass found, prod-down >5 min | **1 hr** |
| **P2 / Medium** | Suspicious activity in audit_events, vendor security advisory affecting our deps, scope creep on a dependency vuln | **24 hr** |
| **P3 / Low** | Phishing attempt, low-severity CVE in transitive dep with no exploit path | **1 week** |

If you're unsure, **treat as one tier higher** until §2 narrows it down.

---

## §2 Response — first 15 minutes (P0/P1)

Do these in order. Do **not** start a Slack thread before step 1.

1. **Cut the blast radius.**
   - Suspected secret leak → rotate per `docs/security/secrets-rotation.md` §2.
   - Suspected account compromise → revoke that user's Supabase session: `auth.signOut({ scope: 'global' })` for the user.
   - Suspected RLS bypass → flip the table to `revoke all on ... from anon, authenticated` until fixed.
   - Suspected RCE in the app → in Vercel, take the latest deployment offline (`vercel rollback`).

2. **Capture the evidence before it disappears.**
   - Vercel → Logs → export the last 1 hour to a file. Vercel auto-truncates after 7 days.
   - Supabase → SQL Editor → snapshot relevant `audit_events` rows: `select * from audit_events where created_at > now() - interval '24 hours' order by created_at desc;` → save as `.csv`.
   - GitHub → if the leak is in commit history, **do NOT force-push to fix** until you've snapshotted. Use `git log -p > leak-evidence.txt` first.
   - Browser console / network tab if the user can repro client-side.

3. **Open the incident file** at `docs/security/incidents/YYYY-MM-DD-short-handle.md` with this skeleton:
   ```
   # Incident <handle>
   - Detected: <UTC timestamp> by <human or system>
   - Severity: P0 / P1 / P2
   - Status: ACTIVE / CONTAINED / RESOLVED
   - Blast radius: <which users/data/systems>
   - Root cause hypothesis: <one sentence>
   - Mitigations applied: <list>
   - Open questions: <list>
   ```
   Update this file every 30 minutes during an active P0/P1.

4. **Notify** — only after containment is in motion:
   - For data-breach P0: affected users get a transactional email within 72 hours (GDPR Art. 34); regulators (ICO/DPC) within 72 hours of awareness.
   - For non-breach P0/P1: status update on `getlakshya.vercel.app/status` (when shipped) or pinned tweet from the project handle.
   - Vendor advisories: notify the vendor's security team via their `security@` address.

---

## §3 Stand-down (resolution)

Before declaring an incident closed:

- [ ] Root cause documented in the incident file (not just "fixed it").
- [ ] Detective control added (audit-events write, vendor alarm, monitoring rule) so the same class of event is loud next time.
- [ ] Preventive control added or filed as a backlog ticket with a deadline.
- [ ] Post-incident review scheduled within 7 days. PIR doc lives next to the incident file.
- [ ] Affected secrets all rotated (cross-check with `docs/security/secrets-rotation.md`).

After stand-down, status flips to `RESOLVED` in the incident file. **Do not delete the file** — incidents compound into a body of evidence for future audits, regulator queries, and honest retrospectives.

---

## §4 Common incident patterns (cheat sheet)

| Pattern | First action |
|---|---|
| **Secret committed to git** | `git rm` the file, `git commit`, `git push --force` ONLY after rotating the secret. The leak history is permanent — assume the secret is burned. |
| **Bad RLS policy** | `revoke all` on the table for `anon, authenticated`. Fix policy. Re-grant with the corrected policy. Test with a non-owner Supabase user. |
| **Compromised dependency** (`@xmldom/xmldom`-style CVE) | `npm audit`, pin the affected dep. If fix not yet released: temporarily replace usage with an alternative or accept the risk after threat-modeling the exposure. |
| **Provider key leaked** | Rotation runbook §2.2. Watch the provider's billing dashboard for unauthorized usage. Some providers (Anthropic) refund unauthorized usage if reported within 30 days. |
| **Account takeover (one user)** | Force sign-out: `auth.admin.signOut(userId)`. Reset their password. Audit `audit_events` for that `user_id` for the last 30 days; if you see DSAR-like activity, contact the user directly. |
| **Account takeover (mass)** | Treat as P0. Cut all sessions globally: `update auth.users set ban_until = now() + interval '1 hour'` (Supabase admin). Communicate via email + status page. |
| **DDOS / rate-limit storm** | Vercel auto-mitigates at the edge; if it slips through, manually enable Vercel's "Attack Challenge" mode. Check Cloudflare-style records on the origin if applicable. |

---

## §5 Contacts

Maintain in `docs/security/contacts.md` (not committed publicly):
- Vercel security: `security@vercel.com`
- Supabase security: `security@supabase.io`
- Anthropic / Google / Groq security contacts
- Razorpay / Stripe fraud-incident lines (when relevant)
- Local data-protection authority (ICO for UK, DPC for Ireland, CERT-In for India)
- Personal: founder phone (in case of laptop theft / personal duress)

---

## §6 What does NOT count as an incident

These are noise, not incidents — don't burn the response cycle on them:

- A failed login attempt from a user typo.
- A failed API call returning 500 once.
- A vendor sending a "minor security update" advisory that doesn't affect our stack.
- A 4xx-rate spike during a planned blog post / launch (load, not attack).
- A CVE in a transitive dep that's not on any code path we exercise.

If unsure, log it in `audit_events` with `action='security_observation'` and review weekly. Don't escalate until you have signal.
