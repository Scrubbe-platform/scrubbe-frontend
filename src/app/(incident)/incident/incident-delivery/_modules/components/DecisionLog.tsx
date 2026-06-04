"use client";
import React from "react";
import { ShieldCheck, Lightbulb, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";

interface LogEntryProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  time: string;
  payload?: Record<string, any>;
}

// ── Icon resolver ─────────────────────────────────────────────────

const iconForType = (type: string) => {
  if (type?.includes("policy"))                        return <ShieldCheck size={14} className="text-emerald-500 dark:text-emerald-400" />;
  if (type?.includes("insight") || type?.includes("hypothesis")) return <Lightbulb size={14} className="text-amber-500 dark:text-amber-400"  />;
  return <Activity size={14} className="text-sky-500 dark:text-sky-400" />;
};

// ── Fallback entries shown when API returns nothing ───────────────

const FALLBACK: LogEntryProps[] = [
  {
    icon: <ShieldCheck size={14} className="text-emerald-500 dark:text-emerald-400" />,
    title: "policy.evaluated",
    desc: "Policy evaluated for incident.",
    time: "—",
    payload: { autoActivate: false, humanGate: true, scope: "pr-only" },
  },
  {
    icon: <ShieldCheck size={14} className="text-emerald-500 dark:text-emerald-400" />,
    title: "policy.mode",
    desc: "Policy mode set to standard.",
    time: "—",
  },
  {
    icon: <Lightbulb size={14} className="text-amber-500 dark:text-amber-400" />,
    title: "hypotheses.generated",
    desc: "Generated top 3 likely causes (not final RCA).",
    time: "—",
    payload: { top: [{ title: "Competing refactors touching same module", conf: 0.72 }] },
  },
];

// ── Component ─────────────────────────────────────────────────────

const DecisionLog: React.FC<{ incidentId?: string }> = ({ incidentId }) => {
  const { get } = useFetch();

  const { data, isLoading } = useQuery({
    queryKey: ["decisions-log", incidentId],
    queryFn: async () => {
      const url = incidentId
        ? `${endpoint.decisions.log}?incidentId=${incidentId}`
        : endpoint.decisions.log;
      const res = await get(url);
      if (res.success) return (res.data?.data?.decisions ?? res.data?.data ?? []) as any[];
      return [] as any[];
    },
  });

  const entries = data ?? [];

  const displayEntries: LogEntryProps[] =
    isLoading || entries.length === 0
      ? FALLBACK
      : entries.map((e: any) => ({
          icon: iconForType(e.type ?? e.action ?? ""),
          title: e.type ?? e.action ?? "event",
          desc: e.summary ?? e.reason ?? e.description ?? "Decision recorded.",
          time: e.createdAt ? new Date(e.createdAt).toLocaleTimeString() : "—",
          payload: e.context ?? e.metadata ?? undefined,
        }));

  return (
    <div className="rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 overflow-hidden">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="space-y-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
            Decision Log
          </p>
          <p className="text-[14px] font-semibold text-black dark:text-zinc-100">
            What happened and why
          </p>
          <p className="text-[12px] text-black dark:text-zinc-500">
            Timeline is derived from this log, including human notes.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[11px] font-mono text-black dark:text-zinc-500 shrink-0">
          {isLoading ? "…" : `${entries.length} events`}
        </span>
      </div>

      {/* Entries */}
      <div className="p-4 space-y-2">
        {isLoading && (
          <p className="text-[12px] text-black animate-pulse px-1">Loading decisions…</p>
        )}
        {displayEntries.map((entry, i) => (
          <LogEntry key={i} {...entry} />
        ))}
      </div>
    </div>
  );
};

// ── Log entry ─────────────────────────────────────────────────────

const LogEntry: React.FC<LogEntryProps> = ({ icon, title, desc, time, payload }) => (
  <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 shrink-0">{icon}</div>
        <div className="min-w-0">
          <p className="text-[12px] font-semibold font-mono text-black dark:text-zinc-200 leading-tight">
            {title}
          </p>
          <p className="text-[12px] text-black dark:text-zinc-500 mt-0.5 leading-snug">
            {desc}
          </p>
        </div>
      </div>
      <span className="text-[11px] font-mono text-black dark:text-zinc-600 shrink-0 tabular-nums">
        {time}
      </span>
    </div>

    {payload && (
      <div className="mt-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 p-3 overflow-x-auto">
        <pre className="text-[11px] font-mono text-black dark:text-zinc-400 leading-relaxed">
          <code>{JSON.stringify(payload, null, 2)}</code>
        </pre>
      </div>
    )}
  </div>
);

export default DecisionLog;