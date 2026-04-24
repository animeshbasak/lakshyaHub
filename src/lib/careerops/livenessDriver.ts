import { withBrowser } from './browserDriver'
import { classifyLiveness, type LivenessResult } from './livenessClassifier'
import { assertScanAllowed } from './urlGuard'

const MAX_BODY_CHARS = 50_000

/**
 * Probe a job URL for liveness via headless Chromium.
 *
 * Pipeline:
 *   1. SSRF guard (blocks private/link-local IPs, AWS IMDS)
 *   2. Launch @sparticuz/chromium, navigate with 15s timeout
 *   3. Extract httpStatus, finalUrl, bodyText (first 50kb), hasApplyControl
 *   4. Delegate verdict to the pure classifyLiveness function
 *
 * Special-case: HTTP 403 maps to 'uncertain' (not 'expired') — Cloudflare/Akamai
 * datacenter-IP blocks are a reliability concern, not an expiration signal.
 *
 * Navigation failures (DNS/connect/timeout) collapse to classifyLiveness with
 * httpStatus=0, producing 'expired' when content is thin or 'uncertain' otherwise.
 */
export async function probeLiveness(url: string): Promise<LivenessResult> {
  await assertScanAllowed(url)

  return withBrowser(
    async page => {
      let httpStatus = 0
      let finalUrl = url
      try {
        const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15_000 })
        httpStatus = resp?.status() ?? 0
        finalUrl = page.url()
      } catch {
        // Navigation failed entirely — hand off to classifier with zero signals
        return classifyLiveness({
          httpStatus: 0,
          finalUrl: url,
          bodyText: '',
          hasApplyControl: false,
        })
      }

      // Cloudflare / datacenter-IP block → uncertain, never expired
      if (httpStatus === 403) {
        return { status: 'uncertain', reason: 'cloudflare / 403 — cannot verify' }
      }

      const bodyText: string = await page.evaluate(
        (max: number) => document.body?.innerText?.slice(0, max) ?? '',
        MAX_BODY_CHARS
      )

      const hasApplyControl: boolean = await page.evaluate(() => {
        const els = Array.from(document.querySelectorAll('a, button, input'))
        const applyRe = /apply/i
        return els.some(el => {
          if (applyRe.test(el.textContent ?? '')) return true
          const v = (el as HTMLInputElement).value
          return typeof v === 'string' && applyRe.test(v)
        })
      })

      return classifyLiveness({ httpStatus, finalUrl, bodyText, hasApplyControl })
    },
    { timeoutMs: 20_000 }
  )
}
