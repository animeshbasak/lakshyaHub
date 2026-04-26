import { createEmptyParsedResume, extractEmail, extractPhone, extractUrls, normalizeLine } from './schema';
import type {
  ExperienceDraftNode,
  ExperienceTraceEvent,
  ParserRepairTraceEvent,
  ParsedResumeEducationItem,
  ParsedResumeExperienceItem,
  ParsedResumeProjectItem,
  ParsedResumeSkillGroup,
  ParsedResumeSchema,
  ResumeSectionBlock,
  TypedResumeLine,
} from './types';

const ROLE_KEYWORDS = [
  'engineer',
  'developer',
  'lead',
  'manager',
  'architect',
  'consultant',
  'analyst',
  'designer',
  'specialist',
  'director',
  'intern',
  'owner',
  'founder',
  'scientist',
];

const ACTION_VERBS = [
  'led',
  'serve',
  'served',
  'own',
  'owned',
  'designed',
  'drive',
  'drove',
  'built',
  'contributed',
  'enhanced',
  'collaborated',
  'coordinated',
  'managed',
  'developed',
  'optimized',
  'optimised',
  'identified',
  'resolved',
  'delivered',
  'revamped',
  'strengthened',
  'spearheaded',
  'implemented',
];

const COMPANY_SUFFIX_REGEX =
  /\b(ltd\.?|limited|pvt\.?\s*ltd\.?|private limited|inc\.?|llc|corp\.?|communications|innovations|digital|bank|university|college|solutions|technologies|systems)\b/i;

const DATE_TOKEN_REGEX = /(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|present|current|\d{4})/i;
export const DATE_RANGE_REGEX =
  /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{4}\s*[-–—]\s*(?:present|current|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{4})|\b\d{4}\s*[-–—]\s*(?:present|current|\d{4})/i;

interface ExperienceGroupingTrace {
  groups: string[][];
  trace: ExperienceTraceEvent[];
}

interface MapSectionsDetailedResult {
  parsed: ParsedResumeSchema;
  typedLines: TypedResumeLine[];
  experienceTrace: ExperienceTraceEvent[];
  repairTrace: ParserRepairTraceEvent[];
}

function normalizeDashes(value: string) {
  return value.replace(/[–—]/g, '-');
}

function cleanHeaderValue(value: string) {
  return normalizeLine(value).replace(/^[•\-–—›»·*]\s*/, '').trim();
}

function createDraftNode(): ExperienceDraftNode {
  return {
    role: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    bullets: [],
    headerContext: [],
    rawLines: [],
    flags: [],
  };
}

export function stripBullet(line: string) {
  return line.replace(/^[•\-–—›»·*]\s*/, '').trim();
}

function hasRoleKeyword(line: string) {
  const lower = line.toLowerCase();
  return ROLE_KEYWORDS.some((keyword) => lower.includes(keyword));
}

function startsLikeActionSentence(line: string) {
  const lower = line.toLowerCase();
  return ACTION_VERBS.some((verb) => lower.startsWith(`${verb} `) || lower.startsWith(`${verb}ed `));
}

function looksLikeRoleDateLine(line: string) {
  if (/\s+at\s+/i.test(line) && hasRoleKeyword(line)) {
    return true;
  }

  if (!DATE_RANGE_REGEX.test(line)) {
    return false;
  }

  const match = line.match(DATE_RANGE_REGEX)?.[0] ?? '';
  const beforeDate = cleanHeaderValue(line.replace(match, ''));
  if (!beforeDate || beforeDate.length < 3) {
    return false;
  }

  if (beforeDate.endsWith('.') && !hasRoleKeyword(beforeDate)) {
    return false;
  }

  return hasRoleKeyword(beforeDate) || !COMPANY_SUFFIX_REGEX.test(beforeDate);
}

function looksLikeCompanyLocationLine(line: string) {
  if (DATE_RANGE_REGEX.test(line)) {
    return false;
  }

  if (line.endsWith('.') && !COMPANY_SUFFIX_REGEX.test(line)) {
    return false;
  }

  if (/^[•\-–—›»·*]\s+/.test(line)) {
    return false;
  }

  return COMPANY_SUFFIX_REGEX.test(line) || /[|·]/.test(line);
}

function looksLikeLocationToken(token: string) {
  const trimmed = token.trim();
  if (!trimmed) return false;
  if (/^Remote(?:\s*\([^)]+\))?$/i.test(trimmed)) return true;
  if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}$/.test(trimmed)) return true;
  return false;
}

function splitLeadingLocation(fragment: string) {
  const trimmed = fragment.trim();
  const remoteMatch = trimmed.match(/^(Remote(?:\s*\([^)]+\))?)(?:\s+(.*))?$/i);
  if (remoteMatch) {
    return {
      location: remoteMatch[1].trim(),
      remainder: remoteMatch[2]?.trim() ?? '',
    };
  }

  const tokens = trimmed.split(/\s+/);
  if (tokens.length === 1 && looksLikeLocationToken(tokens[0])) {
    return { location: tokens[0], remainder: '' };
  }

  if (tokens.length > 1 && looksLikeLocationToken(tokens[0])) {
    return {
      location: tokens[0],
      remainder: tokens.slice(1).join(' ').trim(),
    };
  }

  if (tokens.length > 2 && looksLikeLocationToken(tokens.slice(0, 2).join(' '))) {
    return {
      location: tokens.slice(0, 2).join(' ').trim(),
      remainder: tokens.slice(2).join(' ').trim(),
    };
  }

  return { location: '', remainder: trimmed };
}

