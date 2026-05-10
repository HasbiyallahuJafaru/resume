"use client";

import { ResumeData } from "@/types";

export async function generateDOCX(data: ResumeData): Promise<Blob> {
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    BorderStyle,
    Table,
    TableRow,
    TableCell,
    WidthType,
    ShadingType,
  } = await import("docx");

  const { candidate, summary, experience, skills, education, projects } = data;

  const createDivider = () =>
    new Paragraph({
      border: {
        bottom: {
          color: "E5E7EB",
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      spacing: { after: 200 },
    });

  const createSectionHeading = (text: string) =>
    new Paragraph({
      children: [
        new TextRun({
          text: text.toUpperCase(),
          bold: true,
          size: 20,
          color: "1C1917",
          characterSpacing: 100,
        }),
      ],
      spacing: { before: 320, after: 120 },
    });

  const children = [];

  // Header - Name
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: candidate.name,
          bold: true,
          size: 44,
          color: "0C0A09",
        }),
      ],
      alignment: AlignmentType.LEFT,
      spacing: { after: 80 },
    })
  );

  // Contact info
  const contactParts = [
    candidate.email,
    candidate.phone,
    candidate.location,
    candidate.linkedin,
    candidate.website,
    candidate.github,
  ].filter(Boolean);

  children.push(
    new Paragraph({
      children: contactParts.map(
        (part, i) =>
          new TextRun({
            text: i < contactParts.length - 1 ? `${part}  |  ` : part!,
            size: 18,
            color: "44403C",
          })
      ),
      spacing: { after: 240 },
    })
  );

  // Summary
  createDivider();
  children.push(createDivider());
  children.push(createSectionHeading("Professional Summary"));
  children.push(
    new Paragraph({
      children: [new TextRun({ text: summary, size: 20, color: "1C1917" })],
      spacing: { after: 200 },
    })
  );

  // Experience
  children.push(createDivider());
  children.push(createSectionHeading("Experience"));

  for (const job of experience) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: job.title, bold: true, size: 22, color: "0C0A09" }),
          new TextRun({ text: `  —  ${job.company}`, size: 22, color: "44403C" }),
        ],
        spacing: { before: 160, after: 40 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${job.startDate} – ${job.endDate}${job.location ? `  ·  ${job.location}` : ""}`,
            size: 18,
            color: "78716C",
            italics: true,
          }),
        ],
        spacing: { after: 100 },
      })
    );

    for (const bullet of job.responsibilities) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: bullet, size: 19, color: "1C1917" })],
          bullet: { level: 0 },
          spacing: { after: 60 },
        })
      );
    }
  }

  // Skills
  children.push(createDivider());
  children.push(createSectionHeading("Skills"));

  for (const group of skills) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${group.category}: `, bold: true, size: 19, color: "0C0A09" }),
          new TextRun({ text: group.items.join(", "), size: 19, color: "1C1917" }),
        ],
        spacing: { after: 80 },
      })
    );
  }

  // Education
  children.push(createDivider());
  children.push(createSectionHeading("Education"));

  for (const edu of education) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: edu.degree, bold: true, size: 21, color: "0C0A09" }),
          edu.field
            ? new TextRun({ text: ` in ${edu.field}`, size: 21, color: "44403C" })
            : new TextRun({ text: "" }),
        ],
        spacing: { before: 120, after: 40 },
      })
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${edu.institution}  ·  ${edu.startDate} – ${edu.endDate}`,
            size: 18,
            color: "78716C",
            italics: true,
          }),
        ],
        spacing: { after: 80 },
      })
    );
  }

  // Projects
  if (projects && projects.length > 0) {
    children.push(createDivider());
    children.push(createSectionHeading("Projects"));

    for (const project of projects) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: project.name, bold: true, size: 21, color: "0C0A09" }),
            project.technologies.length > 0
              ? new TextRun({ text: `  ·  ${project.technologies.join(", ")}`, size: 18, color: "78716C" })
              : new TextRun({ text: "" }),
          ],
          spacing: { before: 120, after: 60 },
        })
      );
      children.push(
        new Paragraph({
          children: [new TextRun({ text: project.description, size: 19, color: "1C1917" })],
          spacing: { after: 60 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 1000,
              bottom: 720,
              left: 1000,
            },
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}
