import Link from "next/link";

export default function NotFound() {
  return <div className="creative-experience min-h-svh text-ink">
    <main className="flex min-h-svh flex-col px-6 py-7 md:px-12 lg:px-24">
      <header><Link href="/" className="font-display text-[22px] font-semibold tracking-[-.035em]">SleekViber</Link></header>
      <div className="flex flex-1 flex-col justify-center py-16">
        <h1 className="max-w-[13ch] font-display text-[clamp(2.6rem,5.2vw,6rem)] leading-[1.1] font-medium tracking-[-.03em]">This page isn&apos;t here.</h1>
        <p className="mt-6 max-w-sm text-base leading-relaxed text-muted">Check the address or head back to SleekViber.</p>
        <Link href="/" className="button-ink mt-8 inline-flex min-h-13 w-fit items-center rounded-full bg-ink px-7 text-base font-medium text-void hover:bg-accent">Back to the website</Link>
      </div>
    </main>
  </div>;
}
