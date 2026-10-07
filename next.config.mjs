/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  // Keep generated output separate from an older OneDrive-backed .next cache.
  distDir: ".next-local",
};

export default nextConfig;
