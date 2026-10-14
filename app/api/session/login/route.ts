import { NextResponse } from "next/server";
import { adminConfigured, sessionCookieOptions, sessionValue, validPassword } from "@/lib/session";
import { sameOrigin, readJson, InputError } from "@/lib/request";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  if (!adminConfigured()) return NextResponse.json({ error: "Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET first." }, { status: 503 });
  const limited = await rateLimit(request, "admin-login", 5, 900_000);
  if (limited) return limited;
  let body: unknown;
  try { body = await readJson(request); } catch (error) { return NextResponse.json({ error: error instanceof InputError ? error.message : "Invalid request." }, { status: error instanceof InputError ? error.status : 400 }); }
  if (!validPassword((body as { password?: unknown })?.password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set({ ...sessionCookieOptions, value: sessionValue() });
  return response;
}
