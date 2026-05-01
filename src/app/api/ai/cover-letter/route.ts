export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { runCoverLetterDraftTask } from '@/lib/ai/taskRunner'

const BodySchema = z.object({
  resumeId: z.string().uuid(),
  jobId: z.string().uuid(),
})

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
        { success: false, error: 'resumeId and jobId must be valid UUIDs', details: z.treeifyError(parsed.error) },
        { status: 400 },
      )
    }
    const { resumeId, jobId } = parsed.data

    // Defense in depth: scope resume lookup to the authed user at the app layer
    // even though RLS already gates `id = auth.uid()`. Two reasons:
    //   1. Misconfigured RLS in the future would leak; app-layer check fails closed.
    //   2. resumeId is user-supplied; without this, an attacker could probe other
    //      UUIDs and the 404 vs 500 timing would leak existence.
    const { data: profile, error: profileError } = await supabase
      .from('resume_profiles')
      .select('full_resume_text')
      .eq('id', resumeId)
      .eq('id', user.id)
      .maybeSingle()

    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: 'Resume not found' }, { status: 404 })
    }

    // Fetch job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('title, company, description')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (jobError || !job) {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 })
    }

    const result = await runCoverLetterDraftTask(
      profile.full_resume_text ?? '',
      job.description ?? '',
      job.title ?? '',
      job.company ?? '',
    )

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, content: result.output })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
