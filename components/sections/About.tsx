"use client";
import { useState } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { SplitHeadline } from "@/components/ui/SplitHeadline";
import { TextPressure } from "@/components/react-bits/TextPressure";
import { requestJson } from "@/lib/client-request";
export function About() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [done, setDone] = useState(false);
  async function join(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending || done) return; setPending(true); setStatus("");
    try {
      const { response, data } = await requestJson<{ error?: string }>("/api/emails", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      if (!response.ok) { setStatus(data.error || "Could not save your email. Try again."); return; }
      setDone(true); setStatus("You're on the list. We'll be in touch.");
    } catch { setStatus("Connection lost. Please try again."); }
    finally { setPending(false); }
  }
  return <section id="about" className="about-section" aria-labelledby="about-title">
    <div className="about-intro"><h2 id="about-title"><SplitHeadline text="Good work deserves a better starting point." /></h2><p data-enter>Building with AI should leave you with work you can stand behind. That&apos;s what we&apos;re working on at SleekViber.</p></div>
    <div className="waitlist-area"><div><h3>Be here when we launch.</h3><p>Leave your email. We&apos;ll send you a launch update.</p></div>
      <form onSubmit={join} className="waitlist-form"><label htmlFor="waitlist-email">Email address</label><div className="waitlist-input-row"><input id="waitlist-email" type="email" required maxLength={254} autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} disabled={done || pending} placeholder="you@example.com" aria-describedby="waitlist-status" /><button type="submit" disabled={pending || done}>{pending ? <LoaderCircle size={19} className="loading-spinner" aria-hidden="true" /> : <ArrowUpRight size={20} aria-hidden="true" />}{done ? "You're on the list" : pending ? "Joining" : "Join the waitlist"}</button></div><p role="status" id="waitlist-status">{status}</p></form>
    </div>
    <a href="#top" className="footer-wordmark" aria-label="SleekViber, back to top"><TextPressure text="SleekViber" /><ArrowUpRight aria-hidden="true" strokeWidth={1} /></a>
    <footer><span>© {new Date().getFullYear()} SleekViber</span><span>Coming soon.</span><nav aria-label="Footer navigation"><a href="#solutions">Our approach</a><a href="#questionnaire">Take the survey</a><a href="/credits/DESIGN-NOTICE.txt">Credits</a></nav></footer>
  </section>;
}
