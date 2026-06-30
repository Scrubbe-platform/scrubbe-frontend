// app/incidents/library/components/KpiStrip.tsx
import React from "react";
import { IncidentListItem } from "@/lib/incident/incident.types";

interface KpiStripProps {
  incidents: IncidentListItem[];
  onKpiFilter: (priority: string) => void;
}

export default function KpiStrip({ incidents, onKpiFilter }: KpiStripProps) {
  const total = incidents.length;
  const openCount = incidents.filter((i) =>
    ["Investigating", "Monitoring"].includes(i.status),
  ).length;
  const p0Count = incidents.filter((i) => i.priority === "P0").length;
  const p1Count = incidents.filter((i) => i.priority === "P1").length;

  const resolvedArr = incidents.filter((i) => i.MTTR > 0).map((i) => i.MTTR);
  const avgMttr = resolvedArr.length
    ? Math.round(resolvedArr.reduce((a, b) => a + b, 0) / resolvedArr.length)
    : 0;

  const cards = [
    {
      label: "Total Incidents Registry",
      val: "12,847",
      sub: `from ${total} catalogued elements`,
      action: null,
    },
    {
      label: "Active Outages",
      val: String(openCount),
      sub: "live operational investigations",
      action: null,
      isLive: true,
    },
    {
      label: "Critical P0 Thresholds",
      val: String(p0Count),
      sub: "trigger filter view shortcut",
      action: () => onKpiFilter("P0"),
      highlight: "text-red-600",
    },
    {
      label: "High P1 Thresholds",
      val: String(p1Count),
      sub: "trigger filter view shortcut",
      action: () => onKpiFilter("P1"),
      highlight: "text-amber-600",
    },
    {
      label: "Average Corporate MTTR",
      val: `${avgMttr}m`,
      sub: "computed resolving telemetry logs",
      action: null,
    },
    {
      label: "Knowledge Base Corpus",
      val: "641",
      sub: "verified structural runbooks",
      action: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 border border-zinc-200 rounded-xl overflow-hidden shadow-2xs bg-white">
      {cards.map((c, idx) => (
        <button
          key={idx}
          disabled={!c.action}
          onClick={() => c.action?.()}
          className={`text-left p-4 border-r last:border-r-0 border-zinc-100 hover:bg-zinc-50/50 transition-colors relative ${c.action ? "cursor-pointer" : "cursor-default"}`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            {c.label}
            {c.isLive && (
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            )}
          </div>
          <div
            className={`text-2xl font-bold font-mono tracking-tight leading-none mt-2 ${c.highlight || "text-zinc-950"}`}
          >
            {c.val}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1.5 leading-normal truncate">
            {c.sub}
          </div>
        </button>
      ))}
    </div>
  );
}
