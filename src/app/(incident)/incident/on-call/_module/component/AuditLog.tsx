"use client";
import { ColumnDef } from "@tanstack/react-table";
import React, { useState, useMemo, useEffect } from "react";
import { Table as CustomTable } from "@/components/ui/table";
import { customAxios } from "@/lib/api/axios";

interface AuditLogEntry {
  timestamp: string; // ISO format or localized string
  action: string;
  actor: string;
  target: string;
  detail: string;
}
const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  {
    timestamp: "2026-05-22 14:02",
    action: "Incident routed",
    actor: "Scrubbe Engine",
    target: "Aisha M.",
    detail: "SI-000847 auto-routed via playbook match",
  },
  {
    timestamp: "2026-05-22 14:07",
    action: "Auto-escalated",
    actor: "Auto-Esc Engine",
    target: "Kwame O.",
    detail: "SI-000847 Step 2 — no ack after 5min",
  },
  {
    timestamp: "2026-05-22 14:17",
    action: "Auto-escalated",
    actor: "Auto-Esc Engine",
    target: "Yemi A.",
    detail: "SI-000847 Step 3 — no ack after 15min",
  },
  {
    timestamp: "2026-05-22 14:22",
    action: "War room created",
    actor: "Auto-Esc Engine",
    target: "#inc-000847-warroom",
    detail: "Zoom + Slack channel auto-created",
  },
  {
    timestamp: "2026-05-21 09:14",
    action: "Shift assigned",
    actor: "Paschal I.",
    target: "Aisha M., Kwame O.",
    detail: "Week 21 primary on-call shift",
  },
  {
    timestamp: "2026-05-20 16:30",
    action: "Policy updated",
    actor: "Paschal I.",
    target: "Critical — P0 War Room",
    detail: "War room timeout changed 30→20min",
  },
  {
    timestamp: "2026-05-19 11:05",
    action: "Member reassigned",
    actor: "Paschal I.",
    target: "Tobenna C. → Fatima R.",
    detail: "Emergency coverage · sick leave",
  },
  {
    timestamp: "2026-05-18 08:00",
    action: "Auto-esc triggered",
    actor: "Auto-Esc Engine",
    target: "Chidi N.",
    detail: "SI-000844 escalated to Eng Manager",
  },
];

