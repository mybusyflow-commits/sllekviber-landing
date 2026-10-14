import { NextResponse } from "next/server";
import { sessionCookieOptions } from "@/lib/session";
import { sameOrigin } from "@/lib/request";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set({ ...sessionCookieOptions, value: "", maxAge: 0 });
  return response;
}
