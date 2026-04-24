import { lookup } from 'node:dns/promises'

/**
 * CIDR-range-alike regex blocklist for IPv4 + IPv6 private / link-local / loopback.
 *
 *  - 10.0.0.0/8          RFC 1918 private
 *  - 172.16.0.0/12       RFC 1918 private
 *  - 192.168.0.0/16      RFC 1918 private
 *  - 127.0.0.0/8         loopback
 *  - 169.254.0.0/16      link-local (AWS EC2 IMDS at 169.254.169.254 is the
 *                        most critical exfil target)
 *  - 0.0.0.0/8           "this network" (unspecified)
 *  - ::1/128             IPv6 loopback
 *  - fc00::/7            IPv6 unique-local
 *  - fe80::/10           IPv6 link-local
 */
const BLOCKED_PATTERNS: RegExp[] = [
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^127\./,
  /^169\.254\./,
  /^0\./,
  /^::1$/,
  /^fc/i,
  /^fd/i,
  /^fe80:/i,
]

export class UrlGuardError extends Error {
  constructor(message: string, public code: 'scheme' | 'ip_literal' | 'internal_ip' | 'lookup_failed') {
    super(message)
    this.name = 'UrlGuardError'
  }
}

/**
 * Assert that a URL is safe for server-side navigation (no SSRF).
 *
 * Throws UrlGuardError with a `code` field for failure reasons. Resolves void on success.
 */
export async function assertScanAllowed(rawUrl: string): Promise<void> {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    throw new UrlGuardError('invalid URL', 'scheme')
  }

  if (parsed.protocol !== 'https:') {
    throw new UrlGuardError(`protocol not allowed: ${parsed.protocol}`, 'scheme')
  }

  // Reject IP-literal hostnames (IPv4 or bare IPv6)
  if (/^\d+\.\d+\.\d+\.\d+$/.test(parsed.hostname) || parsed.hostname.includes(':')) {
    throw new UrlGuardError(`IP literal hostnames not allowed: ${parsed.hostname}`, 'ip_literal')
  }

  let address: string
  try {
    const resolved = await lookup(parsed.hostname)
    address = resolved.address
  } catch {
    throw new UrlGuardError(`DNS lookup failed: ${parsed.hostname}`, 'lookup_failed')
  }

  if (BLOCKED_PATTERNS.some(re => re.test(address))) {
    throw new UrlGuardError(`hostname resolves to internal address: ${address}`, 'internal_ip')
  }
}

export function isBlockedIp(address: string): boolean {
  return BLOCKED_PATTERNS.some(re => re.test(address))
}
