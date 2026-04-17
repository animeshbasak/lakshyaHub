// src/features/resume-builder/templates/TealSidebarTemplate.tsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';
import { ResumeData } from '@/types';
import { parseBoldText } from '../utils/parseBoldText';

const styles = StyleSheet.create({
  page: {
    size: 'A4',
    flexDirection: 'row',
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  sidebar: {
    width: '32%',
    backgroundColor: '#0D9488',
    color: '#FFFFFF',
    padding: 25,
    height: '100%',
  },
  main: {
    width: '68%',
    padding: 30,
  },
  sidebarSection: {
    marginBottom: 25,
  },
  sidebarTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.3)',
    paddingBottom: 4,
  },
  sidebarText: {
    fontSize: 9,
    lineHeight: 1.4,
    marginBottom: 4,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    color: '#0D9488',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 4,
  },
  entry: {
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  entryTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
  },
  entryDate: {
    fontSize: 9,
    color: '#6B7280',
  },
  company: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0D9488',
    marginBottom: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bulletDot: {
    width: 10,
    fontSize: 10,
    color: '#0D9488',
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: '#4B5563',
    lineHeight: 1.4,
  },
  bold: {
    fontWeight: 'bold',
    color: '#111827',
  },
});

export function TealSidebarTemplate({ data }: { data: ResumeData }) {
  const { header, summary, experience, education, skills, competencies } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* SIDEBAR */}
        <View style={styles.sidebar}>
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarTitle}>Contact</Text>
            <Text style={styles.sidebarText}>{header.email}</Text>
            <Text style={styles.sidebarText}>{header.phone}</Text>
            <Text style={styles.sidebarText}>{header.location}</Text>
            {header.linkedin && <Text style={styles.sidebarText}>{header.linkedin}</Text>}
          </View>

          {skills.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>Skills</Text>
              {skills.map(skill => (
                <View key={skill.id} style={{ marginBottom: 6 }}>
                  <Text style={[styles.sidebarText, { fontWeight: 'bold' }]}>{skill.category}</Text>
                  <Text style={styles.sidebarText}>{skill.values}</Text>
                </View>
              ))}
            </View>
          )}

          {education.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>Education</Text>
              {education.map(edu => (
                <View key={edu.id} style={{ marginBottom: 8 }}>
                  <Text style={[styles.sidebarText, { fontWeight: 'bold' }]}>{edu.degree}</Text>
                  <Text style={styles.sidebarText}>{edu.institution}</Text>
                  <Text style={[styles.sidebarText, { opacity: 0.8 }]}>{edu.period}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* MAIN CONTENT */}
        <View style={styles.main}>
          <View>
            <Text style={styles.name}>{header.name}</Text>
            {header.title && <Text style={styles.title}>{header.title}</Text>}
          </View>

          {summary.some(s => s.trim()) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Profile</Text>
              {summary.map((line, idx) => line.trim() && (
                <Text key={idx} style={{ fontSize: 9, color: '#4B5563', lineHeight: 1.4, marginBottom: 5 }}>{line}</Text>
              ))}
            </View>
          )}

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
                      <Text style={styles.bulletDot}>•</Text>
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
        </View>
      </Page>
    </Document>
  );
}
