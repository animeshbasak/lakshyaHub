export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { WritingStyleProfileSchema } from '@/lib/writingStyle/types'

/**
 * GET /api/writing-style
 *
 * Returns the calibrated writing-style profile (or null if not yet
 * calibrated) plus a count of stored samples for the authed user.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  // RLS already gates by user_id; the explicit .eq('id', user.id) is defense
  // in depth — fails closed even if RLS is later misconfigured.
  const { data: profile } = await supabase
    .from('resume_profiles')
    .select('writing_style, writing_style_calibrated_at')
    .eq('id', user.id)
    .maybeSingle()

  const { count: sampleCount } = await supabase
    .from('writing_samples')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Validate persisted style; if it doesn't match schema (manual edit, older
  // row), expose null rather than half-baked data.
  const parsed = profile?.writing_style
    ? WritingStyleProfileSchema.safeParse(profile.writing_style)
    : null

  return NextResponse.json({
    success: true,
    profile: parsed?.success ? parsed.data : null,
    calibratedAt: profile?.writing_style_calibrated_at ?? null,
    sampleCount: sampleCount ?? 0,
  })
}
