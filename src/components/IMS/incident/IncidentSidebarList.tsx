// ─────────────────────────────────────────────────────────────────
// ExactIncidentSidebar.tsx
// ─────────────────────────────────────────────────────────────────
"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import RaiseIncidentModal from "./IncidentForm";
import { useIncidentList } from "@/hooks/useIncidentList";
import { useIncidentSelection } from "@/hooks/useIncidentSelection";
import {
  IncidentListItem,
  IncidentSidebarStatus,
} from "@/lib/incident/incident.types";

const FilterPill = ({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded-md border text-[11px] font-bold uppercase tracking-wider transition-all
    ${
      active
        ? "border-green-500 text-green-600 dark:text-green-400 bg-green-500/5"
        : "border-zinc-200 dark:border-white/10 text-black dark:text-slate-500 hover:text-zinc-600 dark:hover:text-slate-300 hover:border-zinc-300 dark:hover:border-white/20"
    }`}
  >
    {label}
  </button>
);

const StatusBadge = ({ status }: { status: IncidentSidebarStatus }) => {
  const styles: Record<IncidentSidebarStatus, string> = {
    Investigating:
      "border-amber-500/50 text-amber-600 dark:text-amber-500 bg-amber-500/5",
    Proposed:
      "border-blue-500/50 text-blue-600 dark:text-blue-400 bg-blue-500/5",
    Detected:
      "border-green-500/50 text-green-600 dark:text-green-400 bg-green-500/5",
    Approved:
      "border-emerald-500/50 text-emerald-600 dark:text-emerald-500 bg-emerald-500/5",
    Enriched:
      "border-purple-500/50 text-purple-600 dark:text-purple-400 bg-purple-500/5",
    Analyzed:
      "border-indigo-500/50 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5",
    Executing:
      "border-yellow-500/50 text-yellow-600 dark:text-yellow-500 bg-yellow-500/5",
    Resolved:
      "border-slate-400/50 text-slate-500 dark:text-slate-400 bg-slate-500/5",
    "Post-Mortem":
      "border-pink-500/50 text-pink-600 dark:text-pink-400 bg-pink-500/5",
  };
  return (
    <span
      className={`text-[9px] px-2 py-0.5 rounded border font-black uppercase tracking-tighter ${styles[status]}`}
    >
      {status}
    </span>
  );
};

const IncidentCard = ({
  incident,
  onClick,
  isActive,
}: {
  incident: IncidentListItem;
  onClick: () => void;
  isActive: boolean;
}) => (
  <div
    onClick={onClick}
    className={`border rounded-xl p-4 mb-3 transition-all cursor-pointer group ${
      isActive
        ? "border-black dark:border-green-400/60 dark:bg-green-400/5 ring-1 ring-green-500/20 dark:ring-green-400/20"
        : "border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/20"
    }`}
  >
    <div className="flex justify-between items-start mb-3">
      <div className="px-2 py-0.5 rounded border border-red-500/40 text-[10px] font-black text-red-500 bg-red-500/5">
        {incident.severity}
      </div>
      <StatusBadge status={incident.sidebarStatus} />
    </div>

    <div className="mb-2">
      <span className="text-[10px] font-mono text-black dark:text-slate-600 block mb-1 uppercase tracking-widest">
        {incident.ticketId}
      </span>
      <h3 className="text-[13px] font-semibold  dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 leading-snug line-clamp-2">
        {incident.title}
      </h3>
    </div>

    <div className="text-[10px] text-black dark:text-slate-500 mb-4 font-medium">
      {incident.service} · {incident.region} · {incident.elapsedLabel}
    </div>

    <div className="flex gap-1">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-sm transition-all duration-700 ${
            i + 1 <= incident.stageProgress
              ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
              : "bg-zinc-100 dark:bg-white/5"
          }`}
        />
      ))}
    </div>
  </div>
);

export const ExactIncidentSidebar: React.FC = () => {
  const { data, isLoading } = useIncidentList();
  const { incidentId: activeId, setSelectedIncident } = useIncidentSelection();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<
    "all" | "p0" | "p1" | "p2" | "p3" | "resolved" | "auto" | "manual"
  >("all");

  const incidents = data?.incidents ?? [];
  const normalizedQuery = query.trim().toLowerCase();

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      !normalizedQuery ||
      [
        incident.ticketId,
        incident.title,
        incident.service,
        incident.region,
        incident.sourceType,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);

    const matchesFilter =
      filter === "all"
        ? true
        : filter === "p0"
        ? incident.severity === "P0"
        : filter === "p1"
        ? incident.severity === "P1"
        : filter === "p2"
        ? incident.severity === "P2"
        : filter === "p3"
        ? incident.severity === "P3"
        : filter === "resolved"
        ? incident.sidebarStatus === "Resolved" ||
          incident.status === "RESOLVED"
        : filter === "auto"
        ? incident.sourceType.toLowerCase() !== "manual"
        : incident.sourceType.toLowerCase() === "manual";

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full h-screen md:border-r border-zinc-500 dark:border-white/5 flex flex-col p-3 md:p-6 overflow-hidden bg-white dark:bg-transparent">
      <div className="flex justify-between items-center mb-8">
        <p className="font-semibold text-black dark:text-white">
          Incidents {incidents.length > 0 ? `(${incidents.length})` : ""}
        </p>
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="px-5 py-2 border border-IMSCyan text-IMSCyan rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-green-400/5 transition-all"
        >
          Raise Incident
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "p0", "p1", "p2", "p3", "resolved", "auto", "manual"] as const).map(
          (f) => (
            <FilterPill
              key={f}
              label={f}
              active={filter === f}
              onClick={() => setFilter(f)}
            />
          )
        )}
      </div>

      <div className="relative mb-8">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-slate-600"
          size={14}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search incidents, services, ID"
          className="w-full bg-zinc-50 dark:bg-white/[0.02] border border-zinc-500 dark:border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-xs text-black dark:text-slate-300 focus:outline-none focus:border-green-500/40 dark:focus:border-green-400/40 transition-all placeholder:text-zinc-400 dark:placeholder:text-slate-600 font-medium"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="mb-3 h-32 rounded-xl border border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.03]"
            />
          ))
        ) : filteredIncidents.length > 0 ? (
          filteredIncidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onClick={() => setSelectedIncident(incident.id)}
              isActive={
                activeId === incident.id || activeId === incident.ticketId
              }
            />
          ))
        ) : (
          <div className="rounded-2xl border border-zinc-500 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] p-5 text-sm text-black dark:text-slate-400">
            No incidents matched this filter.
          </div>
        )}
      </div>

      {open && <RaiseIncidentModal onClose={() => setOpen(false)} />}
    </div>
  );
};

export default ExactIncidentSidebar;
