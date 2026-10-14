"use client";
import dynamic from "next/dynamic";
import { Component, memo, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useMotionPreference } from "@/hooks/useMotionPreference";

const Threads = dynamic(() => import("@/components/react-bits/Threads"), { ssr: false });
class FieldBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export const ClosingAtmosphere = memo(function ClosingAtmosphere() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useMotionPreference();
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);
  useEffect(() => {
    let intersecting = false;
    const update = () => setVisible(intersecting && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { intersecting = entry.isIntersecting; if (intersecting) setLoaded(true); update(); }, { rootMargin: "150px" });
    if (root.current) observer.observe(root.current);
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, []);
  return <div className={`closing-atmosphere ${ready && !failed ? "closing-atmosphere-ready" : ""}`} ref={root} data-moving={visible && reduced === false} aria-hidden="true">{loaded && !failed && <FieldBoundary onError={onError}><Threads color="#8f7065" accentColor="#e75036" lineCount={26} thickness={1.1} amplitude={.65} waves={3} speed={.35} softness={1.3} angle={-18} opacity={.8} parting={.9} enableMouseInteraction paused={!visible || reduced !== false} onReady={onReady} onUnavailable={onError} /></FieldBoundary>}</div>;
});
