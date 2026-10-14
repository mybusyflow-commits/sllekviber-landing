"use client";
// React Bits TextPressure distance-to-axis mapping, adapted to the installed Clash Display weight axis.
// Fixed character slots prevent layout jumps; on-demand pointer updates replace a permanent animation loop.
import { useEffect, useRef } from "react";
export function TextPressure({ text }: { text: string }) {
  const root = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const fine = matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    const letters = Array.from(element.children) as HTMLElement[];
    let frame = 0;
    const reset = () => letters.forEach(letter => { letter.style.fontVariationSettings = "'wght' 500"; });
    const measure = () => {
      letters.forEach(letter => { letter.style.width = "auto"; });
      const widths = letters.map(letter => letter.getBoundingClientRect().width);
      letters.forEach((letter, i) => { letter.style.width = `${widths[i]}px`; });
    };
    void document.fonts.ready.then(() => { if (element.isConnected) measure(); });
    window.addEventListener("resize", measure);
    const move = (event: PointerEvent) => {
      if (!fine.matches) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = element.getBoundingClientRect();
        letters.forEach((letter, i) => {
          const x = bounds.left + (i + .5) * bounds.width / letters.length;
          const distance = Math.hypot(event.clientX - x, event.clientY - bounds.top - bounds.height / 2);
          const weight = Math.max(300, 700 - distance / (bounds.width / 2) * 500);
          letter.style.fontVariationSettings = `'wght' ${Math.round(weight)}`;
        });
      });
    };
    element.addEventListener("pointermove", move, { passive: true });
    element.addEventListener("pointerleave", reset);
    fine.addEventListener("change", reset);
    return () => { cancelAnimationFrame(frame); element.removeEventListener("pointermove", move); element.removeEventListener("pointerleave", reset); fine.removeEventListener("change", reset); window.removeEventListener("resize", measure); };
  }, []);
  return <span className="pressure-text" ref={root} aria-hidden="true">{text.split("").map((char, i) => <span key={i}>{char}</span>)}</span>;
}
