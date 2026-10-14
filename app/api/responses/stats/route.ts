import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getStats } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try { return NextResponse.json(await getStats(), { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ error: "Response data is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
