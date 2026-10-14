"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ArrowUpRight, LogOut, RefreshCw, CircleAlert } from "lucide-react";
import { requestJson } from "@/lib/client-request";

type Count = { option: string; count: number };
type Stats = {
  total: number; today: number; starts: number; completionRate: number; legacyCount: number; waitlist: number;
  q1: Count[]; q2: Count[];
  recent: { id: string; q1: string; q2: string[]; timestamp: string }[];
};

function relativeTime(timestamp: string) {
  const delta = Math.max(0, Date.now() - new Date(timestamp).getTime());
  const minute = 60_000, hour = 60 * minute, day = 24 * hour;
  if (delta < minute) return "just now";
  if (delta < hour) return `${Math.floor(delta / minute)} min ago`;
  if (delta < day) return `${Math.floor(delta / hour)} hr ago`;
  return `${Math.floor(delta / day)} d ago`;
}

function Metric({ label, value, suffix = "" }: { label: string; value: number; suffix?: string; index: string }) {
  const display = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!display.current) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { display.current.textContent = `${value}${suffix}`; return; }
    const obj = { n: 0 };
    const tween = gsap.to(obj, { n: value, duration: .9, ease: "power4.out", onUpdate: () => { if (display.current) display.current.textContent = `${Math.round(obj.n)}${suffix}`; } });
    return () => { tween.kill(); };
  }, [value, suffix]);
  return <div className="min-w-0 pt-4"><p className="text-sm text-muted">{label}</p><div ref={display} className="mt-5 font-display text-[clamp(3rem,6vw,7rem)] leading-none font-medium tracking-[-.035em] text-ink">0{suffix}</div></div>;
}

