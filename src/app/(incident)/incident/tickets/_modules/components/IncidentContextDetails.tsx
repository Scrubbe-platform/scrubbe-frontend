// components/incident/IncidentContextSidebar.tsx
"use client";

import React from "react";
import { ChevronRight, Layers, ArrowUpRight } from "lucide-react";
import { IncidentListItem } from "@/lib/incident/incident.types";
import Button from "@/components/ui/Button1";
import { priColors } from "./IncidentLibrary";
import { TICKET_STATUS_CONFIG } from "@/components/IMS/incident/IncidentLifecycle";
import { useRouter } from "next/navigation";

interface IncidentContextSidebarProps {
  incident: IncidentListItem | null;
  onOpenIncident?: (id: string) => void;
  onOpenPlaybook?: (playbookName: string) => void;
}

export default function IncidentContextDetails({
  incident,
  onOpenIncident,
  onOpenPlaybook,
}: IncidentContextSidebarProps) {
  // Fallback placeholder dataset matching the exact values of image_c76b7f.png if no runtime item is selected
  const activeData = incident;
  const router = useRouter();
  const sla = true;
  const errorBudget = 65;
  // Circular progress math configurations matching blueprint properties
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - errorBudget / 100);

  if (incident === null) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
        {/* Card Header */}
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-900  dark:bg-zinc-900/10">
          <h3 className="text-[10px] font-semibold uppercase text-zinc-700 dark:text-zinc-300">
            Knowledge Base
          </h3>
        </div>
        <div className="p-4 space-y-4 text-xs text-zinc-400 dark:text-zinc-500">
          <p>
            Select an incident to surface its people, related incidents,
            signals, and SLA posture.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full space-y-4 font-sans select-none animate-fadeIn">
      {/* ───────────────── CARD 1: KNOWLEDGE BASE ───────────────── */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
        {/* Card Header */}
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-900  dark:bg-zinc-900/10">
          <h3 className="text-[10px] font-semibold uppercase text-zinc-700 dark:text-zinc-300">
            Knowledge Base
          </h3>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-4 text-xs">
          {/* Root Cause Section */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase text-zinc-400 dark:text-zinc-500">
              Root Cause
            </span>
            <p className="text-zinc-800 dark:text-zinc-300 font-medium leading-relaxed">
              {activeData?.reason ||
                "Recommendations exceeded provisioned capacity during a traffic surge."}
            </p>
          </div>

          {/* Primary Signals Section */}
          {activeData?.source && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold uppercase text-zinc-400 dark:text-zinc-500">
                Primary Signals
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeData.source
                  .split(/[,;|]+/)
                  .map((signal) => signal.trim())
                  .filter(Boolean)
                  .map((signal) => (
                    <span
                      key={signal}
                      className="px-2.5 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 font-medium font-mono text-[10px] shadow-3xs"
                    >
                      {signal}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Similar Incidents Section */}

          {/* Recommended Playbook Section */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase text-zinc-400 dark:text-zinc-500">
              Recommended Playbook
            </span>
            <div>
              <button
                type="button"
                onClick={() =>
                  onOpenPlaybook?.(
                    activeData?.recommendedActions[0] || "Emergency Scale-Out",
                  )
                }
                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline group"
              >
                {activeData?.recommendedActions[0] || "Emergency Scale-Out"}
                <ChevronRight
                  size={12}
                  className="text-blue-500 transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </div>
          </div>

          {/* Lessons Learned Section */}
          {activeData?.summary && (
            <div className="space-y-1">
              <span className="text-[10px] font-semibold uppercase text-zinc-400 dark:text-zinc-500">
                Summary
              </span>
              <p className="text-zinc-500 dark:text-zinc-400 font-normal leading-relaxed">
                {activeData.summary}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ───────────────── CARD 2: SELECTED INCIDENT ───────────────── */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
        {/* Card Header */}
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-900  dark:bg-zinc-900/10">
          <h3 className="text-[10px] font-semibold uppercase text-zinc-700 dark:text-zinc-300">
            Selected Incident
          </h3>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-4">
          <div className="space-y-1">
            <span className="font-mono text-[11.5px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-tight">
              {activeData?.ticketId}
            </span>
            <h4 className="text-[13.5px] font-semibold text-zinc-900 dark:text-white tracking-tight leading-snug">
              {activeData?.title}
            </h4>
          </div>

          {/* Priority & Status Row badges line */}
          <div className="flex items-center gap-2.5 text-xs">
            <span
              className={`inline-flex items-center justify-center h-5 min-w-[28px] px-1.5 rounded ${priColors[activeData?.severity || "P3"]}`}
            >
              {activeData?.severity}
            </span>

            <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
              <span
                className={`h-2 w-2 rounded-full ${TICKET_STATUS_CONFIG.find((s) => s.label === activeData?.status)?.dotColor || "bg-zinc-400"}`}
              />
              {activeData?.status}
            </span>
          </div>

          {/* Action Trigger Button */}
          <Button
            type="button"
            size="sm"
            className="w-full justify-center"
            onClick={() =>
              router.push(`/incident/tickets?id=${activeData?.id}`)
            }
          >
            Open Incident
          </Button>
        </div>
      </div>

      {/* ───────────────── CARD 3: SLA & ERROR BUDGET ───────────────── */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
        {/* Card Header */}
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-900  dark:bg-zinc-900/10">
          <h3 className="text-[10px] font-semibold uppercase text-zinc-700 dark:text-zinc-300">
            SLA &amp; Error Budget
          </h3>
        </div>

        {/* Card Body Grid Matrix layout */}
        <div className="p-4 flex items-center gap-5">
          {/* Managed Circular SVG Progress Ring */}
          <div className="relative h-11 w-11 shrink-0 select-none">
            <svg
              width="44"
              height="44"
              viewBox="0 0 44 44"
              className="-rotate-90"
            >
              {/* Background Track Ring */}
              <circle
                cx="22"
                cy="22"
                r={radius}
                fill="none"
                stroke="#ebebef"
                strokeWidth="3.5"
                className="dark:stroke-zinc-800"
              />
              {/* Colored Active Arc Segment */}
              <circle
                cx="22"
                cy="22"
                r={radius}
                fill="none"
                stroke="#1f9d5b"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-mono font-semibold text-[10px] text-zinc-900 dark:text-white tnum">
              {errorBudget}%
            </span>
          </div>

          {/* Metric Descriptions Row Alignment */}
          <div className="flex-1 text-[10px] font-medium text-zinc-600 dark:text-zinc-400 space-y-1.5">
            <div className="flex justify-between items-center">
              <span>Error Budget Left</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono tnum">
                {errorBudget}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>SLA compliance</span>
              <span
                className={`font-semibold ${sla ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}
              >
                {sla ? "Within SLA" : "Breached"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
