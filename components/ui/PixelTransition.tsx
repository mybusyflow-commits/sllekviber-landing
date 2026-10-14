"use client";
/** Adapted from David Haz / React Bits PixelTransition.
 * https://github.com/DavidHDev/react-bits
 * License: /credits/REACT-BITS-LICENSE.txt
 * Changes: controlled state, semantic external button, SSR safety, reduced motion,
 * timeline cleanup and declarative pixels instead of innerHTML mutation.
 */
import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
export function PixelTransition({ active, first, second }: { active: boolean; first: ReactNode; second: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const previous = useRef(active);
  useEffect(() => {
    if (!root.current) return;
    const secondLayer = root.current.querySelector(".pixel-second");
    const pixels = root.current.querySelectorAll(".pixel-cell");
    const context = gsap.context(() => {
      if (previous.current === active || matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(secondLayer, { opacity: active ? 1 : 0 }); previous.current = active; return;
      }
      gsap.set(secondLayer, { opacity: previous.current ? 1 : 0 });
      previous.current = active;
      gsap.timeline().set(pixels, { opacity: 0 }).to(pixels, { opacity: 1, duration: .02, stagger: { amount: .22, from: "random" } })
        .set(secondLayer, { opacity: active ? 1 : 0 })
        .to(pixels, { opacity: 0, duration: .02, stagger: { amount: .28, from: "random" } });
    }, root);
    return () => context.revert();
  }, [active]);
  return <div ref={root} className="pixel-transition" aria-hidden="true"><div className="pixel-first">{first}</div><div className="pixel-second">{second}</div><div className="pixel-grid">{Array.from({ length: 64 }, (_, i) => <span className="pixel-cell" key={i} />)}</div></div>;
}
