// src/features/resume-builder/templates/LatexArticleTemplate.tsx
//
// LaTeX-article look rendered as a PDF directly via @react-pdf/renderer.
// Replaces the prior .tex export — user gets the LaTeX visual without
// installing a TeX toolchain or going through Overleaf.
//
// Design notes:
//   - 10.5pt body, 0.75" margins (matches `\documentclass[10.5pt]{article}`
//     with `\usepackage[margin=0.75in]{geometry}`).
//   - Times-Roman is the closest stock @react-pdf/renderer font to
//     Computer Modern. We don't ship a Latin Modern font asset to keep the
//     bundle small and CSP simple.
//   - Section headers: small-caps, light, with a hairline rule below
//     (mimicking `\titleformat{\section}{...}{0pt}{}[\titlerule]`).
//   - Italic company/institution names (`\textit{}` convention).
//   - Tight bullet spacing matches `\setlist[itemize]{leftmargin=14pt,
//     itemsep=2pt}`.

import React from 'react'
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer'
import { ResumeData } from '@/types'
import { TEMPLATE_RHYTHM, buildContactLinks, renderProjectSection, renderSkillRows, renderBulletList } from './rendering'

const styles = StyleSheet.create({
  page: {
    size: 'A4',
    paddingHorizontal: 54,   // 0.75" = 54pt
    paddingTop: 48,
    paddingBottom: 54,
    fontFamily: 'Times-Roman',
    fontSize: 10.5,
    backgroundColor: '#FFFFFF',
    color: '#1a1a1a',
  },
  // Header — left-aligned name + contact line. Contrasts with Harvard's
  // centered block; this is the academic-paper convention (LaTeX article
  // class with no-frills `\maketitle`).
  header: {
    marginBottom: 14,
  },
  name: {
    fontSize: 22,
    fontFamily: 'Times-Bold',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 11,
    fontFamily: 'Times-Italic',
    color: '#374151',
    marginBottom: 4,
  },
  contactLine: {
    fontSize: 9.5,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    color: '#374151',
  },
  contactSep: {
    fontSize: 9.5,
    color: '#9ca3af',
  },
  // Section header — small caps imitation via uppercase + letter-spacing,
  // followed by a hairline rule. There's no native small-caps support in
  // @react-pdf/renderer's stock fonts.
  sectionHeader: {
    fontSize: 10,
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginTop: 12,
    marginBottom: 2,
  },
  sectionRule: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#1a1a1a',
    marginBottom: 6,
  },
  summary: {
    fontSize: 10.5,
    lineHeight: 1.4,
    marginBottom: 4,
  },
  // Experience / education entry — title bold, dates right-aligned italic,
  // institution italic on its own line below.
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 1,
  },
  entryTitle: {
    flex: 1,
    fontSize: 10.5,
    fontFamily: 'Times-Bold',
    lineHeight: 1.24,
    paddingRight: 10,
  },
  entryDate: {
    width: 110,
    fontSize: 10,
    fontFamily: 'Times-Italic',
    textAlign: 'right',
    color: '#374151',
  },
  companyLine: {
    fontSize: 10.5,
    fontFamily: 'Times-Italic',
    color: '#1a1a1a',
    marginBottom: TEMPLATE_RHYTHM.metadataGap,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: TEMPLATE_RHYTHM.bulletGap,
    paddingLeft: 14,
  },
  bulletDot: {
    width: TEMPLATE_RHYTHM.bulletDotWidth,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 10.5,
    lineHeight: TEMPLATE_RHYTHM.paragraphLineHeight,
  },
  bold: {
    fontFamily: 'Times-Bold',
  },
  // Skills — single category per row, label bold left, list normal right.
  skillRow: {
    flexDirection: 'row',
    fontSize: 10.5,
    alignItems: 'flex-start',
    marginBottom: TEMPLATE_RHYTHM.skillsGap,
  },
  skillCategory: {
    fontFamily: 'Times-Bold',
    width: 88,
  },
  skillValues: {
    flex: 1,
    lineHeight: TEMPLATE_RHYTHM.paragraphLineHeight,
  },
  projectLink: {
    fontSize: 9.5,
    color: '#1d4ed8',
    fontFamily: 'Times-Italic',
    marginBottom: 2,
  },
})

