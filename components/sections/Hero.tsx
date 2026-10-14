"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { useMotionPreference } from "@/hooks/useMotionPreference";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/ui/SiteHeader";

const ColorBends = dynamic(() => import("@/components/ui/ColorBends"), { ssr: false });

class BackgroundBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

// Composition and entrance adapted from Aceternity's free Hero Section One.
// https://ui.aceternity.com/components/hero-sections-free
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const reduced = useMotionPreference();
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");
  const onReady = useCallback(() => setStatus("ready"), []);
  const onError = useCallback(() => setStatus("unavailable"), []);

  useEffect(() => {
    let intersecting = false;
    const update = () => setVisible(intersecting && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      if (intersecting) setLoaded(true);
      update();
    });
    if (root.current) observer.observe(root.current);
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, []);

  const moving = visible && reduced === false;

  return <section ref={root} id="top" className="hero-section hero-immersive" data-moving={moving} aria-labelledby="hero-title">
    <div className={`hero-atmosphere ${status === "ready" ? "hero-atmosphere-ready" : ""}`} aria-hidden="true">
      <div className="hero-atmosphere-still" />
      {loaded && status !== "unavailable" && <BackgroundBoundary onError={onError}><ColorBends moving={moving} onReady={onReady} onError={onError} /></BackgroundBoundary>}
    </div>
    <SiteHeader />
    <div className="hero-stage">
      <div className="hero-message">
        <h1 id="hero-title" className="hero-title">
          {["Beyond", "almost."].map((word, index) => <motion.span key={word} initial={false}
            animate={reduced !== false ? { filter: "blur(0px)", y: 0 } : { filter: ["blur(5px)", "blur(0px)"], y: [14, 0] }}
            transition={{ duration: .9, delay: .08 + index * .14, ease: [.16, 1, .3, 1] }}
            className={index === 1 ? "almost-word" : undefined}>{word}{index === 0 ? " " : ""}</motion.span>)}
        </h1>
        <p className="hero-description">Vibe coding for the whole website.<br />{" "}Original design, connected data, and complete user journeys.</p>
        <div className="hero-primary"><a href="#questionnaire" draggable={false} className="hero-survey" aria-label="Help shape SleekViber"><span>Help shape SleekViber</span><span className="round-arrow"><ArrowUpRight strokeWidth={1.4} /></span></a></div>
      </div>
    </div>
    <div className="hero-foot">
      <p className="hero-development">SleekViber is in development.<br />Your answers help decide what we build first.</p>
      <div className="hero-foot-actions"><a href="#problems">Why we&apos;re building SleekViber <ArrowUpRight size={17} /></a></div>
    </div>
  </section>;
}
