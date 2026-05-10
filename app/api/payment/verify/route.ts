import { NextRequest, NextResponse } from "next/server";
import { VerifyPaymentSchema } from "@/lib/schemas";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const EXPECTED_AMOUNT = parseInt(process.env.NEXT_PUBLIC_PAYMENT_AMOUNT ?? "500000");

export async function POST(req: NextRequest) {
  if (!PAYSTACK_SECRET) {
    return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const parsed = VerifyPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Validation failed" }, { status: 400 });
  }

  const { reference } = parsed.data;

  // Verify with Paystack API
  let paystackData: { data?: { status?: string; amount?: number; customer?: { email?: string } } };
  try {
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
        signal: AbortSignal.timeout(15000),
      }
    );
    if (!res.ok) {
      return NextResponse.json({ success: false, error: "Paystack verification failed" }, { status: 402 });
    }
    paystackData = await res.json();
  } catch {
    return NextResponse.json({ success: false, error: "Network error verifying payment" }, { status: 502 });
  }

  const { status, amount } = paystackData.data ?? {};
  if (status !== "success" || (amount ?? 0) < EXPECTED_AMOUNT) {
    return NextResponse.json({ success: false, error: "Payment not confirmed" }, { status: 402 });
  }

  return NextResponse.json({ success: true });
}
