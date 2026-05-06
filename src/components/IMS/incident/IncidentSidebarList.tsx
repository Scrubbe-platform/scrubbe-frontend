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
        ? "border-green-400 text-green-400 bg-green-400/5 shadow-[0_0_10px_rgba(34,211,238,0.1)]"
        : "border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20"
    }`}
  >
    {label}
  </button>
);

const StatusBadge = ({ status }: { status: IncidentSidebarStatus }) => {
  const styles: Record<IncidentSidebarStatus, string> = {
    Investigating: "border-amber-500/50 text-amber-500 bg-amber-500/5",
    Proposed: "border-blue-500/50 text-blue-400 bg-blue-500/5",
    Detected: "border-green-500/50 text-green-400 bg-green-500/5",
    Approved: "border-emerald-500/50 text-emerald-500 bg-emerald-500/5",
    Enriched: "border-purple-500/50 text-purple-400 bg-purple-500/5",
    Analyzed: "border-indigo-500/50 text-indigo-400 bg-indigo-500/5",
    Executing: "border-yellow-500/50 text-yellow-500 bg-yellow-500/5",
    Resolved: "border-slate-500/50 text-slate-400 bg-slate-500/5",
    "Post-Mortem": "border-pink-500/50 text-pink-400 bg-pink-500/5",
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
        ? "border-green-400/60 bg-green-400/5 ring-1 ring-green-400/20 bg-darkEzra"
        : "border-white/5 hover:border-white/20"
    }`}
  >
    <div className="flex justify-between items-start mb-3">
      <div className="px-2 py-0.5 rounded border border-red-500/40 text-[10px] font-black text-red-500 bg-red-500/5">
        {incident.severity}
      </div>
      <StatusBadge status={incident.sidebarStatus} />
    </div>

    <div className="mb-2">
      <span className="text-[10px] font-mono text-slate-600 block mb-1 uppercase tracking-widest">
        {incident.ticketId}
      </span>
      <h3 className="text-[13px] font-semibold text-green-400 group-hover:text-green-300 leading-snug line-clamp-2">
        {incident.title}
      </h3>
    </div>

    <div className="text-[10px] text-slate-500 mb-4 font-medium">
      {incident.service} · {incident.region} · {incident.elapsedLabel}
    </div>

    <div className="flex gap-1">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-sm transition-all duration-700 ${
            i + 1 <= incident.stageProgress
              ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
              : "bg-white/5"
          }`}
        />
      ))}
    </div>
  </div>
);

const ExactIncidentSidebar: React.FC = () => {
  const { data, isLoading } = useIncidentList();
  const { incidentId: activeId, setSelectedIncident } = useIncidentSelection();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<
    "all" | "p1" | "p23" | "resolved" | "auto" | "manual"
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
        : filter === "p1"
        ? incident.severity === "P1"
        : filter === "p23"
        ? incident.severity === "P2" || incident.severity === "P3"
        : filter === "resolved"
        ? incident.sidebarStatus === "Resolved" || incident.status === "RESOLVED"
        : filter === "auto"
        ? incident.sourceType.toLowerCase() !== "manual"
        : incident.sourceType.toLowerCase() === "manual";

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full h-screen md:border-r border-white/5 flex flex-col p-3 md:p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="font-semibold text-white">
            Incidents {incidents.length > 0 ? `(${incidents.length})` : ""}
          </p>
        </div>
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="px-5 py-2 border border-IMSCyan text-IMSCyan rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-green-400/5 transition-all"
        >
          Raise an Incident
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <FilterPill label="All" active={filter === "all"} onClick={() => setFilter("all")} />
        <FilterPill label="P1" active={filter === "p1"} onClick={() => setFilter("p1")} />
        <FilterPill label="P2-P3" active={filter === "p23"} onClick={() => setFilter("p23")} />
        <FilterPill
          label="Resolved"
          active={filter === "resolved"}
          onClick={() => setFilter("resolved")}
        />
        <FilterPill label="Auto" active={filter === "auto"} onClick={() => setFilter("auto")} />
        <FilterPill
          label="Manual"
          active={filter === "manual"}
          onClick={() => setFilter("manual")}
        />
      </div>

      <div className="relative mb-8">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
          size={14}
        />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search incidents, services, ID"
          className="w-full bg-white/[0.02] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-xs text-slate-300 focus:outline-none focus:border-green-400/40 transition-all placeholder:text-slate-600 font-medium"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="mb-3 h-32 rounded-xl border border-white/5 bg-white/[0.03]"
            />
          ))
        ) : filteredIncidents.length > 0 ? (
          filteredIncidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onClick={() => setSelectedIncident(incident.id)}
              isActive={activeId === incident.id || activeId === incident.ticketId}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-slate-400">
            No incidents matched this filter.
          </div>
        )}
      </div>

      {open ? <RaiseIncidentModal onClose={() => setOpen(false)} /> : null}
    </div>
  );
};

export default ExactIncidentSidebar;
