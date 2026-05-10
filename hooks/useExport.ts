"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { downloadBlob } from "@/lib/generators/pdf-generator";

export function useExport() {
  const { resumeData, selectedTemplate, candidate } = useAppStore((s) => ({
    resumeData: s.resumeData,
    selectedTemplate: s.selectedTemplate,
    candidate: s.resumeData?.candidate,
  }));
  const [isExporting, setIsExporting] = useState(false);

  const fileName = candidate?.name
    ? candidate.name.replace(/\s+/g, "_") + "_Resume"
    : "Resume";

  const exportPDF = async () => {
    if (!resumeData) return;
    setIsExporting(true);
    try {
      const { generatePDF } = await import("@/lib/generators/pdf-generator");
      const blob = await generatePDF(resumeData, selectedTemplate);
      downloadBlob(blob, `${fileName}.pdf`);
    } catch (err) {
      console.error("PDF export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const exportDOCX = async () => {
    if (!resumeData) return;
    setIsExporting(true);
    try {
      const { generateDOCX } = await import("@/lib/generators/docx-generator");
      const blob = await generateDOCX(resumeData);
      downloadBlob(blob, `${fileName}.docx`);
    } catch (err) {
      console.error("DOCX export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return { exportPDF, exportDOCX, isExporting };
}
