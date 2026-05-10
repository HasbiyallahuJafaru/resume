"use client";

import { ResumeData, TemplateId } from "@/types";

// Lazy import react-pdf to avoid SSR issues
export async function generatePDF(
  data: ResumeData,
  template: TemplateId
): Promise<Blob> {
  const { pdf } = await import("@react-pdf/renderer");
  const { createElement } = await import("react");

  let DocumentComponent: React.ComponentType<{ data: ResumeData }>;

  switch (template) {
    case "executive":
      DocumentComponent = (await import("@/templates/pdf/ExecutivePDF"))
        .default;
      break;
    case "modern-professional":
      DocumentComponent = (await import("@/templates/pdf/ModernPDF")).default;
      break;
    default:
      DocumentComponent = (await import("@/templates/pdf/MinimalATSPDF"))
        .default;
  }

  const element = createElement(DocumentComponent, { data });
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
