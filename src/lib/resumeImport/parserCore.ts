import type { ExtractedResumeBlock, ResumeExtractionStage, ResumeParseResult } from './types';
import { mapSectionsToParsedResumeDetailed } from './mapping';
import { segmentExtractedBlocks } from './segmentation';
import { validateParsedResume } from './validation';

export function parseResumeArtifacts(input: {
  extraction: ResumeExtractionStage;
  rawText: string;
  extractedBlocks: ExtractedResumeBlock[];
}): ResumeParseResult {
  const segmented = segmentExtractedBlocks(input.extractedBlocks);
  const mapped = mapSectionsToParsedResumeDetailed(segmented.sections);
  const validation = validateParsedResume(mapped.parsed, {
    extraction: input.extraction,
    sections: segmented.sections,
    normalizedHeadings: segmented.normalizedHeadings,
    experienceTrace: mapped.experienceTrace,
    repairTrace: mapped.repairTrace,
    typedLines: mapped.typedLines,
    rawText: input.rawText,
  });

  const warnings = [...input.extraction.warnings];
  if (
    input.extraction.inputSignal === 'machine_pdf' &&
    validation.structuralSummary.headingRecoveryFailures >= 2 &&
    !warnings.some((warning) => /heading recovery/i.test(warning))
  ) {
    warnings.push('Heading recovery was weak for this PDF. Review mapped sections carefully.');
  }

  return {
    extraction: {
      ...input.extraction,
      inputSignal:
        input.extraction.inputSignal === 'machine_pdf' &&
        validation.structuralSummary.headingRecoveryFailures >= 2
          ? 'low_structure_pdf'
          : input.extraction.inputSignal,
      warnings,
    },
    rawText: input.rawText,
    extractedBlocks: input.extractedBlocks,
    sections: segmented.sections,
    parsed: mapped.parsed,
    confidence: validation.confidence,
    reviewBadges: validation.reviewBadges,
    validationIssues: validation.issues,
    detectedSections: segmented.sections.map((section) => section.kind),
    debug: {
      extractedBlocks: input.extractedBlocks,
      normalizedHeadings: segmented.normalizedHeadings,
      typedLines: mapped.typedLines,
      sectionTrace: segmented.sectionTrace,
      experienceTrace: mapped.experienceTrace,
      repairTrace: mapped.repairTrace,
      confidenceReasons: validation.confidenceReasons,
      structuralSummary: validation.structuralSummary,
      completenessSummary: validation.completenessSummary,
    },
  };
}
