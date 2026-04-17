import { ResumeData } from '@/types';

export const resumeToText = (data: ResumeData): string => {
  const parts: string[] = [];

  // Header
  if (data.header) {
    if (data.header.name) parts.push(data.header.name);
    if (data.header.title) parts.push(data.header.title);
    if (data.header.email) parts.push(data.header.email);
    if (data.header.phone) parts.push(data.header.phone);
    if (data.header.location) parts.push(data.header.location);
    if (data.header.linkedin) parts.push(data.header.linkedin);
    if (data.header.portfolio) parts.push(data.header.portfolio);
  }

  // Summary
  if (data.summary && data.summary.length > 0) {
    parts.push(data.summary.filter(Boolean).join(' '));
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    data.skills.forEach(s => {
      if (s.category) parts.push(s.category);
      if (s.values) parts.push(s.values);
    });
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    data.experience.forEach(e => {
      if (e.title) parts.push(e.title);
      if (e.company) parts.push(e.company);
      if (e.period) parts.push(e.period);
      if (e.bullets && e.bullets.length > 0) {
        e.bullets.forEach(b => {
          if (b.text) parts.push(b.text);
        });
      }
    });
  }

  // Education
  if (data.education && data.education.length > 0) {
    data.education.forEach(e => {
      if (e.degree) parts.push(e.degree);
      if (e.institution) parts.push(e.institution);
      if (e.period) parts.push(e.period);
    });
  }

  if (data.projects && data.projects.length > 0) {
    data.projects.forEach((project) => {
      if (project.name) parts.push(project.name);
      if (project.period) parts.push(project.period);
      if (project.description) parts.push(project.description);
      project.technologies.forEach((technology) => {
        if (technology) parts.push(technology);
      });
      project.bullets.forEach((bullet) => {
        if (bullet.text) parts.push(bullet.text);
      });
      if (project.link) parts.push(project.link);
    });
  }

  return parts.join('\n');
};
