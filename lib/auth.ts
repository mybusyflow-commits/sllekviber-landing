import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, validSession } from "@/lib/session";

export async function isAdmin() {
  return validSession((await cookies()).get(SESSION_COOKIE)?.value);
}
