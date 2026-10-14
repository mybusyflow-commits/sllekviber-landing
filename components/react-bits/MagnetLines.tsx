"use client";
// Adapted from React Bits MagnetLines. Proximity/angle algorithm retained; locally scoped and reduced-motion aware.
import { useEffect, useRef, type CSSProperties } from "react";
export function MagnetLines({ connected }: { connected: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(pointer: fine)");
    const items = Array.from(element.querySelectorAll<HTMLElement>(".field-needle"));
    let frame = 0;
    let active = false;
    const observer = new IntersectionObserver(entries => { active = entries[0].isIntersecting; });
    observer.observe(element);
    const orient = (x: number, y: number) => {
      const rect = element.getBoundingClientRect();
      items.forEach((item, i) => {
        const centerX = rect.left + ((i % 31) + .5) / 31 * rect.width;
        const centerY = rect.top + (Math.floor(i / 31) + .5) / 17 * rect.height;
        const angle = Math.atan2(y - centerY, x - centerX) * 180 / Math.PI;
        item.style.setProperty("--rotate", `${angle}deg`);
      });
    };
    const move = (event: PointerEvent) => {
      if (!active || reduced.matches || !fine.matches || document.hidden) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => orient(event.clientX, event.clientY));
    };
    const rect = element.getBoundingClientRect();
    orient(rect.left + rect.width * .52, rect.top + rect.height * .51);
    window.addEventListener("pointermove", move, { passive: true });
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("pointermove", move); };
  }, []);
  return <div ref={root} className={`magnet-field ${connected ? "field-connected" : ""}`} aria-hidden="true">{Array.from({ length: 527 }, (_, i) => <span className="field-needle" key={i} style={{ "--index": i, "--row": Math.floor(i / 31) } as CSSProperties} />)}</div>;
}
