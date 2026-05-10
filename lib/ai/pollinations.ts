import { ResumeData } from "@/types";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts";

const POLLINATIONS_URL =
  process.env.POLLINATIONS_AI_URL ?? "https://text.pollinations.ai";

interface PollinationsMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface PollinationsRequest {
  model: string;
  messages: PollinationsMessage[];
  temperature: number;
  seed?: number;
  jsonMode?: boolean;
}

export async function generateResume(
  cvText: string,
  jobDescription: string
): Promise<ResumeData> {
  const messages: PollinationsMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserPrompt(cvText, jobDescription) },
  ];

  const requestBody: PollinationsRequest = {
    model: "openai",
    messages,
    temperature: 0.3,
    seed: 42,
    jsonMode: true,
  };

  const response = await fetch(`${POLLINATIONS_URL}/openai`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(90000),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(
      `AI generation failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const rawText = await response.text();

  let parsed: ResumeData;
  try {
    // Try direct parse first
    parsed = JSON.parse(rawText);
  } catch {
    // Extract JSON from response if wrapped in markdown or prose
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI response did not contain valid JSON");
    }
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error("Failed to parse AI response as JSON");
    }
  }

  validateResumeData(parsed);
  return parsed;
}

function validateResumeData(data: unknown): asserts data is ResumeData {
  if (!data || typeof data !== "object") {
    throw new Error("AI response is not a valid object");
  }

  const obj = data as Record<string, unknown>;

  if (!obj.candidate || typeof obj.candidate !== "object") {
    throw new Error("AI response missing candidate field");
  }

  if (typeof obj.summary !== "string") {
    throw new Error("AI response missing summary field");
  }

  if (!Array.isArray(obj.experience)) {
    throw new Error("AI response missing experience array");
  }

  if (!Array.isArray(obj.skills)) {
    throw new Error("AI response missing skills array");
  }

  if (!Array.isArray(obj.education)) {
    throw new Error("AI response missing education array");
  }

  if (typeof obj.coverLetter !== "string") {
    throw new Error("AI response missing coverLetter field");
  }
}
