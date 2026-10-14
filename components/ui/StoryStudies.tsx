"use client";
import { useState } from "react";
import { ArrowUpRight, Check, LockKeyhole, RotateCcw, ShieldCheck } from "lucide-react";
import { PixelTransition } from "./PixelTransition";
import GridMotion from "@/components/react-bits/GridMotion";
import GlareHover from "@/components/react-bits/GlareHover";
const repeatedPrints = Array.from({ length: 8 }, (_, i) => <div key={i} className={`gallery-print print-${i % 4}`}><span>same.</span><i /><small>Another convincing preview.</small></div>);
export function DesignStudy() {
  const [original, setOriginal] = useState(false);
  return <div className="study design-study">
    <PixelTransition active={original} first={<GridMotion items={repeatedPrints} paused={original} rows={3} angle={-12} gap={14} radius={3} speed={8} parallax={.3} dim={0} spotlight={.35} fade={.05} tileColor="#dad8d2" />}
      second={<div className="individual-print"><div className="print-top">SleekViber<span>Design study</span></div><span className="individual-title">Yours.</span><div className="print-orbits">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ transform: `rotate(${i * 170 / 13}deg)` }} />)}</div><span className="print-signoff">A point of view.<br />Not another preview.</span></div>} />
    <div className="study-controls"><span role="status">{original ? "A point of view." : "The same design. Again."}</span><button type="button" aria-pressed={original} onClick={() => setOriginal(!original)}>{original ? <>Reset <RotateCcw size={16} /></> : <>Break the pattern <ArrowUpRight size={16} /></>}</button></div>
  </div>;
}
export function ConnectionStudy() {
  const [connected, setConnected] = useState(false);
  return <div className={`study connection-study ${connected ? "connected" : ""}`}>
    <div className="connection-visual" aria-hidden="true"><svg viewBox="0 0 600 430"><defs><linearGradient id="route-metal"><stop stopColor="#464646" /><stop offset=".5" stopColor="#ededeb" /><stop offset="1" stopColor="#464646" /></linearGradient></defs>{[0, 2.5, 5].map(i => <path key={i} className="route-echo" d={`M80 ${175 + i * 170 / 13} C180 ${50 + i * 15}, 250 ${380 - i * 15}, 310 215 S430 ${75 + i * 20}, 520 ${175 + i * 170 / 13}`} />)}<path className="route-primary" d="M80 215C180 75 240 355 310 215S440 75 520 215" /><circle cx="80" cy="215" r="42" /><circle cx="310" cy="215" r="42" /><circle cx="520" cy="215" r="42" /><text x="80" y="220">Form</text><text x="310" y="220">Logic</text><text x="520" y="220">Data</text></svg><span className="journey-line">From click.<br /><em>To outcome.</em></span></div>
    <div className="connection-outcome" role="status">{connected ? <><Check size={17} /> A complete journey.</> : "Almost working isn’t working."}</div>
    <div className="study-controls"><span>Form. Logic. Data.</span><button type="button" aria-pressed={connected} onClick={() => setConnected(!connected)}>{connected ? <>Disconnect <RotateCcw size={16} /></> : <>Connect the dots <ArrowUpRight size={16} /></>}</button></div>
  </div>;
}
export function TrustStudy() {
  const [member, setMember] = useState(false);
  return <div className={`study trust-study ${member ? "verified" : ""}`}>
    <div className="trust-visual" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <div className="trust-orbit" key={i} style={{ width: `${34 + i * 54 / 7}%`, height: `${34 + i * 54 / 7}%`, transform: `translate(-50%,-50%) rotate(${i * 162 / 7}deg)` }} />)}<GlareHover className="trust-core" borderRadius="50%" glareOpacity={.3} mode="follow" rimGlint={false} background="#111111" glareColor="#ffffff">{member ? <ShieldCheck strokeWidth={1} /> : <LockKeyhole strokeWidth={1} />}</GlareHover></div>
    <p className="trust-result" role="status">{member ? "Verified. You’re in." : "Private stays private."}</p>
    <div className="role-switch" role="group" aria-label="Explore the access-control illustration"><button type="button" aria-pressed={!member} onClick={() => setMember(false)}>Visitor</button><button type="button" aria-pressed={member} onClick={() => setMember(true)}>Member</button></div>
    <div className="study-controls"><span>Permissions come first.</span><span>Trust is built in.</span></div>
  </div>;
}