function BarChart({ title, items, total }: { title: string; index: string; items: Count[]; total: number }) {
  return <section className="min-w-0 pt-5"><h2 className="font-display text-[clamp(1.45rem,2.1vw,2.5rem)] leading-[1.05] font-medium tracking-[-.03em]">{title}</h2><div className="mt-9 space-y-6">{items.map(({ option, count }) => <div key={option}><div className="mb-3 flex items-start justify-between gap-4 text-sm"><span className="text-ink/85">{option}</span><span className="shrink-0 text-xs tabular-nums text-muted">{count} · {total ? Math.round(count / total * 100) : 0}%</span></div><div className="h-[3px] bg-ink/12"><div className="chart-bar h-full origin-left bg-accent" style={{ width: `${total ? count / total * 100 : 0}%` }} /></div></div>)}</div></section>;
}

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const previousTotal = useRef<number | null>(null);
  const dashboard = useRef<HTMLElement>(null);
  const activeRequest = useRef<AbortController | null>(null);
  const chartSignature = stats && stats.total ? [...stats.q1, ...stats.q2].map(item => `${item.option}:${item.count}`).join("|") : "";
  const fetchStats = useCallback(async (initial = false) => {
    if (activeRequest.current) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    if (!initial) setRefreshing(true);
    try {
      const { response, data: next } = await requestJson<Stats>("/api/responses/stats", { cache: "no-store", signal: controller.signal });
      if (response.status === 401) { router.replace("/admin/login"); return; }
      if (!response.ok) throw new Error("Dashboard data is unavailable. Try refreshing.");
      if (previousTotal.current !== null && next.total > previousTotal.current) setNewCount(next.total - previousTotal.current);
      previousTotal.current = next.total;
      setStats(next); setError("");
    } catch (caught) { if (!controller.signal.aborted) setError(caught instanceof Error ? caught.message : "Could not load responses."); }
    finally { activeRequest.current = null; if (!controller.signal.aborted) { setLoading(false); setRefreshing(false); } }
  }, [router]);
  useEffect(() => { const timeout = setTimeout(() => { void fetchStats(true); }, 0); const interval = setInterval(() => { if (!document.hidden) void fetchStats(); }, 15_000); return () => { clearTimeout(timeout); clearInterval(interval); activeRequest.current?.abort(); }; }, [fetchStats]);
  useEffect(() => {
    if (!chartSignature || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => { gsap.fromTo(".chart-bar", { scaleX: 0 }, { scaleX: 1, duration: .9, stagger: .03, ease: "power4.out" }); }, dashboard);
    return () => { context.revert(); };
  }, [chartSignature]);
  async function logout() {
    try {
      const { response } = await requestJson("/api/session/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      router.replace("/admin/login"); router.refresh();
    } catch { setError("Could not log out. Check your connection and try again."); }
  }

  return <main ref={dashboard} className="min-h-svh bg-void px-6 pb-24 text-ink md:px-12 lg:px-24">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b editorial-rule py-6"><div className="flex items-center gap-5"><Link href="/" className="font-display text-2xl font-semibold tracking-[-.04em]">S<span className="text-accent">/</span>V</Link><span className="h-5 w-px bg-ink/20" /><span className="font-mono text-[10px] tracking-[.2em] text-muted uppercase">BUILDER PULSE / ADMIN</span></div><div className="flex items-center gap-5"><Link href="/" className="hidden min-h-11 items-center gap-1 text-xs text-muted hover:text-ink sm:flex">View site <ArrowUpRight size={14} /></Link><button onClick={() => { setNewCount(0); void fetchStats(); }} type="button" aria-label="Refresh data" className="grid size-11 place-items-center border border-ink/20 text-muted hover:text-accent"><RefreshCw size={16} className={refreshing ? "text-accent" : ""} /></button><button onClick={logout} type="button" className="flex min-h-11 items-center gap-2 border-b editorial-rule text-xs text-muted hover:text-ink"><LogOut size={15} /> Log out</button></div></header>
    <div className="grid grid-cols-12 gap-x-8"><div className="col-span-12 flex flex-wrap items-end justify-between gap-5 py-12 md:py-16"><div><span className="font-mono text-[10px] tracking-[.25em] text-accent uppercase">LIVE RESEARCH / THE RESPONSE</span><h1 className="mt-5 font-display text-[clamp(3rem,6vw,7rem)] leading-[.9] font-semibold tracking-[-.04em]">The signal<br /><em>so far.</em></h1><p className="mt-6 max-w-xl text-sm leading-relaxed text-muted">Real answers from builders. The Builder Pulse refreshes every 15 seconds.</p></div><div className="font-mono text-[10px] tracking-[.16em] text-muted uppercase">{newCount ? <span className="text-accent">+{newCount} new {newCount === 1 ? "response" : "responses"}</span> : "UPDATED AUTOMATICALLY"}</div></div>
      <div className="col-span-12">{loading ? <div role="status" className="flex min-h-72 items-center gap-3 border-t editorial-rule text-muted"><RefreshCw size={18} /> Loading responses…</div> : error && !stats ? <div role="alert" className="border-t border-accent pt-8 text-accent"><CircleAlert className="mb-4" />{error}<button className="mt-5 block border-b border-accent pb-1 text-sm" onClick={() => void fetchStats()} type="button">Retry</button></div> : stats && <>
        {error && <p role="alert" className="mb-5 text-sm text-accent">{error}</p>}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Total responses" value={stats.total} index="01" /><Metric label="Responses today" value={stats.today} index="02" /><Metric label="Completion rate" value={stats.completionRate} suffix="%" index="03" /><Metric label="Launch list" value={stats.waitlist} index="04" /></div>
        {stats.total === 0 ? <div className="mt-20 border-t editorial-rule pt-12"><span className="font-mono text-[10px] tracking-[.2em] text-accent uppercase">AWAITING THE FIRST SIGNAL</span><h2 className="mt-6 font-display text-[clamp(2.7rem,4vw,5rem)] leading-[.95] tracking-[-.04em]">No responses yet.</h2><p className="mt-5 max-w-md text-sm leading-relaxed text-muted">Share the landing page. The first answer will appear here as soon as someone submits it.</p><Link href="/" className="mt-8 inline-flex items-center gap-3 border-b border-accent pb-1 text-sm text-ink hover:text-accent">Open landing page <ArrowUpRight size={16} /></Link></div> : <>
          <div className="mt-20 grid gap-14 xl:grid-cols-2"><BarChart title="How fed up are they?" index="QUESTION 01" items={stats.q1} total={stats.total} /><BarChart title="Where does it hurt?" index="QUESTION 02" items={stats.q2} total={stats.total} /></div>
          <section className="mt-20 border-t editorial-rule pt-5"><div className="flex items-start justify-between gap-4"><div><span className="font-mono text-[10px] tracking-[.2em] text-accent uppercase">RAW SIGNAL</span><h2 className="mt-3 font-display text-[clamp(1.8rem,3vw,3rem)] leading-none tracking-[-.03em]">Recent responses</h2></div><span className="font-mono text-[10px] text-muted">LATEST 25</span></div><div className="mt-8 overflow-x-auto"><table className="w-full min-w-[700px] border-collapse text-left text-sm"><thead className="font-mono text-[10px] tracking-[.14em] text-muted uppercase"><tr><th className="border-b editorial-rule py-4 pr-6 font-normal">When</th><th className="border-b editorial-rule py-4 pr-6 font-normal">Sentiment</th><th className="border-b editorial-rule py-4 font-normal">Pain points</th></tr></thead><tbody>{stats.recent.map((row) => <tr key={row.id} className="border-b editorial-rule"><td className="whitespace-nowrap py-5 pr-6 align-top font-mono text-xs text-accent" title={new Date(row.timestamp).toLocaleString()}>{relativeTime(row.timestamp)}</td><td className="py-5 pr-6 align-top text-ink/85">{row.q1}</td><td className="py-5 align-top text-muted">{row.q2.join(" · ")}</td></tr>)}</tbody></table></div></section>
        </>}
        <p className="mt-10 border-t editorial-rule pt-5 font-mono text-[10px] tracking-[.08em] text-muted">{stats.starts} unique questionnaire starts · {stats.legacyCount} responses preserved from the previous questionnaire</p>
      </>}</div></div>
  </main>;
}

