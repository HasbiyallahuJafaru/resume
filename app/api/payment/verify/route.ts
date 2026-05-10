import { NextRequest, NextResponse } from "next/server";
import { VerifyPaymentSchema } from "@/lib/schemas";
import { generateUnlockToken } from "@/lib/utils";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const EXPECTED_AMOUNT = parseInt(
  process.env.NEXT_PUBLIC_PAYMENT_AMOUNT ?? "500000"
);

const DB_AVAILABLE =
  !!process.env.DATABASE_URL &&
  process.env.DATABASE_URL.startsWith("postgresql") &&
  !process.env.DATABASE_URL.includes("@HOST/") &&
  !process.env.DATABASE_URL.includes("USER:PASSWORD");

export async function POST(req: NextRequest) {
  if (!PAYSTACK_SECRET) {
    console.error("[/api/payment/verify] PAYSTACK_SECRET_KEY is not set");
    return NextResponse.json(
      { error: "Payment verification is not configured" },
      { status: 500 }
    );
  }

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

    // Check if already verified (idempotent — avoids double-charging)
    if (DB_AVAILABLE) {
      const { prisma } = await import("@/lib/prisma");
      const existing = await prisma.payment.findUnique({
        where: { reference },
        select: { verified: true, unlockToken: true },
      });

      if (existing?.verified && existing.unlockToken) {
        return NextResponse.json({
          success: true,
          unlockToken: existing.unlockToken,
        });
      }
    }

    // Verify the transaction with Paystack's API server-side
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!paystackRes.ok) {
      const errText = await paystackRes.text().catch(() => "");
      console.error("[/api/payment/verify] Paystack error:", paystackRes.status, errText);
      return NextResponse.json(
        { error: "Could not reach Paystack to verify payment" },
        { status: 402 }
      );
    }

    const paystackData = await paystackRes.json();

    // Must be successful AND meet the expected amount
    if (
      paystackData.data?.status !== "success" ||
      paystackData.data?.amount < EXPECTED_AMOUNT
    ) {
      console.warn("[/api/payment/verify] Verification failed:", {
        status: paystackData.data?.status,
        amount: paystackData.data?.amount,
        expected: EXPECTED_AMOUNT,
      });

      if (DB_AVAILABLE) {
        const { prisma } = await import("@/lib/prisma");
        await prisma.payment
          .upsert({
            where: { reference },
            update: { status: "FAILED" },
            create: {
              reference,
              amount: paystackData.data?.amount ?? 0,
              status: "FAILED",
              email: paystackData.data?.customer?.email,
            },
          })
          .catch(() => null);
      }

      return NextResponse.json(
        { error: "Payment verification failed. Please contact support." },
        { status: 402 }
      );
    }

    // Payment confirmed — generate a signed unlock token
    const unlockToken = generateUnlockToken();

    if (DB_AVAILABLE) {
      const { prisma } = await import("@/lib/prisma");
      const payment = await prisma.payment.upsert({
        where: { reference },
        update: {
          status: "SUCCESS",
          verified: true,
          unlockToken,
          amount: paystackData.data.amount,
          email: paystackData.data?.customer?.email,
          metadata: paystackData.data?.metadata
            ? JSON.parse(JSON.stringify(paystackData.data.metadata))
            : undefined,
        },
        create: {
          reference,
          amount: paystackData.data.amount,
          status: "SUCCESS",
          verified: true,
          unlockToken,
          email: paystackData.data?.customer?.email,
          metadata: paystackData.data?.metadata
            ? JSON.parse(JSON.stringify(paystackData.data.metadata))
            : undefined,
        },
      });

      // Link payment to existing generation session
      await prisma.generation
        .updateMany({
          where: { sessionId, status: "COMPLETE" },
          data: { paymentId: payment.id },
        })
        .catch(() => null);
    }

    return NextResponse.json({ success: true, unlockToken });
  } catch (error) {
    console.error("[/api/payment/verify] Unexpected error:", error);
    return NextResponse.json(
      { error: "Payment verification error. Please contact support." },
      { status: 500 }
    );
  }
}
