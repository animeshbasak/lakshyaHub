import * as mammoth from 'mammoth';
import { normalizeLine, normalizeWhitespace } from './schema';
import type {
  ExtractedResumeBlock,
  ExtractedResumeLine,
  ResumeExtractionStage,
  ResumeFileKind,
} from './types';

interface PdfTextItemLike {
  str?: string;
  transform?: number[];
}

function getUppercaseRatio(text: string) {
  const letters = text.match(/[A-Za-z]/g) ?? [];
  if (letters.length === 0) {
    return 0;
  }

  const uppercaseLetters = letters.filter((letter) => letter === letter.toUpperCase()).length;
  return Number((uppercaseLetters / letters.length).toFixed(2));
}

function createExtractedLine(input: {
  text: string;
  pageIndex: number;
  blockIndex: number;
  lineIndex: number;
  xStart?: number;
  xEnd?: number;
  y?: number;
  source: ExtractedResumeLine['source'];
}): ExtractedResumeLine {
  const text = normalizeLine(input.text);
  return {
    id: `line_${input.blockIndex}_${input.lineIndex}_${input.pageIndex}`,
    text,
    normalizedText: text.toLowerCase(),
    pageIndex: input.pageIndex,
    blockIndex: input.blockIndex,
    lineIndex: input.lineIndex,
    xStart: input.xStart ?? 0,
    xEnd: input.xEnd ?? 0,
    y: input.y ?? 0,
    tokenCount: text.split(/\s+/).filter(Boolean).length,
    bulletHint: /^[•\-–—›»·*]\s+/.test(text),
    uppercaseRatio: getUppercaseRatio(text),
    spacedCapsHint: /^(?:[A-Z]\s+){2,}[A-Z]$/.test(text),
    source: input.source,
  };
}

function createExtractedBlock(
  lines: ExtractedResumeLine[],
  blockIndex: number,
  pageIndex: number
): ExtractedResumeBlock {
  return {
    id: `block_${pageIndex}_${blockIndex}`,
    blockIndex,
    pageIndex,
    text: lines.map((line) => line.text).join('\n'),
    lines,
  };
}

function dedupeAdjacentLines(lines: ExtractedResumeLine[]) {
  return lines.filter((line, index) => {
    const previous = lines[index - 1];
    if (!previous) {
      return true;
    }

    return !(previous.text === line.text && previous.pageIndex === line.pageIndex);
  });
}

function splitDocxParagraphIntoLines(paragraph: string) {
  const normalized = normalizeWhitespace(paragraph);
  const pieces = normalized
    .split(/\t+|\n+/)
    .map((line) => normalizeLine(line))
    .filter(Boolean);

  return pieces.length > 0 ? pieces : [normalizeLine(paragraph)].filter(Boolean);
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripHtml(value: string) {
  return decodeHtmlEntities(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+\n/g, '\n')
    .trim();
}

export function createExtractedBlocksFromDocxHtml(html: string) {
  const matches = Array.from(html.matchAll(/<(p|li)[^>]*>([\s\S]*?)<\/\1>/gi));
  const blocks: ExtractedResumeBlock[] = [];
  let blockIndex = 0;
  let listLines: ExtractedResumeLine[] = [];

  const flushList = () => {
    if (listLines.length === 0) return;
    blocks.push(createExtractedBlock(listLines, blockIndex, 0));
    blockIndex += 1;
    listLines = [];
  };

  for (const match of matches) {
    const tag = match[1]?.toLowerCase();
    const content = stripHtml(match[2] ?? '');
    if (!content) continue;

    if (tag === 'li') {
      listLines.push(
        createExtractedLine({
          text: `• ${content}`,
          pageIndex: 0,
          blockIndex,
          lineIndex: listLines.length,
          source: 'docx',
        })
      );
      continue;
    }

    flushList();
    const lines = splitDocxParagraphIntoLines(content).map((text, lineIndex) =>
      createExtractedLine({
        text,
        pageIndex: 0,
        blockIndex,
        lineIndex,
        source: 'docx',
      })
    );
    if (lines.length > 0) {
      blocks.push(createExtractedBlock(lines, blockIndex, 0));
      blockIndex += 1;
    }
  }

  flushList();
  return blocks;
}

export function createExtractedBlocksFromRawText(
  rawText: string,
  source: ExtractedResumeLine['source'] = 'raw_text'
) {
  const paragraphs = rawText
    .replace(/\r/g, '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs.map((paragraph, blockIndex) => {
    const lines = splitDocxParagraphIntoLines(paragraph).map((text, lineIndex) =>
      createExtractedLine({
        text,
        pageIndex: 0,
        blockIndex,
        lineIndex,
        source,
      })
    );

    return createExtractedBlock(lines, blockIndex, 0);
  });
}

