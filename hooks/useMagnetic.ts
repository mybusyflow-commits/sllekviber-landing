"use client";

import { useEffect } from "react";
import gsap from "gsap";

// Move the control itself. The operating system cursor stays completely native.
export function useMagnetic(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let target: HTMLElement | null = null;
    let bounds: DOMRect | undefined;
    let moveX: ReturnType<typeof gsap.quickTo> | undefined;
    let moveY: ReturnType<typeof gsap.quickTo> | undefined;
    const reset = () => {
      if (target) gsap.to(target, { x: 0, y: 0, duration: .3, ease: "back.out(1.4)", overwrite: true });
      target = null;
    };
    const move = (event: PointerEvent) => {
      const next = (event.target as Element).closest<HTMLElement>("a, button:not(.option-row):not(:disabled)");
      if (next !== target) {
        reset(); target = next;
        if (target) {
          bounds = target.getBoundingClientRect();
          moveX = gsap.quickTo(target, "x", { duration: .3, ease: "power4.out" });
          moveY = gsap.quickTo(target, "y", { duration: .3, ease: "power4.out" });
        }
      }
      if (target && bounds) { moveX?.((event.clientX - bounds.left - bounds.width / 2) * .12); moveY?.((event.clientY - bounds.top - bounds.height / 2) * .12); }
    };
    document.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", reset, { passive: true });
    document.addEventListener("pointerleave", reset);
    return () => { reset(); document.removeEventListener("pointermove", move); window.removeEventListener("scroll", reset); document.removeEventListener("pointerleave", reset); };
  }, [enabled]);
}
