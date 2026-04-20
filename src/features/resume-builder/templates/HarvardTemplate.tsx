// src/features/resume-builder/templates/HarvardTemplate.tsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';
import { ResumeData } from '@/types';
import { TEMPLATE_RHYTHM, buildContactLinks, renderProjectSection, renderSkillRows, renderBulletList } from './rendering';

const styles = StyleSheet.create({
  page: {
    size: 'A4',
    padding: 60,
    fontFamily: 'Times-Roman',
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  title: {
    fontSize: 10.5,
    marginBottom: 4,
  },
  contactLine: {
    fontSize: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 5,
    textAlign: 'center',
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#000000',
    marginVertical: 4,
  },
  sectionHeader: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase',
    textDecoration: 'underline',
    marginTop: TEMPLATE_RHYTHM.sectionTop,
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
    fontFamily: 'Times-Bold',
    lineHeight: 1.24,
    paddingRight: 10,
  },
  entryDate: {
    width: 108,
    fontSize: 10,
    fontFamily: 'Times-Bold',
    textAlign: 'right',
  },
  companyLine: {
    fontSize: 10,
    lineHeight: 1.3,
    marginBottom: TEMPLATE_RHYTHM.metadataGap,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: TEMPLATE_RHYTHM.bulletGap,
    paddingLeft: TEMPLATE_RHYTHM.bulletIndent,
  },
  bulletDot: {
    width: TEMPLATE_RHYTHM.bulletDotWidth,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: TEMPLATE_RHYTHM.paragraphLineHeight,
  },
  bold: {
    fontFamily: 'Times-Bold',
  },
  summary: {
    fontSize: 10,
    lineHeight: TEMPLATE_RHYTHM.paragraphLineHeight,
    marginBottom: 4,
  },
  skillRow: {
    flexDirection: 'row',
    fontSize: 10,
    alignItems: 'flex-start',
    marginBottom: TEMPLATE_RHYTHM.skillsGap,
  },
  skillCategory: {
    fontFamily: 'Times-Bold',
    width: 92,
  },
  skillValues: {
    flex: 1,
    lineHeight: TEMPLATE_RHYTHM.paragraphLineHeight,
  },
  projectLink: {
    fontSize: 9.5,
    color: '#1D4ED8',
    marginBottom: 3,
  },
  sectionBlock: {
    marginBottom: 2,
  },
});

export function HarvardTemplate({ data }: { data: ResumeData }) {
  const { header, summary, experience, education, skills, projects = [] } = data;
  const contactLinks = buildContactLinks(header);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.name}>{header.name}</Text>
          {header.title && <Text style={styles.title}>{header.title}</Text>}
          <View style={styles.contactLine}>
            {header.email ? <Text>{header.email}</Text> : null}
            {header.email && header.phone ? <Text>·</Text> : null}
            {header.phone ? <Text>{header.phone}</Text> : null}
            {(header.email || header.phone) && header.location ? <Text>·</Text> : null}
            {header.location ? <Text>{header.location}</Text> : null}
            {contactLinks.map((item) => (
              <React.Fragment key={item.key}>
                <Text>·</Text>
                <Link src={item.href}>{item.label}</Link>
              </React.Fragment>
            ))}
          </View>
        </View>
        <View style={styles.divider} />

        {/* SUMMARY / OBJECTIVE */}
        {summary.some(s => s.trim()) && (
          <View>
            <Text style={styles.sectionHeader}>Summary</Text>
            {summary.map((line, idx) => line.trim() && (
              <Text key={idx} style={styles.summary}>{line}</Text>
            ))}
          </View>
        )}

        {/* EXPERIENCE */}
        {experience.length > 0 && (
          <View>
            <Text style={styles.sectionHeader}>Experience</Text>
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
            {renderSkillRows(skills, {
              skillRow: styles.skillRow,
              skillCategory: styles.skillCategory,
              skillValues: styles.skillValues,
            })}
          </View>
        )}

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
        }, 'Projects', { splitOngoingLearning: true })}

        {/* EDUCATION */}
        {education.length > 0 && (
          <View>
            <Text style={styles.sectionHeader}>Education</Text>
            {education.map(edu => (
              <View key={edu.id} style={{ marginBottom: TEMPLATE_RHYTHM.entryGap - 1 }} wrap={false}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{edu.institution}</Text>
                  <Text style={styles.entryDate}>{edu.period}</Text>
                </View>
                <Text style={styles.companyLine}>{edu.degree} {edu.grade ? `(${edu.grade})` : ''}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
