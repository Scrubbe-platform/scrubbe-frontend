"use client";
import React from "react";
import { cn } from "@/lib/utils";

// --- Types ---
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
      {/* 1. The Connector Line - Centered based on the circle width */}
      {!isLast && (
        <div className="absolute left-[15px] md:left-[19px] top-10 w-[1px] h-[calc(100%-24px)] bg-slate-800 z-0" />
      )}

      {/* 2. The Initial Node - Scaled for mobile */}
      <div
        className={cn(
          "w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center shrink-0 z-10 bg-darkEzra transition-all",
          currentStyle.dot
        )}
      >
        <span className="text-[10px] md:text-xs font-bold">
          {event.initial}
        </span>
      </div>

      {/* 3. The Event Card */}
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

const ActivityAuditTrail: React.FC = () => {
  const events: AuditEvent[] = [
    {
      id: "1",
      type: "Signal",
      label: "Signal Received",
      initial: "E",
      timestamp: "14:32:01",
      content:
        "deployment_failed · checkout-service · deploy #311 · eu-west-1 · 3 correlated signals",
    },
    {
      id: "2",
      type: "Policy",
      label: "Policy Evaluated",
      initial: "P",
      timestamp: "14:32:01",
      content:
        "Severity → P1 · Incident created · Routing: sre-oncall · Dedup miss → new incident",
    },
    {
      id: "3",
      type: "Playbook",
      label: "Playbook Matched",
      initial: "D",
      timestamp: "14:32:01",
      content:
        "Playbook RBK-17 · 94% match confidence · Alternatives: RBK-09 (61%), RBK-23 (44%) · EAL: Assisted",
    },
    {
      id: "4",
      type: "Guardrail",
      label: "Guardrails Evaluated",
      initial: "G",
      timestamp: "14:32:01",
      content:
        "Staging auto-apply: permitted · Production auto-deploy: blocked · Reversibility: confirmed · On-call hours: approval required",
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="w-full flex flex-col gap-4 p-3 md:p-4 rounded-xl border border-white/20">
        <h2 className="text-[11px] md:text-[13px] font-bold text-slate-600 uppercase tracking-[0.15em] mb-1 px-1">
          Activity & Audit Trail
        </h2>
        <div className="w-full flex flex-col pt-2">
          {events.map((event, idx) => (
            <EventRow
              key={event.id}
              event={event}
              isLast={idx === events.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityAuditTrail;
