"use client";
import React, { useState } from "react";
import {
  Filter,
  ListFilter,
  PlusIcon,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import RaiseIncidentModal from "./IncidentForm";
import { useIncidentList } from "@/hooks/useIncidentList";
import { useIncidentSelection } from "@/hooks/useIncidentSelection";
import {
  IncidentListItem,
  IncidentSidebarStatus,
} from "@/lib/incident/incident.types";
import IncidentFilterPanel, { IncidentFilters } from "./IncidentFilterPanel";
import Button from "@/components/ui/Button1";
import Dropdown from "@/components/ui/Dropdown";

// ── Severity badge ────────────────────────────────────────────────

const SEVERITY_STYLES: Record<string, string> = {
  P0: "border-red-600/60    text-red-600    dark:text-red-400    bg-red-600/8",
  P1: "border-orange-500/60 text-orange-600 dark:text-orange-400 bg-orange-500/8",
  P2: "border-amber-500/60  text-amber-600  dark:text-amber-400  bg-amber-500/8",
  P3: "border-yellow-500/60 text-yellow-600 dark:text-yellow-400 bg-yellow-500/8",
  P4: "border-sky-500/60    text-sky-600    dark:text-sky-400    bg-sky-500/8",
};

const SeverityBadge = ({ severity }: { severity: string }) => (
  <div
    className={`px-2 py-0.5 rounded border text-[10px] font-black ${SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.P4}`}
  >
    {severity}
  </div>
);

// ── Status badge ──────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: IncidentSidebarStatus }) => {
  const styles: Record<IncidentSidebarStatus, string> = {
    Investigating:
      "border-amber-500/50  text-amber-600  dark:text-amber-500  bg-amber-500/5",
    Proposed:
      "border-blue-500/50   text-blue-600   dark:text-blue-400   bg-blue-500/5",
    Detected:
      "border-green-500/50  text-green-600  dark:text-green-400  bg-green-500/5",
    Approved:
      "border-emerald-500/50 text-emerald-600 dark:text-emerald-500 bg-emerald-500/5",
    Enriched:
      "border-purple-500/50 text-purple-600  dark:text-purple-400 bg-purple-500/5",
    Analyzed:
      "border-indigo-500/50 text-indigo-600  dark:text-indigo-400 bg-indigo-500/5",
    Executing:
      "border-yellow-500/50 text-yellow-600  dark:text-yellow-500 bg-yellow-500/5",
    Resolved:
      "border-slate-400/50  text-slate-500   dark:text-slate-400  bg-slate-500/5",
    "Post-Mortem":
      "border-pink-500/50   text-pink-600    dark:text-pink-400   bg-pink-500/5",
  };
  return (
    <span
      className={`text-[9px] px-2 py-0.5 rounded border font-black uppercase tracking-tighter ${styles[status]}`}
    >
      {status}
    </span>
  );
};

// ── Progress bar ──────────────────────────────────────────────────

const PROGRESS_COLOR: Record<string, string> = {
  P0: "bg-red-500    shadow-[0_0_8px_rgba(239,68,68,0.6)]",
  P1: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]",
  P2: "bg-amber-500  shadow-[0_0_8px_rgba(245,158,11,0.5)]",
  P3: "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]",
  P4: "bg-sky-500    shadow-[0_0_8px_rgba(14,165,233,0.4)]",
};

// ── Filter pill ───────────────────────────────────────────────────

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
    className={`px-3 py-1 rounded-md border text-[11px] font-bold uppercase tracking-wider transition-all ${
      active
        ? "border-green-500 text-green-600 dark:text-green-400 bg-green-500/5"
        : "border-zinc-200 dark:border-white/10 text-black dark:text-slate-500 hover:text-zinc-600 dark:hover:text-slate-300 hover:border-zinc-300 dark:hover:border-white/20"
    }`}
  >
    {label}
  </button>
);

