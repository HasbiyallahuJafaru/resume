"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { usePaystack } from "@/hooks/usePaystack";
import { useAppStore } from "@/store/useAppStore";
import { formatCurrency } from "@/lib/utils";
import Button from "@/components/ui/Button";

export default function PaymentGate() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { initiatePayment } = usePaystack();
  const { error, setError, setStep } = useAppStore();

  const amount = parseInt(process.env.NEXT_PUBLIC_PAYMENT_AMOUNT ?? "500000");
  const currency = process.env.NEXT_PUBLIC_PAYMENT_CURRENCY ?? "NGN";

  const handlePay = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError(null);
    setError(null);
    setIsLoading(true);
    try {
      await initiatePayment(email);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white rounded-2xl p-6 border border-surface-3 shadow-card space-y-5">
        <div>
          <p className="text-base font-semibold text-ink">One-time payment</p>
          <p className="text-sm text-ink-tertiary mt-0.5">
            Pay once — AI generates your full resume + cover letter instantly.
          </p>
        </div>

        <div className="bg-surface-1 rounded-xl p-4 space-y-2">
          {["ATS-optimized resume", "Tailored cover letter", "PDF & DOCX download"].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-ink-secondary">
              <svg className="h-4 w-4 text-ink shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {item}
            </div>
          ))}
          <div className="border-t border-surface-3 mt-3 pt-3 flex items-center justify-between">
            <span className="text-sm text-ink-secondary">Total</span>
            <span className="text-lg font-bold text-ink">{formatCurrency(amount, currency)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePay()}
            placeholder="your@email.com"
            className="w-full h-10 rounded-xl border border-surface-3 px-3 text-sm text-ink placeholder:text-ink-disabled focus:outline-none focus:ring-2 focus:ring-ink transition-all"
          />
          {emailError && <p className="text-xs text-red-600">{emailError}</p>}
          <p className="text-[11px] text-ink-disabled">Receipt sent to this email</p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-700">
            {error}
          </div>
        )}

        <Button onClick={handlePay} loading={isLoading} className="w-full" size="md">
          Pay {formatCurrency(amount, currency)} · Generate Resume
        </Button>

        <button
          onClick={() => setStep("job-description")}
          className="w-full text-xs text-ink-tertiary hover:text-ink transition-colors text-center"
        >
          ← Back to job description
        </button>

        <div className="flex items-center gap-2 text-[11px] text-ink-tertiary justify-center">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Secured by Paystack
        </div>
      </div>
    </motion.div>
  );
}
