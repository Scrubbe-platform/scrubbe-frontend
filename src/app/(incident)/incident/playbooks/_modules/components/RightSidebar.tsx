"use client";
import React from "react";
import { Check, CheckCircle2, Circle, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";

// ── Types ─────────────────────────────────────────────────────────

interface MatchCriteria { label: string; weight: string; met: boolean }
interface IncidentField { label: string; value: string; colorClass?: string }

// ── Helpers ───────────────────────────────────────────────────────

const severityColor = (s?: string) =>
  s === "P0" || s === "P1" ? "text-red-500" : s === "P2" ? "text-yellow-500" : "text-blue-500";

const statusColor = (s?: string) =>
  s === "RESOLVED" || s === "CLOSED" ? "text-emerald-500" : s === "MITIGATED" ? "text-yellow-500" : "text-blue-500";

const deriveIncidentContext = (incident: IncidentDetailRecord): IncidentField[] => [
  { label: "incident_id",  value: incident.ticketId || incident.id },
  { label: "severity",     value: incident.severity || incident.priority || "P3",                                                     colorClass: severityColor(incident.severity) },
  { label: "service",      value: incident.service || incident.affectedSystem || "unknown-service",                                   colorClass: "text-blue-500 dark:text-blue-400" },
  { label: "environment",  value: incident.environment || "runtime" },
  { label: "region",       value: incident.region || "global" },
  { label: "elapsed",      value: incident.elapsedLabel || "just now",                                                                colorClass: "text-yellow-600 dark:text-yellow-500" },
  { label: "owner",        value: incident.assignedToName || incident.assignedToEmail || incident.incidentCommander || "unassigned" },
  { label: "state",        value: incident.status || incident.sidebarStatus || "investigating",                                       colorClass: statusColor(incident.status) },
];

// ── Sub-components ────────────────────────────────────────────────

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-3">
    {children}
  </h3>
);