// ── Incident card ─────────────────────────────────────────────────

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
      <SeverityBadge severity={incident.severity} />
      <StatusBadge status={incident.sidebarStatus} />
    </div>
    <div className="mb-2">
      <span className="text-[10px] font-mono text-black dark:text-slate-600 block mb-1 uppercase tracking-widest">
        {incident.ticketId}
      </span>
      <h3 className="text-[13px] font-semibold dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 leading-snug line-clamp-2">
        {incident.title}
      </h3>
    </div>
    <div className="text-[10px] text-black dark:text-slate-500 mb-4 font-medium">
      {incident.service} · {incident.region} · {incident.elapsedLabel}
    </div>
    <div className="flex gap-1">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-sm transition-all duration-700 ${
            i + 1 <= Math.round((incident.progressPercentage / 100) * 8)
              ? (PROGRESS_COLOR[incident.severity] ?? PROGRESS_COLOR.P4)
              : "bg-zinc-100 dark:bg-white/5"
          }`}
        />
      ))}
    </div>
  </div>
);

// ── Sidebar ───────────────────────────────────────────────────────

export const ExactIncidentSidebar: React.FC = () => {
  const { data, isLoading } = useIncidentList();
  const { incidentId: activeId, setSelectedIncident } = useIncidentSelection();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<IncidentFilters | null>(
    null,
  );
  const [filter, setFilter] = useState<"all" | "p0" | "p1" | "p2" | "p3">(
    "all",
  );
  const [type, setType] = useState<"all" | "auto" | "manual">("all");
  const [status, setStatus] = useState("all");
  const incidents = data?.incidents ?? [];
  const normalizedQuery = query.trim().toLowerCase();

  // Count active advanced filters
  const advancedFilterCount = activeFilters
    ? [
        activeFilters.priorities.length > 0,
        activeFilters.incidentId.trim() !== "",
        activeFilters.titleQuery.trim() !== "",
        activeFilters.dateFrom !== null || activeFilters.dateTo !== null,
      ].filter(Boolean).length
    : 0;

  const filteredIncidents = incidents.filter((incident) => {
    // Text search
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

    // Quick filter pills
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

    // Advanced filters
    if (activeFilters) {
      if (
        activeFilters.priorities.length > 0 &&
        !activeFilters.priorities.includes(incident.severity)
      )
        return false;
      if (
        activeFilters.incidentId.trim() &&
        !incident.ticketId
          .toLowerCase()
          .includes(activeFilters.incidentId.trim().toLowerCase())
      )
        return false;
      if (
        activeFilters.titleQuery.trim() &&
        !incident.title
          .toLowerCase()
          .includes(activeFilters.titleQuery.trim().toLowerCase())
      )
        return false;
      if (activeFilters.dateFrom || activeFilters.dateTo) {
        const created = new Date(incident.createdAt ?? "");
        if (activeFilters.dateFrom && created < activeFilters.dateFrom)
          return false;
        if (activeFilters.dateTo) {
          const end = new Date(activeFilters.dateTo);
          end.setHours(23, 59, 59);
          if (created > end) return false;
        }
      }
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full h-screen md:border-r border-zinc-500 dark:border-white/5 flex flex-col overflow-hidden bg-white dark:bg-transparent">
      {/* ── Filter panel — fixed overlay so it never gets clipped ── */}
      {filterOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[40] bg-transparent"
            onClick={() => setFilterOpen(false)}
          />
          {/* Panel — fixed to viewport, left-aligned with sidebar */}
          <div className="fixed top-0 left-0 h-full z-[41] flex items-start pt-4 pl-2 pr-2 pointer-events-none">
            <div className="pointer-events-auto w-full md:w-[600px] lg:w-[900px] h-[80vh] max-h-[95vh] overflow-y-auto">
              <IncidentFilterPanel
                incidents={incidents}
                onApply={(f) => {
                  setActiveFilters(f);
                  setFilterOpen(false);
                }}
                onCancel={() => setFilterOpen(false)}
              />
            </div>
          </div>
        </>
      )}

      <div className="p-3 md:p-6 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <p className="font-semibold text-black dark:text-white">
            Incidents {incidents.length > 0 ? `(${incidents.length})` : ""}
          </p>
          <Button
            onClick={() => setOpen((prev) => !prev)}
            variant="solid"
            size="sm"
            leftIcon={<PlusIcon size={16} />}
          >
            Raise Incident
          </Button>
        </div>

        {/* Quick filter pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Dropdown
            items={[
              { label: "All", value: "all" },
              { label: "P0", value: "p0" },
              { label: "P1", value: "p1" },
              { label: "P2", value: "p2" },
              { label: "P3", value: "p3" },
            ]}
            trigger={
              <Button
                variant="outline-dark"
                size="sm"
                className=" capitalize"
                rightIcon={<ListFilter size={14} />}
              >
                {filter == "all" ? "Priority" : filter}
              </Button>
            }
            defaultValue="all"
            onChange={(value, _) => setFilter(value as any)}
          />

          <Dropdown
            items={[
              { label: "All", value: "all" },
              { label: "Auto", value: "auto" },
              { label: "Manual", value: "manual" },
            ]}
            trigger={
              <Button
                variant="outline-dark"
                size="sm"
                className=" capitalize"
                rightIcon={<ListFilter size={14} />}
              >
                {type === "all" ? "Type" : type}
              </Button>
            }
            defaultValue="all"
            onChange={(value, _) => setType(value as any)}
          />
          <Dropdown
            items={[
              { label: "All", value: "all" },
              { label: "Open", value: "Open" },
              { label: "Investigation", value: "Investigation" },
              { label: "Diagnosed", value: "Diagnosed" },
              { label: "Remediating", value: "Remediating" },
              { label: "Monitoring", value: "Monitoring" },
              { label: "Review", value: "Review" },
              { label: "Resolved", value: "Resolved" },
              { label: "Closed", value: "Closed" },
            ]}
            trigger={
              <Button
                variant="outline-dark"
                size="sm"
                className=" capitalize"
                rightIcon={<ListFilter size={14} />}
              >
                {status == "all" ? "Status" : status}
              </Button>
            }
            defaultValue="all"
            onChange={(value, _) => setStatus(value as any)}
          />
        </div>

        {/* Search + filter button */}
        <div className="flex items-center gap-2 mb-5">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-slate-600"
              size={14}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search incidents, services, ID"
              className="w-full bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-black dark:text-slate-300 focus:outline-none focus:border-green-500/40 dark:focus:border-green-400/40 transition-all placeholder:text-zinc-400 dark:placeholder:text-slate-600 font-medium"
            />
          </div>

          {/* Filter button */}
          <button
            onClick={() => setFilterOpen((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg border text-[12px] font-semibold transition-all shrink-0 ${
              filterOpen || advancedFilterCount > 0
                ? "border-violet-500 text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10"
                : "border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-slate-400 hover:border-zinc-300 dark:hover:border-white/20"
            }`}
          >
            <SlidersHorizontal size={14} />
            {advancedFilterCount > 0 && (
              <span className="text-[11px] font-bold bg-violet-600 text-white rounded-full px-1.5 py-0.5 leading-none">
                {advancedFilterCount}
              </span>
            )}
          </button>

          {/* Clear advanced filters */}
          {advancedFilterCount > 0 && (
            <button
              onClick={() => setActiveFilters(null)}
              className="p-2.5 rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-400 hover:text-red-500 hover:border-red-300 dark:hover:border-red-500/30 transition-colors shrink-0"
              title="Clear advanced filters"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Active filter summary chips */}
        {activeFilters && advancedFilterCount > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {activeFilters.priorities.map((p) => (
              <span
                key={p}
                className="flex items-center gap-1 text-[11px] font-medium bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 text-violet-700 dark:text-violet-400 rounded-full px-2.5 py-0.5"
              >
                {p}
                <button
                  onClick={() =>
                    setActiveFilters((f) =>
                      f
                        ? {
                            ...f,
                            priorities: f.priorities.filter((x) => x !== p),
                          }
                        : null,
                    )
                  }
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            {activeFilters.incidentId && (
              <span className="flex items-center gap-1 text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full px-2.5 py-0.5">
                #{activeFilters.incidentId}
                <button
                  onClick={() =>
                    setActiveFilters((f) =>
                      f ? { ...f, incidentId: "" } : null,
                    )
                  }
                >
                  <X size={10} />
                </button>
              </span>
            )}
            {activeFilters.titleQuery && (
              <span className="flex items-center gap-1 text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full px-2.5 py-0.5">
                {activeFilters.titleQuery.slice(0, 20)}
                {activeFilters.titleQuery.length > 20 ? "…" : ""}
                <button
                  onClick={() =>
                    setActiveFilters((f) =>
                      f ? { ...f, titleQuery: "" } : null,
                    )
                  }
                >
                  <X size={10} />
                </button>
              </span>
            )}
            {(activeFilters.dateFrom || activeFilters.dateTo) && (
              <span className="flex items-center gap-1 text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full px-2.5 py-0.5">
                {activeFilters.dateFrom?.toLocaleDateString() ?? "?"} –{" "}
                {activeFilters.dateTo?.toLocaleDateString() ?? "?"}
                <button
                  onClick={() =>
                    setActiveFilters((f) =>
                      f ? { ...f, dateFrom: null, dateTo: null } : null,
                    )
                  }
                >
                  <X size={10} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Incident list */}
        <div className="flex-1 overflow-y-auto space-y-1 no-scrollbar">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="mb-3 h-32 rounded-xl border border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.03] animate-pulse"
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
            <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] p-5 text-sm text-black dark:text-slate-400">
              No incidents matched this filter.
            </div>
          )}
        </div>
      </div>

      {open && <RaiseIncidentModal onClose={() => setOpen(false)} />}
    </div>
  );
};

export default ExactIncidentSidebar;
