export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenAI } from '@google/genai'
import { createClient } from '@/lib/supabase/server'
import { runEvaluation, type LLMFn } from '@/lib/careerops/evaluator'

const BodySchema = z.object({
  jdText: z.string().min(50),
  jdUrl: z.string().url().optional(),
  cvId: z.string().uuid().optional(),
  provider: z.enum(['claude', 'gemini']).default('claude'),
})

const claudeLLM: LLMFn = async (system, user) => {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system,
    messages: [{ role: 'user', content: user }],
  })
  const block = resp.content[0]
  return block.type === 'text' ? block.text : ''
}

const geminiLLM: LLMFn = async (system, user) => {
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
  const resp = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: user,
    config: {
      systemInstruction: system,
      temperature: 0.4,
      maxOutputTokens: 8192,
    },
  })
  return resp.text ?? ''
}

export async function POST(req: NextRequest) {
  const parsed = BodySchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 })
  }
  const body = parsed.data

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  // Load CV (active by default, or by cvId)
  const cvQuery = body.cvId
    ? supabase.from('cv_documents').select('markdown').eq('id', body.cvId).single()
    : supabase.from('cv_documents').select('markdown').eq('user_id', user.id).eq('is_active', true).single()
  const { data: cv } = await cvQuery
  if (!cv?.markdown) return NextResponse.json({ error: 'no active CV' }, { status: 400 })

  // Load profile narrative
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('narrative')
    .eq('user_id', user.id)
    .single()

  const result = await runEvaluation(
    {
      jdText: body.jdText,
      cvMarkdown: cv.markdown as string,
      userProfile: (profile?.narrative as string | undefined) ?? '',
    },
    { llm: body.provider === 'gemini' ? geminiLLM : claudeLLM }
  )

  // Persist
  const { data: saved, error } = await supabase.from('evaluations').insert({
    user_id: user.id,
    jd_url: body.jdUrl,
    jd_text: body.jdText,
    company: result.summary?.company,
    role: result.summary?.role,
    archetype: result.summary?.archetype,
    score: result.summary?.score,
    legitimacy_tier: result.summary?.legitimacy,
    report_md: result.report,
    blocks_json: { summary: result.summary },
    prompt_version: result.promptVersion,
    llm_provider: body.provider,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ evaluation: saved })
}
