"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { SplitHeadline } from "@/components/ui/SplitHeadline";

export function About() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [done, setDone] = useState(false);
  async function join(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setStatus("");
    try {
      const response = await fetch("/api/emails", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) { setStatus(data.error || "Could not save your email. Try again."); return; }
      setDone(true); setStatus("You're on the list. We'll be in touch.");
    } catch { setStatus("Connection lost. Please try again."); }
    finally { setPending(false); }
  }
  return <section id="about" data-stage="about" className="relative px-6 pt-24 md:px-12 md:pt-32 lg:px-24" aria-labelledby="about-title">
    <div className="grid grid-cols-12 gap-y-12 pb-24 md:pb-32">
      <div className="col-span-12 md:col-span-7">
        <h2 id="about-title" className="max-w-[13ch] font-display text-[clamp(2.2rem,5vw,6.5rem)] leading-[1.12] font-normal tracking-[-.02em]"><SplitHeadline text="Good work deserves a better starting point." /></h2>
        <p className="mt-8 max-w-[32rem] text-base leading-[1.65] text-muted">Building with AI should leave you with work you can stand behind. That&apos;s what we&apos;re working on at SleekViber.</p>
      </div>
      <div className="col-span-12 md:col-span-8 lg:col-span-6 lg:col-start-7">
        <h3 className="font-display text-xl font-normal leading-[1.3] tracking-[-.01em] md:text-2xl">Be here when we launch.</h3>
        <p className="mt-3 text-base leading-relaxed text-muted">Leave your email. We&apos;ll send you a launch update.</p>
        <form onSubmit={join} className="mt-6 flex max-w-xl flex-col gap-3 sm:flex-row">
          <label htmlFor="waitlist-email" className="sr-only">Email address</label>
          <input id="waitlist-email" type="email" required maxLength={254} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={done} placeholder="Your email address" className="min-h-14 min-w-0 flex-1 rounded-xl border border-ink/25 bg-void px-4 text-base text-ink placeholder:text-muted" />
          <button type="submit" disabled={pending || done} className="button-ink inline-flex min-h-14 shrink-0 items-center justify-center gap-3 rounded-full bg-ink px-6 text-base font-medium text-void hover:bg-accent disabled:bg-surface disabled:text-muted">{pending && <LoaderCircle size={18} aria-hidden="true" />}{done ? "You're on the list" : pending ? "Joining" : "Join the waitlist"}</button>
        </form>
        <p role="status" className="mt-3 min-h-6 text-sm text-accent">{status}</p>
      </div>
    </div>
    <footer className="flex flex-wrap items-center justify-between gap-6 py-8 text-sm text-muted">
      <a href="#top" className="font-display text-xl font-normal tracking-[-.02em] text-ink">SleekViber</a>
      <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-2">
        <a href="#solutions" className="button-ink inline-flex min-h-11 items-center hover:text-accent">Our approach</a>
        <a href="#questionnaire" className="button-ink inline-flex min-h-11 items-center hover:text-accent">Take the survey</a>
        <a href="/models/LICENSES.txt" className="button-ink inline-flex min-h-11 items-center hover:text-accent">Credits</a>
      </nav>
      <span>© {new Date().getFullYear()} SleekViber</span>
    </footer>
  </section>;
}
