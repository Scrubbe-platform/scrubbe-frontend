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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { Table } from "@/components/ui/table";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import Pagination from "../ui/Pagination";

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
  rawStatus: string;
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
  const m: Record<string, string> = {
    CRITICAL: "P0",
    HIGH: "P1",
    MEDIUM: "P2",
    LOW: "P3",
  };
  return m[p.toUpperCase()] ?? p;
}

function mapStatus(s?: string): string {
  const m: Record<string, string> = {
    APPROVED: "Approved",
    IN_REVIEW: "In Review",
    DRAFT: "Draft",
    ARCHIVED: "Archived",
  };
  return m[s ?? ""] ?? s ?? "Draft";
}

function calcDuration(createdAt?: string, resolvedAt?: string): string {
  if (!createdAt || !resolvedAt) return "--";
  const mins = Math.round(
    (new Date(resolvedAt).getTime() - new Date(createdAt).getTime()) / 60_000,
  );
  return mins < 60 ? `${mins}m` : `${Math.round(mins / 60)}h`;
}

function extractRootCause(rca: any): string {
  if (!rca) return "Unknown";
  if (typeof rca === "string") return rca.slice(0, 40);
  if (typeof rca === "object") {
    const keys = ["category", "title", "cause", "summary"];
    for (const k of keys) {
      if (rca[k]) return String(rca[k]).slice(0, 40);
    }
  }
  return "Unknown";
}

const TOGGLEABLE_COLUMNS = [
  { id: "severity", label: "Severity" },
  { id: "service", label: "Service" },
  { id: "duration", label: "Duration" },
  { id: "rootCause", label: "Root Cause" },
  { id: "environment", label: "Environment" },
  { id: "owner", label: "Owner" },
  { id: "generated", label: "Generated" },
  { id: "status", label: "Status" },
];

const STATUS_FILTER_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Draft", value: "DRAFT" },
  { label: "In Review", value: "IN_REVIEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Archived", value: "ARCHIVED" },
];

const SEVERITY_FILTER_OPTIONS = [
  { label: "All severities", value: "" },
  { label: "Critical (P0)", value: "CRITICAL" },
  { label: "High (P1)", value: "HIGH" },
  { label: "Medium (P2)", value: "MEDIUM" },
  { label: "Low (P3)", value: "LOW" },
];

function buildColumns(
  visible: Record<string, boolean>,
  renderRowMenu: (row: PostmortemRow) => React.ReactNode,
): ColumnDef<PostmortemRow>[] {
  const all: ColumnDef<PostmortemRow>[] = [
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
      cell: (info) => renderRowMenu(info.row.original as PostmortemRow),
    },
  ];

  return all.filter(
    (col) =>
      col.id === "incidentId" ||
      col.id === "actions" ||
      visible[col.id as string],
  );
}

