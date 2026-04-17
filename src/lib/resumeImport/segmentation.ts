import { collapseHeadingKey, normalizeHeadingText } from './schema';
import { createExtractedBlocksFromRawText } from './extraction';
import type {
  ExtractedResumeBlock,
  ExtractedResumeLine,
  NormalizedHeading,
  ParsedSectionKind,
  ResumeSectionBlock,
  ResumeSectionTraceEntry,
} from './types';

const SECTION_ALIASES: Array<{ kind: ParsedSectionKind; keys: string[] }> = [
  { kind: 'summary', keys: ['summary', 'professionalsummary', 'profile', 'objective'] },
  { kind: 'experience', keys: ['experience', 'workexperience', 'professionalexperience', 'employmenthistory'] },
  { kind: 'education', keys: ['education', 'academicbackground'] },
  { kind: 'skills', keys: ['skills', 'technicalskills', 'coreskills', 'tooling', 'corecompetencies'] },
  { kind: 'sideProjects', keys: ['sideprojects', 'aiprojectsandsidebuilds', 'aiprojectssidebuilds', 'sidebuilds'] },
  { kind: 'projects', keys: ['projects', 'selectedprojects'] },
  { kind: 'ongoingLearning', keys: ['ongoinglearning'] },
  { kind: 'certifications', keys: ['certifications', 'licenses', 'licensesandcertifications'] },
  { kind: 'achievements', keys: ['achievements', 'awards', 'accomplishments'] },
  { kind: 'languages', keys: ['languages'] },
  { kind: 'links', keys: ['links', 'profiles'] },
  { kind: 'contact', keys: ['contact', 'contactinformation'] },
];

function findSectionKindFromKey(key: string): ParsedSectionKind | null {
  for (const alias of SECTION_ALIASES) {
    if (alias.keys.includes(key)) {
      return alias.kind;
    }
  }

  return null;
}

function looksHeadingLike(line: ExtractedResumeLine) {
  const tokenCount = line.tokenCount;
  const shortEnough = line.text.length <= 54;
  const upperish = line.uppercaseRatio >= 0.58 || line.spacedCapsHint;
  const noDate = !/\b(?:19|20)\d{2}\b/.test(line.text);
  const noEmail = !/@/.test(line.text);
  const noUrl = !/\b(?:https?:\/\/|www\.)/i.test(line.text);
  return shortEnough && tokenCount <= 6 && upperish && noDate && noEmail && noUrl;
}

export function detectSectionHeader(line: ExtractedResumeLine): NormalizedHeading | null {
  const normalizedText = normalizeHeadingText(line.text);
  const collapsedKey = collapseHeadingKey(line.text);
  const detectedKind = findSectionKindFromKey(collapsedKey);

  if (!detectedKind && !looksHeadingLike(line)) {
    return null;
  }

  return {
    rawText: line.text,
    normalizedText,
    collapsedKey,
    detectedKind,
    confidence: detectedKind ? 'high' : 'medium',
    blockIndex: line.blockIndex,
    lineIndex: line.lineIndex,
    pageIndex: line.pageIndex,
    reasons: detectedKind
      ? [`Matched heading alias "${collapsedKey}".`]
      : ['Line looked like a heading, but no known section alias matched.'],
  };
}

export function segmentExtractedBlocks(extractedBlocks: ExtractedResumeBlock[]) {
  const normalizedHeadings: NormalizedHeading[] = [];
  const sectionTrace: ResumeSectionTraceEntry[] = [];
  const sections: ResumeSectionBlock[] = [];
  let current: ResumeSectionBlock = {
    kind: 'contact',
    heading: 'Contact',
    lines: [],
    typedLines: [],
    sourceBlockIndexes: [],
  };

  extractedBlocks.forEach((block) => {
    block.lines.forEach((line) => {
      const heading = detectSectionHeader(line);
      if (heading) {
        normalizedHeadings.push(heading);
      }

      if (heading?.detectedKind) {
        if (current.lines.length > 0 || current.sourceBlockIndexes.length > 0) {
          sections.push(current);
        }

        current = {
          kind: heading.detectedKind,
          heading: line.text.replace(/:$/, ''),
          lines: [],
          typedLines: [],
          sourceBlockIndexes: [block.blockIndex],
        };
        sectionTrace.push({
          lineId: line.id,
          text: line.text,
          normalizedHeading: heading.normalizedText,
          detectedKind: heading.detectedKind,
          action: 'start_section',
          activeSection: heading.detectedKind,
          blockIndex: block.blockIndex,
          lineIndex: line.lineIndex,
        });
        return;
      }

      if (!current.sourceBlockIndexes.includes(block.blockIndex)) {
        current.sourceBlockIndexes.push(block.blockIndex);
      }
      current.lines.push(line.text);
      sectionTrace.push({
        lineId: line.id,
        text: line.text,
        normalizedHeading: heading?.normalizedText ?? '',
        detectedKind: heading?.detectedKind ?? null,
        action: heading ? 'heading_like_unclassified' : 'append_line',
        activeSection: current.kind,
        blockIndex: block.blockIndex,
        lineIndex: line.lineIndex,
      });
    });
  });

  if (current.lines.length > 0 || current.sourceBlockIndexes.length > 0) {
    sections.push(current);
  }

  return {
    sections: sections
      .map((section) => ({
        ...section,
        lines: section.lines.filter(Boolean),
      }))
      .filter((section) => section.lines.length > 0 || section.kind === 'contact'),
    normalizedHeadings,
    sectionTrace,
  };
}

export function segmentResumeText(rawText: string): ResumeSectionBlock[] {
  return segmentExtractedBlocks(createExtractedBlocksFromRawText(rawText)).sections;
}
