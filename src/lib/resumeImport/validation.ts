import { clampScore, extractEmail, extractPhone, extractUrls, inferConfidence } from './schema';
import type {
  ExperienceTraceEvent,
  NormalizedHeading,
  ParseConfidence,
  ParserConfidenceReason,
  ParserCompletenessSummary,
  ParserRepairTraceEvent,
  ParsedResumeSchema,
  ResumeExtractionStage,
  ResumeReviewBadge,
  ResumeSectionBlock,
  ResumeValidationIssue,
  StructuralValidationSummary,
  TypedResumeLine,
} from './types';

function pushIssue(
  issues: ResumeValidationIssue[],
  section: ResumeValidationIssue['section'],
  severity: ResumeValidationIssue['severity'],
  code: string,
  message: string
) {
  issues.push({ section, severity, code, message });
}

function addReason(
  reasons: ParserConfidenceReason[],
  code: string,
  message: string,
  severity: ParserConfidenceReason['severity'],
  scoreImpact: number
) {
  reasons.push({ code, message, severity, scoreImpact });
}

function countFakeRoles(parsed: ParsedResumeSchema) {
  const VALID_ROLE_PATTERN = /\b(engineer|developer|lead|manager|architect|analyst|designer|specialist|director|consultant|staff|principal|vp|vice president|intern|associate|head|product|research|scientist|data|business|operations|officer|founder|co-founder|cto|ceo|cfo|sde|swe|devops|qa|tester|technician|executive)\b/i;
  return parsed.experience.filter((item) => {
    if (item.role.endsWith('.')) return true;
    const wordCount = item.role.split(/\s+/).length;
    // Mixed-case short phrases without role keywords are project names, not fake roles.
    // Only flag all-lowercase short phrases as fake.
    const isAllLower = item.role === item.role.toLowerCase();
    return !VALID_ROLE_PATTERN.test(item.role) && wordCount <= 3 && isAllLower;
  }).length;
}

function countCompanyLocationSwaps(parsed: ParsedResumeSchema) {
  return parsed.experience.filter((item) => {
    const companyLooksLikeLocation =
      /^(remote(?:\s*\([^)]+\))?|[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})$/.test(item.company) &&
      !/\b(ltd\.?|limited|pvt\.?\s*ltd\.?|private limited|inc\.?|llc|corp\.?|communications|innovations|digital|bank|university|college|solutions|technologies|systems)\b/i.test(item.company);
    const dateLooksWrong = Boolean(item.startDate && !/(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|present|current|\d{4})/i.test(item.startDate));
    return companyLooksLikeLocation || dateLooksWrong;
  }).length;
}

function hasSectionContent(parsed: ParsedResumeSchema, section: ResumeSectionBlock['kind']) {
  switch (section) {
    case 'contact':
      return Boolean(
        parsed.basics.name ||
          parsed.basics.email ||
          parsed.basics.phone ||
          parsed.basics.linkedin ||
          parsed.basics.portfolio ||
          parsed.basics.github
      );
    case 'summary':
      return Boolean(parsed.summary.trim());
    case 'experience':
      return parsed.experience.length > 0;
    case 'education':
      return parsed.education.length > 0;
    case 'skills':
      return parsed.skills.core.length > 0 || parsed.skills.grouped.length > 0 || parsed.skills.raw.length > 0;
    case 'sideProjects':
      return parsed.sideProjects.length > 0;
    case 'projects':
      return parsed.projects.length > 0;
    case 'ongoingLearning':
      return parsed.ongoingLearning.length > 0;
    case 'certifications':
      return parsed.certifications.length > 0;
    case 'achievements':
      return parsed.achievements.length > 0;
    case 'languages':
      return parsed.languages.length > 0;
    case 'links':
      return Boolean(parsed.basics.linkedin || parsed.basics.github || parsed.basics.portfolio);
    default:
      return parsed.unclassified.length > 0;
  }
}

function looksLikeProjectRecoverySignal(line: string) {
  return (
    /\b(?:19|20)\d{2}\s*[-–—]\s*(?:present|current|(?:19|20)\d{2})\b/i.test(line) ||
    /\b(ongoing learning|coursera|langchain|langgraph|genai|rag)\b/i.test(line)
  );
}

