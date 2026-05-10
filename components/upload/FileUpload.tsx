"use client";

import { useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { parseFile } from "@/lib/parsers";
import { useAppStore } from "@/store/useAppStore";
import Button from "@/components/ui/Button";

export default function FileUpload() {
  const { setRawCvText, setStep } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [pasteText, setPasteText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setUploadError(null);
      setIsParsing(true);
      setFileName(file.name);

      try {
        const text = await parseFile(file);
        setRawCvText(text);
        setStep("job-description");
      } catch (err) {
        setUploadError(
          err instanceof Error ? err.message : "Failed to parse file."
        );
        setFileName(null);
      } finally {
        setIsParsing(false);
      }
    },
    [setRawCvText, setStep]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handlePasteSubmit = () => {
    if (pasteText.trim().length < 100) {
      setUploadError("Please paste more text. Your CV appears too short.");
      return;
    }
    setRawCvText(pasteText.trim());
    setStep("job-description");
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center gap-1 bg-surface-1 rounded-xl p-1 w-fit">
        {(["upload", "paste"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setUploadError(null); }}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
              mode === m
                ? "bg-white text-ink shadow-soft"
                : "text-ink-tertiary hover:text-ink"
            )}
          >
            {m === "upload" ? "Upload File" : "Paste Text"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === "upload" ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-12 text-center",
                isDragging
                  ? "border-ink bg-surface-1 scale-[1.01]"
                  : "border-surface-3 hover:border-ink-disabled hover:bg-surface-1"
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />

              {isParsing ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-10 w-10 rounded-full border-2 border-ink border-t-transparent animate-spin" />
                  <p className="text-sm text-ink-secondary">Extracting text from {fileName}...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-surface-2 flex items-center justify-center">
                    <svg className="h-6 w-6 text-ink-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">
                      Drop your CV here, or <span className="underline underline-offset-2">browse</span>
                    </p>
                    <p className="text-xs text-ink-tertiary mt-1">PDF, DOCX, or TXT — up to 10MB</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="paste"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste your complete resume or CV text here..."
              className="w-full h-52 rounded-2xl border border-surface-3 bg-white p-4 text-sm text-ink placeholder:text-ink-disabled resize-none focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition-all"
            />
            <Button
              onClick={handlePasteSubmit}
              disabled={pasteText.trim().length < 100}
              className="w-full"
              size="lg"
            >
              Continue
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {uploadError && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3"
          >
            {uploadError}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
