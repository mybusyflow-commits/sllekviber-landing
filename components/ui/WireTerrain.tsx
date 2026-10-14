"use client";
// Canvas 2D interpretation of the user's Originkit Wire Terrain reference.
// Scroll-only motion, pooled vertices and cached trigonometry keep the landscape light.
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export function WireTerrain() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = root.current, surface = canvas.current;
    const context = surface?.getContext("2d", { alpha: true });
    if (!element || !surface || !context) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0, height = 0, progress = 0, frame = 0, visible = false;
    let rows = 30, columns = 37;
    let px = new Float32Array(0), py = new Float32Array(0);
    let samples: { x: number; valley: number; s31: number; c31: number; s13: number; c13: number; s70: number; c70: number }[] = [];
    let trigger: ScrollTrigger | undefined;
    const draw = () => {
      frame = 0;
      if (!visible || document.hidden) return;
      context.clearRect(0, 0, width, height);
      const focal = Math.min(width * .8, height * 1.5), horizon = height * .28;
      const travel = reduced.matches ? 0 : progress * 17;
      const step = 50 / rows, offset = travel % step;
      // Each vertex is projected once; no per-segment object allocation.
      // The sine addition identities replace thousands of repeated trig calls.
      for (let row = 1; row <= rows + 1; row++) {
        const z = row * step + 2 - offset, worldZ = z + travel;
        const s19 = Math.sin(worldZ * .19), c19 = Math.cos(worldZ * .19);
        const s27 = Math.sin(worldZ * .27), c27 = Math.cos(worldZ * .27);
        const s35 = Math.sin(worldZ * .35), c35 = Math.cos(worldZ * .35);
        const projection = focal / z;
        for (let col = 0; col < columns; col++) {
          const point = samples[col];
          const ridge = (point.s31 * c19 + point.c31 * s19) * .7
            + (c27 * point.c13 + s27 * point.s13) * .8
            + (point.s70 * c35 + point.c70 * s35) * .2;
          const index = row * columns + col;
          px[index] = width / 2 + point.x * projection;
          py[index] = horizon + (3.8 - point.valley * (2.5 + ridge * 1.1)) * projection;
        }
      }
      context.lineWidth = .8;
      for (let row = rows; row >= 1; row--) {
        context.strokeStyle = `rgba(214,210,203,${Math.pow(1 - row / (rows + 3), 1.6) * .42})`;
        context.beginPath();
        const start = row * columns, next = (row + 1) * columns;
        context.moveTo(px[start], py[start]);
        for (let col = 1; col < columns; col++) context.lineTo(px[start + col], py[start + col]);
        // Alternate columns leave breathing room without losing the valley.
        for (let col = 0; col < columns; col += 2) {
          context.moveTo(px[start + col], py[start + col]);
          context.lineTo(px[next + col], py[next + col]);
        }
        context.stroke();
      }
    };
    const schedule = () => { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw); };
    const resize = () => {
      width = element.clientWidth; height = element.clientHeight;
      rows = width < 768 ? 20 : 30; columns = width < 768 ? 27 : 37;
      px = new Float32Array((rows + 2) * columns); py = new Float32Array(px.length);
      samples = Array.from({ length: columns }, (_, i) => {
        const x = -42 + i * 84 / (columns - 1);
        return { x, valley: Math.min(1, Math.max(0, (Math.abs(x) - 2) / 12)), s31: Math.sin(x * .31), c31: Math.cos(x * .31), s13: Math.sin(x * .13), c13: Math.cos(x * .13), s70: Math.sin(x * .7), c70: Math.cos(x * .7) };
      });
      const dpr = Math.min(width < 768 ? 1.25 : 1.5, devicePixelRatio || 1);
      surface.width = Math.round(width * dpr); surface.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0); schedule();
    };
    const configure = () => {
      trigger?.kill(); trigger = undefined;
      if (!reduced.matches) trigger = ScrollTrigger.create({ trigger: element.closest("section"), start: "top bottom", end: "bottom top", onUpdate: self => { progress = self.progress; schedule(); } });
      schedule();
    };
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, { rootMargin: "100px" });
    observer.observe(element);
    const size = new ResizeObserver(resize); size.observe(element);
    resize(); configure();
    reduced.addEventListener("change", configure); document.addEventListener("visibilitychange", schedule);
    return () => { cancelAnimationFrame(frame); trigger?.kill(); observer.disconnect(); size.disconnect(); reduced.removeEventListener("change", configure); document.removeEventListener("visibilitychange", schedule); };
  }, []);
  return <div ref={root} className="wire-terrain" aria-hidden="true"><canvas ref={canvas} /></div>;
}
