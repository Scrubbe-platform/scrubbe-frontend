// app/incidents/library/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Download,
  BarChart3,
  Sparkles,
  Plus,
  SlidersHorizontal,
  X,
  Compass,
} from "lucide-react";
import type { Step } from "react-joyride";
import ProductTour from "@/components/ui/ProductTour";
import { IncidentListItem } from "@/lib/incident/incident.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteIncident } from "@/lib/incident/incident.api";
import { querykeys } from "@/lib/constant";
import toast from "react-hot-toast";

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
import MergeModal from "./MergeModal";
import Button from "@/components/ui/Button1";
import { useIncidentList } from "@/hooks/useIncidentList";
import { TICKET_STATUS_CONFIG } from "@/components/IMS/incident/IncidentLifecycle";
import Dropdown from "@/components/ui/Dropdown";
import { BsThreeDotsVertical } from "react-icons/bs";
import IncidentContextDetails from "./IncidentContextDetails";
import { useRouter } from "next/navigation";
import AssignModal from "./AssignModal";

export const priColors: { [key: string]: string } = {
  P0: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20",
  P1: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20",
  P2: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20",
  P3: "text-green-500 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20",
};

type FilterKey =
  | "status"
  | "severity"
  | "environment"
  | "service"
  | "rootCause"
  | "incidentType"
  | "warRoom"
  | "codeEngine";

type ModalType =
  | "replay"
  | "compare"
  | "trends"
  | "doc"
  | "playbook"
  | "assign"
  | "merge"
  | null;

const EMPTY_FILTERS = (): Record<FilterKey, Set<string>> => ({
  status: new Set(),
  severity: new Set(),
  environment: new Set(),
  service: new Set(),
  rootCause: new Set(),
  incidentType: new Set(),
  warRoom: new Set(),
  codeEngine: new Set(),
});

function applyDateRange(date: Date, range: string | null): boolean {
  if (!range) return true;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === "Today") return date >= today;
  if (range === "Yesterday") {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return date >= yesterday && date < today;
  }
  if (range === "Last 7 days") {
    const d = new Date(now);
    d.setDate(now.getDate() - 7);
    return date >= d;
  }
  if (range === "Last 30 days") {
    const d = new Date(now);
    d.setDate(now.getDate() - 30);
    return date >= d;
  }
  return true;
}

const TOUR_STEPS: Step[] = [
  {
    target: "[data-tour='kpi-strip']",
    title: "Your incident health, at a glance",
    content:
      "Live counts by severity and status. Click any tile to filter the list below to just those incidents.",
    skipBeacon: true,
    placement: "bottom",
  },
  {
    target: "[data-tour='search']",
    title: "Search everything",
    content:
      "Find an incident by ID, title, affected service, or the commander who ran it.",
    placement: "bottom",
  },
  {
    target: "[data-tour='filter-rail']",
    title: "Narrow it down",
    content:
      "Filter by status, severity, environment, service, and more — combine as many as you need.",
    placement: "right",
  },
  {
    target: "[data-tour='ask-ezra']",
    title: "Ask Ezra",
    content:
      "Scrubbe's AI can find duplicates, surface patterns, and answer questions across your incident history.",
    placement: "bottom",
  },
  {
    target: "[data-tour='incident-table']",
    title: "Every incident lives here",
    content: "Click any row to open the full investigation.",
    placement: "top",
  },
  {
    target: "[data-tour='raise-incident']",
    title: "Ready to raise one?",
    content: "Start a new incident here whenever something needs attention.",
    placement: "bottom",
  },
];

