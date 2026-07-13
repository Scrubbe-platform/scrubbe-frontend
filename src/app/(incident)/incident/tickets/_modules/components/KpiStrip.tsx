// app/incidents/library/components/KpiStrip.tsx
import React from "react";
import { IncidentListItem } from "@/lib/incident/incident.types";
import {
  TbAlertTriangle,
  TbCircleCheck,
  TbBox,
  TbFileText,
  TbClock,
} from "react-icons/tb";

interface KpiStripProps {
  incidents: IncidentListItem[];
  onKpiFilter?: (priority: string) => void;
}

interface KpiCard {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: { value: string; positive: boolean };
}

export default function KpiStrip({ incidents, onKpiFilter }: KpiStripProps) {
  const total = incidents.length;
  const openCount = incidents.filter((i) =>
    [
      "Investigating",
      "Monitoring",
      "OPEN",
      "Open",
      "Investigation",
      "INVESTIGATION",
    ].includes(i.status),
  ).length;
  const resolvedCount = incidents.filter((i) =>
    ["Resolved", "RESOLVED", "Closed", "CLOSED"].includes(i.status),
  ).length;
  const majorCount = incidents.filter((i) =>
    ["CRITICAL", "P0", "P1", "HIGH"].includes(i.priority),
  ).length;
  const mttrArr = incidents.filter((i) => i.MTTR > 0).map((i) => i.MTTR);
  const avgMttr = mttrArr.length
    ? Math.round(mttrArr.reduce((a, b) => a + b, 0) / mttrArr.length)
    : 0;

  const cards: KpiCard[] = [
    {
      label: "Total Incidents",
      value: total.toLocaleString(),
      icon: <TbAlertTriangle size={18} />,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      trend: { value: "+8.2% vs last month", positive: true },
    },
    {
      label: "Open",
      value: String(openCount),
      icon: <TbCircleCheck size={18} />,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      label: "Resolve Incidents",
      value: resolvedCount.toLocaleString(),
      icon: <TbBox size={18} />,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
    {
      label: "Major Incidents",
      value: String(majorCount),
      icon: <TbFileText size={18} />,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-500",
    },
    {
      label: "Average MTTR",
      value: `${avgMttr}m`,
      icon: <TbClock size={18} />,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
      trend: { value: "-10.2% vs last month", positive: false },
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 ">
      {cards.map((card, idx) => (
        <div
          key={idx}
          onClick={() => onKpiFilter?.(card.label)}
          className="flex flex-col justify-between p-5 bg-white rounded-[8px] shadow-sm shadow-[#C8C8C840] border-zinc-100 hover:bg-zinc-50/60 transition-colors cursor-pointer"
        >
          {/* Label + icon */}
          <div className="flex items-center justify-between mb-1 ">
            <span className="text-base text-zinc-500 font-ibm ">
              {card.label}
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.iconBg} ${card.iconColor}`}
            >
              {card.icon}
            </div>
          </div>

          {/* Value */}
          <span className="text-[26px] font-bold text-zinc-900 leading-none tracking-tight font-ibm-plex-sans">
            {card.value}
          </span>

          {/* Trend */}
          {card.trend ? (
            <div
              className={`inline-flex items-center gap-1 mt-2.5 text-[11.5px] font-semibold px-2 py-0.5 rounded-full w-fit font-ibm-plex-sans ${
                card.trend.positive
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-500"
              }`}
            >
              <span>{card.trend.positive ? "↑" : "↓"}</span>
              {card.trend.value}
            </div>
          ) : (
            <div className="mt-2.5 h-[22px]" /> // spacer to keep heights consistent
          )}
        </div>
      ))}
    </div>
  );
}
