"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  IncidentContextRecord,
  IncidentDetailRecord,
} from "@/lib/incident/incident.types";

interface ContextField {
  label: string;
  value: string;
  valueColor?: string;
  isDescription?: boolean;
}

const ContextBox = ({
  label,
  value,
  valueColor = "text-white",
  isDescription = false,
}: ContextField) => (
  <div
    className={cn(
      "p-4 md:p-5 bg-darkEzra border border-white/5 rounded-2xl transition-colors hover:border-white/10",
      isDescription ? "col-span-full" : "col-span-1"
    )}
  >
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
      {label}
    </p>
    <p
      className={cn(
        "text-[12px] md:text-[13px] font-semibold leading-relaxed break-words",
        valueColor,
        isDescription && "text-slate-300 font-medium"
      )}
    >
      {value}
    </p>
  </div>
);

const IncidentContextModule: React.FC<{
  incident: IncidentDetailRecord;
  context: IncidentContextRecord | null;
}> = ({ incident, context }) => {
  const fields: ContextField[] = [
    {
      label: "Affected Service",
      value: incident.service,
      valueColor: "text-blue-400",
    },
    {
      label: "Environment",
      value: [incident.environment, incident.region].filter(Boolean).join(" · "),
    },
    {
      label: "Source",
      value: incident.sourceType || incident.source,
      valueColor: "text-blue-400",
    },
    {
      label: "Business Impact",
      value:
        context?.businessImpact ||
        incident.financialExposure ||
        "Not captured yet",
    },
    {
      label: "Blast Radius",
      value: incident.blastRadius || "Not captured yet",
      valueColor: incident.blastRadius ? "text-amber-400" : "text-slate-400",
    },
    {
      label: "Incident Commander",
      value:
        context?.incidentCommander ||
        incident.incidentCommander ||
        "No incident commander assigned",
      valueColor: "text-amber-400",
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="w-full flex flex-col gap-4 p-3 md:p-4 rounded-xl border border-white/20 bg-transparent">
        <h2 className="text-[11px] md:text-[13px] font-bold text-white uppercase tracking-[0.15em] mb-1 px-1">
          Incident Context
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {fields.map((field, idx) => (
            <ContextBox key={idx} {...field} />
          ))}

          <ContextBox
            label="Description"
            isDescription
            value={
              context?.additionalContext ||
              incident.techDescription ||
              incident.description ||
              "No additional incident context has been captured yet."
            }
          />

          <div className="col-span-1 p-4 md:p-5 bg-darkEzra border border-white/5 rounded-2xl">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Assigned to
            </p>
            <p className="text-[12px] md:text-[13px] font-semibold text-white">
              {incident.assignedToName || incident.assignedToEmail || "Unassigned"}
            </p>
          </div>

          <div className="col-span-1 p-4 md:p-5 bg-darkEzra border border-white/5 rounded-2xl">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Priority
            </p>
            <p className="text-[12px] md:text-[13px] font-bold text-red-500">
              {incident.severity} · {incident.priority}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentContextModule;
