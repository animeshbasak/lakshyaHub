export const runtime = 'nodejs'
export const maxDuration = 60

import { NextResponse } from 'next/server'
import chromium from '@sparticuz/chromium'
import { chromium as playwright } from 'playwright-core'

export async function GET() {
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
