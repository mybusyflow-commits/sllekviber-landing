import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "sleekviber_admin";
const WEEK = 60 * 60 * 24 * 7;

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 12 && !process.env.ADMIN_PASSWORD.startsWith("replace-with") && process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32 && !process.env.ADMIN_SESSION_SECRET.startsWith("replace-with"));
}

export function validPassword(candidate: unknown) {
  if (!adminConfigured() || typeof candidate !== "string") return false;
  const actual = createHash("sha256").update(process.env.ADMIN_PASSWORD!).digest();
  const offered = createHash("sha256").update(candidate).digest();
  return timingSafeEqual(actual, offered);
}

function sign(payload: string) {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET || "unconfigured")
    .update(`sv-admin:${createHash("sha256").update(process.env.ADMIN_PASSWORD || "").digest("hex")}:${payload}`).digest("hex");
}

export function sessionValue() {
  const expires = String(Date.now() + WEEK * 1000);
  return `${expires}.${sign(expires)}`;
}

export function validSession(value?: string) {
  if (!adminConfigured() || !value) return false;
  if (value.length > 100) return false;
  const parts = value.split(".");
  if (parts.length !== 2) return false;
  const [expires, signature] = parts;
  const expiry = Number(expires);
  if (!/^\d{13}$/.test(expires) || !/^[a-f0-9]{64}$/.test(signature) || !Number.isSafeInteger(expiry) || expiry <= Date.now() || expiry > Date.now() + WEEK * 1000) return false;
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
