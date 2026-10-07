import { PROBLEM_CHAPTERS } from "@/lib/story";
import { SplitReveal } from "@/components/ui/SplitReveal";

export function Problems() {
  return <section id="problems" data-stage="problems" className="relative h-[320svh]" aria-labelledby="problems-title">
    <h2 id="problems-title" className="sr-only">Why we are building SleekViber</h2>
    <div className="master-shell sticky top-0 flex h-svh flex-col px-6 py-12 md:px-12 md:py-16 lg:px-24">
      <div className="problem-track relative min-h-0 flex-1">
        {PROBLEM_CHAPTERS.map((chapter, index) => <article key={chapter.label} data-chapter={index} className="story-chapter absolute inset-0 grid grid-cols-12 items-end pb-6 md:items-center md:pb-0">
          <div className="col-span-12 max-w-[32rem] md:col-span-6 md:max-w-none">
            <h3 className="max-w-[12ch] font-display text-[clamp(2.2rem,5vw,6.5rem)] leading-[1.12] font-normal tracking-[-.02em]"><SplitReveal text={chapter.title} choreographed /></h3>
            <p className="chapter-note mt-6 max-w-[29rem] text-base leading-[1.65] text-muted">{chapter.note}</p>
          </div>
        </article>)}
      </div>
    </div>
  </section>;
}
