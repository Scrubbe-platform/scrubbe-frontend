"use client";

import React from "react";
import Link from "next/link";
import { useIncidentDetail } from "@/hooks/useIncidentWorkspace";
import { useIncidentSelection } from "@/hooks/useIncidentSelection";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";

const IncidentRouteShell = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: (incident: IncidentDetailRecord) => React.ReactNode;
}) => {
  const { incidentId } = useIncidentSelection();
  const detailQuery = useIncidentDetail(incidentId);
  const incident = detailQuery.data ?? null;

  if (!incidentId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 dark:bg-dark dark:text-slate-200">
        <div className="max-w-xl rounded-3xl border dark:border-white/10 bg-white/[0.02] p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] dark:text-slate-500">
            {title}
          </p>
          <h1 className="mt-4 text-3xl font-bold dark:text-white">
            Select an incident first
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            This incident page follows the currently selected incident. Open the
            incident workspace and choose an incident to continue.
          </p>
          <Link
            href="/incident"
            className="mt-6 inline-flex rounded-lg border border-green-500/40 px-4 py-2 text-sm font-semibold text-green-400"
          >
            Go to incident workspace
          </Link>
        </div>
      </div>
    );
  }

  if (detailQuery.isLoading) {
    return (
      <div className="min-h-screen p-8 bg-dark text-slate-200 space-y-4">
        <div className="h-24 rounded-2xl border border-white/10 bg-white/[0.03]" />
        <div className="h-64 rounded-2xl border border-white/10 bg-white/[0.03]" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-dark text-slate-200">
        <div className="max-w-xl rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            {title}
          </p>
          <h1 className="mt-4 text-3xl font-bold text-white">
            That incident could not be resolved
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            The selected incident id is invalid or no longer available. Choose a
            different incident from the main workspace.
          </p>
          <Link
            href="/incident"
            className="mt-6 inline-flex rounded-lg border border-green-500/40 px-4 py-2 text-sm font-semibold text-green-400"
          >
            Back to incident workspace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-slate-200">
      <div className="border-b border-white/10 bg-darkEzra/70 px-6 py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              {title}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-white">
                {incident.ticketId}
              </h1>
              <span className="rounded border border-red-500/30 bg-red-500/5 px-2 py-1 text-[10px] font-bold uppercase text-red-400">
                {incident.severity} · {incident.priority}
              </span>
              <span className="rounded border border-white/10 px-2 py-1 text-[10px] font-bold uppercase text-slate-400">
                {incident.status}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-300">{incident.title}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
              {[incident.service, incident.environment, incident.region]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {description ? (
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                {description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/incident?id=${incident.id}&tab=overview`}
              className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300"
            >
              Overview
            </Link>
            <Link
              href={`/incident?id=${incident.id}&tab=context`}
              className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300"
            >
              Context
            </Link>
            <Link
              href={`/incident/tickets/${incident.id}`}
              className="rounded-lg border border-green-500/40 px-4 py-2 text-xs font-semibold text-green-400"
            >
              Open war room
            </Link>
          </div>
        </div>
      </div>

      {children(incident)}
    </div>
  );
};

export default IncidentRouteShell;
