/**
 * Email sender — Resend-only for MVP, no SDK.
 *
 * Why Resend: free tier = 3,000 emails/month + 100/day, no card required,
 * deliverability is great, and the API surface is one POST. Postmark/SES
 * would also work — swap the BASE_URL + auth header if you migrate.
 *
 * Why no `resend` SDK: keeps the deploy lean, avoids `npm install` churn,
 * and the wrapper here covers the full feature set we need (text + html,
 * idempotency, plain-text fallback). If you later need attachments or
 * batch sends, install the SDK and replace this file.
 */

const RESEND_BASE = 'https://api.resend.com/emails'

export interface SendInput {
  to: string | string[]
  subject: string
  /** Plain-text body — always required (some clients fall back to it). */
  text: string
  /** Optional HTML body — Resend renders this when present. */
  html?: string
  /** Override the default sender. Must be a verified-domain address on Resend. */
  from?: string
  /** Optional Reply-To header (e.g. founder inbox so users can hit reply). */
  replyTo?: string
  /**
   * Idempotency key — Resend dedupes within 24h on this. Use for any
   * automated send (cron, webhook) so retries don't double-deliver.
   */
  idempotencyKey?: string
}

export interface SendResult {
  ok: boolean
  id?: string
  status?: number
  error?: string
}

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && !!process.env.RESEND_FROM_ADDRESS
}

export async function sendEmail(input: SendInput): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  const defaultFrom = process.env.RESEND_FROM_ADDRESS

  if (!apiKey || !defaultFrom) {
    return { ok: false, error: 'email_not_configured' }
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }
  if (input.idempotencyKey) {
    headers['Idempotency-Key'] = input.idempotencyKey
  }

  const body = {
    from: input.from ?? defaultFrom,
    to: Array.isArray(input.to) ? input.to : [input.to],
    subject: input.subject,
    text: input.text,
    ...(input.html ? { html: input.html } : {}),
    ...(input.replyTo ? { reply_to: input.replyTo } : {}),
  }

  const res = await fetch(RESEND_BASE, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return { ok: false, status: res.status, error: text || res.statusText }
  }

  const data = (await res.json().catch(() => null)) as { id?: string } | null
  return { ok: true, status: res.status, id: data?.id }
}
