"use client";
import dynamic from "next/dynamic";
import { Component, memo, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "motion/react";

const Threads = dynamic(() => import("@/components/react-bits/Threads"), { ssr: false });
class FieldBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export const ClosingAtmosphere = memo(function ClosingAtmosphere() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setLoaded(true); }, { rootMargin: "150px" });
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  const label = failed ? "Closing background motion unavailable" : !ready ? "Loading closing background" : reduced ? "Closing background motion reduced by your preference" : paused ? "Play closing background motion" : "Pause closing background motion";
  return <><div className="closing-atmosphere" ref={root} aria-hidden="true">{loaded && !failed && <FieldBoundary onError={onError}><Threads color="#8f7065" accentColor="#e75036" lineCount={26} thickness={1.1} amplitude={.65} waves={3} speed={.35} softness={1.3} angle={-18} opacity={.8} parting={.9} enableMouseInteraction paused={paused || reduced !== false} onReady={onReady} onUnavailable={onError} /></FieldBoundary>}</div><button type="button" className="closing-motion" aria-label={label} title={label} aria-pressed={paused || reduced === true} disabled={failed || !ready || reduced !== false} onClick={() => setPaused(value => !value)}>{paused || reduced ? <Play size={16} /> : <Pause size={16} />}</button></>;
});
