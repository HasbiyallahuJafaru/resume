"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

const dots = [0, 1, 2];

export default function AnalyzingState() {
  const generatingStep = useAppStore((s) => s.generatingStep);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[400px] text-center gap-8"
    >
      {/* Animated logo mark */}
      <div className="relative">
        <div className="h-16 w-16 rounded-2xl bg-ink flex items-center justify-center">
          <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <motion.div
          className="absolute inset-0 rounded-2xl bg-ink"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Step label */}
      <div className="space-y-3">
        <motion.p
          key={generatingStep}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="text-base font-medium text-ink"
        >
          {generatingStep || "Preparing analysis..."}
        </motion.p>

        {/* Animated dots */}
        <div className="flex items-center justify-center gap-1.5">
          {dots.map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-ink-tertiary"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      <p className="text-sm text-ink-tertiary max-w-sm">
        Our AI is carefully analyzing your experience and matching it to the role. This takes about 30–60 seconds.
      </p>
    </motion.div>
  );
}
