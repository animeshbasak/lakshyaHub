import type { ProjectEntry, ResumeData, SkillRow } from '@/types';
import type { ResumeParseResult } from './types';
import type { BuilderImportReviewState, BuilderImportPayload } from './pipeline';

function chunkSummary(summary: string) {
  if (!summary.trim()) {
    return ['', '', ''] as [string, string, string];
  }

  const sentences = summary
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  return [
    sentences[0] ?? summary,
    sentences[1] ?? '',
    sentences.slice(2).join(' '),
  ] as [string, string, string];
}

export function mapParsedResumeToBuilder(result: ResumeParseResult): BuilderImportPayload {
  const groupedSkills = result.parsed.skills.grouped;
  const skills: SkillRow[] = groupedSkills.length > 0
    ? groupedSkills.map((group, index) => ({
        id: `skill_import_${index}`,
        category: group.category || 'Core Skills',
        values: group.values.join(', '),
      }))
    : result.parsed.skills.core.length > 0
      ? [
          {
            id: 'skill_import_core',
            category: 'Core Skills',
            values: result.parsed.skills.core.join(', '),
          },
        ]
      : [];

  const competencies = [
    ...result.parsed.certifications,
    ...result.parsed.achievements,
    ...result.parsed.languages,
  ].slice(0, 12);

  const projects: ProjectEntry[] = [
    ...result.parsed.sideProjects.map((project) => ({ ...project, kind: 'side-project' as const })),
    ...result.parsed.projects.map((project) => ({ ...project, kind: 'project' as const })),
    ...result.parsed.ongoingLearning.map((item) => ({
      name: item,
      description: '',
      technologies: [],
      link: '',
      bullets: [],
      kind: 'ongoing-learning' as const,
    })),
  ].map((project, index) => ({
    id: `import_project_${index}`,
    name: project.name,
    period: '',
    description: project.description,
    technologies: project.technologies,
    link: project.link,
    bullets: project.bullets.map((bullet, bulletIndex) => ({
      id: `import_project_bullet_${index}_${bulletIndex}`,
      text: bullet,
    })),
    kind: project.kind,
  }));

  const reviewWarnings = [
    ...result.extraction.warnings,
    ...result.debug.confidenceReasons
      .filter((reason) => reason.severity !== 'info')
      .map((reason) => reason.message),
  ].filter((warning, index, all) => all.indexOf(warning) === index);

  const importReview: BuilderImportReviewState = {
    confidence: result.confidence,
    detectedSections: result.detectedSections,
    reviewBadges: result.reviewBadges.map((badge) => ({
      section: badge.section,
      confidence: badge.confidence,
      message: badge.message,
    })),
    validationIssues: result.validationIssues.map((issue) => ({
      code: issue.code,
      message: issue.message,
      section: issue.section,
      severity: issue.severity,
    })),
    unclassified: [...result.parsed.unclassified].filter(Boolean),
    warnings: reviewWarnings,
  };

  return {
    header: {
      name: result.parsed.basics.name,
      title: result.parsed.basics.title,
      email: result.parsed.basics.email,
      phone: result.parsed.basics.phone,
      location: result.parsed.basics.location,
      linkedin: result.parsed.basics.linkedin,
      portfolio: result.parsed.basics.portfolio,
      github: result.parsed.basics.github,
    },
    summary: chunkSummary(result.parsed.summary),
    experience: result.parsed.experience.map((item, index) => ({
      id: `import_job_${index}`,
      title: item.role,
      company: item.company || item.location,
      period: [item.startDate, item.endDate].filter(Boolean).join(' - '),
      scale: '',
      bullets: item.bullets.map((bullet, bulletIndex) => ({
        id: `import_bullet_${index}_${bulletIndex}`,
        text: bullet,
      })),
    })),
    education: (() => {
      const seen = new Set<string>();
      return result.parsed.education
        .map((item, index) => ({
          id: `import_education_${index}`,
          degree: [item.degree, item.field].filter(Boolean).join(' - '),
          institution: item.institution,
          period: [item.startDate, item.endDate].filter(Boolean).join(' - '),
          grade: item.score,
        }))
        .sort((a, b) => {
          // Prefer entries with more data (period + grade) over sparse ones
          const scoreA = (a.period ? 2 : 0) + (a.grade ? 1 : 0);
          const scoreB = (b.period ? 2 : 0) + (b.grade ? 1 : 0);
          return scoreB - scoreA;
        })
        .filter((edu) => {
          const key = `${edu.degree.toLowerCase().trim()}|${edu.institution.toLowerCase().trim()}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
    })(),
    projects,
    skills,
    competencies,
    referenceText: result.rawText,
    importReview,
  };
}
