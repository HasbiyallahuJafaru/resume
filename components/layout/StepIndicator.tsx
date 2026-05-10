"use client";

import { AppStep } from "@/types";
import { cn } from "@/lib/utils";

const STEPS: { id: AppStep; label: string }[] = [
  { id: "upload", label: "Upload CV" },
  { id: "job-description", label: "Job Description" },
  { id: "payment", label: "Payment" },
  { id: "analyzing", label: "AI Analysis" },
  { id: "result", label: "Download" },
];

const stepOrder: AppStep[] = ["upload", "job-description", "payment", "analyzing", "result"];

export default function StepIndicator({ currentStep }: { currentStep: AppStep }) {
  const currentIndex = stepOrder.indexOf(currentStep);

  return (
    <div className="flex items-center justify-center gap-2">
      {STEPS.map((step, i) => {
        const stepIdx = stepOrder.indexOf(step.id);
        const isComplete = stepIdx < currentIndex;
        const isCurrent = step.id === currentStep;

        return (
          <div key={step.id} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  isComplete ? "bg-ink w-4" : isCurrent ? "bg-ink w-6" : "bg-surface-3 w-1.5"
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium transition-colors duration-200 hidden sm:block",
                  isCurrent ? "text-ink" : isComplete ? "text-ink-secondary" : "text-ink-disabled"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && <div className="h-px w-4 bg-surface-3 hidden sm:block" />}
          </div>
        );
      })}
    </div>
  );
}
