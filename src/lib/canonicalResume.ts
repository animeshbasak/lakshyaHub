import type { ResumeData, ResumeOrigin } from '@/types';
import { hasBuilderResumeContent, isJDMatchResumeReady, isResumeExportReady } from './utils/resumeContent';
import { resumeToText } from './utils/resumeToText';

export interface AIAnalysis {
  matchScore: number;
  roleDetected: string;
  missingKeywords: string[];
  presentKeywords: string[];
  hiringManagerVerdict?: string;
  topSuggestions?: string[];
  missingPreferred?: string[];
  seniorityMatch?: string;
  provider?: string;
}

export interface CanonicalResumeDocument {
  id: string;
  name: string;
  template: ResumeData['template'];
  header: ResumeData['header'];
  summary: ResumeData['summary'];
  skills: ResumeData['skills'];
  experience: ResumeData['experience'];
  education: ResumeData['education'];
  projects: ResumeData['projects'];
  competencies: ResumeData['competencies'];
  resumeOrigin: ResumeOrigin;
}

export interface CanonicalDashboardSummary {
  label: string;
  tone: 'neutral' | 'success' | 'warning';
  detail: string;
}

function cloneList<T>(value?: T[]) {
  return Array.isArray(value) ? structuredClone(value) : [];
}

export function getCanonicalResumeDocument(data: Partial<ResumeData>): CanonicalResumeDocument {
  return {
    id: data.id || '',
    name: data.name || 'Untitled Resume',
    template: data.template || 'harvard',
    header: {
      name: data.header?.name || '',
      title: data.header?.title || '',
      email: data.header?.email || '',
      phone: data.header?.phone || '',
      location: data.header?.location || '',
      linkedin: data.header?.linkedin || '',
      portfolio: data.header?.portfolio || '',
      github: data.header?.github || '',
    },
    summary: [...(data.summary || ['', '', ''])] as ResumeData['summary'],
    skills: cloneList(data.skills),
    experience: cloneList(data.experience),
    education: cloneList(data.education),
    projects: cloneList(data.projects),
    competencies: cloneList(data.competencies),
    resumeOrigin: data.resumeOrigin || 'blank',
  };
}

export function getCanonicalResumeText(data: Partial<ResumeData>) {
  return resumeToText(getCanonicalResumeDocument(data) as ResumeData);
}

export function getCanonicalPreviewModel(data: Partial<ResumeData>) {
  return getCanonicalResumeDocument(data);
}

export function getCanonicalAtsInput(data: Partial<ResumeData>) {
  return getCanonicalResumeText(data);
}

export function getCanonicalJdInput(data: Partial<ResumeData>) {
  return getCanonicalResumeText(data);
}

export function getCanonicalExportModel(data: Partial<ResumeData>) {
  return getCanonicalResumeDocument(data);
}

export function getCanonicalResumeFingerprint(data: Partial<ResumeData>) {
  const canonical = getCanonicalResumeDocument(data);
  return JSON.stringify({
    header: canonical.header,
    summary: canonical.summary,
    skills: canonical.skills,
    experience: canonical.experience,
    education: canonical.education,
    projects: canonical.projects,
    competencies: canonical.competencies,
  });
}

export function getCanonicalCompletionState(data: Partial<ResumeData>) {
  const canonical = getCanonicalResumeDocument(data);
  return {
    hasContent: hasBuilderResumeContent(canonical),
    exportReady: isResumeExportReady(canonical),
    jdReady: isJDMatchResumeReady(canonical),
    text: getCanonicalResumeText(canonical),
  };
}

export function getDashboardSummaryState(data: Partial<ResumeData>): CanonicalDashboardSummary {
  const canonical = getCanonicalResumeDocument(data);
  const hasContent = hasBuilderResumeContent(canonical);

  if (!hasContent) {
    return {
      label: 'Blank',
      tone: 'neutral',
      detail: 'Resume has not been filled yet.',
    };
  }

  if (data.importReview && (data.importReview.unclassified.length > 0 || data.importReview.confidence !== 'high')) {
    return {
      label: 'Needs Review',
      tone: 'warning',
      detail: 'Imported content still has review items.',
    };
  }

  if (isResumeExportReady(canonical)) {
    return {
      label: 'Ready',
      tone: 'success',
      detail: 'Canonical resume is ready to optimize or export.',
    };
  }

  return {
    label: 'In Progress',
    tone: 'neutral',
    detail: 'Resume has draft content but is not complete yet.',
  };
}

export function isAnalysisFingerprintStale(data: Partial<ResumeData>, sourceFingerprint?: string) {
  if (!sourceFingerprint) {
    return false;
  }

  return getCanonicalResumeFingerprint(data) !== sourceFingerprint;
}

export function createJdAnalysisSnapshot(
  data: Partial<ResumeData>,
  input: string,
  result: AIAnalysis
) {
  return {
    input,
    result,
    sourceFingerprint: getCanonicalResumeFingerprint(data),
    lastAnalyzedAt: new Date().toISOString(),
  };
}
