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
    const { resumeText, jd } = body as { resumeText: string; jd: string }

    if (!resumeText || !jd) {
      return NextResponse.json({ success: false, error: 'resumeText and jd are required' }, { status: 400 })
    }

    const prompt = `You are an expert recruiter evaluating a candidate's fit for a job.

## Job Description
${jd.slice(0, 3000)}

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

    return NextResponse.json({ success: true, data: result.output as JdMatch5dResult })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
