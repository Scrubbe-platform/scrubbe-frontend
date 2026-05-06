"use client";
import React from "react";
import { FileText, Info, Bolt, Check, TriangleAlert } from "lucide-react";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";

interface RemediationData {
  title: string;
  isRecommended?: boolean;
  confidence: number;
  risk: "Low" | "MED" | "High";
  blast: string;
  tags: string[];
  progress: number;
}

const MetricBox = ({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: string | number;
  colorClass: string;
}) => (
  <div className="flex-1 rounded-lg border border-white/5 bg-white/[0.02] p-3">
    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
      {label}
    </p>
    <p className={`text-lg font-bold ${colorClass}`}>{value}</p>
  </div>
);

const OptionCard: React.FC<RemediationData> = ({
  title,
  isRecommended,
  confidence,
  risk,
  blast,
  tags,
  progress,
}) => {
  const riskColor =
    risk === "Low"
      ? "text-lime-400"
      : risk === "High"
      ? "text-red-400"
      : "text-amber-400";

  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-white/5 p-5 transition-colors hover:border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md border border-amber-500/20 bg-amber-500/10 p-1.5">
            <Bolt size={16} className="fill-amber-500 text-amber-500" />
          </div>
          <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
        </div>
        {isRecommended ? (
          <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-500">
            Recommended
          </span>
        ) : null}
      </div>

      <div className="flex gap-2">
        <MetricBox
          label="Confidence"
          value={`${confidence}%`}
          colorClass="text-emerald-500"
        />
        <MetricBox label="Risk" value={risk} colorClass={riskColor} />
        <MetricBox label="Blast" value={blast} colorClass="text-lime-400" />
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800/50">
        <div
          className="h-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-1 flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className={`rounded-md border px-3 py-1 text-[10px] font-medium ${
              tag.includes("rollback")
                ? "border-purple-400/20 bg-purple-400/5 text-purple-400"
                : tag.includes("auto")
                ? "border-blue-400/20 bg-blue-400/5 text-blue-400"
                : tag.includes("impact")
                ? "border-red-400/20 bg-red-400/5 text-red-400"
                : "border-slate-700/50 bg-slate-800/20 text-slate-400"
            }`}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

const buildOptions = (incident: IncidentDetailRecord): RemediationData[] => {
  const serviceName =
    incident.service || incident.affectedSystem || "selected-service";
  const blastLabel = incident.blastRadius || incident.region || "1 svc";
  const primaryAction =
    incident.recommendedActions[0] ||
    incident.aiAnalysis?.suggestion ||
    "Review telemetry and confirm rollback safety";

  return [
    {
      title: primaryAction,
      isRecommended: true,
      confidence: Math.max(incident.score || 0, incident.riskScore || 0, 72),
      risk: incident.severity === "P0" || incident.severity === "P1" ? "MED" : "Low",
      blast: blastLabel,
      progress: 100,
      tags: ["playbook: 3", "rollback: self", `${serviceName} + impact context`],
    },
    {
      title: "Rollback Deployment",
      confidence: 64,
      risk: "Low",
      blast: blastLabel,
      progress: 100,
      tags: ["Reversible", "auto-eligible"],
    },
    {
      title: "Scale Up Capacity",
      confidence: 58,
      risk: "Low",
      blast: blastLabel,
      progress: 75,
      tags: ["Reversible", "auto-eligible"],
    },
    {
      title: "Disable Feature Flag",
      confidence: 42,
      risk: "MED",
      blast: blastLabel,
      progress: 100,
      tags: ["State impact", incident.environment || "runtime impact"],
    },
  ];
};

const RemediationModule: React.FC<{ incident: IncidentDetailRecord }> = ({
  incident,
}) => {
  const options = buildOptions(incident);

  return (
    <div className="w-full max-w-6xl rounded-3xl border border-white/5 bg-dark p-3">
      <div className="mb-8 flex items-start justify-between">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10">
            <FileText size={20} className="text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Remediation Option
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              RemediationOption[] — confidence · blast radius · risk level · reversibility
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex items-center gap-2 rounded border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-500">
            <Check size={14} /> Awaiting Investigation
          </div>
          <button className="rounded border border-slate-700 p-1.5 text-slate-400">
            <TriangleAlert size={16} />
          </button>
        </div>
      </div>

      <div className="mb-8 flex gap-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <Info size={20} className="mt-0.5 shrink-0 text-amber-500" />
        <p className="text-sm leading-relaxed text-amber-200/70">
          Agent findings from investigation steps will dynamically update
          confidence scores and may add or remove options before this stage
          activates. Blast radius must be evaluated before guardrail check.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {options.map((option, index) => (
          <OptionCard key={`${option.title}-${index}`} {...option} />
        ))}
      </div>
    </div>
  );
};

export default RemediationModule;
