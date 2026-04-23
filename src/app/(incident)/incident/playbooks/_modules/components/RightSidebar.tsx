"use client";
import React from "react";
import { Check, CheckCircle2, Circle, TrendingUp, Info } from "lucide-react";

// --- Types ---

interface MatchCriteria {
  label: string;
  weight: string;
  met: boolean;
}

interface IncidentField {
  label: string;
  value: string;
  colorClass?: string;
}

// --- Sub-Components ---

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-slate-200 text-xs font-semibold mb-4 tracking-tight">
    {children}
  </h3>
);

const MatchRow = ({ label, weight, met }: MatchCriteria) => (
  <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 group">
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
      <span className="text-[11px] font-mono text-slate-300 group-hover:text-white transition-colors">
        {label}
      </span>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-mono text-slate-500 tracking-tighter">
        ×{weight}
      </span>
      {met && <Check size={12} className="text-emerald-500" />}
    </div>
  </div>
);

// --- Main Component ---

const PlaybookRightSidebar: React.FC = () => {
  const incidentContext: IncidentField[] = [
    { label: "incident_id", value: "INC-#1298" },
    { label: "severity", value: "P1", colorClass: "text-red-500" },
    { label: "service", value: "payments-api", colorClass: "text-blue-400" },
    { label: "error_rate", value: "12%", colorClass: "text-red-500" },
    { label: "last_deploy", value: "47m ago", colorClass: "text-yellow-500" },
    { label: "deploy_version", value: "v2.4.1" },
    { label: "db_connections", value: "94%", colorClass: "text-yellow-500" },
    { label: "state", value: "investigating", colorClass: "text-blue-400" },
  ];

  return (
    <div className="w-[340px] h-full flex flex-col p-6 gap-8 overflow-y-auto border-l border-white/5 scrollbar-hide">
      {/* Match Confidence */}
      <section>
        <SectionHeader>Match Confidence</SectionHeader>
        <div className="flex flex-col items-center mb-6">
          <span className="text-4xl font-black text-green-400 tracking-tight">
            91%
          </span>
          <span className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-widest">
            Proposal.matchConfidence
          </span>
        </div>
        <div className="bg-white/5 rounded-lg px-3 py-1">
          <MatchRow label="signal_type = error_rate_high" weight="0.90" met />
          <MatchRow label="service = payments-api" weight="0.80" met />
          <MatchRow label="error_rate > 5" weight="0.85" met />
          <MatchRow label="recent_deployment = true" weight="0.85" met />
          <MatchRow label="severity in [P1, P2]" weight="0.90" met />
        </div>
      </section>

      {/* Incident Context */}
      <section>
        <SectionHeader>Incident Context</SectionHeader>
        <div className="space-y-1">
          {incidentContext.map((field) => (
            <div
              key={field.label}
              className="flex justify-between items-center py-2 px-3 bg-white/[0.02] rounded border border-white/5"
            >
              <span className="text-[11px] font-mono text-slate-500">
                {field.label}
              </span>
              <span
                className={`text-[11px] font-semibold ${
                  field.colorClass || "text-slate-200"
                }`}
              >
                {field.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Automation Stage Progress */}
      <section>
        <SectionHeader>Automation Stage Progress</SectionHeader>
        <div className="space-y-4 px-1">
          {[
            { id: 1, text: "Suggest investigation", status: "done" },
            { id: 2, text: "Propose remediation", status: "active" },
            { id: 3, text: "Assisted execution", status: "pending" },
            { id: 4, text: "Safe automation", status: "pending" },
          ].map((step) => (
            <div key={step.id} className="flex items-center justify-between">
              <span
                className={`text-xs font-medium ${
                  step.status === "pending"
                    ? "text-slate-600"
                    : "text-slate-400"
                }`}
              >
                {step.id}. {step.text}
              </span>
              {step.status === "done" ? (
                <CheckCircle2 size={16} className="text-emerald-500" />
              ) : step.status === "active" ? (
                <div className="relative flex items-center justify-center">
                  <Circle size={18} className="text-green-400" />
                  <div className="absolute w-2 h-2 bg-green-400 rounded-full" />
                </div>
              ) : (
                <Circle size={18} className="text-slate-800" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Linked Policies */}
      <section>
        <SectionHeader>Linked Policies</SectionHeader>
        <div className="space-y-2">
          {[
            { id: "POL-001", val: "prod.rollback.requires_approval" },
            { id: "POL-017", val: "blast_radius.automation_limit = 3" },
            { id: "POL-042", val: "pod.restart.auto = true" },
            { id: "POL-089", val: "business_hours.escalation" },
          ].map((p) => (
            <div key={p.id} className="flex gap-3 items-center text-[10px]">
              <span className="text-purple-400 font-bold bg-purple-400/10 px-1.5 py-0.5 rounded border border-purple-400/20">
                {p.id}
              </span>
              <span className="text-slate-300 font-mono truncate">{p.val}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Execution Outcome (Learning) */}
      <section className="">
        <SectionHeader>Execution Outcome (Learning)</SectionHeader>
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-4">
          <div className="flex gap-3">
            <TrendingUp size={18} className="text-blue-400 flex-shrink-0" />
            <p className="text-[10px] leading-relaxed text-slate-400">
              Execution.outcome will be recorded as{" "}
              <span className="text-slate-200">
                resolved · degraded · neutral · worsened
              </span>{" "}
              after execution completes. Stored from day one to power
              learnedPatterns.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {["resolved", "degraded", "neutral", "worsened"].map((label) => (
            <button
              key={label}
              className={`text-[9px] font-bold py-1.5 rounded border capitalize transition-all
              ${
                label === "resolved"
                  ? "border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10"
                  : label === "degraded"
                  ? "border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10"
                  : label === "worsened"
                  ? "border-red-500/40 text-red-500 hover:bg-red-500/10"
                  : "border-slate-700 text-slate-500 hover:bg-slate-700/20"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PlaybookRightSidebar;
