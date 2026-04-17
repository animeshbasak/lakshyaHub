// src/features/resume-builder/templates/CompactProTemplate.tsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';
import { ResumeData } from '@/types';
import { TEMPLATE_RHYTHM, buildContactLinks, renderBulletList, renderProjectSection, renderSkillRows } from './rendering';

const styles = StyleSheet.create({
  page: {
    size: 'A4',
    padding: 25,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderBottomColor: '#1F2937',
    paddingBottom: 8,
    marginBottom: 10,
    gap: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  contactCol: {
    alignItems: 'flex-end',
    maxWidth: 210,
  },
  contactText: {
    fontSize: 8,
    color: '#4B5563',
    marginBottom: 1,
    textAlign: 'right',
  },
  section: {
    marginBottom: 4,
  },
  summarySection: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1F2937',
    textTransform: 'uppercase',
    backgroundColor: '#F3F4F6',
    padding: 3,
    marginBottom: TEMPLATE_RHYTHM.sectionHeaderBottom,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 2,
  },
  entryTitle: {
    flex: 1,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 1.26,
    paddingRight: 8,
  },
  entryDate: {
    width: 90,
    fontSize: 8,
    color: '#6B7280',
    textAlign: 'right',
  },
  companyLine: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#374151',
    lineHeight: TEMPLATE_RHYTHM.paragraphLineHeight,
    marginBottom: TEMPLATE_RHYTHM.metadataGap,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: TEMPLATE_RHYTHM.bulletGap,
    paddingLeft: TEMPLATE_RHYTHM.bulletIndent - 2,
  },
  bulletDot: {
    width: TEMPLATE_RHYTHM.bulletDotWidth - 1,
    fontSize: 8,
    color: '#4B5563',
  },
  bulletText: {
    flex: 1,
    fontSize: 8.5,
    color: '#374151',
    lineHeight: TEMPLATE_RHYTHM.paragraphLineHeight,
  },
  bold: {
    fontWeight: 'bold',
    color: '#000000',
  },
  skillGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: TEMPLATE_RHYTHM.skillsGap,
  },
  skillLabel: {
    fontWeight: 'bold',
    width: 84,
    fontSize: 8.5,
  },
  skillValue: {
    flex: 1,
    fontSize: 8.5,
    lineHeight: TEMPLATE_RHYTHM.paragraphLineHeight,
  },
  summaryLine: {
    fontSize: 10,
    color: '#444444',
    lineHeight: TEMPLATE_RHYTHM.paragraphLineHeight,
    marginBottom: 4,
  },
  projectLink: {
    fontSize: 8,
    color: '#2563EB',
    marginBottom: 3,
  },
});

export function CompactProTemplate({ data }: { data: ResumeData }) {
  const { header, summary, experience, education, skills, projects = [] } = data;
  const contactLinks = buildContactLinks(header);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.name}>{header.name}</Text>
            <Text style={{ fontSize: 10, color: '#4B5563', lineHeight: 1.3 }}>{header.title}</Text>
          </View>
          <View style={styles.contactCol}>
            {(header.email || header.phone) && (
              <Text style={styles.contactText}>
                {[header.email, header.phone].filter(Boolean).join(' | ')}
              </Text>
            )}
            {header.location ? <Text style={styles.contactText}>{header.location}</Text> : null}
            {contactLinks.map((item) => (
              <Link key={item.key} src={item.href} style={styles.contactText}>
                {item.label}
              </Link>
            ))}
          </View>
        </View>

        {/* SUMMARY */}
        {summary.some(s => s.trim()) && (
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Summary</Text>
            {summary.map((line, idx) => line.trim() && (
              <Text key={idx} style={styles.summaryLine}>{line}</Text>
            ))}
          </View>
        )}

        {/* EXPERIENCE */}
        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map(job => (
              <View key={job.id} style={{ marginBottom: TEMPLATE_RHYTHM.entryGap - 2 }}>
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills & Technologies</Text>
            {renderSkillRows(skills, {
              skillRow: styles.skillGroup,
              skillCategory: styles.skillLabel,
              skillValues: styles.skillValue,
            })}
          </View>
        )}

        {renderProjectSection(projects, {
          sectionTitle: styles.sectionTitle,
          projectItem: { marginBottom: TEMPLATE_RHYTHM.projectGap - 1 },
          projectHeader: styles.entryHeader,
          projectTitle: styles.entryTitle,
          projectPeriod: styles.entryDate,
          projectMeta: styles.companyLine,
          projectDescription: styles.bulletText,
          projectLink: styles.projectLink,
          bulletRow: styles.bulletRow,
          bulletDot: styles.bulletDot,
          bulletText: styles.bulletText,
          bold: styles.bold,
        }, 'Projects & Side Builds', { splitOngoingLearning: true })}

        {/* EDUCATION */}
        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map(edu => (
              <View key={edu.id} style={{ marginBottom: 3 }} wrap={false}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{edu.institution}</Text>
                  <Text style={styles.entryDate}>{edu.period}</Text>
                </View>
                <Text style={{ fontSize: 8.5 }}>{edu.degree} · {edu.grade || ''}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
