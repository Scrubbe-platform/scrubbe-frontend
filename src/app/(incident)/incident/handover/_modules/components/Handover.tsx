// app/handovers/page.tsx
"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table"; // Import TanStack types
import Topbar from "../components/Topbar";
import ArchivePanel from "../components/ArchivePanel";
import SchedulePanel from "../components/SchedulePanel";
import { Table } from "@/components/ui/table"; // Your TanStack Table component
import Button from "@/components/ui/Button1";

import { mockHandovers } from "../libs/handoverTickets";
import { Status, Handover } from "../types/index"; // Make sure to import Handover type
import CreateHandoverModal from "./CreateHandoverModal";
import TransferOwnershipModal from "./TransferOwnership";
import AddTaskModal from "./AddTaskModal";
import ManageSchedulesModal from "../components/ManageScheduleModal";
import { useRouter } from "next/navigation";

export default function HandoverCenterPage() {
  const [activeTab, setActiveTab] = useState<"All" | Status>("All");
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [isTransferModalOpen, setTransferModalOpen] = useState(false);
  const [isAddTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [activeShift, setActiveShift] = useState<"12hr" | "8hr">("12hr");
  const router = useRouter();
  // Filter logic based on tabs
  const filteredHandovers =
    activeTab === "All"
      ? mockHandovers
      : mockHandovers.filter((h) => h.status === activeTab);

  // TanStack React Table Column Definitions
  const columns: ColumnDef<Handover>[] = [
    {
      header: "Handover ID",
      accessorKey: "id",
      cell: ({ row }) => (
        <div className="font-mono text-xs font-medium text-blue-600">
          {row.original.id}
        </div>
      ),
    },
    {
      header: "Primary Incident",
      id: "primaryIncident", // Use id instead of accessorKey for complex nested objects
      cell: ({ row }) => {
        const { primaryIncident, additionalIncidentsCount } = row.original;
        return (
          <>
            <div className="font-medium text-stone-900">
              {primaryIncident.title}
            </div>
            <div className="mt-[1px] font-mono text-[11px] text-stone-500">
              {primaryIncident.id}{" "}
              {additionalIncidentsCount > 0 &&
                `+${additionalIncidentsCount} MORE`}
            </div>
          </>
        );
      },
    },
    {
      header: "Incidents",
      accessorKey: "totalIncidents",
      cell: ({ getValue }) => (
        <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-600 whitespace-nowrap">
          {getValue<number>()} incidents
        </span>
      ),
    },
    {
      header: "Severity",
      accessorKey: "severity",
      cell: ({ getValue }) => {
        const severity = getValue<string>();
        const severityStyles: Record<string, string> = {
          Critical: "text-red-600",
          High: "text-amber-600",
          Medium: "text-blue-600",
          Low: "text-green-600",
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
        const status = getValue<string>();
        const badgeStyles: Record<string, string> = {
          Active: "bg-red-50 text-red-600 border-red-200",
          Scheduled: "bg-amber-50 text-amber-600 border-amber-200",
          Completed: "bg-green-50 text-green-600 border-green-200",
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
      accessorKey: "owner",
      cell: ({ getValue }) => (
        <span className="text-[13px] text-stone-800 whitespace-nowrap">
          {getValue<string>()}
        </span>
      ),
    },
    {
      header: "Transfer",
      accessorKey: "transferTime",
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-amber-600 whitespace-nowrap">
          {getValue<string>()}
        </span>
      ),
    },
  ];

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-white dark:bg-transparent">
      <Topbar activeIncidents={3} />

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
            {/* Shift Selector */}
            {/* Dynamic Shift Selector */}
            <div className="flex items-center gap-[1px] rounded bg-stone-100 p-[3px] dark:bg-zinc-800">
              {/* Prefix Label */}
              <span className="whitespace-nowrap px-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                Shift
              </span>

              {/* Shift Options */}
              {["12hr", "8hr"].map((shift) => {
                const isActive = activeShift === shift;
                return (
                  <button
                    key={shift}
                    type="button"
                    onClick={() => setActiveShift(shift as any)}
                    className={`rounded-[3px] px-2.5 py-1 font-mono text-[11px] font-medium transition-all ${
                      isActive
                        ? "bg-white text-stone-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                        : "text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-white"
                    }`}
                  >
                    {shift}
                  </button>
                );
              })}

              {/* Dynamic Time Window Display */}
              <span className="ml-1 rounded-[3px] border border-stone-200 bg-white px-2 py-1 font-mono text-[11px] text-stone-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                {activeShift === "12hr" ? "06:00–18:00 UTC" : "06:00–14:00 UTC"}
              </span>
            </div>
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
          {["All", "Active", "Scheduled", "Completed"].map((tab) => {
            const isActive = activeTab === tab;
            const count =
              tab === "All"
                ? mockHandovers.length
                : mockHandovers.filter((h) => h.status === tab).length;

            return (
              <div
                key={tab}
                className={`flex cursor-pointer items-center gap-2 rounded-[3px] px-4 py-1.5 text-[13px] transition-all hover:text-stone-900 dark:hover:text-white ${
                  isActive
                    ? "bg-white font-medium text-stone-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                    : "text-stone-500 dark:text-zinc-400"
                }`}
                onClick={() => setActiveTab(tab as any)}
              >
                {tab}
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

        {/* TanStack Table Integration */}
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <Table
            data={filteredHandovers}
            columns={columns}
            onRowClick={(value) =>
              router.push(`/incident/handover/${value.id}`)
            }
          />
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
      />

      <TransferOwnershipModal
        isOpen={isTransferModalOpen}
        onClose={() => setTransferModalOpen(false)}
      />

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setAddTaskModalOpen(false)}
      />
      <ManageSchedulesModal
        isOpen={isScheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
      />
    </main>
  );
}
