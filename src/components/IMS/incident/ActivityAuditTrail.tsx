"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { IncidentHistoryRecord } from "@/lib/incident/incident.types";
import { MdOutlineChat } from "react-icons/md";
import { Paperclip, MoreVertical, ChevronDown, ChevronUp } from "lucide-react";

type AuditEventType =
  | "Signal"
  | "Policy"
  | "Playbook"
  | "Guardrail"
  | "Notification"
  | "Enrichment"
  | "Comment";

interface AuditEvent {
  id: string;
  type: AuditEventType;
  label: string;
  content: string;
  timestamp: string;
  initial: string;
  actor: string;
  isLocalComment?: boolean;
}

// Fixed Theme color configurations using static utilities Tailwind can read reliably
const typeConfig: Record<
  AuditEventType,
  { dot: string; text: string; badge: string }
> = {
  Signal: {
    dot: "bg-amber-500 border-amber-400",
    text: "text-amber-500",
    badge:
      "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  },
  Policy: {
    dot: "bg-purple-500 border-purple-400",
    text: "text-purple-500",
    badge:
      "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
  },
  Playbook: {
    dot: "bg-emerald-500 border-emerald-400",
    text: "text-emerald-500",
    badge:
      "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  },
  Guardrail: {
    dot: "bg-orange-500 border-orange-400",
    text: "text-orange-500",
    badge:
      "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
  },
  Notification: {
    dot: "bg-teal-500 border-teal-400",
    text: "text-teal-500",
    badge:
      "text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20",
  },
  Enrichment: {
    dot: "bg-indigo-500 border-indigo-400",
    text: "text-indigo-500",
    badge:
      "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
  },
  Comment: {
    dot: "bg-blue-500 border-blue-400",
    text: "text-blue-500",
    badge:
      "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  },
};

const EventRow = ({
  event,
  isLast,
}: {
  event: AuditEvent;
  isLast: boolean;
}) => {
  const cfg = typeConfig[event.type] || typeConfig.Enrichment;

  return (
    <div className="flex items-start gap-4 relative group min-h-[56px]">
      {/* Visual Vertical Timeline Line Indicator */}
      {!isLast && (
        <div className="absolute left-[14px] top-8 w-[2px] h-[calc(100%-20px)] bg-zinc-200 dark:bg-zinc-800 z-0" />
      )}

      {/* Main Avatar Element Row */}
      <div
        className={cn(
          "w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 z-10 text-white border-2 text-[10px] font-bold uppercase",
          cfg.dot,
        )}
      >
        {event.initial}
      </div>

      {/* Content Metadata Display Block */}
      <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3 text-[13px]">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-bold text-zinc-800 dark:text-zinc-200">
            {event.actor}
          </span>
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border capitalize",
              cfg.badge,
            )}
          >
            {event.label}
          </span>
          <span className="text-zinc-600 dark:text-zinc-300">
            {event.content}
          </span>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <span className="text-[11px] text-zinc-400 dark:text-zinc-600 font-mono">
            {event.timestamp}
          </span>
        </div>
      </div>
    </div>
  );
};

const actionTypeMap: Record<string, AuditEventType> = {
  created: "Signal",
  status_changed: "Policy",
  updated: "Enrichment",
  resolved: "Playbook",
  comment_added: "Comment",
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
      label: event.action.includes("_")
        ? event.action.split("_")[0]
        : "Comment",
      initial: event.actor.slice(0, 2).toUpperCase() || "SY",
      actor: event.actor,
      timestamp: event.timestamp,
      content: changeSummary || "No details recorded",
    };
  });

const formatNow = () => {
  const now = new Date();
  return now
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(",", "");
};

const CURRENT_USER = { name: "Daniel Appleby", initial: "DA" };

const ActivityAuditTrail: React.FC<{ history: IncidentHistoryRecord[] }> = ({
  history,
}) => {
  const [events, setEvents] = useState<AuditEvent[]>(buildAuditEvents(history));
  const [comment, setComment] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAddComment = () => {
    const text = comment.trim();
    if (!text) return;

    const newEvent: AuditEvent = {
      id: `local-${Date.now()}`,
      type: "Comment",
      label: "Comment",
      actor: CURRENT_USER.name,
      initial: CURRENT_USER.initial,
      timestamp: formatNow(),
      content: text,
      isLocalComment: true,
    };

    setEvents((prev) => [newEvent, ...prev]);
    setComment("");
  };

  // Determine pagination visible slices
  const hasMoreThanFour = events.length > 4;
  const visibleEvents = isExpanded ? events : events.slice(0, 4);

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-500 dark:border-zinc-800 shadow-sm p-5">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2 mb-4">
          <MdOutlineChat size={18} /> Comments & Activity
        </h3>

        {/* Comment Input Form Area */}
        <div className="flex items-start gap-3 mb-6">
          <div className="min-w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
            {CURRENT_USER.initial}
          </div>
          <div className="flex-1 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 overflow-hidden focus-within:ring-1 focus-within:ring-zinc-400 transition-shadow">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="w-full px-3 py-2 text-[13px] text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 bg-transparent resize-none outline-none"
            />
            <div className="flex items-center justify-end px-3 py-2 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50">
              <button
                type="button"
                onClick={handleAddComment}
                disabled={!comment.trim()}
                className="rounded border border-emerald-600 px-4 py-1 text-[12px] font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add Comment
              </button>
            </div>
          </div>
        </div>

        {/* Event List Container Area */}
        {visibleEvents.length > 0 ? (
          <div className="flex flex-col gap-2 mt-4">
            {visibleEvents.map((event, idx) => (
              <EventRow
                key={event.id}
                event={event}
                isLast={idx === visibleEvents.length - 1}
              />
            ))}

            {/* Load More/Less Conditional Control Button */}
            {hasMoreThanFour && (
              <div className="flex justify-center pt-3 border-t border-zinc-100 dark:border-zinc-900">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 text-[13px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors py-1 px-3 rounded hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  {isExpanded ? (
                    <>
                      Show less <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      Load more <ChevronDown size={16} />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-zinc-400 text-sm border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
            No activity records found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityAuditTrail;
