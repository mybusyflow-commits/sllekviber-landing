"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import "lenis/dist/lenis.css";
import type { MotionState } from "@/components/three/Scene";
import { useLenis } from "@/hooks/useLenis";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useMagnetic } from "@/hooks/useMagnetic";

const Scene = dynamic(() => import("@/components/three/Scene"), { ssr: false });

export default function Experience() {
  const motion = useRef<MotionState>({ progress: 0, velocity: 0, reduced: false, stage: 0, asset: 0, visibility: 1, turn: -.28, assembly: 1, cameraX: 0, cameraY: .35, cameraZ: 8.8, hinge: 1.797689, warmth: 0, fabricShift: 0 });
  const [mobile, setMobile] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const mobileQuery = matchMedia("(max-width: 767px), (pointer: coarse)");
    const reducedQuery = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { setMobile(mobileQuery.matches); setReduced(reducedQuery.matches); motion.current.reduced = reducedQuery.matches; };
    const visibility = () => setVisible(!document.hidden);
    update();
    mobileQuery.addEventListener("change", update); reducedQuery.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    const probe = document.createElement("canvas");
    let supported = false;
    try {
      const context = probe.getContext("webgl2") || probe.getContext("webgl");
      supported = Boolean(context);
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch { /* The page remains complete when a device cannot render the studio. */ }
    const timer = window.setTimeout(() => setWebglAvailable(supported), 0);
    return () => {
      clearTimeout(timer);
      mobileQuery.removeEventListener("change", update); reducedQuery.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("reduced-experience", reduced);
    return () => document.documentElement.classList.remove("reduced-experience");
  }, [reduced]);

  useLenis(!mobile && !reduced);
  useMagnetic(!mobile && !reduced);
  useScrollProgress("story-root", motion, !reduced);

  return <>
    {!reduced && visible && webglAvailable && <Scene motion={motion} mobile={mobile} />}
  </>;
}


