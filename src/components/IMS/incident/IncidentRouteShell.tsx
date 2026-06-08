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
