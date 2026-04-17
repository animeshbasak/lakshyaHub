// src/features/resume-builder/templates/rendering.tsx
import React from 'react';
import { Link, Text, View } from '@react-pdf/renderer';
import type { ProjectEntry, SkillRow } from '@/types';
import { parseBoldText } from '../utils/parseBoldText';

export const TEMPLATE_RHYTHM = {
  sectionTop: 12,
  sectionHeaderBottom: 6,
  entryGap: 9,
  metadataGap: 3,
  bulletGap: 3,
  bulletIndent: 10,
  bulletDotWidth: 8,
  paragraphLineHeight: 1.38,
  projectGap: 8,
  skillsGap: 4,
  subsectionGap: 10,
} as const;

export interface BulletStyles {
  bulletRow: any;
  bulletDot: any;
  bulletText: any;
  bold: any;
}

export interface SkillStyles {
  skillRow: any;
  skillCategory: any;
  skillValues: any;
}

export interface ProjectStyles extends BulletStyles {
  sectionTitle: any;
  projectItem: any;
  projectHeader: any;
  projectTitle: any;
  projectPeriod: any;
  projectMeta: any;
  projectDescription: any;
  projectLink?: any;
}

export interface ProjectRenderOptions {
  splitOngoingLearning?: boolean;
  ongoingLearningTitle?: string;
}

export interface ContactLinkItem {
  key: string;
  label: string;
  href?: string;
}

export function normalizeExternalLink(value?: string | null) {
  if (!value?.trim()) return '';
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function buildContactLinks(header: {
  linkedin?: string;
  github?: string;
  portfolio?: string;
}) {
  return [
    header.linkedin
      ? { key: 'linkedin', label: header.linkedin, href: normalizeExternalLink(header.linkedin) }
      : null,
    header.github
      ? { key: 'github', label: header.github, href: normalizeExternalLink(header.github) }
      : null,
    header.portfolio
      ? { key: 'portfolio', label: header.portfolio, href: normalizeExternalLink(header.portfolio) }
      : null,
  ].filter(Boolean) as ContactLinkItem[];
}

function hasText(value: string | undefined | null) {
  return Boolean(value && value.trim());
}

function projectKindLabel(kind?: ProjectEntry['kind']) {
  switch (kind) {
    case 'side-project':
      return 'Side Project';
    case 'ongoing-learning':
      return 'Ongoing Learning';
    case 'project':
    default:
      return 'Project';
  }
}

export function renderBulletList(
  bullets: ProjectEntry['bullets'],
  styles: BulletStyles
) {
  return bullets
    .map((bullet) => {
      if (!hasText(bullet.text)) return null;

      return (
        <View key={bullet.id} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>
            {parseBoldText(bullet.text).map((segment, index) => (
              <Text key={index} style={segment.bold ? styles.bold : {}}>
                {segment.text}
              </Text>
            ))}
          </Text>
        </View>
      );
    })
    .filter(Boolean);
}

export function renderSkillRows(skills: SkillRow[], styles: SkillStyles) {
  return skills
    .filter((skill) => hasText(skill.category) || hasText(skill.values))
    .map((skill) => (
      <View key={skill.id} style={styles.skillRow} wrap={false}>
        <Text style={styles.skillCategory}>{skill.category}</Text>
        <Text style={styles.skillValues}>{skill.values}</Text>
      </View>
    ));
}

export function renderProjectSection(
  projects: ProjectEntry[],
  styles: ProjectStyles,
  title = 'Projects & Side Builds',
  options: ProjectRenderOptions = {}
) {
  const safeProjects = projects.filter(
    (project) =>
      hasText(project.name) ||
      hasText(project.period) ||
      hasText(project.description) ||
      project.technologies.length > 0 ||
      project.bullets.length > 0
  );

  if (safeProjects.length === 0) {
    return null;
  }

  const mainProjects = options.splitOngoingLearning
    ? safeProjects.filter((project) => project.kind !== 'ongoing-learning')
    : safeProjects;
  const ongoingLearningProjects = options.splitOngoingLearning
    ? safeProjects.filter((project) => project.kind === 'ongoing-learning')
    : [];

  const renderProjectGroup = (items: ProjectEntry[], heading: string, omitKindLabel = false) => {
    if (items.length === 0) return null;

    return (
      <View>
        <Text style={styles.sectionTitle}>{heading}</Text>
        {items.map((project) => {
          const meta = [
            omitKindLabel ? '' : projectKindLabel(project.kind),
            project.technologies.filter(Boolean).join(' · '),
          ]
            .filter(Boolean)
            .join(' · ');

          return (
            <View key={project.id} style={styles.projectItem} wrap={false}>
              <View style={styles.projectHeader} wrap={false}>
                <Text style={styles.projectTitle}>{project.name}</Text>
                {hasText(project.period) && <Text style={styles.projectPeriod}>{project.period}</Text>}
              </View>
              {hasText(meta) && <Text style={styles.projectMeta}>{meta}</Text>}
              {hasText(project.description) && (
                <Text style={styles.projectDescription}>{project.description}</Text>
              )}
              {hasText(project.link) && styles.projectLink && (
                <Link src={project.link} style={styles.projectLink}>
                  {project.link}
                </Link>
              )}
              {renderBulletList(project.bullets, styles)}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View>
      {renderProjectGroup(mainProjects, title)}
      {options.splitOngoingLearning &&
        renderProjectGroup(
          ongoingLearningProjects,
          options.ongoingLearningTitle ?? 'Ongoing Learning',
          true
        )}
    </View>
  );
}
