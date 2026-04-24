import fs from 'node:fs/promises'
import path from 'node:path'

export type PromptMode =
  | 'oferta'
  | 'ofertas'
  | 'deep'
  | 'pdf'
  | 'latex'
  | 'followup'
  | 'interview-prep'
  | 'patterns'
  | 'contacto'
  | 'apply'
  | 'training'
  | 'project'
  | 'scan'
  | 'pipeline'
  | 'tracker'
  | 'auto-pipeline'

export interface PromptContext {
  mode: PromptMode
  userProfile: string
  cvMarkdown: string
  jdText?: string
}

const PROMPTS_DIR = path.join(process.cwd(), 'src', 'prompts')

const SECTION = (title: string, body: string) => `
═══════════════════════════════════════════════════════
${title}
═══════════════════════════════════════════════════════
${body.trim()}
`

async function readSystemPrompt(mode: PromptMode): Promise<string> {
  const file = path.join(PROMPTS_DIR, 'system', `${mode}.md`)
  try {
    return await fs.readFile(file, 'utf8')
  } catch {
    throw new Error(`Prompt mode not found: ${mode} (expected at ${file})`)
  }
}

async function readShared(): Promise<string> {
  return fs.readFile(path.join(PROMPTS_DIR, 'system', '_shared.md'), 'utf8')
}

export async function composePrompt(ctx: PromptContext): Promise<string> {
  const [shared, modePrompt] = await Promise.all([
    readShared(),
    readSystemPrompt(ctx.mode),
  ])

  const sections: string[] = [
    SECTION('SYSTEM CONTEXT (_shared.md)', shared),
    SECTION(`EVALUATION MODE (${ctx.mode}.md)`, modePrompt),
    SECTION('USER PROFILE', ctx.userProfile),
    SECTION('CANDIDATE CV', ctx.cvMarkdown),
  ]

  if (ctx.jdText) {
    sections.push(SECTION('JOB DESCRIPTION TO EVALUATE', ctx.jdText))
  }

  sections.push(SECTION(
    'OPERATING RULES',
    `1. Generate all blocks A-G in full
2. End output with machine-parseable summary:

---SCORE_SUMMARY---
COMPANY: <name>
ROLE: <title>
SCORE: <X.X/5>
ARCHETYPE: <detected>
LEGITIMACY: <high|caution|suspicious>
---END_SUMMARY---`
  ))

  return sections.join('\n')
}
