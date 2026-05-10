"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, children, disabled, ...props },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 select-none";

    const variants = {
      primary:
        "bg-ink text-white hover:bg-ink-secondary active:scale-[0.98] shadow-soft",
      secondary:
        "bg-surface-2 text-ink hover:bg-surface-3 border border-surface-3 active:scale-[0.98]",
      ghost: "text-ink hover:bg-surface-2 active:scale-[0.98]",
      danger: "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm rounded-lg",
      md: "h-10 px-4 text-sm rounded-xl",
      lg: "h-12 px-6 text-base rounded-xl",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
export default Button;
