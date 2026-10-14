"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, X, Menu } from "lucide-react";
const links = [{ href: "#problems", label: "The problem" }, { href: "#solutions", label: "Our approach" }, { href: "#about", label: "About" }];
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const navigation = useRef<HTMLElement>(null);
  useEffect(() => {
    if (open) navigation.current?.querySelector("a")?.focus({ preventScroll: true });
    const key = (event: KeyboardEvent) => {
      if (open && event.key === "Escape") {
        event.preventDefault(); setOpen(false);
        if (toggle.current?.getClientRects().length) toggle.current.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  }, [open]);
  return <header className={`site-header ${open ? "menu-open" : ""}`}>
    <a href="#top" draggable={false} aria-label="SleekViber home" className="wordmark">SleekViber<span className="brand-dot" /></a>
    <nav ref={navigation} id="main-navigation" aria-label="Main navigation">{links.map(link => <a draggable={false} key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>)}</nav>
    <a href="#questionnaire" draggable={false} className="nav-action" onClick={() => setOpen(false)}>Take the survey <ArrowUpRight size={16} /></a>
    <button ref={toggle} type="button" className="menu-toggle" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
  </header>;
}