interface NormalizedPdfItem {
  text: string;
  xStart: number;
  xEnd: number;
  y: number;
}

// Detect a bimodal x-distribution (2-column layout). Returns a split x or null.
function detectColumnSplit(items: NormalizedPdfItem[]): number | null {
  if (items.length < 12) return null;
  const xs = items.map((i) => i.xStart).sort((a, b) => a - b);
  const minX = xs[0];
  const maxX = xs[xs.length - 1];
  const span = maxX - minX;
  if (span < 120) return null;

  // Build a coarse histogram of 20 bins across the x span.
  const bins = 20;
  const binWidth = span / bins;
  const counts = new Array(bins).fill(0);
  for (const x of xs) {
    const idx = Math.min(bins - 1, Math.max(0, Math.floor((x - minX) / binWidth)));
    counts[idx] += 1;
  }

  // Find the two largest peaks in bin indices; require a clear valley between.
  let peak1 = 0;
  let peak2 = 0;
  for (let i = 1; i < bins; i += 1) {
    if (counts[i] > counts[peak1]) {
      peak2 = peak1;
      peak1 = i;
    } else if (counts[i] > counts[peak2] && i !== peak1) {
      peak2 = i;
    }
  }
  const [left, right] = peak1 < peak2 ? [peak1, peak2] : [peak2, peak1];
  if (right - left < 5) return null;
  const leftCount = counts[left];
  const rightCount = counts[right];
  if (leftCount < 4 || rightCount < 4) return null;

  let valley = left;
  let valleyCount = counts[left];
  for (let i = left + 1; i < right; i += 1) {
    if (counts[i] < valleyCount) {
      valley = i;
      valleyCount = counts[i];
    }
  }
  // Valley must be meaningfully deeper than both peaks.
  if (valleyCount * 2 > Math.min(leftCount, rightCount)) return null;

  return minX + (valley + 0.5) * binWidth;
}

// Reorders items column-major: left column top→bottom, then right column top→bottom.
function reorderByColumns(items: NormalizedPdfItem[], splitX: number): NormalizedPdfItem[] {
  const leftCol = items.filter((it) => it.xStart < splitX);
  const rightCol = items.filter((it) => it.xStart >= splitX);
  const yFirst = (a: NormalizedPdfItem, b: NormalizedPdfItem) => {
    const yDiff = Math.abs(b.y - a.y);
    if (yDiff > 3.5) return b.y - a.y;
    return a.xStart - b.xStart;
  };
  leftCol.sort(yFirst);
  rightCol.sort(yFirst);
  return [...leftCol, ...rightCol];
}

function buildPdfLinesFromItems(items: PdfTextItemLike[], pageIndex: number) {
  const mapped: NormalizedPdfItem[] = items
    .map((item) => ({
      text: item.str ?? '',
      xStart: item.transform?.[4] ?? 0,
      xEnd: (item.transform?.[4] ?? 0) + Math.max(0, String(item.str ?? '').length * 5.4),
      y: item.transform?.[5] ?? 0,
    }))
    .filter((item) => item.text.trim().length > 0);

  const splitX = detectColumnSplit(mapped);
  const normalized = splitX !== null
    ? reorderByColumns(mapped, splitX)
    : mapped.sort((a, b) => {
        const yDiff = Math.abs(b.y - a.y);
        if (yDiff > 3.5) {
          return b.y - a.y;
        }
        return a.xStart - b.xStart;
      });

  const lines: Array<{
    text: string;
    xStart: number;
    xEnd: number;
    y: number;
  }> = [];
  let currentY: number | null = null;
  let currentItems: NormalizedPdfItem[] = [];

  const flush = () => {
    if (currentItems.length === 0) {
      return;
    }

    const text = currentItems.map((item) => item.text).join(' ').replace(/\s+/g, ' ').trim();
    lines.push({
      text,
      xStart: Math.min(...currentItems.map((item) => item.xStart)),
      xEnd: Math.max(...currentItems.map((item) => item.xEnd)),
      y: currentItems[0]?.y ?? 0,
    });
    currentItems = [];
    currentY = null;
  };

  for (const item of normalized) {
    if (currentY === null || Math.abs(currentY - item.y) <= 3.5) {
      currentY = currentY ?? item.y;
      currentItems.push(item);
      continue;
    }

    flush();
    currentY = item.y;
    currentItems.push(item);
  }

  flush();

  return dedupeAdjacentLines(
    lines
      .map((line, index) =>
        createExtractedLine({
          text: line.text,
          pageIndex,
          blockIndex: 0,
          lineIndex: index,
          xStart: line.xStart,
          xEnd: line.xEnd,
          y: line.y,
          source: 'pdf',
        })
      )
      .filter((line) => line.text.length > 0)
  );
}

function groupPdfLinesIntoBlocks(lines: ExtractedResumeLine[]) {
  const blocks: ExtractedResumeBlock[] = [];
  let currentBlockLines: ExtractedResumeLine[] = [];
  let blockIndex = 0;

  const flush = () => {
    if (currentBlockLines.length === 0) {
      return;
    }

    const pageIndex = currentBlockLines[0]?.pageIndex ?? 0;
    blocks.push(
      createExtractedBlock(
        currentBlockLines.map((line, lineIndex) => ({
          ...line,
          blockIndex,
          lineIndex,
        })),
        blockIndex,
        pageIndex
      )
    );
    currentBlockLines = [];
    blockIndex += 1;
  };

  lines.forEach((line, index) => {
    const previous = lines[index - 1];
    if (!previous) {
      currentBlockLines.push(line);
      return;
    }

    const changedPage = previous.pageIndex !== line.pageIndex;
    const yGap = Math.abs(previous.y - line.y);
    const xJump = Math.abs(previous.xStart - line.xStart);
    const blockBreak = changedPage || yGap > 15 || (yGap > 8 && xJump > 50);

    if (blockBreak) {
      flush();
    }

    currentBlockLines.push(line);
  });

  flush();
  return blocks;
}

export function buildPdfExtractedBlocks(pages: Array<{ pageIndex: number; items: PdfTextItemLike[] }>) {
  const lines = pages.flatMap((page) => buildPdfLinesFromItems(page.items, page.pageIndex));
  return groupPdfLinesIntoBlocks(lines);
}

// Top-level section headers we know about. Used for inline-glue detection.
const KNOWN_SECTION_HEADERS = [
  'PROFESSIONAL EXPERIENCE',
  'TECHNICAL SKILLS',
  'CONTINUOUS LEARNING',
  'EDUCATION & CONTINUOUS LEARNING',
  'EDUCATION & LEARNING',
  'AI PRODUCTS & OPEN-SOURCE BUILDS',
  'AI PRODUCTS AND OPEN-SOURCE BUILDS',
  'OPEN-SOURCE BUILDS',
  'PERSONAL PROJECTS',
  'CAREER PATH',
  'EXPERIENCE',
  'EDUCATION',
  'PROJECTS',
  'SIDE PROJECTS',
  'SKILLS',
  'SUMMARY',
  'PROFILE',
  'OBJECTIVE',
  'PHILOSOPHY',
  'CERTIFICATIONS',
  'AWARDS',
  'PUBLICATIONS',
  'LANGUAGES',
  'ACHIEVEMENTS',
  'CONTACT',
  'LINKS',
];

/**
 * Rule-based pre-pass that inserts newline breaks before section/role/project
 * headers that got glued inline to the end of a previous line. This happens
 * when a 2-column PDF is linearized and the text-item gap between the tail of
 * one column and the head of the next column is too small to trigger a
 * line-break in the y-axis grouping.
 *
 * Safe: if the input is already well-formed (headers on their own line), each
 * regex branch still requires the header to be preceded by a sentence-ending
 * punctuation inline, so the pass becomes a no-op.
 */
export function splitInlineHeaders(input: string): string {
  if (!input) return input;

  let text = input;

  // Skip work inside bullet lines: we operate on the whole blob but the
  // heuristics require capitalized phrases to appear AFTER sentence-ending
  // punctuation inline, which bullet lines naturally don't trigger on their
  // own (bullets start at line-head, not after punctuation mid-line).

  // 1) Known section headers glued after sentence-ending punctuation.
  //    Match: "...sentence-end. HEADER" where HEADER is a known uppercase
  //    section name. Insert \n\n before HEADER.
  const headerAlternation = KNOWN_SECTION_HEADERS
    // Longest-first so multi-word phrases win over their prefixes.
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((h) => h.replace(/[&]/g, '\\&').replace(/ /g, '\\s+'))
    .join('|');

  const knownHeaderRe = new RegExp(
    String.raw`([.!?'"\]\)])\s+(${headerAlternation})\b`,
    'g'
  );
  text = text.replace(knownHeaderRe, (_m, punct: string, header: string) => {
    return `${punct}\n\n${header}`;
  });

  // 2) Role/company or project-title pattern:
  //    "...sentence-end. TitleCasePhrase - AnotherPhrase ... 2024 - Present"
  //    or "...sentence-end. TitleCasePhrase · Stack · Stack 2024 - 2025"
  //    Detect a Capitalized multi-word phrase containing ' - ' or ' · '
  //    followed within ~120 chars by a year range or the word Present.
  const titleLike = String.raw`[A-Z][A-Za-z0-9+#.'&/]*(?:\s+[A-Z][A-Za-z0-9+#.'&/-]*){0,4}`;
  const roleProjectRe = new RegExp(
    String.raw`([.!?'"\]\)])\s+(${titleLike}\s+[-·]\s+[A-Z][^\n]{0,120}?(?:\b(?:19|20)\d{2}\b(?:\s*[-–]\s*(?:Present|(?:19|20)\d{2}))?|\bPresent\b))`,
    'g'
  );
  text = text.replace(roleProjectRe, (_m, punct: string, header: string) => {
    return `${punct}\n\n${header}`;
  });

  // 3) Project-title pattern without a year nearby:
  //    "...sentence-end. ProjectName - Descriptor" followed by a tech-stack
  //    line using '·' separators. We detect the stack line existing within
  //    the next ~160 chars.
  const projectTitleRe = new RegExp(
    String.raw`([.!?'"\]\)])\s+(${titleLike}\s+-\s+[A-Z][^\n.]{2,80})(?=\s+[A-Z][A-Za-z0-9+#.]*(?:\s*·\s*[A-Z][A-Za-z0-9+#.]*){1,})`,
    'g'
  );
  text = text.replace(projectTitleRe, (_m, punct: string, header: string) => {
    return `${punct}\n\n${header}`;
  });

  // Collapse any triple+ newlines we may have introduced next to existing ones.
  text = text.replace(/\n{3,}/g, '\n\n');
  return text;
}

// Column-aware plain-text extraction. Preserves per-page column-major ordering.
export async function extractLayoutAwareText(file: File): Promise<string> {
  const pdfjsLib =
    typeof window === 'undefined'
      ? await import(/* webpackIgnore: true */ 'pdfjs-dist/legacy/build/pdf.mjs')
      : await import('pdfjs-dist');
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    verbosity: pdfjsLib.VerbosityLevel.ERRORS,
  }).promise;

  const pages: Array<{ pageIndex: number; items: PdfTextItemLike[] }> = [];
  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push({ pageIndex: i - 1, items: content.items as PdfTextItemLike[] });
  }
  const blocks = buildPdfExtractedBlocks(pages);
  const joined = blocks.map((block) => block.text).join('\n\n').trim();
  return splitInlineHeaders(joined);
}

export function getResumeFileKind(file: File): ResumeFileKind {
  const lowerName = file.name.toLowerCase();

  if (
    file.type === 'application/pdf' ||
    file.type === 'application/octet-stream' ||
    lowerName.endsWith('.pdf')
  ) {
    return 'pdf';
  }

  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    lowerName.endsWith('.docx')
  ) {
    return 'docx';
  }

  if (file.type === 'application/msword' || lowerName.endsWith('.doc')) {
    return 'doc';
  }

  return 'unknown';
}

export function validateResumeFile(file: File) {
  const fileKind = getResumeFileKind(file);

  if (fileKind === 'doc') {
    return 'Legacy .doc files are not supported yet. Please save it as .docx or PDF.';
  }

  if (fileKind === 'unknown') {
    return 'Please upload a PDF or DOCX file.';
  }

  const maxSizeMb = 5;
  if (file.size > maxSizeMb * 1024 * 1024) {
    return `File too large - max ${maxSizeMb}MB.`;
  }

  return null;
}

export async function extractResumeSource(file: File) {
  const validationError = validateResumeFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const fileKind = getResumeFileKind(file);
  const warnings: string[] = [];
  let rawText = '';
  let extractedBlocks: ExtractedResumeBlock[] = [];
  let extraction: ResumeExtractionStage = {
    fileKind,
    inputSignal: fileKind === 'docx' ? 'docx' : fileKind === 'pdf' ? 'machine_pdf' : 'unknown',
    quality: fileKind === 'docx' ? 'high' : 'medium',
    fileName: file.name,
    warnings,
  };

  if (fileKind === 'pdf') {
    const pdfjsLib =
      typeof window === 'undefined'
        ? await import(/* webpackIgnore: true */ 'pdfjs-dist/legacy/build/pdf.mjs')
        : await import('pdfjs-dist');
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      // Use locally-hosted worker (public/pdf.worker.min.mjs) for reliability
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    }
    const arrayBuffer = await file.arrayBuffer();
    const pdfData = new Uint8Array(arrayBuffer);
    const pdf = await pdfjsLib.getDocument({
      data: pdfData,
      verbosity: pdfjsLib.VerbosityLevel.ERRORS,
    }).promise;
    const pages: Array<{ pageIndex: number; items: PdfTextItemLike[] }> = [];
    let textItemCount = 0;

    for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
      const page = await pdf.getPage(pageIndex);
      const content = await page.getTextContent();
      textItemCount += content.items.length;
      pages.push({
        pageIndex: pageIndex - 1,
        items: content.items as PdfTextItemLike[],
      });
    }

    extractedBlocks = buildPdfExtractedBlocks(pages);
    rawText = extractedBlocks.map((block) => block.text).join('\n\n').trim();

    // Inline-header split pre-pass: repairs 2-column linearized text where
    // section/role/project headers glued to the previous sentence. If the
    // pass actually introduced new line breaks, re-segment blocks from the
    // repaired text so downstream segmentation sees proper boundaries.
    const repaired = splitInlineHeaders(rawText);
    if (repaired !== rawText) {
      rawText = repaired;
      extractedBlocks = createExtractedBlocksFromRawText(rawText, 'pdf');
    }

    const scanned = rawText.length < 80 || textItemCount < 12;

    extraction = {
      ...extraction,
      pageCount: pdf.numPages,
      inputSignal: scanned ? 'scanned_pdf' : 'machine_pdf',
      quality: scanned ? 'low' : 'medium',
    };

    if (scanned) {
      warnings.push('This PDF looks scanned or image-based. Parsing quality may be limited and sections should be reviewed carefully.');
    }
  } else {
    const arrayBuffer = await file.arrayBuffer();
    const [result, htmlResult] = await Promise.all([
      mammoth.extractRawText({ arrayBuffer }),
      mammoth.convertToHtml({ arrayBuffer }),
    ]);
    rawText = result.value.replace(/\r/g, '').trim();

    // Apply the same inline-header split pre-pass PDF uses. DOCX rarely has
    // glued-header issues, but when resumes are exported from design tools
    // (Canva, Figma → DOCX) the paragraph breaks can disappear. Safe no-op on
    // well-formed DOCX.
    const repairedDocx = splitInlineHeaders(rawText);
    if (repairedDocx !== rawText) {
      rawText = repairedDocx;
    }

    extractedBlocks = createExtractedBlocksFromDocxHtml(htmlResult.value);
    if (extractedBlocks.length === 0) {
      extractedBlocks = createExtractedBlocksFromRawText(rawText, 'docx');
    } else {
      // Re-segment blocks from the (possibly) repaired rawText so downstream
      // segmentation sees proper boundaries when mammoth glued paragraphs.
      if (repairedDocx !== rawText || /[.!?]\s+[A-Z]{3,}/.test(rawText)) {
        const fromText = createExtractedBlocksFromRawText(rawText, 'docx');
        if (fromText.length > extractedBlocks.length) {
          extractedBlocks = fromText;
        }
      }
    }

    extraction.quality = rawText.length > 120 ? 'high' : 'medium';
  }

  if (!rawText.trim()) {
    throw new Error('No text could be extracted from this file.');
  }

  return {
    extraction,
    rawText,
    extractedBlocks,
  };
}
