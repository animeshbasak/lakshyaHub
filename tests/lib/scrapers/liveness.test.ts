import { describe, it, expect } from 'vitest'
import {
  checkLiveness,
  type LivenessStatus,
  __testInternals,
} from '../../../src/lib/scrapers/liveness'

const URL = 'https://example.com/job/123'

function html(body: string): string {
  // Wrap body in enough boilerplate to clear MIN_CONTENT_CHARS unless we want
  // to test the short-content branch.
  return `<!doctype html><html><head><title>X</title></head><body>${body}<p>${'x'.repeat(400)}</p></body></html>`
}

describe('checkLiveness — hard-expired patterns', () => {
  it('detects English "this job is closed"', () => {
    const r = checkLiveness(html('<p>This job is closed.</p>'), URL)
    expect(r.status).toBe('expired')
  })

  it('detects "Applications have closed" banner (mycareersfuture variant)', () => {
    const body = `
      <h1>Senior Staff Embedded Software Engineer</h1>
      <p>MaxLinear Asia Singapore Private Limited</p>
      <p>9 applications · Posted 27 Oct 2025 · Closed on 26 Nov 2025</p>
      <p>Applications have closed for this job</p>
      <a>Log in to Apply</a>
    `
    expect(checkLiveness(html(body), URL).status).toBe('expired')
  })

  it('detects "applications are closed" variant', () => {
    expect(
      checkLiveness(html('<p>Applications are closed for this position.</p>'), URL).status,
    ).toBe('expired')
  })

  it('detects "closed on 26 Nov 2025" date variant', () => {
    expect(
      checkLiveness(html('<p>Closed on 26 Nov 2025</p>'), URL).status,
    ).toBe('expired')
  })

  it('detects "closed on November 26" alternate date format', () => {
    expect(
      checkLiveness(html('<p>Closed on November 26 2025</p>'), URL).status,
    ).toBe('expired')
  })

  it('detects German "bereits besetzt" variant', () => {
    expect(
      checkLiveness(html('<p>Diese Stelle ist bereits besetzt.</p>'), URL).status,
    ).toBe('expired')
  })

  it('detects French "offre expirée" variant', () => {
    expect(
      checkLiveness(html('<p>Cette offre expirée n\'est plus disponible.</p>'), URL).status,
    ).toBe('expired')
  })
})

describe('checkLiveness — listing-page redirect', () => {
  it('detects "X jobs found" listing redirect', () => {
    const r = checkLiveness(html('<h1>247 jobs found</h1>'), URL)
    expect(r.status).toBe('expired')
  })

  it('detects "search results for" listing', () => {
    const r = checkLiveness(html('<h2>Search results for "engineer"</h2>'), URL)
    expect(r.status).toBe('expired')
  })
})

describe('checkLiveness — URL-level signals', () => {
  it('detects ?error=expired in URL', () => {
    const r = checkLiveness(html('Some content'), 'https://example.com/job?error=expired')
    expect(r.status).toBe('expired')
  })

  it('detects /expired/ path in URL', () => {
    const r = checkLiveness(html('Some content'), 'https://example.com/jobs/expired/123')
    expect(r.status).toBe('expired')
  })

  it('detects ?status=closed in URL', () => {
    const r = checkLiveness(html('Some content'), 'https://example.com/job?status=closed')
    expect(r.status).toBe('expired')
  })
})

describe('checkLiveness — content threshold', () => {
  it('returns unknown when body text is too short', () => {
    const r = checkLiveness('<html><body><p>Hi</p></body></html>', URL)
    expect(r.status).toBe('unknown')
    expect(r.signals[0]).toMatch(/^short:/)
  })

  it('returns live when content is rich + no expiry signals', () => {
    const body = `
      <h1>Senior Frontend Engineer</h1>
      <p>About the role: We are looking for an experienced engineer to join our team.</p>
      <p>${'Responsibilities and detail '.repeat(20)}</p>
      <a>Apply now</a>
    `
    expect(checkLiveness(html(body), URL).status).toBe('live')
  })
})

describe('checkLiveness — false-positive guards', () => {
  it('does NOT flag "we closed our seed round" inside JD body', () => {
    const body = `
      <h1>Senior Frontend Engineer</h1>
      <p>About us: We just closed our seed round of funding from Sequoia.
         Excited to grow the team. Apply now via the link below.</p>
      <p>${'Responsibilities '.repeat(30)}</p>
    `
    // "closed our seed round" doesn't match any of our patterns
    expect(checkLiveness(html(body), URL).status).toBe('live')
  })

  it('does NOT flag legit "1234 applications" mention as closed', () => {
    const body = `
      <h1>Engineer Role</h1>
      <p>1,234 applications received so far this month.</p>
      <p>${'Detail '.repeat(50)}</p>
    `
    // "applications received" shouldn't match "applications closed"
    expect(checkLiveness(html(body), URL).status).toBe('live')
  })
})

describe('checkLiveness — signals output', () => {
  it('emits human-readable signal for the matched pattern', () => {
    const r = checkLiveness(html('<p>This job is closed.</p>'), URL)
    expect(r.signals[0]).toMatch(/^hard:/)
  })

  it('emits signal showing length when content too short', () => {
    const r = checkLiveness('<html><body><p>tiny</p></body></html>', URL)
    expect(r.signals[0]).toMatch(/^short:/)
  })
})

describe('__testInternals', () => {
  it('exposes constants for downstream wire-up tests', () => {
    expect(__testInternals.HARD_EXPIRED_PATTERNS.length).toBeGreaterThanOrEqual(7)
    expect(__testInternals.MIN_CONTENT_CHARS).toBe(300)
  })

  it('LivenessStatus type matches expected values', () => {
    const v: LivenessStatus = 'live'
    expect(['live', 'expired', 'unknown']).toContain(v)
  })
})
