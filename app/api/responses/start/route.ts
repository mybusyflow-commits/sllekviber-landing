import { NextResponse } from "next/server";
import { recordStart } from "@/lib/db";
import { sameOrigin, readJson, InputError } from "@/lib/request";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  const limited = await rateLimit(request, "survey-start", 30, 900_000);
  if (limited) return limited;
  let body: unknown;
  try { body = await readJson(request); } catch (error) { return NextResponse.json({ error: error instanceof InputError ? error.message : "Invalid request." }, { status: error instanceof InputError ? error.status : 400 }); }
  const sessionId = (body as { sessionId?: unknown })?.sessionId;
  if (typeof sessionId !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(sessionId)) return NextResponse.json({ error: "Invalid session." }, { status: 400 });
  try { await recordStart(sessionId); }
  catch { return NextResponse.json({ error: "The survey is temporarily unavailable." }, { status: 503 }); }
  return NextResponse.json({ ok: true });
}
