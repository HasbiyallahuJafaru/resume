import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData } from "@/types";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Times-Roman",
    fontSize: 10,
    paddingTop: 48,
    paddingBottom: 48,
    paddingLeft: 60,
    paddingRight: 60,
    color: "#1C1917",
    backgroundColor: "#FFFFFF",
  },
  name: {
    fontSize: 26,
    fontFamily: "Times-Bold",
    color: "#0C0A09",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#0C0A09",
    paddingBottom: 12,
  },
  contactItem: {
    fontSize: 9,
    color: "#44403C",
    fontFamily: "Times-Roman",
  },
  separator: {
    fontSize: 9,
    color: "#A8A29E",
    marginHorizontal: 6,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    color: "#0C0A09",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
    marginTop: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#0C0A09",
    paddingBottom: 3,
  },
  summary: {
    fontSize: 10.5,
    color: "#1C1917",
    lineHeight: 1.7,
    fontFamily: "Times-Italic",
    marginTop: 4,
  },
  jobTitle: {
    fontSize: 11,
    fontFamily: "Times-Bold",
    color: "#0C0A09",
  },
  jobHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 2,
  },
  jobCompany: {
    fontSize: 10,
    fontFamily: "Times-Italic",
    color: "#44403C",
  },
  jobMeta: {
    fontSize: 9,
    color: "#78716C",
    fontFamily: "Times-Roman",
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 3,
    marginTop: 2,
  },
  bullet: {
    fontSize: 10,
    color: "#0C0A09",
    marginRight: 8,
  },
  bulletText: {
    fontSize: 10,
    color: "#1C1917",
    lineHeight: 1.55,
    flex: 1,
    fontFamily: "Times-Roman",
  },
  skillRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  skillCategory: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    color: "#0C0A09",
    marginRight: 6,
    width: 100,
  },
  skillItems: {
    fontSize: 10,
    color: "#1C1917",
    flex: 1,
    fontFamily: "Times-Roman",
  },
  eduHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  eduTitle: {
    fontSize: 11,
    fontFamily: "Times-Bold",
    color: "#0C0A09",
  },
  eduMeta: {
    fontSize: 9,
    color: "#78716C",
    fontFamily: "Times-Italic",
    marginTop: 2,
  },
  coverPage: {
    fontFamily: "Times-Roman",
    fontSize: 11,
    paddingTop: 72,
    paddingBottom: 72,
    paddingLeft: 72,
    paddingRight: 72,
    color: "#1C1917",
    backgroundColor: "#FFFFFF",
    lineHeight: 1.7,
  },
  coverTitle: {
    fontSize: 14,
    fontFamily: "Times-Bold",
    color: "#0C0A09",
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#0C0A09",
    paddingBottom: 8,
  },
  coverParagraph: {
    marginBottom: 16,
    fontSize: 11,
    fontFamily: "Times-Roman",
    lineHeight: 1.8,
    color: "#1C1917",
  },
});

interface Props {
  data: ResumeData;
}

export default function ExecutivePDF({ data }: Props) {
  const { candidate, summary, experience, skills, education, projects, coverLetter } = data;

  const contactItems = [
    candidate.email,
    candidate.phone,
    candidate.location,
    candidate.linkedin,
  ].filter(Boolean) as string[];

  const coverLetterParagraphs = coverLetter.split("\n").filter((p) => p.trim());

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.name}>{candidate.name}</Text>
        <View style={styles.contactRow}>
          {contactItems.map((item, i) => (
            <React.Fragment key={i}>
              <Text style={styles.contactItem}>{item}</Text>
              {i < contactItems.length - 1 && (
                <Text style={styles.separator}>•</Text>
              )}
            </React.Fragment>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={styles.summary}>{summary}</Text>

        <Text style={styles.sectionTitle}>Professional Experience</Text>
        {experience.map((job, i) => (
          <View key={i}>
            <View style={styles.jobHeaderRow}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.jobMeta}>{job.startDate} – {job.endDate}</Text>
            </View>
            <Text style={styles.jobCompany}>
              {job.company}{job.location ? `  ·  ${job.location}` : ""}
            </Text>
            {job.responsibilities.map((bullet, j) => (
              <View key={j} style={styles.bulletItem}>
                <Text style={styles.bullet}>–</Text>
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        ))}

        <Text style={styles.sectionTitle}>Core Competencies</Text>
        {skills.map((group, i) => (
          <View key={i} style={styles.skillRow}>
            <Text style={styles.skillCategory}>{group.category}:</Text>
            <Text style={styles.skillItems}>{group.items.join(", ")}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Education</Text>
        {education.map((edu, i) => (
          <View key={i}>
            <View style={styles.eduHeaderRow}>
              <Text style={styles.eduTitle}>
                {edu.degree}{edu.field ? `, ${edu.field}` : ""}
              </Text>
              <Text style={styles.jobMeta}>{edu.startDate} – {edu.endDate}</Text>
            </View>
            <Text style={styles.eduMeta}>{edu.institution}{edu.location ? `  ·  ${edu.location}` : ""}</Text>
          </View>
        ))}

        {projects && projects.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Selected Projects</Text>
            {projects.map((project, i) => (
              <View key={i} style={{ marginTop: 6 }}>
                <Text style={styles.jobTitle}>{project.name}</Text>
                {project.technologies.length > 0 && (
                  <Text style={styles.eduMeta}>{project.technologies.join(", ")}</Text>
                )}
                <Text style={{ ...styles.bulletText, marginTop: 2 }}>{project.description}</Text>
              </View>
            ))}
          </>
        )}
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
