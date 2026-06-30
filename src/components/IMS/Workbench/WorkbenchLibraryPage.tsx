"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { Table } from "@/components/ui/table";
import { ColumnDef } from "@tanstack/react-table";
import WorkbenchDetailModal from "./WorkbenchDetailLibrary";

// ── Types ─────────────────────────────────────────────────────────

export interface WorkbenchRecord {
  id: string; // WB-0142
  incidentId: string; // SI-1024938
  title: string;
  type: string; // "PO Declaration" | "Rollback Approval" | "Major Incident"
  service: string;
  priority: string; // "P0" | "P1"
  status: string; // "Resolved" | "Open" | "In Review"
  declaredBy?: string;
  declaredAt?: string;
}

// ── Mock data ─────────────────────────────────────────────────────

const STATS = [
  { value: "0", label: "Total Workbenches" },
  { value: "0", label: "Major Incident Declarations" },
  { value: "0", label: "Successful Mitigations" },
  { value: "0", label: "Roll back decisions" },
  { value: "0", label: "High Risk Changes" },
  { value: "0", label: "Open Reviews" },
];

const SEV: Record<string, string> = {
  P0: "text-red-600",
  P1: "text-orange-500",
  P2: "text-amber-500",
};

// ── Filter dropdown ───────────────────────────────────────────────

