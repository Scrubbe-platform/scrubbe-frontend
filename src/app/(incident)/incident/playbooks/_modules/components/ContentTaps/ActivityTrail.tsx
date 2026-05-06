"use client";
import React from "react";
import { Bolt, Info, TriangleAlert } from "lucide-react";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";

type AuditType = "Playbook" | "Step" | "Decision" | "Guardrail" | "Execution";

interface AuditEvent {
  timestamp: string;
  type: AuditType;
  description: string;
  actor: string;
}

interface AuditTrailProps {
  incident: IncidentDetailRecord;
}

const AuditBadge = ({ type }: { type: AuditType }) => {
  const styles: Record<AuditType, string> = {
    Playbook: "border-amber-500/50 bg-amber-500/5 text-amber-500",
    Step: "border-purple-500/50 bg-purple-500/5 text-purple-400",
    Decision: "border-red-500/50 bg-red-500/5 text-red-500",
    Guardrail: "border-amber-600/40 bg-amber-600/5 text-amber-500",
    Execution: "border-yellow-500/50 bg-yellow-500/5 text-yellow-500",
  };

  return (
    <span
      className={`w-24 rounded border px-2 py-1.5 text-center text-[10px] font-bold uppercase tracking-wider ${styles[type]}`}
    >
      {type}
    </span>
  );
};

const buildAuditEvents = (incident: IncidentDetailRecord): AuditEvent[] => {
  const playbookLabel =
    incident.title || incident.reason || incident.summary || "Selected incident";
  const serviceName =
    incident.service || incident.affectedSystem || "unknown-service";
  const recommendedAction =
    incident.recommendedActions[0] ||
    incident.aiAnalysis?.suggestion ||
    "Validate the current remediation path";

  return [
    {
      timestamp: "00:00",
      type: "Playbook",
      description: `Playbook "${playbookLabel}" matched to ${incident.ticketId} · matchConfidence: 0.91 · service: ${serviceName}`,
      actor: "system/matcher",
    },
    {
      timestamp: "00:00",
      type: "Step",
      description:
        'Step 1 "Review Recent Incident Signals" started · agent/deploy-scanner-01 assigned · status: in_progress',
      actor: "agent/orchestrator",
    },
    {
      timestamp: "00:00",
      type: "Step",
      description: `Step 1 completed · outcome: context collected · recommendation: ${recommendedAction}`,
      actor: "agent/deploy-scanner-01",
    },
    {
      timestamp: "00:00",
      type: "Step",
      description:
        'Step 2 "Inspect Service Logs" started · branch conditions registered for remediation review',
      actor: "agent/orchestrator",
    },
    {
      timestamp: "00:00",
      type: "Decision",
      description: `effectiveAutomationLevel computed: min(playbook:3, policy:3, risk:2) = 2 · execution mode locked to ASSISTED · incident status: ${incident.status}`,
      actor: "system/execution-gate",
    },
    {
      timestamp: "00:00",
      type: "Guardrail",
      description:
        "GuardrailCheck: rollback approval and blast-radius review remain enforced before execution",
      actor: "system/policy-engine",
    },
    {
      timestamp: "00:00",
      type: "Execution",
      description: `Execution prepared for ${incident.ticketId} · awaiting approval · owner: ${
        incident.assignedToName ||
        incident.assignedToEmail ||
        incident.incidentCommander ||
        "unassigned"
      }`,
      actor: "system/execution-gate",
    },
  ];
};

const AuditTrail: React.FC<AuditTrailProps> = ({ incident }) => {
  const logs = buildAuditEvents(incident);

  return (
    <div className="flex w-full max-w-6xl flex-col gap-6 rounded-3xl border border-white/5 bg-dark p-3">
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10">
            <Bolt size={20} className="fill-amber-500 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold leading-tight text-white">
              Audit Trail
            </h2>
            <p className="mt-1 text-xs font-medium text-slate-500">
              AuditEvent[] — every playbook selection, step, decision, and execution
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="rounded border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-500">
            {logs.length} EVENTS
          </div>
          <button className="rounded border border-slate-700 p-1.5 text-slate-400 hover:bg-white/5">
            <TriangleAlert size={16} />
          </button>
        </div>
      </div>

      <div className="flex gap-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
        <Info size={20} className="mt-0.5 shrink-0 text-blue-400" />
        <p className="text-sm leading-relaxed text-slate-400">
          Every event is immutable. Audit records carry event type, actor,
          timestamp, payload, and a link back to the incident timeline so the
          learning system can reason from real outcomes.
        </p>
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-white/5">
        {logs.map((log, index) => (
          <div
            key={`${log.type}-${index}`}
            className="flex items-center gap-6 border-b border-white/5 bg-white/[0.01] p-4 transition-colors last:border-0 hover:bg-white/[0.03]"
          >
            <span className="w-10 text-xs font-mono text-slate-600">
              {log.timestamp}
            </span>
            <AuditBadge type={log.type} />
            <p className="flex-1 text-xs font-medium leading-relaxed text-slate-400">
              {log.description}
            </p>
            <span className="w-40 text-right text-xs font-mono text-slate-600">
              {log.actor}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditTrail;
