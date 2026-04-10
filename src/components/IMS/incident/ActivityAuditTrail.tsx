import React from "react";

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
    <div className="flex gap-6 relative">
      {/* 1. The Connector Line */}
      {!isLast && (
        <div className="absolute left-[19px] top-10 w-[1px] h-[calc(100%-20px)] bg-slate-800 z-0" />
      )}

      {/* 2. The Initial Node */}
      <div
        className={`
        w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 z-10 bg-darkEzra
        ${currentStyle.dot}
      `}
      >
        <span className="text-xs font-bold">{event.initial}</span>
      </div>

      {/* 3. The Event Card */}
      <div className="flex-1 bg-darkEzra border border-white/5 rounded-xl p-4 mb-6 hover:border-white/10 transition-all">
        <div className="flex justify-between items-start mb-1">
          <span
            className={`text-[10px] font-bold uppercase tracking-widest ${currentStyle.text}`}
          >
            {event.label}
          </span>
          <span className="text-[10px] font-mono text-slate-600">
            {event.timestamp}
          </span>
        </div>
        <p className="text-[14px] font-semibold text-slate-200 leading-relaxed">
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
    <div className="p-6">
      <div className="w-full flex flex-col gap-4 p-4 rounded-xl border border-white/20">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] mb-1 px-1">
          Activity & Audit Trail
        </h2>
        <div className="w-full flex flex-col">
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
