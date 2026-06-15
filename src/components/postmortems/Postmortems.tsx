"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Columns,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Loader2,
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

const SEV_COLOR: Record<string, string> = {
  P0: "text-red-600",
  P1: "text-orange-500",
  P2: "text-amber-500",
  P3: "text-yellow-500",
  P4: "text-sky-500",
};

function mapPriority(p?: string): string {
  if (!p) return "P3";
  const m: Record<string, string> = { CRITICAL: "P0", HIGH: "P1", MEDIUM: "P2", LOW: "P3" };
  return m[p.toUpperCase()] ?? p;
}

function mapStatus(s?: string): string {
  const m: Record<string, string> = {
    APPROVED: "Approved", IN_REVIEW: "In Review", DRAFT: "Draft", ARCHIVED: "Archived",
  };
  return m[s ?? ""] ?? s ?? "Draft";
}

function calcDuration(createdAt?: string, resolvedAt?: string): string {
  if (!createdAt || !resolvedAt) return "--";
  const mins = Math.round((new Date(resolvedAt).getTime() - new Date(createdAt).getTime()) / 60_000);
  return mins < 60 ? `${mins}m` : `${Math.round(mins / 60)}h`;
}

function extractRootCause(rca: any): string {
  if (!rca) return "Unknown";
  if (typeof rca === "string") return rca.slice(0, 40);
  if (typeof rca === "object") {
    const keys = ["category", "title", "cause", "summary"];
    for (const k of keys) { if (rca[k]) return String(rca[k]).slice(0, 40); }
  }
  return "Unknown";
}

const columns: ColumnDef<PostmortemRow>[] = [
  {
    id: "incidentId",
    header: "Incident",
    accessorKey: "incidentId",
    cell: (info) => (
      <Link
        href={`/incident/postmortems/${(info.row.original as PostmortemRow).id}`}
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
      const res = await get(`${endpoint.postmortems.list}?page=${page}&limit=20`);
      const payload = res.data?.data ?? res.data ?? {};
      const items: any[] = payload.data ?? [];
      return {
        rows: items.map((pm: any): PostmortemRow => ({
          id: pm.id,
          incidentId: pm.ticket?.ticketId ?? pm.ticketId ?? pm.id,
          severity: mapPriority(pm.ticket?.priority),
          service: pm.ticket?.serviceArea ?? pm.ticket?.affectedSystem ?? "Unknown",
          duration: calcDuration(pm.ticket?.createdAt, pm.ticket?.resolvedAt),
          rootCause: extractRootCause(pm.rootCauseAnalysis),
          environment: pm.ticket?.environment ?? "Production",
          owner: pm.author ? `${pm.author.firstName} ${pm.author.lastName}`.trim() : "Unassigned",
          generated: pm.updatedAt ? new Date(pm.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "--",
          status: mapStatus(pm.status),
        })),
        pagination: payload.pagination ?? { total: items.length, page: 1, pages: 1 },
      };
    },
    staleTime: 30_000,
  });

  const { data: summaryData } = useQuery({
    queryKey: ["postmortems-summary"],
    queryFn: async () => {
      const res = await get(endpoint.postmortems.summary);
      return res.data?.data ?? null;
    },
    staleTime: 60_000,
  });

  const rows: PostmortemRow[] = apiData?.rows ?? [];
  const paginationMeta = apiData?.pagination;
  const totalPages = Math.max(1, paginationMeta?.pages ?? 1);
  const isLoading = !apiData;

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

        {/* ── Stats ── */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "TOTAL POSTMORTEMS", value: summaryData?.total ?? "--", trend: `${summaryData?.approvedLast30Days ?? 0} approved`, trendLabel: "last 30 days", trendColor: "text-emerald-500" },
            { label: "DRAFT", value: summaryData?.draft ?? "--", trend: "", trendLabel: "awaiting review", trendColor: "text-zinc-400" },
            { label: "IN REVIEW", value: summaryData?.inReview ?? "--", trend: "", trendLabel: "pending approval", trendColor: "text-orange-500", valueColor: summaryData?.inReview > 0 ? "text-orange-500" : undefined },
            { label: "APPROVED", value: summaryData?.approved ?? "--", trend: `↑ ${summaryData?.approvedLast30Days ?? 0}`, trendLabel: "this month", trendColor: "text-emerald-500" },
          ].map((s: any) => (
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
                {s.trend && <span className={`font-semibold ${s.trendColor}`}>{s.trend}</span>}
                <span className="text-zinc-400 dark:text-zinc-500 ml-1">{s.trendLabel}</span>
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
                {paginationMeta?.total ?? rows.length} total
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

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={22} className="animate-spin text-zinc-400" />
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400 dark:text-zinc-500">
              <p className="text-[14px] font-medium">No postmortems found</p>
              <p className="text-[12px] mt-1">Postmortems are created when incidents are resolved.</p>
            </div>
          ) : (
            <Table
              data={rows}
              columns={columns}
              onRowClick={(row) => router.push(`/incident/postmortems/${row.id}`)}
            />
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
              Showing {rows.length} of {paginationMeta?.total ?? rows.length} postmortems
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
