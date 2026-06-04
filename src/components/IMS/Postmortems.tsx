"use client";
import React, { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EmptyState from "../ui/EmptyState";
import TableLoader from "../ui/LoaderUI/TableLoader";
import { Table } from "../ui/table";
import { useIncidentPostMortems } from "@/hooks/useIncidentPostMortems";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";

// ── Severity badge styles — kept, they carry meaning ─────────────

const severityStyles: Record<string, string> = {
  P1: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30",
  P2: "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/30",
  P3: "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30",
  P4: "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-500/30",
};

// ── Filter button ─────────────────────────────────────────────────

const FilterButton = ({
  active, label, onClick,
}: {
  active: boolean; label: string; onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
      active
        ? "border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
        : "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-200"
    }`}
  >
    {label}
  </button>
);

// ── Component ─────────────────────────────────────────────────────

const Postmortems = () => {
  const router = useRouter();
  const { data: postmortems = [], isLoading } = useIncidentPostMortems();
  const [query, setQuery]                     = useState("");
  const [severityFilter, setSeverityFilter]   = useState<"all" | "p1" | "p2p3" | "p4">("all");

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return postmortems.filter((incident) => {
      const matchesQuery = !q || [
        incident.ticketId, incident.title, incident.summary,
        incident.service, incident.region, incident.ResolveIncident?.causeCategory,
      ].join(" ").toLowerCase().includes(q);

      const matchesSeverity =
        severityFilter === "all"  ? true :
        severityFilter === "p1"   ? incident.severity === "P1" :
        severityFilter === "p2p3" ? incident.severity === "P2" || incident.severity === "P3" :
        incident.severity === "P4";

      return matchesQuery && matchesSeverity;
    });
  }, [postmortems, query, severityFilter]);

  const columns = useMemo<ColumnDef<IncidentDetailRecord>[]>(() => [
    {
      accessorKey: "ticketId",
      header: "Incident ID",
      cell: ({ row }) => (
        <div>
          <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-100">
            {row.original.ticketId}
          </p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
            {row.original.ResolveIncident?.causeCategory || "Postmortem"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: "Incident",
      cell: ({ row }) => (
        <div className="max-w-md">
          <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-100 line-clamp-2">
            {row.original.title}
          </p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 line-clamp-1">
            {[row.original.service, row.original.environment, row.original.region].filter(Boolean).join(" / ")}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "severity",
      header: "Priority",
      cell: ({ row }) => (
        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${severityStyles[row.original.severity] ?? severityStyles.P4}`}>
          {row.original.severity} / {row.original.priority}
        </span>
      ),
    },
    {
      id: "resolvedAt",
      header: "Resolved",
      cell: ({ row }) => {
        const resolvedAt =
          row.original.ResolveIncident?.updatedAt ||
          row.original.ResolveIncident?.createdAt ||
          row.original.updatedAt;
        return (
          <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
            {resolvedAt ? new Date(resolvedAt).toLocaleString() : "Unknown"}
          </p>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); router.push(`/incident/postmortems/${row.original.id}`); }}
            className="rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/8 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/15 transition-colors"
          >
            Open Postmortem
          </button>
          <Link
            href={`/incident?id=${row.original.id}&tab=overview`}
            onClick={(e) => e.stopPropagation()}
            className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Workspace
          </Link>
        </div>
      ),
    },
  ], [router]);

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-zinc-950 min-h-screen text-zinc-800 dark:text-zinc-200">

      {/* Header */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Incident Learning
        </p>
        <h1 className="mt-1.5 text-[22px] font-bold text-zinc-900 dark:text-zinc-100">
          Postmortems
        </h1>
        <p className="mt-1.5 max-w-2xl text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Direct navigation now resolves postmortems from live incident data, and this list stays
          aligned with the same normalized incident contract used by the workspace and ticket detail routes.
        </p>
      </div>

      {/* Table card */}
      <div className="mt-6 rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 p-4 md:p-5">

        {/* Toolbar */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by incident, service, or cause category"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 px-9 py-2.5 text-[13px] text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400 outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {([
              { id: "all",  label: "Any Severity" },
              { id: "p1",   label: "P1"           },
              { id: "p2p3", label: "P2–P3"        },
              { id: "p4",   label: "P4"           },
            ] as const).map(({ id, label }) => (
              <FilterButton
                key={id}
                active={severityFilter === id}
                label={label}
                onClick={() => setSeverityFilter(id)}
              />
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="mt-5">
          {isLoading ? (
            <TableLoader />
          ) : filteredRows.length > 0 ? (
            <Table
              data={filteredRows}
              columns={columns}
              onRowClick={(incident) => router.push(`/incident/postmortems/${incident.id}`)}
            />
          ) : (
            <EmptyState
              title={postmortems.length > 0 ? "No postmortems matched this view" : "No postmortems yet"}
              description={
                postmortems.length > 0
                  ? "Try widening the filters or search terms."
                  : "Resolved incidents with saved postmortems will appear here."
              }
              action={
                <button
                  type="button"
                  onClick={() => router.push("/incident")}
                  className="rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/8 px-4 py-2 text-[13px] font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/15 transition-colors"
                >
                  Go to incident workspace
                </button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Postmortems;