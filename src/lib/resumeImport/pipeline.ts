import type { ResumeData, SkillRow } from '@/types';
import { extractResumeSource } from './extraction';
import { mapParsedResumeToBuilder } from './builderMapping';
import { parseResumeArtifacts } from './parserCore';
import type { ParseConfidence, ParsedSectionKind } from './types';
import type { ParsedResumeSchema } from './types';

export interface BuilderImportReviewState {
  confidence: ParseConfidence;
  detectedSections: ParsedSectionKind[];
  reviewBadges: Array<{
    section: string;
    confidence: ParseConfidence;
    message: string;
  }>;
  validationIssues: Array<{
    code: string;
    message: string;
    section: string;
    severity: 'warning' | 'error';
  }>;
  unclassified: string[];
  warnings: string[];
}

export interface BuilderImportPayload {
  header: ResumeData['header'];
  summary: ResumeData['summary'];
  experience: ResumeData['experience'];
  education: ResumeData['education'];
  projects: NonNullable<ResumeData['projects']>;
  skills: SkillRow[];
  competencies: string[];
  referenceText: string;
  importReview: BuilderImportReviewState;
}
export { mapParsedResumeToBuilder } from './builderMapping';

export class ResumeImportError extends Error {
  constructor(
    message: string,
    public readonly stage: 'extraction' | 'parsing' | 'mapping',
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = 'ResumeImportError'
  }
}

// Merges AI-parsed fields into rule-based result. Rule-based wins on non-empty fields; AI fills gaps.
function mergeAiIntoParsed(base: ParsedResumeSchema, ai: Partial<ParsedResumeSchema>): ParsedResumeSchema {
  const merged = { ...base };

  if (ai.basics) {
    merged.basics = {
      name: base.basics.name || ai.basics.name || '',
      title: base.basics.title || ai.basics.title || '',
      email: base.basics.email || ai.basics.email || '',
      phone: base.basics.phone || ai.basics.phone || '',
      location: base.basics.location || ai.basics.location || '',
      linkedin: base.basics.linkedin || ai.basics.linkedin || '',
      github: base.basics.github || ai.basics.github || '',
      portfolio: base.basics.portfolio || ai.basics.portfolio || '',
    };
  }

  if (!base.summary && ai.summary) {
    merged.summary = ai.summary;
  }

  // Fill experience bullets from AI when rule-based missed them
  if (ai.experience?.length) {
    if (!base.experience.length) {
      merged.experience = ai.experience;
    } else {
      merged.experience = base.experience.map((entry, i) => {
        const aiEntry = ai.experience?.[i];
        if (!entry.bullets.length && aiEntry?.bullets?.length) {
          return { ...entry, bullets: aiEntry.bullets };
        }
        return entry;
      });
    }
  }

  if (!base.education.length && ai.education?.length) {
    merged.education = ai.education;
  }

  if (!base.skills.core.length && ai.skills?.core?.length) {
    merged.skills.core = ai.skills.core;
  }
  if (!base.skills.grouped.length && ai.skills?.grouped?.length) {
    merged.skills.grouped = ai.skills.grouped;
  }

  if (!base.sideProjects.length && ai.sideProjects?.length) {
    merged.sideProjects = ai.sideProjects;
  }

  return merged;
}

async function tryAiEnhanceParse(rawText: string, parsed: ParsedResumeSchema): Promise<ParsedResumeSchema> {
  try {
    const res = await fetch('/api/ai/resume-import-parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText }),
    });
    if (!res.ok) return parsed;
    const json = await res.json();
    if (!json.success || !json.data) return parsed;
    return mergeAiIntoParsed(parsed, json.data as Partial<ParsedResumeSchema>);
  } catch {
    return parsed;
  }
}

export async function parseResumeFile(file: File) {
  let extracted: Awaited<ReturnType<typeof extractResumeSource>>

  try {
    extracted = await extractResumeSource(file)
  } catch (err) {
    throw new ResumeImportError(
      `Could not extract text from file "${file.name}". Make sure it is a valid PDF or DOCX.`,
      'extraction',
      err
    )
  }

  try {
    const result = parseResumeArtifacts(extracted);

    if (result.confidence === 'medium' || result.confidence === 'low') {
      const enhanced = await tryAiEnhanceParse(result.rawText, result.parsed);
      return { ...result, parsed: enhanced };
    }

    return result;
  } catch (err) {
    throw new ResumeImportError(
      'Resume text was extracted but could not be structured. Try re-saving your file and uploading again.',
      'parsing',
      err
    )
  }
}
