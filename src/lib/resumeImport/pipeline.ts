import type { ResumeData, SkillRow } from '@/types';
import { extractResumeSource } from './extraction';
import { mapParsedResumeToBuilder } from './builderMapping';
import { parseResumeArtifacts } from './parserCore';
import type { ParseConfidence, ParsedSectionKind } from './types';
import type { ParsedResumeSchema } from './types';

const DEBUG = (() => {
  try {
    return Boolean(
      (typeof process !== 'undefined' &&
        (process.env?.NEXT_PUBLIC_DEBUG_RESUME_IMPORT === '1' ||
          process.env?.NEXT_PUBLIC_DEBUG_RESUME_IMPORT === 'true'))
    );
  } catch {
    return false;
  }
})();

function debugLog(stage: string, payload: Record<string, unknown>) {
  if (!DEBUG) return;
  // eslint-disable-next-line no-console
  console.log(`[resumeImport:${stage}]`, payload);
}

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

// Merges AI-parsed fields into rule-based result.
// Policy:
//   - basics: AI fills any empty slot; also overrides when rule-based captured
//     the wrong thing (e.g. an intro sentence instead of a name).
//   - experience: AI wins when rule-based produced 0 entries or when an entry
//     has no bullets. We never silently drop rule-based entries that AI did
//     not reproduce — we keep whichever has more entries.
//   - education / skills / projects: AI wins only when rule-based is empty.
function mergeAiIntoParsed(base: ParsedResumeSchema, ai: Partial<ParsedResumeSchema>): ParsedResumeSchema {
  const merged: ParsedResumeSchema = {
    ...base,
    basics: { ...base.basics },
    skills: { ...base.skills, core: [...base.skills.core], grouped: [...base.skills.grouped], raw: [...base.skills.raw] },
    experience: [...base.experience],
    education: [...base.education],
    projects: [...base.projects],
    sideProjects: [...base.sideProjects],
    certifications: [...base.certifications],
    achievements: [...base.achievements],
    languages: [...base.languages],
    ongoingLearning: [...base.ongoingLearning],
    unclassified: [...base.unclassified],
  };

  const basicsLooksBroken = (value: string) =>
    !value ||
    value.length > 80 ||
    /[.!?]$/.test(value.trim()) ||
    /\s(and|the|with|using)\s/i.test(value);

  if (ai.basics) {
    merged.basics = {
      name: basicsLooksBroken(base.basics.name) && ai.basics.name ? ai.basics.name : (base.basics.name || ai.basics.name || ''),
      title: base.basics.title || ai.basics.title || '',
      email: base.basics.email || ai.basics.email || '',
      phone: base.basics.phone || ai.basics.phone || '',
      location: base.basics.location || ai.basics.location || '',
      linkedin: base.basics.linkedin || ai.basics.linkedin || '',
      github: base.basics.github || ai.basics.github || '',
      portfolio: base.basics.portfolio || ai.basics.portfolio || '',
    };
  }

  if (!base.summary.trim() && ai.summary) {
    merged.summary = ai.summary;
  }

  // Experience merge: prefer AI when rule-based produced fewer entries,
  // otherwise backfill bullets/fields per-entry.
  if (ai.experience?.length) {
    if (!base.experience.length || ai.experience.length > base.experience.length) {
      merged.experience = ai.experience;
    } else {
      merged.experience = base.experience.map((entry, i) => {
        const aiEntry = ai.experience?.[i];
        if (!aiEntry) return entry;
        const bulletsEmpty = entry.bullets.length === 0 || entry.bullets.every((b) => !b.trim());
        return {
          role: entry.role || aiEntry.role || '',
          company: entry.company || aiEntry.company || '',
          location: entry.location || aiEntry.location || '',
          startDate: entry.startDate || aiEntry.startDate || '',
          endDate: entry.endDate || aiEntry.endDate || '',
          bullets: bulletsEmpty && aiEntry.bullets?.length ? aiEntry.bullets : entry.bullets,
        };
      });
    }
  }

  if (!base.education.length && ai.education?.length) {
    merged.education = ai.education.map((item) => ({ ...item, location: item.location ?? '' }));
  }

  if (!base.skills.core.length && ai.skills?.core?.length) {
    merged.skills.core = ai.skills.core;
  }
  if (!base.skills.grouped.length && ai.skills?.grouped?.length) {
    merged.skills.grouped = ai.skills.grouped;
  }

  if (!base.projects.length && ai.sideProjects?.length) {
    // AI schema uses sideProjects; surface them into projects when rule-based
    // found nothing structured for either bucket.
    if (!base.sideProjects.length) {
      merged.sideProjects = ai.sideProjects;
    }
  } else if (!base.sideProjects.length && ai.sideProjects?.length) {
    merged.sideProjects = ai.sideProjects;
  }

  return merged;
}

