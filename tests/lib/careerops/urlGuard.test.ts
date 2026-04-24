import { describe, it, expect, vi } from 'vitest'

vi.mock('node:dns/promises', () => {
  const lookupImpl = async (hostname: string) => {
    const table: Record<string, string> = {
      'google.com': '142.250.80.46',
      'boards-api.greenhouse.io': '34.227.108.170',
      'internal.corp': '10.0.0.5',
      'aws-metadata.example': '169.254.169.254',
      'localhost-rebind.example': '127.0.0.1',
      'v6-loopback.example': '::1',
      'ulocal.example': 'fc00::1',
    }
    const addr = table[hostname]
    if (!addr) throw new Error('ENOTFOUND')
    return { address: addr, family: addr.includes(':') ? 6 : 4 }
  }
  return { default: { lookup: lookupImpl }, lookup: lookupImpl }
})

import { assertScanAllowed, isBlockedIp, UrlGuardError } from '@/lib/careerops/urlGuard'

describe('urlGuard', () => {
  it('allows a public https URL', async () => {
    await expect(assertScanAllowed('https://google.com/jobs/123')).resolves.toBeUndefined()
  })

  it('allows an ATS portal URL', async () => {
    await expect(assertScanAllowed('https://boards-api.greenhouse.io/v1/boards/anthropic/jobs')).resolves.toBeUndefined()
  })

  it('rejects http scheme', async () => {
    await expect(assertScanAllowed('http://google.com')).rejects.toMatchObject({ code: 'scheme' })
  })

  it('rejects file scheme', async () => {
    await expect(assertScanAllowed('file:///etc/passwd')).rejects.toMatchObject({ code: 'scheme' })
  })

  it('rejects IPv4 literal hostname', async () => {
    await expect(assertScanAllowed('https://169.254.169.254/latest/meta-data')).rejects.toMatchObject({ code: 'ip_literal' })
  })

  it('rejects IPv6 literal hostname', async () => {
    await expect(assertScanAllowed('https://[::1]/')).rejects.toMatchObject({ code: 'ip_literal' })
  })

  it('rejects hostname that resolves to RFC 1918 address', async () => {
    await expect(assertScanAllowed('https://internal.corp/')).rejects.toMatchObject({ code: 'internal_ip' })
  })

  it('rejects hostname that resolves to AWS IMDS link-local (169.254.169.254)', async () => {
    await expect(assertScanAllowed('https://aws-metadata.example/')).rejects.toMatchObject({ code: 'internal_ip' })
  })

  it('rejects DNS-rebind to loopback', async () => {
    await expect(assertScanAllowed('https://localhost-rebind.example/')).rejects.toMatchObject({ code: 'internal_ip' })
  })

  it('rejects IPv6 loopback resolution', async () => {
    await expect(assertScanAllowed('https://v6-loopback.example/')).rejects.toMatchObject({ code: 'internal_ip' })
  })

  it('rejects IPv6 unique-local (fc00::/7) resolution', async () => {
    await expect(assertScanAllowed('https://ulocal.example/')).rejects.toMatchObject({ code: 'internal_ip' })
  })

  it('rejects DNS lookup failure', async () => {
    await expect(assertScanAllowed('https://dns-fails.example/')).rejects.toMatchObject({ code: 'lookup_failed' })
  })

  it('rejects malformed URL', async () => {
    await expect(assertScanAllowed('not-a-url')).rejects.toMatchObject({ code: 'scheme' })
  })

  it('isBlockedIp: true for 10.x', () => {
    expect(isBlockedIp('10.1.2.3')).toBe(true)
  })

  it('isBlockedIp: true for 169.254.169.254', () => {
    expect(isBlockedIp('169.254.169.254')).toBe(true)
  })

  it('isBlockedIp: false for 8.8.8.8', () => {
    expect(isBlockedIp('8.8.8.8')).toBe(false)
  })
})
