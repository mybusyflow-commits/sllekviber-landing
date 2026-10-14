/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  // Vercel packages the standard .next directory; local previews keep a separate cache.
  distDir: process.env.VERCEL_ENV ? ".next" : ".next-local",
  poweredByHeader: false,
  async headers() {
    const dev = process.env.NODE_ENV !== "production";
    const csp = ["default-src 'self'", `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${dev ? " 'unsafe-eval'" : ""}`, "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob:", "font-src 'self' data:", `connect-src 'self' blob:${dev ? " ws://localhost:* ws://127.0.0.1:*" : ""}`, "worker-src 'self' blob:", "object-src 'none'", "base-uri 'self'", "frame-ancestors 'none'", "form-action 'self'"].join("; ");
    return [{ source: "/:path*", headers: [
      { key: "Content-Security-Policy", value: csp },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ...(!dev ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] : []),
    ] }, { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] }];
  },
};

export default nextConfig;
