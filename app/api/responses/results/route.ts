import { NextResponse } from "next/server";
import { getPublicResults } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const limited = await rateLimit(request, "public-results", 120, 60_000);
  if (limited) return limited;
  const headers = { "Cache-Control": "no-store" };
  try { return NextResponse.json(await getPublicResults(), { headers }); }
  catch { return NextResponse.json({ error: "Results are temporarily unavailable. Please try again." }, { status: 503, headers }); }
}
