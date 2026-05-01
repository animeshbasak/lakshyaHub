export const runtime = 'nodejs'
export const maxDuration = 30

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDueFollowups } from '@/actions/followupActions'
import { sendEmail, isEmailConfigured } from '@/lib/email/sender'
import type { ApplicationWithCadence } from '@/lib/careerops/followupCadence'

/**
 * "Email me my due follow-ups" — user-triggered. Sends ONE email summarising
 * everything in the dueNow + later buckets to the authenticated user's
 * Supabase email address.
 *
 * Cron-driven daily-digest is deferred until either:
 *   (a) user explicitly opts in (no preferences table exists today), or
 *   (b) we have a cron infra path (QStash Schedules → this route, with a
 *       service-role variant that walks consenting users).
 *
 * For MVP, the user clicks the button → email arrives. That's the validation
 * loop without any schema or cron commitment.
 */

const PER_USER_INTERVAL_MS = 5 * 60 * 1000  // 1 email per 5 min — anti-spam
const lastSendByUser = new Map<string, number>()

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 })
  }
  if (!user.email) {
    return NextResponse.json({ ok: false, error: 'no_user_email' }, { status: 400 })
  }

  const last = lastSendByUser.get(user.id) ?? 0
  if (Date.now() - last < PER_USER_INTERVAL_MS) {
    const retryAfter = Math.ceil((PER_USER_INTERVAL_MS - (Date.now() - last)) / 1000)
    return NextResponse.json(
      { ok: false, error: 'rate_limited', retryAfter },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  if (!isEmailConfigured()) {
    return NextResponse.json({
      ok: false,
      error: 'email_not_configured',
      hint: 'Set RESEND_API_KEY + RESEND_FROM_ADDRESS in Vercel env. See docs/security/email-setup.md.',
    }, { status: 503 })
  }

  const due = await getDueFollowups()
  if (!due.ok) {
    return NextResponse.json({ ok: false, error: due.error }, { status: 500 })
  }
  const { dueNow, later } = due.data!

  // No actionable items → don't spam the user. Return 200 with a hint.
  if (dueNow.length === 0 && later.length === 0) {
    return NextResponse.json({
      ok: true,
      sent: false,
      reason: 'no_followups_due',
    })
  }

  const result = await sendEmail({
    to: user.email,
    subject: subjectFor(dueNow, later),
    text: textBody(dueNow, later),
    html: htmlBody(dueNow, later),
    replyTo: process.env.NEXT_PUBLIC_BETA_INTEREST_EMAIL,
    idempotencyKey: `cadence:${user.id}:${new Date().toISOString().slice(0, 10)}`,
  })

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error, status: result.status }, { status: 502 })
  }

  lastSendByUser.set(user.id, Date.now())
  return NextResponse.json({ ok: true, sent: true, messageId: result.id, dueNowCount: dueNow.length, laterCount: later.length })
}

function subjectFor(dueNow: ApplicationWithCadence[], later: ApplicationWithCadence[]): string {
  if (dueNow.length === 0) return `${later.length} application${later.length === 1 ? '' : 's'} on track`
  if (dueNow.length === 1) return `Follow up with ${dueNow[0].company ?? 'one company'} today`
  return `${dueNow.length} follow-ups due today`
}

function textBody(dueNow: ApplicationWithCadence[], later: ApplicationWithCadence[]): string {
  const lines: string[] = ['Lakshya — your follow-up digest', '']
  if (dueNow.length > 0) {
    lines.push('🔴 Due now:')
    for (const a of dueNow) {
      lines.push(`  • ${a.flag.toUpperCase()} — ${a.company ?? 'Unknown'} · ${a.role ?? 'Unknown role'} (status: ${a.status})`)
    }
    lines.push('')
  }
  if (later.length > 0) {
    lines.push('🟢 On track / cold:')
    for (const a of later.slice(0, 10)) {
      lines.push(`  • ${a.flag} — ${a.company ?? 'Unknown'} · ${a.role ?? 'Unknown role'}`)
    }
    if (later.length > 10) lines.push(`  • …and ${later.length - 10} more on /board`)
    lines.push('')
  }
  lines.push('Open /board to act: https://getlakshya.vercel.app/board')
  lines.push('')
  lines.push('— Lakshya')
  return lines.join('\n')
}

function htmlBody(dueNow: ApplicationWithCadence[], later: ApplicationWithCadence[]): string {
  const sections: string[] = []
  sections.push(`<h2 style="font-family:system-ui;color:#111">Your follow-up digest</h2>`)

  if (dueNow.length > 0) {
    sections.push(`<h3 style="font-family:system-ui;color:#dc2626;margin-top:24px">Due now (${dueNow.length})</h3>`)
    sections.push('<ul style="font-family:system-ui;color:#111;line-height:1.6">')
    for (const a of dueNow) {
      sections.push(
        `<li><strong style="color:${a.flag === 'overdue' ? '#dc2626' : '#d97706'}">${escapeHtml(a.flag.toUpperCase())}</strong> — ${escapeHtml(a.company ?? 'Unknown')} · ${escapeHtml(a.role ?? 'Unknown role')} <span style="color:#6b7280">(${escapeHtml(a.status)})</span></li>`
      )
    }
    sections.push('</ul>')
  }

  if (later.length > 0) {
    sections.push(`<h3 style="font-family:system-ui;color:#374151;margin-top:24px">On track (${later.length})</h3>`)
    sections.push('<ul style="font-family:system-ui;color:#374151;line-height:1.6">')
    for (const a of later.slice(0, 10)) {
      sections.push(`<li>${escapeHtml(a.flag)} — ${escapeHtml(a.company ?? 'Unknown')} · ${escapeHtml(a.role ?? 'Unknown role')}</li>`)
    }
    if (later.length > 10) sections.push(`<li style="color:#6b7280">…and ${later.length - 10} more on <a href="https://getlakshya.vercel.app/board" style="color:#2563eb">/board</a></li>`)
    sections.push('</ul>')
  }

  sections.push(`<p style="font-family:system-ui;color:#6b7280;margin-top:32px">Open <a href="https://getlakshya.vercel.app/board" style="color:#2563eb">/board</a> to act.</p>`)
  return sections.join('\n')
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
