import { isIP } from "node:net";

export function sameOrigin(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const url = new URL(request.url);
    // Next's local server can normalize request.url to localhost even when a
    // browser opened 127.0.0.1. Host is the browser's requested authority.
    // Vercel terminates HTTPS at its trusted edge; do not trust arbitrary
    // client-supplied forwarded protocol or host headers on local servers.
    const protocol = process.env.VERCEL ? "https:" : url.protocol;
    const expected = new URL(`${protocol}//${request.headers.get("host") || url.host}`);
    if (expected.username || expected.password || expected.pathname !== "/" || expected.search || expected.hash) return false;
    return new URL(origin).origin === expected.origin;
  } catch { return false; }
}

export function clientAddress(request: Request) {
  // Vercel overwrites this header at its trusted edge. Local clients must not
  // bypass throttling or duplicate checks by supplying their own forwarded IP.
  if (!process.env.VERCEL) return "local";
  const address = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || "";
  return isIP(address) ? address : "unknown";
}

export class InputError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

// Count bytes actually read, including chunked bodies without Content-Length.
export async function readJson(request: Request, maxBytes = 4096, timeoutMs = 10_000): Promise<unknown> {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") || "")) throw new InputError(415, "Send JSON with Content-Type: application/json.");
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > maxBytes)) throw new InputError(413, "Payload too large.");
  if (!request.body) throw new InputError(400, "Invalid JSON.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new InputError(408, "Request timed out. Please try again.")), timeoutMs); });
  try {
    while (true) {
      const { value, done } = await Promise.race([reader.read(), timeout]);
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { void reader.cancel().catch(() => {}); throw new InputError(413, "Payload too large."); }
      chunks.push(value);
    }
  } catch (error) { void reader.cancel().catch(() => {}); throw error; }
  finally { if (timer) clearTimeout(timer); reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
  catch { throw new InputError(400, "Invalid JSON."); }
}
