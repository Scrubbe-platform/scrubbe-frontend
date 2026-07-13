// app/incidents/library/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Search, Download, BarChart3, Sparkles, Plus } from "lucide-react";
import { IncidentListItem } from "@/lib/incident/incident.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteIncident } from "@/lib/incident/incident.api";
import { querykeys } from "@/lib/constant";
import toast from "react-hot-toast";

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
import { useRouter } from "next/navigation";
import Header from "@/components/IMS/DashboardHeader";

export const priColors: { [key: string]: string } = {
  P0: "text-red-600 bg-red-50 border-red-100",
  P1: "text-amber-600 bg-amber-50 border-amber-100",
  P2: "text-blue-600 bg-blue-50 border-blue-100",
  P3: "text-green-500 bg-green-50 border-green-100",
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
  // 2. Selection & Filter Toggles
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: new Set<string>(),
    severity: new Set<string>(),
    environment: new Set<string>(),
    service: new Set<string>(),
    rootCause: new Set<string>(),
    incidentType: new Set<string>(),
    warRoom: new Set<string>(),
    codeEngine: new Set<string>(),
  });
  const router = useRouter();

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
          filters.severity.size === 0 || filters.severity.has(i.severity);
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
          return a.severity.localeCompare(b.severity);
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
      severity: new Set(),
      environment: new Set(),
      service: new Set(),
      rootCause: new Set(),
      incidentType: new Set(),
      warRoom: new Set(),
      codeEngine: new Set(),
    });
    setDateRange(null);
    setSearch("");
  };

  const selectedIncident = useMemo(
    () => incidents.find((i) => i.id === activeId) || null,
    [incidents, activeId],
  );

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
    const selectedRecords = incidents.filter((i) => selectedIds.has(i.id));
    handleDownloadCSV(selectedRecords);
  };

  const handleAssign = () => {};
  const handleMerge = () => {};
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
        {/* Page Title Context Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 ">
          <div>
            <p className="text-sm text-zinc-500 max-w-2xl">
              Your organization's searchable operational memory for every
              incident, investigation, and resolution.
            </p>
          </div>

          <Button
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => router.push("/incident/tickets/create")}
          >
            Raise Incident
          </Button>
        </div>

        {/* 1. Metrics KPI Strip subcomponent */}
        <KpiStrip
          incidents={incidents}
          onKpiFilter={(p: any) =>
            setFilters((prev) => ({ ...prev, severity: new Set([p]) }))
          }
        />

        {/* 2. Toolbar Operations Block */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 flex-1">
            {/* Search Suggestion Section */}
            <div className="max-w-xl w-full space-y-2">
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
                  className="w-full h-[36px] pl-11 pr-4 rounded-sm text-xs shadow shadow-light text-zinc-900 outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-2 lg:col-span-4 justify-end">
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
            </div>

            {/* Ezra Semantic Engine Widget Container */}
          </div>

          <Dropdown
            trigger={
              <Button variant="outline-green" size="sm">
                Ask Ezra
              </Button>
            }
          >
            <div className="lg:col-span-4 bg-indigo-50/60 border border-indigo-100 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-[9px] font-medium text-indigo-900 uppercase">
                <span className="flex items-center text-indigo-600 gap-1.5">
                  <Sparkles size={13} className="" /> Ask Ezra AI
                </span>
                <span className="font-ibm text-[7px] text-indigo-400">
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
          </Dropdown>
        </div>

        {/* 3. Core Workspace Matrix Split Panel layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Side: Filter Rails Sidebar controls */}
          <div className="lg:col-span-3">
            <FilterRail
              filters={filters}
              onFilterChange={setFilters}
              onClear={clearAllFilters}
              dataList={incidents}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </div>

          {/* Center Canvas Area: Main Datagrid Panel */}
          <div className="col-span-12 lg:col-span-9  bg-white z-0 shadow-sm shadow-light rounded-md overflow-hidden">
            <div className="flex items-center justify-between px-4 h-11 border-b border-zinc-100">
              <div className="text-base font-medium ">Incident List </div>
              <div className="flex items-center gap-4 text-xs font-medium">
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
            <div className="overflow-x-auto ">
              <table className="w-full text-left text-xs border-collapse min-w-[900px] ">
                <thead className="border-b bg-zinc-50 border-zinc-100 text-sm font-medium text-zinc-600">
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
                    <th className="p-3 w-28">Opened</th>
                    {/* <th className="p-3 w-24">Owner</th> */}
                    <th className="p-3 w-10 relative">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-800">
                  {paginatedIncidents.map((i) => {
                    const isChecked = selectedIds.has(i.id);

                    const status = TICKET_STATUS_CONFIG.find(
                      (s) => s.label === i.status,
                    );

                    return (
                      <tr
                        key={i.id}
                        onClick={() => router.push(`/incident/tickets/${i.id}`)}
                        className={`hover:bg-zinc-50/50 cursor-pointer text-sm font-ibm text-zinc-600 group transition-colors ${isChecked ? "bg-indigo-50/30" : ""}`}
                      >
                        <td
                          className="p-3 "
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSelectRow(i.id)}
                            className="accent-indigo-600 h-3.5 w-3.5"
                          />
                        </td>
                        <td className="p-3">{i?.ticketId} </td>
                        <td
                          className={`p-3 max-w-xs ${density === "compact" ? "py-1.5" : "py-3.5"}`}
                        >
                          <div className="truncate">{i.title}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 border rounded-md  text-xs ${priColors[i.severity]}`}
                          >
                            {i.severity}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-xs px-2 py-0.5 capitalize items-center gap-1.5 ${status?.ribbonDone}`}
                          >
                            {i.status.toLowerCase()}
                          </span>
                        </td>
                        <td className="p-3">{i.service}</td>
                        <td className="p-3">
                          {new Date(i.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        {/* <td className="p-3 capitalize text-nowrap">
                          {i.assignedToName}
                        </td> */}
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
                                  className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
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

            {/* Fallback state display */}
            {filteredIncidents.length === 0 && (
              <div className="p-12 text-center text-sm text-zinc-400 italic border-t border-zinc-100">
                No telemetry log entries found matching criteria parameters.
              </div>
            )}

            {/* Pagination Toolbar Row controls */}
            <div className="h-11 px-4 border-t border-zinc-100 flex items-center justify-between text-sm text-zinc-400 bg-zinc-50/50">
              <span className="font-medium font-ibm">
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
        </div>
        <div className="space-y-4 hidden">
          <IncidentContextDetails incident={selectedIncident} />
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
          handleExportSelected={handleExportSelected}
        />

        {/* Modals Mounting Injection Registry hooks */}
        <ReplayModal
          isOpen={activeModal.type === "replay"}
          incident={activeModal.payload}
          onClose={() => setActiveModal({ type: null })}
          onOpenPlaybook={(i) =>
            setActiveModal({ type: "playbook", payload: i })
          }
        />
        <CompareModal
          isOpen={activeModal.type === "compare"}
          incidentIds={activeModal.payload}
          allData={incidents}
          onClose={() => setActiveModal({ type: null })}
          onGenerateRca={(ids) =>
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
    </>
  );
}
