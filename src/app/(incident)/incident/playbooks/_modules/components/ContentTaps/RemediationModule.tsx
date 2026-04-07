"use client";
import React from "react";
import { FileText, Info, Bolt, Check, TriangleAlert } from "lucide-react";

// --- Types ---

interface RemediationData {
  title: string;
  isRecommended?: boolean;
  confidence: number;
  risk: "Low" | "MED" | "High";
  blast: string;
  tags: string[];
  progress: number; // 0 to 100 for the yellow bar
}

// --- Sub-Components ---

const MetricBox = ({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: string | number;
  colorClass: string;
}) => (
  <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-lg p-3">
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
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
  const riskColor = risk === "Low" ? "text-lime-400" : "text-amber-400";

  return (
    <div className="border border-white/5 rounded-2xl p-5 flex flex-col gap-4 group hover:border-white/10 transition-colors">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-amber-500/10 border border-amber-500/20 rounded-md">
            <Bolt size={16} className="text-amber-500 fill-amber-500" />
          </div>
          <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
        </div>
        {isRecommended && (
          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
            Recommended
          </span>
        )}
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

      {/* Progress Bar Container */}
      <div className="w-full h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-wrap gap-2 mt-1">
        {tags.map((tag, i) => (
          <span
            key={i}
            className={`text-[10px] font-medium px-3 py-1 rounded-md border 
            ${
              tag.includes("rollback")
                ? "text-purple-400 border-purple-400/20 bg-purple-400/5"
                : tag.includes("auto")
                ? "text-blue-400 border-blue-400/20 bg-blue-400/5"
                : tag.includes("impact")
                ? "text-red-400 border-red-400/20 bg-red-400/5"
                : "text-slate-400 border-slate-700/50 bg-slate-800/20"
            }`}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

// --- Main Component ---

const RemediationModule: React.FC = () => {
  const options: RemediationData[] = [
    {
      title: "Rollback Deployment",
      isRecommended: true,
      confidence: 12,
      risk: "MED",
      blast: "2 svc",
      progress: 100,
      tags: ["playbook: 3", "rollback: self", "payments-api + checkout"],
    },
    {
      title: "Rollback Deployment",
      confidence: 12,
      risk: "Low",
      blast: "2 svc",
      progress: 100,
      tags: ["Reversible", "auto-eligible"],
    },
    {
      title: "Scale Up Replicas",
      confidence: 31,
      risk: "Low",
      blast: "2 svc",
      progress: 75,
      tags: ["Reversible", "auto-eligible"],
    },
    {
      title: "Disable Feature Flag",
      confidence: 42,
      risk: "MED",
      blast: "3 svcs",
      progress: 100,
      tags: ["State impact", "State impact"],
    },
  ];

  return (
    <div className="w-full max-w-6xl bg-dark border border-white/5 rounded-3xl p-3">
      {/* Header Area */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center">
            <FileText size={20} className="text-amber-500" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">
              Remediation Option
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              RemediationOption[] — confidence · blast radius · risk level ·
              reversibility
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-500 text-xs font-bold uppercase tracking-widest">
            <Check size={14} /> Awaiting Investigation
          </div>
          <button className="p-1.5 border border-slate-700 rounded text-slate-400">
            <TriangleAlert size={16} />
          </button>
        </div>
      </div>

      {/* Warning/Info Alert */}
      <div className="flex gap-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl mb-8">
        <Info size={20} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-amber-200/70 text-sm leading-relaxed">
          Agent findings from investigation steps will dynamically update
          confidence scores and may add or remove options before this stage
          activates. Blast radius must be evaluated before guardrail check.
        </p>
      </div>

      {/* Grid of Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {options.map((opt, idx) => (
          <OptionCard key={idx} {...opt} />
        ))}
      </div>
    </div>
  );
};

export default RemediationModule;
