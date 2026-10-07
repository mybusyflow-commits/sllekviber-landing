"use client";

/**
 * Adapted from React Bits SplitText: font-ready GSAP splitting, scoped trigger
 * cleanup and staggered word entrances. Uses GSAP's masks instead of handmade
 * negative-margin spans. Full upstream license: /credits/REACT-BITS-LICENSE.txt
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);
let active: gsap.core.Tween | undefined;
const waiting: gsap.core.Tween[] = [];
function outsideViewport(tween: gsap.core.Tween) {
  const target = tween.targets()[0] as HTMLElement | undefined;
  const bounds = target?.closest("[data-split-reveal]")?.getBoundingClientRect();
  return !bounds || bounds.bottom < 0 || bounds.top > innerHeight;
}
function nextReveal() {
  if (active) return;
  while (waiting.length) {
    const next = waiting.shift()!;
    if (outsideViewport(next)) { next.progress(1, true).kill(); continue; }
    active = next; active.play(); return;
  }
}
export function SplitReveal({ text, className = "", choreographed = false }: { text: string; className?: string; choreographed?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let disposed = false, frame = 0;
    let split: SplitText | undefined, ctx: gsap.Context | undefined, tween: gsap.core.Tween | undefined;
    void document.fonts.ready.then(() => {
      if (disposed || !ref.current) return;
      split = SplitText.create(ref.current, { type: "words", mask: "words", wordsClass: "reveal-word", smartWrap: true, aria: "auto" });
      ref.current.setAttribute("data-split-ready", "true");
      window.dispatchEvent(new Event("sleekviber:split-ready"));
      if (choreographed) return;
      // Each span splits first; then one owner animates the whole heading.
      frame = requestAnimationFrame(() => {
        if (disposed || !ref.current) return;
        const heading = ref.current.closest("h1,h2,h3");
        if (heading && heading.querySelector("[data-split-reveal]") !== ref.current) return;
        const target = heading || ref.current;
        ctx = gsap.context(() => {
          tween = gsap.fromTo(target.querySelectorAll(".reveal-word"), { yPercent: 110 }, {
            yPercent: 0, duration: 1, stagger: .035, ease: "expo.out", paused: true,
            onComplete: () => { active = undefined; nextReveal(); },
          });
          ScrollTrigger.create({ trigger: target, start: "top 92%", once: true, onEnter: () => {
            if (active && outsideViewport(active)) { active.progress(1, true).kill(); active = undefined; }
            waiting.push(tween!); nextReveal();
          } });
        }, ref);
      });
    });
    return () => {
      disposed = true; cancelAnimationFrame(frame);
      if (tween) { const index = waiting.indexOf(tween); if (index !== -1) waiting.splice(index, 1); if (active === tween) active = undefined; }
      ctx?.revert(); split?.revert(); element.removeAttribute("data-split-ready"); nextReveal();
    };
  }, [choreographed, text, reduced]);
  return <span ref={ref} data-split-reveal className={className}>{text}</span>;
}

