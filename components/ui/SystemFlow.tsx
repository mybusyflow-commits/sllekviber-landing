"use client";

import { createRef, useMemo, useRef } from "react";
import { Code2, Database, LayoutTemplate, MousePointer2, Search, ShieldCheck, Check, Send } from "lucide-react";
import { AnimatedBeam } from "@/components/magic-ui/animated-beam";
import { SOLUTIONS } from "@/lib/options";

const icons = [LayoutTemplate, Code2, Database, ShieldCheck, MousePointer2, Search];

// Composition adapted from Magic UI's Animated Beam multiple-input demo.
// Website layers replace service logos; every node is a fixed semantic control.
export function PlatformFlow({ active, onSelect }: { active: number; onSelect: (index: number) => void }) {
  const root = useRef<HTMLDivElement>(null);
  const core = useRef<HTMLDivElement>(null);
  const nodes = useMemo(() => Array.from({ length: 6 }, () => createRef<HTMLButtonElement>()), []);
  return <div className="platform-flow" ref={root} role="group" aria-label="Explore the intended website standards">
    <div className="platform-core" ref={core}><span>SleekViber</span><small>One connected build.</small></div>
    {SOLUTIONS.map((solution, index) => { const Icon = icons[index]; return <button key={solution.title} type="button" ref={nodes[index]} className={`platform-node platform-node-${index} ${active === index ? "platform-node-active" : ""}`} aria-pressed={active === index} aria-controls="standard-description" onClick={() => onSelect(index)}><Icon size={22} strokeWidth={1.4} aria-hidden="true" /><span>{solution.title}</span></button>; })}
    {nodes.map((node, index) => <AnimatedBeam key={`${active}-${index}`} containerRef={root} fromRef={node} toRef={core} curvature={index % 3 === 0 ? -50 : index % 3 === 2 ? 50 : 0} pathColor={active === index ? "#ef715b" : "#5f5a53"} pathOpacity={active === index ? .75 : .4} pathWidth={1.2} gradientStartColor="#e75036" gradientStopColor="#f0eee9" active={active === index} duration={2.6} repeat={Infinity} repeatDelay={1.2} />)}
  </div>;
}

export function RequestFlow({ connected }: { connected: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLDivElement>(null);
  const logic = useRef<HTMLDivElement>(null);
  const data = useRef<HTMLDivElement>(null);
  return <div ref={root} className={`request-flow ${connected ? "request-flow-connected" : ""}`} aria-hidden="true">
    <div className="request-stage"><div ref={form} className="request-node"><Send size={27} strokeWidth={1.2} /></div><strong>Form</strong><span>Answer received</span></div>
    <div className="request-stage"><div ref={logic} className="request-node"><ShieldCheck size={27} strokeWidth={1.2} /></div><strong>Logic</strong><span>{connected ? "Input validated" : "Waiting for a route"}</span></div>
    <div className="request-stage"><div ref={data} className="request-node"><Database size={27} strokeWidth={1.2} /></div><strong>Data</strong><span>{connected ? <><Check size={12} /> Record saved</> : "No saved record"}</span></div>
    <AnimatedBeam key={`a-${connected}`} containerRef={root} fromRef={form} toRef={logic} active={connected} pathColor={connected ? "#ef715b" : "#6e6860"} pathOpacity={.5} gradientStartColor="#e75036" gradientStopColor="#f0eee9" duration={1.1} repeat={Infinity} repeatDelay={1.8} />
    <AnimatedBeam key={`b-${connected}`} containerRef={root} fromRef={logic} toRef={data} active={connected} pathColor={connected ? "#ef715b" : "#6e6860"} pathOpacity={.5} gradientStartColor="#e75036" gradientStopColor="#f0eee9" duration={1.1} delay={.6} repeat={Infinity} repeatDelay={1.8} />
  </div>;
}
