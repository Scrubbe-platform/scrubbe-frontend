"use client";
import React from "react";
import { Bolt, Info, Check, Loader2, TriangleAlert } from "lucide-react";

// --- Types ---

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

// --- Sub-Components ---

const StatusBadge = ({ status }: { status: StepStatus }) => {
  const styles = {
    completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    "in-progress": "bg-blue-500/10 text-blue-500 border-blue-500/30",
    pending: "bg-slate-800/50 text-slate-500 border-slate-700",
  };
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${styles[status]}`}
    >
      {status.replace("-", " ")}
    </span>
  );
};

const StepTag = ({ text }: { text: string }) => (
  <span className="bg-slate-800/80 border border-slate-700 text-slate-400 text-[10px] px-2 py-1 rounded-md font-mono">
    {text}
  </span>
);

// --- Main Component ---

const InvestigationTimeline: React.FC = () => {
  const steps: InvestigationStep[] = [
    {
      id: 1,
      title: "Review Recent Deployments",
      description:
        "Inspect deployment history for the affected service within the last 2 hours. Compare version diff for config changes, dependency updates, or code paths touching the error surface.",
      status: "completed",
      tags: [
        "Completed 00:03 UTC",
        "Agent: deploy-scanner",
        "completedBy: agent/deploy-scanner-01",
      ],
      outcome:
        "Outcome: degraded — v2.4.1 deployed 47m ago. NullPointerException in PaymentProcessor.charge() line 247. Agent finding propagated to remediation options.",
    },
    {
      id: 2,
      title: "Inspect Service Logs for Exceptions",
      description:
        "Stream live logs from the affected service. Filter for ERROR and FATAL levels. Extract full stack traces and correlate exception patterns with the deployment timeline.",
      status: "in-progress",
      tags: [
        "Agent: log-analyst",
        "Target: payments-api · prod",
        "Timeout: 5m",
      ],
      streamingCmd:
        "Agent log-analyst-02 streaming — kubectl logs -f deploy/payment-svc --tail=20",
      branching: {
        label: "Branch on outcome",
        options: ["In Progress", "No exceptions → Skip to Step 4"],
      },
    },
    {
      id: 3,
      title: "Verify Downstream Dependency Health",
      description:
        "Check health of all downstream dependencies: database connection pool, cache hit rates, and upstream auth service latency. Rule out cascading failure before proposing remediation.",
      status: "pending",
      tags: ["Agent: topology-scanne", "extStepOverride: null"],
    },
    {
      id: 4,
      title: "Compare Error Rate Before / After Deploy",
      description:
        "Pull metrics for the 30m window before and after v2.4.1 deploy. Confirm the error rate spike is causally linked to the deployment, not an upstream infrastructure event.",
      status: "pending",
      tags: ["Agent: metrics-correlator", "Window: -30m / +30m deploy"],
    },
  ];

  return (
    <div className="w-full max-w-5xl bg-dark border border-white/5 rounded-2xl p-3 text-slate-300">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center">
            <Bolt size={20} className="text-amber-500 fill-amber-500" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">
              Investigation Steps
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              State machine — Step[] with conditional branching · Agent findings
              modify remediation options
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400 text-xs font-bold uppercase tracking-widest">
            2 / 5 IN PROGRESS
          </div>
          <button className="p-1.5 border border-slate-700 rounded text-slate-400">
            <TriangleAlert size={16} />
          </button>
        </div>
      </div>

      {/* State Machine Info */}
      <div className="flex gap-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl mb-10">
        <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />
        <p className="text-sm leading-relaxed text-slate-400">
          Steps are a state machine, not a checklist. Each step carries status,
          outcome, and optional nextStepOverride for conditional routing. Agent
          findings produced here can expand or narrow active remediation options
          downstream.
        </p>
      </div>

      {/* Timeline Steps */}
      <div className="relative space-y-12 ml-4 border-l border-slate-800 pl-10 pb-4">
        {steps.map((step) => (
          <div key={step.id} className="relative">
            {/* Timeline Connector Dot */}
            <div
              className={`absolute -left-[53px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-colors
              ${
                step.status === "completed"
                  ? "bg-emerald-500 border-emerald-500"
                  : step.status === "in-progress"
                  ? "bg-[#050814] border-blue-500 text-blue-500"
                  : "bg-[#050814] border-slate-700 text-slate-600"
              }`}
            >
              {step.status === "completed" ? (
                <Check size={14} className="text-white" />
              ) : (
                <span className="text-[10px] font-bold">{step.id}</span>
              )}
            </div>

            {/* Content Area */}
            <div className="flex justify-between items-start mb-2">
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
              className={`text-sm leading-relaxed mb-4 max-w-3xl ${
                step.status === "pending" ? "text-slate-600" : "text-slate-400"
              }`}
            >
              {step.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {step.tags.map((tag) => (
                <StepTag key={tag} text={tag} />
              ))}
            </div>

            {/* Status-Specific Blocks */}
            {step.outcome && (
              <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-4 text-emerald-400 text-xs font-mono leading-relaxed">
                {step.outcome}
              </div>
            )}

            {step.streamingCmd && (
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/40 rounded-xl p-4 flex items-center gap-3">
                  <Loader2 size={16} className="text-blue-400 animate-spin" />
                  <span className="text-blue-400 text-xs font-mono">
                    {step.streamingCmd}
                  </span>
                </div>
                {step.branching && (
                  <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3">
                      {step.branching.label}
                    </p>
                    <div className="flex gap-2">
                      {step.branching.options.map((opt, i) => (
                        <button
                          key={opt}
                          className={`px-4 py-2 rounded-lg text-xs font-medium border transition-colors
                          ${
                            i === 0
                              ? "bg-slate-800/50 border-slate-600 text-slate-400"
                              : "bg-slate-900/20 border-slate-700 text-slate-600"
                          }`}
                        >
                          {opt}
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
