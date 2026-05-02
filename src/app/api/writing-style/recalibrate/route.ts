export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractStyle, type RawSample } from '@/lib/writingStyle/extractStyle'

/**
 * POST /api/writing-style/recalibrate
 *
 * Loads all of the user's writing samples, runs the LLM extractor (with
 * PII pre-strip + Zod-validated output), persists the resulting profile
 * to resume_profiles.writing_style + sets writing_style_calibrated_at.
 *
 * Idempotent — calling again with no new samples re-derives the same
 * profile. Failure paths (LLM unavailable, extraction returns invalid
 * shape) do NOT clobber any existing profile.
 */
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { data: samples, error: samplesError } = await supabase
      .from('writing_samples')
      .select('filename, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (samplesError) {
      return NextResponse.json(
        { success: false, error: samplesError.message },
        { status: 500 },
      )
    }
    if (!samples || samples.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'no_samples',
          hint: 'Upload at least one sample via POST /api/writing-style/upload first.',
        },
        { status: 400 },
      )
    }

    const result = await extractStyle(samples as RawSample[])
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, code: result.code },
        // 502 if extraction failed (LLM); 400 if no samples; 500 otherwise.
        { status: result.code === 'extraction_failed' ? 502 : 500 },
      )
    }

    // Idempotent upsert — resume_profiles row may or may not exist for the
    // user yet (onboarding might not have completed). Use ON CONFLICT update.
    const calibratedAt = new Date().toISOString()
    const { error: upsertError } = await supabase
      .from('resume_profiles')
      .upsert(
        {
          id: user.id,
          writing_style: result.profile,
          writing_style_calibrated_at: calibratedAt,
        },
        { onConflict: 'id' },
      )

    if (upsertError) {
      return NextResponse.json(
        { success: false, error: upsertError.message },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      profile: result.profile,
      sampleCount: result.sampleCount,
      calibratedAt,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
