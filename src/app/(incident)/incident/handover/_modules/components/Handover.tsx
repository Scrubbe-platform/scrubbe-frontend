// app/handovers/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Topbar from "../components/Topbar";
import ArchivePanel from "../components/ArchivePanel";
import SchedulePanel from "../components/SchedulePanel";
import { Table } from "@/components/ui/table";
import Button from "@/components/ui/Button1";
import { fetchHandovers } from "@/lib/handover/handover.api";
import { HandoverRecord, HandoverStatus } from "../types/index";
import CreateHandoverModal from "./CreateHandoverModal";
import ManageSchedulesModal from "../components/ManageScheduleModal";
import { useRouter } from "next/navigation";

const STATUS_TABS: { label: string; value: "All" | HandoverStatus }[] = [
  { label: "All", value: "All" },
  { label: "Active", value: "ACTIVE" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Completed", value: "COMPLETED" },
];

export default function HandoverCenterPage() {
  const [activeTab, setActiveTab] = useState<"All" | HandoverStatus>("All");
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: handovers = [], isLoading } = useQuery({
    queryKey: ["handovers"],
    queryFn: () => fetchHandovers(),
    refetchInterval: 30_000,
  });

  const filteredHandovers = useMemo(
    () =>
      activeTab === "All"
        ? handovers
        : handovers.filter((h) => h.status === activeTab),
    [handovers, activeTab],
  );

  const activeIncidentCount = useMemo(
    () =>
      handovers
        .filter((h) => h.status === "ACTIVE")
        .reduce((sum, h) => sum + h.incidents.length, 0),
    [handovers],
  );

  const columns: ColumnDef<HandoverRecord>[] = [
    {
      header: "Handover ID",
      accessorKey: "handoverRef",
      cell: ({ row }) => (
        <div className="font-mono text-xs font-medium text-blue-600">
          {row.original.handoverRef}
        </div>
      ),
    },
    {
      header: "Primary Incident",
      id: "primaryIncident",
      cell: ({ row }) => {
        const primary =
          row.original.incidents.find((i) => i.isPrimary) ??
          row.original.incidents[0];
        const extra = row.original.incidents.length - 1;
        if (!primary) {
          return (
            <div className="text-xs text-stone-400">No linked incidents</div>
          );
        }
        return (
          <>
            <div className="font-medium text-stone-900">
              {primary.incident.summary}
            </div>
            <div className="mt-[1px] font-mono text-[11px] text-stone-500">
              {primary.incident.ticketId} {extra > 0 && `+${extra} MORE`}
            </div>
          </>
        );
      },
    },
    {
      header: "Incidents",
      id: "totalIncidents",
      cell: ({ row }) => (
        <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-600 whitespace-nowrap">
          {row.original.incidents.length} incidents
        </span>
      ),
    },
    {
      header: "Severity",
      id: "severity",
      cell: ({ row }) => {
        const primary =
          row.original.incidents.find((i) => i.isPrimary) ??
          row.original.incidents[0];
        const severity =
          primary?.incident.severity || primary?.incident.priority || "—";
        const severityStyles: Record<string, string> = {
          CRITICAL: "text-red-600",
          HIGH: "text-amber-600",
          MEDIUM: "text-blue-600",
          LOW: "text-green-600",
        };
        return (
          <span
            className={`text-xs font-semibold ${severityStyles[severity] || "text-stone-500"}`}
          >
            {severity}
          </span>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ getValue }) => {
        const status = getValue<HandoverStatus>();
        const badgeStyles: Record<HandoverStatus, string> = {
          ACTIVE: "bg-red-50 text-red-600 border-red-200",
          SCHEDULED: "bg-amber-50 text-amber-600 border-amber-200",
          COMPLETING: "bg-orange-50 text-orange-600 border-orange-200",
          COMPLETED: "bg-green-50 text-green-600 border-green-200",
          MERGED: "bg-stone-100 text-stone-500 border-stone-200",
        };
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[11px] font-semibold ${badgeStyles[status]}`}
          >
            <span className="h-[5px] w-[5px] rounded-full bg-current"></span>
            {status}
          </span>
        );
      },
    },
    {
      header: "Owner",
      accessorKey: "currentOwnerLabel",
      cell: ({ getValue }) => (
        <span className="text-[13px] text-stone-800 whitespace-nowrap">
          {getValue<string>()}
        </span>
      ),
    },
    {
      header: "Transfer",
      accessorKey: "transferAt",
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-amber-600 whitespace-nowrap">
          {new Date(getValue<string>()).toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC",
          })}{" "}
          UTC
        </span>
      ),
    },
  ];

  return (
    <main className="flex min-h-screen max-w-[1600px] mx-auto flex-1 flex-col dark:bg-transparent">
      <Topbar activeIncidents={activeIncidentCount} />

      <div className="flex-1 p-7">
        {/* Page Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-stone-900 dark:text-white">
              Handover Center
            </h1>
            <p className="mt-1 text-[13px] text-stone-500 dark:text-zinc-400">
              Manage shift transitions and incident handovers across teams
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline-dark"
              onClick={() => setScheduleModalOpen(true)}
            >
              Scheduled
            </Button>
            <Button size="sm" onClick={() => setCreateModalOpen(true)}>
              Create Handover
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex w-fit gap-[1px] rounded bg-stone-100 p-[3px] dark:bg-zinc-800">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            const count =
              tab.value === "All"
                ? handovers.length
                : handovers.filter((h) => h.status === tab.value).length;

            return (
              <div
                key={tab.value}
                className={`flex cursor-pointer items-center gap-2 rounded-[3px] px-4 py-1.5 text-[13px] transition-all hover:text-stone-900 dark:hover:text-white ${
                  isActive
                    ? "bg-white font-medium text-stone-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                    : "text-stone-500 dark:text-zinc-400"
                }`}
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label}
                <span
                  className={`rounded-full px-1.5 py-[1px] font-mono text-[10px] font-semibold ${
                    isActive
                      ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-stone-200 text-stone-500 dark:bg-zinc-700 dark:text-zinc-400"
                  }`}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-stone-400">
              Loading handovers…
            </div>
          ) : filteredHandovers.length === 0 ? (
            <div className="p-8 text-center text-sm text-stone-400">
              No handovers in this view.
            </div>
          ) : (
            <Table
              data={filteredHandovers}
              columns={columns}
              onRowClick={(value) =>
                router.push(`/incident/handover/${value.id}`)
              }
            />
          )}
        </div>

        {/* Follow the Sun Schedule */}
        <SchedulePanel onManageClick={() => setScheduleModalOpen(true)} />

        {/* Archive Panel */}
        <ArchivePanel />
      </div>

      {/* Modals */}
      <CreateHandoverModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() =>
          queryClient.invalidateQueries({ queryKey: ["handovers"] })
        }
      />

      <ManageSchedulesModal
        isOpen={isScheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
      />
    </main>
  );
}
