import { NextRequest, NextResponse } from "next/server";
import { generateResume } from "@/lib/ai/pollinations";
import { GenerateResumeSchema } from "@/lib/schemas";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/utils";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const identifier = getClientIdentifier(req);
    const rateCheck = checkRateLimit(identifier);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before generating again.", resetAt: rateCheck.resetAt },
        { status: 429, headers: { "X-RateLimit-Remaining": "0", "X-RateLimit-Reset": rateCheck.resetAt.toISOString() } }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

    const parsed = GenerateResumeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Validation failed" }, { status: 400 });
    }

    const { cvText, jobDescription } = parsed.data;
    const resumeData = await generateResume(sanitizeText(cvText), sanitizeText(jobDescription));

    return NextResponse.json({ success: true, data: resumeData });
  } catch (error) {
    console.error("[/api/generate] Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Generation failed" }, { status: 500 });
  }
}
