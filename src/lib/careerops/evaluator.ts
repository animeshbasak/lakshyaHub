import { composePrompt } from './promptLoader'
import { parseScoreSummary, type ScoreSummary } from './parseScoreSummary'

export interface EvaluationInput {
  jdText: string
  cvMarkdown: string
  userProfile: string
}

export interface EvaluationResult {
  report: string
  summary: ScoreSummary | null
  promptVersion: string
}

export type LLMFn = (systemPrompt: string, userPrompt: string) => Promise<string>

export async function runEvaluation(
  input: EvaluationInput,
  opts: { llm: LLMFn; promptVersion?: string }
): Promise<EvaluationResult> {
  const systemPrompt = await composePrompt({
    mode: 'oferta',
    userProfile: input.userProfile,
    cvMarkdown: input.cvMarkdown,
  })

  const userPrompt = `JOB DESCRIPTION TO EVALUATE:\n\n${input.jdText}`

  const report = await opts.llm(systemPrompt, userPrompt)
  const summary = parseScoreSummary(report)

  return {
    report,
    summary,
    promptVersion: opts.promptVersion ?? process.env.CAREEROPS_PROMPT_VERSION ?? '1.0.0',
  }
}