export default function PostmortemListPage() {
  const router = useRouter();
  const { get, post } = useFetch();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showColumns, setShowColumns] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    TOGGLEABLE_COLUMNS.reduce(
      (acc, c) => ({ ...acc, [c.id]: true }),
      {} as Record<string, boolean>,
    ),
  );

  const { data: apiData } = useQuery({
    queryKey: ["postmortems-list", page, statusFilter, severityFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter) params.set("status", statusFilter);
      if (severityFilter) params.set("priority", severityFilter);
      const res = await get(
        `${endpoint.postmortems.list}?${params.toString()}`,
      );
      const payload = res.data?.data ?? res.data ?? {};
      const items: any[] = payload.data ?? [];
      return {
        rows: items.map(
          (pm: any): PostmortemRow => ({
            id: pm.id,
            incidentId: pm.ticket?.ticketId ?? pm.ticketId ?? pm.id,
            severity: mapPriority(pm.ticket?.priority),
            service:
              pm.ticket?.serviceArea ?? pm.ticket?.affectedSystem ?? "Unknown",
            duration: calcDuration(pm.ticket?.createdAt, pm.ticket?.resolvedAt),
            rootCause: extractRootCause(pm.rootCauseAnalysis),
            environment: pm.ticket?.environment ?? "Production",
            owner: pm.author
              ? `${pm.author.firstName} ${pm.author.lastName}`.trim()
              : "Unassigned",
            generated: pm.updatedAt
              ? new Date(pm.updatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "--",
            status: mapStatus(pm.status),
            rawStatus: pm.status ?? "DRAFT",
          }),
        ),
        pagination: payload.pagination ?? {
          total: items.length,
          page: 1,
          pages: 1,
        },
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

  const transition = useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: "submit-review" | "approve" | "archive" | "restore";
    }) => {
      const res = await post(
        `${endpoint.postmortems.list}/${id}/${action}`,
        {},
      );
      if (!res.success)
        throw new Error((res.data as string) || "Action failed");
      return res;
    },
    onSuccess: () => {
      toast.success("Postmortem updated");
      queryClient.invalidateQueries({ queryKey: ["postmortems-list"] });
      queryClient.invalidateQueries({ queryKey: ["postmortems-summary"] });
    },
    onError: (err: any) =>
      toast.error(err?.message || "Failed to update postmortem"),
  });

  const rows: PostmortemRow[] = apiData?.rows ?? [];
  const paginationMeta = apiData?.pagination;
  const totalPages = Math.max(1, paginationMeta?.pages ?? 1);
  const isLoading = !apiData;

  const renderRowMenu = (row: PostmortemRow) => (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpenMenuId((id) => (id === row.id ? null : row.id))}
        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
      >
        <MoreVertical size={14} />
      </button>
      {openMenuId === row.id && (
        <div className="absolute right-0 mt-1 z-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg overflow-hidden w-44">
          <MenuItem
            label="View"
            onClick={() => {
              setOpenMenuId(null);
              router.push(`/incident/postmortems/${row.id}`);
            }}
          />
          {row.rawStatus === "DRAFT" && (
            <MenuItem
              label="Submit for review"
              onClick={() => {
                setOpenMenuId(null);
                transition.mutate({ id: row.id, action: "submit-review" });
              }}
            />
          )}
          {row.rawStatus === "IN_REVIEW" && (
            <MenuItem
              label="Approve"
              onClick={() => {
                setOpenMenuId(null);
                transition.mutate({ id: row.id, action: "approve" });
              }}
            />
          )}
          {row.rawStatus !== "ARCHIVED" ? (
            <MenuItem
              label="Archive"
              onClick={() => {
                setOpenMenuId(null);
                transition.mutate({ id: row.id, action: "archive" });
              }}
            />
          ) : (
            <MenuItem
              label="Restore"
              onClick={() => {
                setOpenMenuId(null);
                transition.mutate({ id: row.id, action: "restore" });
              }}
            />
          )}
        </div>
      )}
    </div>
  );

  const columns = buildColumns(visibleColumns, renderRowMenu);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 p-8">
      <div className="w-full max-w-[1600px] mx-auto">
        {/* ── Header ── */}
        <h1 className="text-[28px] font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
          Post-Mortem
        </h1>
        <p className="text-[14px] text-zinc-500 dark:text-zinc-400 mb-8">
          Review incident outcomes, root causes, remediation actions, lessons
          learned, and operational improvements.
        </p>

        {/* ── Stats ── */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "TOTAL POSTMORTEMS",
              value: summaryData?.total ?? "--",
              trend: `${summaryData?.approvedLast30Days ?? 0} approved`,
              trendLabel: "last 30 days",
              trendColor: "text-emerald-500",
            },
            {
              label: "DRAFT",
              value: summaryData?.draft ?? "--",
              trend: "",
              trendLabel: "awaiting review",
              trendColor: "text-zinc-400",
            },
            {
              label: "IN REVIEW",
              value: summaryData?.inReview ?? "--",
              trend: "",
              trendLabel: "pending approval",
              trendColor: "text-orange-500",
              valueColor:
                summaryData?.inReview > 0 ? "text-orange-500" : undefined,
            },
            {
              label: "APPROVED",
              value: summaryData?.approved ?? "--",
              trend: `↑ ${summaryData?.approvedLast30Days ?? 0}`,
              trendLabel: "this month",
              trendColor: "text-emerald-500",
            },
          ].map((s: any) => (
            <div
              key={s.label}
              className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 bg-white dark:bg-zinc-900/40"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
                {s.label}
              </p>
              <p
                className={`text-[32px] font-bold leading-none mb-2 ${s.valueColor ?? "text-zinc-900 dark:text-zinc-100"}`}
              >
                {s.value}
              </p>
              <p className="text-[12px]">
                {s.trend && (
                  <span className={`font-semibold ${s.trendColor}`}>
                    {s.trend}
                  </span>
                )}
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
                {paginationMeta?.total ?? rows.length} total
              </span>
            </p>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => {
                    setShowColumns((v) => !v);
                    setShowFilters(false);
                  }}
                  className="flex items-center gap-1.5 text-[13px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                >
                  <Columns size={14} /> Columns
                </button>
                {showColumns && (
                  <div className="absolute right-0 mt-2 z-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg p-3 w-48">
                    {TOGGLEABLE_COLUMNS.map((col) => (
                      <label
                        key={col.id}
                        className="flex items-center gap-2 py-1 text-[13px] text-zinc-700 dark:text-zinc-300 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={visibleColumns[col.id]}
                          onChange={() =>
                            setVisibleColumns((prev) => ({
                              ...prev,
                              [col.id]: !prev[col.id],
                            }))
                          }
                        />
                        {col.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => {
                    setShowFilters((v) => !v);
                    setShowColumns(false);
                  }}
                  className="flex items-center gap-1.5 text-[13px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                >
                  <Filter size={14} /> Filter
                  {statusFilter || severityFilter ? " ●" : ""}
                </button>
                {showFilters && (
                  <div className="absolute right-0 mt-2 z-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg p-3 w-56 space-y-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase text-zinc-400 mb-1">
                        Status
                      </p>
                      <select
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value);
                          setPage(1);
                        }}
                        className="w-full text-[13px] border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                      >
                        {STATUS_FILTER_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase text-zinc-400 mb-1">
                        Severity
                      </p>
                      <select
                        value={severityFilter}
                        onChange={(e) => {
                          setSeverityFilter(e.target.value);
                          setPage(1);
                        }}
                        className="w-full text-[13px] border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                      >
                        {SEVERITY_FILTER_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={22} className="animate-spin text-zinc-400" />
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400 dark:text-zinc-500">
              <p className="text-[14px] font-medium">No postmortems found</p>
              <p className="text-[12px] mt-1">
                Postmortems are created when incidents are resolved.
              </p>
            </div>
          ) : (
            <Table
              data={rows}
              columns={columns}
              onRowClick={(row) =>
                router.push(`/incident/postmortems/${row.id}`)
              }
            />
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
              Showing {rows.length} of{" "}
              {apiData?.pagination?.total ?? rows.length} postmortems
            </p>

            {apiData?.pagination.total > 0 && (
              <Pagination
                onPageChange={(p) => setPage(p)}
                page={apiData?.pagination.page}
                totalPages={apiData?.pagination.pages}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const MenuItem = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="block w-full text-left px-3 py-2 text-[13px] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
  >
    {label}
  </button>
);
