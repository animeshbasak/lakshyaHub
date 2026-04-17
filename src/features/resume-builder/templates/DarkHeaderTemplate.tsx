// src/features/resume-builder/templates/DarkHeaderTemplate.tsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';
import { ResumeData } from '@/types';
import { parseBoldText } from '../utils/parseBoldText';

const styles = StyleSheet.create({
  page: {
    size: 'A4',
    padding: 0,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    padding: 30,
    paddingBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 15,
    fontSize: 9,
    color: '#CBD5E1',
  },
  content: {
    padding: 30,
    paddingTop: 15,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: 15,
    marginBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#1E293B',
    paddingBottom: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  entryTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  entryDate: {
    fontSize: 9,
    color: '#64748B',
  },
  companyLine: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bulletDot: {
    width: 10,
    fontSize: 10,
    color: '#1E293B',
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
});

export function DarkHeaderTemplate({ data }: { data: ResumeData }) {
  const { header, summary, experience, education, skills } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.name}>{header.name}</Text>
          {header.title && <Text style={styles.title}>{header.title}</Text>}
          <View style={styles.contactRow}>
            <Text>{header.email}</Text>
            <Text>{header.phone}</Text>
            <Text>{header.location}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* SUMMARY */}
          {summary.some(s => s.trim()) && (
            <View>
              <Text style={styles.sectionTitle}>About Me</Text>
              {summary.map((line, idx) => line.trim() && (
                <Text key={idx} style={{ fontSize: 9, color: '#334155', lineHeight: 1.4, marginBottom: 5 }}>{line}</Text>
              ))}
            </View>
          )}

          {/* EXPERIENCE */}
          {experience.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Experience</Text>
              {experience.map(job => (
                <View key={job.id} style={{ marginBottom: 10 }}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle}>{job.title}</Text>
                    <Text style={styles.entryDate}>{job.period}</Text>
                  </View>
                  <Text style={styles.companyLine}>{job.company}</Text>
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
