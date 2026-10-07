import { NextResponse } from "next/server";
import { insertEmail } from "@/lib/db";
import { sameOrigin } from "@/lib/request";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const email = (body as { email?: unknown })?.email;
  if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  insertEmail(email.trim().toLowerCase());
  return NextResponse.json({ ok: true });
}
