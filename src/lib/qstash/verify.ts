import { createHmac, createHash, timingSafeEqual } from 'node:crypto'

/**
 * QStash signature verifier.
 *
 * Replaces `@upstash/qstash`'s Receiver class — no dep, no install required.
 * Verifies the JWT-style signature QStash includes in the
 * `Upstash-Signature` request header on every webhook delivery.
 *
 * Token format: `header.payload.signature` (each segment base64url-encoded).
 * Algorithm: HS256 (HMAC-SHA256). The signing key is one of two rotating
 * values exposed by the QStash dashboard:
 *   - QSTASH_CURRENT_SIGNING_KEY  (active)
 *   - QSTASH_NEXT_SIGNING_KEY     (used during rotation windows)
 *
 * We accept a signature signed by EITHER key — the official client does the
 * same. If only one key is present in env we still proceed.
 *
 * Payload claims we check:
 *   - iss === "Upstash"
 *   - exp > now (with 30s clock-skew tolerance)
 *   - body matches body_hash (sha256(rawBody) base64-url)
 *   - sub matches the URL the request landed on (defense-in-depth — stops
 *     an attacker from replaying a signed payload to a different route)
 */

interface VerifyInput {
  signature: string         // value of Upstash-Signature header
  rawBody: string           // raw request body (do NOT JSON.parse first — hash is over the bytes)
  url: string               // full URL the request hit (e.g. https://lakshya.app/api/qstash/scan-portal)
  currentKey: string | undefined
  nextKey: string | undefined
}

export interface VerifyResult {
  ok: boolean
  reason?: 'bad_format' | 'bad_signature' | 'bad_issuer' | 'expired' | 'bad_body_hash' | 'bad_subject' | 'no_key'
  payload?: QStashJwtPayload
}

interface QStashJwtPayload {
  iss?: string
  sub?: string
  exp?: number
  nbf?: number
  iat?: number
  jti?: string
  body?: string  // base64-url sha256 of request body
}

const CLOCK_SKEW_S = 30

export function verifyQStashSignature(input: VerifyInput): VerifyResult {
  const { signature, rawBody, url, currentKey, nextKey } = input

  if (!currentKey && !nextKey) {
    return { ok: false, reason: 'no_key' }
  }

  const parts = signature.split('.')
  if (parts.length !== 3) {
    return { ok: false, reason: 'bad_format' }
  }
  const [headerSeg, payloadSeg, sigSeg] = parts

  // Verify HMAC against either key.
  const signed = `${headerSeg}.${payloadSeg}`
  const expectedSig = sigSeg
  let signatureMatched = false
  for (const key of [currentKey, nextKey]) {
    if (!key) continue
    const computed = createHmac('sha256', key).update(signed).digest()
    const provided = base64UrlDecodeToBuffer(expectedSig)
    if (computed.length === provided.length && timingSafeEqual(computed, provided)) {
      signatureMatched = true
      break
    }
  }
  if (!signatureMatched) {
    return { ok: false, reason: 'bad_signature' }
  }

  let payload: QStashJwtPayload
  try {
    payload = JSON.parse(base64UrlDecodeToString(payloadSeg)) as QStashJwtPayload
  } catch {
    return { ok: false, reason: 'bad_format' }
  }

  if (payload.iss !== 'Upstash') {
    return { ok: false, reason: 'bad_issuer', payload }
  }

  const nowS = Math.floor(Date.now() / 1000)
  if (typeof payload.exp === 'number' && payload.exp + CLOCK_SKEW_S < nowS) {
    return { ok: false, reason: 'expired', payload }
  }

  // Subject is the destination URL QStash forwarded to. Defense-in-depth:
  // ensures a signed payload for /api/qstash/scan-portal can't be replayed
  // against /api/qstash/cadence-digest.
  if (payload.sub) {
    // QStash sometimes URL-encodes; compare both raw and decoded forms.
    const same = payload.sub === url || decodeURIComponent(payload.sub) === url
    if (!same) {
      return { ok: false, reason: 'bad_subject', payload }
    }
  }

  // body claim is base64url(sha256(rawBody)). Compare to the hash we compute.
  if (payload.body) {
    const computedBodyHash = base64UrlEncode(createHash('sha256').update(rawBody, 'utf8').digest())
    if (computedBodyHash !== payload.body) {
      return { ok: false, reason: 'bad_body_hash', payload }
    }
  }

  return { ok: true, payload }
}

function base64UrlDecodeToBuffer(s: string): Buffer {
  // base64url → base64
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4))
  const std = s.replace(/-/g, '+').replace(/_/g, '/') + pad
  return Buffer.from(std, 'base64')
}

function base64UrlDecodeToString(s: string): string {
  return base64UrlDecodeToBuffer(s).toString('utf8')
}

function base64UrlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
