import { mapParsedResumeToBuilder } from './builderMapping';
import { createExtractedBlocksFromRawText } from './extraction';
import { parseResumeArtifacts } from './parserCore';
import type {
  ParseConfidence,
  ParsedResumeBasics,
  ParsedResumeExperienceItem,
  ParsedSectionKind,
  ResumeExtractionStage,
  ResumeFileKind,
} from './types';

export interface ParserExpectedExperienceNode {
  role?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
}

export interface ParserFixtureExpectation {
  sections?: ParsedSectionKind[];
  experienceCount?: number;
  experience?: ParserExpectedExperienceNode[];
  basics?: Partial<ParsedResumeBasics>;
  educationCount?: number;
  skillsIncludes?: string[];
  projectsCount?: number;
}

export interface ParserEvaluationMetrics {
  contactExtractionAccuracy: number | null;
  experienceEntryCountAccuracy: number | null;
  roleCompanyDateGroupingAccuracy: number | null;
  sectionSegmentationAccuracy: number | null;
  bulletPreservationQuality: number;
  skillsExtractionAccuracy: number | null;
  falseConfidentWrongMapping: boolean;
  unclassifiedRate: number;
}

export interface ParserConfidenceDebug {
  currentConfidence: ParseConfidence;
  reasons: string[];
  blindSpots: string[];
}

export interface ParserFixtureEvaluation {
  fixtureId: string;
  fileName: string;
  fileKind: ResumeFileKind;
  extraction: ResumeExtractionStage;
  metrics: ParserEvaluationMetrics;
  confidence: ParserConfidenceDebug;
  debug: {
    sections: Array<{
      kind: ParsedSectionKind;
      heading: string;
      lineCount: number;
    }>;
    experienceGrouping: {
      groups: string[][];
      trace: Array<{
        action: string;
        reason: string;
        text: string;
      }>;
    } | null;
    parsed: ReturnType<typeof parseResumeArtifacts>['parsed'];
    builderPayload: ReturnType<typeof mapParsedResumeToBuilder>;
    parseDebug: ReturnType<typeof parseResumeArtifacts>['debug'];
  };
}

function ratio(matched: number, total: number) {
  if (total <= 0) {
    return null;
  }

  return Number((matched / total).toFixed(2));
}

function createSyntheticExtractionStage(fileName: string, fileKind: ResumeFileKind): ResumeExtractionStage {
  return {
    fileKind,
    inputSignal: fileKind === 'pdf' ? 'machine_pdf' : fileKind === 'docx' ? 'docx' : 'unknown',
    quality: fileKind === 'pdf' ? 'medium' : 'high',
    fileName,
    warnings: [],
  };
}

function getContactExtractionAccuracy(
  basics: ReturnType<typeof parseResumeArtifacts>['parsed']['basics'],
  expected?: Partial<ParsedResumeBasics>
) {
  if (!expected) {
    return null;
  }

  const fields = Object.entries(expected).filter(([, value]) => typeof value === 'string' && value.trim().length > 0);
  const matched = fields.filter(([key, value]) => {
    const actual = basics[key as keyof ParsedResumeBasics] ?? '';
    return actual.toLowerCase().includes(String(value).toLowerCase());
  }).length;

  return ratio(matched, fields.length);
}

function getSectionSegmentationAccuracy(actual: ParsedSectionKind[], expected?: ParsedSectionKind[]) {
  if (!expected || expected.length === 0) {
    return null;
  }

  const matched = expected.filter((section) => actual.includes(section)).length;
  return ratio(matched, expected.length);
}

function getBulletPreservationQuality(parsed: ReturnType<typeof parseResumeArtifacts>['parsed']) {
  const totalExperienceEntries = parsed.experience.length || 1;
  const entriesWithBullets = parsed.experience.filter((item) => item.bullets.length > 0).length;
  return Number((entriesWithBullets / totalExperienceEntries).toFixed(2));
}

function getExperienceGroupingAccuracy(
  actual: ParsedResumeExperienceItem[],
  expected?: ParserExpectedExperienceNode[]
) {
  if (!expected || expected.length === 0) {
    return null;
  }

  let checks = 0;
  let matched = 0;

  expected.forEach((expectedEntry, index) => {
    const actualEntry = actual[index];
    if (!actualEntry) {
      checks += Object.values(expectedEntry).filter(Boolean).length;
      return;
    }

    (['role', 'company', 'location', 'startDate', 'endDate'] as const).forEach((field) => {
      const expectedValue = expectedEntry[field];
      if (!expectedValue) {
        return;
      }

      checks += 1;
      const actualValue = actualEntry[field] || '';
      if (actualValue.toLowerCase().includes(expectedValue.toLowerCase())) {
        matched += 1;
      }
    });
  });

  return ratio(matched, checks);
}

