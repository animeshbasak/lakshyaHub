export type ResumeFileKind = 'pdf' | 'docx' | 'doc' | 'unknown';

export type ResumeInputQuality = 'high' | 'medium' | 'low';

export type ResumeInputSignal =
  | 'machine_pdf'
  | 'docx'
  | 'scanned_pdf'
  | 'low_structure_pdf'
  | 'legacy_doc'
  | 'unknown';

export type ParsedSectionKind =
  | 'contact'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'sideProjects'
  | 'projects'
  | 'ongoingLearning'
  | 'certifications'
  | 'achievements'
  | 'languages'
  | 'links'
  | 'other';

export type ParseConfidence = 'high' | 'medium' | 'low';

export interface ResumeExtractionStage {
  fileKind: ResumeFileKind;
  inputSignal: ResumeInputSignal;
  quality: ResumeInputQuality;
  fileName: string;
  pageCount?: number;
  warnings: string[];
}

export interface ExtractedResumeLine {
  id: string;
  text: string;
  normalizedText: string;
  pageIndex: number;
  blockIndex: number;
  lineIndex: number;
  xStart: number;
  xEnd: number;
  y: number;
  tokenCount: number;
  bulletHint: boolean;
  uppercaseRatio: number;
  spacedCapsHint: boolean;
  source: 'docx' | 'pdf' | 'raw_text';
}

export interface ExtractedResumeBlock {
  id: string;
  blockIndex: number;
  pageIndex: number;
  text: string;
  lines: ExtractedResumeLine[];
}

export interface NormalizedHeading {
  rawText: string;
  normalizedText: string;
  collapsedKey: string;
  detectedKind: ParsedSectionKind | null;
  confidence: ParseConfidence;
  blockIndex: number;
  lineIndex: number;
  pageIndex: number;
  reasons: string[];
}

export type TypedResumeLineKind =
  | 'section_header'
  | 'contact_line'
  | 'name_line'
  | 'title_line'
  | 'role_date_line'
  | 'company_location_line'
  | 'bullet_line'
  | 'wrapped_bullet_continuation'
  | 'summary_line'
  | 'skills_line'
  | 'education_line'
  | 'project_line'
  | 'unknown_line';

export interface TypedResumeLine {
  id: string;
  kind: TypedResumeLineKind;
  text: string;
  normalizedText: string;
  sectionKind: ParsedSectionKind;
  blockIndex: number;
  lineIndex: number;
  pageIndex: number;
  bulletHint: boolean;
  reasons: string[];
}

export interface ResumeSectionTraceEntry {
  lineId: string;
  text: string;
  normalizedHeading: string;
  detectedKind: ParsedSectionKind | null;
  action: 'start_section' | 'append_line' | 'heading_like_unclassified';
  activeSection: ParsedSectionKind;
  blockIndex: number;
  lineIndex: number;
}

export interface ExperienceDraftNode {
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
  headerContext: string[];
  rawLines: string[];
  flags: string[];
}

export interface ExperienceTraceEvent {
  action:
    | 'start_entry'
    | 'attach_role_date'
    | 'attach_company_location'
    | 'attach_bullet'
    | 'append_bullet_continuation'
    | 'append_header_context'
    | 'skip_duplicate_header'
    | 'close_entry'
    | 'route_unclassified';
  text: string;
  reason: string;
  lineId?: string;
  entryIndex?: number;
  flags?: string[];
}

export interface ParsedResumeBasics {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface ParsedResumeExperienceItem {
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface ParsedResumeEducationItem {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  score: string;
  location: string;
}

export interface ParsedResumeProjectItem {
  name: string;
  description: string;
  technologies: string[];
  link: string;
  bullets: string[];
}

export interface ParsedResumeSkillGroup {
  category: string;
  values: string[];
}

export interface ParsedResumeSkills {
  core: string[];
  grouped: ParsedResumeSkillGroup[];
  raw: string[];
}

export interface ParsedResumeSchema {
  basics: ParsedResumeBasics;
  summary: string;
  experience: ParsedResumeExperienceItem[];
  education: ParsedResumeEducationItem[];
  skills: ParsedResumeSkills;
  sideProjects: ParsedResumeProjectItem[];
  projects: ParsedResumeProjectItem[];
  certifications: string[];
  achievements: string[];
  languages: string[];
  ongoingLearning: string[];
  unclassified: string[];
}

export interface ResumeValidationIssue {
  code: string;
  message: string;
  section: ParsedSectionKind | 'schema';
  severity: 'warning' | 'error';
}

export interface ResumeReviewBadge {
  section: ParsedSectionKind | 'schema';
  confidence: ParseConfidence;
  message: string;
}

export interface ParserConfidenceReason {
  code: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  scoreImpact: number;
}

export interface ParserRepairTraceEvent {
  action:
    | 'recover_projects'
    | 'recover_skills'
    | 'recover_learning'
    | 'recover_unclassified'
    | 'trim_education_tail'
    | 'promote_late_section';
  text: string;
  targetSection: ParsedSectionKind | 'schema';
  reason: string;
  count?: number;
}

export interface ParserCompletenessSummary {
  majorSectionCoverage: number;
  laterSectionCoverage: number;
  documentCoverageRatio: number;
  unclassifiedRate: number;
  missingExpectedSections: ParsedSectionKind[];
  recoveredSections: ParsedSectionKind[];
  repairedLineCount: number;
}

export interface StructuralValidationSummary {
  extractionScore: number;
  headingScore: number;
  sectionScore: number;
  experienceScore: number;
  bulletScore: number;
  reviewScore: number;
  completenessScore: number;
  documentCoverageRatio: number;
  majorSectionCoverage: number;
  laterSectionCoverage: number;
  totalScore: number;
  hardDowngrade: boolean;
  duplicateHeaderCount: number;
  fakeRoleCount: number;
  companyLocationSwapCount: number;
  missingCoreExperienceCount: number;
  orphanBulletCount: number;
  headingRecoveryFailures: number;
  repairedLineCount: number;
}

export interface ResumeSectionBlock {
  kind: ParsedSectionKind;
  heading: string;
  lines: string[];
  typedLines: TypedResumeLine[];
  sourceBlockIndexes: number[];
}

export interface ResumeParseDebug {
  extractedBlocks: ExtractedResumeBlock[];
  normalizedHeadings: NormalizedHeading[];
  typedLines: TypedResumeLine[];
  sectionTrace: ResumeSectionTraceEntry[];
  experienceTrace: ExperienceTraceEvent[];
  repairTrace: ParserRepairTraceEvent[];
  confidenceReasons: ParserConfidenceReason[];
  structuralSummary: StructuralValidationSummary;
  completenessSummary: ParserCompletenessSummary;
}

export interface ResumeParseResult {
  extraction: ResumeExtractionStage;
  rawText: string;
  extractedBlocks: ExtractedResumeBlock[];
  sections: ResumeSectionBlock[];
  parsed: ParsedResumeSchema;
  confidence: ParseConfidence;
  reviewBadges: ResumeReviewBadge[];
  validationIssues: ResumeValidationIssue[];
  detectedSections: ParsedSectionKind[];
  debug: ResumeParseDebug;
}
