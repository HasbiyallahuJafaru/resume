"use client";

export async function parsePDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  const pdfjsLib = await import("pdfjs-dist");

  // Use unpkg CDN which reliably serves all versions
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const textParts: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .filter((item) => "str" in item)
      .map((item) => (item as { str: string }).str)
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
