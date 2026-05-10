"use client";

export async function parseDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  const mammoth = await import("mammoth");

  const result = await mammoth.extractRawText({ arrayBuffer });

  if (!result.value || result.value.trim().length < 50) {
    throw new Error("Could not extract text from this DOCX file.");
  }

  return result.value.trim();
}
