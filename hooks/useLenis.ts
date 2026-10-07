"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

let activeLenis: Lenis | undefined;
export function scrollToSection(element: HTMLElement) {
  if (activeLenis) activeLenis.scrollTo(element, { immediate: true });
  else element.scrollIntoView({ behavior: "instant", block: "start" });
}

export function useLenis(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    // Lenis reads the target's scroll margin; navigation belongs to the hero
    // and scrolls out naturally, so no fixed-header offset is needed.
    const lenis = new Lenis({ lerp: .1, smoothWheel: true, syncTouch: false, anchors: { duration: 1.1, easing: (t: number) => 1 - Math.pow(1 - t, 4) }, stopInertiaOnNavigate: true });
    activeLenis = lenis;
    const raf = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => { activeLenis = undefined; lenis.off("scroll", ScrollTrigger.update); gsap.ticker.remove(raf); lenis.destroy(); };
  }, [enabled]);
}
