"use client";
import React from "react";
import {
  AlertTriangle, RefreshCw, Database, Plus,
  Activity, Shield, CheckCircle2, Circle,
} from "lucide-react";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";

interface PlaybookItem {
  id: string; title: string; stage: number;
  service: string; icon: React.ReactNode;
}

// ── Status card ───────────────────────────────────────────────────

const StatusCard: React.FC<PlaybookItem> = ({ title, stage, service, icon }) => (
  <div className="cursor-pointer rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-3.5 transition-colors hover:border-zinc-200 dark:hover:border-zinc-700">
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 shrink-0 text-zinc-500 dark:text-zinc-400">
        {React.cloneElement(icon as React.ReactElement, { size: 14 })}
      </div>
      <div className="flex flex-col gap-1 min-w-0">
        <p className="text-[12px] font-semibold text-zinc-800 dark:text-zinc-100 leading-tight truncate">
          {title}
        </p>
        <div className="flex items-center gap-2">
          <span className="rounded border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Stage {stage}
          </span>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">{service}</span>
        </div>
      </div>
    </div>
  </div>
);

// ── Data builder ──────────────────────────────────────────────────

const buildPlaybooks = (incident: IncidentDetailRecord): PlaybookItem[] => {
  const svc   = incident.service || incident.affectedSystem || "unknown-service";
  const title = incident.title || incident.reason || incident.summary || incident.ticketId;

  return [
    { id: "1", title,                        stage: 3, service: svc,                                                                                           icon: <AlertTriangle /> },
    { id: "2", title: "Deployment Rollback",  stage: 3, service: incident.environment || "all-services",                                                        icon: <RefreshCw />     },
    { id: "3", title: "Dependency Health",    stage: 3, service: incident.region || "shared-infra",                                                             icon: <Database />      },
    { id: "4", title: "Pod Recovery",         stage: 3, service: svc,                                                                                           icon: <Plus />          },
    { id: "5", title: "Traffic Stability",    stage: 3, service: incident.blastRadius || "impacted services",                                                   icon: <Activity />      },
    { id: "6", title: "Auth / Access Check",  stage: 2, service: incident.assignedToName || incident.assignedToEmail || incident.incidentCommander || "owner",  icon: <Shield />        },
  ];
};

// ── Legend ────────────────────────────────────────────────────────

const legends = [
  { id: 1, label: "Lifecycle Stages",    status: "completed" as const },
  { id: 2, label: "Investigation Steps", status: "active"    as const },
  { id: 3, label: "Remediation Options", status: "pending"   as const },
  { id: 4, label: "Blast Radius Eval",   status: "pending"   as const },
  { id: 5, label: "Guardrail Check",     status: "pending"   as const },
  { id: 6, label: "Execution Gate",      status: "pending"   as const },
  { id: 7, label: "Audit Trail",         status: "pending"   as const },
];

// ── Sidebar ───────────────────────────────────────────────────────

const PlaybookSidebar: React.FC<{ incident: IncidentDetailRecord }> = ({ incident }) => {
  const playbooks = buildPlaybooks(incident);

  return (
    <div className="flex h-full w-72 flex-col gap-5 overflow-y-auto border-r border-zinc-100 dark:border-zinc-800 bg-white dark:bg-transparent p-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-100">Playbooks</p>
        <span className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
          {playbooks.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2">
        {playbooks.map((p) => <StatusCard key={p.id} {...p} />)}
      </div>

      <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

      {/* Legend */}
      <div className="flex flex-col gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Legend
        </p>
        <div className="flex flex-col gap-2.5">
          {legends.map(({ id, label, status }) => (
            <div key={id} className="flex items-center justify-between group cursor-default">
              <span className="text-[12px] text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors">
                {id}. {label}
              </span>
              {status === "completed" ? (
                <CheckCircle2 size={14} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
              ) : status === "active" ? (
                <div className="relative flex items-center justify-center shrink-0">
                  <Circle size={14} className="text-zinc-600 dark:text-zinc-400" />
                  <div className="absolute h-1.5 w-1.5 rounded-full bg-zinc-600 dark:bg-zinc-400" />
                </div>
              ) : (
                <Circle size={14} className="text-zinc-200 dark:text-zinc-700 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlaybookSidebar;