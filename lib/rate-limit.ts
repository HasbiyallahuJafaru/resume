import { NextRequest } from "next/server";

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "60000");
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? "10");

// In-memory store — resets on server restart, good enough for serverless
const store = new Map<string, { count: number; windowStart: number }>();

export function getClientIdentifier(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() ?? realIp ?? "unknown";
}

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
} {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    store.set(identifier, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: new Date(now + WINDOW_MS) };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: new Date(entry.windowStart + WINDOW_MS) };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetAt: new Date(entry.windowStart + WINDOW_MS) };
}
