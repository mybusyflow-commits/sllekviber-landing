"use client";
// React Bits Magnet: same proximity algorithm, DOM updates via GSAP instead of render-per-pointer.
// Official upstream source retained in .asset-sources/react-bits; MIT + Commons Clause notice in /credits.
import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
export function Magnet({ children, className = "", strength = 5 }: { children: ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current, inner = root?.firstElementChild;
    if (!root || !inner) return;
    const media = gsap.matchMedia();
    media.add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const x = gsap.quickTo(inner, "x", { duration: .55, ease: "power3.out" });
      const y = gsap.quickTo(inner, "y", { duration: .55, ease: "power3.out" });
      const move = (event: PointerEvent) => {
        const rect = root.getBoundingClientRect();
        const dx = event.clientX - rect.left - rect.width / 2, dy = event.clientY - rect.top - rect.height / 2;
        const inside = Math.abs(dx) < rect.width / 2 + 35 && Math.abs(dy) < rect.height / 2 + 35;
        x(inside ? dx / strength : 0); y(inside ? dy / strength : 0);
      };
      window.addEventListener("pointermove", move, { passive: true });
      return () => { window.removeEventListener("pointermove", move); x.tween.kill(); y.tween.kill(); gsap.set(inner, { x: 0, y: 0 }); };
    });
    return () => media.revert();
  }, [strength]);
  return <div ref={ref} className={`magnet ${className}`}><div>{children}</div></div>;
}
