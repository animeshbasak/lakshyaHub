import { NextResponse, type NextRequest } from 'next/server'

/**
 * Public liveness check — intentionally leaks zero implementation detail.
 * Authenticated callers (HEALTH_SECRET header) get the richer enabled-providers
 * list for internal monitoring.
 */
export function GET(req: NextRequest) {
  const secret = process.env.HEALTH_SECRET
  const authed = secret && req.headers.get('x-health-secret') === secret

  if (!authed) {
    return NextResponse.json({ ok: true })
  }

  const providers = ['GEMINI', 'GROQ', 'OPENROUTER', 'NVIDIA']
  const enabled = providers
    .filter(p => process.env[`AI_PROVIDER_${p}_ENABLED`] !== 'false')
    .map(p => p.toLowerCase())
  return NextResponse.json({ ok: true, enabled })
}
