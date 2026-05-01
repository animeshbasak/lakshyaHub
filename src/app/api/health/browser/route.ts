export const runtime = 'nodejs'
export const maxDuration = 60

import { NextResponse, type NextRequest } from 'next/server'
import chromium from '@sparticuz/chromium'
import { chromium as playwright } from 'playwright-core'

/**
 * Auth-gated — each call spawns Chromium (~200 MB RAM × 60s). Unauthenticated
 * access is a trivial DoS vector. Require HEALTH_SECRET header for any caller.
 */
export async function GET(req: NextRequest) {
  // Plan-aware preflight. See /api/qstash/check-liveness for rationale.
  if (process.env.BROWSER_LIVENESS_ENABLED !== 'true') {
    return NextResponse.json(
      { ok: false, error: 'browser_liveness_disabled', hint: 'Set BROWSER_LIVENESS_ENABLED=true after upgrading to a Vercel plan with ≥1769 MB function memory.' },
      { status: 503 },
    )
  }

  const secret = process.env.HEALTH_SECRET
  if (!secret || req.headers.get('x-health-secret') !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const browser = await playwright.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  })
  try {
    const page = await browser.newPage()
    await page.goto('about:blank')
    const ua = await page.evaluate(() => navigator.userAgent)
    return NextResponse.json({ ok: true, ua })
  } finally {
    await browser.close()
  }
}
