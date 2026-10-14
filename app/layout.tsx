import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const studio = localFont({ src: [
  { path: "./fonts/GeneralSans-400.woff2", weight: "400", style: "normal" },
  { path: "./fonts/GeneralSans-500.woff2", weight: "500", style: "normal" },
  { path: "./fonts/GeneralSans-600.woff2", weight: "600", style: "normal" },
], variable: "--font-studio", display: "swap", preload: true });
const display = localFont({ src: "./fonts/ClashDisplay-Variable.woff2", weight: "200 700", style: "normal", variable: "--font-landing-display", display: "swap", preload: true });

const deploymentHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (deploymentHost ? `https://${deploymentHost}` : "http://localhost:3005")),
  title: "SleekViber — Vibe coding, done right",
  description: "AI-slop frontends, almost-working backends, and broken links? SleekViber is building a better standard for vibe coding. Tell us what needs fixing.",
  openGraph: {
    title: "SleekViber — Vibe coding, done right",
    description: "The web deserves better. So do you. Help shape the next generation of vibe coding.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "SleekViber — Vibe coding, done right" }],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${studio.variable} ${display.variable}`}><body>{children}</body></html>;
}
