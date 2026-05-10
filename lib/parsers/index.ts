"use client";

import { parsePDF } from "./pdf-parser";
import { parseDOCX } from "./docx-parser";

export type SupportedFileType = "pdf" | "docx" | "txt";

export function getFileType(file: File): SupportedFileType | null {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (
    type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  )
    return "docx";
  if (type === "text/plain" || name.endsWith(".txt")) return "txt";

  return null;
}

export async function parseFile(file: File): Promise<string> {
  const fileType = getFileType(file);

  if (!fileType) {
    throw new Error(
      "Unsupported file type. Please upload a PDF, DOCX, or TXT file."
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File is too large. Maximum size is 10MB.");
  }

  switch (fileType) {
    case "pdf":
      return parsePDF(file);
    case "docx":
      return parseDOCX(file);
    case "txt": {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          if (!text || text.trim().length < 50) {
            reject(new Error("Text file appears to be empty or too short."));
          } else {
            resolve(text.trim());
          }
        };
        reader.onerror = () => reject(new Error("Failed to read text file."));
        reader.readAsText(file);
      });
    }
  }
}
