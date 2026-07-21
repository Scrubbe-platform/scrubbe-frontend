"use client";
import React from "react";
import { INCIDENT_ROWS, LEAD } from "./incidentDelivery.data";

const IncidentDetails = () => (
  <div className="rounded-xl border border-[#DDDDDD] bg-white dark:bg-zinc-900/40 overflow-hidden">
    {/* Header */}
    <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
      <div className="space-y-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
          Incident
        </p>
        <p className="text-[14px] font-semibold text-black dark:text-zinc-100">
          Raised from live incident context
        </p>
        <p className="text-[12px] text-black dark:text-zinc-500">
          Dedup keeps one incident per correlated failure pattern.
        </p>
      </div>
      <span className="px-2.5 py-1 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[11px] font-mono text-black dark:text-zinc-400 shrink-0">
        {LEAD.ticketId}
      </span>
    </div>

    {/* Body */}
    <div className="p-5 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {INCIDENT_ROWS.map((row) => (
          <div
            key={row.title}
            className={`rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 ${
              row.full ? "sm:col-span-2" : ""
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500 mb-2">
              {row.title}
            </p>
            {row.chips ? (
              <div className="flex flex-wrap gap-2">
                {row.value.split("·").map((chip) => (
                  <span
                    key={chip}
                    className="px-2.5 py-1 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[11px] font-medium text-zinc-600 dark:text-zinc-300"
                  >
                    {chip.trim()}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[12px] font-medium text-black dark:text-zinc-200 break-all leading-relaxed">
                {row.value}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default IncidentDetails;
