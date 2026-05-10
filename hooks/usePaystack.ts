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
  label?: string;
  metadata?: Record<string, unknown>;
  onSuccess: (response: { reference: string }) => void;
  onCancel: () => void;
}

// Wait for the Paystack script to finish loading (max 10s)
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
  const { sessionId, setPaymentReference, setError, unlock, setStep } =
    useAppStore();

  const initiatePayment = useCallback(
    async (email: string) => {
      const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
      const amount = parseInt(process.env.NEXT_PUBLIC_PAYMENT_AMOUNT ?? "500000");
      const currency = process.env.NEXT_PUBLIC_PAYMENT_CURRENCY ?? "NGN";

      if (!publicKey) {
        setError("Payment is not configured. Please contact support.");
        return;
      }

      // Wait for Paystack script to be ready
      try {
        await waitForPaystack();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Payment failed to load.");
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
        label: "ResumeForge — Resume + Cover Letter",
        metadata: { sessionId, app: "resumeforge" },
        onSuccess: async (response) => {
          // Backend verifies the reference and issues a signed unlock token
          await verifyPayment(response.reference, sessionId, unlock, setError);
        },
        onCancel: () => {
          // User closed the popup — silently go back to preview, no error
          setStep("preview");
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
        data.error ??
          `Payment verification failed. Please contact support with reference: ${reference}`
      );
      return;
    }

    if (data.unlockToken) {
      unlock(data.unlockToken);
    }
  } catch {
    setError(
      `Could not verify payment. Please contact support with reference: ${reference}`
    );
  }
}
