import type { ResumeData } from '@/types';

const hasText = (value?: string) => Boolean(value && value.trim().length > 0);

export function hasBuilderResumeContent(data: Partial<ResumeData>) {
  const header = data.header;
  const headerHasContent = Boolean(
    header &&
    Object.values(header).some((value) => typeof value === 'string' && hasText(value))
  );

  const summaryHasContent = Boolean(data.summary?.some((line) => hasText(line)));
  const skillsHaveContent = Boolean(
    data.skills?.some((skill) => hasText(skill.category) || hasText(skill.values))
  );
  const experienceHasContent = Boolean(
    data.experience?.some((job) =>
      hasText(job.title) ||
      hasText(job.company) ||
      hasText(job.period) ||
      hasText(job.scale) ||
      job.bullets.some((bullet) => hasText(bullet.text))
    )
  );
  const educationHasContent = Boolean(
    data.education?.some((item) =>
      hasText(item.degree) ||
      hasText(item.institution) ||
      hasText(item.period) ||
      hasText(item.grade)
    )
  );
  const competenciesHaveContent = Boolean(
    data.competencies?.some((item) => hasText(item))
  );
  const projectsHaveContent = Boolean(
    data.projects?.some((project) =>
      hasText(project.name) ||
      hasText(project.period) ||
      hasText(project.description) ||
      hasText(project.link) ||
      project.technologies.some((item) => hasText(item)) ||
      project.bullets.some((bullet) => hasText(bullet.text))
    )
  );

  return (
    headerHasContent ||
    summaryHasContent ||
    skillsHaveContent ||
    experienceHasContent ||
    educationHasContent ||
    projectsHaveContent ||
    competenciesHaveContent
  );
}

export function hasMeaningfulResumeContent(data: Partial<ResumeData>) {
  return hasBuilderResumeContent(data);
}

export function hasExperienceBullets(data: Partial<ResumeData>) {
  return Boolean(
    data.experience?.some((job) => job.bullets.some((bullet) => hasText(bullet.text)))
  );
}

export function hasMeaningfulSummary(data: Partial<ResumeData>) {
  const summaryText = data.summary?.filter(Boolean).join(' ').trim() || '';
  return summaryText.length >= 40;
}

export function hasMeaningfulExperienceBlock(data: Partial<ResumeData>) {
  return Boolean(
    data.experience?.some((job) => {
      const bulletText = job.bullets.map((bullet) => bullet.text.trim()).filter(Boolean).join(' ');
      return hasText(job.title) && hasText(job.company) && (bulletText.length >= 45 || hasText(job.scale));
    })
  );
}

export function isResumeExportReady(data: Partial<ResumeData>) {
  return Boolean(
    hasText(data.header?.name) &&
    hasText(data.header?.title) &&
    (hasMeaningfulSummary(data) || hasMeaningfulExperienceBlock(data))
  );
}

export function isJDMatchResumeReady(data: Partial<ResumeData>) {
  const skillSignal = Boolean(data.skills?.some((skill) => hasText(skill.values)));
  return isResumeExportReady(data) && (skillSignal || hasMeaningfulExperienceBlock(data));
}

export function isJDInputReady(jd: string) {
  return jd.trim().length >= 120;
}