export default function AuditLogWorkspace() {
  const [logs, setLogs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOG);

  useEffect(() => {
    customAxios
      .get("/audit-trail?resourceType=ON_CALL&limit=50")
      .then((res) => {
        const data = res.data?.data ?? res.data;
        if (Array.isArray(data) && data.length > 0) {
          setLogs(
            data.map((e: any) => ({
              timestamp: e.createdAt
                ? new Date(e.createdAt).toLocaleString()
                : (e.timestamp ?? ""),
              action: e.action ?? e.event ?? "",
              actor: e.actorName ?? e.actor ?? e.userId ?? "System",
              target: e.target ?? e.resourceId ?? "",
              detail: e.detail ?? e.description ?? "",
            })),
          );
        }
      })
      .catch(() => {}); // fallback to mock data on error
  }, []);

  const columns: ColumnDef<AuditLogEntry, any>[] = [
    {
      accessorKey: "timestamp",
      header: "Timestamp",
      cell: ({ getValue }) => (
        <span className="font-mono text-[11px] text-[#64748B] dark:text-zinc-500">
          {getValue<string>()}
        </span>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ getValue }) => (
        <span className="font-bold text-[#0F172A] dark:text-zinc-100">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "actor",
      header: "Actor Origin",
      cell: ({ getValue }) => (
        <span className="inline-flex items-center gap-1.5 bg-[#F1FEF9] dark:bg-emerald-500/10 border border-[#A7F3D0] dark:border-emerald-800/50 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-[#065F46] dark:text-emerald-400">
          {getValue<string>()}
        </span>
      ),
    },
    {
      accessorKey: "target",
      header: "Impact Target",
      cell: ({ getValue }) => (
        <span className="font-medium text-[#0F172A] dark:text-zinc-100">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "detail",
      header: "Details Context",
      cell: ({ getValue }) => (
        <span className="text-[#64748B] dark:text-zinc-500 font-light leading-relaxed">
          {getValue<string>()}
        </span>
      ),
    },
  ];
  const [searchQuery, setSearchQuery] = useState("");
  const [actorFilter, setActorFilter] = useState("All Actors");
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // --- Dynamic Filtering Engine ---
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.detail.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesActor =
        actorFilter === "All Actors" || log.actor === actorFilter;

      return matchesSearch && matchesActor;
    });
  }, [logs, searchQuery, actorFilter]);

  const uniqueActors = useMemo(() => {
    const sets = new Set(logs.map((l) => l.actor));
    return ["All Actors", ...Array.from(sets)];
  }, [logs]);

  // --- Row Styling Callback using your specific (data) => string signature ---
  const handleRowClassName = (data: AuditLogEntry) => {
    let baseStyle =
      "hover:bg-[#F0FDF8] dark:hover:bg-emerald-500/10 transition-colors cursor-pointer text-xs ";
    if (
      data.action.toLowerCase().includes("failed") ||
      data.action.toLowerCase().includes("error")
    ) {
      return baseStyle + "bg-red-50/40 dark:bg-red-500/10";
    }
    return baseStyle;
  };

  const handleExportCSV = () => {
    const headers = ["Timestamp", "Action", "Actor", "Target", "Details"];
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map(
        (l) =>
          `"${l.timestamp}","${l.action}","${l.actor}","${l.target}","${l.detail.replace(/"/g, '""')}"`,
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `oncall-audit-log-${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // ('Audit trail payload successfully exported to CSV snapshot');
  };
  return (
    <div className="w-full bg-[#F7F9FB] dark:bg-zinc-950 min-h-screen text-[#0F172A] dark:text-zinc-100 font-sans antialiased p-6">
      <div className="max-w-[1400px] mx-auto space-y-5">
        {/* HEADER BLOCK */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Audit Log</h2>
            <p className="text-xs text-[#64748B] dark:text-zinc-500 mt-0.5">
              All on-call assignment and policy changes
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-zinc-900/40 border border-[#E2E8F0] dark:border-zinc-800 rounded-lg text-xs font-semibold hover:border-[#02DD82] hover:bg-[#F0FDF8] dark:hover:bg-zinc-800 text-[#64748B] dark:text-zinc-500 hover:text-[#0F172A] dark:hover:text-zinc-100 transition self-start sm:self-center shadow-2xs"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export CSV Schema
          </button>
        </div>

        {/* CUSTOM INJECTED TANSTACK TABLE MODULE */}
        <div className="bg-white dark:bg-zinc-900/40 border border-[#E2E8F0] dark:border-zinc-800 rounded-xl shadow-2xs overflow-hidden p-1">
          <CustomTable
            data={filteredLogs}
            columns={columns}
            headerClassName="bg-[#FAFBFD] dark:bg-zinc-900/60 text-[10.5px] font-bold tracking-wider text-[#64748B] dark:text-zinc-500 uppercase border-b border-[#E2E8F0] dark:border-zinc-800"
            rowClassName={handleRowClassName}
          />

          {filteredLogs.length === 0 && (
            <div className="p-8 text-center text-xs font-medium text-[#64748B] dark:text-zinc-500 italic bg-white dark:bg-zinc-900/40">
              Zero records found matching query filter indices.
            </div>
          )}
        </div>
      </div>

      {/* FLOATER FEEDBACK TOAST */}
      {toast && (
        <div className="fixed top-8 right-6 bg-[#0F172A] dark:bg-zinc-800 text-white font-semibold text-xs py-3 px-5 rounded-xl shadow-2xl z-50 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#02DD82] rounded-full animate-pulse" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
