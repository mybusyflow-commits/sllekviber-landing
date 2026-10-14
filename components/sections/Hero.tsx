import { ArrowUpRight } from "lucide-react";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { BuildStudy } from "@/components/ui/BuildStudy";
import { SiteHeader } from "@/components/ui/SiteHeader";
export function Hero() {
  return <section id="top" className="hero-section hero-refined" aria-labelledby="hero-title">
    <SiteHeader />
    <div className="hero-stage">
      <div className="hero-message"><h1 id="hero-title" className="hero-title"><SplitReveal text="Beyond" /> <span className="almost-word"><SplitReveal text="almost." /></span></h1>
      <p className="hero-description">Vibe coding for the whole website. Original design, connected data, and complete user journeys.</p>
      <div className="hero-primary"><a href="#questionnaire" draggable={false} className="hero-survey" aria-label="Help shape SleekViber"><span>Help shape SleekViber</span><span className="round-arrow"><ArrowUpRight strokeWidth={1.4} /></span></a></div>
      <p className="hero-development">SleekViber is in development. Your answers help decide what we build first.</p></div>
      <BuildStudy />
    </div>
    <div className="hero-foot"><span>Coming soon.</span><a href="#problems">Why we&apos;re building SleekViber <ArrowUpRight size={17} /></a></div>
  </section>;
}
