"use client";

import React, { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/ui/EmptyState";
import TableLoader from "@/components/ui/LoaderUI/TableLoader";
import { Table } from "@/components/ui/table";
import { useIncidentList } from "@/hooks/useIncidentList";
import {
  IncidentListItem,
  IncidentSidebarStatus,
} from "@/lib/incident/incident.types";
import RaiseIncidentModal from "./IncidentForm";

// ─────────────────────────────────────────────────────────────────
// Status / priority badge styles — work on both light and dark
// ─────────────────────────────────────────────────────────────────

const statusStyles: Record<IncidentSidebarStatus, string> = {
  Investigating:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  Proposed:
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  Detected:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  Approved:
    "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30",
  Enriched:
    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
  Analyzed:
    "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
  Executing:
    "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
  Resolved:
    "bg-slate-500/10 text-slate-500 dark:text-slate-300 border-slate-500/30",
  "Post-Mortem":
    "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30",
};

const priorityStyles: Record<string, string> = {
  P1: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
  P2: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
  P3: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  P4: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
};

// ─────────────────────────────────────────────────────────────────
// Filter button
// ─────────────────────────────────────────────────────────────────

const FilterButton = ({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
      active
        ? "border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400"
        : "border-zinc-200 dark:border-white/10 text-black dark:text-slate-400 hover:border-zinc-300 dark:hover:border-white/20 hover:text-black dark:hover:text-slate-200"
    }`}
  >
    {label}
  </button>
);

// ─────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────

const IncidentTicketList = () => {
  const router = useRouter();
  const { data, isLoading } = useIncidentList();
  const [openCreate, setOpenCreate] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "resolved"
  >("all");
  const [severityFilter, setSeverityFilter] = useState<
    "all" | "p1" | "p2p3" | "p4"
  >("all");

  const incidents = useMemo(() => data?.incidents ?? [], [data?.incidents]);

  const filteredIncidents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return incidents.filter((incident) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          incident.ticketId,
          incident.title,
          incident.summary,
          incident.service,
          incident.region,
          incident.assignedToName,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "resolved"
          ? incident.status === "RESOLVED" ||
            incident.sidebarStatus === "Resolved"
          : incident.status !== "RESOLVED" &&
            incident.sidebarStatus !== "Resolved";

      const matchesSeverity =
        severityFilter === "all"
          ? true
          : severityFilter === "p1"
          ? incident.severity === "P1"
          : severityFilter === "p2p3"
          ? incident.severity === "P2" || incident.severity === "P3"
          : incident.severity === "P4";

      return matchesQuery && matchesStatus && matchesSeverity;
    });
  }, [incidents, query, severityFilter, statusFilter]);

  const columns = useMemo<ColumnDef<IncidentListItem>[]>(
    () => [
      {
        accessorKey: "ticketId",
        header: "Incident ID",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-black dark:text-white">
              {row.original.ticketId}
            </p>
            <p className="text-xs text-black dark:text-slate-400">
              {row.original.elapsedLabel}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "title",
        header: "Summary",
        cell: ({ row }) => (
          <div className="max-w-md">
            <p className="font-semibold text-black dark:text-white line-clamp-2">
              {row.original.title}
            </p>
            <p className="mt-1 text-xs text-black dark:text-slate-400 line-clamp-1">
              {row.original.service} / {row.original.environment} /{" "}
              {row.original.region}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "sidebarStatus",
        header: "Lifecycle",
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
              statusStyles[row.original.sidebarStatus]
            }`}
          >
            {row.original.sidebarStatus}
          </span>
        ),
      },
      {
        accessorKey: "severity",
        header: "Priority",
        cell: ({ row }) => (
          <div className="flex flex-col gap-2">
            <span
              className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
                priorityStyles[row.original.severity] ?? priorityStyles.P4
              }`}
            >
              {row.original.severity} / {row.original.priority}
            </span>
            <span className="text-xs text-black dark:text-slate-400">
              {row.original.assignedToName ||
                row.original.assignedToEmail ||
                "Unassigned"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "sourceType",
        header: "Source",
        cell: ({ row }) => (
          <div className="text-sm">
            <p className="text-black dark:text-slate-300">
              {row.original.sourceType || "Manual"}
            </p>
            <p className="text-xs text-black dark:text-slate-500">
              {row.original.status}
            </p>
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/incident/tickets/${row.original.id}`);
              }}
              className="rounded-lg border border-green-500/40 px-3 py-1.5 text-xs font-semibold text-green-600 dark:text-green-400 hover:bg-green-500/10 transition-colors"
            >
              Open Ticket
            </button>
            <Link
              href={`/incident?id=${row.original.id}&tab=overview`}
              onClick={(e) => e.stopPropagation()}
              className="rounded-lg border border-zinc-500 dark:border-white/10 px-3 py-1.5 text-xs font-semibold text-black dark:text-slate-300 hover:border-zinc-300 dark:hover:border-white/20 transition-colors"
            >
              Workspace
            </Link>
          </div>
        ),
      },
    ],
    [router]
  );

  return (
    <div className="p-4 md:p-6 text-black dark:text-white">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-black dark:text-slate-500">
            Incident Command
          </p>
          <h1 className="mt-2 text-2xl font-bold text-black dark:text-white">
            Incident Tickets
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-black dark:text-slate-400">
            This route uses the shared incident contract, so ticket list rows,
            workspace selection, and direct ticket navigation all resolve the
            same live incident records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpenCreate(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-green-500/40 px-4 py-2.5 text-sm font-semibold text-green-600 dark:text-green-400 hover:bg-green-500/10 transition-colors"
        >
          <Plus size={16} />
          Raise Incident
        </button>
      </div>

      {/* ── Filter + table card ── */}
      <div className="mt-6 rounded-2xl border border-zinc-500 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] p-4 md:p-5">
        {/* Search + filters row */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-slate-500"
              size={16}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by incident, service, owner, or region"
              className="w-full rounded-lg border border-zinc-500 dark:border-white/10 bg-white dark:bg-darkEzra px-10 py-2.5 text-sm text-black dark:text-white outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-slate-500 focus:border-green-500/40"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={statusFilter === "all"}
              label="All"
              onClick={() => setStatusFilter("all")}
            />
            <FilterButton
              active={statusFilter === "active"}
              label="Active"
              onClick={() => setStatusFilter("active")}
            />
            <FilterButton
              active={statusFilter === "resolved"}
              label="Resolved"
              onClick={() => setStatusFilter("resolved")}
            />
            <FilterButton
              active={severityFilter === "p1"}
              label="P1"
              onClick={() => setSeverityFilter("p1")}
            />
            <FilterButton
              active={severityFilter === "p2p3"}
              label="P2-P3"
              onClick={() => setSeverityFilter("p2p3")}
            />
            <FilterButton
              active={severityFilter === "p4"}
              label="P4"
              onClick={() => setSeverityFilter("p4")}
            />
            <FilterButton
              active={severityFilter === "all"}
              label="Any Severity"
              onClick={() => setSeverityFilter("all")}
            />
          </div>
        </div>

        {/* Table */}
        <div className="mt-6">
          {isLoading ? (
            <TableLoader />
          ) : filteredIncidents.length > 0 ? (
            <Table
              data={filteredIncidents}
              columns={columns}
              onRowClick={(incident) =>
                router.push(`/incident/tickets/${incident.id}`)
              }
            />
          ) : (
            <EmptyState
              title={
                incidents.length > 0
                  ? "No incidents matched this view"
                  : "No incidents yet"
              }
              description={
                incidents.length > 0
                  ? "Try widening the filters or search terms."
                  : "Raise an incident to start the live workspace flow."
              }
              action={
                <button
                  type="button"
                  onClick={() => setOpenCreate(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-green-500/40 px-4 py-2 text-sm font-semibold text-green-600 dark:text-green-400 hover:bg-green-500/10 transition-colors"
                >
                  <Plus size={16} />
                  Raise Incident
                </button>
              }
            />
          )}
        </div>
      </div>

      {openCreate && (
        <RaiseIncidentModal onClose={() => setOpenCreate(false)} />
      )}
    </div>
  );
};

export default IncidentTicketList;
