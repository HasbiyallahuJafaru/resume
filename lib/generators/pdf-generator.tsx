"use client";

import { ResumeData, TemplateId } from "@/types";

export async function generatePDF(
  data: ResumeData,
  template: TemplateId
): Promise<Blob> {
  const { pdf, Document } = await import("@react-pdf/renderer");
  const React = await import("react");

  type DocComponent = React.ComponentType<{ data: ResumeData }>;

  let DocComp: DocComponent;

  switch (template) {
    case "executive":
      DocComp = (await import("@/templates/pdf/ExecutivePDF")).default;
      break;
    case "modern-professional":
      DocComp = (await import("@/templates/pdf/ModernPDF")).default;
      break;
    default:
      DocComp = (await import("@/templates/pdf/MinimalATSPDF")).default;
  }

  // Each template returns a <Document> as its root, which satisfies react-pdf's pdf()
  // We cast through unknown to satisfy the strict DocumentProps typing
  const element = React.createElement(DocComp, { data }) as unknown as React.ReactElement<
    React.ComponentProps<typeof Document>
  >;

  const blob = await pdf(element).toBlob();
  return blob;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