function parseDateRange(text: string) {
  const match = normalizeDashes(text).match(DATE_RANGE_REGEX)?.[0] ?? '';
  if (!match) {
    return { startDate: '', endDate: '' };
  }

  const normalized = normalizeDashes(match);
  const parts = normalized.split(/\s*-\s*/);
  return {
    startDate: parts[0]?.trim() ?? '',
    endDate: parts.slice(1).join(' - ').trim(),
  };
}

function parseRoleDateLine(text: string) {
  const match = normalizeDashes(text).match(DATE_RANGE_REGEX)?.[0] ?? '';
  const cleaned = cleanHeaderValue(text.replace(match, '')).replace(/[|·-]+$/g, '').trim();
  const [role, company] = cleaned.split(/\s+at\s+/i).map((value) => cleanHeaderValue(value));
  const { startDate, endDate } = parseDateRange(text);
  return {
    role: role ?? cleaned,
    company: company ?? '',
    startDate,
    endDate,
  };
}

function parseCompanyLocationLine(text: string) {
  const normalized = normalizeLine(text);
  const primaryParts = normalized.split(/\s+\|\s+/).map((part) => part.trim()).filter(Boolean);
  const primary = primaryParts.shift() ?? normalized;
  const context: string[] = primaryParts;
  const dotted = primary.split(/\s*[·|]\s*/).map((part) => part.trim()).filter(Boolean);
  const company = dotted.shift() ?? '';
  let location = '';

  for (const fragment of dotted) {
    if (!location) {
      const split = splitLeadingLocation(fragment);
      if (split.location) {
        location = split.location;
        if (split.remainder) {
          context.push(split.remainder);
        }
        continue;
      }
    }

    context.push(fragment);
  }

  return {
    company: cleanHeaderValue(company),
    location: cleanHeaderValue(location),
    headerContext: context
      .map(cleanHeaderValue)
      .filter((fragment) => !looksLikeRoleDateLine(fragment)),
    nextRoleDateLine: context.map(cleanHeaderValue).find((fragment) => looksLikeRoleDateLine(fragment)) ?? '',
  };
}

function looksLikeFakeRole(role: string) {
  if (!role.trim()) return true;
  if (role.endsWith('.')) return true;
  // Only flag as fake when ALL of: no role keyword, short (≤3 tokens), and ALL lowercase.
  // Mixed-case names like "Lakshya Resume (insaneResumake)" are project headers, not fake roles —
  // they are handled separately by looksLikeProjectEntry.
  if (!hasRoleKeyword(role) && role.split(/\s+/).length <= 3 && role === role.toLowerCase()) return true;
  return false;
}

function splitSkillsLine(line: string) {
  const working = line.includes(':') ? line.split(':').slice(1).join(':') : line;
  return working
    .split(/[,|•·]/)
    .map((skill) => normalizeLine(skill))
    .filter(Boolean);
}

function uniqueList(values: string[]) {
  return values.filter((value, index, all) => value && all.findIndex((candidate) => candidate.toLowerCase() === value.toLowerCase()) === index);
}

function containsContactToken(line: string) {
  return Boolean(extractEmail(line) || extractPhone(line) || extractUrls(line).length > 0);
}

function looksLikeEducationLine(line: string) {
  return /\b(b\.tech|m\.tech|bachelor|master|engineering|science|college|university|school|institute|cgpa|gpa|grade|percent)\b/i.test(line);
}

function looksLikeLearningLine(line: string) {
  return /\b(ongoing learning|coursera|in progress|langchain|langgraph|genai|rag|learning path|certification)\b/i.test(line);
}

function extractProjectHeaderCandidate(line: string) {
  const cleaned = cleanHeaderValue(line);
  if (!cleaned || looksLikeEducationLine(cleaned)) {
    return '';
  }

  if (/^ongoing learning$/i.test(cleaned)) {
    return 'Ongoing Learning';
  }

  const headerPattern = /^([A-Za-z][A-Za-z0-9.&()+\-]*(?:\s+[A-Za-z][A-Za-z0-9.&()+\-]*){0,5})\s+((?:19|20)\d{2}\s*-\s*(?:present|current|(?:19|20)\d{2}))$/i;
  const words = cleaned.split(/\s+/);

  for (let startIndex = 0; startIndex <= Math.min(3, Math.max(0, words.length - 2)); startIndex += 1) {
    const candidate = words.slice(startIndex).join(' ');
    const match = candidate.match(headerPattern);
    if (match) {
      return `${cleanHeaderValue(match[1])} ${cleanHeaderValue(match[2])}`.trim();
    }
  }

  return '';
}

function looksLikeProjectHeader(line: string) {
  return Boolean(extractProjectHeaderCandidate(line));
}

function looksLikeTechnologyStackLine(line: string) {
  if (/^[•\-–—›»·*]\s+/.test(line) || DATE_RANGE_REGEX.test(line)) {
    return false;
  }
  // Prose sentences are not tech stack lines — project descriptions often contain
  // tech keywords and commas but are >100 chars of continuous prose
  if (line.length > 100) return false;

  const separators = (line.match(/[·,]/g) ?? []).length;
  const techWords = (line.match(/\b(react|typescript|node|next\.?js|supabase|groq|gemini|claude|llm|api|rest|maps|react native|puppeteer|meta|langchain|langgraph)\b/gi) ?? []).length;
  return separators >= 2 || techWords >= 2;
}

