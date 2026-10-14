import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { consumeRateLimit } from "./db";
import { clientAddress } from "./request";

export async function rateLimit(request: Request, action: string, limit: number, windowMs: number) {
  const key = createHash("sha256").update(`${action}:${clientAddress(request)}`).digest("hex");
  try {
    const result = await consumeRateLimit(key, limit, windowMs);
    if (!result.allowed) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429, headers: { "Retry-After": String(result.retryAfter), "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Service temporarily unavailable. Please try again shortly." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  return null;
}
