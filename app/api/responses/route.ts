import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { insertSubmission, recentDuplicate } from "@/lib/db";
import { Q1_OPTIONS, Q2_OPTIONS, type Q1Answer, type Q2Answer } from "@/lib/options";
import { clientAddress, sameOrigin } from "@/lib/request";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 4096) return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Invalid answers." }, { status: 400 });
  const { q1, q2 } = body as Record<string, unknown>;
  if (typeof q1 !== "string" || q1.length > 80 || !Q1_OPTIONS.includes(q1 as Q1Answer) ||
      !Array.isArray(q2) || q2.length < 1 || q2.length > 3 ||
      q2.some((v) => typeof v !== "string" || v.length > 80 || !Q2_OPTIONS.includes(v as Q2Answer)) ||
      new Set(q2).size !== q2.length || (q2.includes("All of the above") && q2.length !== 1)) {
    return NextResponse.json({ error: "Choose one answer to each question, and up to three distinct pain points." }, { status: 400 });
  }
  const fingerprint = createHash("sha256").update(`${clientAddress(request)}:${q1}:${[...q2].sort().join("|")}`).digest("hex");
  if (recentDuplicate(fingerprint)) return NextResponse.json({ error: "This response was already received. Thank you." }, { status: 409 });
  const userAgent = (request.headers.get("user-agent") || "unknown").slice(0, 300).replace(/[\x00-\x1f\x7f]/g, "");
  insertSubmission({ id: randomUUID(), q1: q1 as Q1Answer, q2: q2 as Q2Answer[], timestamp: new Date().toISOString(), userAgent }, fingerprint);
  return NextResponse.json({ ok: true }, { status: 201 });
}
