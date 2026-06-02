"use client";
import React from "react";
import { Bolt, Info, Check, Loader2, TriangleAlert } from "lucide-react";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";
import { cn } from "@/lib/utils";

type StepStatus = "completed" | "in-progress" | "pending";

interface InvestigationStep {
  id: number; title: string; description: string; status: StepStatus;
  tags: string[]; outcome?: string; streamingCmd?: string;
  branching?: { label: string; options: string[] };
}

// ── Status badge — keep minimal color for state meaning ───────────

const StatusBadge = ({ status }: { status: StepStatus }) => {
  const styles = {
    completed:   "border-emerald-200 dark:border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/8 text-emerald-600 dark:text-emerald-400",
    "in-progress":"border-sky-200 dark:border-sky-500/25 bg-sky-50 dark:bg-sky-500/8 text-sky-600 dark:text-sky-400",
    pending:     "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500",
  };
  return (
    <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[status]}`}>
      {status.replace("-", " ")}
    </span>
  );
};

const StepTag = ({ text }: { text: string }) => (
  <span className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
    {text}
  </span>
);

// ── Data builder ──────────────────────────────────────────────────

const buildSteps = (incident: IncidentDetailRecord): InvestigationStep[] => {
  const serviceName = incident.service || incident.affectedSystem || "unknown-service";
  const environment = incident.environment || "runtime";
  const elapsed     = incident.elapsedLabel || "moments ago";
  const recommended = incident.recommendedActions[0] || incident.aiAnalysis?.suggestion || "Validate the current mitigation path.";

  return [
    {
      id: 1,
      title: "Review Recent Incident Signals",
      description: "Inspect the latest incident signal changes, ownership data, and telemetry notes before proposing an automation path.",
      status: "completed",
      tags: [`Completed ${elapsed}`, "Agent: deploy-scanner", `Incident: ${incident.ticketId}`],
      outcome: `Outcome: context collected for ${serviceName}. ${recommended}`,
    },
    {
      id: 2,
      title: "Inspect Service Logs for Exceptions",
      description: "Stream live logs from the affected service and correlate exception patterns with the current incident timeline.",
      status: incident.status === "RESOLVED" || incident.status === "CLOSED" ? "completed" : "in-progress",
      tags: ["Agent: log-analyst", `Target: ${serviceName} · ${environment}`, "Timeout: 5m"],
      streamingCmd: `Agent log-analyst-02 streaming — inspect ${serviceName} in ${environment}`,
      branching: { label: "Branch on outcome", options: ["In Progress", "No exceptions → Skip to Step 4"] },
    },
    {
      id: 3,
      title: "Verify Downstream Dependency Health",
      description: "Check dependent services, queue pressure, and data store health to rule out cascading failure before remediation.",
      status: "pending",
      tags: ["Agent: topology-scanner", `Region: ${incident.region || "global"}`],
    },
    {
      id: 4,
      title: "Compare Before / After Impact",
      description: "Use the incident timeline and current impact notes to confirm whether the spike is local to this service or part of a wider platform event.",
      status: "pending",
      tags: ["Agent: metrics-correlator", `Scope: ${incident.ticketId}`],
    },
  ];
};

// ── Component ─────────────────────────────────────────────────────

const InvestigationTimeline: React.FC<{ incident: IncidentDetailRecord }> = ({ incident }) => {
  const steps = buildSteps(incident);

  return (
    <div className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 p-5">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 shrink-0">
            <Bolt size={16} className="text-zinc-500 dark:text-zinc-400" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-zinc-800 dark:text-zinc-100">Investigation Steps</h2>
            <p className="mt-0.5 text-[12px] text-zinc-400 dark:text-zinc-500">
              State machine — Step[] with conditional branching and live incident context
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
            2 / 5 in progress
          </span>
          <button className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-1.5 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <TriangleAlert size={14} />
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="mb-6 flex gap-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4">
        <Info size={15} className="mt-0.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
        <p className="text-[12px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          Steps are a state machine, not a checklist. Each step carries status,
          outcome, and conditional routing so agent findings can expand or narrow
          remediation options downstream.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative ml-4 space-y-10 border-l border-zinc-100 dark:border-zinc-800 pb-4 pl-9">
        {steps.map((step) => (
          <div key={step.id} className="relative">

            {/* Step dot */}
            <div className={cn(
              "absolute -left-[46px] top-0 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
              step.status === "completed"   && "border-emerald-400 bg-emerald-400",
              step.status === "in-progress" && "border-sky-400 bg-white dark:bg-zinc-950 text-sky-500",
              step.status === "pending"     && "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600"
            )}>
              {step.status === "completed"
                ? <Check size={12} className="text-white" />
                : <span className="text-[10px] font-bold">{step.id}</span>
              }
            </div>

            {/* Title + badge */}
            <div className="mb-2 flex items-start justify-between gap-3">
              <h3 className={cn(
                "text-[13px] font-semibold leading-snug",
                step.status === "pending" ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-800 dark:text-zinc-100"
              )}>
                {step.title}
              </h3>
              <StatusBadge status={step.status} />
            </div>

            {/* Description */}
            <p className={cn(
              "mb-3 max-w-3xl text-[12px] leading-relaxed",
              step.status === "pending" ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-500 dark:text-zinc-400"
            )}>
              {step.description}
            </p>

            {/* Tags */}
            <div className="mb-3 flex flex-wrap gap-1.5">
              {step.tags.map((tag) => <StepTag key={tag} text={tag} />)}
            </div>

            {/* Outcome — keep emerald, it signals a positive result */}
            {step.outcome && (
              <div className="rounded-xl border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 p-3.5 text-[11px] font-mono leading-relaxed text-emerald-700 dark:text-emerald-400">
                {step.outcome}
              </div>
            )}

            {/* Streaming + branching */}
            {step.streamingCmd && (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3.5">
                  <Loader2 size={13} className="animate-spin text-zinc-400 dark:text-zinc-500 shrink-0" />
                  <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">{step.streamingCmd}</span>
                </div>
                {step.branching && (
                  <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4">
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                      {step.branching.label}
                    </p>
                    <div className="flex gap-2">
                      {step.branching.options.map((option, i) => (
                        <button
                          key={option}
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-colors",
                            i === 0
                              ? "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                              : "border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvestigationTimeline;