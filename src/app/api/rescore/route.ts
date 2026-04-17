export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runJdMatch5dTask } from '@/lib/ai/taskRunner'
import type { JdMatch5dResult } from '@/types'

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

    // Fetch user resume_profile
    const { data: profile, error: profileError } = await supabase
      .from('resume_profiles')
      .select('full_resume_text')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: 'Resume profile not found' }, { status: 404 })
    }

    const resumeText = profile.full_resume_text ?? ''
    const jdText = job.description ?? ''

    const prompt = `You are an expert recruiter evaluating a candidate's fit for a job.

## Job
Title: ${job.title}
Company: ${job.company}
Description:
${jdText.slice(0, 3000)}

## Candidate Resume
${resumeText.slice(0, 3000)}

Evaluate the fit across 5 dimensions: skills, title, seniority, location, salary.
Return a JSON object with this exact structure:
{
  "overall_score": <0-100 number>,
  "grade": <"A"|"B"|"C"|"D"|"F">,
  "verdict": <one sentence summary>,
  "dimensions": {
    "skills":    { "score": <0-100>, "note": "<brief note>" },
    "title":     { "score": <0-100>, "note": "<brief note>" },
    "seniority": { "score": <0-100>, "note": "<brief note>" },
    "location":  { "score": <0-100>, "note": "<brief note>" },
    "salary":    { "score": <0-100>, "note": "<brief note>" }
  },
  "top_gaps": ["<gap1>", "<gap2>", "<gap3>"]
}`

    const result = await runJdMatch5dTask(prompt)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    const matchResult = result.output as JdMatch5dResult

    // Update jobs table with new fit_score and fit_breakdown
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        fit_score: matchResult.overall_score,
        fit_breakdown: matchResult,
      })
      .eq('id', jobId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('[rescore] Failed to update job:', updateError)
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, fitScore: matchResult.overall_score, data: matchResult })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
