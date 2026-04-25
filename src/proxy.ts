import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = ['/dashboard', '/board', '/resume', '/discover', '/profile', '/evaluate', '/eval', '/archetypes', '/stories']

/**
 * Build a per-request CSP with a nonce so Next.js's hydration scripts can
 * load while inline scripts injected by attackers cannot. The nonce is
 * exposed via the `x-nonce` response header for any RSC that needs to
 * generate inline `<script>` tags (none today; reserved for future).
 */
function buildCsp(nonce: string): string {
  const supa = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://*.supabase.co'
  const supaWs = supa.replace(/^https/, 'wss')

  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' https:`,
    `style-src 'self' 'unsafe-inline'`,                              // Tailwind hydration injects inline
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data:`,
    `connect-src 'self' ${supa} ${supaWs} https://api.anthropic.com https://generativelanguage.googleapis.com https://api.groq.com https://api.stripe.com https://*.upstash.io https://o*.ingest.sentry.io https://*.ingest.sentry.io`,
    `frame-src 'self' https://js.stripe.com https://hooks.stripe.com`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ')
}

export async function proxy(request: NextRequest) {
  // Per-request nonce for inline scripts (Next.js hydration etc.)
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  let response = NextResponse.next({ request: { headers: requestHeaders } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request: { headers: requestHeaders } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — must call getUser() not getSession() for server proxy
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p))

  // Unauthenticated → redirect to login
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Authenticated on login page → redirect to dashboard
  if (pathname === '/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // CSP + nonce passthrough on every passing response
  response.headers.set('Content-Security-Policy', buildCsp(nonce))
  response.headers.set('x-nonce', nonce)

  return response
}

export const config = {
  // Match everything except: Next internals, common static assets, and
  // any future Stripe webhook (which needs untouched raw body for signature verify).
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
