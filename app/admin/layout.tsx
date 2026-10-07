import localFont from "next/font/local";

// The dashboard keeps its established type system without preloading these
// four families on the public landing page.
const display = localFont({ src: "../fonts/ClashDisplay-Variable.woff2", weight: "200 700", variable: "--font-display", display: "swap" });
const serif = localFont({ src: "../../node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2", variable: "--font-serif", display: "swap", style: "italic" });
const mono = localFont({ src: "../../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2", variable: "--font-mono", display: "swap", weight: "100 800" });
const body = localFont({ src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2", variable: "--font-body", display: "swap", weight: "100 900" });

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} ${serif.variable} ${mono.variable} ${body.variable} font-body`}>{children}</div>;
}
