import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // @supabase/ssr v2 PKCE flow sends token_hash; pre-v2 / older redirect URLs
  // sent token. Support both for backward compat — the verifyOtp signature
  // accepts the value under the `token_hash` key regardless of which param
  // name the URL used.
  const tokenHash = searchParams.get('token_hash') ?? searchParams.get('token')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()

  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) return NextResponse.redirect(`${origin}${next}`)
      console.error('[auth/callback] exchangeCodeForSession error:', error.message)
    } catch (err) {
      console.error('[auth/callback] unexpected error:', err)
    }
  } else if (tokenHash && type) {
    try {
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      if (!error) return NextResponse.redirect(`${origin}${next}`)
      console.error('[auth/callback] verifyOtp error:', error.message)
    } catch (err) {
      console.error('[auth/callback] unexpected error:', err)
    }
  } else {
    console.error('[auth/callback] missing code AND token_hash params:', request.url)
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
