"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Columns,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { Table } from "@/components/ui/table";
import { ColumnDef } from "@tanstack/react-table";

// ── Types ─────────────────────────────────────────────────────────
interface PostmortemRow {
  id: string;
  incidentId: string;
  severity: string;
  service: string;
  duration: string;
  rootCause: string;
  environment: string;
  owner: string;
  generated: string;
  status: string;
}

// ── Dummy data ────────────────────────────────────────────────────
const ROWS: PostmortemRow[] = [
  {
    id: "pm-1",
    incidentId: "SI-7939763",
    severity: "P1",
    service: "Checkout",
    duration: "14m",
    rootCause: "Deployment",
    environment: "Production",
    owner: "Platform Team",
    generated: "May 14, 2026",
    status: "Approved",
  },
  {
    id: "pm-2",
    incidentId: "SI-7939754",
    severity: "P2",
    service: "Payments",
    duration: "22m",
    rootCause: "Database",
    environment: "Production",
    owner: "Backend Team",
    generated: "May 13, 2026",
    status: "Approved",
  },
  {
    id: "pm-3",
    incidentId: "SI-7939738",
    severity: "P1",
    service: "Auth",
    duration: "8m",
    rootCause: "Config Drift",
    environment: "Production",
    owner: "SRE Team",
    generated: "May 11, 2026",
    status: "Approved",
  },
  {
    id: "pm-4",
    incidentId: "SI-7939721",
    severity: "P3",
    service: "API Gateway",
    duration: "33m",
    rootCause: "Dependency",
    environment: "Staging",
    owner: "Platform Team",
    generated: "May 10, 2026",
    status: "Approved",
  },
];

const STATS = [
  {
    label: "TOTAL POSTMORTEMS",
    value: "1,284",
    trend: "+4.2%",
    trendLabel: "vs last month",
    trendColor: "text-emerald-500",
  },
  {
    label: "AVERAGE RESOLUTION TIME",
    value: "12 m",
    trend: "+18%",
    trendLabel: "improvement",
    trendColor: "text-emerald-500",
  },
  {
    label: "REPEAT INCIDENTS",
    value: "18",
    trend: "↑ 2",
    trendLabel: "since last week",
    trendColor: "text-orange-500",
    valueColor: "text-orange-500",
  },
  {
    label: "PLAYBOOKS UPDATED",
    value: "342",
    trend: "↑ 12",
    trendLabel: "this month",
    trendColor: "text-emerald-500",
  },
];

const ACTIVE_FILTERS = ["Production", "Last 30 days", "Approved"];

const SEV_COLOR: Record<string, string> = {
  P0: "text-red-600",
  P1: "text-orange-500",
  P2: "text-amber-500",
  P3: "text-yellow-500",
  P4: "text-sky-500",
};

