// src/features/resume-builder/templates/WarmSerifTemplate.tsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';
import { ResumeData } from '@/types';
import { parseBoldText } from '../utils/parseBoldText';
import { renderProjectSection } from './rendering';

const styles = StyleSheet.create({
  page: {
    size: 'A4',
    padding: 60,
    fontFamily: 'Times-Roman',
    backgroundColor: '#FFFCF8',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#92400E',
    paddingBottom: 10,
  },
  name: {
    fontSize: 26,
    fontFamily: 'Times-Bold',
    color: '#78350F',
    marginBottom: 2,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 12,
    fontSize: 9,
    color: '#92400E',
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    color: '#78350F',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 15,
    marginBottom: 8,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  entryTitle: {
    fontSize: 10,
    fontFamily: 'Times-Bold',
    color: '#451A03',
  },
  entryDate: {
    fontSize: 9,
    fontFamily: 'Times-Italic',
    color: '#92400E',
  },
  companyLine: {
    fontSize: 10,
    color: '#78350F',
    marginBottom: 5,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bulletDot: {
    width: 10,
    fontSize: 10,
    color: '#D97706',
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    color: '#451A03',
    lineHeight: 1.4,
  },
  bold: {
    fontFamily: 'Times-Bold',
    color: '#000000',
  },
});

export function WarmSerifTemplate({ data }: { data: ResumeData }) {
  const { header, summary, experience, education, skills, projects = [] } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.name}>{header.name}</Text>
          <View style={styles.contactRow}>
            <Text>{header.email}</Text>
            <Text>•</Text>
            <Text>{header.phone}</Text>
            <Text>•</Text>
            <Text>{header.location}</Text>
          </View>
        </View>

        {/* SUMMARY */}
        {summary.some(s => s.trim()) && (
          <View>
            <Text style={styles.sectionTitle}>Philosophy & Goals</Text>
            {summary.map((line, idx) => line.trim() && (
              <Text key={idx} style={{ fontSize: 9.5, color: '#451A03', lineHeight: 1.4, marginBottom: 5 }}>{line}</Text>
            ))}
          </View>
        )}

        {/* EXPERIENCE */}
        {experience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Career Path</Text>
            {experience.map(job => (
              <View key={job.id} style={{ marginBottom: 10 }}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{job.title}</Text>
                  <Text style={styles.entryDate}>{job.period}</Text>
                </View>
                <Text style={styles.companyLine}>{job.company}</Text>
                {job.bullets.map(bullet => bullet.text.trim() && (
                  <View key={bullet.id} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>»</Text>
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
          projectItem: { marginBottom: 10 },
          projectHeader: styles.entryHeader,
          projectTitle: styles.entryTitle,
          projectPeriod: styles.entryDate,
          projectMeta: styles.companyLine,
          projectDescription: { fontSize: 9.5, color: '#451A03', lineHeight: 1.4, marginBottom: 4 },
          bulletRow: styles.bulletRow,
          bulletDot: styles.bulletDot,
          bulletText: styles.bulletText,
          bold: styles.bold,
        }, 'Projects', { splitOngoingLearning: true })}

        {/* SKILLS */}
        {skills.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Skills</Text>
            {skills.map(skill => (
              <View key={skill.id} style={{ flexDirection: 'row', marginBottom: 3 }}>
                <Text style={{ fontSize: 9.5, fontFamily: 'Times-Bold', color: '#78350F', width: '25%' }}>{skill.category}</Text>
                <Text style={{ fontSize: 9.5, color: '#451A03', width: '75%' }}>{skill.values}</Text>
              </View>
            ))}
          </View>
        )}

        {/* EDUCATION */}
        {education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map(edu => (
              <View key={edu.id} style={{ marginBottom: 6 }}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{edu.degree}</Text>
                  <Text style={styles.entryDate}>{edu.period}</Text>
                </View>
                <Text style={styles.companyLine}>{edu.institution}{edu.grade ? ` · ${edu.grade}` : ''}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
