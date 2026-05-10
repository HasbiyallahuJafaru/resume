import { NextRequest } from "next/server";

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "60000");
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? "5");

const DB_AVAILABLE =
  !!process.env.DATABASE_URL &&
  process.env.DATABASE_URL.startsWith("postgresql");

export async function getClientIdentifier(req: NextRequest): Promise<string> {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() ?? realIp ?? "unknown";
  return ip;
}

export async function checkRateLimit(identifier: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + WINDOW_MS);

  // Skip DB entirely if no real DATABASE_URL configured
  if (!DB_AVAILABLE) {
    return { allowed: true, remaining: MAX_REQUESTS, resetAt };
  }

  const windowStart = new Date(now.getTime() - WINDOW_MS);

  try {
    const { prisma } = await import("./prisma");

    const record = await prisma.rateLimit.findUnique({
      where: { identifier },
    });

    if (!record || record.windowStart < windowStart) {
      await prisma.rateLimit.upsert({
        where: { identifier },
        update: { count: 1, windowStart: now },
        create: { identifier, count: 1, windowStart: now },
      });

      return {
        allowed: true,
        remaining: MAX_REQUESTS - 1,
        resetAt,
      };
    }

    if (record.count >= MAX_REQUESTS) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(record.windowStart.getTime() + WINDOW_MS),
      };
    }

    await prisma.rateLimit.update({
      where: { identifier },
      data: { count: record.count + 1 },
    });

    return {
      allowed: true,
      remaining: MAX_REQUESTS - record.count - 1,
      resetAt: new Date(record.windowStart.getTime() + WINDOW_MS),
    };
  } catch {
    // Fail open — rate limiting is best-effort
    return { allowed: true, remaining: MAX_REQUESTS, resetAt };
  }
}
