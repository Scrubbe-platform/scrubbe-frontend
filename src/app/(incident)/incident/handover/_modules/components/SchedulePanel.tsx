// components/SchedulePanel.tsx
"use client";
import React from "react";
import Button from "@/components/ui/Button1";
import { mockSchedules } from "../libs/handoverTickets";

interface SchedulePanelProps {
  onManageClick: () => void;
}

export default function SchedulePanel({ onManageClick }: SchedulePanelProps) {
  return (
    <div className="mt-6">
      {/* Header */}
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-stone-900 dark:text-white">
          Follow-the-Sun Schedule
        </h2>
        <Button variant="outline-dark" size="sm" onClick={onManageClick}>
          Manage Schedules
        </Button>
      </div>

      {/* List Wrapper */}
      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="px-5 py-1">
          {mockSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className="flex items-center gap-3.5 border-b border-stone-100 py-3 last:border-none dark:border-zinc-800"
            >
              {/* Time */}
              <span className="w-[60px] font-mono text-xs font-medium text-blue-600">
                {schedule.time}
              </span>

              {/* Route & Recurrence */}
              <div className="flex-1">
                <div className="text-[13px] font-medium text-stone-900 dark:text-white">
                  {schedule.fromRegion} → {schedule.toRegion}
                </div>
                <div className="mt-0.5 text-[11px] text-stone-500 dark:text-zinc-400">
                  {schedule.recurrence}
                </div>
              </div>

              {/* Active Indicator Dot */}
              <div className="h-2 w-2 shrink-0 rounded-full bg-green-500"></div>
            </div>
          ))}

          {/* Empty State */}
          {mockSchedules.length === 0 && (
            <div className="p-5 text-center text-[13px] text-stone-500 dark:text-zinc-400">
              No active schedules.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
