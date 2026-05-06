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

const EventRow = ({
  event,
  isLast,
}: {
  event: AuditEvent;
  isLast: boolean;
}) => {
  const styles: Record<AuditEventType, { dot: string; text: string }> = {
    Signal: { dot: "border-amber-500 text-amber-500", text: "text-pink-500" },
    Policy: {
      dot: "border-purple-500 text-purple-500",
      text: "text-orange-500",
    },
    Playbook: {
      dot: "border-emerald-500 text-emerald-500",
      text: "text-emerald-500",
    },
    Guardrail: {
      dot: "border-orange-500 text-orange-500",
      text: "text-yellow-500",
    },
    Notification: {
      dot: "border-teal-500 text-teal-500",
      text: "text-indigo-400",
    },
    Enrichment: {
      dot: "border-indigo-500 text-indigo-500",
      text: "text-slate-400",
    },
  };

  const currentStyle = styles[event.type];

  return (
    <div className="flex gap-3 md:gap-6 relative">
      {!isLast && (
        <div className="absolute left-[15px] md:left-[19px] top-10 w-[1px] h-[calc(100%-24px)] bg-slate-800 z-0" />
      )}

      <div
        className={cn(
          "w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center shrink-0 z-10 bg-darkEzra transition-all",
          currentStyle.dot
        )}
      >
        <span className="text-[10px] md:text-xs font-bold">{event.initial}</span>
      </div>

      <div className="flex-1 bg-darkEzra border border-white/5 rounded-xl p-3 md:p-4 mb-6 hover:border-white/10 transition-all min-w-0">
        <div className="flex flex-wrap justify-between items-start gap-x-2 mb-1">
          <span
            className={cn(
              "text-[9px] md:text-[10px] font-bold uppercase tracking-widest",
              currentStyle.text
            )}
          >
            {event.label}
          </span>
          <span className="text-[9px] md:text-[10px] font-mono text-slate-600 tabular-nums">
            {event.timestamp}
          </span>
        </div>
        <p className="text-[12px] md:text-[14px] font-semibold text-slate-200 leading-relaxed break-words">
          {event.content}
        </p>
      </div>
    </div>
  );
};

const actionTypeMap: Record<string, AuditEventType> = {
  created: "Signal",
  status_changed: "Policy",
  updated: "Enrichment",
  resolved: "Playbook",
  comment_added: "Notification",
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

const ActivityAuditTrail: React.FC<{ history: IncidentHistoryRecord[] }> = ({
  history,
}) => {
  const events = buildAuditEvents(history);

  return (
    <div className="p-4 md:p-6">
      <div className="w-full flex flex-col gap-4 p-3 md:p-4 rounded-xl border border-white/20">
        <h2 className="text-[11px] md:text-[13px] font-bold text-slate-600 uppercase tracking-[0.15em] mb-1 px-1">
          Activity & Audit Trail
        </h2>
        <div className="w-full flex flex-col pt-2">
          {events.length > 0 ? (
            events.map((event, idx) => (
              <EventRow
                key={event.id}
                event={event}
                isLast={idx === events.length - 1}
              />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-sm text-slate-400">
              No audit events have been recorded for this incident yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityAuditTrail;
