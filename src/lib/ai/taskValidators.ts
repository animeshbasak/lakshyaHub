export function validateJdMatchOutput(output: unknown) {
  const errors: string[] = [];

  if (!output || typeof output !== 'object') {
    return ['Output must be an object.'];
  }

  const value = output as Record<string, unknown>;

  if (typeof value.matchScore !== 'number') {
    errors.push('matchScore must be a number.');
  }

  if (typeof value.roleDetected !== 'string') {
    errors.push('roleDetected must be a string.');
  }

  if (!Array.isArray(value.missingKeywords)) {
    errors.push('missingKeywords must be an array.');
  }

  if (!Array.isArray(value.presentKeywords)) {
    errors.push('presentKeywords must be an array.');
  }

  return errors;
}

export function validateBulletRewriteOutput(output: unknown) {
  return typeof output === 'string' && output.trim().length > 0
    ? []
    : ['Bullet rewrite output must be a non-empty string.'];
}

export function validateJdMatch5dOutput(output: unknown): string[] {
  if (!output || typeof output !== 'object') {
    return ['Output must be an object.'];
  }
  const v = output as Record<string, unknown>;
  const errors: string[] = [];

  if (!v.dimensions || typeof v.dimensions !== 'object') {
    errors.push('dimensions must be an object.');
  } else {
    const dims = v.dimensions as Record<string, unknown>;
    for (const key of ['skills', 'title', 'seniority', 'location', 'salary']) {
      if (!dims[key] || typeof dims[key] !== 'object') {
        errors.push(`dimensions.${key} must be an object.`);
      } else {
        const d = dims[key] as Record<string, unknown>;
        if (typeof d.score !== 'number') errors.push(`dimensions.${key}.score must be a number.`);
        if (typeof d.note !== 'string') errors.push(`dimensions.${key}.note must be a string.`);
      }
    }
  }
  if (typeof v.overall_score !== 'number') errors.push('overall_score must be a number.');
  if (!['A', 'B', 'C', 'D', 'F'].includes(v.grade as string)) errors.push('grade must be A, B, C, D, or F.');
  if (typeof v.verdict !== 'string') errors.push('verdict must be a string.');
  if (!Array.isArray(v.top_gaps)) errors.push('top_gaps must be an array.');

  return errors;
}

export function validateCoverLetterDraftOutput(output: unknown): string[] {
  return typeof output === 'string' && output.trim().length > 50
    ? []
    : ['Cover letter output must be a non-empty string longer than 50 characters.'];
}

export function validateInterviewPrepOutput(output: unknown): string[] {
  if (!output || typeof output !== 'object') {
    return ['Output must be an object.'];
  }
  const v = output as Record<string, unknown>;
  if (!Array.isArray(v.questions) || v.questions.length === 0) {
    return ['questions must be a non-empty array.'];
  }
  return [];
}

export function validateProfileSummaryGenOutput(output: unknown): string[] {
  return typeof output === 'string' && output.trim().length > 20
    ? []
    : ['Profile summary output must be a non-empty string longer than 20 characters.'];
}

export function validateJobStructureOutput(output: unknown): string[] {
  if (!output || typeof output !== 'object') return ['Output must be an object.'];
  return [];
}

export function validateWritingStyleExtractionOutput(output: unknown): string[] {
  // Detail validation lives in lib/writingStyle/extractStyle.ts via Zod;
  // here we just sanity-check it's an object with the 8 expected keys.
  if (!output || typeof output !== 'object') return ['Output must be an object.'];
  const value = output as Record<string, unknown>;
  const required = [
    'tone',
    'avgSentenceLength',
    'openingPattern',
    'punctuationHabits',
    'vocabularyPrefs',
    'structurePatterns',
    'voiceSignatures',
    'avoidList',
  ];
  const errors: string[] = [];
  for (const key of required) {
    if (!(key in value)) errors.push(`Missing field: ${key}`);
  }
  return errors;
}

export function validateResumeImportParseOutput(output: unknown): string[] {
  if (!output || typeof output !== 'object') {
    return ['Output must be an object.'];
  }
  const v = output as Record<string, unknown>;
  const errors: string[] = [];
  if (v.basics && typeof v.basics !== 'object') errors.push('basics must be an object.');
  if (v.experience && !Array.isArray(v.experience)) errors.push('experience must be an array.');
  if (v.skills && typeof v.skills !== 'object') errors.push('skills must be an object.');
  return errors;
}