export default function IncidentLibraryPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("opened-desc");
  const [density] = useState<"comfortable" | "compact">("comfortable");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const { data, isLoading } = useIncidentList();
  const incidents = data?.incidents ?? [];
  const queryClient = useQueryClient();

  const archiveMutation = useMutation({
    mutationFn: (id: string) => deleteIncident(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [querykeys.INCIDENT_TICKET] });
      setSelectedIds(new Set());
      toast.success("Incident archived");
    },
    onError: () => toast.error("Failed to archive incident"),
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<string | null>(null);
  const [filters, setFilters] =
    useState<Record<FilterKey, Set<string>>>(EMPTY_FILTERS());
  const router = useRouter();

  const [activeModal, setActiveModal] = useState<{
    type: ModalType;
    kind?: "rca" | "report" | "exec";
    payload?: any;
  }>({ type: null });
  const [tourRunCount, setTourRunCount] = useState(0);

  // ── COMPLETE FILTER PIPELINE ─────────────────────────────────────────────
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter((i) => {
        // Text search
        const q = search.toLowerCase();
        const matchesSearch =
          !q ||
          (i.ticketId ?? i.id).toLowerCase().includes(q) ||
          i.title.toLowerCase().includes(q) ||
          i.service.toLowerCase().includes(q) ||
          i.incidentCommander.toLowerCase().includes(q) ||
          (i.assignedToName ?? "").toLowerCase().includes(q) ||
          (i.assignedToEmail ?? "").toLowerCase().includes(q);

        // Status (maps to i.status)
        const matchesStatus =
          filters.status.size === 0 || filters.status.has(i.status);

        // Priority/Severity (maps to i.severity — P0/P1/P2/P3)
        const matchesSeverity =
          filters.severity.size === 0 || filters.severity.has(i.severity);

        // Environment
        const matchesEnv =
          filters.environment.size === 0 ||
          filters.environment.has(i.environment);

        // Service
        const matchesService =
          filters.service.size === 0 || filters.service.has(i.service);

        // Root Cause → maps to i.reason
        const matchesRootCause =
          filters.rootCause.size === 0 || filters.rootCause.has(i.reason);

        // Incident Type → maps to i.sourceType
        const matchesIncidentType =
          filters.incidentType.size === 0 ||
          filters.incidentType.has(i.sourceType);

        // warRoom / codeEngine — no direct field yet; skip filtering to avoid false exclusions
        // (counts show 0 in FilterRail which is accurate)

        // Date range filter
        const matchesDate = applyDateRange(new Date(i.createdAt), dateRange);

        return (
          matchesSearch &&
          matchesStatus &&
          matchesSeverity &&
          matchesEnv &&
          matchesService &&
          matchesRootCause &&
          matchesIncidentType &&
          matchesDate
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
          return a.severity.localeCompare(b.severity);
        return 0;
      });
  }, [incidents, search, sort, filters, dateRange]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredIncidents.length / pageSize),
  );
  const paginatedIncidents = filteredIncidents.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const activeFilterCount =
    Object.values(filters).reduce((acc, s) => acc + s.size, 0) +
    (dateRange ? 1 : 0);

  // ── SELECTION ──────────────────────────────────────────────────────────────
  const handleToggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
    setActiveId(id);
  };

  const handleSelectAllRows = (checked: boolean) => {
    setSelectedIds(
      checked ? new Set(paginatedIncidents.map((i) => i.id)) : new Set(),
    );
  };

  const clearAllFilters = () => {
    setFilters(EMPTY_FILTERS());
    setDateRange(null);
    setSearch("");
  };

  const selectedIncident = useMemo(
    () => incidents.find((i) => i.id === activeId) || null,
    [incidents, activeId],
  );

  // ── CSV EXPORT ─────────────────────────────────────────────────────────────
  const handleDownloadCSV = (records: IncidentListItem[]) => {
    const headers = [
      "ID",
      "Ticket ID",
      "Title",
      "Summary",
      "Reason",
      "Description",
      "Service",
      "Region",
      "Environment",
      "Severity",
      "Priority",
      "Status",
      "State",
      "Source",
      "Source Type",
      "Assigned To (Email)",
      "Assigned To (Name)",
      "Incident Commander",
      "Owning Squad",
      "Created At",
      "Updated At",
      "Elapsed Label",
      "Elapsed Minutes",
      "MTTR",
      "Comments Count",
      "Recommended Actions",
    ];
    const escape = (val: unknown) => {
      const str = val == null ? "" : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    };
    const rows = records.map((i) => [
      escape(i.id),
      escape(i.ticketId),
      escape(i.title),
      escape(i.summary),
      escape(i.reason),
      escape(i.description),
      escape(i.service),
      escape(i.region),
      escape(i.environment),
      escape(i.severity),
      escape(i.priority),
      escape(i.status),
      escape(i.state),
      escape(i.source),
      escape(i.sourceType),
      escape(i.assignedToEmail),
      escape(i.assignedToName),
      escape(i.incidentCommander),
      escape(i.owningSquad),
      escape(i.createdAt),
      escape(i.updatedAt),
      escape(i.elapsedLabel),
      escape(i.elapsedMinutes),
      escape(i.MTTR),
      escape(i.commentsCount),
      escape(i.recommendedActions?.join("; ")),
    ]);
    const csv = [
      headers.map(escape).join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `incidents-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSelected = () => {
    handleDownloadCSV(incidents.filter((i) => selectedIds.has(i.id)));
  };

  // ── BULK ACTIONS ───────────────────────────────────────────────────────────
  const handleArchive = () => {
    if (selectedIds.size === 0) return;
    if (
      !confirm(
        `Archive ${selectedIds.size} incident(s)? This cannot be undone.`,
      )
    )
      return;
    Promise.all(
      Array.from(selectedIds).map((id) => archiveMutation.mutateAsync(id)),
    ).catch(() => {});
  };

  const handleArchiveSingle = (id: string) => {
    if (!confirm("Archive this incident? This cannot be undone.")) return;
    archiveMutation.mutate(id);
  };

  return (
    <>
      <main className="p-4 sm:p-6 pb-24 max-w-[1600px] mx-auto space-y-6 font-ibm">
        {/* Page header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
            Your organization&apos;s searchable operational memory for every
            incident, investigation, and resolution.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTourRunCount((n) => n + 1)}
              title="Take a tour"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Compass size={15} />
            </button>
            <div data-tour="raise-incident">
              <Button
                size="sm"
                leftIcon={<Plus size={14} />}
                onClick={() => router.push("/incident/tickets/create")}
              >
                Raise Incident
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Strip */}
        <div data-tour="kpi-strip">
          <KpiStrip
            incidents={incidents}
            onKpiFilter={(p: any) =>
              setFilters((prev) => ({ ...prev, severity: new Set([p]) }))
            }
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3 flex-1 flex-wrap">
            {/* Search */}
            <div className="relative max-w-xl w-full" data-tour="search">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
                size={15}
              />
              <input
                type="text"
                placeholder="Search by ID, title, service, commander…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full h-[36px] pl-10 pr-4 rounded-sm text-xs shadow shadow-light text-zinc-900 dark:text-zinc-100 dark:bg-zinc-900/60 outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}{" "}
                  active
                </span>
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              leftIcon={<BarChart3 size={14} />}
              onClick={() => setActiveModal({ type: "trends" })}
              size="sm"
              variant="outline-dark"
              className="h-fit text-sm !rounded-sm font-thin"
            >
              Trends
            </Button>
            <Button
              leftIcon={<Download size={14} />}
              onClick={() => handleDownloadCSV(incidents)}
              size="sm"
              variant="outline-dark"
              className="h-fit text-sm !rounded-sm font-thin"
            >
              Export
            </Button>
            <Dropdown
              trigger={
                <Button
                  size="sm"
                  variant="outline-dark"
                  className="h-fit text-sm !rounded-sm font-thin"
                  data-tour="ask-ezra"
                >
                  Ask Ezra
                </Button>
              }
            >
              <div className="bg-indigo-50/60 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-lg p-3 space-y-2 w-64">
                <div className="flex items-center justify-between text-[9px] font-medium text-indigo-900 dark:text-indigo-300 uppercase">
                  <span className="flex items-center text-indigo-600 dark:text-indigo-400 gap-1.5">
                    <Sparkles size={13} /> Ask Ezra AI
                  </span>
                  <span className="font-ibm text-[7px] text-indigo-400">
                    Semantic
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[9px] text-zinc-600 dark:text-zinc-400">
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
                    className="w-full text-left p-1.5 bg-white dark:bg-zinc-900/60 rounded border border-indigo-100 dark:border-indigo-500/20 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all truncate"
                  >
                    &quot;Find duplicates side-by-side&quot;
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearch("Database")}
                    className="w-full text-left p-1.5 bg-white dark:bg-zinc-900/60 rounded border border-indigo-100 dark:border-indigo-500/20 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all truncate"
                  >
                    Show DB Outages
                  </button>
                </div>
              </div>
            </Dropdown>
          </div>
        </div>

        {/* Main split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Filter Rail */}
          <div className="lg:col-span-3" data-tour="filter-rail">
            <FilterRail
              filters={filters}
              onFilterChange={setFilters}
              onClear={clearAllFilters}
              dataList={incidents}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </div>

          {/* Incident table */}
          <div
            className="col-span-12 lg:col-span-9 bg-white dark:bg-zinc-900/40 z-0 shadow-sm shadow-light rounded-md overflow-hidden"
            data-tour="incident-table"
          >
            <div className="flex items-center justify-between px-4 h-11 border-b border-zinc-100 dark:border-zinc-800">
              <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Incident List
                {filteredIncidents.length !== incidents.length && (
                  <span className="ml-2 text-xs font-normal text-zinc-400 dark:text-zinc-500">
                    ({filteredIncidents.length} of {incidents.length})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="text-xs opacity-60">Sort</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-7 rounded-lg px-2 bg-white dark:bg-zinc-900 dark:text-zinc-200 outline-none cursor-pointer text-xs"
                >
                  <option value="opened-desc">Newest First</option>
                  <option value="opened-asc">Oldest First</option>
                  <option value="duration-desc">MTTR Duration</option>
                  <option value="priority-asc">Priority (P0–P3)</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[900px]">
                <thead className="border-b bg-zinc-50 dark:bg-zinc-800/60 border-zinc-100 dark:border-zinc-800 text-sm font-medium text-zinc-600 dark:text-zinc-400">
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
                    <th className="p-3 w-32">Incident ID</th>
                    <th className="p-3">Title</th>
                    <th className="p-3 w-20">Priority</th>
                    <th className="p-3 w-28">Status</th>
                    <th className="p-3 w-32">Service</th>
                    <th className="p-3 w-32">Assigned To</th>
                    <th className="p-3 w-28">Opened</th>
                    <th className="p-3 w-10">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-300">
                  {isLoading &&
                    Array.from({ length: 6 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="p-3">
                          <div className="h-3 w-3 bg-zinc-100 dark:bg-zinc-800 rounded" />
                        </td>
                        <td className="p-3">
                          <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800 rounded" />
                        </td>
                        <td className="p-3">
                          <div className="h-3 w-48 bg-zinc-100 dark:bg-zinc-800 rounded" />
                        </td>
                        <td className="p-3">
                          <div className="h-3 w-10 bg-zinc-100 dark:bg-zinc-800 rounded" />
                        </td>
                        <td className="p-3">
                          <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800 rounded" />
                        </td>
                        <td className="p-3">
                          <div className="h-3 w-24 bg-zinc-100 dark:bg-zinc-800 rounded" />
                        </td>
                        <td className="p-3">
                          <div className="h-3 w-28 bg-zinc-100 dark:bg-zinc-800 rounded" />
                        </td>
                        <td className="p-3">
                          <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800 rounded" />
                        </td>
                        <td className="p-3">
                          <div className="h-3 w-4 bg-zinc-100 dark:bg-zinc-800 rounded" />
                        </td>
                      </tr>
                    ))}

                  {!isLoading &&
                    paginatedIncidents.map((i) => {
                      const isChecked = selectedIds.has(i.id);
                      const status = TICKET_STATUS_CONFIG.find(
                        (s) => s.label === i.status,
                      );
                      return (
                        <tr
                          key={i.id}
                          onClick={() =>
                            router.push(`/incident/tickets/${i.id}`)
                          }
                          className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 cursor-pointer text-sm font-ibm text-zinc-600 dark:text-zinc-400 transition-colors ${isChecked ? "bg-indigo-50/30 dark:bg-indigo-500/10" : ""}`}
                        >
                          <td
                            className="p-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleSelectRow(i.id)}
                              className="accent-indigo-600 h-3.5 w-3.5"
                            />
                          </td>
                          <td className="p-3 font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            {i.ticketId ?? i.id}
                          </td>
                          <td
                            className={`p-3 max-w-xs ${density === "compact" ? "py-1.5" : "py-3.5"}`}
                          >
                            <div className="truncate text-sm">{i.title}</div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 border rounded-md text-[11px] font-semibold ${priColors[i.severity] ?? "text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 border-zinc-100 dark:border-zinc-700"}`}
                            >
                              {i.severity}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-sm px-2 py-0.5 capitalize ${status?.ribbonDone ?? ""}`}
                            >
                              {i.status.toLowerCase()}
                            </span>
                          </td>
                          <td className="p-3 text-sm">{i.service}</td>
                          <td className="p-3 text-sm truncate max-w-[120px]">
                            {i.assignedToName || i.assignedToEmail || (
                              <span className="text-zinc-300 dark:text-zinc-600 italic">
                                Unassigned
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-sm text-nowrap">
                            {new Date(i.createdAt).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td
                            className="p-3 text-center relative z-10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Dropdown
                              position="top"
                              showSelectedIcon={false}
                              trigger={
                                <div>
                                  <BsThreeDotsVertical
                                    size={14}
                                    className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
                                  />
                                </div>
                              }
                              items={[
                                {
                                  label: "Open incident",
                                  value: "open",
                                  onClick: () =>
                                    router.push(`/incident/tickets?id=${i.id}`),
                                },
                                {
                                  label: "Replay",
                                  value: "replay",
                                  onClick: () =>
                                    setActiveModal({
                                      type: "replay",
                                      payload: i,
                                    }),
                                },
                                {
                                  label: "Assign",
                                  value: "assign",
                                  onClick: () =>
                                    setActiveModal({
                                      type: "assign",
                                      payload: [i.id],
                                    }),
                                },
                                {
                                  label: "Generate RCA",
                                  value: "rca",
                                  onClick: () =>
                                    setActiveModal({
                                      type: "doc",
                                      kind: "rca",
                                      payload: [i.id],
                                    }),
                                },
                                {
                                  label: "Archive",
                                  value: "archive",
                                  onClick: () => handleArchiveSingle(i.id),
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

            {/* Empty state */}
            {!isLoading && filteredIncidents.length === 0 && (
              <div className="p-12 text-center text-sm text-zinc-400 dark:text-zinc-500 italic border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                <p>No incidents match the current filters.</p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            <div className="h-11 px-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-sm text-zinc-400 dark:text-zinc-500 bg-zinc-50/50 dark:bg-zinc-800/30">
              <span className="font-medium font-ibm text-xs">
                Showing{" "}
                {filteredIncidents.length === 0
                  ? 0
                  : Math.min(
                      filteredIncidents.length,
                      (page - 1) * pageSize + 1,
                    )}
                –{Math.min(filteredIncidents.length, page * pageSize)} of{" "}
                {filteredIncidents.length} entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-7 px-2.5 rounded-md border dark:border-zinc-700 bg-white dark:bg-zinc-900 enabled:hover:bg-zinc-50 dark:enabled:hover:bg-zinc-800 disabled:opacity-40 transition-colors font-semibold text-zinc-700 dark:text-zinc-300 text-xs"
                >
                  Prev
                </button>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 px-1">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-7 px-2.5 rounded-md border dark:border-zinc-700 bg-white dark:bg-zinc-900 enabled:hover:bg-zinc-50 dark:enabled:hover:bg-zinc-800 disabled:opacity-40 transition-colors font-semibold text-zinc-700 dark:text-zinc-300 text-xs"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Context panel (hidden until used) */}
        <div className="space-y-4 hidden">
          <IncidentContextDetails incident={selectedIncident} />
        </div>

        {/* ── MODALS ─────────────────────────────────────────────────────── */}
        <AssignModal
          isOpen={activeModal.type === "assign"}
          incidents={activeModal.payload ?? []}
          onClose={() => setActiveModal({ type: null })}
        />

        <MergeModal
          isOpen={activeModal.type === "merge"}
          incidentIds={activeModal.payload ?? []}
          allData={incidents}
          onClose={() => {
            setActiveModal({ type: null });
            setSelectedIds(new Set());
          }}
        />

        {/* Floating bulk-action dock */}
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
          handleExportSelected={handleExportSelected}
          handleAssign={() =>
            setActiveModal({ type: "assign", payload: Array.from(selectedIds) })
          }
          handleMerge={() =>
            setActiveModal({ type: "merge", payload: Array.from(selectedIds) })
          }
          handleArchive={handleArchive}
        />

        {/* ── Library Modals ────────────────────────────────────────────── */}
        <ReplayModal
          isOpen={activeModal.type === "replay"}
          incident={activeModal.payload}
          onClose={() => setActiveModal({ type: null })}
          onOpenPlaybook={(i: any) =>
            setActiveModal({ type: "playbook", payload: i })
          }
        />
        <CompareModal
          isOpen={activeModal.type === "compare"}
          incidentIds={activeModal.payload}
          allData={incidents}
          onClose={() => setActiveModal({ type: null })}
          onGenerateRca={(ids: any) =>
            setActiveModal({ type: "doc", kind: "rca", payload: ids })
          }
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
      <ProductTour
        tourId="incidents-dashboard"
        steps={TOUR_STEPS}
        forceRun={tourRunCount}
      />
    </>
  );
}
