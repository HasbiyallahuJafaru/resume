import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHmac } from "crypto";
import { generateUnlockToken } from "@/lib/utils";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    // Verify webhook signature
    const hash = createHmac("sha512", PAYSTACK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const { reference, amount, status, customer } = event.data;

      if (status === "success") {
        const unlockToken = generateUnlockToken();

        await prisma.payment.upsert({
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
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[/api/payment/webhook] Error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
