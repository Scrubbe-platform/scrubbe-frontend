import React from "react";
import { TbAward, TbBook, TbBox, TbCircleCheck, TbFileText } from "react-icons/tb";
import { Playbook } from "../types";

interface StatsStripProps {
  playbooks: Playbook[];
  onFilterStatus?: (status: Playbook["status"] | null) => void;
}

interface StatCard {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: { value: string; positive: boolean };
  onClick?: () => void;
}

export default function StatsStrip({
  playbooks,
  onFilterStatus,
}: StatsStripProps): React.JSX.Element {
  const total = playbooks.length;
  const by = (s: Playbook["status"]) => playbooks.filter((p) => p.status === s).length;
  const active = playbooks.filter((p) => p.status === "Active");
  const avgSuccess = Math.round(
    active.reduce((a, p) => a + p.success, 0) / Math.max(active.length, 1),
  );
  const executedThisMonth = active.reduce((a, p) => a + Math.round(p.executed / 6), 0);

  const cards: StatCard[] = [
    {
      label: "Total Playbooks",
      value: total.toLocaleString(),
      icon: <TbBook size={18} />,
      iconBg: "bg-amber-50 dark:bg-amber-500/10",
      iconColor: "text-amber-500 dark:text-amber-400",
      onClick: () => onFilterStatus?.(null),
    },
    {
      label: "Average Success rate",
      value: `${avgSuccess}%`,
      icon: <TbCircleCheck size={18} />,
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
      iconColor: "text-blue-500 dark:text-blue-400",
      trend: { value: "+8.2% vs last month", positive: true },
    },
    {
      label: "Active",
      value: by("Active").toLocaleString(),
      icon: <TbBox size={18} />,
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-500 dark:text-emerald-400",
      onClick: () => onFilterStatus?.("Active"),
    },
    {
      label: "Draft",
      value: by("Draft").toLocaleString(),
      icon: <TbFileText size={18} />,
      iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
      iconColor: "text-indigo-500 dark:text-indigo-400",
      onClick: () => onFilterStatus?.("Draft"),
    },
    {
      label: "Executed this month",
      value: executedThisMonth.toLocaleString(),
      icon: <TbAward size={18} />,
      iconBg: "bg-orange-50 dark:bg-orange-500/10",
      iconColor: "text-orange-500 dark:text-orange-400",
      trend: { value: "-10.2% vs last month", positive: false },
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          onClick={card.onClick}
          className={`flex flex-col justify-between p-5 bg-white dark:bg-zinc-900/40 rounded-[8px] shadow-sm shadow-light transition-shadow ${
            card.onClick ? "cursor-pointer hover:shadow-md" : ""
          }`}
        >
          {/* Label + icon */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-base text-zinc-500 dark:text-zinc-400 font-ibm">{card.label}</span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.iconBg} ${card.iconColor}`}
            >
              {card.icon}
            </div>
          </div>

          {/* Value */}
          <span className="text-[26px] font-bold text-zinc-900 dark:text-zinc-100 leading-none tracking-tight font-ibm-plex-sans">
            {card.value}
          </span>

          {/* Trend */}
          {card.trend ? (
            <div
              className={`inline-flex items-center gap-1 mt-2.5 text-[11.5px] font-semibold px-2 py-0.5 rounded-full w-fit font-ibm-plex-sans ${
                card.trend.positive
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400"
              }`}
            >
              <span>{card.trend.positive ? "↑" : "↓"}</span>
              {card.trend.value}
            </div>
          ) : (
            <div className="mt-2.5 h-[22px]" />
          )}
        </div>
      ))}
    </div>
  );
}