function splitProjectHeader(line: string) {
  const header = extractProjectHeaderCandidate(line);
  const match = header.match(/^(.+?)\s+((?:19|20)\d{2}\s*-\s*(?:present|current|(?:19|20)\d{2}))$/i);
  if (!match) {
    return {
      name: cleanHeaderValue(header || line),
      startDate: '',
      endDate: '',
    };
  }

  const { startDate, endDate } = parseDateRange(match[2]);
  return {
    name: cleanHeaderValue(match[1]),
    startDate,
    endDate,
  };
}

function classifyContactLines(block: ResumeSectionBlock) {
  return block.lines.map((line, index) => {
    let kind: TypedResumeLine['kind'] = 'contact_line';
    const reasons: string[] = [];

    if (index === 0 && !extractEmail(line) && !extractPhone(line) && extractUrls(line).length === 0) {
      kind = 'name_line';
      reasons.push('First contact line without contact tokens.');
    } else if (index <= 1 && !extractEmail(line) && !extractPhone(line) && extractUrls(line).length === 0) {
      kind = 'title_line';
      reasons.push('Early contact line without contact tokens.');
    } else {
      reasons.push('Line contains contact/profile content.');
    }

    return {
      id: `typed_contact_${index}`,
      kind,
      text: line,
      normalizedText: line.toLowerCase(),
      sectionKind: 'contact',
      blockIndex: block.sourceBlockIndexes[0] ?? 0,
      lineIndex: index,
      pageIndex: 0,
      bulletHint: /^[•\-–—›»·*]\s+/.test(line),
      reasons,
    } satisfies TypedResumeLine;
  });
}

function classifyExperienceLines(block: ResumeSectionBlock) {
  const typedLines: TypedResumeLine[] = [];

  block.lines.forEach((line, index) => {
    let kind: TypedResumeLine['kind'] = 'unknown_line';
    const reasons: string[] = [];
    const previous = typedLines[typedLines.length - 1];

    if (/^[•\-–—›»·*]\s+/.test(line)) {
      kind = 'bullet_line';
      reasons.push('Explicit bullet marker.');
    } else if (
      DATE_RANGE_REGEX.test(line) &&
      previous &&
      previous.kind === 'role_date_line' &&
      !DATE_RANGE_REGEX.test(previous.text)
    ) {
      kind = 'role_date_line';
      reasons.push('Date-only continuation for a preceding experience header.');
    } else if (looksLikeRoleDateLine(line)) {
      kind = 'role_date_line';
      reasons.push('Contains a date range and role-like prefix.');
    } else if (looksLikeCompanyLocationLine(line)) {
      kind = 'company_location_line';
      reasons.push('Looks like company/location context.');
    } else if (
      previous &&
      (previous.kind === 'bullet_line' || previous.kind === 'wrapped_bullet_continuation') &&
      !looksLikeRoleDateLine(line) &&
      !looksLikeCompanyLocationLine(line)
    ) {
      kind = 'wrapped_bullet_continuation';
      reasons.push('Continuation of a previous bullet.');
    } else if (startsLikeActionSentence(line) || line.length > 70) {
      kind = 'bullet_line';
      reasons.push('Experience body sentence treated as bullet content.');
    } else {
      reasons.push('Did not match experience header or bullet patterns.');
    }

    typedLines.push({
      id: `typed_experience_${index}`,
      kind,
      text: line,
      normalizedText: line.toLowerCase(),
      sectionKind: 'experience',
      blockIndex: block.sourceBlockIndexes[0] ?? 0,
      lineIndex: index,
      pageIndex: 0,
      bulletHint: /^[•\-–—›»·*]\s+/.test(line),
      reasons,
    });
  });

  return typedLines;
}

function classifySectionLines(block: ResumeSectionBlock): TypedResumeLine[] {
  if (block.kind === 'contact' || block.kind === 'links') {
    return classifyContactLines(block);
  }

  if (block.kind === 'experience') {
    return classifyExperienceLines(block);
  }

  return block.lines.map((line, index) => {
    const kindMap: Record<string, TypedResumeLine['kind']> = {
      summary: 'summary_line',
      skills: 'skills_line',
      education: 'education_line',
      sideProjects: 'project_line',
      projects: 'project_line',
      ongoingLearning: 'project_line',
      certifications: 'unknown_line',
      achievements: 'unknown_line',
      languages: 'unknown_line',
      other: 'unknown_line',
    };

    return {
      id: `typed_${block.kind}_${index}`,
      kind: kindMap[block.kind] ?? 'unknown_line',
      text: line,
      normalizedText: line.toLowerCase(),
      sectionKind: block.kind,
      blockIndex: block.sourceBlockIndexes[0] ?? 0,
      lineIndex: index,
      pageIndex: 0,
      bulletHint: /^[•\-–—›»·*]\s+/.test(line),
      reasons: [`Classified from ${block.kind} section context.`],
    } satisfies TypedResumeLine;
  });
}

