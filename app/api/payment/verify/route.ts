import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VerifyPaymentSchema } from "@/lib/schemas";
import { generateUnlockToken } from "@/lib/utils";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const EXPECTED_AMOUNT = parseInt(
  process.env.NEXT_PUBLIC_PAYMENT_AMOUNT ?? "500000"
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = VerifyPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Validation failed" },
        { status: 400 }
      );
    }

    const { reference, sessionId } = parsed.data;

    // Check if already verified
    const existing = await prisma.payment.findUnique({
      where: { reference },
    });

    if (existing?.verified && existing.unlockToken) {
      return NextResponse.json({
        success: true,
        unlockToken: existing.unlockToken,
      });
    }

    // Verify with Paystack
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!paystackRes.ok) {
      return NextResponse.json(
        { error: "Could not verify payment with Paystack" },
        { status: 402 }
      );
    }

    const paystackData = await paystackRes.json();

    if (
      paystackData.data?.status !== "success" ||
      paystackData.data?.amount < EXPECTED_AMOUNT
    ) {
      await prisma.payment.upsert({
        where: { reference },
        update: { status: "FAILED" },
        create: {
          reference,
          amount: paystackData.data?.amount ?? 0,
          status: "FAILED",
          email: paystackData.data?.customer?.email,
        },
      });

      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 402 }
      );
    }

    const unlockToken = generateUnlockToken();

    const payment = await prisma.payment.upsert({
      where: { reference },
      update: {
        status: "SUCCESS",
        verified: true,
        unlockToken,
        amount: paystackData.data.amount,
        email: paystackData.data?.customer?.email,
        metadata: paystackData.data?.metadata as Record<string, unknown>,
      },
      create: {
        reference,
        amount: paystackData.data.amount,
        status: "SUCCESS",
        verified: true,
        unlockToken,
        email: paystackData.data?.customer?.email,
        metadata: paystackData.data?.metadata as Record<string, unknown>,
      },
    });

    // Link to generation if exists
    await prisma.generation
      .updateMany({
        where: { sessionId, status: "COMPLETE" },
        data: { paymentId: payment.id },
      })
      .catch(() => null);

    return NextResponse.json({
      success: true,
      unlockToken: payment.unlockToken,
    });
  } catch (error) {
    console.error("[/api/payment/verify] Error:", error);
    return NextResponse.json(
      { error: "Payment verification error" },
      { status: 500 }
    );
  }
}
