// src/types/index.ts

/* --- JOB BOARD & LAKSHYA CORE --- */

export interface Job {
  id: string
  user_id: string
  session_id: string | null
  source: string               // individual source e.g. "linkedin"
  title: string
  company: string
  location: string | null
  description: string | null
  url: string | null
  salary_range: string | null
  fit_score: number
  fit_breakdown: FitBreakdown | null
  raw_data: any
  dedup_hash: string
  scraped_at: string
}

export interface Application {
  id: string
  user_id: string
  job_id: string
  job?: Job                    // joined
  status: ApplicationStatus
  applied_at: string | null
  notes: string | null
  resume_version: string | null
  updated_at: string
  // careerops cadence (migration 002)
  follow_up_due?: string | null
  follow_up_count?: number | null
  cadence_flag?: 'ok' | 'urgent' | 'overdue' | 'cold' | null
}

export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected'

export interface FitBreakdown {
  overall: number          // 0–100
  titleMatch: number       // 0–100
  skillsMatch: number      // 0–100
  seniorityMatch: number   // 0–100
  locationMatch: number    // 0–100
  salaryMatch: number      // 0–100
  summary: string
  missingSkills: string[]
  strongMatches: string[]
  recommendation: 'apply_now' | 'apply_tailored' | 'stretch' | 'skip'
}

/* --- RESUME BUILDER & INSANERESUME CORE --- */

export interface ResumeHeader {
  name: string
  title: string
  email: string
  phone: string
  location: string
  linkedin: string
  portfolio: string
  github?: string
}

export interface SkillRow {
  id: string
  category: string
  values: string
}

export interface BulletItem {
  id: string
  text: string           // supports **bold** markdown for metrics
  isImproving?: boolean  // true while AI is processing
  originalText?: string  // saved before AI improvement
}

export interface JobEntry {
  id: string
  title: string
  company: string
  period: string
  scale: string          // e.g. "150M+ MAU"
  bullets: BulletItem[]
}

export interface Education {
  id: string
  degree: string
  institution: string
  period: string
  grade: string
}

export interface ProjectEntry {
  id: string
  name: string
  period: string
  description: string
  technologies: string[]
  link: string
  bullets: BulletItem[]
  kind?: 'project' | 'side-project' | 'ongoing-learning'
}

export type TemplateType =
  | 'harvard'
  | 'modern'
  | 'modern-blue'
  | 'executive'
  | 'minimal'
  | 'faang'
  | 'teal-sidebar'
  | 'compact-pro'
  | 'warm-serif'
  | 'dark-header'
  | 'india-tech'
  | 'classic'
  | 'creative';

export type ResumeOrigin = 'blank' | 'demo' | 'imported' | 'saved';

export interface ResumeData {
  id: string;
  name: string;
  template: TemplateType;
  header: ResumeHeader;
  summary: string[];      // exactly 3 strings, one per line
  skills: SkillRow[];
  experience: JobEntry[];
  education: Education[];
  projects?: ProjectEntry[];
  competencies: string[];
  lastSaved?: string;     // ISO timestamp
  referenceText?: string;   // raw extracted text
  isRefPanelCollapsed?: boolean;
  importReview?: BuilderImportReviewState;
  resumeOrigin?: ResumeOrigin;
}

/* --- SHARED PROFILE --- */

export type YearsExperience = '<1' | '1-3' | '3-5' | '5-10' | '10+'

export interface ResumeProfile {
  id: string                    // = auth.users.id
  user_id?: string              // FK to auth.users (alias for id in some queries)
  target_titles: string[]
  skills: string[]
  target_locations: string[]
  full_resume_text: string
  years_experience?: YearsExperience | null
  min_salary_lpa: number | null
  max_salary_lpa: number | null
  source: 'insaneresumake' | 'pdf' | 'manual'
  synced_at: string
  updated_at: string
}

// ── Resume Import ──────────────────────────────────────────────
export interface BuilderImportReviewState {
  confidence: 'high' | 'medium' | 'low'
  detectedSections: string[]
  reviewBadges: Array<{
    section: string
    confidence: 'high' | 'medium' | 'low'
    message: string
  }>
  validationIssues: Array<{
    code: string
    message: string
    section: string
    severity: 'warning' | 'error'
  }>
  unclassified: string[]
  warnings: string[]
}

export type ParseConfidence = 'high' | 'medium' | 'low'

export type { ParsedResumeSchema } from '@/lib/resumeImport/types'

// ── Scrape / Job Search ────────────────────────────────────────
export interface ScrapeSession {
  id: string
  user_id: string
  source: string
  query: string
  status: 'running' | 'completed' | 'failed'
  jobs_found: number
  jobs_saved: number
  error_message?: string
  completed_at?: string
  created_at: string
}

export interface ScrapeLog {
  id: string
  session_id: string
  type: 'info' | 'success' | 'warn' | 'error'
  message: string
  created_at: string
}

// ── ATS ────────────────────────────────────────────────────────
// Source of truth lives in src/lib/atsEngine.ts. We re-export here so
// existing callers that import from '@/types' don't need to change.
export type { ATSCheck, ATSResult } from '@/lib/atsEngine'

// ── JD Match 5D ───────────────────────────────────────────────
export interface JdMatch5dResult {
  overall_score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  verdict: string
  dimensions: {
    skills: number
    title: number
    seniority: number
    location: number
    salary: number
  }
  top_gaps: string[]
}
