import { NextResponse } from "next/server";
import { insertEmail } from "@/lib/db";
import { sameOrigin, readJson, InputError } from "@/lib/request";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  const limited = await rateLimit(request, "waitlist", 10, 900_000);
  if (limited) return limited;
  let body: unknown;
  try { body = await readJson(request); } catch (error) { return NextResponse.json({ error: error instanceof InputError ? error.message : "Invalid request." }, { status: error instanceof InputError ? error.status : 400 }); }
  const email = (body as { email?: unknown })?.email;
  if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  try { await insertEmail(email.trim().toLowerCase()); }
  catch { return NextResponse.json({ error: "We couldn't save your email. Please try again shortly." }, { status: 503 }); }
  return NextResponse.json({ ok: true });
}
