/**
 * Follow-up Cadence — DB-backed port of career-ops/followup-cadence.mjs
 *
 * Rules (career-ops convention):
 *   - status='applied' → due 7 days after applied_at
 *   - status='interview' → due 1 day after most recent followup OR applied_at
 *   - status='saved' → no cadence yet (haven't applied)
 *   - status='offer' → no cadence (ball is in user's court)
 *   - status='rejected' → cold (closed)
 *   - applied_at > 45 days ago AND no response → cold (consider closing)
 *
 * Flag thresholds (relative to "due" timestamp):
 *   - now < due − 24h           → 'ok'
 *   - due − 24h ≤ now ≤ due     → 'urgent'
 *   - now > due                  → 'overdue'
 *   - applied_at > 45d, no resp  → 'cold'
 */

export type ApplicationStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'
export type CadenceFlag = 'ok' | 'urgent' | 'overdue' | 'cold'

export interface CadenceInput {
  status: ApplicationStatus
  appliedAt: string | null  // ISO
  lastFollowupAt: string | null  // ISO of latest followups.sent_at, if any
}

export interface CadenceResult {
  flag: CadenceFlag | null  // null = no cadence (e.g., 'saved' or 'offer')
  dueAt: string | null      // ISO of next due action (null when not applicable)
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000

export function computeCadence(input: CadenceInput, now: Date = new Date()): CadenceResult {
  const { status, appliedAt, lastFollowupAt } = input

  if (status === 'saved' || status === 'offer') {
    return { flag: null, dueAt: null }
  }

  if (status === 'rejected') {
    return { flag: 'cold', dueAt: null }
  }

  // For applied/interview we need an appliedAt anchor
  if (!appliedAt) return { flag: null, dueAt: null }
  const appliedTs = Date.parse(appliedAt)
  if (Number.isNaN(appliedTs)) return { flag: null, dueAt: null }

  const lastTs = lastFollowupAt ? Date.parse(lastFollowupAt) : null
  const anchor = lastTs && !Number.isNaN(lastTs) && lastTs > appliedTs ? lastTs : appliedTs

  const cadenceDays = status === 'interview' ? 1 : 7
  const dueTs = anchor + cadenceDays * ONE_DAY_MS

  // Cold heuristic: applied >45 days ago AND no follow-up reply (still 'applied')
  const ageDays = (now.getTime() - appliedTs) / ONE_DAY_MS
  if (status === 'applied' && ageDays > 45 && !lastTs) {
    return { flag: 'cold', dueAt: new Date(dueTs).toISOString() }
  }

  const nowTs = now.getTime()
  let flag: CadenceFlag
  if (nowTs > dueTs) flag = 'overdue'
  else if (nowTs >= dueTs - ONE_DAY_MS) flag = 'urgent'
  else flag = 'ok'

  return { flag, dueAt: new Date(dueTs).toISOString() }
}

/**
 * Convenience: compute cadence for many applications, sort due-soonest-first
 * (overdue + urgent at the top), drop ones that have no actionable follow-up.
 */
export interface ApplicationWithCadence {
  applicationId: string
  company: string | null
  role: string | null
  status: ApplicationStatus
  appliedAt: string | null
  flag: CadenceFlag
  dueAt: string | null
}

export interface ApplicationCadenceSource {
  id: string
  company: string | null
  role: string | null
  status: ApplicationStatus
  applied_at: string | null
}

export function rankByCadence(
  apps: ApplicationCadenceSource[],
  followupsByAppId: Map<string, string>,  // appId → most-recent followup sent_at
  now: Date = new Date()
): ApplicationWithCadence[] {
  const FLAG_PRIORITY: Record<CadenceFlag, number> = {
    overdue: 0, urgent: 1, ok: 2, cold: 3,
  }
  const out: ApplicationWithCadence[] = []
  for (const a of apps) {
    const { flag, dueAt } = computeCadence({
      status: a.status,
      appliedAt: a.applied_at,
      lastFollowupAt: followupsByAppId.get(a.id) ?? null,
    }, now)
    if (!flag) continue
    out.push({
      applicationId: a.id,
      company: a.company,
      role: a.role,
      status: a.status,
      appliedAt: a.applied_at,
      flag,
      dueAt,
    })
  }
  out.sort((a, b) => {
    const pa = FLAG_PRIORITY[a.flag] - FLAG_PRIORITY[b.flag]
    if (pa !== 0) return pa
    if (a.dueAt && b.dueAt) return Date.parse(a.dueAt) - Date.parse(b.dueAt)
    return 0
  })
  return out
}