function buildStructuralSummary(input: {
  extraction?: ResumeExtractionStage;
  sections?: ResumeSectionBlock[];
  normalizedHeadings?: NormalizedHeading[];
  parsed: ParsedResumeSchema;
  experienceTrace?: ExperienceTraceEvent[];
  typedLines?: TypedResumeLine[];
  repairTrace?: ParserRepairTraceEvent[];
}) {
  const reasons: ParserConfidenceReason[] = [];
  const parsed = input.parsed;
  const sections = input.sections ?? [];
  const normalizedHeadings = input.normalizedHeadings ?? [];
  const experienceTrace = input.experienceTrace ?? [];
  const extraction = input.extraction;
  const typedLines = input.typedLines ?? [];
  const repairTrace = input.repairTrace ?? [];

  const extractionScore =
    extraction?.quality === 'high' ? 1 : extraction?.quality === 'medium' ? 0.68 : extraction?.quality === 'low' ? 0.25 : 0.5;

  // Only count true section-header candidates as recovery failures.
  // Entry-title lines (role/date lines, project headers, name lines) are
  // detected as heading-like but intentionally have no detectedKind — they
  // should not penalise the heading score.
  const trueHeaderCandidates = normalizedHeadings.filter((heading) => {
    if (heading.detectedKind !== null) return true;
    // Exclude lines that contain a year (date in the heading = entry title, not section header)
    if (/\b(?:19|20)\d{2}\b/.test(heading.rawText)) return false;
    // Exclude lines that look like "Name Surname" (all caps but < 4 tokens, no section keyword)
    const tokenCount = heading.rawText.trim().split(/\s+/).length;
    if (tokenCount <= 2 && /^[A-Z\s]+$/.test(heading.rawText.trim())) return false;
    // Exclude short single-word fragments (continuation lines like "LLMs")
    if (tokenCount === 1) return false;
    return true;
  });
  const headingRecoveryFailures = trueHeaderCandidates.filter((heading) => heading.detectedKind === null).length;
  const recognizedHeadings = trueHeaderCandidates.filter((heading) => heading.detectedKind !== null).length;
  const headingScore = trueHeaderCandidates.length === 0 ? 0.65 : clampScore(recognizedHeadings / trueHeaderCandidates.length);

  const nonContactSections = sections.filter((section) => section.kind !== 'contact');
  const sectionScore = clampScore(nonContactSections.length >= 3 ? 1 : nonContactSections.length / 3);
  const expectedSections = Array.from(
    new Set(sections.map((section) => section.kind).filter((section) => section !== 'contact' && section !== 'other'))
  );
  const recoveredSections = expectedSections.filter((section) => hasSectionContent(parsed, section));
  const laterExpectedSections = expectedSections.filter((section) => !['summary', 'experience'].includes(section));
  const laterRecoveredSections = laterExpectedSections.filter((section) => hasSectionContent(parsed, section));
  const majorSectionCoverage =
    expectedSections.length === 0 ? 1 : clampScore(recoveredSections.length / expectedSections.length);
  const laterSectionCoverage =
    laterExpectedSections.length === 0 ? 1 : clampScore(laterRecoveredSections.length / laterExpectedSections.length);

  const duplicateHeaderCount = experienceTrace.filter((event) => event.action === 'skip_duplicate_header').length;
  const fakeRoleCount = countFakeRoles(parsed);
  const companyLocationSwapCount = countCompanyLocationSwaps(parsed);
  const missingCoreExperienceCount = parsed.experience.filter((item) => !item.role || !item.company).length;
  const orphanBulletCount = experienceTrace.filter((event) => event.action === 'route_unclassified' && /bullet-like/i.test(event.reason)).length;
  const experienceSectionPresent = sections.some((section) => section.kind === 'experience');
  const experienceScore = clampScore(
    experienceSectionPresent
      ? Math.max(
          0,
          1 -
            duplicateHeaderCount * 0.18 -
            fakeRoleCount * 0.2 -
            companyLocationSwapCount * 0.16 -
            missingCoreExperienceCount * 0.18 -
            (parsed.experience.length === 0 ? 0.5 : 0)
        )
      : 0.75
  );
  const entriesWithBullets = parsed.experience.filter((item) => item.bullets.length > 0).length;
  const bulletScore = clampScore(parsed.experience.length === 0 ? 0.2 : entriesWithBullets / parsed.experience.length);
  const reviewBurdenRaw = parsed.unclassified.length / Math.max(1, typedLines.length);
  const reviewScore = clampScore(1 - reviewBurdenRaw);
  const repairedLineCount = repairTrace.reduce((sum, event) => sum + (event.count ?? 0), 0);
  const documentCoverageRatio = clampScore(1 - reviewBurdenRaw);
  const completenessScore = clampScore(
    majorSectionCoverage * 0.45 +
      laterSectionCoverage * 0.35 +
      documentCoverageRatio * 0.2
  );
  const missingExpectedSections = expectedSections.filter((section) => !recoveredSections.includes(section));
  const probableLateRecoverySignals = typedLines.filter(
    (line) =>
      line.sectionKind !== 'experience' &&
      line.sectionKind !== 'contact' &&
      looksLikeProjectRecoverySignal(line.text)
  ).length;

  let hardDowngrade = false;

  if (experienceSectionPresent && parsed.experience.length === 0) {
    hardDowngrade = true;
    addReason(reasons, 'missing_experience_entries', 'Experience headings were found but no safe experience entries were reconstructed.', 'error', -0.35);
  }

  if (duplicateHeaderCount >= 2) {
    hardDowngrade = true;
    addReason(reasons, 'duplicate_experience_headers', 'Repeated duplicate experience headers were detected.', 'error', -0.2);
  }

  if (companyLocationSwapCount >= 2) {
    hardDowngrade = true;
    addReason(reasons, 'company_location_swap', 'Multiple experience entries look like company/location or role/date fields were misaligned.', 'error', -0.2);
  }

  if (missingCoreExperienceCount >= 2 && extraction?.inputSignal !== 'docx') {
    hardDowngrade = true;
    addReason(reasons, 'missing_core_experience_fields', `${missingCoreExperienceCount} experience entries are missing core role/company fields.`, 'error', -0.2);
  } else if (missingCoreExperienceCount === 1 && extraction?.inputSignal !== 'docx') {
    addReason(reasons, 'missing_core_experience_fields', 'One experience entry may be missing role or company — review it.', 'warning', -0.08);
  }

  if (fakeRoleCount >= 2) {
    hardDowngrade = true;
    addReason(reasons, 'fake_role_nodes', `${fakeRoleCount} experience roles look like bullet fragments or invalid headers.`, 'error', -0.2);
  } else if (fakeRoleCount === 1) {
    addReason(reasons, 'fake_role_nodes', 'One experience role may need review.', 'warning', -0.08);
  }

  if (missingExpectedSections.length >= 2) {
    addReason(
      reasons,
      'major_section_loss',
      `${missingExpectedSections.length} expected section(s) were not recovered into structured content.`,
      'warning',
      -0.12
    );
  }

  const hasRecoveredLateStructuredContent =
    parsed.projects.length > 0 ||
    parsed.sideProjects.length > 0 ||
    parsed.ongoingLearning.length > 0;

  if (probableLateRecoverySignals >= 2 && !hasRecoveredLateStructuredContent) {
    addReason(
      reasons,
      'late_section_loss',
      'Later structured content was detected, but projects or learning sections were not recovered cleanly.',
      'warning',
      -0.12
    );
  }

  if (
    extraction?.inputSignal === 'machine_pdf' &&
    headingRecoveryFailures >= 2 &&
    nonContactSections.length <= 1
  ) {
    hardDowngrade = true;
    addReason(reasons, 'pdf_heading_recovery_failure', 'PDF heading recovery was too weak to trust the mapped structure.', 'error', -0.25);
  }

  if (headingRecoveryFailures > 0) {
    addReason(reasons, 'heading_recovery_gaps', `${headingRecoveryFailures} heading-like line(s) were not mapped to known sections.`, 'warning', -0.08);
  }

  if (parsed.unclassified.length > 0) {
    addReason(reasons, 'unclassified_content', `${parsed.unclassified.length} line(s) remained unclassified.`, 'warning', -0.06);
  }

  const totalScore = clampScore(
    extractionScore * 0.15 +
      headingScore * 0.15 +
      sectionScore * 0.2 +
      experienceScore * 0.3 +
      bulletScore * 0.1 +
      reviewScore * 0.05 +
      completenessScore * 0.05 +
      reasons.reduce((sum, reason) => sum + reason.scoreImpact, 0)
  );

  const completenessSummary: ParserCompletenessSummary = {
    majorSectionCoverage,
    laterSectionCoverage,
    documentCoverageRatio,
    unclassifiedRate: reviewBurdenRaw,
    missingExpectedSections,
    recoveredSections,
    repairedLineCount,
  };

  const summary: StructuralValidationSummary = {
    extractionScore,
    headingScore,
    sectionScore,
    experienceScore,
    bulletScore,
    reviewScore,
    completenessScore,
    documentCoverageRatio,
    majorSectionCoverage,
    laterSectionCoverage,
    totalScore,
    hardDowngrade,
    duplicateHeaderCount,
    fakeRoleCount,
    companyLocationSwapCount,
    missingCoreExperienceCount,
    orphanBulletCount,
    headingRecoveryFailures,
    repairedLineCount,
  };

  return { summary, reasons, completenessSummary };
}

