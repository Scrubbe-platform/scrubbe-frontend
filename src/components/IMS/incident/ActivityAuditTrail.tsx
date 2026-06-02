"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { IncidentHistoryRecord } from "@/lib/incident/incident.types";

type AuditEventType =
  | "Signal"
  | "Policy"
  | "Playbook"
  | "Guardrail"
  | "Notification"
  | "Enrichment";

interface AuditEvent {
  id: string;
  type: AuditEventType;
  label: string;
  content: string;
  timestamp: string;
  initial: string;
}

// ── Event type styles ────────────────────────────────────────────

const typeConfig: Record<AuditEventType, { dot: string; badge: string }> = {
  Signal:       { dot: "border-amber-400 text-amber-500 bg-amber-50 dark:bg-amber-500/10",           badge: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20"       },
  Policy:       { dot: "border-purple-400 text-purple-500 bg-purple-50 dark:bg-purple-500/10",        badge: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20"   },
  Playbook:     { dot: "border-emerald-400 text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",    badge: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20" },
  Guardrail:    { dot: "border-orange-400 text-orange-500 bg-orange-50 dark:bg-orange-500/10",        badge: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20"   },
  Notification: { dot: "border-teal-400 text-teal-500 bg-teal-50 dark:bg-teal-500/10",               badge: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/20"               },
  Enrichment:   { dot: "border-indigo-400 text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10",       badge: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20"   },
};

// ── Single event row ─────────────────────────────────────────────

const EventRow = ({ event, isLast }: { event: AuditEvent; isLast: boolean }) => {
  const cfg = typeConfig[event.type];

  return (
    <div className="flex gap-3 relative">
      {/* vertical connector */}
      {!isLast && (
        <div className="absolute left-[15px] top-9 w-px h-[calc(100%-12px)] bg-zinc-100 dark:bg-zinc-800 z-0" />
      )}

      {/* Avatar dot */}
      <div
        className={cn(
          "w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-colors",
          cfg.dot
        )}
      >
        <span className="text-[11px] font-bold">{event.initial}</span>
      </div>

      {/* Card */}
      <div className="flex-1 min-w-0 pb-5">
        <div className="rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 px-4 py-3 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between gap-2 mb-2">
            {/* Type badge */}
            <span className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border",
              cfg.badge
            )}>
              {event.label}
            </span>

            {/* Timestamp */}
            <span className="text-[11px] font-mono text-zinc-300 dark:text-zinc-600 tabular-nums shrink-0">
              {event.timestamp}
            </span>
          </div>

          <p className="text-[13px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {event.content}
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Data builder ─────────────────────────────────────────────────

const actionTypeMap: Record<string, AuditEventType> = {
  created:        "Signal",
  status_changed: "Policy",
  updated:        "Enrichment",
  resolved:       "Playbook",
  comment_added:  "Notification",
};

const buildAuditEvents = (history: IncidentHistoryRecord[]): AuditEvent[] =>
  history.map((event) => {
    const type = actionTypeMap[event.action] ?? "Enrichment";
    const changeSummary =
      event.oldValue || event.newValue
        ? [event.oldValue, event.newValue].filter(Boolean).join(" → ")
        : event.comment;

    return {
      id: event.id,
      type,
      label: event.action.replaceAll("_", " "),
      initial: event.actor.slice(0, 1).toUpperCase() || "S",
      timestamp: event.timestamp,
      content: `${event.actor} · ${changeSummary || "No details recorded"}`,
    };
  });

// ── Section ──────────────────────────────────────────────────────

const ActivityAuditTrail: React.FC<{ history: IncidentHistoryRecord[] }> = ({ history }) => {
  const events = buildAuditEvents(history);

  return (
    <div className="px-5 md:px-8 py-6">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-5">
        Activity & Audit Trail
      </p>

      {events.length > 0 ? (
        <div className="flex flex-col">
          {events.map((event, idx) => (
            <EventRow key={event.id} event={event} isLast={idx === events.length - 1} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 px-5 py-6 text-[13px] text-zinc-400 dark:text-zinc-500">
          No audit events have been recorded for this incident yet.
        </div>
      )}
    </div>
  );
};

export default ActivityAuditTrail;