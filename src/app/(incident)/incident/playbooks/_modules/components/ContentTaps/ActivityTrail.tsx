"use client";
import React from "react";
import { Bolt, Info, TriangleAlert } from "lucide-react";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";

type AuditType = "Playbook" | "Step" | "Decision" | "Guardrail" | "Execution";
interface AuditEvent { timestamp: string; type: AuditType; description: string; actor: string }

// All badges unified — type still distinguishable via label, no color needed
const AuditBadge = ({ type }: { type: AuditType }) => (
  <span className="w-24 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wider text-black dark:text-zinc-400 shrink-0">
    {type}
  </span>
);

const fmtTime = (base: Date, offsetMinutes: number): string => {
  const d = new Date(base.getTime() + offsetMinutes * 60_000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
};

const buildAuditEvents = (incident: IncidentDetailRecord): AuditEvent[] => {
  const playbookLabel = incident.title || incident.reason || incident.summary || "Selected incident";
  const serviceName   = incident.service || incident.affectedSystem || "unknown-service";
  const recommended   = incident.recommendedActions[0] || incident.aiAnalysis?.suggestion || "Validate the current remediation path";
  const base          = incident.createdAt ? new Date(incident.createdAt) : new Date();

  return [
    { timestamp: fmtTime(base, 0),  type: "Playbook",  description: `Playbook "${playbookLabel}" matched to ${incident.ticketId} · matchConfidence: 0.91 · service: ${serviceName}`, actor: "system/matcher"           },
    { timestamp: fmtTime(base, 1),  type: "Step",      description: 'Step 1 "Review Recent Incident Signals" started · agent/deploy-scanner-01 assigned · status: in_progress',       actor: "agent/orchestrator"        },
    { timestamp: fmtTime(base, 3),  type: "Step",      description: `Step 1 completed · outcome: context collected · recommendation: ${recommended}`,                                  actor: "agent/deploy-scanner-01"   },
    { timestamp: fmtTime(base, 5),  type: "Step",      description: 'Step 2 "Inspect Service Logs" started · branch conditions registered for remediation review',                     actor: "agent/orchestrator"        },
    { timestamp: fmtTime(base, 6),  type: "Decision",  description: `effectiveAutomationLevel computed: min(playbook:3, policy:3, risk:2) = 2 · execution mode locked to ASSISTED · incident status: ${incident.status}`, actor: "system/execution-gate" },
    { timestamp: fmtTime(base, 7),  type: "Guardrail", description: "GuardrailCheck: rollback approval and blast-radius review remain enforced before execution",                      actor: "system/policy-engine"      },
    { timestamp: fmtTime(base, 8),  type: "Execution", description: `Execution prepared for ${incident.ticketId} · awaiting approval · owner: ${incident.assignedToName || incident.assignedToEmail || incident.incidentCommander || "unassigned"}`, actor: "system/execution-gate" },
  ];
};

const AuditTrail: React.FC<{ incident: IncidentDetailRecord }> = ({ incident }) => {
  const logs = buildAuditEvents(incident);

  return (
    <div className="w-full rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 p-5 flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 shrink-0">
            <Bolt size={15} className="text-zinc-500 dark:text-zinc-400" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-black dark:text-zinc-100">Audit Trail</h2>
            <p className="mt-0.5 text-[12px] text-black dark:text-zinc-500">
              Every playbook selection, step, decision, and execution
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1.5 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[11px] font-medium text-black dark:text-zinc-400">
            {logs.length} events
          </span>
          <button className="p-1.5 rounded-lg border border-zinc-500 dark:border-zinc-700 text-black hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <TriangleAlert size={14} />
          </button>
        </div>
      </div>

      <div className="flex gap-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4">
        <Info size={15} className="mt-0.5 shrink-0 text-black dark:text-zinc-500" />
        <p className="text-[12px] leading-relaxed text-black dark:text-zinc-400">
          Every event is immutable. Audit records carry event type, actor, timestamp, payload, and a link back to the incident timeline so the learning system can reason from real outcomes.
        </p>
      </div>

      <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800">
        {logs.map((log, i) => (
          <div
            key={`${log.type}-${i}`}
            className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-3.5 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
          >
            <span className="w-10 text-[11px] font-mono text-black dark:text-zinc-600 shrink-0 tabular-nums">{log.timestamp}</span>
            <AuditBadge type={log.type} />
            <p className="flex-1 text-[12px] leading-relaxed text-black dark:text-zinc-400 min-w-0">{log.description}</p>
            <span className="w-36 text-right text-[11px] font-mono text-black dark:text-zinc-600 shrink-0 truncate">{log.actor}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditTrail;