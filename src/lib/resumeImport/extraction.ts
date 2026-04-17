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
    bulletHint: /^[•\-*]\s+/.test(text),
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

function buildPdfLinesFromItems(items: PdfTextItemLike[], pageIndex: number) {
  const normalized = items
    .map((item) => ({
      text: item.str ?? '',
      xStart: item.transform?.[4] ?? 0,
      xEnd: (item.transform?.[4] ?? 0) + Math.max(0, String(item.str ?? '').length * 5.4),
      y: item.transform?.[5] ?? 0,
    }))
    .filter((item) => item.text.trim().length > 0)
    .sort((a, b) => {
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
  let currentItems: typeof normalized = [];

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
    const pdfjsLib = await import('pdfjs-dist');
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
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
    extractedBlocks = createExtractedBlocksFromDocxHtml(htmlResult.value);
    if (extractedBlocks.length === 0) {
      extractedBlocks = createExtractedBlocksFromRawText(rawText, 'docx');
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
