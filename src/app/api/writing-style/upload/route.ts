export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import {
  MAX_SAMPLES_PER_USER,
  MAX_SAMPLE_BYTES,
} from '@/lib/writingStyle/types'

const BodySchema = z.object({
  filename: z.string().min(1).max(200),
  content: z.string().min(1).max(MAX_SAMPLE_BYTES),
})

/**
 * POST /api/writing-style/upload
 *
 * Stores a single user-supplied writing sample (text or markdown). Per-user
 * cap of 20 samples; oldest must be deleted before a 21st can be uploaded.
 *
 * Privacy: raw samples are RLS-gated. The downstream extractor strips PII
 * pre-LLM (lib/writingStyle/sanitizePII.ts).
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const parsed = BodySchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid body', details: z.treeifyError(parsed.error) },
        { status: 400 },
      )
    }

    // Enforce per-user sample cap — prevents unbounded storage growth.
    const { count } = await supabase
      .from('writing_samples')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count ?? 0) >= MAX_SAMPLES_PER_USER) {
      return NextResponse.json(
        {
          success: false,
          error: `Sample cap reached (${MAX_SAMPLES_PER_USER}). Delete an existing sample before uploading more.`,
        },
        { status: 409 },
      )
    }

    const { content, filename } = parsed.data
    const byteSize = new TextEncoder().encode(content).length

    const { data, error } = await supabase
      .from('writing_samples')
      .insert({
        user_id: user.id,
        filename,
        content,
        byte_size: byteSize,
      })
      .select('id, filename, byte_size, created_at')
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, sample: data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
