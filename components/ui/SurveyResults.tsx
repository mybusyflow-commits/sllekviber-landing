"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight, RefreshCw, Plus } from "lucide-react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { requestJson } from "@/lib/client-request";
type Results = { total: number; today: number; q1: { option: string; count: number }[]; q2: { option: string; count: number }[] };

function ResultRows({ items, total }: { items: Results["q1"]; total: number }) {
  return <ul className="result-rows">{items.map(({ option, count }) => {
    const percent = total ? Math.round(count / total * 100) : 0;
    return <li key={option}><div><span>{option}</span><b>{count} <small>· {percent}%</small></b></div><div className="result-bar" aria-hidden="true"><i style={{ width: `${percent}%` }} /></div></li>;
  })}</ul>;
}

export function SurveyResults({ submitted }: { submitted: boolean }) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    let inFlight = false;
    async function load() {
      if (inFlight || controller.signal.aborted) return;
      inFlight = true;
      setLoading(true); setError("");
      try {
        const { response, data } = await requestJson<Results>("/api/responses/results", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Results are temporarily unavailable. Try refreshing.");
        if (!controller.signal.aborted) setResults(data);
      } catch (caught) { if (!controller.signal.aborted) setError(caught instanceof Error ? caught.message : "Could not load results."); }
      finally { inFlight = false; if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    const timer = setInterval(() => { if (!document.hidden) void load(); }, 30_000);
    return () => { controller.abort(); clearInterval(timer); };
  }, [open, refresh, submitted]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [open, results, error]);
  return <details className="survey-results" onToggle={event => setOpen(event.currentTarget.open)}>
    <summary><span>See the survey results <ArrowUpRight size={17} /></span><Plus className="results-toggle" size={20} /></summary>
    <div className="results-content" aria-busy={loading}>
      <div className="results-heading"><div><h3>The response so far.</h3><p>Live totals from the current questionnaire.</p></div><button type="button" disabled={loading} onClick={() => setRefresh(value => value + 1)} aria-label="Refresh survey results"><RefreshCw size={17} className={loading ? "loading-spinner" : ""} /></button></div>
      <p className="sr-only" role="status">{loading ? "Loading survey results" : results ? `${results.total} survey ${results.total === 1 ? "response" : "responses"}` : ""}</p>
      {error && <p className="results-error" role="alert">{error}</p>}
      {!results && loading && <p className="results-loading">Loading responses…</p>}
      {results && <><div className="results-total"><strong>{results.total}</strong><span>{results.total === 1 ? "response" : "responses"}<small>{results.today} submitted today (UTC)</small></span></div>
        {results.total === 0 ? <p className="results-empty">No responses yet. Be the first to help shape SleekViber.</p> : <><h4>How respondents feel</h4><ResultRows items={results.q1} total={results.total} /><h4>Where current platforms fall short</h4><p className="results-explainer">Up to three choices per response. Percentages can add up to more than 100%.</p><ResultRows items={results.q2} total={results.total} /></>}
        <p className="results-note">Current questionnaire only. Results update every 30 seconds while open. These responses are feedback, not a representative poll.</p>
      </>}
    </div>
  </details>;
}
