"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import {
  IncidentDetailRecord,
  IncidentStats,
} from "@/lib/incident/incident.types";

interface TabItem {
  id: string;
  label: string;
  link: string;
}

interface IncidentHeaderProps {
  incident: IncidentDetailRecord;
  stats: IncidentStats;
}

const IncidentHeader = ({ incident, stats }: IncidentHeaderProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeId = searchParams.get("id") ?? incident.id;
  const currentTab = searchParams.get("tab");

  const tabs: TabItem[] = [
    {
      id: "overview",
      label: "Overview",
      link: `/incident?id=${activeId}&tab=overview`,
    },
    {
      id: "signal-graph",
      label: "Signal graph",
      link: `/incident/signal-graph?id=${activeId}`,
    },
    {
      id: "code-engine",
      label: "Code Engine",
      link: `/incident/code-engine?id=${activeId}`,
    },
    {
      id: "delivery",
      label: "Incident Delivery",
      link: `/incident/incident-delivery?id=${activeId}`,
    },
    {
      id: "playbook",
      label: "Playbook. RBK.17",
      link: `/incident/playbooks?id=${activeId}`,
    },
    {
      id: "context",
      label: "Context",
      link: `/incident?id=${activeId}&tab=context`,
    },
  ];

  return (
    <div className="w-full text-white p-4 md:p-6 flex flex-col gap-6 md:gap-8 border-b border-white/5">
      <div className="flex overflow-x-auto no-scrollbar pb-2 md:pb-0 gap-2 items-center justify-between">
        <div className="flex gap-2 shrink-0">
          <StatBadge label={`${stats.active} Active`} color="orange" />
          <StatBadge label={`${stats.investigating} Investigating`} color="yellow" />
          <StatBadge label={`${stats.resolved} Resolved`} color="green" />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight shrink-0">
                {incident.ticketId}
              </h1>

              <div className="flex flex-wrap gap-2">
                <Badge variant="blue">{incident.sourceType || "Manual"}</Badge>
                <Badge variant="red">
                  {incident.severity} · {incident.priority}
                </Badge>
                <div className="flex items-center border border-orange-500/50 rounded px-2 py-0.5 bg-orange-500/5">
                  <span className="text-[10px] text-orange-400 uppercase font-black mr-2">
                    Elapsed
                  </span>
                  <span className="text-xs font-mono font-bold text-orange-400">
                    {incident.elapsedLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() =>
                router.replace(`/incident?id=${incident.id}&tab=context`)
              }
              className="flex-1 md:flex-none px-4 text-xs py-2.5 rounded-lg border border-green-500/50 text-green-400 font-bold hover:bg-green-500/5 transition-all"
            >
              Add Context
            </button>
            <button
              onClick={() => router.push(`/incident/tickets/${incident.id}`)}
              className="flex-1 md:flex-none px-4 text-xs py-2.5 rounded-lg border border-green-500/50 text-green-400 font-bold hover:bg-green-500/5 transition-all"
            >
              War Room
            </button>
          </div>
        </div>

        <h2 className="text-lg md:text-2xl font-bold text-slate-100 leading-tight">
          {incident.title}
        </h2>

        <div className="flex flex-wrap gap-2">
          <MetaTag variant="blue">{incident.service}</MetaTag>
          <MetaTag variant="orange">{incident.region}</MetaTag>
          <MetaTag variant="blue">{incident.environment}</MetaTag>
          <MetaTag variant="orange">{incident.status}</MetaTag>
        </div>
      </div>

      <nav className="flex overflow-x-auto no-scrollbar gap-8 md:gap-12 relative border-b border-white/20 -mx-4 px-4 md:mx-0 md:px-0">
        {tabs.map((tab) => {
          const isActive =
            (tab.id === "overview" && (!currentTab || currentTab === "overview")) ||
            currentTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={tab.link}
              className="relative cursor-pointer group pb-3 shrink-0"
            >
              <span
                className={`text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "text-green-400"
                    : "text-slate-500 group-hover:text-slate-200"
                }`}
              >
                {tab.label}
              </span>

              {isActive && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

const StatBadge = ({
  label,
  color,
}: {
  label: string;
  color: "orange" | "yellow" | "green";
}) => {
  const colors = {
    orange: "border-orange-900/50 text-orange-500 bg-orange-500/5",
    yellow: "border-yellow-900/50 text-yellow-600 bg-yellow-600/5",
    green: "border-emerald-900/50 text-emerald-500 bg-emerald-500/5",
  };

  return (
    <div
      className={`px-3 py-1 rounded-md border text-[10px] md:text-xs font-bold whitespace-nowrap ${colors[color]}`}
    >
      {label}
    </div>
  );
};

const Badge = ({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "blue" | "red";
}) => {
  const styles = {
    blue: "border-green-500/30 text-green-400 bg-green-400/5",
    red: "border-red-500/30 text-red-500 bg-red-500/5",
  };

  return (
    <span
      className={`px-2 py-1 rounded border text-[10px] font-bold whitespace-nowrap ${styles[variant]}`}
    >
      {children}
    </span>
  );
};

const MetaTag = ({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "blue" | "orange";
}) => {
  const styles = {
    blue: "border-green-500/30 text-green-400",
    orange: "border-orange-500/30 text-orange-400",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded border text-[10px] font-medium bg-white/[0.02] whitespace-nowrap ${styles[variant]}`}
    >
      {children}
    </span>
  );
};

export default IncidentHeader;
