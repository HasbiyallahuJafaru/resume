"use client";

export async function parsePDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  // Dynamic import to avoid SSR issues
  const pdfjsLib = await import("pdfjs-dist");

  // Set worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const textParts: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .filter((item): item is { str: string; transform: number[] } =>
        "str" in item && typeof (item as { str: unknown }).str === "string"
      )
      .map((item) => item.str)
      .join(" ");

    textParts.push(pageText);
  }

  const fullText = textParts.join("\n\n").replace(/\s+/g, " ").trim();

  if (fullText.length < 50) {
    throw new Error(
      "Could not extract text from this PDF. It may be image-based or password-protected."
    );
  }

  return fullText;
}
