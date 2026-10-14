"use client";
// React Bits ScrollFloat choreography, with semantic words, scope cleanup and reduced motion.
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
export function ScrollFloat({ text, className = "", id }: { text: string; className?: string; id?: string }) {
  const root = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const words = root.current?.querySelectorAll(".float-word");
      if (!words) return;
      gsap.fromTo(words, { yPercent: 70, scaleY: 1.6, scaleX: .8, opacity: .3, transformOrigin: "50% 0%" }, {
        yPercent: 0, scaleY: 1, scaleX: 1, opacity: 1, ease: "expo.out", stagger: .12,
        scrollTrigger: { trigger: root.current, start: "top 92%", end: "center 58%", scrub: 1 }
      });
    });
    return () => media.revert();
  }, []);
  return <h2 ref={root} className={`scroll-float ${className}`} id={id} aria-label={text}><span aria-hidden="true">{text.split(" ").map((word, i) => <span className="float-word" key={i}>{word} </span>)}</span></h2>;
}
