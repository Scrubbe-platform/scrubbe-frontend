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

const severityStyles: Record<string, string> = {
  P1: "bg-red-500/10 text-red-400 border-red-500/30",
  P2: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  P3: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  P4: "bg-blue-500/10 text-blue-400 border-blue-500/30",
};

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
        ? "border-green-500/40 bg-green-500/10 text-green-400"
        : "border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
    }`}
  >
    {label}
  </button>
);

const Postmortems = () => {
  const router = useRouter();
  const { data: postmortems = [], isLoading } = useIncidentPostMortems();
  const [query, setQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<
    "all" | "p1" | "p2p3" | "p4"
  >("all");

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return postmortems.filter((incident) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          incident.ticketId,
          incident.title,
          incident.summary,
          incident.service,
          incident.region,
          incident.ResolveIncident?.causeCategory,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesSeverity =
        severityFilter === "all"
          ? true
          : severityFilter === "p1"
          ? incident.severity === "P1"
          : severityFilter === "p2p3"
          ? incident.severity === "P2" || incident.severity === "P3"
          : incident.severity === "P4";

      return matchesQuery && matchesSeverity;
    });
  }, [postmortems, query, severityFilter]);

  const columns = useMemo<ColumnDef<IncidentDetailRecord>[]>(
    () => [
      {
        accessorKey: "ticketId",
        header: "Incident ID",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-white">{row.original.ticketId}</p>
            <p className="text-xs text-slate-400">
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
            <p className="font-semibold text-white line-clamp-2">
              {row.original.title}
            </p>
            <p className="mt-1 text-xs text-slate-400 line-clamp-1">
              {row.original.service} / {row.original.environment} / {row.original.region}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "severity",
        header: "Priority",
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
              severityStyles[row.original.severity] ?? severityStyles.P4
            }`}
          >
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
            <div className="text-sm text-slate-300">
              {resolvedAt ? new Date(resolvedAt).toLocaleString() : "Unknown"}
            </div>
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
              onClick={(event) => {
                event.stopPropagation();
                router.push(`/incident/postmortems/${row.original.id}`);
              }}
              className="rounded-lg border border-green-500/40 px-3 py-1.5 text-xs font-semibold text-green-400 hover:bg-green-500/10"
            >
              Open Postmortem
            </button>
            <Link
              href={`/incident?id=${row.original.id}&tab=overview`}
              onClick={(event) => event.stopPropagation()}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-white/20"
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
    <div className="p-4 md:p-6 text-white">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
          Incident Learning
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">Postmortems</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Direct navigation now resolves postmortems from live incident data, and
          this list stays aligned with the same normalized incident contract used
          by the workspace and ticket detail routes.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by incident, service, or cause category"
              className="w-full rounded-lg border border-white/10 bg-darkEzra px-10 py-2.5 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-green-500/40"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={severityFilter === "all"}
              label="Any Severity"
              onClick={() => setSeverityFilter("all")}
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
          </div>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <TableLoader />
          ) : filteredRows.length > 0 ? (
            <Table
              data={filteredRows}
              columns={columns}
              onRowClick={(incident) =>
                router.push(`/incident/postmortems/${incident.id}`)
              }
            />
          ) : (
            <EmptyState
              title={
                postmortems.length > 0
                  ? "No postmortems matched this view"
                  : "No postmortems yet"
              }
              description={
                postmortems.length > 0
                  ? "Try widening the filters or search terms."
                  : "Resolved incidents with saved postmortems will appear here."
              }
              action={
                <button
                  type="button"
                  onClick={() => router.push("/incident")}
                  className="rounded-lg border border-green-500/40 px-4 py-2 text-sm font-semibold text-green-400 hover:bg-green-500/10"
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
