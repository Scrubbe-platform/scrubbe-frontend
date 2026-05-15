"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";

// --- Types ---
interface StepContent {
  id: string;
  category: string;
  title: string;
  description: React.ReactNode;
  outcomes: string[];
  table?: {
    headers: string[];
    rows: any[][];
  };
}

const DecisionLoopLayout = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    "Detect",
    "Establish Blast Radius",
    "Collect Evidence",
    "Correlate",
    "Generate Remediation",
    "Simulate Impact",
    "Policy Decision Gate",
    "Execute",
    "Verify Recovery",
    "Iterate or Escalate",
    "Learn",
  ];

  return (
    <div className="flex h-screen max-w-[1280px] mx-auto bg-white font-sans text-slate-900 overflow-hidden">
      {/* 1. LEFT NAVIGATION (Master) */}
      <aside className="w-[320px] border-r border-slate-200 flex flex-col p-8 shrink-0">
        <h3 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-6">
          Decision loop
        </h3>

        <nav className="flex flex-col gap-1">
          {steps.map((step, idx) => (
            <button
              key={step}
              onClick={() => setActiveStep(idx)}
              className={cn(
                "group flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-all",
                activeStep === idx
                  ? "bg-emerald-100 text-emerald-900"
                  : "hover:bg-slate-50 text-slate-500"
              )}
            >
              <div
                className={cn(
                  "w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors",
                  activeStep === idx
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-slate-200"
                )}
              >
                {idx + 1}
              </div>
              <span className="text-[13px] font-semibold tracking-tight">
                {step}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      {/* 2. MAIN CONTENT (Detail) */}
      <main className="flex-1 bg-slate-50/50 p-12 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <StepDetailContent stepIndex={activeStep} />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

// --- Sub-Component: Step Detail ---
const StepDetailContent = ({ stepIndex }: { stepIndex: number }) => {
  // We'll map the index to the provided data
  const content = getStepContent(stepIndex);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-8 border-b border-slate-100 bg-slate-50/30">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-xl">
            {(stepIndex + 1).toString().padStart(2, "0")}
          </div>
          <div>
            <p className="text-[11px] font-mono font-bold text-emerald-500 uppercase tracking-widest mb-1">
              {content.category}
            </p>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              {content.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Body Section */}
      <div className="p-10">
        <div className="prose prose-slate max-w-none mb-12">
          {content.description}
        </div>

        {/* Optional Custom UI (like the tables in Step 03 or 07) */}
        {content.table && (
          <div className="mb-12 border border-slate-100 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-mono font-bold text-slate-400">
                  {content.table.headers.map((h) => (
                    <th key={h} className="p-4 border-b border-slate-100">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {content.table.rows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-50 last:border-0"
                  >
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={cn(
                          "p-4 align-top",
                          j === 0
                            ? "font-bold text-slate-900 w-1/4"
                            : "text-slate-600"
                        )}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Outcome Section */}
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-widest mb-6">
            Outcome
          </h3>
          <div className="space-y-4">
            {content.outcomes.map((outcome, i) => (
              <div key={i} className="flex gap-4 py-4 border-t border-slate-50">
                <span className="text-emerald-500 text-lg font-bold">—</span>
                <p className="text-[14px] text-slate-600 font-medium">
                  {outcome}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Content Provider ---
const getStepContent = (index: number): StepContent => {
  const data: StepContent[] = [
    {
      id: "01",
      category: "Detection",
      title: "Detect",
      description: (
        <div className="space-y-6 text-slate-600 font-medium text-lg leading-relaxed">
          <p>
            Scrubbe continuously monitors production signals across the full
            engineering surface — code changes, CI/CD pipeline execution,
            infrastructure telemetry, application logs, alerting systems, and
            service health indicators.
          </p>
          <p>
            When abnormal behavior is detected — a sudden spike in error rates,
            a latency regression, a failed health check, or an alert firing —
            Scrubbe opens an incident automatically.
          </p>
          <p>
            The goal at this stage is not yet diagnosis. It is the rapid
            establishment of an incident context that everything downstream —
            evidence collection, correlation, remediation — can build upon.
          </p>
        </div>
      ),
      outcomes: [
        "Incident created and tracked from first detection forward",
        "Initial severity classified based on signal type and scope",
        "Detection source recorded for full attribution",
        "Initial impacted services identified before manual triage begins",
      ],
    },
    {
      id: "02",
      category: "Scoping",
      title: "Establish blast radius",
      description: (
        <div className="space-y-6 text-slate-600 font-medium text-lg leading-relaxed">
          <p>
            Before diagnosis begins, Scrubbe maps the operational surface of the
            incident. This step exists because acting without first
            understanding scope is how remediation makes things worse.
          </p>
          <p>
            Scrubbe identifies the directly affected services based on the
            detection signal and immediately begins tracing upstream and
            downstream dependencies.
          </p>
          <p>
            Understanding the operational surface of an incident before any
            action is proposed is what makes safe remediation possible.
          </p>
        </div>
      ),
      outcomes: [
        "Affected service map produced for this specific incident",
        "Dependency graph slice scoped to live propagation paths",
        "Estimated customer-facing impact established before diagnosis proceeds",
      ],
    },
    {
      id: "03",
      category: "Evidence Collection",
      title: "Collect Evidence in Parallel",
      description: (
        <div className="space-y-6 text-slate-600 font-medium text-lg leading-relaxed">
          <p>
            Scrubbe deploys specialized agents across the production stack
            simultaneously. Where a human engineer would move sequentially
            through tools, Scrubbe collects across all surfaces in parallel.
          </p>
          <p>
            The evidence collected is not a flat log of events. Each piece of
            evidence is mapped to its structural context — which service owns
            it, which deployment timeline it intersects.
          </p>
        </div>
      ),
      table: {
        headers: ["Agent coverage", "Parallel investigation domains"],
        rows: [
          [
            "Code & Deployment",
            "Recent commits, merged pull requests, deployment changes, feature flag updates, and artifact version history.",
          ],
          [
            "Pipeline & Infrastructure",
            "CI/CD workflow failures, artifact drift between environments, and infrastructure configuration changes.",
          ],
          [
            "Telemetry & Runtime",
            "Logs, distributed traces, metrics, saturation signals, and runtime anomalies.",
          ],
          [
            "Dependencies",
            "Internal and external dependency failures, upstream latency propagation, and timeout cascades.",
          ],
        ],
      },
      outcomes: [
        "Structured evidence graph assembled across all monitored surfaces in parallel",
        "Candidate anomalies identified and mapped to incident context",
      ],
    },
    {
      id: "04",
      category: "Root cause Analysis",
      title: "Correlate What Changed with What Broke",
      description: (
        <div className="space-y-6 text-slate-600 font-medium text-lg leading-relaxed">
          <p>
            Scrubbe compares the observed failure against recent changes across
            the environment. This is where raw evidence becomes structured
            reasoning.
          </p>
          <p>
            The output is a ranked set of root-cause hypotheses, each with a
            confidence score. Scrubbe explicitly discards false leads so that
            engineers are not distracted by plausible-sounding but
            poorly-supported explanations.
          </p>
        </div>
      ),
      outcomes: [
        "Ranked root-cause hypotheses with confidence scoring across all candidates",
        "False leads explicitly discarded from the active candidate set",
        "Full hypothesis set preserved for iteration if initial remediation does not produce recovery",
      ],
    },
    {
      id: "05",
      category: "Remediation Planning",
      title: "Generate Remediation Options",
      description: (
        <div className="space-y-6 text-slate-600 font-medium text-lg leading-relaxed">
          <p>
            Once plausible root causes are identified, Scrubbe generates
            candidate remediation paths for each. The options are not generic —
            they are mapped directly to the hypotheses that produced them.
          </p>
          <p>
            Scrubbe selects from the option space that is appropriate to the
            failure — it does not surface remediation paths that are irrelevant
            to the collected evidence.
          </p>
        </div>
      ),
      outcomes: [
        "Ranked remediation candidates generated for each active hypothesis",
        "Each option explicitly mapped to the hypothesis and evidence that produced it",
      ],
    },
    {
      id: "06",
      category: "Impact Simulation",
      title: "Simulate Expected Impact",
      description: (
        <div className="space-y-6 text-slate-600 font-medium text-lg leading-relaxed">
          <p>
            Before any action is allowed to proceed, Scrubbe evaluates the
            operational consequences of each remediation candidate. This step is
            the control point between diagnosis and execution.
          </p>
          <p>
            The output is a risk profile for each candidate: a projected blast
            radius for the action itself, distinct from the incident blast
            radius already established.
          </p>
        </div>
      ),
      outcomes: [
        "Projected blast radius for the proposed action, assessed independently",
        "Recovery probability estimate given current system state",
        "Risk score reflecting likelihood and severity of execution side effects",
        "Reversibility score assessing how cleanly the action can be undone",
      ],
    },
    {
      id: "07",
      category: "Policy Decision Gate",
      title: "Governance",
      description: (
        <div className="space-y-6 text-slate-600 font-medium text-lg leading-relaxed">
          <p>
            Scrubbe applies organizational policy before any execution is
            permitted. Every remediation proposal passes through the policy gate
            before it can proceed.
          </p>
          <p>
            The gate evaluates each candidate against governance rules including
            sensitivity of environment, severity of incident, and the required
            approval chain.
          </p>
        </div>
      ),
      table: {
        headers: ["Condition", "Gate outcome", "What follows"],
        rows: [
          [
            "All policy thresholds met, confidence above floor",
            "Auto-execute",
            "Scrubbe proceeds directly to controlled execution without human intervention.",
          ],
          [
            "Production environment, high-severity action",
            "Approval required",
            "Execution pauses; approval request is routed to the designated team lead.",
          ],
          [
            "Change freeze window active, blast radius exceeded",
            "Blocked",
            "Candidate is rejected; the next-ranked candidate is evaluated through simulation.",
          ],
        ],
      },
      outcomes: [
        "Gate decision issued: auto-execute, approval required, or blocked",
        "Full policy rationale committed to the permanent incident audit trail",
      ],
    },
    {
      id: "08",
      category: "Controlled Execution",
      title: "Execute Approved Remediation",
      description: (
        <div className="space-y-6 text-slate-600 font-medium text-lg leading-relaxed">
          <p>
            When policy permits execution, Scrubbe carries out the approved
            action through controlled execution adapters. Execution is not a
            single operation; it is a guarded sequence.
          </p>
          <p>
            Every action remains governed at the point of execution. The
            execution environment maintains the connection between the action,
            the incident, and the evidence.
          </p>
        </div>
      ),
      outcomes: [
        "Remediation executed under full operational controls and pre-defined safeguards",
        "Exact changes, parameters, and system responses recorded in real time",
        "Execution outcome connected to the incident audit trail",
      ],
    },
    {
      id: "09",
      category: "Verification",
      title: "Verify Recovery",
      description: (
        <div className="space-y-6 text-slate-600 font-medium text-lg leading-relaxed">
          <p>
            A successful action is not the same as a resolved incident. Scrubbe
            treats action completion and service recovery as two entirely
            separate questions.
          </p>
          <p>
            After execution completes, Scrubbe monitors affected services for
            recovery signals. It checks whether the error rate has normalized
            and whether latency has returned to pre-incident levels.
          </p>
        </div>
      ),
      outcomes: [
        "Resolved — all recovery signals present, no secondary degradation detected",
        "Partially recovered — monitoring continues, iteration evaluated",
        "Remediation failed — loop advances to the next ranked hypothesis immediately",
      ],
    },
    {
      id: "10",
      category: "Loop Continuation",
      title: "Iterate or Escalate",
      description: (
        <div className="space-y-6 text-slate-600 font-medium text-lg leading-relaxed">
          <p>
            If recovery is incomplete, Scrubbe does not stop. Scrubbe re-enters
            the reasoning cycle with the updated state — the execution that was
            attempted and the new telemetry.
          </p>
          <p>
            Where policy requires it, Scrubbe escalates to human operators with
            a complete summary. Escalation is not a failure mode; it is a
            governed handoff.
          </p>
        </div>
      ),
      outcomes: [
        "Hypothesis set updated with new evidence from the failed or incomplete remediation",
        "Next-ranked candidate proposed, simulated, and gated before execution",
        "Human escalation triggered with full incident context when policy requires",
      ],
    },
    {
      id: "11",
      category: "Operational Learning",
      title: "Learn from every incident",
      description: (
        <div className="space-y-6 text-slate-600 font-medium text-lg leading-relaxed">
          <p>
            When the incident closes, Scrubbe converts the entire response into
            structured operational learning. This is a systematic extraction of
            signal that improves how Scrubbe reasons through the next one.
          </p>
          <p>
            The practical consequence is that each incident improves future
            response in concrete, measurable ways. Hypothesis ranking is faster
            because Scrubbe has seen this pattern before.
          </p>
        </div>
      ),
      table: {
        headers: ["Metadata", "Learning extraction"],
        rows: [
          [
            "Evidence used",
            "Which signals proved decisive and which were irrelevant to calibrate future weighting.",
          ],
          [
            "Root cause confirmed",
            "The hypothesis validated by recovery outcome preserved as a labeled example.",
          ],
          [
            "Remediation selected",
            "The action that produced recovery, including exact execution parameters.",
          ],
          [
            "Policy decisions",
            "Every gate evaluation preserved in full for governance audit and review.",
          ],
        ],
      },
      outcomes: [
        "Signal-to-noise weights calibrated based on decisive evidence",
        "Pattern library updated with validated root-cause correlation",
        "Remediation confidence scores adjusted by execution success rate",
      ],
    },
  ];

  return data[index] || data[0];
};

export default DecisionLoopLayout;
