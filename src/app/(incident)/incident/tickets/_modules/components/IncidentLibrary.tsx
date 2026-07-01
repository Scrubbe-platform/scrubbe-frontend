// app/incidents/library/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  Layers,
  Download,
  BarChart3,
  Sparkles,
  RefreshCw,
  X,
  FileText,
  Check,
  Trash2,
  ShieldAlert,
  Plus,
} from "lucide-react";
import { IncidentListItem } from "@/lib/incident/incident.types";

// Import modular layouts compiled below
import KpiStrip from "./KpiStrip";
import FilterRail from "./FilterRail";
import BulkActionBar from "./BulkActionBar";
import {
  ReplayModal,
  CompareModal,
  TrendsModal,
  DocGenModal,
  PlaybookModal,
} from "./LibraryModals";
import Button from "@/components/ui/Button1";
import { useIncidentList } from "@/hooks/useIncidentList";
import { TICKET_STATUS_CONFIG } from "@/components/IMS/incident/IncidentLifecycle";
import Dropdown from "@/components/ui/Dropdown";
import { BsThreeDotsVertical } from "react-icons/bs";
import IncidentContextDetails from "./IncidentContextDetails";

export const priColors: { [key: string]: string } = {
  CRITICAL: "text-red-600 bg-red-50 border-red-100",
  HIGH: "text-amber-600 bg-amber-50 border-amber-100",
  MEDIUM: "text-blue-600 bg-blue-50 border-blue-100",
  LOW: "text-zinc-500 bg-zinc-50 border-zinc-100",
};
export const priText: { [key: string]: string } = {
  CRITICAL: "P0",
  HIGH: "P1",
  MEDIUM: "P2",
  LOW: "P3",
};
export default function IncidentLibraryPage() {
  // 1. Core State Handlers
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("opened-desc");
  const [density, setDensity] = useState<"comfortable" | "compact">(
    "comfortable",
  );
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const { data, isLoading } = useIncidentList();
  const incidents = data?.incidents ?? [];
  // 2. Selection & Filter Toggles
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: new Set<string>(),
    priority: new Set<string>(),
    environment: new Set<string>(),
    service: new Set<string>(),
  });

  // 3. Modals Visibility State Machine
  const [activeModal, setActiveModal] = useState<{
    type: "replay" | "compare" | "trends" | "doc" | "playbook" | null;
    kind?: "rca" | "report" | "exec";
    payload?: any;
  }>({ type: null });

  // Filter Evaluation Pipeline Loop
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter((i) => {
        const matchesSearch =
          i.id.toLowerCase().includes(search.toLowerCase()) ||
          i.title.toLowerCase().includes(search.toLowerCase()) ||
          i.service.toLowerCase().includes(search.toLowerCase()) ||
          i.incidentCommander.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
          filters.status.size === 0 || filters.status.has(i.status);
        const matchesPriority =
          filters.priority.size === 0 || filters.priority.has(i.priority);
        const matchesEnv =
          filters.environment.size === 0 ||
          filters.environment.has(i.environment);
        const matchesService =
          filters.service.size === 0 || filters.service.has(i.service);

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPriority &&
          matchesEnv &&
          matchesService
        );
      })
      .sort((a, b) => {
        if (sort === "opened-desc")
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        if (sort === "opened-asc")
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        if (sort === "duration-desc") return b.MTTR - a.MTTR;
        if (sort === "priority-asc")
          return a.priority.localeCompare(b.priority);
        return 0;
      });
  }, [incidents, search, sort, filters]);

  // Pagination bounds math
  const totalPages = Math.max(
    1,
    Math.ceil(filteredIncidents.length / pageSize),
  );
  const paginatedIncidents = filteredIncidents.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const handleToggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
    setActiveId(id);
  };

  const handleSelectAllRows = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedIncidents.map((i) => i.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const clearAllFilters = () => {
    setFilters({
      status: new Set(),
      priority: new Set(),
      environment: new Set(),
      service: new Set(),
    });
    setSearch("");
  };

  const selectedIncident = useMemo(
    () => incidents.find((i) => i.id === activeId) || null,
    [incidents, activeId],
  );

  return (
    <main className="p-4 sm:p-6 pb-24 max-w-[1600px] mx-auto space-y-6 font-sans">
      {/* Page Title Context Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 ">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-zinc-900">
            Incident Library
          </h1>
          <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
            Your organization's searchable operational memory for every
            incident, investigation, and resolution.
          </p>
        </div>

        <Button
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={() => alert("Raise Incident")}
        >
          Raise Incident
        </Button>
      </div>

      {/* 1. Metrics KPI Strip subcomponent */}
      <KpiStrip
        incidents={incidents}
        onKpiFilter={(p) =>
          setFilters((prev) => ({ ...prev, priority: new Set([p]) }))
        }
      />

      {/* 2. Toolbar Operations Block */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Search Suggestion Section */}
        <div className="lg:col-span-8 space-y-2">
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by instance identifier key, service parameter, engineer, or deployment tags..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full h-[36px] pl-11 pr-4 rounded-sm text-xs border border-zinc-200 text-zinc-900 outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-500">
            <span>Try lookups:</span>
            {[
              "payments failure",
              "Kubernetes pod crash",
              "Database latency",
            ].map((tag) => (
              <button
                key={tag}
                onClick={() => setSearch(tag)}
                className="px-2 py-0.5 rounded border border-zinc-200 bg-gray-50 hover:text-IMSDarkGreen hover:border-IMSDarkGreen transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 lg:col-span-4 justify-end">
          <Button
            leftIcon={<BarChart3 size={14} />}
            onClick={() => setActiveModal({ type: "trends" })}
            size="sm"
            variant="outline-dark"
            className="h-fit text-sm"
          >
            Trends
          </Button>
          <Button
            leftIcon={<Download size={14} />}
            onClick={() => alert("CSV Export complete.")}
            size="sm"
            variant="outline-dark"
            className="h-fit text-sm"
          >
            Export
          </Button>
        </div>

        {/* Ezra Semantic Engine Widget Container */}
      </div>

      {/* 3. Core Workspace Matrix Split Panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Filter Rails Sidebar controls */}
        <div className="lg:col-span-2">
          <FilterRail
            filters={filters}
            onFilterChange={setFilters}
            onClear={clearAllFilters}
            dataList={incidents}
          />
        </div>

        {/* Center Canvas Area: Main Datagrid Panel */}
        <div className="col-span-12 lg:col-span-7  bg-white border border-zinc-200 rounded-md shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between px-4 h-11 border-b border-zinc-100">
            <div className="text-xs font-bold ">
              Incident List{" "}
              {/* <span className="text-zinc-400 font-mono font-medium ml-1">
                ({filteredIncidents.length} match filters)
              </span> */}
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              {/* <div className="flex items-center gap-1 border border-zinc-200 bg-white rounded-lg px-2 h-7">
                <span className="text-zinc-400">Density:</span>
                <button
                  onClick={() => setDensity("comfortable")}
                  className={`px-1.5 py-0.5 rounded ${density === "comfortable" ? "bg-zinc-900 text-white" : "text-zinc-600"}`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setDensity("compact")}
                  className={`px-1.5 py-0.5 rounded ${density === "compact" ? "bg-zinc-900 text-white" : "text-zinc-600"}`}
                >
                  Compact
                </button>
              </div> */}
              <span className="text-xs opacity-60">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-7 rounded-lg px-2 bg-white outline-none cursor-pointer"
              >
                <option value="opened-desc">Newest First</option>
                <option value="opened-asc">Oldest First</option>
                <option value="duration-desc">MTTR Duration</option>
                <option value="priority-asc">Priority (P0-P3)</option>
              </select>
            </div>
          </div>

          {/* Datagrid content tables matrix */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[900px]">
              <thead className="border-b border-zinc-100 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                <tr>
                  <th className="p-3 w-10">
                    <input
                      type="checkbox"
                      onChange={(e) => handleSelectAllRows(e.target.checked)}
                      checked={
                        paginatedIncidents.length > 0 &&
                        paginatedIncidents.every((i) => selectedIds.has(i.id))
                      }
                      className="accent-indigo-600 h-3.5 w-3.5"
                    />
                  </th>
                  <th className="p-3 w-32">Incident</th>
                  <th className="p-3">Title</th>
                  <th className="p-3 w-20">Pri</th>
                  <th className="p-3 w-28">Status</th>
                  <th className="p-3 w-32">Service</th>
                  <th className="p-3 w-36">Opened</th>
                  <th className="p-3 w-24">Owner</th>
                  <th className="p-3 w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800">
                {paginatedIncidents.map((i) => {
                  const isChecked = selectedIds.has(i.id);

                  const statusDots =
                    TICKET_STATUS_CONFIG.find((s) => s.label === i.status)
                      ?.dotColor || "bg-zinc-400";

                  return (
                    <tr
                      key={i.id}
                      onClick={() => setActiveId(i.id)}
                      className={`hover:bg-zinc-50/50 cursor-pointer group transition-colors ${isChecked ? "bg-indigo-50/30" : ""}`}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectRow(i.id)}
                          className="accent-indigo-600 h-3.5 w-3.5"
                        />
                      </td>
                      <td className="p-3 font-mono font-bold text-zinc-900 flex items-center gap-1.5">
                        {i?.ticketId}{" "}
                      </td>
                      <td
                        className={`p-3 max-w-xs ${density === "compact" ? "py-1.5" : "py-3.5"}`}
                      >
                        <div className="font-semibold text-zinc-900 truncate">
                          {i.title}
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 border rounded-md text-[10.5px] font-bold ${priColors[i.priority]}`}
                        >
                          {priText[i.priority] || i.priority}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-zinc-700">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusDots}`}
                          />
                          {i.status}
                        </span>
                      </td>
                      <td className="p-3 text-zinc-500 font-medium">
                        {i.service}
                      </td>
                      <td className="p-3 text-zinc-400 tnum font-medium">
                        {new Date(i.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-3 capitalize text-nowrap">
                        {i.assignedToName}
                      </td>
                      <td
                        className="p-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Dropdown
                          position="left"
                          showSelectedIcon={false}
                          trigger={
                            <div>
                              <BsThreeDotsVertical
                                size={14}
                                className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer ml-3"
                              />
                            </div>
                          }
                          items={[
                            {
                              label: "Replay",
                              value: "replay",
                              onClick: () =>
                                setActiveModal({ type: "replay", payload: i }),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Fallback state display */}
          {filteredIncidents.length === 0 && (
            <div className="p-12 text-center text-sm text-zinc-400 italic border-t border-zinc-100">
              No telemetry log entries found matching criteria parameters.
            </div>
          )}

          {/* Pagination Toolbar Row controls */}
          <div className="h-11 px-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400 bg-zinc-50/50">
            <span className="font-medium font-mono">
              Showing{" "}
              {Math.min(filteredIncidents.length, (page - 1) * pageSize + 1)}-
              {Math.min(filteredIncidents.length, page * pageSize)} of{" "}
              {filteredIncidents.length} entries
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-7 px-2.5 rounded-md border bg-white enabled:hover:bg-zinc-50 disabled:opacity-40 transition-colors font-semibold text-zinc-700"
              >
                Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-7 px-2.5 rounded-md border bg-white enabled:hover:bg-zinc-50 disabled:opacity-40 transition-colors font-semibold text-zinc-700"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className=" lg:col-span-3 space-y-4">
          <div className="lg:col-span-4 bg-indigo-50/60 border border-indigo-100 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-[9px] font-medium text-indigo-900 uppercase">
              <span className="flex items-center text-indigo-600 gap-1.5">
                <Sparkles size={13} className="" /> Ask Ezra AI
              </span>
              <span className="font-mono text-[7px] text-indigo-400">
                Semantic
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[9px] text-zinc-600">
              <button
                type="button"
                onClick={() => {
                  if (selectedIds.size === 0)
                    return alert("Select a row item first.");
                  setActiveModal({
                    type: "compare",
                    payload: Array.from(selectedIds).slice(0, 2),
                  });
                }}
                className="w-full text-left p-1.5 bg-white rounded border border-indigo-100 hover:border-indigo-300 transition-all truncate"
              >
                "Find duplicates side-by-side"
              </button>
              <button
                type="button"
                onClick={() => setSearch("Database")}
                className="w-full text-left p-1.5 bg-white rounded border border-indigo-100 hover:border-indigo-300 transition-all truncate"
              >
                Show DB Outages
              </button>
            </div>
          </div>
          <IncidentContextDetails incident={selectedIncident} />
        </div>
      </div>

      {/* Floating Action toolbar bar dock row */}
      <BulkActionBar
        selectedIds={selectedIds}
        onClear={() => setSelectedIds(new Set())}
        onTriggerDoc={(kind) =>
          setActiveModal({
            type: "doc",
            kind,
            payload: Array.from(selectedIds),
          })
        }
        onTriggerCompare={() =>
          setActiveModal({
            type: "compare",
            payload: Array.from(selectedIds).slice(0, 2),
          })
        }
      />

      {/* Modals Mounting Injection Registry hooks */}
      <ReplayModal
        isOpen={activeModal.type === "replay"}
        incident={activeModal.payload}
        onClose={() => setActiveModal({ type: null })}
        onOpenPlaybook={(i) => setActiveModal({ type: "playbook", payload: i })}
      />
      <CompareModal
        isOpen={activeModal.type === "compare"}
        incidentIds={activeModal.payload}
        allData={incidents}
        onClose={() => setActiveModal({ type: null })}
      />
      <TrendsModal
        isOpen={activeModal.type === "trends"}
        allData={incidents}
        onClose={() => setActiveModal({ type: null })}
      />
      <DocGenModal
        isOpen={activeModal.type === "doc"}
        kind={activeModal.kind}
        incidentIds={activeModal.payload}
        allData={incidents}
        onClose={() => setActiveModal({ type: null })}
      />
      <PlaybookModal
        isOpen={activeModal.type === "playbook"}
        incident={activeModal.payload}
        onClose={() => setActiveModal({ type: null })}
      />
    </main>
  );
}
