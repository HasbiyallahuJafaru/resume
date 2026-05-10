"use client";

import { motion } from "framer-motion";
import { AppStep } from "@/types";
import { cn } from "@/lib/utils";

const STEPS: { id: AppStep; label: string }[] = [
  { id: "upload", label: "Upload CV" },
  { id: "job-description", label: "Job Description" },
  { id: "analyzing", label: "AI Analysis" },
  { id: "preview", label: "Preview" },
  { id: "unlocked", label: "Download" },
];

const stepOrder: AppStep[] = [
  "upload",
  "job-description",
  "analyzing",
  "preview",
  "payment",
  "unlocked",
];

function getStepIndex(step: AppStep): number {
  return stepOrder.indexOf(step);
}

export default function StepIndicator({ currentStep }: { currentStep: AppStep }) {
  const currentIndex = getStepIndex(currentStep);

  const displaySteps = STEPS;

  return (
    <div className="flex items-center justify-center gap-2">
      {displaySteps.map((step, i) => {
        const stepIdx = getStepIndex(step.id);
        const isComplete = stepIdx < currentIndex;
        const isCurrent = step.id === currentStep || (currentStep === "analyzing" && step.id === "analyzing") || (currentStep === "payment" && step.id === "preview");
        const isUpcoming = stepIdx > currentIndex;

        return (
          <div key={step.id} className="flex items-center gap-2">
            {/* Step dot */}
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  isComplete
                    ? "bg-ink w-4"
                    : isCurrent
                    ? "bg-ink w-6"
                    : "bg-surface-3 w-1.5"
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium transition-colors duration-200 hidden sm:block",
                  isCurrent
                    ? "text-ink"
                    : isComplete
                    ? "text-ink-secondary"
                    : "text-ink-disabled"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {i < displaySteps.length - 1 && (
              <div className="h-px w-4 bg-surface-3 hidden sm:block" />
            )}
          </div>
        );
      })}
    </div>
  );
}