const MatchRow = ({ label, weight, met }: MatchCriteria) => (
  <div className="flex items-center justify-between py-2 border-b border-zinc-500 dark:border-white/5 last:border-0">
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
      <span className="text-[11px] font-mono text-zinc-800 dark:text-zinc-100">
        {label}
      </span>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-500 tracking-tighter">×{weight}</span>
      {met && <Check size={12} className="text-emerald-500" />}
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────

const PlaybookRightSidebar: React.FC<{ incident: IncidentDetailRecord }> = ({ incident }) => {
  const { get } = useFetch();
  const incidentContext = deriveIncidentContext(incident);
  const isDeployAware = /deploy|pipeline|ci\/cd|rollback|release/i.test(
    `${incident.sourceType ?? ""} ${incident.detection ?? ""} ${incident.title ?? ""}`
  );

  const { data: matchData } = useQuery({
    queryKey: ["playbook-match-confidence", incident.id],
    queryFn: async () => {
      const res = await get(`${endpoint.playbooks.match}?incidentId=${incident.id}`);
      if (res.success) {
        const items: any[] = res.data?.data?.playbooks ?? res.data?.data ?? [];
        const top = items[0];
        return top
          ? { confidence: Math.round((top.matchConfidence ?? top.confidence ?? 0.91) * 100) }
          : null;
      }
      return null;
    },
    enabled: !!incident.id,
    refetchOnWindowFocus: false,
  });

  const matchConfidence = matchData?.confidence ?? 91;

  return (
    <div className="w-[340px] h-full flex flex-col p-5 gap-7 overflow-y-auto border-l border-zinc-200 dark:border-white/5 bg-white dark:bg-transparent">

      {/* Match Confidence */}
      <section>
        <SectionHeader>Match Confidence</SectionHeader>
        <div className="flex flex-col items-center mb-5">
          <span className="text-[40px] font-black text-emerald-500 leading-none tracking-tight">{matchConfidence}%</span>
          <span className="text-[10px] font-mono text-zinc-400 mt-1 uppercase tracking-widest">
            Proposal.matchConfidence
          </span>
        </div>
        <div className="bg-zinc-50 dark:bg-white/5 rounded-lg px-3 py-1">
          <MatchRow label="signal_type = error_rate_high"                                                       weight="0.90" met />
          <MatchRow label={`service = ${incident.service || incident.affectedSystem || "unknown-service"}`}     weight="0.80" met />
          <MatchRow label="error_rate > 5"                                                                      weight="0.85" met />
          <MatchRow label={`recent_deployment = ${isDeployAware ? "true" : "unknown"}`}                        weight="0.85" met />
          <MatchRow label={`severity = ${incident.severity || incident.priority || "P3"}`}                     weight="0.90" met />
        </div>
      </section>

      {/* Incident Context */}
      <section>
        <SectionHeader>Incident Context</SectionHeader>
        <div className="space-y-1">
          {incidentContext.map((field) => (
            <div key={field.label} className="flex justify-between items-center py-2 px-3 bg-zinc-50 dark:bg-white/[0.02] rounded-lg border border-zinc-200 dark:border-white/5">
              <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-500">{field.label}</span>
              <span className={`text-[11px] font-semibold ${field.colorClass ?? "text-zinc-900 dark:text-zinc-100"}`}>
                {field.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Automation Stage Progress */}
      <section>
        <SectionHeader>Automation Stage Progress</SectionHeader>
        <div className="space-y-3.5 px-1">
          {[
            { id: 1, text: "Suggest investigation", status: "done"    },
            { id: 2, text: "Propose remediation",   status: "active"  },
            { id: 3, text: "Assisted execution",    status: "pending" },
            { id: 4, text: "Safe automation",       status: "pending" },
          ].map((step) => (
            <div key={step.id} className="flex items-center justify-between">
              <span className={`text-[12px] font-medium ${step.status === "pending" ? "text-zinc-400 dark:text-zinc-600" : "text-zinc-700 dark:text-zinc-300"}`}>
                {step.id}. {step.text}
              </span>
              {step.status === "done" ? (
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
              ) : step.status === "active" ? (
                <div className="relative flex items-center justify-center shrink-0">
                  <Circle size={16} className="text-emerald-500" />
                  <div className="absolute w-2 h-2 bg-emerald-500 rounded-full" />
                </div>
              ) : (
                <Circle size={16} className="text-zinc-300 dark:text-zinc-700 shrink-0" />
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
            { id: "POL-001", val: "prod.rollback.requires_approval"      },
            { id: "POL-017", val: "blast_radius.automation_limit = 3"    },
            { id: "POL-042", val: "pod.restart.auto = true"              },
            { id: "POL-089", val: "business_hours.escalation"            },
          ].map((p) => (
            <div key={p.id} className="flex gap-2.5 items-center text-[10px]">
              <span className="text-violet-600 dark:text-purple-400 font-bold bg-violet-50 dark:bg-purple-400/10 px-1.5 py-0.5 rounded border border-violet-200 dark:border-purple-400/20 shrink-0">
                {p.id}
              </span>
              <span className="text-zinc-700 dark:text-zinc-300 font-mono truncate">{p.val}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Execution Outcome */}
      <section>
        <SectionHeader>Execution Outcome (Learning)</SectionHeader>
        <div className="bg-sky-50 dark:bg-blue-500/5 border border-sky-200 dark:border-blue-500/20 rounded-xl p-4 mb-3">
          <div className="flex gap-3">
            <TrendingUp size={16} className="text-sky-500 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
              Execution.outcome will be recorded as{" "}
              <span className="text-zinc-900 dark:text-zinc-200 font-medium">
                resolved · degraded · neutral · worsened
              </span>{" "}
              after execution completes. Stored from day one to power learnedPatterns.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: "resolved", cls: "border-emerald-300 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10" },
            { label: "degraded", cls: "border-amber-300 dark:border-yellow-500/40 text-amber-600 dark:text-yellow-500 hover:bg-amber-50 dark:hover:bg-yellow-500/10"         },
            { label: "neutral",  cls: "border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-700/20"                     },
            { label: "worsened", cls: "border-red-300 dark:border-red-500/40 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"                        },
          ].map(({ label, cls }) => (
            <button key={label} className={`text-[9px] font-bold py-1.5 rounded border capitalize transition-colors ${cls}`}>
              {label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PlaybookRightSidebar;