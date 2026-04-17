export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runBulletRewriteTask } from '@/lib/ai/taskRunner'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { bulletText, jobContext } = body as { bulletText: string; jobContext?: string }

    if (!bulletText || typeof bulletText !== 'string') {
      return NextResponse.json({ success: false, error: 'bulletText is required' }, { status: 400 })
    }

    const prompt = jobContext
      ? `Rewrite the following resume bullet point to be more impactful and metrics-driven.\n\nJob Context: ${jobContext}\n\nBullet: ${bulletText}\n\nReturn only the improved bullet text.`
      : `Rewrite the following resume bullet point to be more impactful and metrics-driven.\n\nBullet: ${bulletText}\n\nReturn only the improved bullet text.`

    const result = await runBulletRewriteTask(prompt)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, improved: result.output })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