function parseNameAndTitle(lines: TypedResumeLine[]) {
  const fallbackTitle = lines.find((line, index) => index > 0 && !containsContactToken(line.text))?.text ?? '';
  return {
    name: lines.find((line) => line.kind === 'name_line')?.text ?? lines[0]?.text ?? '',
    title: lines.find((line) => line.kind === 'title_line')?.text ?? fallbackTitle,
  };
}

function parseContactBlock(parsed: ParsedResumeSchema, block: ResumeSectionBlock) {
  const lines = block.typedLines.length > 0 ? block.typedLines : classifySectionLines(block);
  const joined = lines.map((line) => line.text).join(' | ');
  const { name, title } = parseNameAndTitle(lines);
  parsed.basics.name = parsed.basics.name || name;
  parsed.basics.title = parsed.basics.title || title;
  parsed.basics.email = parsed.basics.email || extractEmail(joined);
  parsed.basics.phone = parsed.basics.phone || extractPhone(joined);

  const urls = extractUrls(joined).filter((url) =>
    !parsed.basics.email || !parsed.basics.email.toLowerCase().includes(url.toLowerCase())
  );
  for (const url of urls) {
    if (!parsed.basics.linkedin && /linkedin/i.test(url)) {
      parsed.basics.linkedin = url;
      continue;
    }

    if (!parsed.basics.github && /github/i.test(url)) {
      parsed.basics.github = url;
      continue;
    }

    if (!parsed.basics.portfolio) {
      parsed.basics.portfolio = url;
    }
  }

  const locationFromMixedContact = lines
    .filter((line) => line.text.includes('|') || extractEmail(line.text) || extractPhone(line.text))
    .flatMap((line) => line.text.split('|'))
    .map((part) => cleanHeaderValue(part))
    .find((part) => part && !extractEmail(part) && !extractPhone(part) && extractUrls(part).length === 0);

  const locationLine = locationFromMixedContact
    ? { text: locationFromMixedContact }
    : lines.find((line) => {
        if (line.text === name || line.text === title) return false;
        return !extractEmail(line.text) && !extractPhone(line.text) && extractUrls(line.text).length === 0;
      });

  if (locationLine) {
    parsed.basics.location = locationLine.text;
  }
}

function parseSummaryBlock(parsed: ParsedResumeSchema, block: ResumeSectionBlock) {
  const nextSummary = block.typedLines.map((line) => line.text).join(' ').trim();
  parsed.summary = [parsed.summary, nextSummary].filter(Boolean).join(' ').trim();
}

function upsertSkillGroup(grouped: ParsedResumeSkillGroup[], category: string, values: string[]) {
  const normalizedCategory = cleanHeaderValue(category || 'General');
  const existing = grouped.find((group) => group.category.toLowerCase() === normalizedCategory.toLowerCase());
  if (existing) {
    existing.values = uniqueList([...existing.values, ...values]);
    return;
  }

  grouped.push({
    category: normalizedCategory,
    values: uniqueList(values),
  });
}

function finalizeExperienceNode(
  node: ExperienceDraftNode | null,
  entries: ParsedResumeExperienceItem[],
  unclassified: string[],
  trace: ExperienceTraceEvent[]
) {
  if (!node) return;

  const normalizedRole = cleanHeaderValue(node.role);
  const normalizedCompany = cleanHeaderValue(node.company);
  const normalizedLocation = cleanHeaderValue(node.location);
  const normalizedBullets = node.bullets.map((bullet) => normalizeLine(bullet)).filter(Boolean);

  const invalidDateSlot = [node.startDate, node.endDate].some((value) => value && !DATE_TOKEN_REGEX.test(value));
  const minimumViable =
    Boolean((normalizedRole || normalizedCompany) && (node.startDate || node.endDate || normalizedBullets.length > 0));

  if (!minimumViable || looksLikeFakeRole(normalizedRole) || invalidDateSlot) {
    unclassified.push(...node.rawLines, ...node.headerContext);
    trace.push({
      action: 'route_unclassified',
      text: node.rawLines.join(' | '),
      reason: 'Entry failed minimum viability or looked structurally unsafe.',
      flags: node.flags,
    });
    return;
  }

  entries.push({
    role: normalizedRole,
    company: normalizedCompany,
    location: normalizedLocation,
    startDate: cleanHeaderValue(node.startDate),
    endDate: cleanHeaderValue(node.endDate),
    bullets: normalizedBullets,
  });
  trace.push({
    action: 'close_entry',
    text: normalizedRole || normalizedCompany,
    reason: 'Finalized a structured experience node.',
    entryIndex: entries.length - 1,
    flags: node.flags,
  });
}

