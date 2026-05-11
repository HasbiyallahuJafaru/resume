"use client";

import { useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useGenerate } from "@/hooks/useGenerate";

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
  label?: string;
  metadata?: Record<string, unknown>;
  callback: (response: { reference: string; trans: string; status: string; message: string }) => void;
  onClose: () => void;
}

function waitForPaystack(timeoutMs = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.PaystackPop) {
      resolve();
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      if (window.PaystackPop) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        reject(new Error("Paystack failed to load. Please refresh and try again."));
      }
    }, 100);
  });
}

export function usePaystack() {
  const { sessionId, setPaymentReference, setError, setStep } = useAppStore();
  const { generate } = useGenerate();

  const initiatePayment = useCallback(
    async (email: string) => {
      const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
      const amount = parseInt(process.env.NEXT_PUBLIC_PAYMENT_AMOUNT ?? "500000");
      const currency = process.env.NEXT_PUBLIC_PAYMENT_CURRENCY ?? "NGN";

      if (!publicKey) {
        setError("Payment is not configured. Please contact support.");
        return;
      }

      try {
        await waitForPaystack();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Payment failed to load.");
        return;
      }

      const reference = `rf_${sessionId}_${Date.now()}`;
      setPaymentReference(reference);

      let paid = false;

      const handler = window.PaystackPop.setup({
        key: publicKey,
        email,
        amount,
        currency,
        ref: reference,
        label: "ResumeForge — Resume + Cover Letter",
        metadata: { sessionId, app: "resumeforge" },
        callback: (_response) => {
          paid = true;
          generate();
        },
        onClose: () => {
          // Only reset to payment if the user closed WITHOUT paying
          if (!paid) setStep("payment");
        },
      });

      handler.openIframe();
    },
    [sessionId, setPaymentReference, setError, setStep, generate]
  );

  return { initiatePayment };
}