const FilterDropdown = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[13px] text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
      >
        {value || label} <ChevronDown size={13} className="text-zinc-400" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg overflow-hidden min-w-[140px]">
          <button
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-[13px] text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-800"
          >
            All
          </button>
          {options.map((o) => (
            <button
              key={o}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${value === o ? "font-semibold text-emerald-600" : "text-zinc-700 dark:text-zinc-300"}`}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────

const WorkbenchLibraryPage: React.FC = () => {
  const router = useRouter();
  const { get } = useFetch();
  const [search, setSearch] = useState("");
  const [filterPri, setFilterPri] = useState("");
  const [filterSvc, setFilterSvc] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selected, setSelected] = useState<WorkbenchRecord | null>(null);

  const { data: liveRecords } = useQuery({
    queryKey: ["workbench-incidents"],
    queryFn: async () => {
      const res = await get(`${endpoint.incident_ticket.get}?limit=50&page=1`);
      const incidents: any[] = res.data?.data?.incidents ?? [];
      return incidents
        .filter(
          (i: any) =>
            i.severity === "P0" ||
            i.severity === "P1" ||
            i.priority === "CRITICAL",
        )
        .map(
          (i: any, idx: number): WorkbenchRecord => ({
            id: `WB-${String(idx + 1).padStart(4, "0")}`,
            incidentId: i.ticketId ?? i.id,
            title: i.title ?? i.summary ?? "Untitled Incident",
            type:
              i.priority === "CRITICAL" || i.severity === "P0"
                ? "PO Declaration"
                : "Major Incident",
            service: i.service ?? i.affectedSystem ?? "Unknown",
            priority: i.severity ?? "P1",
            status:
              i.status === "RESOLVED"
                ? "Resolved"
                : i.status === "MITIGATED"
                  ? "In Review"
                  : "Open",
            declaredBy: i.assignedToName ?? i.assignedToEmail ?? undefined,
            declaredAt: i.createdAt
              ? new Date(i.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : undefined,
          }),
        );
    },
    staleTime: 30_000,
  });

  const rows = liveRecords && liveRecords.length > 0 ? liveRecords : [];

  const { data: rollbackCount } = useQuery({
    queryKey: ["workbench-rollback-decisions"],
    queryFn: async () => {
      const res = await get(`${endpoint.decisions.list}?limit=200`);
      const decisions: any[] =
        res.data?.data?.decisions ?? res.data?.data ?? [];
      return decisions.filter((d) => d.proposal?.action === "ROLLBACK").length;
    },
    staleTime: 30_000,
  });

  const liveStats = useMemo(() => {
    if (!liveRecords || liveRecords.length === 0) return STATS;
    const total = liveRecords.length;
    const p0 = liveRecords.filter((r) => r.priority === "P0").length;
    const resolved = liveRecords.filter((r) => r.status === "Resolved").length;
    const open = liveRecords.filter((r) => r.status === "Open").length;
    return [
      { value: String(total), label: "Total Workbenches" },
      { value: String(p0), label: "Major Incident Declarations" },
      { value: String(resolved), label: "Successful Mitigations" },
      { value: String(rollbackCount ?? 0), label: "Roll back decisions" },
      { value: String(p0), label: "High Risk Changes" },
      { value: String(open), label: "Open Reviews" },
    ];
  }, [liveRecords, rollbackCount]);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (
          search &&
          !r.title.toLowerCase().includes(search.toLowerCase()) &&
          !r.incidentId.toLowerCase().includes(search.toLowerCase())
        )
          return false;
        if (filterPri && r.priority !== filterPri) return false;
        if (filterSvc && r.service !== filterSvc) return false;
        if (filterStatus && r.status !== filterStatus) return false;
        if (filterType && r.type !== filterType) return false;
        return true;
      }),
    [search, filterPri, filterSvc, filterStatus, filterType],
  );

  const columns: ColumnDef<WorkbenchRecord, unknown>[] = [
    {
      id: "id",
      header: "Workbench",
      accessorKey: "id",
      cell: (i) => (
        <span className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">
          {i.getValue() as string}
        </span>
      ),
    },
    {
      id: "incidentId",
      header: "Incident",
      accessorKey: "incidentId",
      cell: (i) => (
        <span className="text-[13px] text-zinc-500 dark:text-zinc-400">
          {i.getValue() as string}
        </span>
      ),
    },
    {
      id: "title",
      header: "Title",
      accessorKey: "title",
      cell: (i) => (
        <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
          {i.getValue() as string}
        </span>
      ),
    },
    {
      id: "type",
      header: "Type",
      accessorKey: "type",
      cell: (i) => (
        <span className="text-[13px] text-zinc-600 dark:text-zinc-400">
          {i.getValue() as string}
        </span>
      ),
    },
    {
      id: "service",
      header: "Service",
      accessorKey: "service",
      cell: (i) => (
        <span className="text-[13px] text-zinc-600 dark:text-zinc-400">
          {i.getValue() as string}
        </span>
      ),
    },
    {
      id: "priority",
      header: "Priority",
      accessorKey: "priority",
      cell: (i) => (
        <span
          className={`text-[13px] font-bold ${SEV[i.getValue() as string] ?? ""}`}
        >
          {i.getValue() as string}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: (i) => (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[13px] text-zinc-700 dark:text-zinc-300">
            {i.getValue() as string}
          </span>
        </div>
      ),
    },
    {
      id: "action",
      header: "",
      cell: () => <span className="text-zinc-400 dark:text-zinc-600">›</span>,
    },
  ];

  const clearFilters = () => {
    setFilterPri("");
    setFilterSvc("");
    setFilterStatus("");
    setFilterType("");
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 p-8">
      <div className="max-w-[1100px] mx-auto">
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-[24px] font-black text-zinc-900 dark:text-zinc-100 mb-1">
              Workbench Library
            </h1>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
              Every completed workbench becomes a permanent intelligence object
              — connected to incidents, knowledge, handover, postmortems,
              playbooks, and the Intelligence Control Plane. Not a library of
              forms; a record of operational judgment.
            </p>
          </div>
          <button
            onClick={() => router.push("/incident/workbench/awaiting")}
            className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white border-0 cursor-pointer shrink-0 ml-6 transition-all hover:brightness-110"
            style={{
              background: "linear-gradient(135deg, #14532d 0%, #22c55e 100%)",
            }}
          >
            New Workbench
          </button>
        </div>

        {/* ── Overview stats ── */}
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 mb-8">
          <p className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
            Overview
          </p>
          <div className="grid grid-cols-6 gap-0 divide-x divide-zinc-200 dark:divide-zinc-700">
            {liveStats.map((s) => (
              <div key={s.label} className="px-4 first:pl-0">
                <p className="text-[28px] font-black text-zinc-900 dark:text-zinc-100 leading-none mb-1">
                  {s.value}
                </p>
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Table section ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[16px] font-bold text-zinc-900 dark:text-zinc-100">
              Workbench library
            </p>
            <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
              {filtered.length} of {rows.length} shown
            </p>
          </div>

          {/* Filters bar */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-[300px]">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search workbench, incident"
                className="w-full pl-8 pr-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[13px] bg-white dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
              />
            </div>
            <FilterDropdown
              label="Priority"
              options={["P0", "P1", "P2", "P3"]}
              value={filterPri}
              onChange={setFilterPri}
            />
            <FilterDropdown
              label="Service"
              options={[...(new Set(rows.map((r) => r.service)) as any)]}
              value={filterSvc}
              onChange={setFilterSvc}
            />
            <FilterDropdown
              label="Resolved"
              options={["Resolved", "Open", "In Review"]}
              value={filterStatus}
              onChange={setFilterStatus}
            />
            <FilterDropdown
              label="Type"
              options={[
                "PO Declaration",
                "Rollback Approval",
                "Major Incident",
              ]}
              value={filterType}
              onChange={setFilterType}
            />
            <button
              onClick={clearFilters}
              className="text-[13px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 px-2 py-2 transition-colors"
            >
              CLEAR
            </button>
            {/* <button className="px-4 py-2 rounded-lg text-[13px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors">
              EXPORT
            </button> */}
          </div>

          {/* Table */}
          <Table
            data={rows}
            columns={columns}
            onRowClick={(row) => setSelected(row)}
            headerClassName="text-zinc-500 dark:text-zinc-400 bg-transparent"
          />
        </div>
      </div>

      {/* Detail side modal */}
      {selected && (
        <WorkbenchDetailModal
          workbench={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

export default WorkbenchLibraryPage;