function parseExperienceBlock(block: ResumeSectionBlock) {
  const typedLines = block.typedLines.length > 0 ? block.typedLines : classifySectionLines(block);
  const entries: ParsedResumeExperienceItem[] = [];
  const unclassified: string[] = [];
  const trace: ExperienceTraceEvent[] = [];
  let current: ExperienceDraftNode | null = null;
  let previousHeaderText = '';

  typedLines.forEach((line) => {
    const text = line.text;
    if (line.kind === 'role_date_line') {
      const parsedHeader = parseRoleDateLine(text);

      if (current && !parsedHeader.role && (parsedHeader.startDate || parsedHeader.endDate) && !current.startDate) {
        current.rawLines.push(text);
        current.startDate = parsedHeader.startDate;
        current.endDate = parsedHeader.endDate;
        trace.push({
          action: 'attach_role_date',
          text,
          reason: 'Attached a trailing date-only line to the current entry.',
          lineId: line.id,
        });
        return;
      }

      if (text === previousHeaderText) {
        trace.push({
          action: 'skip_duplicate_header',
          text,
          reason: 'Skipped duplicated adjacent role/date header.',
          lineId: line.id,
        });
        return;
      }

      if (current && (current.role || current.company || current.bullets.length > 0)) {
        finalizeExperienceNode(current, entries, unclassified, trace);
      }

      current = createDraftNode();
      current.rawLines.push(text);
      current.role = parsedHeader.role;
      if (parsedHeader.company) {
        current.company = parsedHeader.company;
      }
      current.startDate = parsedHeader.startDate;
      current.endDate = parsedHeader.endDate;
      previousHeaderText = text;
      trace.push({
        action: 'start_entry',
        text,
        reason: 'Started entry from role/date line.',
        lineId: line.id,
      });
      trace.push({
        action: 'attach_role_date',
        text,
        reason: 'Attached role/date fields to the current entry.',
        lineId: line.id,
      });
      return;
    }

    if (line.kind === 'company_location_line') {
      const parsedHeader = parseCompanyLocationLine(text);

      if (!current) {
        current = createDraftNode();
        trace.push({
          action: 'start_entry',
          text,
          reason: 'Started entry from company/location line because no active entry existed.',
          lineId: line.id,
        });
      } else if ((current.company || current.bullets.length > 0) && current.role) {
        finalizeExperienceNode(current, entries, unclassified, trace);
        current = createDraftNode();
        trace.push({
          action: 'start_entry',
          text,
          reason: 'Started a new entry because a fresh company/location cluster appeared after structured content.',
          lineId: line.id,
        });
      }

      current.rawLines.push(text);
      if (!current.company) {
        current.company = parsedHeader.company;
      } else if (current.company !== parsedHeader.company) {
        current.flags.push('duplicate_company_cluster');
        current.headerContext.push(parsedHeader.company);
      }
      if (!current.location && parsedHeader.location) {
        current.location = parsedHeader.location;
      }
      current.headerContext.push(...parsedHeader.headerContext);
      trace.push({
        action: 'attach_company_location',
        text,
        reason: 'Attached company/location context to the current entry.',
        lineId: line.id,
      });

      if (parsedHeader.nextRoleDateLine) {
        const nextHeader = parseRoleDateLine(parsedHeader.nextRoleDateLine);
        finalizeExperienceNode(current, entries, unclassified, trace);
        current = createDraftNode();
        current.rawLines.push(parsedHeader.nextRoleDateLine);
        current.role = nextHeader.role;
        if (nextHeader.company) {
          current.company = nextHeader.company;
        }
        current.startDate = nextHeader.startDate;
        current.endDate = nextHeader.endDate;
        previousHeaderText = parsedHeader.nextRoleDateLine;
        trace.push({
          action: 'start_entry',
          text: parsedHeader.nextRoleDateLine,
          reason: 'Started a new entry from role/date content split out of a merged company/location line.',
          lineId: line.id,
        });
      }
      return;
    }

    if (line.kind === 'bullet_line') {
      if (!current) {
        unclassified.push(text);
        trace.push({
          action: 'route_unclassified',
          text,
          reason: 'Bullet-like line had no active experience entry.',
          lineId: line.id,
        });
        return;
      }

      current.rawLines.push(text);
      current.bullets.push(stripBullet(text));
      trace.push({
        action: 'attach_bullet',
        text,
        reason: 'Attached body line to current experience entry.',
        lineId: line.id,
      });
      return;
    }

    if (line.kind === 'wrapped_bullet_continuation') {
      if (current?.bullets.length) {
        current.rawLines.push(text);
        current.bullets[current.bullets.length - 1] = `${current.bullets[current.bullets.length - 1]} ${stripBullet(text)}`.trim();
        trace.push({
          action: 'append_bullet_continuation',
          text,
          reason: 'Appended wrapped continuation to previous bullet.',
          lineId: line.id,
        });
        return;
      }
    }

    if (current) {
      current.rawLines.push(text);
      current.headerContext.push(text);
      trace.push({
        action: 'append_header_context',
        text,
        reason: 'Preserved ambiguous experience line as header context instead of forcing a structured field.',
        lineId: line.id,
      });
      return;
    }

    unclassified.push(text);
    trace.push({
      action: 'route_unclassified',
      text,
      reason: 'Ambiguous experience line without an active entry.',
      lineId: line.id,
    });
  });

  finalizeExperienceNode(current, entries, unclassified, trace);

  return { entries, unclassified, trace };
}