export interface AiEnhanceResult {
  parsed: ParsedResumeSchema;
  aiApplied: boolean;
  aiError?: string;
}

async function tryAiEnhanceParse(rawText: string, parsed: ParsedResumeSchema): Promise<AiEnhanceResult> {
  if (!rawText || rawText.trim().length < 100) {
    return { parsed, aiApplied: false, aiError: 'Raw text too short for AI enhancement.' };
  }

  try {
    debugLog('ai:request', { chars: rawText.length });
    const res = await fetch('/api/ai/resume-import-parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText }),
    });

    const json = await res.json().catch(() => ({ success: false, error: 'Malformed AI response.' }));

    if (!res.ok) {
      const message = (json as { error?: string })?.error ?? `AI request failed with HTTP ${res.status}.`;
      debugLog('ai:http_error', { status: res.status, message });
      return { parsed, aiApplied: false, aiError: message };
    }

    if (!json.success || !json.data || typeof json.data !== 'object') {
      const message = (json as { error?: string })?.error ?? 'AI returned no usable data.';
      debugLog('ai:empty', { message });
      return { parsed, aiApplied: false, aiError: message };
    }

    const ai = json.data as Partial<ParsedResumeSchema>;
    debugLog('ai:ok', {
      hasBasics: Boolean(ai.basics),
      experienceCount: ai.experience?.length ?? 0,
      educationCount: ai.education?.length ?? 0,
      skillsCore: ai.skills?.core?.length ?? 0,
      sideProjects: ai.sideProjects?.length ?? 0,
    });
    const merged = mergeAiIntoParsed(parsed, ai);
    return { parsed: merged, aiApplied: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI request errored.';
    debugLog('ai:exception', { message });
    return { parsed, aiApplied: false, aiError: message };
  }
}

export async function parseResumeFile(file: File) {
  let extracted: Awaited<ReturnType<typeof extractResumeSource>>

  try {
    extracted = await extractResumeSource(file)
    debugLog('extract', {
      fileKind: extracted.extraction.fileKind,
      quality: extracted.extraction.quality,
      inputSignal: extracted.extraction.inputSignal,
      rawTextChars: extracted.rawText.length,
      blocks: extracted.extractedBlocks.length,
    })
  } catch (err) {
    throw new ResumeImportError(
      err instanceof Error && err.message
        ? err.message
        : `Could not extract text from file "${file.name}". Make sure it is a valid PDF or DOCX.`,
      'extraction',
      err
    )
  }

  try {
    const result = parseResumeArtifacts(extracted);
    debugLog('parse:rule_based', {
      experience: result.parsed.experience.length,
      education: result.parsed.education.length,
      skills: result.parsed.skills.core.length,
      projects: result.parsed.projects.length + result.parsed.sideProjects.length,
      confidence: result.confidence,
      basics: {
        name: Boolean(result.parsed.basics.name),
        email: Boolean(result.parsed.basics.email),
        phone: Boolean(result.parsed.basics.phone),
      },
    });

    const enhancement = await tryAiEnhanceParse(result.rawText, result.parsed);
    debugLog('parse:after_ai', {
      aiApplied: enhancement.aiApplied,
      aiError: enhancement.aiError,
      experience: enhancement.parsed.experience.length,
      education: enhancement.parsed.education.length,
      skills: enhancement.parsed.skills.core.length,
    });

    const extractionWithAiWarnings = enhancement.aiError
      ? {
          ...result.extraction,
          warnings: [
            ...result.extraction.warnings,
            `AI enhancement skipped: ${enhancement.aiError}`,
          ],
        }
      : result.extraction;

    return {
      ...result,
      extraction: extractionWithAiWarnings,
      parsed: enhancement.parsed,
    };
  } catch (err) {
    throw new ResumeImportError(
      'Resume text was extracted but could not be structured. Try re-saving your file and uploading again.',
      'parsing',
      err
    )
  }
}
