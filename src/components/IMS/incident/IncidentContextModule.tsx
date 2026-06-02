"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  IncidentContextRecord,
  IncidentDetailRecord,
} from "@/lib/incident/incident.types";

// ── Field box ────────────────────────────────────────────────────

interface ContextField {
  label: string;
  value: string;
  accent?: "default" | "blue" | "amber" | "red" | "muted";
  span?: "full" | "half";
  description?: boolean;
}

const accentValue: Record<string, string> = {
  default: "text-zinc-800 dark:text-zinc-100",
  blue:    "text-sky-600 dark:text-sky-400",
  amber:   "text-amber-600 dark:text-amber-400",
  red:     "text-red-600 dark:text-red-400",
  muted:   "text-zinc-400 dark:text-zinc-500",
};

const ContextBox = ({ label, value, accent = "default", span = "half", description = false }: ContextField) => (
  <div
    className={cn(
      "flex flex-col gap-1.5 p-4 rounded-xl border bg-white dark:bg-zinc-900/40 transition-colors",
      "border-zinc-100 dark:border-zinc-800/60",
      span === "full" && "sm:col-span-2"
    )}
  >
    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
      {label}
    </p>
    <p
      className={cn(
        "text-[13px] leading-relaxed break-words",
        description ? "font-normal text-zinc-500 dark:text-zinc-400" : "font-semibold",
        accentValue[accent]
      )}
    >
      {value}
    </p>
  </div>
);

// ── Module ───────────────────────────────────────────────────────

const IncidentContextModule: React.FC<{
  incident: IncidentDetailRecord;
  context: IncidentContextRecord | null;
}> = ({ incident, context }) => {

  const fields: ContextField[] = [
    {
      label: "Affected Service",
      value: incident.service,
      accent: "blue",
    },
    {
      label: "Environment",
      value: [incident.environment, incident.region].filter(Boolean).join(" · "),
    },
    {
      label: "Source",
      value: incident.sourceType || incident.source,
      accent: "blue",
    },
    {
      label: "Business Impact",
      value: context?.businessImpact || incident.financialExposure || "Not captured yet",
      accent: context?.businessImpact || incident.financialExposure ? "default" : "muted",
    },
    {
      label: "Blast Radius",
      value: incident.blastRadius || "Not captured yet",
      accent: incident.blastRadius ? "amber" : "muted",
    },
    {
      label: "Incident Commander",
      value: context?.incidentCommander || incident.incidentCommander || "Not assigned",
      accent: context?.incidentCommander || incident.incidentCommander ? "amber" : "muted",
    },
    {
      label: "Assigned to",
      value: incident.assignedToName || incident.assignedToEmail || "Unassigned",
      accent: incident.assignedToName || incident.assignedToEmail ? "default" : "muted",
    },
    {
      label: "Priority",
      value: `${incident.severity} · ${incident.priority}`,
      accent: "red",
    },
    {
      label: "Description",
      value:
        context?.additionalContext ||
        incident.techDescription ||
        incident.description ||
        "No additional context captured yet.",
      span: "full",
      description: true,
    },
  ];

  return (
    <div className="px-5 md:px-8 py-6 border-b border-zinc-100 dark:border-white/[0.06]">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">
        Incident Context
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {fields.map((field) => (
          <ContextBox key={field.label} {...field} />
        ))}
      </div>
    </div>
  );
};

export default IncidentContextModule;