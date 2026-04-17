// src/features/resume-builder/templates/ClassicTemplate.tsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';
import { ResumeData } from '@/types';
import { parseBoldText } from '../utils/parseBoldText';

const styles = StyleSheet.create({
  page: {
    size: 'A4',
    paddingTop: 36,
    paddingBottom: 36,
    paddingLeft: 48,
    paddingRight: 48,
    fontFamily: 'Times-Roman',
    backgroundColor: '#FFFFFF',
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Times-Bold',
    color: '#000000',
    marginBottom: 4,
  },
  titleLine: {
    fontSize: 12,
    fontFamily: 'Times-Roman',
    color: '#333333',
    marginBottom: 8,
  },
  contactContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  contact: {
    fontSize: 10,
    color: '#000000',
  },
  sectionHeaderBox: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    marginBottom: 8,
    marginTop: 12,
    paddingBottom: 2,
  },
  sectionHeader: {
    fontSize: 12,
    fontFamily: 'Times-Bold',
    color: '#000000',
    textTransform: 'uppercase',
    textAlign: 'center',
    letterSpacing: 1,
  },
  skillRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  skillLabel: {
    fontSize: 10,
    fontFamily: 'Times-Bold',
    color: '#000000',
    width: '20%',
  },
  skillValue: {
    fontSize: 10,
    color: '#000000',
    width: '80%',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  jobTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  jobTitle: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    color: '#000000',
  },
  jobCompany: {
    fontSize: 11,
    fontFamily: 'Times-Italic',
    color: '#000000',
  },
  jobDate: {
    fontSize: 10,
    fontFamily: 'Times-Roman',
    color: '#000000',
  },
  jobScale: {
    fontSize: 9,
    fontFamily: 'Times-Italic',
    color: '#555555',
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bulletDot: {
    width: 12,
    fontSize: 10,
    color: '#000000',
  },
  bulletTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bulletText: {
    fontSize: 10,
    color: '#000000',
    lineHeight: 1.4,
  },
  boldSpan: {
    fontFamily: 'Times-Bold',
  },
  summaryLine: {
    fontSize: 10,
    color: '#000000',
    lineHeight: 1.4,
    marginBottom: 4,
  },
  eduRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  pillText: {
    fontSize: 10,
    color: '#000000',
  },
});

export function ClassicTemplate({ data }: { data: ResumeData }) {
  const { header, summary, skills, experience, education, competencies } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        {header.name && (
          <View style={styles.headerBox}>
            <Text style={styles.name}>{header.name}</Text>
            {header.title && <Text style={styles.titleLine}>{header.title}</Text>}
            <View style={styles.contactContainer}>
              {header.email && <Text style={styles.contact}>{header.email}</Text>}
              {header.phone && <Text style={styles.contact}> | {header.phone}</Text>}
              {header.location && <Text style={styles.contact}> | {header.location}</Text>}
              {header.linkedin && (
                <Link src={`https://${header.linkedin}`} style={styles.contact}>
                  {' | '}{header.linkedin}
                </Link>
              )}
              {header.portfolio && (
                <Link src={`https://${header.portfolio}`} style={styles.contact}>
                  {' | '}{header.portfolio}
                </Link>
              )}
              {header.github && (
                <Link src={`https://${header.github}`} style={styles.contact}>
                  {' | '}{header.github}
                </Link>
              )}
            </View>
          </View>
        )}

        {/* SUMMARY */}
        {summary.some((s) => s.trim()) && (
          <View>
            <View style={styles.sectionHeaderBox}>
              <Text style={styles.sectionHeader}>Professional Summary</Text>
            </View>
            {summary.map((line, idx) => {
              if (!line.trim()) return null;
              return (
                <Text key={idx} style={styles.summaryLine}>
                  {line}
                </Text>
              );
            })}
          </View>
        )}

        {/* SKILLS */}
        {skills.some((s) => s.category.trim() || s.values.trim()) && (
          <View wrap={false}>
            <View style={styles.sectionHeaderBox}>
              <Text style={styles.sectionHeader}>Skills</Text>
            </View>
            {skills.map((skill) => (
              <View key={skill.id} style={styles.skillRow}>
                <Text style={styles.skillLabel}>{skill.category}</Text>
                <Text style={styles.skillValue}>{skill.values}</Text>
              </View>
            ))}
          </View>
        )}

        {/* EXPERIENCE */}
        {experience.some((j) => j.title.trim() || j.company.trim()) && (
          <View>
            <View style={styles.sectionHeaderBox}>
              <Text style={styles.sectionHeader}>Professional Experience</Text>
            </View>
            {experience.map((job) => (
              <View key={job.id} wrap={false} style={{ marginBottom: 10 }}>
                <View style={styles.jobHeader}>
                  <View style={styles.jobTitleRow}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.jobCompany}>, {job.company}</Text>
                  </View>
                  <Text style={styles.jobDate}>{job.period}</Text>
                </View>
                {job.scale && <Text style={styles.jobScale}>{job.scale}</Text>}

                {job.bullets.map((bullet) => {
                  if (!bullet.text.trim()) return null;
                  const segments = parseBoldText(bullet.text);
                  return (
                    <View key={bullet.id} style={styles.bulletRow}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>
                        {segments.map((seg, i) => (
                          <Text key={i} style={seg.bold ? styles.boldSpan : {}}>
                            {seg.text}
                          </Text>
                        ))}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        {/* EDUCATION */}
        {education.length > 0 && (
          <View>
            <View style={styles.sectionHeaderBox}>
              <Text style={styles.sectionHeader}>Education</Text>
            </View>
            {education.map((edu) => (
              <View key={edu.id} wrap={false} style={styles.eduRow}>
                <View>
                  <Text style={styles.jobTitle}>{edu.degree}</Text>
                  <Text style={styles.jobCompany}>{edu.institution}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.jobDate}>{edu.period}</Text>
                  {edu.grade && <Text style={styles.jobDate}>{edu.grade}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* COMPETENCIES */}
        {competencies.length > 0 && (
          <View wrap={false}>
            <View style={styles.sectionHeaderBox}>
              <Text style={styles.sectionHeader}>Core Competencies</Text>
            </View>
            <View style={styles.pillsContainer}>
              {competencies.map((comp, idx) => (
                <View key={idx}>
                  <Text style={styles.pillText}>{comp}{idx < competencies.length - 1 ? ', ' : ''}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
