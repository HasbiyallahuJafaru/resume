"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import Header from "@/components/layout/Header";
import StepIndicator from "@/components/layout/StepIndicator";
import FileUpload from "@/components/upload/FileUpload";
import JobDescriptionForm from "@/components/job/JobDescriptionForm";
import AnalyzingState from "@/components/analyzing/AnalyzingState";
import ResumePreview from "@/components/preview/ResumePreview";

export default function AppPage() {
  const { step, reset } = useAppStore();

  const stepTitles: Record<string, { title: string; subtitle: string }> = {
    upload: {
      title: "Upload your CV",
      subtitle: "PDF, DOCX, or paste your resume text",
    },
    "job-description": {
      title: "Paste the job description",
      subtitle: "The more detail you provide, the better the result",
    },
    analyzing: {
      title: "Analyzing your profile",
      subtitle: "Our AI is working on your recruiter-grade resume",
    },
    preview: {
      title: "Your resume is ready",
      subtitle: "Review the improvements before downloading",
    },
    payment: {
      title: "Unlock your resume",
      subtitle: "One payment — full resume + cover letter + downloads",
    },
    unlocked: {
      title: "All done",
      subtitle: "Your professional resume is ready to download",
    },
  };

  const current = stepTitles[step] ?? stepTitles["upload"];

  return (
    <div className="min-h-screen bg-surface-1 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Step indicator */}
        {step !== "analyzing" && (
          <div className="mb-8">
            <StepIndicator currentStep={step} />
          </div>
        )}

        {/* Step header */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step + "-header"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-ink tracking-tight">
                  {current.title}
                </h1>
                <p className="text-sm text-ink-tertiary mt-1">{current.subtitle}</p>
              </div>

              {(step === "preview" || step === "unlocked") && (
                <button
                  onClick={reset}
                  className="text-xs text-ink-tertiary hover:text-ink transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-2"
                >
                  Start over
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <FileUpload />
            </motion.div>
          )}

          {step === "job-description" && (
            <motion.div
              key="job-description"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <JobDescriptionForm />
            </motion.div>
          )}

          {step === "analyzing" && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <AnalyzingState />
            </motion.div>
          )}

          {(step === "preview" || step === "payment" || step === "unlocked") && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <ResumePreview />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
