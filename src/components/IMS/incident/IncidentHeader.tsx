"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { IncidentDetailRecord, IncidentStats } from "@/lib/incident/incident.types";
import Modal from "@/components/ui/Modal";
import WarRoom from "./WarRoom";
import AddContextForm from "./ContextForm";

interface TabItem { id: string; label: string; link: string }
interface IncidentHeaderProps { incident: IncidentDetailRecord; stats: IncidentStats, context: any }

const IncidentHeader = ({ incident, stats, context }: IncidentHeaderProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeId = searchParams.get("id") ?? incident.id;
  const currentTab = searchParams.get("tab");
  const [openWarRoom, setOpenWarRoom] = useState(false)
  const [openContext, setOpenContext] = useState(false)

  const tabs: TabItem[] = [
    { id: "overview",     label: "Overview",          link: `/incident?id=${activeId}&tab=overview`      },
    { id: "signal-graph", label: "Signal graph",       link: `/incident/signal-graph?id=${activeId}`      },
    { id: "code-engine",  label: "Code Engine",        link: `/incident/code-engine?id=${activeId}`       },
    { id: "delivery",     label: "Incident Delivery",  link: `/incident/incident-delivery?id=${activeId}` },
    { id: "playbook",     label: "Playbook. RBK.17",   link: `/incident/playbooks?id=${activeId}`         },
   ];

  return (
    <div className="w-full px-5 md:px-8 pt-6 pb-0 flex flex-col gap-5 border-b border-zinc-100 dark:border-white/[0.06] bg-white dark:bg-transparent">

      {/* ── Top row ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex flex-col gap-3">

          {/* Ticket ID + badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[13px] font-mono font-semibold text-black dark:text-zinc-500 tracking-wider">
              {incident.ticketId}
            </span>
            <span className="w-px h-3.5 bg-zinc-200 dark:bg-zinc-700" />
            <SourceBadge>{incident.sourceType || "Manual"}</SourceBadge>
            <SeverityBadge>{incident.severity} · {incident.priority}</SeverityBadge>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30">
              <span className="text-[10px] font-semibold text-orange-500 uppercase tracking-wider">Elapsed</span>
              <span className="text-[11px] font-mono font-bold text-orange-600 dark:text-orange-400">{incident.elapsedLabel}</span>
            </span>
          </div>

          {/* Title */}
          <h1 className="text-[18px] md:text-[22px] font-bold text-black dark:text-white leading-snug max-w-2xl">
            {incident.title}
          </h1>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-1.5">
            {[incident.service, incident.region, incident.environment, incident.status]
              .filter(Boolean)
              .map((val) => (
                <span
                  key={val}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium border border-zinc-500 dark:border-zinc-700/60 text-black dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40"
                >
                  {val}
                </span>
              ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setOpenContext(true)}
            className="px-4 py-2 text-[12px] font-semibold rounded-lg border border-zinc-500 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Add Context
          </button>
          <button
            onClick={() => setOpenWarRoom(true)}
            className="px-4 py-2 text-[12px] font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
          >
            War Room
          </button>
        </div>
      </div>

      {/* ── Tab nav ── */}
      <nav className="flex overflow-x-auto no-scrollbar -mx-5 md:-mx-8 px-5 md:px-8">
        {tabs.map((tab) => {
          const isActive =
            (tab.id === "overview" && (!currentTab || currentTab === "overview")) ||
            currentTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={tab.link}
              className="relative shrink-0 pb-3 mr-7 last:mr-0 group"
            >
              <span className={`text-[13px] font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-dark dark:text-zinc-500 group-hover:text-black dark:group-hover:text-zinc-300"
              }`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-emerald-500 dark:bg-emerald-400" />
              )}
            </Link>
          );
        })}
      </nav>
      <Modal onClose={() => setOpenContext(false)} isOpen={openContext} >
        <AddContextForm incident={incident} onCancel={() => setOpenContext(false)} context={context} />
      </Modal>
    <Modal onClose={() => setOpenWarRoom(false)} isOpen={openWarRoom} >
      <WarRoom incident={incident}
       onDeclare={(data) => console.log(data)}
       onClose={() => setOpenWarRoom(false)} />
    </Modal>
    </div>

  );
};

const SourceBadge = ({ children }: { children: React.ReactNode }) => (
  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold border border-sky-200 dark:border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10">
    {children}
  </span>
);

const SeverityBadge = ({ children }: { children: React.ReactNode }) => (
  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10">
    {children}
  </span>
);

export default IncidentHeader;