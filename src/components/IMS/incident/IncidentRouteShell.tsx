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

  // ── Empty state ──────────────────────────────────────────────
  if (!incidentId) {
    return (
      <EmptyState
        label={title}
        heading="Select an incident first"
        body="This page follows the currently selected incident. Open the incident workspace and choose an incident to continue."
        href="/incident"
        linkLabel="Go to incident workspace"
      />
    );
  }

  // ── Loading state ────────────────────────────────────────────
  if (detailQuery.isLoading) {
    return (
      <div className="min-h-screen p-8 bg-white dark:bg-zinc-950 space-y-3">
        <div className="h-20 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 animate-pulse" />
        <div className="h-56 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 animate-pulse" />
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────
  if (!incident) {
    return (
      <EmptyState
        label={title}
        heading="Incident could not be resolved"
        body="The selected incident ID is invalid or no longer available. Choose a different incident from the main workspace."
        href="/incident"
        linkLabel="Back to incident workspace"
      />
    );
  }

  // ── Content ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-zinc-200">

      {/* Shell header */}
      <div className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-6 py-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

          {/* Left — incident info */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
              {title}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[20px] font-bold tracking-tight text-black dark:text-white">
                {incident.ticketId}
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold border border-red-200 dark:border-red-500/25 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/8">
                {incident.severity} · {incident.priority}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold border border-zinc-500 dark:border-zinc-700 text-black dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60">
                {incident.status}
              </span>
            </div>

            <p className="text-[14px] text-zinc-600 dark:text-zinc-300 leading-snug">
              {incident.title}
            </p>

            <p className="text-[11px] font-mono text-black dark:text-zinc-500">
              {[incident.service, incident.environment, incident.region]
                .filter(Boolean)
                .join(" · ")}
            </p>

            {description && (
              <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-black dark:text-zinc-400">
                {description}
              </p>
            )}
          </div>

          {/* Right — actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              href={`/incident?id=${incident.id}&tab=overview`}
              className="px-4 py-2 rounded-lg text-[12px] font-semibold border border-zinc-500 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Overview
            </Link>
            <Link
              href={`/incident?id=${incident.id}&tab=context`}
              className="px-4 py-2 rounded-lg text-[12px] font-semibold border border-zinc-500 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Context
            </Link>
            <Link
              href={`/incident/tickets/${incident.id}`}
              className="px-4 py-2 rounded-lg text-[12px] font-semibold bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors"
            >
              War Room
            </Link>
          </div>
        </div>
      </div>

      {children(incident)}
    </div>
  );
};

// ── Shared empty / error state ────────────────────────────────────

const EmptyState = ({
  label,
  heading,
  body,
  href,
  linkLabel,
}: {
  label: string;
  heading: string;
  body: string;
  href: string;
  linkLabel: string;
}) => (
  <div className="min-h-screen flex items-center justify-center p-8 bg-white dark:bg-zinc-950">
    <div className="max-w-md w-full rounded-2xl border border-zinc-500 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-8 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500 mb-4">
        {label}
      </p>
      <h1 className="text-[22px] font-bold text-black dark:text-white mb-3">
        {heading}
      </h1>
      <p className="text-[13px] leading-relaxed text-black dark:text-zinc-400 mb-6">
        {body}
      </p>
      <Link
        href={href}
        className="inline-flex px-5 py-2.5 rounded-lg text-[13px] font-semibold border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        {linkLabel}
      </Link>
    </div>
  </div>
);

export default IncidentRouteShell;