// src/features/resume-builder/templates/ModernTemplate.tsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';
import { ResumeData } from '@/types';
import { parseBoldText } from '../utils/parseBoldText';

const styles = StyleSheet.create({
  page: {
    size: 'A4',
    paddingTop: 28,
    paddingBottom: 22,
    paddingLeft: 38,
    paddingRight: 38,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  name: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: '#2563EB',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  titleLine: {
    fontSize: 10.5,
    color: '#2563EB',
    marginTop: 4,
  },
  contactContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 8,
  },
  contact: {
    fontSize: 8.2,
    color: '#1F2937',
  },
  sectionHeader: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    backgroundColor: '#1E293B',
    paddingVertical: 4,
    paddingHorizontal: 8,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 6,
    borderRadius: 2,
  },
  sectionRule: {
    display: 'none',
  },
  heavyRule: {
    borderBottomWidth: 1.4,
    borderBottomColor: '#1A2B4A',
    marginTop: 5,
    marginBottom: 0,
  },
  skillRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  skillLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#1A2B4A',
    width: '24%',
  },
  skillValue: {
    fontSize: 8,
    color: '#1F2937',
    width: '76%',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1A2B4A',
  },
  jobCompany: {
    fontSize: 8.2,
    color: '#1F2937',
  },
  jobDate: {
    fontSize: 8,
    color: '#6B7280',
  },
  jobScale: {
    fontSize: 7.5,
    color: '#2563EB',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bulletDot: {
    width: 10,
    fontSize: 8,
    color: '#1F2937',
  },
  bulletTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bulletText: {
    fontSize: 8,
    color: '#1F2937',
    lineHeight: 1.55,
  },
  boldSpan: {
    fontFamily: 'Helvetica-Bold',
  },
  summaryLine: {
    fontSize: 8,
    color: '#1F2937',
    lineHeight: 1.55,
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
  pillContainer: {
    backgroundColor: '#EEF2FF',
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginRight: 4,
    marginBottom: 4,
  },
  pillText: {
    fontSize: 7.4,
    color: '#1E3A5F',
  },
});

export function ModernTemplate({ data }: { data: ResumeData }) {
  const { header, summary, skills, experience, education, competencies } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        {header.name && (
          <View>
            <Text style={styles.name}>{header.name}</Text>
            {header.title && <Text style={styles.titleLine}>{header.title}</Text>}
            <View style={styles.contactContainer}>
              {header.email && <Text style={styles.contact}>{header.email}</Text>}
              {header.phone && <Text style={styles.contact}> • {header.phone}</Text>}
              {header.location && <Text style={styles.contact}> • {header.location}</Text>}
              {header.linkedin && (
                <Link src={`https://${header.linkedin}`} style={styles.contact}>
                  {' • '}{header.linkedin}
                </Link>
              )}
              {header.portfolio && (
                <Link src={`https://${header.portfolio}`} style={styles.contact}>
                  {' • '}{header.portfolio}
                </Link>
              )}
              {header.github && (
                <Link src={`https://${header.github}`} style={styles.contact}>
                  {' • '}{header.github}
                </Link>
              )}
            </View>
            <View style={styles.heavyRule} />
          </View>
        )}

        {/* SUMMARY */}
        {summary.some((s) => s.trim()) && (
          <View>
            <Text style={styles.sectionHeader}>SUMMARY</Text>
            <View style={styles.sectionRule} />
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
            <Text style={styles.sectionHeader}>SKILLS</Text>
            <View style={styles.sectionRule} />
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
            <Text style={styles.sectionHeader}>EXPERIENCE</Text>
            <View style={styles.sectionRule} />
            {experience.map((job) => (
              <View key={job.id} wrap={false} style={{ marginBottom: 10 }}>
                <View style={styles.jobHeader}>
                  <View>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.jobCompany}>{job.company}</Text>
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
            <Text style={styles.sectionHeader}>EDUCATION</Text>
            <View style={styles.sectionRule} />
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
            <Text style={styles.sectionHeader}>CORE COMPETENCIES</Text>
            <View style={styles.sectionRule} />
            <View style={styles.pillsContainer}>
              {competencies.map((comp, idx) => (
                <View key={idx} style={styles.pillContainer}>
                  <Text style={styles.pillText}>{comp}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
