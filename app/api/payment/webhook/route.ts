import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { generateUnlockToken } from "@/lib/utils";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;

const DB_AVAILABLE =
  !!process.env.DATABASE_URL &&
  process.env.DATABASE_URL.startsWith("postgresql") &&
  !process.env.DATABASE_URL.includes("@HOST/") &&
  !process.env.DATABASE_URL.includes("USER:PASSWORD");

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature || !PAYSTACK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify webhook signature with HMAC-SHA512
    const hash = createHmac("sha512", PAYSTACK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      console.warn("[/api/payment/webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const { reference, amount, status, customer } = event.data;

      if (status === "success" && DB_AVAILABLE) {
        const { prisma } = await import("@/lib/prisma");
        const unlockToken = generateUnlockToken();

        await prisma.payment
          .upsert({
            where: { reference },
            update: {
              status: "SUCCESS",
              verified: true,
              unlockToken,
              amount,
              email: customer?.email,
            },
            create: {
              reference,
              amount,
              status: "SUCCESS",
              verified: true,
              unlockToken,
              email: customer?.email,
            },
          })
          .catch((err: unknown) => {
            console.error("[/api/payment/webhook] DB upsert failed:", err);
          });
      }
    }

    // Always respond 200 — Paystack retries on non-200
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[/api/payment/webhook] Error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
