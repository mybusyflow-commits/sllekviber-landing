"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { MotionState } from "@/components/three/Scene";

gsap.registerPlugin(ScrollTrigger);

/** One scroll owner. Camera, object and type phases are sequenced, and the
 * same normalized model placement is used by the assembled and exploded views. */
export function useScrollProgress(rootId: string, motion: RefObject<MotionState>, enabled: boolean) {
  useLayoutEffect(() => {
    const root = document.getElementById(rootId);
    if (!root || !enabled || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let disposed = false, fontFrame = 0;
    let ctx: gsap.Context | undefined;
    const build = () => {
      if (disposed) return;
      // Media preference changes can enable the parent before the child masks
      // are rebuilt. Wait for the font-ready child signal instead of creating
      // empty GSAP targets or hiding unsplit text.
      const type = root.querySelectorAll("#top [data-split-reveal], #problems [data-split-reveal], #reveal [data-split-reveal], #solutions [data-split-reveal]");
      if ([...type].some(element => element.getAttribute("data-split-ready") !== "true")) return;
      ctx?.revert();
      ctx = gsap.context(() => {
        const hero = root.querySelector<HTMLElement>("#top")!;
        const problems = root.querySelector<HTMLElement>("#problems")!;
        const reveal = root.querySelector<HTMLElement>("#reveal")!;
        const solutions = root.querySelector<HTMLElement>("#solutions")!;
        const questionnaire = root.querySelector<HTMLElement>("#questionnaire")!;
        const standards = root.querySelector<HTMLElement>(".standards-grid")!;
        const h = innerHeight, end = Math.max(1, root.scrollHeight - h);
        const narrow = matchMedia("(max-width: 767px)").matches;
        const side = narrow ? 0 : .24;
        const m = motion.current;
        const chapters = [...root.querySelectorAll<HTMLElement>(".story-chapter")];
        const words = (element: Element) => [...element.querySelectorAll<HTMLElement>(".reveal-word")];
        const intro = solutions.querySelector(".solutions-intro")!;
        const revealContent = reveal.querySelector(".reveal-content")!;
        gsap.set(root.querySelectorAll(".master-shell"), { autoAlpha: 1 });
        gsap.set(chapters, { autoAlpha: 0 });
        gsap.set([revealContent, intro], { autoAlpha: 0 });
        gsap.set([...words(reveal), ...words(solutions)], { yPercent: 110 });
        Object.assign(m, { stage: 0, asset: 0, visibility: 1, assembly: 1, turn: -.42, travel: 0, tilt: -.02, hinge: 1.18, warmth: 0, fabricShift: 0, quiet: 0, cameraX: 0, cameraY: .35, cameraZ: 8.8, modelX: side, modelY: narrow ? -.21 : 0, modelScale: narrow ? 1.25 : .94 });
        const master = gsap.timeline({ scrollTrigger: {
          trigger: root, start: "top top", end: "bottom bottom", scrub: true,
          onUpdate: self => { m.progress = self.progress; m.velocity = self.getVelocity(); },
        } });
        master.to({ position: 0 }, { position: 1, duration: end, ease: "power2.inOut" }, 0);
        master.to(m, { fabricShift: 1, duration: end, ease: "power2.inOut" }, 0);
        const fit = (timeline: gsap.core.Timeline, start: number, length: number) => {
          timeline.timeScale(timeline.duration() / Math.max(1, length));
          master.add(timeline, start);
        };
        master.to(m, { cameraZ: 8.45, duration: h * .2, ease: "power2.inOut" }, 0);
        master.to([hero.querySelector(".hero-content"), hero.querySelector(".hero-bottom")], { autoAlpha: 0, y: -18, duration: h * .32, ease: "power2.inOut" }, h * .2);
        // Keep the laptop visible after the hero copy leaves: no empty black gap.
        const problemStart = problems.offsetTop - h * .55;
        const problemEnd = problems.offsetTop + problems.offsetHeight - h * .82;
        const span = (problemEnd - problemStart) / chapters.length;
        chapters.forEach((chapter, index) => {
          const beat = gsap.timeline();
          beat.to(m, { visibility: 0, duration: .55, ease: "power2.inOut" });
          beat.set(m, { stage: 1, asset: index + 1, turn: -.7, travel: -.35, tilt: -.1, assembly: 1 });
          beat.to(m, { cameraX: index === 1 ? -.2 : .1, cameraY: .15, cameraZ: 8.2, modelX: side, modelY: narrow ? .26 : 0, modelScale: narrow ? .94 : 1, duration: .9, ease: "power2.inOut" });
          beat.to(m, { visibility: 1, travel: 0, tilt: 0, turn: -.16, duration: 1.4, ease: "power4.out" });
          beat.set(chapter, { autoAlpha: 1 });
          beat.fromTo(words(chapter), { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: .035, ease: "expo.out", immediateRender: false });
          beat.fromTo(chapter.querySelector(".chapter-note"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .6, ease: "power4.out", immediateRender: false });
          beat.to({}, { duration: 2, ease: "power2.inOut" });
          beat.to(chapter, { autoAlpha: 0, duration: .6, ease: "power2.inOut" });
          fit(beat, problemStart + index * span, span);
        });
        master.to(problems.querySelector(".master-shell"), { autoAlpha: 0, duration: h * .1, ease: "power2.inOut" }, problemEnd);
        const titleStart = reveal.offsetTop - h * .75;
        const titleEnd = reveal.offsetTop + reveal.offsetHeight - h * .85;
        const title = gsap.timeline();
        title.to(m, { visibility: 0, duration: .55, ease: "power2.inOut" });
        title.set(m, { stage: 2, asset: 4, assembly: 0, turn: -.2, travel: 0, tilt: 0 });
        title.to(m, { cameraX: 0, cameraY: .15, cameraZ: 8.8, modelX: 0, modelY: .24, modelScale: narrow ? .9 : .82, duration: .8, ease: "power2.inOut" });
        title.to(m, { visibility: 1, duration: .6, ease: "power4.out" });
        title.to(m, { assembly: 1, duration: 1.8, ease: "power4.out" });
        title.set(revealContent, { autoAlpha: 1 });
        title.to(words(reveal), { yPercent: 0, duration: 1, stagger: .035, ease: "expo.out" });
        title.fromTo(reveal.querySelector(".reveal-note"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .6, ease: "power4.out", immediateRender: false });
        title.to({}, { duration: 1.8, ease: "power2.inOut" });
        fit(title, titleStart, titleEnd - titleStart);
        // The title exits, the assembled device settles to the side, then the
        // next headline enters. No independent reveal trigger can interrupt it.
        const blend = gsap.timeline();
        blend.to(revealContent, { autoAlpha: 0, duration: .6, ease: "power2.inOut" });
        if (narrow) blend.to(m, { visibility: 0, duration: .6, ease: "power2.inOut" });
        else blend.to(m, { modelX: side, modelY: 0, modelScale: 1, turn: -.3, duration: 1.2, ease: "power2.inOut" });
        blend.set(intro, { autoAlpha: 1 });
        blend.to(words(solutions), { yPercent: 0, duration: 1, stagger: .035, ease: "expo.out" });
        blend.fromTo(solutions.querySelector(".solutions-note"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .6, ease: "power4.out", immediateRender: false });
        fit(blend, titleEnd, Math.max(h * .45, solutions.offsetTop - h * .15 - titleEnd));
        const standardsY = standards.getBoundingClientRect().top + scrollY;
        master.to(m, { visibility: 0, duration: h * .25, ease: "power2.inOut" }, Math.max(solutions.offsetTop - h * .15, standardsY - h * 1.2));
        master.to(m, { quiet: .65, duration: h * .5, ease: "power2.inOut" }, solutions.offsetTop - h * .3);
        master.to(m, { quiet: 1, duration: h * .5, ease: "power2.inOut" }, questionnaire.offsetTop - h * .7);
        const entrance = gsap.timeline();
        entrance.fromTo(words(hero), { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: .035, ease: "expo.out" });
        entrance.to(m, { hinge: 1.797689, duration: 1.35, ease: "power4.inOut" }, ">.2");
        const cancelEntrance = () => { entrance.progress(1).kill(); };
        window.addEventListener("wheel", cancelEntrance, { once: true, passive: true });
        window.addEventListener("touchmove", cancelEntrance, { once: true, passive: true });
        window.addEventListener("scroll", cancelEntrance, { once: true, passive: true });
        return () => { window.removeEventListener("wheel", cancelEntrance); window.removeEventListener("touchmove", cancelEntrance); window.removeEventListener("scroll", cancelEntrance); };
      }, root);
      ScrollTrigger.refresh();
    };
    void document.fonts.ready.then(() => { fontFrame = requestAnimationFrame(build); });
    const splitReady = () => { cancelAnimationFrame(fontFrame); fontFrame = requestAnimationFrame(build); };
    window.addEventListener("sleekviber:split-ready", splitReady);
    let resizeTimer: ReturnType<typeof setTimeout>;
    const resize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(build, 180); };
    window.addEventListener("resize", resize);
    return () => { disposed = true; cancelAnimationFrame(fontFrame); clearTimeout(resizeTimer); window.removeEventListener("resize", resize); window.removeEventListener("sleekviber:split-ready", splitReady); ctx?.revert(); };
  }, [rootId, motion, enabled]);
}
