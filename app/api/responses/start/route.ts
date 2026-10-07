import { NextResponse } from "next/server";
import { recordStart } from "@/lib/db";
import { sameOrigin } from "@/lib/request";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const sessionId = (body as { sessionId?: unknown })?.sessionId;
  if (typeof sessionId !== "string" || !/^[a-f0-9-]{36}$/.test(sessionId)) return NextResponse.json({ error: "Invalid session." }, { status: 400 });
  recordStart(sessionId);
  return NextResponse.json({ ok: true });
}
