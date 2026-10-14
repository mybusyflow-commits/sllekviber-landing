import { WireTerrain } from "@/components/ui/WireTerrain";
import { ScrollFloat } from "@/components/react-bits/ScrollFloat";
import { ArrowDownRight } from "lucide-react";
export function Reveal() {
  return <section id="reveal" className="manifesto-section" aria-labelledby="reveal-title"><WireTerrain /><div className="manifesto-content"><ScrollFloat id="reveal-title" text="Vibe coding, done right." /><p>That&apos;s the standard we&apos;re building towards.</p><ArrowDownRight strokeWidth={1} className="manifesto-arrow" aria-hidden="true" /></div><div className="manifesto-signature" aria-hidden="true">SleekViber.</div></section>;
}
