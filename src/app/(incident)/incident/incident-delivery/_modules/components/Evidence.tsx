"use client";
import React from "react";
import { Terminal } from "lucide-react";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";
import { buildDeliveryPayload } from "./incidentDelivery.data";

const Evidence = ({ incident }: { incident: IncidentDetailRecord }) => {
  const evidencePayload = buildDeliveryPayload(incident);

  return (
    <div className="rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 overflow-hidden">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="space-y-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
            Evidence
          </p>
          <p className="text-[14px] font-semibold text-black dark:text-zinc-100">
            Event payload
          </p>
          <p className="text-[12px] text-black dark:text-zinc-500">
            Raw evidence projected from the current incident context.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[11px] font-mono text-black dark:text-zinc-400 shrink-0">
          {evidencePayload.eventType}
        </span>
      </div>

      {!evidencePayload.isLive && (
        <div className="px-5 py-2.5 border-b border-zinc-100 dark:border-zinc-800 bg-amber-50 dark:bg-amber-500/5">
          <p className="text-[11px] text-amber-700 dark:text-amber-400">
            No CI/VCS event payload has been captured for this incident — showing incident metadata only.
          </p>
        </div>
      )}

      {/* Code block */}
      <div className="relative group px-5 py-4 bg-zinc-50 dark:bg-zinc-950/60">
        <Terminal
          size={14}
          className="absolute right-5 top-4 text-black dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors"
        />
        <pre className="overflow-x-auto text-[12px] font-mono leading-relaxed text-zinc-600 dark:text-zinc-300">
          <code>{JSON.stringify(evidencePayload, null, 2)}</code>
        </pre>
      </div>
    </div>
  );
};

export default Evidence;