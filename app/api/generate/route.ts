import { NextRequest, NextResponse } from "next/server";
import { generateResume } from "@/lib/ai/pollinations";
import { GenerateResumeSchema } from "@/lib/schemas";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/utils";

export const maxDuration = 60;

const DB_AVAILABLE =
  !!process.env.DATABASE_URL &&
  process.env.DATABASE_URL.startsWith("postgresql") &&
  !process.env.DATABASE_URL.includes("@HOST/") &&
  !process.env.DATABASE_URL.includes("USER:PASSWORD");

export async function POST(req: NextRequest) {
  try {
    const identifier = await getClientIdentifier(req);
    const rateCheck = await checkRateLimit(identifier);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests. Please wait before generating again.",
          resetAt: rateCheck.resetAt,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateCheck.resetAt.toISOString(),
          },
        }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = GenerateResumeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Validation failed" },
        { status: 400 }
      );
    }

    const { cvText, jobDescription, sessionId } = parsed.data;

    const cleanCv = sanitizeText(cvText);
    const cleanJd = sanitizeText(jobDescription);

    const resumeData = await generateResume(cleanCv, cleanJd);

    // Persist generation record only when DB is configured
    if (DB_AVAILABLE) {
      const { prisma } = await import("@/lib/prisma");
      await prisma.generation
        .create({
          data: {
            sessionId,
            status: "COMPLETE",
            outputData: JSON.parse(JSON.stringify(resumeData)),
            payment: {
              create: {
                reference: `preview_${sessionId}_${Date.now()}`,
                amount: 0,
                status: "PENDING",
              },
            },
          },
        })
        .catch(() => null);
    }

    return NextResponse.json({ success: true, data: resumeData });
  } catch (error) {
    console.error("[/api/generate] Error:", error);
    const message =
      error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
