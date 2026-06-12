"use client";
import React from "react";
import { FileText, Check, TriangleAlert, Info, Bolt } from "lucide-react";
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
}: {
  label: string;
  value: string | number;
}) => (
  <div className="flex-1 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 p-3">
    <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
      {label}
    </p>
    <p className="text-[15px] font-semibold text-black dark:text-zinc-200">
      {value}
    </p>
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
}) => (
  <div className="flex flex-col gap-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors">
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2.5">
        <div className="rounded-md border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1.5">
          <Bolt size={14} className="text-zinc-400 dark:text-zinc-500" />
        </div>
        <h4 className="text-[12px] font-semibold text-black dark:text-zinc-200 leading-snug">
          {title}
        </h4>
      </div>
      {isRecommended && (
        <span className="rounded border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300 shrink-0">
          Recommended
        </span>
      )}
    </div>

    <div className="flex gap-2">
      <MetricBox label="Confidence" value={`${confidence}%`} />
      <MetricBox label="Risk" value={risk} />
      <MetricBox label="Blast" value={blast} />
    </div>

    <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
      <div
        className="h-full bg-zinc-400 dark:bg-zinc-500 transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>

    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="rounded border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1 text-[10px] font-medium text-black dark:text-zinc-400"
        >
          {tag}
        </span>
      ))}
    </div>
  </div>
);

const buildOptions = (incident: IncidentDetailRecord): RemediationData[] => {
  const svc = incident.service || incident.affectedSystem || "selected-service";
  const blast = incident.blastRadius || incident.region || "1 svc";
  const primary =
    incident.recommendedActions[0] ||
    incident.aiAnalysis?.suggestion ||
    "Review telemetry and confirm rollback safety";
  return [
    {
      title: primary,
      confidence: Math.max(incident.score || 0, incident.riskScore || 0, 72),
      isRecommended: true,
      risk:
        incident.severity === "P0" || incident.severity === "P1"
          ? "MED"
          : "Low",
      blast,
      progress: 100,
      tags: ["playbook: 3", "rollback: self", `${svc} + impact context`],
    },
    {
      title: "Rollback Deployment",
      confidence: 64,
      risk: "Low",
      blast,
      progress: 100,
      tags: ["Reversible", "auto-eligible"],
    },
    {
      title: "Scale Up Capacity",
      confidence: 58,
      risk: "Low",
      blast,
      progress: 75,
      tags: ["Reversible", "auto-eligible"],
    },
    {
      title: "Disable Feature Flag",
      confidence: 42,
      risk: "MED",
      blast,
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
    <div className="w-full rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 p-5">
      <div className="mb-5 flex items-start justify-between">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 shrink-0">
            <FileText size={15} className="text-zinc-500 dark:text-zinc-400" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-black dark:text-zinc-100">
              Remediation Options
            </h2>
            <p className="mt-0.5 text-[12px] text-black dark:text-zinc-500">
              confidence · blast radius · risk level · reversibility
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="flex items-center gap-1.5 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-[11px] font-medium text-black dark:text-zinc-400">
            <Check size={12} /> Awaiting Investigation
          </span>
        </div>
      </div>

      <div className="mb-5 flex gap-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4">
        <Info
          size={15}
          className="mt-0.5 shrink-0 text-black dark:text-zinc-500"
        />
        <p className="text-[12px] leading-relaxed text-black dark:text-zinc-400">
          Agent findings from investigation steps will dynamically update
          confidence scores and may add or remove options before this stage
          activates. Blast radius must be evaluated before guardrail check.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {options.map((o, i) => (
          <OptionCard key={`${o.title}-${i}`} {...o} />
        ))}
      </div>
    </div>
  );
};

export default RemediationModule;
