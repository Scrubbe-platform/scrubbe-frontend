"use client";
import React, { useEffect, useState } from "react";
import { INCIDENT_ROWS, LEAD } from "./incidentDelivery.data";
import { customAxios } from "@/lib/api/axios";
import { endpoint } from "@/lib/api/endpoint";

const IncidentDetails = ({ incidentId }: { incidentId?: string }) => {
  const [ticketId, setTicketId] = useState(LEAD.ticketId);
  const [rows, setRows] = useState(INCIDENT_ROWS);

  useEffect(() => {
    if (!incidentId) return;
    customAxios.get(`${endpoint.incident_ticket.getTicket}/${incidentId}`).then((res) => {
      const inc = res.data?.data ?? res.data;
      if (!inc) return;
      setTicketId(inc.ticketId ?? inc.id ?? LEAD.ticketId);
      setRows([
        { title: "Incident ID", value: inc.ticketId ?? inc.id ?? LEAD.ticketId },
        { title: "Correlation key", value: inc.correlationKey ?? `${inc.affectedSystem ?? "service"} · ${inc.rootCause ?? "unknown"} · ${inc.environment ?? "prod"}` },
        { title: "Severity", value: inc.severity ?? "P2" },
        { title: "Status", value: inc.status ?? "INVESTIGATING" },
        { title: "Affected system", value: inc.affectedSystem ?? inc.service ?? "—" },
        { title: "Assigned to", value: inc.assignedTo ?? inc.owner ?? "On-call team" },
        { title: "Created", value: inc.createdAt ? new Date(inc.createdAt).toLocaleString() : "—" },
        { title: "Description", value: inc.summary ?? inc.description ?? INCIDENT_ROWS.find((r) => r.title === "Description")?.value ?? "—", full: true },
      ] as typeof INCIDENT_ROWS);
    }).catch(() => {});
  }, [incidentId]);

  return (
  <div className="rounded-2xl border border-[#DDDDDD] bg-white dark:bg-zinc-900/40 overflow-hidden">
    {/* Header strip */}
    <div className="flex items-center justify-between gap-4 px-6 py-3.5 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-100 dark:border-zinc-800">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-black/50 dark:text-zinc-500">
        Incident
      </p>
      <p className="text-[13px] font-bold font-mono text-black dark:text-zinc-100">
        {ticketId}
      </p>
    </div>

    {/* Body */}
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-black dark:text-zinc-100">
          Raised from live incident context
        </h2>
        <p className="text-[13.5px] text-black/50 dark:text-zinc-500 mt-1 leading-relaxed">
          Dedup keeps one incident per correlated failure pattern.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rows.map((row) => (
          <div
            key={row.title}
            className={`rounded-xl bg-zinc-50 dark:bg-zinc-900/60 p-4 ${
              row.full ? "sm:col-span-2" : ""
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest text-black/40 dark:text-zinc-500 mb-2">
              {row.title}
            </p>
            {row.chips ? (
              <div className="flex flex-wrap gap-2">
                {row.value.split("·").map((chip) => (
                  <span
                    key={chip}
                    className="px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[12.5px] font-medium text-black dark:text-zinc-300"
                  >
                    {chip.trim()}
                  </span>
                ))}
              </div>
            ) : (
              <p
                className={`text-[14.5px] font-bold text-black dark:text-zinc-200 break-all leading-relaxed ${
                  row.link ? "underline underline-offset-2" : ""
                }`}
              >
                {row.value}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);
};

export default IncidentDetails;
