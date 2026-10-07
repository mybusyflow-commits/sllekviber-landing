import { NextResponse } from "next/server";
import { adminConfigured, sessionCookieOptions, sessionValue, validPassword } from "@/lib/session";
import { clientAddress, sameOrigin } from "@/lib/request";

const attempts = new Map<string, { count: number; until: number }>();

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  if (!adminConfigured()) return NextResponse.json({ error: "Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET first." }, { status: 503 });
  const ip = clientAddress(request);
  const now = Date.now();
  const entry = attempts.get(ip) || { count: 0, until: now + 900_000 };
  if (entry.until < now) { entry.count = 0; entry.until = now + 900_000; }
  if (entry.count >= 5) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (!validPassword((body as { password?: unknown })?.password)) {
    entry.count += 1; attempts.set(ip, entry);
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }
  attempts.delete(ip);
  const response = NextResponse.json({ ok: true });
  response.cookies.set({ ...sessionCookieOptions, value: sessionValue() });
  return response;
}
