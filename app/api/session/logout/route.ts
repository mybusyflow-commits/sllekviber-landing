import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";
import { sameOrigin } from "@/lib/request";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set({ name: SESSION_COOKIE, value: "", path: "/", maxAge: 0, httpOnly: true, sameSite: "strict" });
  return response;
}
