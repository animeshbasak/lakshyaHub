export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runCoverLetterDraftTask } from '@/lib/ai/taskRunner'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { resumeId, jobId } = body as { resumeId: string; jobId: string }

    if (!resumeId || !jobId) {
      return NextResponse.json({ success: false, error: 'resumeId and jobId are required' }, { status: 400 })
    }

    // Fetch resume profile
    const { data: profile, error: profileError } = await supabase
      .from('resume_profiles')
      .select('full_resume_text')
      .eq('id', resumeId)
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
