import { NextResponse } from "next/server";
import { checkStorage } from "@/lib/db";
export const runtime = "nodejs";
export async function GET() {
  try { await checkStorage(); return NextResponse.json({ service: "sleekviber", ok: true }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ service: "sleekviber", ok: false, error: "Storage is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
