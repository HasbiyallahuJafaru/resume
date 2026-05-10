import { ResumeData } from "@/types";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts";

const POLLINATIONS_URL =
  process.env.POLLINATIONS_AI_URL ?? "https://text.pollinations.ai";

interface PollinationsMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// OpenAI-compatible response envelope that Pollinations returns
interface OpenAIResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  // Pollinations sometimes returns content directly
  content?: string;
}

export async function generateResume(
  cvText: string,
  jobDescription: string
): Promise<ResumeData> {
  const messages: PollinationsMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserPrompt(cvText, jobDescription) },
  ];

  const requestBody = {
    model: "openai",
    messages,
    temperature: 0.3,
    seed: 42,
    response_format: { type: "json_object" },
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

  // Extract the actual content string from the OpenAI-compatible envelope
  const contentStr = extractContent(rawText);

  const parsed = parseResumeJSON(contentStr);
  validateResumeData(parsed);
  return parsed;
}

function extractContent(rawText: string): string {
  // Try to parse as OpenAI response envelope first
  try {
    const envelope = JSON.parse(rawText) as OpenAIResponse;

    // Standard OpenAI format: choices[0].message.content
    const choice = envelope?.choices?.[0]?.message?.content;
    if (choice && typeof choice === "string") {
      return choice;
    }

    // Some Pollinations variants return top-level content
    if (envelope?.content && typeof envelope.content === "string") {
      return envelope.content;
    }

    // If the envelope itself has the resume keys, it IS the resume data
    if ("candidate" in envelope || "experience" in envelope) {
      return rawText;
    }
  } catch {
    // rawText is not a JSON envelope — treat as raw content
  }

  return rawText;
}

function parseResumeJSON(content: string): unknown {
  // Strip markdown code fences if present
  const stripped = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(stripped);
  } catch {
    // Try extracting the first {...} block
    const jsonMatch = stripped.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(
        "AI did not return valid JSON. Please try again."
      );
    }
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error("Failed to parse AI response. Please try again.");
    }
  }
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