function parseEducationEntry(lines: string[]): ParsedResumeEducationItem {
  const joined = lines.join(' · ');
  const dateCandidate = lines.find((line) => DATE_RANGE_REGEX.test(line) || /\b\d{4}\b/.test(line)) ?? '';
  const scoreLine = lines.find((line) => /\b(CGPA|GPA|%|Percent|Grade)\b/i.test(line)) ?? '';
  const institutionLine = lines.find((line) => /college|university|school|institute/i.test(line)) ?? '';
  const degreeLine =
    lines.find((line) => /\b(b\.tech|m\.tech|bachelor|master|engineering|science|arts|commerce|mba|bca|mca)\b/i.test(line)) ??
    lines[0] ??
    '';
  const { startDate, endDate } = parseDateRange(dateCandidate);

  let degree = cleanHeaderValue(degreeLine);
  let institution = cleanHeaderValue(institutionLine);
  let field = '';

  const degreeParts = degreeLine
    .split(/\s+[|·-]\s+/)
    .map((part) => cleanHeaderValue(part))
    .filter(Boolean);

  if (degreeParts.length >= 2) {
    degree = degreeParts[0];
    field = degreeParts.slice(1).join(' - ').replace(/\b(?:19|20)\d{2}\b.*$/i, '').trim();
  }

  if (!institution) {
    institution = cleanHeaderValue(
      lines.find((line) => line !== degreeLine && !DATE_RANGE_REGEX.test(line) && !/\b(CGPA|GPA|%|Percent|Grade)\b/i.test(line)) ?? ''
    );
  }

  if (!field && /computer science|electronics|mechanical|civil|information technology|engineering/i.test(joined)) {
    const fieldMatch = joined.match(/\b(computer science(?:\s*&\s*engineering)?|electronics(?:\s*&\s*communication)?|mechanical engineering|civil engineering|information technology)\b/i);
    field = cleanHeaderValue(fieldMatch?.[0] ?? '');
  }

  return {
    institution,
    degree,
    field,
    startDate,
    endDate: endDate || (dateCandidate && !DATE_RANGE_REGEX.test(dateCandidate) ? cleanHeaderValue(dateCandidate) : ''),
    score: cleanHeaderValue(scoreLine),
    location: '',
  };
}

function parseEducationBlock(block: ResumeSectionBlock) {
  const lines = block.typedLines.map((line) => line.text);
  const groups: string[][] = [];
  const leftovers: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    const shouldTrimToLeftovers =
      current.length > 0 &&
      (looksLikeProjectHeader(line) ||
        looksLikeLearningLine(line) ||
        (!looksLikeEducationLine(line) && !/\b\d{4}\b/.test(line) && looksLikeTechnologyStackLine(line)));

    if (shouldTrimToLeftovers) {
      leftovers.push(line);
      continue;
    }

    const startsNew =
      current.length > 0 &&
      (/b\.tech|m\.tech|bachelor|master|engineering|science/i.test(line) &&
        current.some((value) => /college|university|school|institute/i.test(value)));

    if (startsNew) {
      groups.push(current);
      current = [line];
      continue;
    }

    current.push(line);
  }

  if (current.length > 0) {
    groups.push(current);
  }

  const entries = groups
    .map((group) => parseEducationEntry(group))
    .filter((entry) => entry.degree || entry.institution);

  return {
    entries,
    leftovers,
  };
}

function parseSkillsBlock(parsed: ParsedResumeSchema, block: ResumeSectionBlock) {
  parsed.skills.raw = uniqueList([...parsed.skills.raw, ...block.typedLines.map((line) => cleanHeaderValue(line.text))]);

  block.typedLines.forEach((line) => {
    // Table-style: "Category  Value1, Value2" (2+ spaces or tab separator, no colon)
    // Handles PDF table layouts where label and values are in separate columns on the same row.
    const tableMatch = line.text.match(/^([A-Z][a-zA-Z /]{1,30})[\t ]{2,}(.+)$/);
    if (tableMatch) {
      const tableCategory = tableMatch[1].trim();
      const tableValues = splitSkillsLine(tableMatch[2]);
      parsed.skills.core = uniqueList([...parsed.skills.core, ...tableValues]);
      upsertSkillGroup(parsed.skills.grouped, tableCategory, tableValues);
      return;
    }

    const [rawCategory, ...rest] = line.text.split(':');
    const hasExplicitCategory = rest.length > 0;
    const values = splitSkillsLine(line.text);
    parsed.skills.core = uniqueList([...parsed.skills.core, ...values]);

    if (hasExplicitCategory) {
      upsertSkillGroup(parsed.skills.grouped, rawCategory, values);
      return;
    }

    upsertSkillGroup(parsed.skills.grouped, block.heading || 'General', values);
  });
}

function buildProjectFromGroup(group: string[]): ParsedResumeProjectItem | null {
  const [header = '', ...rest] = group;
  const headerParts = splitProjectHeader(header);
  const bullets = rest.filter((line) => /^[•\-–—›»·*]\s+/.test(line)).map((line) => stripBullet(line));
  const prose = rest.filter((line) => !/^[•\-–—›»·*]\s+/.test(line));
  const technologies = prose.flatMap((line) => (looksLikeTechnologyStackLine(line) ? splitSkillsLine(line) : []));
  const description = prose.filter((line) => !looksLikeTechnologyStackLine(line)).join(' ');
  const link =
    extractUrls(group.join(' '))
      .find((url) => /^(https?:\/\/|www\.|.*\.(?:com|io|ai|app|dev|org|net|co|in))(?:\/|$)/i.test(url)) ?? '';

  const project: ParsedResumeProjectItem = {
    name: cleanHeaderValue(headerParts.name || header),
    description: cleanHeaderValue(description),
    technologies: uniqueList(technologies),
    link,
    bullets,
  };

  return project.name || project.description || project.bullets.length > 0 || project.technologies.length > 0
    ? project
    : null;
}

