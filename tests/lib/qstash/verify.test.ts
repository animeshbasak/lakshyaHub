import { describe, it, expect } from 'vitest'
import { createHmac, createHash } from 'node:crypto'
import { verifyQStashSignature } from '@/lib/qstash/verify'

const URL = 'https://example.com/api/qstash/scan-portal'
const KEY_CURRENT = 'test_current_key_64chars_dGVzdF9rZXlfNjRjaGFyc190ZXN0X2tleV82NA'
const KEY_NEXT = 'test_next_key_64chars_dGVzdF9uZXh0X2tleV82NGNoYXJzX3Rlc3RfNjQ='

function b64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function makeJwt(payload: Record<string, unknown>, key: string): string {
  const header = b64url(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })))
  const body = b64url(Buffer.from(JSON.stringify(payload)))
  const signing = `${header}.${body}`
  const sig = b64url(createHmac('sha256', key).update(signing).digest())
  return `${signing}.${sig}`
}

const validPayload = (overrides: Record<string, unknown> = {}) => {
  const rawBody = '{"hello":"world"}'
  return {
    rawBody,
    payload: {
      iss: 'Upstash',
      sub: URL,
      exp: Math.floor(Date.now() / 1000) + 60,
      iat: Math.floor(Date.now() / 1000),
      body: b64url(createHash('sha256').update(rawBody, 'utf8').digest()),
      ...overrides,
    },
  }
}

describe('verifyQStashSignature', () => {
  it('accepts a valid signature signed with the current key', () => {
    const { rawBody, payload } = validPayload()
    const sig = makeJwt(payload, KEY_CURRENT)
    const r = verifyQStashSignature({ signature: sig, rawBody, url: URL, currentKey: KEY_CURRENT, nextKey: KEY_NEXT })
    expect(r.ok).toBe(true)
  })

  it('accepts a signature signed with the NEXT key (during rotation)', () => {
    const { rawBody, payload } = validPayload()
    const sig = makeJwt(payload, KEY_NEXT)
    const r = verifyQStashSignature({ signature: sig, rawBody, url: URL, currentKey: KEY_CURRENT, nextKey: KEY_NEXT })
    expect(r.ok).toBe(true)
  })

  it('rejects a signature when neither key matches', () => {
    const { rawBody, payload } = validPayload()
    const sig = makeJwt(payload, 'wrong_key')
    const r = verifyQStashSignature({ signature: sig, rawBody, url: URL, currentKey: KEY_CURRENT, nextKey: KEY_NEXT })
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('bad_signature')
  })

  it('rejects when iss is not "Upstash"', () => {
    const { rawBody, payload } = validPayload({ iss: 'Attacker' })
    const sig = makeJwt(payload, KEY_CURRENT)
    const r = verifyQStashSignature({ signature: sig, rawBody, url: URL, currentKey: KEY_CURRENT, nextKey: KEY_NEXT })
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('bad_issuer')
  })

  it('rejects an expired token (beyond 30s clock skew)', () => {
    const { rawBody, payload } = validPayload({ exp: Math.floor(Date.now() / 1000) - 60 })
    const sig = makeJwt(payload, KEY_CURRENT)
    const r = verifyQStashSignature({ signature: sig, rawBody, url: URL, currentKey: KEY_CURRENT, nextKey: KEY_NEXT })
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('expired')
  })

  it('accepts a JUST-expired token within 30s clock skew', () => {
    const { rawBody, payload } = validPayload({ exp: Math.floor(Date.now() / 1000) - 5 })
    const sig = makeJwt(payload, KEY_CURRENT)
    const r = verifyQStashSignature({ signature: sig, rawBody, url: URL, currentKey: KEY_CURRENT, nextKey: KEY_NEXT })
    expect(r.ok).toBe(true)
  })

  it('rejects when sub does not match the destination URL (replay defense)', () => {
    const { rawBody, payload } = validPayload({ sub: 'https://example.com/api/qstash/different-route' })
    const sig = makeJwt(payload, KEY_CURRENT)
    const r = verifyQStashSignature({ signature: sig, rawBody, url: URL, currentKey: KEY_CURRENT, nextKey: KEY_NEXT })
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('bad_subject')
  })

  it('rejects when body hash does not match', () => {
    const { payload } = validPayload()
    // Sign with hash of original body, then verify with a tampered body
    const sig = makeJwt(payload, KEY_CURRENT)
    const r = verifyQStashSignature({ signature: sig, rawBody: '{"hello":"tampered"}', url: URL, currentKey: KEY_CURRENT, nextKey: KEY_NEXT })
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('bad_body_hash')
  })

  it('rejects when signature has the wrong number of segments', () => {
    const r = verifyQStashSignature({ signature: 'header.payload', rawBody: '{}', url: URL, currentKey: KEY_CURRENT, nextKey: KEY_NEXT })
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('bad_format')
  })

  it('rejects when no signing keys are configured', () => {
    const { rawBody, payload } = validPayload()
    const sig = makeJwt(payload, KEY_CURRENT)
    const r = verifyQStashSignature({ signature: sig, rawBody, url: URL, currentKey: undefined, nextKey: undefined })
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('no_key')
  })
})
