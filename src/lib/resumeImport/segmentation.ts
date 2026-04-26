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
  { kind: 'education', keys: ['education', 'academicbackground', 'educationlearning', 'educationcontinuouslearning'] },
  { kind: 'skills', keys: ['skills', 'technicalskills', 'coreskills', 'tooling', 'corecompetencies'] },
  { kind: 'sideProjects', keys: ['sideprojects', 'aiprojectsandsidebuilds', 'aiprojectssidebuilds', 'sidebuilds'] },
  {
    kind: 'projects',
    keys: [
      'projects',
      'selectedprojects',
      'personalprojects',
      'aiproducts',
      'products',
      'aiproductsopensourcebuilds',
      'aiproductsandopensourcebuilds',
      'opensourcebuilds',
      'opensourceprojects',
      'productsandbuilds',
      'projectshighlights',
      'keyprojects',
    ],
  },
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

  // Substring fallback for compound headings like
  // "EDUCATION & CONTINUOUS LEARNING" -> educationcontinuouslearning.
  // Order matters: EDUCATION must be checked BEFORE SKILL so that headings
  // containing both words are not captured by the generic skills matcher.
  if (key.includes('education')) return 'education';
  if (key.includes('sideproject') || key.includes('sidebuild')) return 'sideProjects';
  if (key.includes('project')) return 'projects';
  if (key.includes('opensource') || key.includes('aiproduct') || key.includes('product')) return 'projects';
  if (key.includes('certification') || key.includes('license')) return 'certifications';
  if (key.includes('achievement') || key.includes('award')) return 'achievements';
  if (key.includes('experience') || key.includes('employment')) return 'experience';
  if (key.includes('summary') || key.includes('profile') || key.includes('objective')) return 'summary';
  if (key.includes('skill') || key.includes('competenc') || key.includes('tooling')) return 'skills';
  if (key.includes('language')) return 'languages';
  if (key.includes('contact')) return 'contact';

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

/**
 * Project/role entry-title detector.
 * Matches lines like:
 *   "FRIDAY - Local-First Personal AI Agent"
 *   "SuperAgent - Claude Code Skill Routing System"
 *   "Airtel · Senior Software Engineer"
 * These are per-entry titles, not section headers, but we mark them as
 * heading-like so segmentation tracing captures the boundary and the LLM
 * input preserves them on their own line.
 */
export function looksLikeEntryTitle(line: ExtractedResumeLine): boolean {
  const text = line.text.trim();
  if (text.length < 4 || text.length > 120) return false;
  if (/^[•\-–—›»·*]\s+/.test(text)) return false; // bullet
  if (/@/.test(text) || /\bhttps?:\/\//i.test(text)) return false;
  // <TitleOrCAPS> <sep> <TitleCase phrase>
  const re = /^[A-Z][A-Za-z0-9+#.'&/-]*(?:\s+[A-Za-z0-9+#.'&/-]+){0,3}\s+[-·]\s+[A-Z][A-Za-z0-9+#.'&/ -]{2,}$/;
  return re.test(text);
}

export function detectSectionHeader(line: ExtractedResumeLine): NormalizedHeading | null {
  const normalizedText = normalizeHeadingText(line.text);
  const collapsedKey = collapseHeadingKey(line.text);
  const isHeadingShape = looksHeadingLike(line);
  // Only allow substring-based alias detection when the line looks like a
  // heading. Otherwise the generic "contains skill" / "contains education"
  // rules would match any prose sentence using those words.
  const detectedKind = isHeadingShape
    ? findSectionKindFromKey(collapsedKey)
    : (SECTION_ALIASES.find((alias) => alias.keys.includes(collapsedKey))?.kind ?? null);

  if (!detectedKind && !isHeadingShape && !looksLikeEntryTitle(line)) {
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

  const cleaned = sections
    .map((section) => ({
      ...section,
      lines: section.lines.filter(Boolean),
    }))
    .filter((section) => section.lines.length > 0 || section.kind === 'contact');

  // Merge adjacent sections of the same kind with roughly identical headings.
  // Skip merging for entry-list sections (experience/projects/sideProjects)
  // where duplicate headings can legitimately separate distinct entry clusters.
  const MERGE_SKIP: ReadonlySet<ParsedSectionKind> = new Set([
    'experience',
    'projects',
    'sideProjects',
  ] as ParsedSectionKind[]);
  const merged: ResumeSectionBlock[] = [];
  for (const section of cleaned) {
    const prev = merged[merged.length - 1];
    const sameHeading =
      prev &&
      prev.kind === section.kind &&
      !MERGE_SKIP.has(section.kind) &&
      collapseHeadingKey(prev.heading) === collapseHeadingKey(section.heading);
    if (sameHeading) {
      prev.lines.push(...section.lines);
      prev.typedLines.push(...section.typedLines);
      for (const idx of section.sourceBlockIndexes) {
        if (!prev.sourceBlockIndexes.includes(idx)) {
          prev.sourceBlockIndexes.push(idx);
        }
      }
      continue;
    }
    merged.push(section);
  }

  return {
    sections: merged,
    normalizedHeadings,
    sectionTrace,
  };
}

export function segmentResumeText(rawText: string): ResumeSectionBlock[] {
  return segmentExtractedBlocks(createExtractedBlocksFromRawText(rawText)).sections;
}
