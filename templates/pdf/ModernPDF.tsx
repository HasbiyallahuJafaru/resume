import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData } from "@/types";

const colors = {
  dark: "#0F172A",
  medium: "#334155",
  light: "#64748B",
  muted: "#94A3B8",
  border: "#E2E8F0",
  white: "#FFFFFF",
  accent: "#1E293B",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 0,
    paddingBottom: 40,
    paddingLeft: 0,
    paddingRight: 0,
    color: colors.dark,
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.dark,
    paddingTop: 36,
    paddingBottom: 28,
    paddingLeft: 50,
    paddingRight: 50,
    marginBottom: 0,
  },
  name: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  contactItem: {
    fontSize: 9,
    color: "#CBD5E1",
  },
  separator: {
    fontSize: 9,
    color: "#64748B",
    marginHorizontal: 5,
  },
  body: {
    paddingLeft: 50,
    paddingRight: 50,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.dark,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.dark,
    paddingLeft: 6,
  },
  summary: {
    fontSize: 10,
    color: colors.medium,
    lineHeight: 1.65,
  },
  jobBlock: {
    marginBottom: 12,
  },
  jobHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  jobTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.dark,
  },
  jobDate: {
    fontSize: 9,
    color: colors.light,
    fontFamily: "Helvetica",
  },
  jobCompany: {
    fontSize: 10,
    color: colors.medium,
    marginTop: 2,
    marginBottom: 6,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 3,
  },
  bullet: {
    fontSize: 9,
    color: colors.dark,
    marginRight: 7,
    marginTop: 1.5,
  },
  bulletText: {
    fontSize: 10,
    color: colors.medium,
    lineHeight: 1.55,
    flex: 1,
  },
  skillRow: {
    flexDirection: "row",
    marginBottom: 5,
    flexWrap: "wrap",
  },
  skillCategory: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.dark,
    marginRight: 5,
  },
  skillItems: {
    fontSize: 10,
    color: colors.medium,
    flex: 1,
  },
  eduBlock: {
    marginBottom: 8,
  },
  eduHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eduTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.dark,
  },
  eduMeta: {
    fontSize: 9,
    color: colors.light,
    marginTop: 2,
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    marginVertical: 4,
  },
  coverPage: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 0,
    paddingBottom: 40,
    paddingLeft: 0,
    paddingRight: 0,
    color: colors.dark,
    backgroundColor: colors.white,
  },
  coverParagraph: {
    fontSize: 10,
    color: colors.medium,
    lineHeight: 1.75,
    marginBottom: 12,
    paddingLeft: 50,
    paddingRight: 50,
  },
  coverTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
    paddingLeft: 50,
    paddingRight: 50,
    paddingTop: 36,
    paddingBottom: 28,
    backgroundColor: colors.dark,
    marginBottom: 20,
  },
});

interface Props {
  data: ResumeData;
}

export default function ModernPDF({ data }: Props) {
  const { candidate, summary, experience, skills, education, projects, coverLetter } = data;

  const contactItems = [
    candidate.email,
    candidate.phone,
    candidate.location,
    candidate.linkedin,
    candidate.website,
  ].filter(Boolean) as string[];

  const coverLetterParagraphs = coverLetter.split("\n").filter((p) => p.trim());

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Dark header */}
        <View style={styles.header}>
          <Text style={styles.name}>{candidate.name}</Text>
          <View style={styles.contactRow}>
            {contactItems.map((item, i) => (
              <React.Fragment key={i}>
                <Text style={styles.contactItem}>{item}</Text>
                {i < contactItems.length - 1 && (
                  <Text style={styles.separator}>·</Text>
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.summary}>{summary}</Text>

          <Text style={styles.sectionTitle}>Experience</Text>
          {experience.map((job, i) => (
            <View key={i} style={styles.jobBlock}>
              <View style={styles.jobHeaderRow}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.jobDate}>{job.startDate} – {job.endDate}</Text>
              </View>
              <Text style={styles.jobCompany}>
                {job.company}{job.location ? `  ·  ${job.location}` : ""}
              </Text>
              {job.responsibilities.map((bullet, j) => (
                <View key={j} style={styles.bulletItem}>
                  <Text style={styles.bullet}>›</Text>
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </View>
          ))}

          <Text style={styles.sectionTitle}>Skills</Text>
          {skills.map((group, i) => (
            <View key={i} style={styles.skillRow}>
              <Text style={styles.skillCategory}>{group.category}:</Text>
              <Text style={styles.skillItems}>{group.items.join(", ")}</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>Education</Text>
          {education.map((edu, i) => (
            <View key={i} style={styles.eduBlock}>
              <View style={styles.eduHeaderRow}>
                <Text style={styles.eduTitle}>
                  {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
                </Text>
                <Text style={styles.jobDate}>{edu.startDate} – {edu.endDate}</Text>
              </View>
              <Text style={styles.eduMeta}>{edu.institution}{edu.location ? `  ·  ${edu.location}` : ""}</Text>
            </View>
          ))}

          {projects && projects.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Projects</Text>
              {projects.map((project, i) => (
                <View key={i} style={{ marginBottom: 8 }}>
                  <Text style={styles.jobTitle}>{project.name}</Text>
                  {project.technologies.length > 0 && (
                    <Text style={styles.eduMeta}>{project.technologies.join("  ·  ")}</Text>
                  )}
                  <Text style={{ ...styles.bulletText, marginTop: 3 }}>{project.description}</Text>
                </View>
              ))}
            </>
          )}
        </View>
      </Page>

      <Page size="LETTER" style={styles.coverPage}>
        <Text style={styles.coverTitle}>Cover Letter</Text>
        {coverLetterParagraphs.map((paragraph, i) => (
          <Text key={i} style={styles.coverParagraph}>{paragraph}</Text>
        ))}
      </Page>
    </Document>
  );
}
