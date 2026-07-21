"use client";
import React from "react";
import { Zap, Circle } from "lucide-react";
import { DECISION_LOG } from "./incidentDelivery.data";

const iconForKind = (kind: string) => {
  if (kind.includes("hypothesis"))
    return <Circle size={18} className="text-amber-500" strokeWidth={2.5} />;
  if (kind.includes("remediation"))
    return <Zap size={18} className="text-emerald-500 fill-emerald-500" />;
  return <Zap size={18} className="text-blue-500 fill-blue-500" />;
};

const DecisionLog = () => (
  <div className="rounded-xl border border-[#DDDDDD] bg-white dark:bg-zinc-900/40 p-6">
    {/* Header */}
    <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Decision Log
        </p>
        <p className=" font-bold text-black dark:text-zinc-100 leading-tight">
          What happened and why
        </p>
      </div>
      <span className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[13px] font-medium text-zinc-600 dark:text-zinc-400 shrink-0">
        {DECISION_LOG.length} events
      </span>
    </div>

    {/* Entries */}
    <div className="pt-5 space-y-6">
      {DECISION_LOG.map((entry, i) => (
        <div key={i} className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 shrink-0">{iconForKind(entry.kind)}</div>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-black dark:text-zinc-100 leading-tight">
                {entry.kind}
              </p>
              <p className="text-[13px] text-zinc-700 dark:text-zinc-400 mt-1 leading-snug">
                {entry.desc}
              </p>
              <p className="text-[12px] italic text-zinc-400 dark:text-zinc-500 mt-1">
                {entry.who}
              </p>
            </div>
          </div>
          <span className="text-[13px] text-zinc-400 dark:text-zinc-600 shrink-0 tabular-nums">
            {entry.time}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default DecisionLog;
