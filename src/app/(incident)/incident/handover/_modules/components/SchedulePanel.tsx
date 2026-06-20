// components/SchedulePanel.tsx
"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/ui/Button1";
import { fetchHandoverSchedules } from "@/lib/handover/handover.api";

interface SchedulePanelProps {
  onManageClick: () => void;
}

export default function SchedulePanel({ onManageClick }: SchedulePanelProps) {
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["handover-schedules"],
    queryFn: fetchHandoverSchedules,
  });

  const activeSchedules = schedules.filter((s) => s.isActive);

  return (
    <div className="mt-6">
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-stone-900 dark:text-white">Follow-the-Sun Schedule</h2>
        <Button variant="outline-dark" size="sm" onClick={onManageClick}>
          Manage Schedules
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="px-5 py-1">
          {isLoading ? (
            <div className="p-5 text-center text-[13px] text-stone-500 dark:text-zinc-400">Loading…</div>
          ) : (
            <>
              {activeSchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center gap-3.5 border-b border-stone-100 py-3 last:border-none dark:border-zinc-800"
                >
                  <span className="w-[60px] font-mono text-xs font-medium text-blue-600">{schedule.transferTime}</span>

                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-stone-900 dark:text-white">
                      {schedule.fromLabel} → {schedule.toLabel}
                    </div>
                    <div className="mt-0.5 text-[11px] text-stone-500 dark:text-zinc-400">
                      {schedule.label || schedule.scheduleType}
                    </div>
                  </div>

                  <div className="h-2 w-2 shrink-0 rounded-full bg-green-500"></div>
                </div>
              ))}

              {activeSchedules.length === 0 && (
                <div className="p-5 text-center text-[13px] text-stone-500 dark:text-zinc-400">
                  No active schedules.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