export function validateParsedResume(
  parsed: ParsedResumeSchema,
  context?: {
    extraction?: ResumeExtractionStage;
    sections?: ResumeSectionBlock[];
    normalizedHeadings?: NormalizedHeading[];
    experienceTrace?: ExperienceTraceEvent[];
    typedLines?: TypedResumeLine[];
    repairTrace?: ParserRepairTraceEvent[];
    rawText?: string;
  }
) {
  const issues: ResumeValidationIssue[] = [];
  const reviewBadges: ResumeReviewBadge[] = [];

  if (parsed.basics.email && !extractEmail(parsed.basics.email)) {
    pushIssue(issues, 'contact', 'warning', 'invalid_email', 'Email needs review.');
  }

  if (parsed.basics.phone && !extractPhone(parsed.basics.phone)) {
    pushIssue(issues, 'contact', 'warning', 'invalid_phone', 'Phone number needs review.');
  }

  for (const [key, value] of Object.entries({
    linkedin: parsed.basics.linkedin,
    github: parsed.basics.github,
    portfolio: parsed.basics.portfolio,
  })) {
    if (value && extractUrls(value).length === 0) {
      pushIssue(issues, 'contact', 'warning', `invalid_${key}`, `${key} link needs review.`);
    }
  }

  parsed.experience.forEach((item, index) => {
    if (!Array.isArray(item.bullets)) {
      pushIssue(issues, 'experience', 'error', `experience_bullets_${index}`, 'Experience bullets must remain an array.');
    }

    if (!item.company || !item.role) {
      pushIssue(issues, 'experience', 'warning', `experience_missing_core_${index}`, 'Some experience entries are missing company or role details.');
    }

    if (
      item.company &&
      /^(remote(?:\s*\([^)]+\))?|[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})$/.test(item.company) &&
      !/\b(ltd\.?|limited|pvt\.?\s*ltd\.?|private limited|inc\.?|llc|corp\.?|communications|innovations|digital|bank|university|college|solutions|technologies|systems)\b/i.test(item.company)
    ) {
      pushIssue(issues, 'experience', 'warning', `experience_company_location_swap_${index}`, 'An experience company field may actually contain a location.');
    }

    if (item.startDate && !/(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|present|current|\d{4})/i.test(item.startDate)) {
      pushIssue(issues, 'experience', 'warning', `experience_invalid_start_${index}`, 'An experience start date looks invalid.');
    }
  });

  parsed.education.forEach((item, index) => {
    if (/(react|typescript|node\.?js|aws|llm|gemini|claude)/i.test([item.degree, item.field, item.institution].join(' '))) {
      pushIssue(issues, 'education', 'warning', `education_leak_${index}`, 'Education may contain project or technical skill content.');
    }
  });

  parsed.projects.forEach((item, index) => {
    if (!Array.isArray(item.bullets)) {
      pushIssue(issues, 'projects', 'error', `project_bullets_${index}`, 'Project bullets must remain an array.');
    }
  });

  parsed.sideProjects.forEach((item, index) => {
    if (!Array.isArray(item.bullets)) {
      pushIssue(issues, 'sideProjects', 'error', `side_project_bullets_${index}`, 'Side project bullets must remain an array.');
    }
  });

  if (parsed.unclassified.length > 0) {
    reviewBadges.push({
      section: 'other',
      confidence: parsed.unclassified.length > 5 ? 'low' : 'medium',
      message: 'Some content could not be mapped safely and was left for review.',
    });
  }

  if (context?.rawText) {
    const originalBulletLines = context.rawText
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => /^[•\-–—›»·*]\s+/.test(line) || /^[0-9]+[.)]\s+/.test(line));
    const originalBulletCount = originalBulletLines.length;
    const parsedBulletCount =
      parsed.experience.reduce((sum, item) => sum + (item.bullets?.length ?? 0), 0) +
      parsed.projects.reduce((sum, item) => sum + (item.bullets?.length ?? 0), 0) +
      parsed.sideProjects.reduce((sum, item) => sum + (item.bullets?.length ?? 0), 0);

    if (originalBulletCount >= 5 && parsedBulletCount / originalBulletCount < 0.9) {
      pushIssue(
        issues,
        'experience',
        'warning',
        'bullet_recall_low',
        `Only ${parsedBulletCount} of ~${originalBulletCount} bullets were recovered. Review the imported content.`
      );
      reviewBadges.push({
        section: 'experience',
        confidence: parsedBulletCount / originalBulletCount < 0.6 ? 'low' : 'medium',
        message: `Recovered ${parsedBulletCount}/${originalBulletCount} bullets from the source.`,
      });
    }

    const rawLower = context.rawText.toLowerCase();
    parsed.experience.forEach((item, index) => {
      if (item.company && item.company.length >= 3 && !rawLower.includes(item.company.toLowerCase())) {
        pushIssue(
          issues,
          'experience',
          'warning',
          `experience_company_not_in_source_${index}`,
          `Company "${item.company}" was not found verbatim in the source text.`
        );
      }
      if (item.startDate) {
        const yearMatch = item.startDate.match(/\b(19|20)\d{2}\b/);
        if (yearMatch && !rawLower.includes(yearMatch[0])) {
          pushIssue(
            issues,
            'experience',
            'warning',
            `experience_date_not_in_source_${index}`,
            `Start date ${item.startDate} was not found in the source text.`
          );
        }
      }
    });
  }

  const structural = buildStructuralSummary({
    extraction: context?.extraction,
    sections: context?.sections,
    normalizedHeadings: context?.normalizedHeadings,
    parsed,
    experienceTrace: context?.experienceTrace,
    typedLines: context?.typedLines,
    repairTrace: context?.repairTrace,
  });

  if (structural.summary.fakeRoleCount > 0 || structural.summary.companyLocationSwapCount > 0) {
    reviewBadges.push({
      section: 'experience',
      confidence: structural.summary.hardDowngrade ? 'low' : 'medium',
      message: 'Some experience entries need review because the parser found structural alignment issues.',
    });
  }

  if (structural.summary.headingRecoveryFailures > 0) {
    reviewBadges.push({
      section: 'schema',
      confidence: structural.summary.hardDowngrade ? 'low' : 'medium',
      message: 'Section boundary recovery was incomplete. Review mapped sections carefully.',
    });
  }

  const confidence: ParseConfidence = inferConfidence(
    issues,
    reviewBadges,
    structural.summary.totalScore,
    structural.summary.hardDowngrade
  );

  return {
    issues,
    reviewBadges,
    confidence,
    structuralSummary: structural.summary,
    completenessSummary: structural.completenessSummary,
    confidenceReasons: structural.reasons,
  };
}
