import { aiRouter } from './router';
import {
  validateBulletRewriteOutput,
  validateJdMatchOutput,
  validateJdMatch5dOutput,
  validateCoverLetterDraftOutput,
  validateInterviewPrepOutput,
  validateProfileSummaryGenOutput,
} from './taskValidators';
import type { AiResponse } from './router.types';

export async function runJdMatchTask(prompt: string): Promise<AiResponse> {
  return await aiRouter.execute({
    task: 'jd_match',
    input: { prompt },
    validate: validateJdMatchOutput,
    maxTokens: 1400,
    temperature: 0.2,
  });
}

export async function runBulletRewriteTask(prompt: string): Promise<AiResponse> {
  return await aiRouter.execute({
    task: 'bullet_rewrite',
    input: { prompt },
    validate: validateBulletRewriteOutput,
    maxTokens: 300,
    temperature: 0.3,
  });
}

export async function runJdMatch5dTask(prompt: string): Promise<AiResponse> {
  return await aiRouter.execute({
    task: 'jd_match_5d',
    input: { prompt },
    validate: validateJdMatch5dOutput,
    maxTokens: 1800,
    temperature: 0.2,
  });
}

export async function runCoverLetterDraftTask(
  resumeText: string,
  jd: string,
  jobTitle: string,
  company: string,
): Promise<AiResponse> {
  const prompt = `Write a professional cover letter for the following job application.

## Job
Title: ${jobTitle}
Company: ${company}
Description:
${jd.slice(0, 2000)}

## Candidate Resume
${resumeText.slice(0, 2000)}

Write a compelling, personalized cover letter (3–4 paragraphs). Be specific. Do not use generic filler phrases.`;
  return await aiRouter.execute({
    task: 'cover_letter_draft',
    input: { prompt },
    validate: validateCoverLetterDraftOutput,
    maxTokens: 2000,
    temperature: 0.7,
  });
}

export async function runInterviewPrepTask(
  jd: string,
  jobTitle: string,
  company: string,
): Promise<AiResponse> {
  const prompt = `Generate interview preparation questions for the following job.

## Job
Title: ${jobTitle}
Company: ${company}
Description:
${jd.slice(0, 2000)}

Return a JSON array of 10 interview questions covering: technical skills, behavioral, situational, and role-specific topics.
Format: { "questions": ["<question1>", "<question2>", ...] }`;
  return await aiRouter.execute({
    task: 'interview_prep',
    input: { prompt },
    validate: validateInterviewPrepOutput,
    maxTokens: 1500,
    temperature: 0.5,
  });
}

export async function runProfileSummaryGenTask(resumeText: string): Promise<AiResponse> {
  const prompt = `Generate a concise professional summary for the following resume.

## Resume
${resumeText.slice(0, 3000)}

Write 2–3 sentences highlighting the candidate's key strengths, experience level, and primary skills. Return only the summary text.`;
  return await aiRouter.execute({
    task: 'profile_summary_gen',
    input: { prompt },
    validate: validateProfileSummaryGenOutput,
    maxTokens: 400,
    temperature: 0.4,
  });
}
