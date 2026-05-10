import { ResumeData } from "@/types";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts";

const BASE_URL = "https://text.pollinations.ai";
const REFERRER = "atsresume.xyz";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

// OpenAI-compatible envelope that Pollinations /openai returns
interface OpenAIEnvelope {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
    text?: string; // some variants return text directly on choice
  }>;
  // some Pollinations variants surface content at top level
  content?: string;
  text?: string;
}

export async function generateResume(
  cvText: string,
  jobDescription: string
): Promise<ResumeData> {
  const messages: Message[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserPrompt(cvText, jobDescription) },
  ];

  // POST /openai is OpenAI-compatible — use standard OpenAI params only
  // json:true is only for the GET endpoint, NOT the POST /openai endpoint
  const body = {
    model: "openai",
    messages,
    temperature: 0.3,
    seed: 42,
    max_tokens: 4000,
    referrer: REFERRER,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Referer: `https://${REFERRER}`,
    Origin: `https://${REFERRER}`,
  };

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
    throw new Error(`AI generation failed (${response.status}): ${errorText}`);
  }

  const envelope = (await response.json()) as OpenAIEnvelope;

  // Log in dev so we can see the raw shape if something goes wrong
  if (process.env.NODE_ENV === "development") {
    console.log("[pollinations] envelope keys:", Object.keys(envelope));
    console.log("[pollinations] choices length:", envelope.choices?.length);
    console.log(
      "[pollinations] content preview:",
      envelope.choices?.[0]?.message?.content?.slice(0, 200)
    );
  }

  // Extract content — try every known response shape
  const rawContent =
    envelope?.choices?.[0]?.message?.content ??
    envelope?.choices?.[0]?.text ??
    envelope?.content ??
    envelope?.text ??
    null;

  if (!rawContent || typeof rawContent !== "string" || rawContent.trim() === "") {
    throw new Error(
      "AI returned an empty response. Please try again in a moment."
    );
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
