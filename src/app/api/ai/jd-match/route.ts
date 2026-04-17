export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runJdMatchTask } from '@/lib/ai/taskRunner'

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

    const prompt = `Analyze the match between the following resume and job description.

## Job Description
${jd.slice(0, 3000)}

## Resume
${resumeText.slice(0, 3000)}

Return a JSON object with:
{
  "matchScore": <0-100 number>,
  "roleDetected": "<detected job role>",
  "missingKeywords": ["<keyword1>", ...],
  "presentKeywords": ["<keyword1>", ...]
}`

    const result = await runJdMatchTask(prompt)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, output: result.output, provider: result.provider, model: result.model, latencyMs: result.latencyMs })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
