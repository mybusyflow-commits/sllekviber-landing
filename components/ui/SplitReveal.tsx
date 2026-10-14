"use client";
// Adapted from React Bits SplitText. License: /credits/REACT-BITS-LICENSE.txt.
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(ScrollTrigger, SplitText);
export function SplitReveal({ text, className = "" }: { text: string; className?: string; choreographed?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let cancelled = false;
    const media = gsap.matchMedia();
    void document.fonts.ready.then(() => {
      if (cancelled || !ref.current) return;
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(ref.current!, { type: "words", mask: "words", smartWrap: true, aria: "auto", onSplit(self) {
          return gsap.from(self.words, { yPercent: 110, rotate: 2, duration: 1.05, stagger: .045, ease: "expo.out", scrollTrigger: { trigger: ref.current, start: "top 96%", once: true } });
        } });
        return () => split.revert();
      });
    });
    return () => { cancelled = true; media.revert(); };
  }, [text]);
  return <span ref={ref} className={className}>{text}</span>;
}
