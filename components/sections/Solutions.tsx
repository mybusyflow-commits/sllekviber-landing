import { Database, Fingerprint, LayoutTemplate, Route, Search, Workflow } from "lucide-react";
import { SOLUTIONS } from "@/lib/options";
import { SplitReveal } from "@/components/ui/SplitReveal";

const icons = [LayoutTemplate, Workflow, Database, Fingerprint, Route, Search];

export function Solutions() {
  return <section id="solutions" data-stage="solutions" className="relative px-6 py-24 md:px-12 md:py-32 lg:px-24" aria-labelledby="solutions-title">
    <div className="solutions-intro grid grid-cols-12 gap-y-8 pb-16 md:min-h-[85svh] md:items-center md:pb-24">
      <div className="col-span-12 md:col-span-6">
        <h2 id="solutions-title" className="max-w-[11ch] font-display text-[clamp(2.2rem,5vw,6.5rem)] leading-[1.12] font-normal tracking-[-.02em]"><SplitReveal text="Built to hold up." choreographed /></h2>
        <p className="solutions-note mt-6 max-w-[26rem] text-base leading-[1.65] text-muted">The frontend gets your attention. Everything underneath earns your trust. We&apos;re building for both.</p>
      </div>
    </div>
    <div className="standards-grid grid grid-cols-12 gap-x-0 gap-y-14 md:gap-x-4 md:gap-y-20 lg:gap-x-10">
      {SOLUTIONS.map((solution, index) => {
        const Icon = icons[index];
        return <article key={solution.title} className="col-span-12 min-w-0 md:col-span-5 even:md:col-start-8">
          <Icon size={26} strokeWidth={1.4} className="mb-5 text-accent" aria-hidden="true" />
          <h3 className="font-display text-[clamp(1.3rem,1.8vw,2.2rem)] leading-[1.3] font-normal tracking-[-.01em]">{solution.title}</h3>
          <p className="mt-4 max-w-[29rem] text-base leading-[1.65] text-muted">{solution.description}</p>
        </article>;
      })}
    </div>
    <a href="#questionnaire" className="button-ink mt-16 inline-flex min-h-13 items-center rounded-full bg-ink px-7 text-base font-medium text-void hover:bg-accent">Tell us what matters to you</a>
  </section>;
}
