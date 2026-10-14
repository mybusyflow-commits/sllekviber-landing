"use client";
import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Layers2, Pause, Play } from "lucide-react";
const Studio = dynamic(() => import("@/components/three/HeroStudio"), { ssr: false });
class StudioBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}
export function BuildStudy() {
  const root = useRef<HTMLDivElement>(null);
  const pointer = useRef<[number, number]>([0, 0]);
  const [inside, setInside] = useState(false);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reduced, setReduced] = useState(true);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);
  const motionLabel = failed ? "Motion unavailable in still view" : !ready ? "Loading the 3D concept" : reduced ? "Motion reduced by your system preference" : paused ? "Play 3D motion" : "Pause 3D motion";
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const changeMotion = () => setReduced(motion.matches);
    changeMotion(); motion.addEventListener("change", changeMotion);
    let intersecting = false;
    const update = () => setVisible(intersecting && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { intersecting = entry.isIntersecting; if (intersecting) setLoaded(true); update(); });
    if (root.current) observer.observe(root.current);
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); motion.removeEventListener("change", changeMotion); };
  }, []);
  return <div className={`hero-studio ${inside ? "studio-inside" : ""}`} ref={root}>
    <div className={`studio-art ${ready && !failed ? "studio-ready" : ""}`} aria-hidden="true"
      onPointerMove={event => { if (event.pointerType !== "mouse" || event.buttons) return; const rect = event.currentTarget.getBoundingClientRect(); pointer.current = [(event.clientX - rect.left) / rect.width * 2 - 1, (event.clientY - rect.top) / rect.height * 2 - 1]; }}
      onPointerLeave={() => { pointer.current = [0, 0]; }}>
      <div className="studio-fallback"><div className="studio-fallback-page"><span>Form &amp; Field</span><strong>Ideas<br />into form.</strong><p>A website with a point of view.</p><div>Design / Develop / Deliver</div></div>{inside && <div className="studio-fallback-system"><strong>Route → Validate → Save</strong><p>Public pages. Protected areas. Connected records.</p></div>}</div>
      {loaded && !failed && <StudioBoundary onError={onError}><Studio inside={inside} moving={visible && !paused && !reduced} reduced={reduced} pointer={pointer} onReady={onReady} onError={onError} /></StudioBoundary>}
    </div>
    <div className="studio-controls"><div className="studio-view-switch" role="group" aria-label="Explore the website concept"><button type="button" aria-pressed={!inside} onClick={() => setInside(false)}>The website</button><button type="button" aria-pressed={inside} onClick={() => setInside(true)}><Layers2 size={15} />Look inside</button></div><button className="studio-motion" type="button" disabled={reduced || failed || !ready} aria-label={motionLabel} title={motionLabel} aria-pressed={paused || reduced} onClick={() => setPaused(!paused)}>{paused || reduced ? <Play size={15} /> : <Pause size={15} />}</button></div>
    <p className="studio-caption" aria-live="polite">{inside ? "Routes, records and permissions. One considered system." : "From the first impression to everything underneath."}</p>
    {inside && <dl className="studio-mobile-details"><div><dt>A complete request.</dt><dd>A route validates the input, then saves a record.</dd></div><div><dt>Clear access boundaries.</dt><dd>Public pages stay open. Member areas check permissions.</dd></div></dl>}
    <p className="studio-disclosure">Illustrative concept · SleekViber is in development{failed ? " · Still view" : ""}</p>
  </div>;
}
