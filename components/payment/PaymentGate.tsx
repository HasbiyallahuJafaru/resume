"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { usePaystack } from "@/hooks/usePaystack";
import { formatCurrency } from "@/lib/utils";
import Button from "@/components/ui/Button";

export default function PaymentGate() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { initiatePayment } = usePaystack();

  const amount = parseInt(process.env.NEXT_PUBLIC_PAYMENT_AMOUNT ?? "500000");
  const currency = process.env.NEXT_PUBLIC_PAYMENT_CURRENCY ?? "NGN";

  const handlePay = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError(null);
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
      className="bg-white rounded-2xl p-5 border border-surface-3 shadow-card space-y-4"
    >
      <div>
        <p className="text-sm font-semibold text-ink">Unlock Full Resume</p>
        <p className="text-xs text-ink-tertiary mt-0.5">
          One-time payment. Instant download.
        </p>
      </div>

      <div className="bg-surface-1 rounded-xl p-3 flex items-center justify-between">
        <span className="text-sm text-ink-secondary">Resume + Cover Letter</span>
        <span className="text-base font-bold text-ink">
          {formatCurrency(amount, currency)}
        </span>
      </div>

      <div className="space-y-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full h-10 rounded-xl border border-surface-3 px-3 text-sm text-ink placeholder:text-ink-disabled focus:outline-none focus:ring-2 focus:ring-ink transition-all"
        />
        {emailError && (
          <p className="text-xs text-red-600">{emailError}</p>
        )}
        <p className="text-[11px] text-ink-disabled">
          Receipt will be sent to this email
        </p>
      </div>

      <Button
        onClick={handlePay}
        loading={isLoading}
        className="w-full"
        size="md"
      >
        Pay {formatCurrency(amount, currency)} · Unlock
      </Button>

      <div className="flex items-center gap-2 text-[11px] text-ink-tertiary">
        <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Secured by Paystack. Your data is never stored.
      </div>
    </motion.div>
  );
}