function getSkillsExtractionAccuracy(parsedSkills: string[], expectedSkills?: string[]) {
  if (!expectedSkills || expectedSkills.length === 0) {
    return null;
  }

  const actualLower = parsedSkills.map((skill) => skill.toLowerCase());
  const matched = expectedSkills.filter((skill) =>
    actualLower.includes(skill.toLowerCase())
  ).length;

  return ratio(matched, expectedSkills.length);
}

function getConfidenceDebug(
  confidence: ParseConfidence,
  reasons: ReturnType<typeof parseResumeArtifacts>['debug']['confidenceReasons'],
  expectation?: ParserFixtureExpectation,
  parsed?: ReturnType<typeof parseResumeArtifacts>['parsed']
): ParserConfidenceDebug {
  const blindSpots: string[] = [];

  if (reasons.length === 0) {
    blindSpots.push('No structural confidence reasons were emitted.');
  }

  const falseConfidentWrongMapping = Boolean(
    expectation?.experienceCount !== undefined &&
      confidence !== 'low' &&
      parsed &&
      parsed.experience.length !== expectation.experienceCount
  );

  if (falseConfidentWrongMapping) {
    blindSpots.push('Confidence remained above low even though experience entry count missed the expected structure.');
  }

  return {
    currentConfidence: confidence,
    reasons: reasons.map((reason) => reason.message),
    blindSpots,
  };
}

export function evaluateRawResumeFixture(input: {
  fixtureId: string;
  fileName: string;
  fileKind: ResumeFileKind;
  rawText: string;
  extraction?: ResumeExtractionStage;
  expectation?: ParserFixtureExpectation;
}) {
  const extraction = input.extraction || createSyntheticExtractionStage(input.fileName, input.fileKind);
  const result = parseResumeArtifacts({
    extraction,
    rawText: input.rawText,
    extractedBlocks: createExtractedBlocksFromRawText(input.rawText, input.fileKind === 'pdf' ? 'pdf' : 'docx'),
  });
  const builderPayload = mapParsedResumeToBuilder(result);
  const metrics: ParserEvaluationMetrics = {
    contactExtractionAccuracy: getContactExtractionAccuracy(result.parsed.basics, input.expectation?.basics),
    experienceEntryCountAccuracy:
      input.expectation?.experienceCount !== undefined
        ? ratio(result.parsed.experience.length === input.expectation.experienceCount ? 1 : 0, 1)
        : null,
    roleCompanyDateGroupingAccuracy: getExperienceGroupingAccuracy(
      result.parsed.experience,
      input.expectation?.experience
    ),
    sectionSegmentationAccuracy: getSectionSegmentationAccuracy(
      result.sections.map((section) => section.kind),
      input.expectation?.sections
    ),
    bulletPreservationQuality: getBulletPreservationQuality(result.parsed),
    skillsExtractionAccuracy: getSkillsExtractionAccuracy(result.parsed.skills.core, input.expectation?.skillsIncludes),
    falseConfidentWrongMapping: Boolean(
      input.expectation?.experienceCount !== undefined &&
        result.confidence !== 'low' &&
        result.parsed.experience.length !== input.expectation.experienceCount
    ),
    unclassifiedRate: Number(
      (
        result.parsed.unclassified.length /
        Math.max(1, result.debug.typedLines.length)
      ).toFixed(2)
    ),
  };

  return {
    fixtureId: input.fixtureId,
    fileName: input.fileName,
    fileKind: input.fileKind,
    extraction: result.extraction,
    metrics,
    confidence: getConfidenceDebug(
      result.confidence,
      result.debug.confidenceReasons,
      input.expectation,
      result.parsed
    ),
    debug: {
      sections: result.sections.map((section) => ({
        kind: section.kind,
        heading: section.heading,
        lineCount: section.lines.length,
      })),
      experienceGrouping: result.sections.some((section) => section.kind === 'experience')
        ? {
            groups: result.parsed.experience.map((entry) =>
              [entry.role, entry.company, entry.location, entry.startDate, entry.endDate, ...entry.bullets].filter(Boolean)
            ),
            trace: result.debug.experienceTrace.map((event) => ({
              action: event.action,
              reason: event.reason,
              text: event.text,
            })),
          }
        : null,
      parsed: result.parsed,
      builderPayload,
      parseDebug: result.debug,
    },
  } satisfies ParserFixtureEvaluation;
}
