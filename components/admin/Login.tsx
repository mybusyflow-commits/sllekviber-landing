"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, LoaderCircle } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch("/api/session/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const body = await response.json() as { error?: string };
      if (!response.ok) { setError(body.error || "Could not sign in."); return; }
      router.replace("/admin");
    } catch { setError("Connection lost. Try again."); }
    finally { setLoading(false); }
  }
  return <main className="grid min-h-svh grid-cols-12 bg-void px-6 py-7 text-ink md:px-12 lg:px-24">
    <header className="col-span-12 flex h-fit items-center justify-between border-b editorial-rule pb-5"><Link href="/" className="font-display text-2xl font-semibold tracking-[-.04em]">S<span className="text-accent">/</span>V</Link><span className="font-mono text-[10px] tracking-[.2em] text-muted uppercase">PRIVATE / BUILDER PULSE</span></header>
    <div className="col-span-12 self-center py-16 lg:col-span-6 lg:col-start-4"><span className="font-mono text-[10px] tracking-[.3em] text-accent uppercase">ADMIN ACCESS</span><h1 className="mt-7 font-display text-[clamp(3.5rem,6vw,7rem)] leading-[.9] font-semibold tracking-[-.04em]">Private<br /><em>view.</em></h1><p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">Enter your admin password to view the Builder Pulse.</p><form onSubmit={submit} className="mt-12 border-t editorial-rule pt-5"><label htmlFor="admin-password" className="font-mono text-[10px] tracking-[.2em] text-muted uppercase">ADMIN PASSWORD</label><input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-3 min-h-14 w-full border-b editorial-rule bg-transparent px-1 text-ink outline-none focus:border-accent focus-visible:outline-none" /><p role="alert" className="mt-3 min-h-5 text-sm text-accent">{error}</p><button disabled={loading} type="submit" className="button-ink mt-6 flex min-h-14 w-full items-center justify-between bg-accent px-5 text-sm font-semibold text-void hover:bg-ink">{loading ? <><LoaderCircle size={17} /> Checking</> : <>Open dashboard <ArrowUpRight size={18} /></>}</button></form></div>
  </main>;
}

