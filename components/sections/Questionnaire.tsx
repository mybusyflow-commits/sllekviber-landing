"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Check, ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Q1_OPTIONS, Q2_OPTIONS, type Q1Answer, type Q2Answer } from "@/lib/options";
import { SplitHeadline } from "@/components/ui/SplitHeadline";
import { SurveyResults } from "@/components/ui/SurveyResults";
import { scrollToSection } from "@/hooks/useLenis";
import { requestJson } from "@/lib/client-request";
import Stepper, { Step } from "@/components/react-bits/Stepper";

const VOTED_KEY = "sleekviber-pulse-voted-v2";
const SESSION_KEY = "sleekviber-pulse-session-v2";

function pressMarker(button: HTMLButtonElement) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
  const [step, setStep] = useState(1);
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

  useEffect(() => {
    const timer = window.setTimeout(() => ScrollTrigger.refresh(), 650);
    return () => window.clearTimeout(timer);
  }, [step]);

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
      if (optionsRef.current && !matchMedia("(prefers-reduced-motion: reduce)").matches) gsap.fromTo(optionsRef.current, { x: -4 }, { x: 0, duration: .5, ease: "back.out(1.4)" });
      return;
    }
    commit([...current.filter((v) => v !== "All of the above"), option]);
  }

  async function submit(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!q1 || !q2.length || pending || submitted) return;
    setPending(true); setError("");
    try {
      const { response, data } = await requestJson<{ error?: string }>("/api/responses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q1, q2 }) });
      if (!response.ok) { setError(data.error || "Your response could not be saved. Try again."); return; }
      try { localStorage.setItem(VOTED_KEY, "yes"); } catch { /* A saved server response remains a success without local storage. */ }
      justSubmitted.current = true; setSubmitted(true);
      try { if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const confetti = (await import("canvas-confetti")).default;
        const colors = ["#EEECE7", "#C8CDD0", "#777D83"];
        confetti({ particleCount: 70, spread: 62, origin: { x: .38, y: .62 }, colors, disableForReducedMotion: true });
        window.setTimeout(() => confetti({ particleCount: 60, spread: 70, origin: { x: .62, y: .6 }, colors, disableForReducedMotion: true }), 180);
      } } catch { /* Optional celebration must never turn a saved vote into an error. */ }
    } catch { setError("Connection lost. Your answers are still here. Try again."); }
    finally { setPending(false); }
  }

  function changeStep(next: number) {
    if (pending || submitted || (next === 2 && !q1)) return;
    setStep(next); setError("");
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      document.querySelector<HTMLElement>("#survey-wizard .stepper__pane:not(.stepper__pane--leaving)")?.focus({ preventScroll: true });
      const wizard = document.getElementById("survey-wizard");
      if (wizard) scrollToSection(wizard);
    });
  }

  return <section id="questionnaire" data-stage="questionnaire" className="survey-section light-section guided-survey" aria-labelledby="questionnaire-title">
    <div className="survey-intro">
      <h2 id="questionnaire-title" className="survey-title"><SplitHeadline text="Your next build starts here." /></h2>
      <p>Tell us where your current tools fall short. Your answers will help us decide what to build first.</p>
      <span>Two questions. No account needed.</span>
    </div>
    <div className="survey-workspace">
      <aside className="survey-aside">
        <span className="survey-step-count">{submitted ? <Check size={40} strokeWidth={1.2} /> : `${String(step).padStart(2, "0")} / 02`}</span>
        <p>{submitted ? "Your response is saved." : step === 1 ? "Start with your experience." : "Tell us what needs to change."}</p>
        <span>{submitted ? "Thanks for helping shape SleekViber." : "Your answers stay here when you go back."}</span>
        <a href="#survey-results">See the response so far <ArrowUpRight size={16} /></a>
      </aside>
      <form id="survey-wizard" onSubmit={submit} className="survey-wizard">
        <Stepper step={submitted ? 3 : step} onStepChange={changeStep} onFinalStepCompleted={() => void submit()}
          frame={false} theme="light" radius={0} width="100%" transition="slide" linear
          backButtonText="Back" nextButtonText="Next question" completeButtonText={pending ? "Sending your answers" : "Send your answers"}
          backButtonProps={{ disabled: pending || submitted }}
          nextButtonProps={{ disabled: pending || submitted || (step === 1 ? !q1 : !q2.length), "aria-busy": pending }}
          disableStepIndicators={pending || submitted}
          style={{ "--stepper-ink": "#171717", "--stepper-muted": "#5b5853", "--stepper-solid": "#171717", "--stepper-solid-ink": "#f0eee9", "--stepper-well": "#dedbd4", "--stepper-tile": "#f0eee9", "--stepper-tile-edge": "transparent", "--stepper-tile-highlight": "transparent", "--stepper-tile-shadow": "none", "--stepper-ring": "#a82d19" } as CSSProperties}
          completedContent={<div ref={receipt} id="survey-receipt" tabIndex={-1} role="status" className="survey-receipt"><Check size={36} strokeWidth={1.3} /><h3>Here you are. You just found the solution to all of it.</h3><p>Your response is saved. SleekViber is coming soon. Join the waitlist below for the launch update.</p><a href="#about">Join the waitlist <ArrowUpRight size={17} /></a></div>}>
          <Step title="Your experience">
          <p className="sr-only" aria-live="polite">{Number(Boolean(q1)) + Number(q2.length > 0)} of two questions answered</p>
          <fieldset disabled={pending || submitted}>
            <legend className="max-w-xl font-body text-[clamp(1.4rem,2vw,1.9rem)] leading-[1.35] font-medium tracking-[-.02em]">Be honest — how fed up are you with AI-slop websites?</legend>
            <div className="survey-interest-options">{Q1_OPTIONS.map(option => <button key={option} type="button" aria-pressed={q1 === option} disabled={submitted} onClick={(event) => { begin(); setQ1(option); setError(""); pressMarker(event.currentTarget); }} className={`option-row flex min-h-16 w-full items-center gap-4 px-3 py-4 text-left text-base ${q1 === option ? "bg-surface text-ink" : "text-muted hover:text-ink"}`}>
              <span aria-hidden="true" className={`option-marker grid size-5 shrink-0 place-items-center rounded-full border ${q1 === option ? "border-accent bg-accent text-void" : "border-ink/30 text-transparent"}`}><Check size={13} strokeWidth={3} /></span>
              <span className="min-w-0 flex-1">{option}</span>
            </button>)}</div>
          </fieldset>
          </Step>
          <Step title="What matters most">
          <fieldset disabled={pending || submitted}>
            <legend className="max-w-xl font-body text-[clamp(1.4rem,2vw,1.9rem)] leading-[1.35] font-medium tracking-[-.02em]">What&apos;s your biggest pain with current vibe-coding platforms?</legend>
            <p id="pain-point-help" className="mt-4 text-sm leading-relaxed text-muted">Choose up to three, or select “All of the above.”</p>
            <div ref={optionsRef} className="pain-options mt-5">{Q2_OPTIONS.map(option => <button key={option} type="button" aria-pressed={q2.includes(option)} aria-describedby="pain-point-help" disabled={submitted} onClick={(event) => { toggle(option); pressMarker(event.currentTarget); }} className={`option-row flex min-h-16 w-full items-center gap-4 px-3 py-4 text-left text-base ${q2.includes(option) ? "bg-surface text-ink" : "text-muted hover:text-ink"}`}>
              <span aria-hidden="true" className={`option-marker grid size-5 shrink-0 place-items-center rounded-md border ${q2.includes(option) ? "border-accent bg-accent text-void" : "border-ink/30 text-transparent"}`}><Check size={13} strokeWidth={3} /></span>
              <span className="min-w-0 flex-1">{option}</span>
            </button>)}</div>
            <p role="status" className="mt-3 min-h-5 text-sm text-accent">{hint}</p>
          </fieldset>
          </Step>
        </Stepper>
          <p role="alert" className="mt-4 min-h-6 text-sm text-accent">{error}</p>
        </form>
    </div>
    <SurveyResults submitted={submitted} />
  </section>;
}

