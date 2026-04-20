// src/features/resume-builder/templates/ExecutiveTemplate.tsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';
import { ResumeData } from '@/types';
import { TEMPLATE_RHYTHM, buildContactLinks, renderBulletList, renderProjectSection, renderSkillRows } from './rendering';

const styles = StyleSheet.create({
  page: {
    size: 'A4',
    paddingTop: 30,
    paddingBottom: 30,
    paddingLeft: 40,
    paddingRight: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#475569',
    paddingBottom: 10,
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  title: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 5,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    fontSize: 9,
    color: '#64748B',
  },
  section: {
    marginTop: TEMPLATE_RHYTHM.sectionTop,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1,
    backgroundColor: '#F1F5F9',
    padding: 4,
    marginBottom: TEMPLATE_RHYTHM.sectionHeaderBottom,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 2,
  },
  entryTitle: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1E293B',
    lineHeight: 1.26,
    paddingRight: 10,
  },
  entryDate: {
    width: 108,
    fontSize: 9,
    color: '#64748B',
    textAlign: 'right',
  },
  companyLine: {
    fontSize: 10,
    color: '#334155',
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
    width: TEMPLATE_RHYTHM.bulletDotWidth,
    fontSize: 10,
    color: '#64748B',
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: '#334155',
    lineHeight: TEMPLATE_RHYTHM.paragraphLineHeight,
  },
  bold: {
    fontWeight: 'bold',
    color: '#0F172A',
  },
  skillGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: TEMPLATE_RHYTHM.skillsGap,
  },
  skillLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569',
    width: 92,
  },
  skillValue: {
    flex: 1,
    fontSize: 9,
    color: '#334155',
    lineHeight: TEMPLATE_RHYTHM.paragraphLineHeight,
  },
  projectLink: {
    fontSize: 8.5,
    color: '#2563EB',
    marginBottom: 3,
  },
  summaryLine: {
    fontSize: 9,
    color: '#334155',
    lineHeight: TEMPLATE_RHYTHM.paragraphLineHeight,
    marginBottom: 3,
  },
});

export function ExecutiveTemplate({ data }: { data: ResumeData }) {
  const { header, summary, experience, education, skills, projects = [] } = data;
  const contactLinks = buildContactLinks(header);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.name}>{header.name}</Text>
          {header.title && <Text style={styles.title}>{header.title}</Text>}
          <View style={styles.contactRow}>
            {header.email ? <Text>{header.email}</Text> : null}
            {header.phone ? <Text>{header.phone}</Text> : null}
            {header.location ? <Text>{header.location}</Text> : null}
            {contactLinks.map((item) => (
              <Link key={item.key} src={item.href}>
                {item.label}
              </Link>
            ))}
          </View>
        </View>

        {/* SUMMARY */}
        {summary.some(s => s.trim()) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            {summary.map((line, idx) => line.trim() && (
              <Text key={idx} style={styles.summaryLine}>{line}</Text>
            ))}
          </View>
        )}

        {/* EXPERIENCE */}
        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Background</Text>
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Core Expertise</Text>
            {renderSkillRows(skills, {
              skillRow: styles.skillGroup,
              skillCategory: styles.skillLabel,
              skillValues: styles.skillValue,
            })}
          </View>
        )}

        {renderProjectSection(projects, {
          sectionTitle: styles.sectionTitle,
          projectItem: { marginTop: 4, marginBottom: 8 },
          projectHeader: styles.entryHeader,
          projectTitle: styles.entryTitle,
          projectPeriod: styles.entryDate,
          projectMeta: styles.companyLine,
          projectDescription: styles.summaryLine,
          projectLink: styles.projectLink,
          bulletRow: styles.bulletRow,
          bulletDot: styles.bulletDot,
          bulletText: styles.bulletText,
          bold: styles.bold,
        }, 'Projects', { splitOngoingLearning: true })}

        {/* EDUCATION */}
        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map(edu => (
              <View key={edu.id} style={{ marginBottom: TEMPLATE_RHYTHM.entryGap - 2 }} wrap={false}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{edu.degree}</Text>
                  <Text style={styles.entryDate}>{edu.period}</Text>
                </View>
                <Text style={{ fontSize: 9, color: '#475569' }}>{edu.institution}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
