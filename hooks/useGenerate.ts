"use client";

import { useAppStore } from "@/store/useAppStore";
import { sleep } from "@/lib/utils";
import { ResumeData } from "@/types";

const AI_STEPS = [
  "Analyzing your experience...",
  "Matching job requirements...",
  "Identifying transferable skills...",
  "Optimizing ATS structure...",
  "Generating recruiter-grade content...",
  "Crafting your cover letter...",
  "Finalizing professional formatting...",
];

export function useGenerate() {
  const {
    completeGeneration,
    setStep,
    setIsGenerating,
    setGeneratingStep,
    setError,
  } = useAppStore();

  const generate = async (): Promise<boolean> => {
    // Read fresh state at call time — avoids stale closure when called from Paystack callback
    const { rawCvText, jobDescription, sessionId } = useAppStore.getState();

    if (!rawCvText || !jobDescription) {
      setError("Please provide both your CV and a job description.");
      return false;
    }

    setIsGenerating(true);
    setError(null);
    setStep("analyzing");

    // Animate through steps while waiting
    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      if (stepIndex < AI_STEPS.length) {
        setGeneratingStep(AI_STEPS[stepIndex]);
        stepIndex++;
      }
    }, 1800);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText: rawCvText, jobDescription, sessionId }),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed (${response.status})`);
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error ?? "Generation returned no data");
      }

      await sleep(600);

      setGeneratingStep("Complete");
      completeGeneration(data.data as ResumeData);
      return true;
    } catch (err) {
      clearInterval(stepInterval);
      const message = err instanceof Error ? err.message : "Generation failed";
      setError(message);
      setStep("payment");
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generate };
}
