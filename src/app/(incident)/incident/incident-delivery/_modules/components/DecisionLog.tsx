"use client";
import React, { useEffect, useState } from "react";
import { DECISION_LOG } from "./incidentDelivery.data";
import { customAxios } from "@/lib/api/axios";
import { endpoint } from "@/lib/api/endpoint";

const DecisionLog = ({ incidentId }: { incidentId?: string }) => {
  const [entries, setEntries] = useState(DECISION_LOG);

  useEffect(() => {
    if (!incidentId) return;
    customAxios.get(`${endpoint.decisions.list}?incidentId=${encodeURIComponent(incidentId)}&limit=10`).then((res) => {
      const list: any[] = res.data?.data ?? res.data ?? [];
      if (list.length > 0) {
        setEntries(list.map((d: any) => ({
          kind: d.title ?? d.action ?? "Governance decision",
          desc: d.description ?? d.reason ?? "",
          who: d.actor ?? d.triggeredBy ?? "Ezra",
          time: d.createdAt ? new Date(d.createdAt).toLocaleTimeString() : "—",
        })));
      }
    }).catch(() => {});
  }, [incidentId]);

  return (
  <div className="rounded-2xl border border-[#DDDDDD] bg-white dark:bg-zinc-900/40 overflow-hidden">
    {/* Header */}
    <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-black/40 dark:text-zinc-500 font-mono">
          Decision Log
        </p>
        <p className="text-lg font-bold text-black dark:text-zinc-100 leading-tight">
          What happened and why
        </p>
      </div>
      <span className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[13px] font-medium text-black/50 dark:text-zinc-400 shrink-0">
        {entries.length} events
      </span>
    </div>

    {/* Entries */}
    <div className="px-6 py-5 space-y-6">
      {entries.map((entry, i) => (
        <div key={i} className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-black dark:text-zinc-100 leading-tight">
              {entry.kind}
            </p>
            <p className="text-[14px] text-black/60 dark:text-zinc-400 mt-1 leading-snug">
              {entry.desc}
            </p>
            <p className="text-[12.5px] italic text-black/40 dark:text-zinc-500 mt-1">
              {entry.who}
            </p>
          </div>
          <span className="text-[13px] text-black/40 dark:text-zinc-600 shrink-0 tabular-nums">
            {entry.time}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default DecisionLog;
