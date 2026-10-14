// Keep controls recoverable when a connection stalls, including response-body reads.
export async function requestJson<T>(url: string, init: RequestInit = {}, timeoutMs = 15_000) {
  const controller = new AbortController();
  const external = init.signal;
  const abort = () => controller.abort(external?.reason);
  if (external?.aborted) abort();
  else external?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(() => controller.abort(new DOMException("The request timed out. Please try again.", "TimeoutError")), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const text = await response.text();
    let data: T;
    try { data = JSON.parse(text) as T; }
    catch { if (response.ok) throw new Error("The server returned an unreadable response. Please try again."); data = {} as T; }
    return { response, data };
  } finally { clearTimeout(timer); external?.removeEventListener("abort", abort); }
}
