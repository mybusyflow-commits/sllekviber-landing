import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { void: "var(--sv-void)", ink: "var(--sv-ink)", muted: "var(--sv-muted)", accent: "var(--sv-accent)", surface: "var(--sv-surface)" },
      fontFamily: { display: ["var(--font-display)", "Arial", "sans-serif"], body: ["var(--font-body)", "Arial", "sans-serif"], serif: ["var(--font-serif)", "Georgia", "serif"], mono: ["var(--font-mono)", "monospace"] },
    },
  },
} satisfies Config;
