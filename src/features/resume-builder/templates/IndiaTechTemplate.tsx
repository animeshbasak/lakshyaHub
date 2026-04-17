// src/features/resume-builder/templates/IndiaTechTemplate.tsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';
import { ResumeData } from '@/types';
import { parseBoldText } from '../utils/parseBoldText';

const styles = StyleSheet.create({
  page: {
    size: 'A4',
    padding: 35,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    marginBottom: 15,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  contactRow: {
    flexDirection: 'row',
    gap: 10,
    fontSize: 9,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    marginTop: 12,
    marginBottom: 6,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  entryTitle: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  entryDate: {
    fontSize: 9,
  },
  companyLine: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 3,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 10,
  },
  bulletDot: {
    width: 10,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    color: '#333333',
    lineHeight: 1.3,
  },
  bold: {
    fontWeight: 'bold',
    color: '#000000',
  },
  skillRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  skillCategory: {
    fontSize: 9.5,
    fontWeight: 'bold',
    width: 120,
  },
  skillValues: {
    fontSize: 9.5,
    flex: 1,
  },
});

export function IndiaTechTemplate({ data }: { data: ResumeData }) {
  const { header, skills, experience, education } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.name}>{header.name}</Text>
          <View style={styles.contactRow}>
            <Text>{header.email}</Text>
            <Text>|</Text>
            <Text>{header.phone}</Text>
            <Text>|</Text>
            <Text>{header.location}</Text>
          </View>
          <View style={styles.contactRow}>
            {header.linkedin && <Link src={`https://${header.linkedin}`}>{header.linkedin}</Link>}
            {header.github && <><Text>|</Text><Link src={`https://${header.github}`}>{header.github}</Link></>}
          </View>
        </View>

        {/* SKILLS */}
        {skills.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Technical Skills</Text>
            {skills.map(skill => (
              <View key={skill.id} style={styles.skillRow}>
                <Text style={styles.skillCategory}>{skill.category}:</Text>
                <Text style={styles.skillValues}>{skill.values}</Text>
              </View>
            ))}
          </View>
        )}

        {/* EXPERIENCE */}
        {experience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {experience.map(job => (
              <View key={job.id} style={{ marginBottom: 8 }}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{job.company}</Text>
                  <Text style={styles.entryDate}>{job.period}</Text>
                </View>
                <Text style={styles.companyLine}>{job.title}</Text>
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

        {/* EDUCATION */}
        {education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map(edu => (
              <View key={edu.id} style={{ marginBottom: 4 }}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{edu.institution}</Text>
                  <Text style={styles.entryDate}>{edu.period}</Text>
                </View>
                <Text style={{ fontSize: 9.5 }}>{edu.degree} | {edu.grade || ''}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
