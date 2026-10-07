import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getStats } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return NextResponse.json(getStats(), { headers: { "Cache-Control": "no-store" } });
}