function parseProjectLines(lines: string[], options?: { allowLooseHeaders?: boolean }) {
  const groups: string[][] = [];
  const leftovers: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    const projectHeader = extractProjectHeaderCandidate(line);
    const standaloneLearning = /^ongoing learning$/i.test(cleanHeaderValue(line));
    const looseHeader =
      options?.allowLooseHeaders &&
      !projectHeader &&
      !standaloneLearning &&
      !looksLikeTechnologyStackLine(line) &&
      !looksLikeEducationLine(line) &&
      !/^[•\-–—›»·*]\s+/.test(line) &&
      line.split(/\s+/).length <= 6;

    if (projectHeader || standaloneLearning || looseHeader) {
      if (current.length > 0) {
        groups.push(current);
      }
      current = [projectHeader || line];
      continue;
    }

    if (current.length === 0) {
      if (looksLikeLearningLine(line)) {
        current = ['Ongoing Learning', line];
        continue;
      }

      leftovers.push(line);
      continue;
    }

    current.push(line);
  }

  if (current.length > 0) {
    groups.push(current);
  }

  return {
    projects: groups.map(buildProjectFromGroup).filter((project): project is ParsedResumeProjectItem => Boolean(project)),
    leftovers,
  };
}

function parseProjectBlock(block: ResumeSectionBlock) {
  return parseProjectLines(block.typedLines.map((typedLine) => typedLine.text), { allowLooseHeaders: true });
}

export function traceExperienceGrouping(lines: string[]) {
  const section: ResumeSectionBlock = {
    kind: 'experience',
    heading: 'Experience',
    lines,
    typedLines: [],
    sourceBlockIndexes: [0],
  };
  const typedLines = classifySectionLines(section);
  const result = parseExperienceBlock({ ...section, typedLines });
  return {
    groups: result.entries.map((entry) => [entry.role, entry.company, entry.location, entry.startDate, entry.endDate, ...entry.bullets].filter(Boolean)),
    trace: result.trace,
  } satisfies ExperienceGroupingTrace;
}

function repairLaterSections(parsed: ParsedResumeSchema, candidates: string[]) {
  const repairTrace: ParserRepairTraceEvent[] = [];
  const cleanedCandidates = candidates.map(cleanHeaderValue).filter(Boolean);

  if (cleanedCandidates.length === 0) {
    return { repairTrace };
  }

  const projectRepair = parseProjectLines(cleanedCandidates);
  if (projectRepair.projects.length > 0) {
    parsed.projects = [...parsed.projects, ...projectRepair.projects];
    repairTrace.push({
      action: 'recover_projects',
      text: projectRepair.projects.map((project) => project.name).join(' | '),
      targetSection: 'projects',
      reason: 'Recovered late project or learning content from leftover lines.',
      count: projectRepair.projects.length,
    });
  }

  const remaining = projectRepair.leftovers;
  const recoveredSkills = uniqueList(
    remaining.flatMap((line) => (looksLikeTechnologyStackLine(line) ? splitSkillsLine(line) : []))
  );

  if (recoveredSkills.length > 0) {
    parsed.skills.core = uniqueList([...parsed.skills.core, ...recoveredSkills]);
    parsed.skills.raw = uniqueList([...parsed.skills.raw, ...recoveredSkills]);
    upsertSkillGroup(parsed.skills.grouped, 'General', recoveredSkills);
    repairTrace.push({
      action: 'recover_skills',
      text: recoveredSkills.join(' | '),
      targetSection: 'skills',
      reason: 'Recovered trailing technology and competency content from leftover lines.',
      count: recoveredSkills.length,
    });
  }

  const recoveredLearning = remaining
    .filter((line) => looksLikeLearningLine(line) && !looksLikeTechnologyStackLine(line))
    .map(cleanHeaderValue);

  if (recoveredLearning.length > 0) {
    parsed.ongoingLearning = uniqueList([...parsed.ongoingLearning, ...recoveredLearning]);
    repairTrace.push({
      action: 'recover_learning',
      text: recoveredLearning.join(' | '),
      targetSection: 'ongoingLearning',
      reason: 'Preserved trailing learning or certification-like content for review instead of dropping it.',
      count: recoveredLearning.length,
    });
  }

  const leftoverUnclassified = remaining.filter(
    (line) => !looksLikeTechnologyStackLine(line) && !looksLikeLearningLine(line)
  );

  if (leftoverUnclassified.length > 0) {
    parsed.unclassified.push(...leftoverUnclassified);
    repairTrace.push({
      action: 'recover_unclassified',
      text: leftoverUnclassified.join(' | '),
      targetSection: 'other',
      reason: 'Kept unresolved late-section lines reviewable instead of silently discarding them.',
      count: leftoverUnclassified.length,
    });
  }

  return { repairTrace };
}

