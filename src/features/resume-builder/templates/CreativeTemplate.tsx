// src/features/resume-builder/templates/CreativeTemplate.tsx
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
    width: '35%',
    backgroundColor: '#1E293B',
    padding: 30,
    color: '#F8FAFC',
    height: '100%',
  },
  main: {
    width: '65%',
    padding: 36,
    paddingTop: 48,
    backgroundColor: '#FFFFFF',
  },
  name: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  titleLine: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#3B82F6',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sidebarSection: {
    marginBottom: 24,
  },
  sidebarHeader: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 4,
  },
  contactItem: {
    fontSize: 9,
    color: '#CBD5E1',
    marginBottom: 6,
    lineHeight: 1.4,
  },
  contactLink: {
    color: '#60A5FA',
    textDecoration: 'none',
  },
  skillCategory: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  skillValue: {
    fontSize: 8.5,
    color: '#94A3B8',
    marginBottom: 8,
    lineHeight: 1.3,
  },
  eduDegree: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#F8FAFC',
  },
  eduInst: {
    fontSize: 8.5,
    color: '#CBD5E1',
    marginTop: 2,
  },
  eduDate: {
    fontSize: 8,
    color: '#64748B',
    marginTop: 2,
  },
  mainHeader: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  summaryLine: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.5,
    marginBottom: 6,
  },
  jobBlock: {
    marginBottom: 16,
  },
  jobHeader: {
    marginBottom: 4,
  },
  jobTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
  },
  jobCompany: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#3B82F6',
  },
  jobDate: {
    fontSize: 9,
    color: '#64748B',
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bulletDot: {
    width: 12,
    fontSize: 10,
    color: '#3B82F6',
  },
  bulletTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bulletText: {
    fontSize: 9.5,
    color: '#334155',
    lineHeight: 1.4,
  },
  boldSpan: {
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
  },
  compPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  compPill: {
    fontSize: 8,
    backgroundColor: '#334155',
    color: '#F8FAFC',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 2,
    marginBottom: 4,
  },
});

export function CreativeTemplate({ data }: { data: ResumeData }) {
  const { header, summary, skills, experience, education, competencies } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* LEFT SIDEBAR */}
        <View style={styles.sidebar}>

          {/* CONTACT INFO */}
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarHeader}>Contact</Text>
            {header.email && <Text style={styles.contactItem}>{header.email}</Text>}
            {header.phone && <Text style={styles.contactItem}>{header.phone}</Text>}
            {header.location && <Text style={styles.contactItem}>{header.location}</Text>}
            {header.linkedin && (
              <Text style={styles.contactItem}>
                <Link src={`https://${header.linkedin}`} style={styles.contactLink}>{header.linkedin}</Link>
              </Text>
            )}
            {header.portfolio && (
              <Text style={styles.contactItem}>
                <Link src={`https://${header.portfolio}`} style={styles.contactLink}>{header.portfolio}</Link>
              </Text>
            )}
            {header.github && (
              <Text style={styles.contactItem}>
                <Link src={`https://${header.github}`} style={styles.contactLink}>{header.github}</Link>
              </Text>
            )}
          </View>

          {/* SKILLS */}
          {skills.some((s) => s.category.trim() || s.values.trim()) && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarHeader}>Expertise</Text>
              {skills.map((skill) => (
                <View key={skill.id}>
                  <Text style={styles.skillCategory}>{skill.category}</Text>
                  <Text style={styles.skillValue}>{skill.values}</Text>
                </View>
              ))}
            </View>
          )}

          {/* EDUCATION */}
          {education.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarHeader}>Education</Text>
              {education.map((edu) => (
                <View key={edu.id} style={{ marginBottom: 10 }}>
                  <Text style={styles.eduDegree}>{edu.degree}</Text>
                  <Text style={styles.eduInst}>{edu.institution}</Text>
                  <Text style={styles.eduDate}>{edu.period}</Text>
                  {edu.grade && <Text style={styles.eduDate}>Score: {edu.grade}</Text>}
                </View>
              ))}
            </View>
          )}

          {/* COMPETENCIES */}
          {competencies.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarHeader}>Core Competencies</Text>
              <View style={styles.compPills}>
                {competencies.map((comp, idx) => (
                  <Text key={idx} style={styles.compPill}>{comp}</Text>
                ))}
              </View>
            </View>
          )}

        </View>

        {/* RIGHT MAIN CONTENT */}
        <View style={styles.main}>
          {header.name && (
            <View>
              <Text style={styles.name}>{header.name}</Text>
              {header.title && <Text style={styles.titleLine}>{header.title}</Text>}
            </View>
          )}

          {summary.some((s) => s.trim()) && (
            <View style={{ marginBottom: 24 }}>
              <Text style={styles.mainHeader}>Profile</Text>
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

          {experience.some((j) => j.title.trim() || j.company.trim()) && (
            <View>
              <Text style={styles.mainHeader}>Experience</Text>
              {experience.map((job) => (
                <View key={job.id} wrap={false} style={styles.jobBlock}>
                  <View style={styles.jobHeader}>
                    <View style={styles.jobTitleRow}>
                      <Text style={styles.jobTitle}>{job.title}</Text>
                      <Text style={styles.jobDate}>{job.period}</Text>
                    </View>
                    <Text style={styles.jobCompany}>{job.company}</Text>
                  </View>

                  {job.bullets.map((bullet) => {
                    if (!bullet.text.trim()) return null;
                    const segments = parseBoldText(bullet.text);
                    return (
                      <View key={bullet.id} style={styles.bulletRow}>
                        <Text style={styles.bulletDot}>▸</Text>
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
        </View>

      </Page>
    </Document>
  );
}
