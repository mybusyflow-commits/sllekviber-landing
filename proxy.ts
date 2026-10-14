import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, validSession } from "@/lib/session";

export function proxy(request: NextRequest) {
  if (validSession(request.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.next();
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const url = new URL("/admin/login", request.url);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin", "/admin/:path((?!login).*)", "/api/responses/stats"] };
