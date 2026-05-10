import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { ResumeData } from "@/types";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 50,
    paddingRight: 50,
    color: "#1C1917",
    backgroundColor: "#FFFFFF",
    lineHeight: 1.5,
  },
  name: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: "#0C0A09",
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 16,
  },
  contactItem: {
    fontSize: 9,
    color: "#44403C",
  },
  separator: {
    fontSize: 9,
    color: "#A8A29E",
    marginHorizontal: 4,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E7E5E4",
    marginBottom: 8,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#0C0A09",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  summary: {
    fontSize: 10,
    color: "#1C1917",
    lineHeight: 1.6,
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0C0A09",
  },
  jobCompany: {
    fontSize: 10,
    color: "#44403C",
  },
  jobMeta: {
    fontSize: 9,
    color: "#78716C",
    marginTop: 2,
    marginBottom: 5,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 3,
  },
  bullet: {
    fontSize: 10,
    color: "#78716C",
    marginRight: 6,
    marginTop: 1,
  },
  bulletText: {
    fontSize: 10,
    color: "#1C1917",
    lineHeight: 1.5,
    flex: 1,
  },
  skillRow: {
    flexDirection: "row",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  skillCategory: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0C0A09",
    marginRight: 4,
  },
  skillItems: {
    fontSize: 10,
    color: "#1C1917",
    flex: 1,
  },
  eduTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0C0A09",
  },
  eduMeta: {
    fontSize: 9,
    color: "#78716C",
    marginTop: 2,
  },
  jobBlock: {
    marginBottom: 10,
  },
  projectName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0C0A09",
  },
  projectMeta: {
    fontSize: 9,
    color: "#78716C",
    marginTop: 2,
    marginBottom: 4,
  },
  projectDesc: {
    fontSize: 10,
    color: "#1C1917",
    lineHeight: 1.5,
  },
  coverLetterPage: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 50,
    paddingRight: 50,
    color: "#1C1917",
    backgroundColor: "#FFFFFF",
    lineHeight: 1.6,
  },
  coverLetterTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#0C0A09",
    marginBottom: 16,
  },
  coverLetterParagraph: {
    fontSize: 10,
    color: "#1C1917",
    lineHeight: 1.7,
    marginBottom: 12,
  },
});

interface Props {
  data: ResumeData;
}

export default function MinimalATSPDF({ data }: Props) {
  const { candidate, summary, experience, skills, education, projects, coverLetter } = data;

  const contactItems = [
    candidate.email,
    candidate.phone,
    candidate.location,
    candidate.linkedin,
    candidate.website,
    candidate.github,
  ].filter(Boolean) as string[];

  const coverLetterParagraphs = coverLetter.split("\n").filter((p) => p.trim());

  return (
    <Document>
      {/* Resume Page */}
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <Text style={styles.name}>{candidate.name}</Text>
        <View style={styles.contactRow}>
          {contactItems.map((item, i) => (
            <React.Fragment key={i}>
              <Text style={styles.contactItem}>{item}</Text>
              {i < contactItems.length - 1 && (
                <Text style={styles.separator}>|</Text>
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Professional Summary</Text>
        <Text style={styles.summary}>{summary}</Text>

        {/* Experience */}
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Experience</Text>
        {experience.map((job, i) => (
          <View key={i} style={styles.jobBlock}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.jobCompany}>{job.company}</Text>
            <Text style={styles.jobMeta}>
              {job.startDate} – {job.endDate}
              {job.location ? `  ·  ${job.location}` : ""}
            </Text>
            {job.responsibilities.map((bullet, j) => (
              <View key={j} style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Skills */}
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Skills</Text>
        {skills.map((group, i) => (
          <View key={i} style={styles.skillRow}>
            <Text style={styles.skillCategory}>{group.category}:</Text>
            <Text style={styles.skillItems}>{group.items.join(", ")}</Text>
          </View>
        ))}

        {/* Education */}
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Education</Text>
        {education.map((edu, i) => (
          <View key={i} style={{ marginBottom: 8 }}>
            <Text style={styles.eduTitle}>
              {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
            </Text>
            <Text style={styles.jobCompany}>{edu.institution}</Text>
            <Text style={styles.eduMeta}>
              {edu.startDate} – {edu.endDate}
              {edu.location ? `  ·  ${edu.location}` : ""}
              {edu.honors ? `  ·  ${edu.honors}` : ""}
            </Text>
          </View>
        ))}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((project, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={styles.projectName}>{project.name}</Text>
                {project.technologies.length > 0 && (
                  <Text style={styles.projectMeta}>
                    {project.technologies.join("  ·  ")}
                  </Text>
                )}
                <Text style={styles.projectDesc}>{project.description}</Text>
              </View>
            ))}
          </>
        )}
      </Page>

      {/* Cover Letter Page */}
      <Page size="LETTER" style={styles.coverLetterPage}>
        <Text style={styles.coverLetterTitle}>Cover Letter</Text>
        {coverLetterParagraphs.map((paragraph, i) => (
          <Text key={i} style={styles.coverLetterParagraph}>
            {paragraph}
          </Text>
        ))}
      </Page>
    </Document>
  );
}
