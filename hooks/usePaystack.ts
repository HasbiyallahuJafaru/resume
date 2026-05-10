"use client";

import { useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: PaystackOptions) => { openIframe: () => void };
    };
  }
}

interface PaystackOptions {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  metadata?: Record<string, unknown>;
  onSuccess: (response: { reference: string }) => void;
  onCancel: () => void;
}

export function usePaystack() {
  const { sessionId, setPaymentReference, setError, unlock, setStep } =
    useAppStore();

  const initiatePayment = useCallback(
    async (email: string) => {
      const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
      const amount = parseInt(
        process.env.NEXT_PUBLIC_PAYMENT_AMOUNT ?? "500000"
      );
      const currency = process.env.NEXT_PUBLIC_PAYMENT_CURRENCY ?? "NGN";

      if (!publicKey) {
        setError("Payment is not configured. Please contact support.");
        return;
      }

      // Ensure Paystack script is loaded
      if (!window.PaystackPop) {
        setError("Payment system failed to load. Please refresh and try again.");
        return;
      }

      const reference = `rf_${sessionId}_${Date.now()}`;
      setPaymentReference(reference);
      setStep("payment");

      const handler = window.PaystackPop.setup({
        key: publicKey,
        email,
        amount,
        currency,
        ref: reference,
        metadata: { sessionId },
        onSuccess: async (response) => {
          await verifyPayment(response.reference, sessionId, unlock, setError);
        },
        onCancel: () => {
          setStep("preview");
          setError("Payment was cancelled.");
        },
      });

      handler.openIframe();
    },
    [sessionId, setPaymentReference, setError, unlock, setStep]
  );

  return { initiatePayment };
}

async function verifyPayment(
  reference: string,
  sessionId: string,
  unlock: (token: string) => void,
  setError: (error: string | null) => void
) {
  try {
    const response = await fetch("/api/payment/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference, sessionId }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      setError(
        data.error ?? "Payment verification failed. Please contact support."
      );
      return;
    }

    if (data.unlockToken) {
      unlock(data.unlockToken);
    }
  } catch {
    setError(
      "Could not verify payment. Please contact support with your reference: " +
        reference
    );
  }
}
