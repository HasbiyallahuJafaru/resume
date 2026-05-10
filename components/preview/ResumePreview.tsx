"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { ResumeData, TemplateId } from "@/types";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

const TEMPLATES: { id: TemplateId; name: string }[] = [
  { id: "minimal-ats", name: "Minimal ATS" },
  { id: "executive", name: "Executive" },
  { id: "modern-professional", name: "Modern" },
];

export default function ResumePreview() {
  const { resumeData, selectedTemplate, setSelectedTemplate } = useAppStore();

  if (!resumeData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-semibold text-ink">Your Resume is Ready</h2>
          <p className="text-sm text-ink-tertiary mt-0.5">
            Download your recruiter-grade resume and cover letter
          </p>
        </div>

        <div className="flex items-center gap-1 bg-surface-1 rounded-xl p-1">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150",
                selectedTemplate === t.id
                  ? "bg-white text-ink shadow-soft"
                  : "text-ink-tertiary hover:text-ink"
              )}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ResumeDocument data={resumeData} />
        </div>

        <div className="space-y-4">
          <ExportButtons />
          <SummaryChecklist />
        </div>
      </div>
    </motion.div>
  );
}

function ResumeDocument({ data }: { data: ResumeData }) {
  const { candidate, summary, experience, skills, education } = data;

  return (
    <div className="bg-white rounded-2xl border border-surface-3 shadow-card overflow-hidden">
      <div className="p-8 font-sans text-sm leading-relaxed text-ink space-y-5">
        <div className="border-b border-surface-3 pb-5">
          <h1 className="text-2xl font-bold text-ink mb-1">{candidate.name}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-tertiary">
            {candidate.email && <span>{candidate.email}</span>}
            {candidate.phone && <span>{candidate.phone}</span>}
            {candidate.location && <span>{candidate.location}</span>}
            {candidate.linkedin && <span>{candidate.linkedin}</span>}
          </div>
        </div>

        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-tertiary mb-2">
            Professional Summary
          </h2>
          <p className="text-sm text-ink leading-relaxed">{summary}</p>
        </section>

        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-tertiary mb-3">
            Experience
          </h2>
          <div className="space-y-4">
            {experience.map((job, i) => (
              <div key={i}>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-semibold text-ink">{job.title}</p>
                    <p className="text-xs text-ink-secondary">{job.company}</p>
                  </div>
                  <p className="text-xs text-ink-tertiary whitespace-nowrap shrink-0">
                    {job.startDate} – {job.endDate}
                  </p>
                </div>
                <ul className="mt-2 space-y-1">
                  {job.responsibilities.map((r, j) => (
                    <li key={j} className="text-xs text-ink-secondary flex gap-2">
                      <span className="text-ink-disabled shrink-0">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-tertiary mb-2">
            Skills
          </h2>
          <div className="space-y-1">
            {skills.map((group, i) => (
              <div key={i} className="text-xs">
                <span className="font-semibold text-ink">{group.category}: </span>
                <span className="text-ink-secondary">{group.items.join(", ")}</span>
              </div>
            ))}
          </div>
        </section>

        {education && education.length > 0 && (
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-tertiary mb-2">
              Education
            </h2>
            {education.map((edu, i) => (
              <div key={i} className="flex justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
                  </p>
                  <p className="text-xs text-ink-secondary">{edu.institution}</p>
                </div>
                <p className="text-xs text-ink-tertiary">
                  {edu.startDate} – {edu.endDate}
                </p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

function ExportButtons() {
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);
  const { resumeData, selectedTemplate } = useAppStore();

  const handleExport = async (type: "pdf" | "docx") => {
    if (!resumeData) return;
    setExporting(type);
    try {
      const candidateName = (resumeData.candidate.name || "Resume").replace(/\s+/g, "_");

      if (type === "pdf") {
        const { generatePDF, downloadBlob } = await import("@/lib/generators/pdf-generator");
        const blob = await generatePDF(resumeData, selectedTemplate);
        downloadBlob(blob, `${candidateName}_Resume.pdf`);
      } else {
        const { generateDOCX } = await import("@/lib/generators/docx-generator");
        const { downloadBlob } = await import("@/lib/generators/pdf-generator");
        const blob = await generateDOCX(resumeData);
        downloadBlob(blob, `${candidateName}_Resume.docx`);
      }
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-surface-3 shadow-card space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="h-6 w-6 rounded-lg bg-ink flex items-center justify-center">
          <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <p className="text-sm font-semibold text-ink">Ready to download</p>
      </div>

      <Button onClick={() => handleExport("pdf")} loading={exporting === "pdf"} disabled={exporting !== null} className="w-full" size="md">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download PDF
      </Button>

      <Button variant="secondary" onClick={() => handleExport("docx")} loading={exporting === "docx"} disabled={exporting !== null} className="w-full" size="md">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download DOCX
      </Button>

      <p className="text-[11px] text-ink-tertiary text-center">
        Files are generated locally in your browser
      </p>
    </div>
  );
}

function SummaryChecklist() {
  const items = [
    "ATS-optimized resume",
    "Professional summary",
    "Rewritten experience bullets",
    "Full experience section",
    "Education & projects",
    "Tailored cover letter",
    "PDF download",
    "DOCX (editable) download",
  ];

  return (
    <div className="bg-surface-1 rounded-2xl p-5 border border-surface-3 space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-tertiary">
        What&apos;s included
      </h3>
      <ul className="space-y-2.5">
        {items.map((label, i) => (
          <li key={i} className="flex items-center gap-2.5 text-sm">
            <span className="h-4 w-4 rounded-full bg-ink flex items-center justify-center shrink-0">
              <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2 6l3 3 5-5" />
              </svg>
            </span>
            <span className="text-ink">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
