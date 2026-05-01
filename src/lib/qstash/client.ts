/**
 * QStash publish client — minimal, no SDK.
 *
 * Why no `@upstash/qstash` SDK: keeps the deploy lean and avoids needing a
 * fresh `npm install` approval. The HTTP API is documented at
 * https://upstash.com/docs/qstash/api/publish — we hit it directly with
 * fetch + bearer auth.
 *
 * Two surfaces:
 *   - publish()        — fire-and-forget: enqueue ONE job at the destination URL.
 *   - publishBatch()   — bulk enqueue, useful when fan-out count is known ahead
 *                        of time (e.g. the 35-portal ATS scan).
 *
 * Both return a delivery summary (messageId list + count) the caller can log.
 * They DO NOT throw on partial failure — failed sends are reported in the
 * `errors` array so the calling route can decide how to respond to the user.
 */

const QSTASH_BASE = 'https://qstash.upstash.io/v2'

export interface PublishInput<T = unknown> {
  url: string
  body: T
  /**
   * Delay before delivery in seconds. QStash supports up to 7 days; for
   * longer schedules use a cron-style schedule via the dashboard or
   * `publishSchedule()` (not implemented here).
   */
  delaySeconds?: number
  /**
   * Idempotency key (max 256 chars). QStash dedupes same-key sends within
   * a 24h window. Set to a hash of (user_id + portal + day) to prevent
   * double-enqueue when a user spams the scan button.
   */
  idempotencyKey?: string
  /** Per-message retry count override; default = QStash's 3. */
  retries?: number
  /** Optional timeout in seconds (route execution). Default 60. */
  timeoutSeconds?: number
}

export interface PublishResult {
  ok: boolean
  messageId?: string
  status?: number
  error?: string
}

export interface BatchPublishSummary {
  total: number
  enqueued: number
  failed: number
  messageIds: string[]
  errors: Array<{ index: number; status?: number; error: string }>
}

export function isQStashConfigured(): boolean {
  return !!process.env.QSTASH_TOKEN
}

export async function publish<T>(input: PublishInput<T>): Promise<PublishResult> {
  const token = process.env.QSTASH_TOKEN
  if (!token) return { ok: false, error: 'QSTASH_TOKEN not set' }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
  if (input.delaySeconds && input.delaySeconds > 0) {
    headers['Upstash-Delay'] = `${input.delaySeconds}s`
  }
  if (input.idempotencyKey) {
    headers['Upstash-Deduplication-Id'] = input.idempotencyKey
  }
  if (typeof input.retries === 'number') {
    headers['Upstash-Retries'] = String(input.retries)
  }
  if (input.timeoutSeconds && input.timeoutSeconds > 0) {
    headers['Upstash-Timeout'] = `${input.timeoutSeconds}s`
  }

  const res = await fetch(`${QSTASH_BASE}/publish/${encodeURI(input.url)}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(input.body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return { ok: false, status: res.status, error: text || res.statusText }
  }

  const data = (await res.json().catch(() => null)) as { messageId?: string } | null
  return { ok: true, status: res.status, messageId: data?.messageId }
}

/**
 * Bulk-publish with per-item retry tracking. Sequenced (not Promise.all) so
 * we don't hammer QStash with 35 concurrent connections from a single
 * Lambda. QStash rate-limits at the org level so this is more polite.
 */
export async function publishBatch<T>(items: PublishInput<T>[]): Promise<BatchPublishSummary> {
  const summary: BatchPublishSummary = {
    total: items.length,
    enqueued: 0,
    failed: 0,
    messageIds: [],
    errors: [],
  }

  for (let i = 0; i < items.length; i++) {
    const r = await publish(items[i])
    if (r.ok) {
      summary.enqueued += 1
      if (r.messageId) summary.messageIds.push(r.messageId)
    } else {
      summary.failed += 1
      summary.errors.push({ index: i, status: r.status, error: r.error ?? 'unknown' })
    }
  }
  return summary
}
