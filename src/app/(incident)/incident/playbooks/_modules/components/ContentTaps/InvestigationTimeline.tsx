"use client";
import React from "react";
import { Bolt, Info, Check, Loader2, TriangleAlert } from "lucide-react";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";

type StepStatus = "completed" | "in-progress" | "pending";

interface InvestigationStep {
  id: number;
  title: string;
  description: string;
  status: StepStatus;
  tags: string[];
  outcome?: string;
  streamingCmd?: string;
  branching?: {
    label: string;
    options: string[];
  };
}

interface InvestigationTimelineProps {
  incident: IncidentDetailRecord;
}

const StatusBadge = ({ status }: { status: StepStatus }) => {
  const styles = {
    completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
    "in-progress": "border-blue-500/30 bg-blue-500/10 text-blue-500",
    pending: "border-slate-700 bg-slate-800/50 text-slate-500",
  };
  return (
    <span
      className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}
    >
      {status.replace("-", " ")}
    </span>
  );
};

const StepTag = ({ text }: { text: string }) => (
  <span className="rounded-md border border-slate-700 bg-slate-800/80 px-2 py-1 text-[10px] font-mono text-slate-400">
    {text}
  </span>
);

const buildSteps = (incident: IncidentDetailRecord): InvestigationStep[] => {
  const serviceName =
    incident.service || incident.affectedSystem || "unknown-service";
  const environment = incident.environment || "runtime";
  const elapsed = incident.elapsedLabel || "moments ago";
  const recommendedAction =
    incident.recommendedActions[0] ||
    incident.aiAnalysis?.suggestion ||
    "Validate the current mitigation path.";

  return [
    {
      id: 1,
      title: "Review Recent Incident Signals",
      description:
        "Inspect the latest incident signal changes, ownership data, and telemetry notes before proposing an automation path.",
      status: "completed",
      tags: [
        `Completed ${elapsed}`,
        "Agent: deploy-scanner",
        `Incident: ${incident.ticketId}`,
      ],
      outcome: `Outcome: context collected for ${serviceName}. ${recommendedAction}`,
    },
    {
      id: 2,
      title: "Inspect Service Logs for Exceptions",
      description:
        "Stream live logs from the affected service and correlate exception patterns with the current incident timeline.",
      status: incident.status === "RESOLVED" || incident.status === "CLOSED" ? "completed" : "in-progress",
      tags: [
        "Agent: log-analyst",
        `Target: ${serviceName} · ${environment}`,
        "Timeout: 5m",
      ],
      streamingCmd: `Agent log-analyst-02 streaming — inspect ${serviceName} in ${environment}`,
      branching: {
        label: "Branch on outcome",
        options: ["In Progress", "No exceptions -> Skip to Step 4"],
      },
    },
    {
      id: 3,
      title: "Verify Downstream Dependency Health",
      description:
        "Check dependent services, queue pressure, and data store health to rule out cascading failure before remediation.",
      status: "pending",
      tags: ["Agent: topology-scanner", `Region: ${incident.region || "global"}`],
    },
    {
      id: 4,
      title: "Compare Before / After Impact",
      description:
        "Use the incident timeline and current impact notes to confirm whether the spike is local to this service or part of a wider platform event.",
      status: "pending",
      tags: ["Agent: metrics-correlator", `Scope: ${incident.ticketId}`],
    },
  ];
};

const InvestigationTimeline: React.FC<InvestigationTimelineProps> = ({
  incident,
}) => {
  const steps = buildSteps(incident);

  return (
    <div className="w-full max-w-5xl rounded-2xl border border-white/5 bg-dark p-3 text-slate-300">
      <div className="mb-8 flex items-start justify-between">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10">
            <Bolt size={20} className="fill-amber-500 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Investigation Steps
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              State machine — Step[] with conditional branching and live incident context
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="rounded border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-400">
            2 / 5 IN PROGRESS
          </div>
          <button className="rounded border border-slate-700 p-1.5 text-slate-400">
            <TriangleAlert size={16} />
          </button>
        </div>
      </div>

      <div className="mb-10 flex gap-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
        <Info size={18} className="mt-0.5 shrink-0 text-blue-400" />
        <p className="text-sm leading-relaxed text-slate-400">
          Steps are a state machine, not a checklist. Each step carries status,
          outcome, and conditional routing so agent findings can expand or narrow
          remediation options downstream.
        </p>
      </div>

      <div className="relative ml-4 space-y-12 border-l border-slate-800 pb-4 pl-10">
        {steps.map((step) => (
          <div key={step.id} className="relative">
            <div
              className={`absolute -left-[53px] top-0 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                step.status === "completed"
                  ? "border-emerald-500 bg-emerald-500"
                  : step.status === "in-progress"
                  ? "border-blue-500 bg-[#050814] text-blue-500"
                  : "border-slate-700 bg-[#050814] text-slate-600"
              }`}
            >
              {step.status === "completed" ? (
                <Check size={14} className="text-white" />
              ) : (
                <span className="text-[10px] font-bold">{step.id}</span>
              )}
            </div>

            <div className="mb-2 flex items-start justify-between">
              <h3
                className={`text-base font-semibold ${
                  step.status === "pending" ? "text-slate-500" : "text-white"
                }`}
              >
                {step.title}
              </h3>
              <StatusBadge status={step.status} />
            </div>

            <p
              className={`mb-4 max-w-3xl text-sm leading-relaxed ${
                step.status === "pending" ? "text-slate-600" : "text-slate-400"
              }`}
            >
              {step.description}
            </p>

            <div className="mb-4 flex flex-wrap gap-2">
              {step.tags.map((tag) => (
                <StepTag key={tag} text={tag} />
              ))}
            </div>

            {step.outcome ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-xs font-mono leading-relaxed text-emerald-400">
                {step.outcome}
              </div>
            ) : null}

            {step.streamingCmd ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl border border-blue-500/40 bg-blue-500/10 p-4">
                  <Loader2 size={16} className="animate-spin text-blue-400" />
                  <span className="text-xs font-mono text-blue-400">
                    {step.streamingCmd}
                  </span>
                </div>
                {step.branching ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {step.branching.label}
                    </p>
                    <div className="flex gap-2">
                      {step.branching.options.map((option, index) => (
                        <button
                          key={option}
                          className={`rounded-lg border px-4 py-2 text-xs font-medium transition-colors ${
                            index === 0
                              ? "border-slate-600 bg-slate-800/50 text-slate-400"
                              : "border-slate-700 bg-slate-900/20 text-slate-600"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvestigationTimeline;
