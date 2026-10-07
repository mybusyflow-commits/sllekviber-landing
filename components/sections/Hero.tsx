import { SplitReveal } from "@/components/ui/SplitReveal";

export function Hero() {
  return <section id="top" data-stage="hero" className="relative h-[125svh]" aria-labelledby="hero-title">
      <header className="absolute inset-x-0 top-0 z-10 flex min-h-21 items-center justify-between gap-5 px-6 md:min-h-24 md:px-12 lg:px-24">
        <a href="#top" aria-label="SleekViber home" className="text-[22px] font-semibold tracking-[-.035em]">SleekViber</a>
        <nav aria-label="Main navigation" className="flex items-center gap-7 text-sm md:gap-10">
          <a href="#solutions" className="button-ink hidden min-h-11 items-center hover:text-accent md:inline-flex">Our approach</a>
          <a href="#about" className="button-ink hidden min-h-11 items-center hover:text-accent sm:inline-flex">About</a>
          <a href="#questionnaire" className="button-ink inline-flex min-h-11 items-center font-medium hover:text-accent">Take the survey</a>
        </nav>
      </header>
    <div className="master-shell sticky top-0 flex h-svh flex-col px-6 pt-21 pb-6 md:px-12 md:pt-24 md:pb-9 lg:px-24">
      <div className="hero-content grid grid-cols-12 pt-[6svh] md:flex-1 md:items-center md:pt-0">
        <div className="col-span-12 md:col-span-7">
          <h1 id="hero-title" className="font-display text-[clamp(3rem,10.8vw,11rem)] leading-[1.03] font-normal tracking-[-.02em] md:text-[clamp(3.6rem,8.3vw,13rem)]">
            <span className="block"><SplitReveal text="Beyond" choreographed /></span>
            <span className="block"><SplitReveal text="almost." choreographed /></span>
          </h1>
          <div className="hero-copy mt-6 max-w-[25rem] md:mt-8 md:max-w-[22rem] lg:max-w-[25rem]">
            <p className="text-base leading-[1.65] text-muted">Vibe coding for the whole website. Distinctive design. Connected data. Code that holds up.</p>
            <p className="mt-3 text-sm text-muted">SleekViber is coming soon.</p>
          </div>
          <a href="#questionnaire" className="button-ink mt-8 hidden min-h-13 items-center justify-center rounded-full bg-ink px-7 text-base font-medium text-void hover:bg-accent md:inline-flex">Help shape SleekViber</a>
        </div>
      </div>
      <div className="hero-bottom mt-auto pt-4 md:hidden">
        <a href="#questionnaire" className="button-ink inline-flex min-h-12 items-center rounded-full bg-ink px-6 text-sm font-medium text-void hover:bg-accent">Help shape SleekViber</a>
      </div>
    </div>
  </section>;
}