const columns: ColumnDef<PostmortemRow>[] = [
  {
    id: "incidentId",
    header: "Incident",
    accessorKey: "incidentId",
    cell: (info) => (
      <Link
        href={`/incident/postmortems/${info.getValue() as string}`}
        className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {info.getValue() as string}
      </Link>
    ),
  },
  {
    id: "severity",
    header: "Severity",
    accessorKey: "severity",
    cell: (info) => (
      <span
        className={`font-bold ${SEV_COLOR[info.getValue() as string] ?? ""}`}
      >
        {info.getValue() as string}
      </span>
    ),
  },
  {
    id: "service",
    header: "Service",
    accessorKey: "service",
    cell: (info) => (
      <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium rounded px-2 py-0.5 text-[12px]">
        {info.getValue() as string}
      </span>
    ),
  },
  {
    id: "duration",
    header: "Duration",
    accessorKey: "duration",
    cell: (info) => (
      <span className="text-zinc-700 dark:text-zinc-300">
        {info.getValue() as string}
      </span>
    ),
  },
  {
    id: "rootCause",
    header: "Root Cause",
    accessorKey: "rootCause",
    cell: (info) => (
      <span className="text-zinc-600 dark:text-zinc-400">
        {info.getValue() as string}
      </span>
    ),
  },
  {
    id: "environment",
    header: "Environment",
    accessorKey: "environment",
    cell: (info) => (
      <span className="bg-zinc-900 dark:bg-zinc-700 text-white text-[11px] font-medium rounded px-2 py-0.5">
        {info.getValue() as string}
      </span>
    ),
  },
  {
    id: "owner",
    header: "Owner",
    accessorKey: "owner",
    cell: (info) => (
      <span className="text-zinc-600 dark:text-zinc-400">
        {info.getValue() as string}
      </span>
    ),
  },
  {
    id: "generated",
    header: "Generated",
    accessorKey: "generated",
    cell: (info) => (
      <span className="text-zinc-500 dark:text-zinc-400">
        {info.getValue() as string}
      </span>
    ),
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    cell: (info) => (
      <span className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg px-3 py-1">
        {info.getValue() as string}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: () => (
      <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
        <MoreVertical size={14} />
      </button>
    ),
  },
];

export default function PostmortemListPage() {
  const router = useRouter();
  const { get } = useFetch();
  const [page, setPage] = useState(1);

  const { data: apiData } = useQuery({
    queryKey: ["postmortems-list", page],
    queryFn: async () => {
      const res = await get(endpoint.incident_ticket.get_postmortems);
      const items: any[] = res.data?.data ?? [];
      return items.map((pm: any): PostmortemRow => ({
        id: pm.id ?? pm.ticketId ?? pm.incidentId,
        incidentId: pm.ticketId ?? pm.incidentId ?? pm.id,
        severity: pm.severity ?? pm.priority ?? "P3",
        service: pm.service ?? pm.affectedSystem ?? "Unknown",
        duration: pm.elapsedLabel ?? pm.duration ?? "--",
        rootCause: pm.rootCause ?? pm.causeCategory ?? "Unknown",
        environment: pm.environment ?? "Production",
        owner: pm.assignedToName ?? pm.assignedToEmail ?? pm.owningSquad ?? "Unassigned",
        generated: pm.updatedAt ? new Date(pm.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "--",
        status: pm.status === "RESOLVED" ? "Approved" : "In Review",
      }));
    },
    staleTime: 30_000,
  });

  const rows = apiData && apiData.length > 0 ? apiData : ROWS;
  const totalPages = Math.max(1, Math.ceil(rows.length / 20));

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 p-8">
      <div className="w-full mx-auto">
        {/* ── Header ── */}
        <h1 className="text-[28px] font-black text-zinc-900 dark:text-zinc-100 mb-1">
          Post-Mortem
        </h1>
        <p className="text-[14px] text-zinc-500 dark:text-zinc-400 mb-8">
          Review incident outcomes, root causes, remediation actions, lessons
          learned, and operational improvements.
        </p>

        {/* ── Active filters ── */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Active Filters:
          </span>
          {ACTIVE_FILTERS.map((f) => (
            <span
              key={f}
              className="flex items-center gap-1.5 text-[12px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full px-3 py-1 border border-zinc-200 dark:border-zinc-700"
            >
              {f}
              <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                ×
              </button>
            </span>
          ))}
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 bg-white dark:bg-zinc-900/40"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
                {s.label}
              </p>
              <p
                className={`text-[32px] font-black leading-none mb-2 ${s.valueColor ?? "text-zinc-900 dark:text-zinc-100"}`}
              >
                {s.value}
              </p>
              <p className="text-[12px]">
                <span className={`font-semibold ${s.trendColor}`}>
                  ↑ {s.trend}
                </span>
                <span className="text-zinc-400 dark:text-zinc-500 ml-1">
                  {s.trendLabel}
                </span>
              </p>
            </div>
          ))}
        </div>

        {/* ── Table section ── */}
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/40">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <p className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100">
              Incident Postmortems{" "}
              <span className="font-normal text-zinc-400 dark:text-zinc-500">
                1,284 total
              </span>
            </p>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 text-[13px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
                <Columns size={14} /> Columns
              </button>
              <button className="flex items-center gap-1.5 text-[13px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
                <Filter size={14} /> Filter
              </button>
            </div>
          </div>

          <Table
            data={rows}
            columns={columns}
            onRowClick={(row) =>
              router.push(`/incident/postmortems/${row.incidentId}`)
            }
          />

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
              Showing 1-4 of 1,284 postmortems
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 flex items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <ChevronLeft size={13} />
              </button>
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-7 h-7 flex items-center justify-center rounded text-[13px] font-medium ${page === n ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
                >
                  {n}
                </button>
              ))}
              <span className="w-7 h-7 flex items-center justify-center text-zinc-400">
                …
              </span>
              <button
                onClick={() => setPage(totalPages)}
                className="w-7 h-7 flex items-center justify-center rounded text-[13px] font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {totalPages}
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="w-7 h-7 flex items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
