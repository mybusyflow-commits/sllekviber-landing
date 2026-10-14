"use client";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { SOLUTIONS } from "@/lib/options";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { PlatformFlow } from "@/components/ui/SystemFlow";
export function Solutions() {
  const [active, setActive] = useState(0);
  return <section id="solutions" className="solutions-section connected-standards" aria-labelledby="solutions-title">
    <div className="solutions-intro"><h2 id="solutions-title"><SplitReveal text="Built to hold up." /></h2><p>The frontend gets your attention. Everything underneath earns your trust. We&apos;re building for both.</p></div>
    <PlatformFlow active={active} onSelect={setActive} />
    <div className="standard-description" id="standard-description" aria-live="polite"><div><h3>{SOLUTIONS[active].title}</h3><p>{SOLUTIONS[active].description}</p></div><span>Illustrative concept.<br />SleekViber is in development.</span></div>
    <a href="#questionnaire" className="text-link">Tell us what matters to you <ArrowUpRight size={17} /></a>
  </section>;
}
