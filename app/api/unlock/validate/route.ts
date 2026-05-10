import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ValidateSchema = z.object({
  unlockToken: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const parsed = ValidateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const { unlockToken } = parsed.data;

    const payment = await prisma.payment.findUnique({
      where: { unlockToken },
      select: { verified: true, status: true },
    });

    if (!payment || !payment.verified || payment.status !== "SUCCESS") {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("[/api/unlock/validate] Error:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
