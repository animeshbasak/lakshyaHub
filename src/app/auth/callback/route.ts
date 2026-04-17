import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token = searchParams.get('token')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()

  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) return NextResponse.redirect(`${origin}${next}`)
      console.error('[auth/callback] exchange error:', error.message)
    } catch (err) {
      console.error('[auth/callback] unexpected error:', err)
    }
  } else if (token && type) {
    try {
      const { error } = await supabase.auth.verifyOtp({ token_hash: token, type })
      if (!error) return NextResponse.redirect(`${origin}${next}`)
      console.error('[auth/callback] verifyOtp error:', error.message)
    } catch (err) {
      console.error('[auth/callback] unexpected error:', err)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
