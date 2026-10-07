import { SplitReveal } from "@/components/ui/SplitReveal";

export function Reveal() {
  return <section id="reveal" data-stage="reveal" className="relative h-[150svh]" aria-labelledby="reveal-title">
    <div className="master-shell sticky top-0 flex h-svh flex-col justify-end overflow-hidden px-6 py-12 md:px-12 md:py-16 lg:px-24">
      <div className="reveal-content relative z-10 pb-[5svh]">
        <h2 id="reveal-title" className="font-display text-[clamp(2.3rem,10vw,14rem)] leading-[1.1] font-normal tracking-[-.02em]"><SplitReveal text="SleekViber." choreographed /></h2>
        <p className="reveal-note mt-4 text-base leading-relaxed text-muted md:text-lg">Vibe coding, done right. That&apos;s the standard we&apos;re building towards.</p>
      </div>
    </div>
  </section>;
}
