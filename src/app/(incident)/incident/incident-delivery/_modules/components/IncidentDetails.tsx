"use client";
import React from "react";
import { Tag, Layers } from "lucide-react";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";
import { buildDeliveryPayload } from "./incidentDelivery.data";

const IncidentDetails = ({ incident }: { incident: IncidentDetailRecord }) => {
  const payload = buildDeliveryPayload(incident);
  const correlationKey = `${payload.repo}::pr${payload.pr.number}::${payload.artifacts.runUrl}::${payload.commit.sha}`;

  const fields = [
    {
      title: "Incident ID",
      value: incident.ticketId,
    },
    {
      title: "Correlation key",
      value: correlationKey,
      sub: "repo + pr + run + sha",
    },
    {
      title: "Repo / PR / Commit",
      value: `repo: ${payload.repo}`,
      list: [`pr: #${payload.pr.number}`, `sha: ${payload.commit.sha}`],
    },
  ];

  return (
    <div className="rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 overflow-hidden">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="space-y-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
            Incident
          </p>
          <p className="text-[14px] font-semibold text-black dark:text-zinc-100">
            Raised from live incident context
          </p>
          <p className="text-[12px] text-black dark:text-zinc-500">
            Dedup keeps one incident per correlated failure pattern.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[11px] font-mono text-black dark:text-zinc-400 shrink-0">
          {incident.ticketId}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 space-y-3">

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fields.map((field) => (
            <InfoCard key={field.title} {...field} />
          ))}

          {/* Type / subtype */}
          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500 mb-3">
              Type / subtype
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge icon={<Layers size={12} />} label={payload.eventType} />
              <Badge icon={<Tag size={12} />} label={payload.failureCategory} />
            </div>
          </div>
        </div>

        {/* Incident title */}
        <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500 mb-2">
            Incident title
          </p>
          <p className="text-[13px] font-medium text-black dark:text-zinc-200 leading-snug">
            {incident.title || payload.pr.title}
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────

const InfoCard = ({
  title, value, sub, list,
}: {
  title: string; value: string; sub?: string; list?: string[];
}) => (
  <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4">
    <p className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500 mb-2">
      {title}
    </p>
    <p className="text-[12px] font-medium text-black dark:text-zinc-200 break-all leading-relaxed">
      {value}
    </p>
    {sub && (
      <p className="text-[11px] text-black dark:text-zinc-500 mt-1">{sub}</p>
    )}
    {list?.map((item, i) => (
      <p key={i} className="text-[12px] text-black dark:text-zinc-400 mt-1">{item}</p>
    ))}
  </div>
);

const Badge = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
    <span className="text-zinc-400 dark:text-zinc-500">{icon}</span>
    {label}
  </span>
);

export default IncidentDetails;