export function LatexArticleTemplate({ data }: { data: ResumeData }) {
  const { header, summary, experience, education, skills, projects = [] } = data
  const contactLinks = buildContactLinks(header)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER — academic paper style (left-aligned, name large, italic title) */}
        <View style={styles.header}>
          <Text style={styles.name}>{header.name}</Text>
          {header.title && <Text style={styles.title}>{header.title}</Text>}
          <View style={styles.contactLine}>
            {header.email && <Text>{header.email}</Text>}
            {header.email && header.phone && <Text style={styles.contactSep}>·</Text>}
            {header.phone && <Text>{header.phone}</Text>}
            {(header.email || header.phone) && header.location && <Text style={styles.contactSep}>·</Text>}
            {header.location && <Text>{header.location}</Text>}
            {contactLinks.map((item, idx) => (
              <React.Fragment key={item.key}>
                <Text style={styles.contactSep}>{idx === 0 && (header.email || header.phone || header.location) ? '·' : '·'}</Text>
                <Link src={item.href} style={{ color: '#1d4ed8', textDecoration: 'none' }}>{item.label}</Link>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* SUMMARY (\section*{Summary}) */}
        {summary.some(s => s.trim()) && (
          <View>
            <Text style={styles.sectionHeader}>Summary</Text>
            <View style={styles.sectionRule} />
            {summary.map((line, idx) => line.trim() && (
              <Text key={idx} style={styles.summary}>{line}</Text>
            ))}
          </View>
        )}

        {/* EXPERIENCE */}
        {experience.length > 0 && (
          <View>
            <Text style={styles.sectionHeader}>Experience</Text>
            <View style={styles.sectionRule} />
            {experience.map(job => (
              <View key={job.id} style={{ marginBottom: TEMPLATE_RHYTHM.entryGap }}>
                <View wrap={false}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle}>{job.title}</Text>
                    <Text style={styles.entryDate}>{job.period}</Text>
                  </View>
                  <Text style={styles.companyLine}>{job.company}</Text>
                </View>
                {renderBulletList(job.bullets, {
                  bulletRow: styles.bulletRow,
                  bulletDot: styles.bulletDot,
                  bulletText: styles.bulletText,
                  bold: styles.bold,
                })}
              </View>
            ))}
          </View>
        )}

        {/* SKILLS */}
        {skills.length > 0 && (
          <View>
            <Text style={styles.sectionHeader}>Skills</Text>
            <View style={styles.sectionRule} />
            {renderSkillRows(skills, {
              skillRow: styles.skillRow,
              skillCategory: styles.skillCategory,
              skillValues: styles.skillValues,
            })}
          </View>
        )}

        {/* PROJECTS — dividerAfterTitle adds the hairline rule under
            "Projects" so the section matches the LaTeX visual rhythm of
            the rest of the template. */}
        {renderProjectSection(projects, {
          sectionTitle: styles.sectionHeader,
          projectItem: { marginBottom: TEMPLATE_RHYTHM.projectGap },
          projectHeader: styles.entryHeader,
          projectTitle: styles.entryTitle,
          projectPeriod: styles.entryDate,
          projectMeta: styles.companyLine,
          projectDescription: styles.summary,
          projectLink: styles.projectLink,
          bulletRow: styles.bulletRow,
          bulletDot: styles.bulletDot,
          bulletText: styles.bulletText,
          bold: styles.bold,
        }, 'Projects', {
          splitOngoingLearning: true,
          dividerAfterTitle: <View style={styles.sectionRule} />,
        })}

        {/* EDUCATION */}
        {education.length > 0 && (
          <View>
            <Text style={styles.sectionHeader}>Education</Text>
            <View style={styles.sectionRule} />
            {education.map(edu => (
              <View key={edu.id} style={{ marginBottom: TEMPLATE_RHYTHM.entryGap }}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{edu.degree}</Text>
                  <Text style={styles.entryDate}>{edu.period}</Text>
                </View>
                <Text style={styles.companyLine}>
                  {edu.institution}{edu.grade ? ` — ${edu.grade}` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  )
}
