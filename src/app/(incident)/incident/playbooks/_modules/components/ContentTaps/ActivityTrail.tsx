"use client";
import React from "react";
import { Bolt, Info } from "lucide-react";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";
import useMember from "@/hooks/useMember";
import {
  PlaybookExecution,
  PlaybookStepOutcome,
  useActiveExecution,
} from "../../hooks/usePlaybookExecution";

type AuditType = "Playbook" | "Step" | "Decision" | "Execution";
interface AuditEvent {
  timestamp: string;
  type: AuditType;
  description: string;
  actor: string;
}

const AuditBadge = ({ type }: { type: AuditType }) => (
  <span className="w-24 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wider text-black dark:text-zinc-400 shrink-0">
    {type}
  </span>
);

const fmtTime = (iso?: string | null): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const buildAuditEvents = (
  execution: PlaybookExecution,
  resolveActor: (id?: string | null) => string
): AuditEvent[] => {
  const events: AuditEvent[] = [
    {
      timestamp: fmtTime(execution.startedAt),
      type: "Playbook",
      description: `Playbook "${execution.playbook.name}" triggered · matchConfidence: ${execution.confidenceScore.toFixed(2)} · status: ${execution.status}`,
      actor: resolveActor(execution.triggeredBy) ,
    },
  ];

  const sortedSteps = [...execution.stepOutcomes].sort(
    (a, b) => a.stepIndex - b.stepIndex
  );

  for (const step of sortedSteps as PlaybookStepOutcome[]) {
    if (step.status === "PENDING") continue;
    const outputSummary = step.output
      ? Object.entries(step.output)
          .map(([k, v]) => `${k}: ${String(v)}`)
          .join(", ")
      : undefined;
    events.push({
      timestamp: fmtTime(step.completedAt ?? step.startedAt),
      type: "Step",
      description: `Step "${step.stepName}" ${step.status.toLowerCase()}${
        outputSummary ? ` · ${outputSummary}` : ""
      }`,
      actor: resolveActor(step.performedBy) || "unassigned",
    });
  }

  if (execution.selectedActionId) {
    const action = execution.playbook.remediationActions?.find(
      (a) => a.actionId === execution.selectedActionId
    );
    events.push({
      timestamp: fmtTime(execution.completedAt ?? execution.startedAt),
      type: "Decision",
      description: `Remediation action "${action?.name ?? execution.selectedActionId}" selected${
        execution.decisionId ? ` · decision: ${execution.decisionId}` : ""
      }`,
      actor: resolveActor(execution.triggeredBy),
    });
  }

  if (
    execution.status === "COMPLETED" ||
    execution.status === "FAILED" ||
    execution.status === "CANCELLED"
  ) {
    events.push({
      timestamp: fmtTime(execution.completedAt),
      type: "Execution",
      description: `Execution ${execution.status.toLowerCase()}${
        execution.notes ? ` · ${execution.notes}` : ""
      }`,
      actor: resolveActor(execution.triggeredBy),
    });
  }

  return events;
};

const AuditTrail: React.FC<{ incident: IncidentDetailRecord }> = ({
  incident,
}) => {
  const { data: execution, isLoading } = useActiveExecution(incident.id);
  const { data: members = [] } = useMember();

  const resolveActor = (id?: string | null) => {
    if (!id) return "system";
    const member = members.find((m) => m.id === id);
    return member ? `${member.firstname} ${member.lastname}` : id;
  };

  const logs = execution ? buildAuditEvents(execution, resolveActor) : [];

  return (
    <div
      id="audit-trail"
      className="w-full rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 p-5 flex flex-col gap-5"
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 shrink-0">
            <Bolt size={15} className="text-zinc-500 dark:text-zinc-400" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-black dark:text-zinc-100">
              Audit Trail
            </h2>
            <p className="mt-0.5 text-[12px] text-black dark:text-zinc-500">
              Every playbook selection, step, decision, and execution
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1.5 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[11px] font-medium text-black dark:text-zinc-400">
            {logs.length} events
          </span>
        </div>
      </div>

      <div className="flex gap-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4">
        <Info
          size={15}
          className="mt-0.5 shrink-0 text-black dark:text-zinc-500"
        />
        <p className="text-[12px] leading-relaxed text-black dark:text-zinc-400">
          Sourced from the playbook execution record for this incident —
          actor, timestamp, and outcome are persisted per step and survive a
          refresh.
        </p>
      </div>

      <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800">
        {isLoading ? (
          <p className="p-5 text-center text-[12px] text-black dark:text-zinc-500">
            Loading audit trail…
          </p>
        ) : logs.length === 0 ? (
          <p className="p-5 text-center text-[12px] text-black dark:text-zinc-500">
            No playbook execution recorded yet for this incident.
          </p>
        ) : (
          logs.map((log, i) => (
            <div
              key={`${log.type}-${i}`}
              className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-3.5 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
            >
              <span className="w-10 text-[11px] font-mono text-black dark:text-zinc-600 shrink-0 tabular-nums">
                {log.timestamp}
              </span>
              <AuditBadge type={log.type} />
              <p className="flex-1 text-[12px] leading-relaxed text-black dark:text-zinc-400 min-w-0">
                {log.description}
              </p>
              <span className="w-36 text-right text-[11px] font-mono text-black dark:text-zinc-600 shrink-0 truncate">
                {log.actor}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AuditTrail;
