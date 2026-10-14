"use client";
import { useState } from "react";
import { ArrowUpRight, Plus, Minus } from "lucide-react";
import { SOLUTIONS } from "@/lib/options";
import { SplitReveal } from "@/components/ui/SplitReveal";
import GlareHover from "@/components/react-bits/GlareHover";
import { WebsiteConcept } from "@/components/ui/WebsiteConcept";
const concepts = ["design", "connection", "data", "access", "journey", "search"] as const;
export function Solutions() {
  const [active, setActive] = useState(0);
  return <section id="solutions" className="solutions-section light-section" aria-labelledby="solutions-title">
    <div className="solutions-intro"><h2 id="solutions-title"><SplitReveal text="Built to hold up." /></h2><div><p>The frontend gets your attention. Everything underneath earns your trust. We&apos;re building for both.</p><a href="#questionnaire" className="text-link">Tell us what matters to you <ArrowUpRight size={17} /></a></div></div>
    <div className="standards-layout"><GlareHover className="standard-visual standard-contextual" width="100%" background="#deddd8" borderRadius="16px" mode="follow" glareOpacity={.12} rimGlint={false}><div key={active} className="standard-concept" aria-hidden="true"><WebsiteConcept kind={concepts[active]} /></div><span className="engine-caption">{SOLUTIONS[active].detail} · CONCEPT</span></GlareHover>
      <div className="standards-list">{SOLUTIONS.map((solution, i) => <article className={`standard ${active === i ? "standard-active" : ""}`} key={solution.title}><h3><button type="button" aria-expanded={active === i} aria-controls={`standard-panel-${i}`} onClick={() => setActive(i)}>{solution.title}{active === i ? <Minus size={20} /> : <Plus size={20} />}</button></h3><div id={`standard-panel-${i}`} className="standard-panel" hidden={active !== i}><p>{solution.description}</p></div></article>)}</div>
    </div>
  </section>;
}
