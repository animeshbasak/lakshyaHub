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
    const { bulletText, jobContext, mode } = body as {
      bulletText: string
      jobContext?: string
      mode?: 'improve' | 'compact' | 'skim'
    }

    if (!bulletText || typeof bulletText !== 'string') {
      return NextResponse.json({ success: false, error: 'bulletText is required' }, { status: 400 })
    }

    const m: 'improve' | 'compact' | 'skim' = mode === 'compact' || mode === 'skim' ? mode : 'improve'

    const VERB_RULES = [
      'ATS verb rules (MANDATORY):',
      '- NEVER start with: Spearheaded, Leveraged, Utilized, Successfully, Responsible for, Helped, Worked on, Assisted, Was part of.',
      '- Pick a verb that matches the real action. Examples by category:',
      '  Built/shipped: Built, Shipped, Launched, Delivered, Released, Deployed, Implemented, Engineered.',
      '  Led/owned: Led, Owned, Directed, Managed, Coordinated, Championed, Drove.',
      '  Designed/architected: Designed, Architected, Modeled, Prototyped, Scoped, Structured.',
      '  Improved/optimized: Improved, Optimized, Reduced, Accelerated, Streamlined, Refactored, Rewrote, Simplified.',
      '  Scaled/migrated: Scaled, Migrated, Consolidated, Unified, Modernized, Hardened, Re-architected.',
      '  Created/introduced: Created, Introduced, Established, Pioneered, Authored, Instituted.',
      '  Analyzed/drove: Analyzed, Identified, Investigated, Diagnosed, Quantified, Benchmarked.',
      '  Automated/integrated: Automated, Integrated, Instrumented, Productionized, Orchestrated.',
      '  Collaborated/mentored: Partnered, Mentored, Reviewed, Enabled, Trained.',
      '- Match verb tense to the existing bullet (past tense for past roles, present tense for current).',
      '- If the original already uses a strong, specific verb, keep it.',
      '- Never reuse the same opening verb as the original when the original verb is weak (Spearheaded/Leveraged/Successfully/Helped).',
    ].join('\n')

    const instruction =
      m === 'compact'
        ? 'Compact this bullet to be ~25% shorter. Preserve every number, metric, percent, acronym, tool name. Drop filler words ("spearheaded", "successfully", "leveraging", "in order to", "resulting in a significant", "utilized"). Keep one clean sentence. If the current verb is weak, swap it for a specific one.'
        : m === 'skim'
          ? 'Skim this bullet to a single ~10-14 word line. Keep the strongest metric and the core action. Remove every qualifier and secondary clause. Never invent numbers. Use a precise action verb, not a generic one.'
          : 'Rewrite this bullet to be more impactful, metrics-driven, and ATS-friendly. Preserve every real number and tool name. Remove filler. The verb must describe the actual action taken — do not default to "Spearheaded" or other generic leadership verbs.'

    const prompt = jobContext
      ? `${instruction}\n\n${VERB_RULES}\n\nJob Context: ${jobContext}\n\nBullet: ${bulletText}\n\nReturn only the rewritten bullet text, no quotes, no leading dash, no explanation.`
      : `${instruction}\n\n${VERB_RULES}\n\nBullet: ${bulletText}\n\nReturn only the rewritten bullet text, no quotes, no leading dash, no explanation.`

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
