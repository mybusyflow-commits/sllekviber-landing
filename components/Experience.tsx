"use client";
import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";
import { useLenis } from "@/hooks/useLenis";
gsap.registerPlugin(ScrollTrigger);
export default function Experience() {
  const [smooth, setSmooth] = useState(false);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: no-preference) and (pointer: fine)");
    const update = () => setSmooth(query.matches);
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useLenis(smooth);
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray<HTMLElement>("[data-enter]").forEach(element => {
        gsap.from(element, { y: 36, opacity: .35, duration: .9, ease: "expo.out", scrollTrigger: { trigger: element, start: "top 93%", once: true } });
      });
      gsap.utils.toArray<HTMLElement>(".chapter-art").forEach(element => {
        gsap.from(element, { clipPath: "inset(8% 0 8% 0)", ease: "none", scrollTrigger: { trigger: element, start: "top 90%", end: "top 25%", scrub: .7 } });
      });
      gsap.from(".wire-terrain", { opacity: .1, y: 70, ease: "none", scrollTrigger: { trigger: "#reveal", start: "top 90%", end: "top 15%", scrub: .6 } });
    });
    return () => media.revert();
  }, []);
  return null;
}
