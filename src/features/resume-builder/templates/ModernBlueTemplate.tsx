// src/features/resume-builder/templates/ModernBlueTemplate.tsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';
import { ResumeData } from '@/types';
import { parseBoldText } from '../utils/parseBoldText';
import { renderProjectSection } from './rendering';

const styles = StyleSheet.create({
  page: {
    size: 'A4',
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  accentLine: {
    height: 3,
    backgroundColor: '#2563EB',
    width: '100%',
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    fontSize: 9,
    color: '#64748B',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2563EB',
    textTransform: 'uppercase',
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
    paddingLeft: 8,
    marginTop: 15,
    marginBottom: 8,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  entryTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  entryDate: {
    fontSize: 9,
    color: '#64748B',
  },
  companyLine: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bulletDot: {
    width: 10,
    fontSize: 10,
    color: '#2563EB',
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: '#334155',
    lineHeight: 1.4,
  },
  bold: {
    fontWeight: 'bold',
    color: '#0F172A',
  },
  skillRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  skillCategory: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569',
    width: '25%',
  },
  skillValues: {
    fontSize: 9,
    color: '#334155',
    width: '75%',
  },
});

export function ModernBlueTemplate({ data }: { data: ResumeData }) {
  const { header, summary, experience, education, skills, projects = [] } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.name}>{header.name}</Text>
          <View style={styles.accentLine} />
          <View style={styles.contactRow}>
            <Text>{header.email}</Text>
            <Text>{header.phone}</Text>
            <Text>{header.location}</Text>
            {header.linkedin && <Link src={`https://${header.linkedin}`}>{header.linkedin}</Link>}
          </View>
        </View>

        {/* SUMMARY */}
        {summary.some(s => s.trim()) && (
          <View>
            <Text style={styles.sectionHeader}>Summary</Text>
            {summary.map((line, idx) => line.trim() && (
              <Text key={idx} style={{ fontSize: 9, color: '#334155', marginBottom: 4 }}>{line}</Text>
            ))}
          </View>
        )}

        {/* EXPERIENCE */}
        {experience.length > 0 && (
          <View>
            <Text style={styles.sectionHeader}>Professional Experience</Text>
            {experience.map(job => (
              <View key={job.id} style={{ marginBottom: 10 }}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{job.title}</Text>
                  <Text style={styles.entryDate}>{job.period}</Text>
                </View>
                <Text style={styles.companyLine}>{job.company}</Text>
                {job.bullets.map(bullet => bullet.text.trim() && (
                  <View key={bullet.id} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>▪</Text>
                    <Text style={styles.bulletText}>
                      {parseBoldText(bullet.text).map((seg, i) => (
                        <Text key={i} style={seg.bold ? styles.bold : {}}>{seg.text}</Text>
                      ))}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* SKILLS */}
        {skills.length > 0 && (
          <View>
            <Text style={styles.sectionHeader}>Technical Arsenal</Text>
            {skills.map(skill => (
              <View key={skill.id} style={styles.skillRow}>
                <Text style={styles.skillCategory}>{skill.category}</Text>
                <Text style={styles.skillValues}>{skill.values}</Text>
              </View>
            ))}
          </View>
        )}

        {renderProjectSection(projects, {
          sectionTitle: styles.sectionHeader,
          projectItem: { marginBottom: 10 },
          projectHeader: styles.entryHeader,
          projectTitle: styles.entryTitle,
          projectPeriod: styles.entryDate,
          projectMeta: styles.companyLine,
          projectDescription: { fontSize: 9, color: '#334155', marginBottom: 4, lineHeight: 1.4 },
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
              <View key={edu.id} style={{ marginBottom: 6 }}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{edu.institution}</Text>
                  <Text style={styles.entryDate}>{edu.period}</Text>
                </View>
                <Text style={{ fontSize: 9, color: '#475569' }}>{edu.degree} {edu.grade ? `· ${edu.grade}` : ''}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
