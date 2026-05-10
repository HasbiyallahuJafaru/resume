"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import Button from "@/components/ui/Button";

export default function JobDescriptionForm() {
  const { jobDescription, setJobDescription, setStep, error, setError } = useAppStore();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (jobDescription.trim().length < 50) {
      setLocalError("Please paste a complete job description (at least 50 characters).");
      return;
    }
    setLocalError(null);
    setError(null);
    setStep("payment");
  };

  const displayError = error || localError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-ink mb-2">
          Job Description
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here. Include the role title, responsibilities, requirements, and any qualifications listed..."
          className="w-full h-64 rounded-2xl border border-surface-3 bg-white p-4 text-sm text-ink placeholder:text-ink-disabled resize-none focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition-all"
        />
        <p className="text-xs text-ink-tertiary mt-1.5 ml-1">
          {jobDescription.length} characters · More detail = better results
        </p>
      </div>

      {displayError && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3"
        >
          {displayError}
        </motion.p>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => setStep("upload")}>
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={jobDescription.trim().length < 50}
          className="flex-1"
          size="lg"
        >
          Continue to Payment
        </Button>
      </div>
    </motion.div>
  );
}
