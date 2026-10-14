"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

let activeLenis: Lenis | undefined;
export function scrollToSection(element: HTMLElement) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (activeLenis) activeLenis.scrollTo(element, { duration: 1, immediate: reduced });
  else element.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" });
}

export function useLenis(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({ lerp: .14, smoothWheel: true, syncTouch: false, anchors: { duration: .95, easing: (t: number) => 1 - Math.pow(1 - t, 4) }, stopInertiaOnNavigate: true });
    activeLenis = lenis;
    const raf = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => { activeLenis = undefined; lenis.off("scroll", ScrollTrigger.update); gsap.ticker.remove(raf); lenis.destroy(); };
  }, [enabled]);
}
