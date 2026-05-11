"use client";

import React from "react";
import { ResumeData, TemplateId } from "@/types";

export async function generatePDF(
  data: ResumeData,
  template: TemplateId
): Promise<Blob> {
  const { pdf } = await import("@react-pdf/renderer");

  let DocComp: React.ComponentType<{ data: ResumeData }>;

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

  const element = React.createElement(DocComp, { data }) as unknown as React.ReactElement;
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
