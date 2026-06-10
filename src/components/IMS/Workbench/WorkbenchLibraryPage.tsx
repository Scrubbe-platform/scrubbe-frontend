"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, X } from "lucide-react";
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
  // detail fields (for modal)
  incidentContext?: Record<string, string>;
  incidentDetails?: Record<string, string>;
  timeline?: Record<string, string>;
  diagnosis?: Record<string, string>;
  roles?: Record<string, string>;
  comms?: Record<string, string>;
  playbookUsed?: string;
  playbookOwner?: string;
  completion?: number;
  aiReasons?: string[];
  modelConfidence?: number;
  relatedIncidents?: string[];
  handover?: Record<string, string>;
  knowledgeQuery?: string;
  knowledgeAnswer?: string;
  postmortemItems?: string[];
}

// ── Mock data ─────────────────────────────────────────────────────

const MOCK: WorkbenchRecord[] = [
  {
    id: "WB-0142",
    incidentId: "SI-1024938",
    title: "Payment Processing Failure",
    type: "PO Declaration",
    service: "Payments",
    priority: "P0",
    status: "Resolved",
    declaredBy: "John Smith",
    declaredAt: "Jun 4 2026",
    incidentContext: {
      "Incident ID": "SI-202500123",
      Priority: "P0 (MAJOR INCIDENT)",
      Status: "In-Progress",
      "Short description": "Online banking is slow and intermittent",
      "Reported on": "May 20, 2025 · 09:15 AM",
      "Reported by": "Jane Smith",
    },
    incidentDetails: {
      "Business Impact": "Customers are unable to complete transactions.",
      "SLO burn-rate": "94% of error budget · 6.2× critical threshold",
      "Scope of impact": "Customers / External Users",
      "Regions affected": "LATAM",
      "Tenant Affected": "Alex Sham",
      "Affected service": "Email",
    },
    timeline: {
      "Detection time": "Jun 4 2026 · 9:00 am",
      "Start time of impact": "Jun 5 2026 · 9:00 am",
      "Estimated end time": "Jun 5 2026 · 9:00 am",
    },
    diagnosis: {
      "Root Cause": "Database Migration due to high load",
      "Mitigation / workaround": "Scaling database, engaging vendor support",
      "Risk justification for P0 upgrade":
        "Customer facing transactions failing across all channels",
    },
    roles: {
      "Incident Commander": "John Freda",
      "Technical Lead": "Michelle Sky",
      "Comms Lead": "Gabriel Munchi",
    },
    comms: {
      "Communication Plan": "Public Status Page only",
      "Stakeholders Notified": "Product Owner",
    },
    playbookUsed: "Major Incident Management",
    playbookOwner: "Incident Commander",
    completion: 96,
    aiReasons: [
      "Customer impact",
      "Revenue impact",
      "Multi-region outage",
      "Regulatory exposure",
    ],
    modelConfidence: 97,
    relatedIncidents: ["SI-1000321", "SI-1009122", "SI-1014432"],
    handover: {
      Commander: "John Smith",
      "Expected completion": "30 mins",
      "Current strategy": "Rollback deployment",
    },
    knowledgeQuery:
      "Have we ever declared a P0 because of database pool exhaustion?",
    knowledgeAnswer:
      "Yes. Found 7 similar workbenches. Most common action: increase pool size. Success rate 86%. Average resolution 41 mins.",
    postmortemItems: [
      "Declaration rationale",
      "Stakeholder impact",
      "Communication timeline",
      "Decision timeline",
      "Escalation approvals",
    ],
  },
  {
    id: "WB-0141",
    incidentId: "SI-1024940",
    title: "Checkout Latency Surge",
    type: "Rollback Approval",
    service: "Checkout",
    priority: "P1",
    status: "Resolved",
  },
  {
    id: "WB-0139",
    incidentId: "SI-1024903",
    title: "Database Pool Exhaustion",
    type: "PO Declaration",
    service: "Billing",
    priority: "P0",
    status: "Resolved",
  },
  {
    id: "WB-0138",
    incidentId: "SI-1024877",
    title: "Auth Token Service Degradation",
    type: "Major Incident",
    service: "Auth",
    priority: "P1",
    status: "Resolved",
  },
  {
    id: "WB-0137",
    incidentId: "SI-1024855",
    title: "API Gateway Timeout Error",
    type: "Rollback Approval",
    service: "Platform",
    priority: "P1",
    status: "Resolved",
  },
  {
    id: "WB-0136",
    incidentId: "SI-1024840",
    title: "Stripe Webhook Mismatch",
    type: "Major Incident",
    service: "Payments",
    priority: "P0",
    status: "Resolved",
  },
  {
    id: "WB-0135",
    incidentId: "SI-1024822",
    title: "Search Index Sync Delay",
    type: "Rollback Approval",
    service: "Search",
    priority: "P1",
    status: "Resolved",
  },
  {
    id: "WB-0134",
    incidentId: "SI-1024810",
    title: "Inventory Stock Buffer Error",
    type: "PO Declaration",
    service: "Logistics",
    priority: "P1",
    status: "Resolved",
  },
  {
    id: "WB-0133",
    incidentId: "SI-1024799",
    title: "Redis Cache Eviction Spikes",
    type: "Major Incident",
    service: "Core Services",
    priority: "P0",
    status: "Resolved",
  },
  {
    id: "WB-0132",
    incidentId: "SI-1024781",
    title: "Promotional Email Loop",
    type: "Rollback Approval",
    service: "Marketing",
    priority: "P1",
    status: "Resolved",
  },
];

const STATS = [
  { value: "432", label: "Total Workbenches" },
  { value: "217", label: "Major Incident Declarations" },
  { value: "198", label: "Successful Mitigations" },
  { value: "74", label: "Roll back decisions" },
  { value: "58", label: "High Risk Changes" },
  { value: "12", label: "Open Reviews" },
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
  const [search, setSearch] = useState("");
  const [filterPri, setFilterPri] = useState("");
  const [filterSvc, setFilterSvc] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selected, setSelected] = useState<WorkbenchRecord | null>(null);

  const filtered = useMemo(
    () =>
      MOCK.filter((r) => {
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
            {STATS.map((s) => (
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
              {filtered.length} of {MOCK.length} shown
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
              options={[...(new Set(MOCK.map((r) => r.service)) as any)]}
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
              onClick={() => {}}
              className="text-[13px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 px-2 py-2 transition-colors"
            >
              MORE FILTERS
            </button>
            <button
              onClick={clearFilters}
              className="text-[13px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 px-2 py-2 transition-colors"
            >
              CLEAR
            </button>
            <button className="px-4 py-2 rounded-lg text-[13px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors">
              EXPORT
            </button>
          </div>

          {/* Table */}
          <Table
            data={filtered}
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
