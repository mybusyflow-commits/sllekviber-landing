"use client";
import { useState } from "react";
import { ArrowUpRight, Check, LockKeyhole, RotateCcw, ShieldCheck } from "lucide-react";
import { PixelTransition } from "./PixelTransition";
import GridMotion from "@/components/react-bits/GridMotion";
import { TextPressure } from "@/components/react-bits/TextPressure";
import { RequestFlow } from "@/components/ui/SystemFlow";
import { AnimatedListItem } from "@/components/magic-ui/animated-list";
const repeatedPrints = Array.from({ length: 8 }, (_, i) => <div key={i} className={`gallery-print print-${i % 4}`}><span>same.</span><i /><small>Another convincing preview.</small></div>);
export function DesignStudy() {
  const [original, setOriginal] = useState(false);
  return <div className="study design-study">
    <PixelTransition active={original} first={<GridMotion items={repeatedPrints} paused={original} rows={3} angle={-12} gap={14} radius={3} speed={8} parallax={.3} dim={0} spotlight={.35} fade={.05} tileColor="#dad8d2" />}
      second={<div className="individual-print personal-print"><div className="print-top">SleekViber<span>Design study</span></div><div className="personal-type"><TextPressure text="Yours." /></div><span className="print-signoff">A point of view.<br />Not another preview.</span></div>} />
    <div className="study-controls"><span role="status">{original ? "A point of view." : "The same design. Again."}</span><button type="button" aria-pressed={original} onClick={() => setOriginal(!original)}>{original ? <>Reset <RotateCcw size={16} /></> : <>Break the pattern <ArrowUpRight size={16} /></>}</button></div>
  </div>;
}
export function ConnectionStudy() {
  const [connected, setConnected] = useState(false);
  return <div className={`study connection-study ${connected ? "connected" : ""}`}>
    <div className="connection-flow-visual"><h4>From click.<br /><em>To outcome.</em></h4><RequestFlow connected={connected} /><span>Illustrative request lifecycle</span></div>
    <div className="connection-outcome" role="status">{connected ? <><Check size={17} /> A complete journey.</> : "Almost working isn’t working."}</div>
    <div className="study-controls"><span>Form. Logic. Data.</span><button type="button" aria-pressed={connected} onClick={() => setConnected(!connected)}>{connected ? <>Disconnect <RotateCcw size={16} /></> : <>Connect the dots <ArrowUpRight size={16} /></>}</button></div>
  </div>;
}
export function TrustStudy() {
  const [member, setMember] = useState(false);
  return <div className={`study trust-study ${member ? "verified" : ""}`}>
    <div className="trust-permission-panel"><ShieldCheck size={32} strokeWidth={1.2} /><h4>Private stays private.</h4><p>Access follows the role.<br />Explore the illustrative permissions below.</p><div className="trust-permission-list" role="list">{["Public page", "Private area", "Account settings"].map((label, i) => <AnimatedListItem key={`${label}-${member}`}><div className="trust-permission-row" role="listitem"><span>{label}</span><span className={member || i === 0 ? "access-allowed" : "access-locked"}>{member || i === 0 ? <><Check size={15} /> Allowed</> : <><LockKeyhole size={14} /> Protected</>}</span></div></AnimatedListItem>)}</div></div>
    <p className="trust-result" role="status">{member ? "Member permissions shown." : "Visitor permissions shown."}</p>
    <div className="role-switch" role="group" aria-label="Explore the access-control illustration"><button type="button" aria-pressed={!member} onClick={() => setMember(false)}>Visitor</button><button type="button" aria-pressed={member} onClick={() => setMember(true)}>Member</button></div>
    <div className="study-controls"><span>Permissions come first.</span><span>Trust is built in.</span></div>
  </div>;
}