// Detect experience entries that structurally look like project entries:
//   - no company line
//   - no full "Mon YYYY - Mon YYYY" style date range
//     (a bare "2025 - Present" or single year is allowed)
//   - bullets or role text contain a `·` separated tech stack line, OR
//   - role has no recognized job-role keyword (e.g. "Lakshya Resume (insaneResumake)")
function looksLikeProjectEntry(entry: ParsedResumeExperienceItem): boolean {
  if (entry.company) return false;
  const dateRange = `${entry.startDate ?? ''} ${entry.endDate ?? ''}`.trim();
  const hasMonthRange = /(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)/i.test(dateRange);
  if (hasMonthRange) return false;
  const hasStackLine = entry.bullets.some(
    (bullet) => bullet.includes('·') && bullet.split('·').length >= 3,
  );
  const roleLooksLikeProject = /\s+[-·]\s+/.test(entry.role);
  // Also reroute when the role has no job-role keyword — it's a product/project name
  const roleHasNoJobKeyword = !hasRoleKeyword(entry.role);
  return hasStackLine || roleLooksLikeProject || roleHasNoJobKeyword;
}

function projectFromExperienceEntry(entry: ParsedResumeExperienceItem): ParsedResumeProjectItem {
  const [namePart, ...descParts] = entry.role.split(/\s+[-·]\s+/);
  const stackLine = entry.bullets.find((b) => b.includes('·') && b.split('·').length >= 3) ?? '';
  const technologies = stackLine ? splitSkillsLine(stackLine) : [];
  const bullets = entry.bullets.filter((b) => b !== stackLine);
  return {
    name: cleanHeaderValue(namePart || entry.role),
    description: cleanHeaderValue(descParts.join(' - ')),
    technologies: uniqueList(technologies),
    link: '',
    bullets,
  };
}

export function mapSectionsToParsedResumeDetailed(sections: ResumeSectionBlock[]): MapSectionsDetailedResult {
  const parsed = createEmptyParsedResume();
  const typedLines: TypedResumeLine[] = [];
  const experienceTrace: ExperienceTraceEvent[] = [];
  const repairTrace: ParserRepairTraceEvent[] = [];
  const repairCandidates: string[] = [];

  const classifiedSections = sections.map((section) => {
    const typed = classifySectionLines(section);
    typedLines.push(...typed);
    return {
      ...section,
      typedLines: typed,
    };
  });

  for (const block of classifiedSections) {
    switch (block.kind) {
      case 'contact':
      case 'links':
        parseContactBlock(parsed, block);
        break;
      case 'summary':
        parseSummaryBlock(parsed, block);
        break;
      case 'experience': {
        const result = parseExperienceBlock(block);
        const realExperience: ParsedResumeExperienceItem[] = [];
        const reroutedProjects: ParsedResumeProjectItem[] = [];
        for (const entry of result.entries) {
          if (looksLikeProjectEntry(entry)) {
            reroutedProjects.push(projectFromExperienceEntry(entry));
          } else {
            realExperience.push(entry);
          }
        }
        parsed.experience = realExperience;
        if (reroutedProjects.length > 0) {
          parsed.projects = [...parsed.projects, ...reroutedProjects];
        }
        parsed.unclassified.push(...result.unclassified);
        experienceTrace.push(...result.trace);
        break;
      }
      case 'education': {
        const result = parseEducationBlock(block);
        parsed.education = [...parsed.education, ...result.entries];
        if (result.leftovers.length > 0) {
          repairCandidates.push(...result.leftovers);
          repairTrace.push({
            action: 'trim_education_tail',
            text: result.leftovers.join(' | '),
            targetSection: 'education',
            reason: 'Trimmed non-education tail lines out of the education block for later recovery.',
            count: result.leftovers.length,
          });
        }
        break;
      }
      case 'skills':
        parseSkillsBlock(parsed, block);
        break;
      case 'sideProjects': {
        const result = parseProjectBlock(block);
        parsed.sideProjects = [...parsed.sideProjects, ...result.projects];
        if (result.leftovers.length > 0) {
          repairCandidates.push(...result.leftovers);
        }
        break;
      }
      case 'projects': {
        const result = parseProjectBlock(block);
        parsed.projects = [...parsed.projects, ...result.projects];
        if (result.leftovers.length > 0) {
          repairCandidates.push(...result.leftovers);
        }
        break;
      }
      case 'ongoingLearning':
        parsed.ongoingLearning = uniqueList([...parsed.ongoingLearning, ...block.lines.map(cleanHeaderValue).filter(Boolean)]);
        break;
      case 'certifications':
        parsed.certifications.push(...block.lines.map(cleanHeaderValue).filter(Boolean));
        break;
      case 'achievements':
        parsed.achievements.push(...block.lines.map(cleanHeaderValue).filter(Boolean));
        break;
      case 'languages':
        parsed.languages.push(...block.lines.map(cleanHeaderValue).filter(Boolean));
        break;
      default:
        parsed.unclassified.push(...block.lines.map(cleanHeaderValue).filter(Boolean));
        break;
    }
  }

  const repaired = repairLaterSections(parsed, repairCandidates);
  repairTrace.push(...repaired.repairTrace);

  parsed.certifications = uniqueList(parsed.certifications);
  parsed.achievements = uniqueList(parsed.achievements);
  parsed.languages = uniqueList(parsed.languages);
  parsed.ongoingLearning = uniqueList(parsed.ongoingLearning);
  parsed.unclassified = uniqueList(parsed.unclassified);

  return {
    parsed,
    typedLines,
    experienceTrace,
    repairTrace,
  };
}

export function mapSectionsToParsedResume(sections: ResumeSectionBlock[]) {
  return mapSectionsToParsedResumeDetailed(sections).parsed;
}
