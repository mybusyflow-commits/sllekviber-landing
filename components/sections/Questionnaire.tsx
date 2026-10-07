"use client";

import { useEffect, useRef, useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Q1_OPTIONS, Q2_OPTIONS, type Q1Answer, type Q2Answer } from "@/lib/options";
import { SplitHeadline } from "@/components/ui/SplitHeadline";
import { scrollToSection } from "@/hooks/useLenis";

const VOTED_KEY = "sleekviber-pulse-voted-v2";
const SESSION_KEY = "sleekviber-pulse-session-v2";

function pressMarker(button: HTMLButtonElement) {
  const marker = button.querySelector<HTMLElement>(".option-marker");
  if (marker) gsap.fromTo(marker, { scale: .6 }, { scale: 1, duration: .35, ease: "back.out(1.4)", overwrite: true });
}

export function Questionnaire() {
  const [q1, setQ1] = useState<Q1Answer | null>(null);
  const [q2, setQ2] = useState<Q2Answer[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");
  const started = useRef(false);
  const q2Current = useRef<Q2Answer[]>([]);
  const optionsRef = useRef<HTMLDivElement>(null);
  const receipt = useRef<HTMLDivElement>(null);
  const justSubmitted = useRef(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => { try { setSubmitted(localStorage.getItem(VOTED_KEY) === "yes"); } catch { /* Storage restrictions must never hide the survey. */ } }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    ScrollTrigger.refresh();
    if (submitted && justSubmitted.current && receipt.current) {
      scrollToSection(receipt.current);
      receipt.current.focus({ preventScroll: true });
      justSubmitted.current = false;
    }
  }, [submitted]);

  function begin() {
    if (started.current || submitted) return;
    started.current = true;
    let sessionId = crypto.randomUUID();
    try { sessionId = localStorage.getItem(SESSION_KEY) || sessionId; localStorage.setItem(SESSION_KEY, sessionId); } catch { /* Server validation still protects submissions. */ }
    void fetch("/api/responses/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId }) }).catch(() => { /* Completion telemetry must not interrupt answering. */ });
  }

  function toggle(option: Q2Answer) {
    begin(); setError("");
    const current = q2Current.current;
    const commit = (next: Q2Answer[]) => { q2Current.current = next; setQ2(next); setHint(""); };
    if (option === "All of the above") { commit(current.includes(option) ? [] : [option]); return; }
    if (current.includes(option)) { commit(current.filter((v) => v !== option)); return; }
    if (current.filter((v) => v !== "All of the above").length >= 3) {
      setHint("Choose up to three, or select all of the above.");
      if (optionsRef.current) gsap.fromTo(optionsRef.current, { x: -4 }, { x: 0, duration: .5, ease: "back.out(1.4)" });
      return;
    }
    commit([...current.filter((v) => v !== "All of the above"), option]);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!q1 || !q2.length || pending || submitted) return;
    setPending(true); setError("");
    try {
      const response = await fetch("/api/responses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q1, q2 }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) { setError(data.error || "Your response could not be saved. Try again."); return; }
      try { localStorage.setItem(VOTED_KEY, "yes"); } catch { /* A saved server response remains a success without local storage. */ }
      justSubmitted.current = true; setSubmitted(true);
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const confetti = (await import("canvas-confetti")).default;
        const colors = ["#EEECE7", "#C8CDD0", "#777D83"];
        confetti({ particleCount: 70, spread: 62, origin: { x: .38, y: .62 }, colors, disableForReducedMotion: true });
        window.setTimeout(() => confetti({ particleCount: 60, spread: 70, origin: { x: .62, y: .6 }, colors, disableForReducedMotion: true }), 180);
      }
    } catch { setError("Connection lost. Your answers are still here. Try again."); }
    finally { setPending(false); }
  }

  return <section id="questionnaire" data-stage="questionnaire" className="relative min-h-svh px-6 py-24 md:px-12 md:py-32 lg:px-24" aria-labelledby="questionnaire-title">
    <div className="grid grid-cols-12 gap-y-12 lg:gap-x-12">
      <div className="col-span-12 lg:sticky lg:top-16 lg:col-span-5 lg:h-fit">
        <h2 id="questionnaire-title" className="max-w-[11ch] font-display text-[clamp(2.2rem,4.5vw,5.5rem)] leading-[1.12] font-normal tracking-[-.02em]"><SplitHeadline text="Your next build starts here." /></h2>
        <p className="mt-6 max-w-[27rem] text-base leading-[1.65] text-muted">Tell us where your current tools fall short. Your answers will help us decide what to build first.</p>
        <p className="mt-4 text-sm leading-relaxed text-muted">Two questions. No account needed.</p>
      </div>
      <div className="col-span-12 lg:col-span-7 lg:col-start-7">
        {submitted && <div ref={receipt} id="survey-receipt" tabIndex={-1} role="status" className="mb-12 py-6">
          <h3 className="font-display text-[clamp(1.5rem,2.3vw,2.5rem)] leading-[1.3] font-normal tracking-[-.01em]">Here you are. You just found the solution to all of it.</h3>
          <p className="mt-4 text-base leading-relaxed text-muted">Your response is saved. SleekViber is coming soon. Join the waitlist below for the launch update.</p>
          <a href="#about" className="button-ink mt-5 inline-flex min-h-11 items-center font-medium text-ink hover:text-accent">Join the waitlist</a>
        </div>}
        <form onSubmit={submit}>
          <p className="sr-only" aria-live="polite">{Number(Boolean(q1)) + Number(q2.length > 0)} of two questions answered</p>
          <fieldset>
            <legend className="max-w-xl font-body text-[clamp(1.4rem,2vw,1.9rem)] leading-[1.35] font-medium tracking-[-.02em]">Be honest — how fed up are you with AI-slop websites?</legend>
            <div className="mt-6 space-y-1">{Q1_OPTIONS.map(option => <button key={option} type="button" aria-pressed={q1 === option} disabled={submitted} onClick={(event) => { begin(); setQ1(option); setError(""); pressMarker(event.currentTarget); }} className={`option-row flex min-h-16 w-full items-center gap-4 px-3 py-4 text-left text-base ${q1 === option ? "bg-surface text-ink" : "text-muted hover:text-ink"}`}>
              <span aria-hidden="true" className={`option-marker grid size-5 shrink-0 place-items-center rounded-full border ${q1 === option ? "border-accent bg-accent text-void" : "border-ink/30 text-transparent"}`}><Check size={13} strokeWidth={3} /></span>
              <span className="min-w-0 flex-1">{option}</span>
            </button>)}</div>
          </fieldset>
          <fieldset className="mt-12">
            <legend className="max-w-xl font-body text-[clamp(1.4rem,2vw,1.9rem)] leading-[1.35] font-medium tracking-[-.02em]">What&apos;s your biggest pain with current vibe-coding platforms?</legend>
            <p id="pain-point-help" className="mt-4 text-sm leading-relaxed text-muted">Choose up to three, or select “All of the above.”</p>
            <div ref={optionsRef} className="mt-5 space-y-1">{Q2_OPTIONS.map(option => <button key={option} type="button" aria-pressed={q2.includes(option)} aria-describedby="pain-point-help" disabled={submitted} onClick={(event) => { toggle(option); pressMarker(event.currentTarget); }} className={`option-row flex min-h-16 w-full items-center gap-4 px-3 py-4 text-left text-base ${q2.includes(option) ? "bg-surface text-ink" : "text-muted hover:text-ink"}`}>
              <span aria-hidden="true" className={`option-marker grid size-5 shrink-0 place-items-center rounded-md border ${q2.includes(option) ? "border-accent bg-accent text-void" : "border-ink/30 text-transparent"}`}><Check size={13} strokeWidth={3} /></span>
              <span className="min-w-0 flex-1">{option}</span>
            </button>)}</div>
            <p role="status" className="mt-3 min-h-5 text-sm text-accent">{hint}</p>
          </fieldset>
          <p role="alert" className="mt-4 min-h-6 text-sm text-accent">{error}</p>
          <div className="relative mt-3 py-4 md:py-0">
            <button type="submit" disabled={!q1 || !q2.length || pending || submitted} className="button-ink flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-accent px-6 text-base font-medium text-void hover:bg-ink disabled:bg-surface disabled:text-muted">
              {pending && <LoaderCircle size={17} aria-hidden="true" />}{submitted && <Check size={18} aria-hidden="true" />}{submitted ? "Response saved" : pending ? "Sending your answers" : "Send your answers"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>;
}

