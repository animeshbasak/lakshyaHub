import { aiRouter } from './router';
import {
  validateBulletRewriteOutput,
  validateJdMatchOutput,
  validateJdMatch5dOutput,
  validateCoverLetterDraftOutput,
  validateInterviewPrepOutput,
  validateProfileSummaryGenOutput,
  validateResumeImportParseOutput,
  validateJobStructureOutput,
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

export async function runJobStructureTask(title: string, company: string, description: string): Promise<AiResponse> {
  const prompt = `Extract structured metadata from this job posting.

Title: ${title}
Company: ${company}
Description:
${description.slice(0, 2000)}

Return ONLY valid JSON (no markdown):
{
  "seniority": "<junior|mid|senior|lead|staff|principal>",
  "remote_type": "<remote|hybrid|onsite>",
  "tech_stack": ["<tech1>", "<tech2>"],
  "salary_min": <number or null>,
  "salary_max": <number or null>,
  "salary_currency": "<INR|USD|null>",
  "archetype": "<engineering|product|design|data|devops|ai-ml|sales|other>"
}`;
  return await aiRouter.execute({
    task: 'job_structure',
    input: { prompt },
    validate: validateJobStructureOutput,
    maxTokens: 400,
    temperature: 0.1,
  });
}

export async function runResumeImportParseTask(rawText: string): Promise<AiResponse> {
  const prompt = `Extract structured resume data from the following resume text.

## Resume Text
${rawText.slice(0, 10000)}

Return a JSON object with this exact structure (omit any field you cannot determine):
{
  "basics": {
    "name": "", "title": "", "email": "", "phone": "",
    "location": "", "linkedin": "", "github": "", "portfolio": ""
  },
  "summary": "",
  "experience": [
    {
      "company": "", "role": "", "location": "",
      "startDate": "", "endDate": "",
      "bullets": ["<achievement or responsibility>"]
    }
  ],
  "education": [
    { "institution": "", "degree": "", "field": "", "startDate": "", "endDate": "", "score": "" }
  ],
  "skills": {
    "core": ["<skill>"],
    "grouped": [{ "category": "<category>", "values": ["<skill>"] }]
  },
  "sideProjects": [
    { "name": "", "description": "", "technologies": [], "link": "", "bullets": [] }
  ]
}

Rules:
- Return ONLY valid JSON, no markdown fences.
- For experience bullets, each bullet is a separate string in the array.
- Dates should be in "Mon YYYY" format or "YYYY" if only year available.
- VERBATIM POLICY: Copy bullets, metrics, numbers, percentages, dates, and company names EXACTLY as they appear in the source. Do NOT paraphrase, summarize, translate, or "clean up" wording. Preserve punctuation inside bullets.
- COMPLETENESS: Extract EVERY experience entry, every bullet, every project — even if headings look unusual (e.g. "Professional Journey", "Engagements", "What I've Built"). Missing bullets is a failure; duplicating bullets is also a failure.
- Section headings may be multi-column or out of order due to PDF layout. Group by employer/role regardless of positional noise.
- GLUED HEADERS: Input text may have headers glued inline directly after sentence-ending punctuation (e.g., "...cron-scheduled at 7 PM IST. SuperAgent - Claude Code Skill Routing System"). Treat a Capitalized phrase followed by ' - ' or ' · ' then another phrase — optionally followed within ~120 chars by a year range ("2023 - 2025") or "Present" — as a NEW entry boundary (role or project). Do NOT drop entries just because blank lines are missing. Also treat known uppercase section names ("EXPERIENCE", "EDUCATION", "PROJECTS", "TECHNICAL SKILLS", "CONTINUOUS LEARNING", etc.) appearing mid-sentence as section boundaries.
- For each experience entry, if you are not confident in the role/company pairing, still include the entry but leave the lower-confidence field empty rather than guessing.
- Confidence: append a top-level "_confidence" field { "basics": 0..1, "experience": 0..1, "education": 0..1, "skills": 0..1 } reflecting your self-assessed certainty per section.`;
  return await aiRouter.execute({
    task: 'resume_import_parse',
    input: { prompt },
    validate: validateResumeImportParseOutput,
    maxTokens: 3000,
    temperature: 0.1,
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
