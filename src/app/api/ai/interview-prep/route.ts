export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runInterviewPrepTask } from '@/lib/ai/taskRunner'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { jobId } = body as { jobId: string }

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'jobId is required' }, { status: 400 })
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

    const result = await runInterviewPrepTask(
      job.description ?? '',
      job.title ?? '',
      job.company ?? '',
    )

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    const output = result.output as { questions?: string[] } | null
    return NextResponse.json({ success: true, questions: output?.questions ?? [] })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
