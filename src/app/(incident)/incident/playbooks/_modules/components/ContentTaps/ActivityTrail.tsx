"use client";
import React from "react";
import { Bolt, Info, TriangleAlert } from "lucide-react";

// --- Types ---

type AuditType = "Playbook" | "Step" | "Decision" | "Guardrail" | "Execution";

interface AuditEvent {
  timestamp: string;
  type: AuditType;
  description: string;
  actor: string;
}

// --- Sub-Components ---

const AuditBadge = ({ type }: { type: AuditType }) => {
  const styles: Record<AuditType, string> = {
    Playbook: "border-amber-500/50 text-amber-500 bg-amber-500/5",
    Step: "border-purple-500/50 text-purple-400 bg-purple-500/5",
    Decision: "border-red-500/50 text-red-500 bg-red-500/5",
    Guardrail: "border-amber-600/40 text-amber-500 bg-amber-600/5",
    Execution: "border-yellow-500/50 text-yellow-500 bg-yellow-500/5",
  };

  return (
    <span
      className={`w-24 text-center text-[10px] font-bold px-2 py-1.5 rounded border uppercase tracking-wider ${styles[type]}`}
    >
      {type}
    </span>
  );
};

// --- Main Component ---

const AuditTrail: React.FC = () => {
  const logs: AuditEvent[] = [
    {
      timestamp: "00:00",
      type: "Playbook",
      description:
        'Playbook "High API Error Rate" matched to INC-#1298 · matchConfidence: 0.91 · alternatives: ["DB Latency Spike" 0.34, "Auth JWT Regression" 0.22]',
      actor: "system/matcher",
    },
    {
      timestamp: "00:00",
      type: "Step",
      description:
        'Step 1 "Review Recent Deployments" started · agent/deploy-scanner-01 assigned · status: in_progress',
      actor: "agent/orchestrator",
    },
    {
      timestamp: "00:00",
      type: "Step",
      description:
        "Step 1 completed · outcome: degraded · Finding F-8821 created: v2.4.1 NullPointerException @ PaymentProcessor:247 · remediation confidence recalculated",
      actor: "agent/deploy-scanner-01",
    },
    {
      timestamp: "00:00",
      type: "Step",
      description:
        'Step 2 "Inspect Service Logs" started · nextStepOverride: null · branch conditions registered: exception-found → Step 3 · no-exception → Step 4',
      actor: "agent/orchestrator",
    },
    {
      timestamp: "00:00",
      type: "Decision",
      description:
        "effectiveAutomationLevel computed: min(playbook:3, policy:3, risk:2) = 2 · Execution mode locked to ASSISTED · blast radius: 3 services",
      actor: "system/execution-gate",
    },
    {
      timestamp: "00:00",
      type: "Guardrail",
      description:
        "GuardrailCheck: prod.rollback.requires_approval = BLOCK_AUTO · blast_radius policy BLOCK_AUTO · business_hours_escalation APPROVAL_REQUIRED · reversibility PASS",
      actor: "system/policy-engine",
    },
    {
      timestamp: "00:00",
      type: "Execution",
      description:
        "Execution prepared: Rollback v2.4.1 → v2.4.0 · awaiting_approval · on-call notified · outcome: pending · rollbackPlaybookId: PB-rollback-self",
      actor: "system/execution-gate",
    },
  ];

  return (
    <div className="w-full max-w-6xl bg-dark border border-white/5 rounded-3xl p-3 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center">
            <Bolt size={20} className="text-amber-500 fill-amber-500" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg leading-tight">
              Audit Trail
            </h2>
            <p className="text-slate-500 text-xs mt-1 font-medium">
              AuditEvent[] — every playbook selection, step, decision, and
              execution · non-negotiable
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-500 text-xs font-bold uppercase tracking-widest">
            7 EVENTS
          </div>
          <button className="p-1.5 border border-slate-700 rounded text-slate-400 hover:bg-white/5">
            <TriangleAlert size={16} />
          </button>
        </div>
      </div>

      {/* Info Notice */}
      <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl flex gap-4">
        <Info size={20} className="text-blue-400 shrink-0 mt-0.5" />
        <p className="text-sm text-slate-400 leading-relaxed">
          Every event is immutable. AuditEvent records carry: event_type,
          entity_id, actor (agent or user), timestamp, payload, and a link to
          the incident timeline. This data underpins the learning capability —
          resolution outcomes are stored from day one.
        </p>
      </div>

      {/* Audit Log Rows */}
      <div className="flex flex-col border border-white/5 rounded-2xl overflow-hidden">
        {logs.map((log, index) => (
          <div
            key={index}
            className="flex items-center gap-6 p-4 border-b border-white/5 last:border-0 bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
          >
            <span className="text-xs font-mono text-slate-600 w-10">
              {log.timestamp}
            </span>
            <AuditBadge type={log.type} />
            <p className="flex-1 text-xs text-slate-400 leading-relaxed font-medium">
              {log.description}
            </p>
            <span className="text-xs font-mono text-slate-600 text-right w-40">
              {log.actor}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditTrail;
