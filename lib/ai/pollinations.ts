import { ResumeData } from "@/types";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts";

const BASE_URL = "https://text.pollinations.ai";
const REFERRER = "atsresume.xyz";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

// OpenAI-compatible envelope Pollinations returns
interface OpenAIEnvelope {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
}

export async function generateResume(
  cvText: string,
  jobDescription: string
): Promise<ResumeData> {
  const messages: Message[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserPrompt(cvText, jobDescription) },
  ];

  const body = {
    model: "openai",
    messages,
    temperature: 0.3,
    seed: 42,
    json: true,           // Pollinations JSON mode flag
    referrer: REFERRER,   // Identifies our app for rate limit tier
    max_tokens: 4000,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    // Referrer header for web-app identification
    Referer: `https://${REFERRER}`,
    Origin: `https://${REFERRER}`,
  };

  // Attach bearer token if configured
  const token = process.env.POLLINATIONS_API_TOKEN;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/openai`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(90000),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(
      `AI generation failed (${response.status}): ${errorText}`
    );
  }

  // Pollinations returns an OpenAI-compatible envelope:
  // { choices: [{ message: { content: "<JSON string>" } }] }
  const envelope = (await response.json()) as OpenAIEnvelope;

  const rawContent = envelope?.choices?.[0]?.message?.content;

  if (!rawContent || typeof rawContent !== "string") {
    throw new Error("AI returned an empty response. Please try again.");
  }

  const parsed = parseResumeJSON(rawContent);
  validateResumeData(parsed);
  return parsed;
}

function parseResumeJSON(content: string): unknown {
  // Strip markdown code fences if the model wrapped the JSON
  const stripped = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(stripped);
  } catch {
    // Fall back to extracting the first {...} block
    const match = stripped.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("AI did not return valid JSON. Please try again.");
    }
    try {
      return JSON.parse(match[0]);
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
