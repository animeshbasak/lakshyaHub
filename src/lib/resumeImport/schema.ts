import type {
  ParseConfidence,
  ParsedResumeSchema,
  ResumeReviewBadge,
  ResumeValidationIssue,
} from './types';

const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_REGEX = /(?:\+?\d[\d\s().-]{7,}\d)/;
const URL_REGEX = /\b(?:https?:\/\/)?(?:www\.)?[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s]*)?\b/i;

export function createEmptyParsedResume(): ParsedResumeSchema {
  return {
    basics: {
      name: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      portfolio: '',
    },
    summary: '',
    experience: [],
    education: [],
    skills: {
      core: [],
      grouped: [],
      raw: [],
    },
    sideProjects: [],
    projects: [],
    certifications: [],
    achievements: [],
    languages: [],
    ongoingLearning: [],
    unclassified: [],
  };
}

export function normalizeWhitespace(value: string) {
  return value.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').replace(/\s+\n/g, '\n').trim();
}

export function normalizeLine(value: string) {
  return normalizeWhitespace(value)
    .replace(/[•●▪■]/g, '•')
    .replace(/[–—]/g, '-')
    .trim();
}

export function normalizeHeadingText(value: string) {
  const normalized = normalizeLine(value).replace(/[:|]+$/g, '').trim();
  const isSpacedCaps = /^(?:[A-Z]\s+){2,}[A-Z]$/.test(normalized);
  const collapsed = (isSpacedCaps ? normalized.replace(/\s+/g, '') : normalized)
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .toLowerCase();

  return collapsed;
}

export function collapseHeadingKey(value: string) {
  return normalizeHeadingText(value).replace(/\s+/g, '');
}

export function splitIntoLines(rawText: string) {
  return normalizeWhitespace(rawText)
    .split(/\n+/)
    .map((line) => normalizeLine(line))
    .filter(Boolean);
}

export function extractEmail(value: string) {
  return value.match(EMAIL_REGEX)?.[0] ?? '';
}

export function extractPhone(value: string) {
  return value.match(PHONE_REGEX)?.[0] ?? '';
}

export function extractUrls(value: string) {
  return Array.from(value.matchAll(new RegExp(URL_REGEX, 'gi'))).map((match) => match[0]);
}

export function clampScore(value: number) {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

export function inferConfidence(
  issues: ResumeValidationIssue[],
  reviewBadges: ResumeReviewBadge[],
  score?: number,
  hardDowngrade = false
): ParseConfidence {
  if (hardDowngrade) {
    return 'low';
  }

  if (typeof score === 'number') {
    if (score >= 0.85) return 'high';
    if (score >= 0.6) return 'medium';
    return 'low';
  }

  if (issues.some((issue) => issue.severity === 'error') || reviewBadges.some((badge) => badge.confidence === 'low')) {
    return 'low';
  }

  if (issues.length > 0 || reviewBadges.some((badge) => badge.confidence === 'medium')) {
    return 'medium';
  }

  return 'high';
}
