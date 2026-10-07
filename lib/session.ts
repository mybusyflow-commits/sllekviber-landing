import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "sleekviber_admin";
const WEEK = 60 * 60 * 24 * 7;

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32);
}

export function validPassword(candidate: unknown) {
  if (!adminConfigured() || typeof candidate !== "string") return false;
  const actual = Buffer.from(process.env.ADMIN_PASSWORD!);
  const offered = Buffer.from(candidate);
  return actual.length === offered.length && timingSafeEqual(actual, offered);
}

function sign(payload: string) {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET || "unconfigured")
    .update(payload).digest("hex");
}

export function sessionValue() {
  const expires = String(Date.now() + WEEK * 1000);
  return `${expires}.${sign(expires)}`;
}

export function validSession(value?: string) {
  if (!adminConfigured() || !value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || !/^\d+$/.test(expires) || Number(expires) < Date.now()) return false;
  const actual = Buffer.from(sign(expires));
  const offered = Buffer.from(signature);
  return actual.length === offered.length && timingSafeEqual(actual, offered);
}

export const sessionCookieOptions = {
  name: SESSION_COOKIE,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: WEEK,
};
