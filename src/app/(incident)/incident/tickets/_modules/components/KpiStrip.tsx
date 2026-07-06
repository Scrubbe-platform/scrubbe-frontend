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
    ["Investigating", "Monitoring", "OPEN", "Open", "Investigation", "INVESTIGATION"].includes(i.status),
  ).length;
  const resolvedCount = incidents.filter((i) =>
    ["Resolved", "RESOLVED", "Closed", "CLOSED"].includes(i.status),
  ).length;
  const majorCount = incidents.filter(
    (i) => i.priority === "CRITICAL" || i.priority === "P0" || i.priority === "P1" || i.priority === "HIGH",
  ).length;

  const resolvedArr = incidents.filter((i) => i.MTTR > 0).map((i) => i.MTTR);
  const avgMttr = resolvedArr.length
    ? Math.round(resolvedArr.reduce((a, b) => a + b, 0) / resolvedArr.length)
    : 0;

  const cards = [
    {
      label: "Total Incidents",
      val: String(total),
    },
    {
      label: "Open",
      val: String(openCount),
    },
    {
      label: "Resolved",
      val: String(resolvedCount),
    },
    {
      label: "Major Incidents",
      val: String(majorCount),
    },
    {
      label: "Average MTTR",
      val: `${avgMttr}m`,
    },
    {
      label: "P0 Critical",
      val: String(incidents.filter((i) => i.priority === "CRITICAL" || i.priority === "P0").length),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 border border-zinc-200 rounded-sm overflow-hidden shadow-2xs bg-white">
      {cards.map((c, idx) => (
        <div
          key={idx}
          className={`text-left p-4 border-r last:border-r-0 border-zinc-100 hover:bg-zinc-50/50 transition-colors relative`}
        >
          <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            {c.label}
          </div>
          <div
            className={`text-2xl font-bold font-mono tracking-tight leading-none mt-2 `}
          >
            {c.val}
          </div>
        </div>
      ))}
    </div>
  );
}
