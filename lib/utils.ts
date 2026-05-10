import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export function generateUnlockToken(): string {
  const array = new Uint8Array(32);
  if (typeof crypto !== "undefined") {
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function formatCurrency(amount: number, currency = "NGN"): string {
  const divisor = currency === "NGN" ? 100 : 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount / divisor);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + "…";
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function sanitizeText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
