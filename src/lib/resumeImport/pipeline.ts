import type { ResumeData, SkillRow } from '@/types';
import { extractResumeSource } from './extraction';
import { mapParsedResumeToBuilder } from './builderMapping';
import { parseResumeArtifacts } from './parserCore';
import type { ParseConfidence, ParsedSectionKind } from './types';

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
    return parseResumeArtifacts(extracted)
  } catch (err) {
    throw new ResumeImportError(
      'Resume text was extracted but could not be structured. Try re-saving your file and uploading again.',
      'parsing',
      err
    )
  }
}
