// src/features/resume-builder/templates/MinimalTemplate.tsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';
import { ResumeData } from '@/types';
import { parseBoldText } from '../utils/parseBoldText';
import { renderProjectSection } from './rendering';

const styles = StyleSheet.create({
  page: {
    size: 'A4',
    padding: 50,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 30,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: -1,
    marginBottom: 2,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 15,
    fontSize: 10,
    color: '#666666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  entry: {
    marginBottom: 15,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  entryTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
  },
  entryDate: {
    fontSize: 10,
    color: '#999999',
  },
  company: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 5,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bulletDot: {
    width: 6,
    fontSize: 10,
    color: '#CCCCCC',
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.5,
  },
  bold: {
    fontWeight: 'bold',
    color: '#000000',
  },
  skillRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  skillCategory: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
    width: '20%',
  },
  skillValues: {
    fontSize: 10,
    color: '#666666',
    width: '80%',
  },
});

export function MinimalTemplate({ data }: { data: ResumeData }) {
  const { header, summary, experience, education, skills, projects = [] } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.name}>{header.name}</Text>
          <View style={styles.contactRow}>
            <Text>{header.email}</Text>
            <Text>{header.phone}</Text>
            <Text>{header.location}</Text>
          </View>
        </View>

        {/* SUMMARY */}
        {summary.some(s => s.trim()) && (
          <View style={styles.section}>
            {summary.map((line, idx) => line.trim() && (
              <Text key={idx} style={{ fontSize: 10, color: '#444444', lineHeight: 1.5, marginBottom: 5 }}>{line}</Text>
            ))}
          </View>
        )}

        {/* EXPERIENCE */}
        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map(job => (
              <View key={job.id} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{job.title}</Text>
                  <Text style={styles.entryDate}>{job.period}</Text>
                </View>
                <Text style={styles.company}>{job.company}</Text>
                {job.bullets.map(bullet => bullet.text.trim() && (
                  <View key={bullet.id} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>-</Text>
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

        {renderProjectSection(projects, {
          sectionTitle: styles.sectionTitle,
          projectItem: styles.entry,
          projectHeader: styles.entryHeader,
          projectTitle: styles.entryTitle,
          projectPeriod: styles.entryDate,
          projectMeta: styles.company,
          projectDescription: { fontSize: 10, color: '#333333', lineHeight: 1.5, marginBottom: 4 },
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
              <View key={edu.id} style={{ marginBottom: 8 }}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{edu.degree}</Text>
                  <Text style={styles.entryDate}>{edu.period}</Text>
                </View>
                <Text style={styles.company}>{edu.institution}</Text>
              </View>
            ))}
          </View>
        )}

        {/* SKILLS */}
        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {skills.map(skill => (
              <View key={skill.id} style={styles.skillRow}>
                <Text style={styles.skillCategory}>{skill.category}</Text>
                <Text style={styles.skillValues}>{skill.values}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
