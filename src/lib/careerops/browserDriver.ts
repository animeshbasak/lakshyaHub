import chromium from '@sparticuz/chromium'
import { chromium as playwright, type Page } from 'playwright-core'

export interface BrowserRunOptions {
  userAgent?: string
  viewport?: { width: number; height: number }
  timeoutMs?: number
}

const DEFAULT_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36'

export async function withBrowser<T>(
  fn: (page: Page) => Promise<T>,
  opts: BrowserRunOptions = {}
): Promise<T> {
  const browser = await playwright.launch({
    args: [
      ...chromium.args,
      // Refuse localhost resolution at the DNS layer (SSRF defense in depth)
      '--host-resolver-rules=MAP localhost 127.255.255.255',
    ],
    executablePath: await chromium.executablePath(),
    headless: true,
  })
  try {
    const context = await browser.newContext({
      userAgent: opts.userAgent ?? DEFAULT_UA,
      viewport: opts.viewport ?? { width: 1280, height: 800 },
      ignoreHTTPSErrors: false,
    })
    const page = await context.newPage()
    page.setDefaultTimeout(opts.timeoutMs ?? 15_000)
    return await fn(page)
  } finally {
    await browser.close()
  }
}
