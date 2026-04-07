import React from "react";
import { Info, Target, TriangleAlert } from "lucide-react";

// --- Types ---

type ImpactType = "Direct" | "Cascade" | "InDirect";

interface ServiceImpact {
  name: string;
  subtext: string;
  type: ImpactType;
  statusColor: string;
}

// --- Sub-Components ---

const ImpactCard = ({ name, subtext, type, statusColor }: ServiceImpact) => {
  const typeStyles: Record<ImpactType, string> = {
    Direct: "border-red-500/40 text-red-400 bg-red-500/5",
    Cascade: "border-amber-500/40 text-amber-400 bg-amber-500/5",
    InDirect: "border-indigo-500/40 text-indigo-400 bg-indigo-500/5",
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl group hover:border-white/10 transition-all">
      <div className="flex items-center gap-3">
        <div
          className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${statusColor}`}
        />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-200">{name}</span>
          <span className="text-[11px] text-slate-500 font-medium">
            {subtext}
          </span>
        </div>
      </div>
      <span
        className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${typeStyles[type]}`}
      >
        {type}
      </span>
    </div>
  );
};

const DataRow = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) => (
  <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
    <span className="text-xs text-slate-500 font-medium">{label}</span>
    <span
      className={`text-xs font-bold ${
        highlight ? "text-amber-400" : "text-slate-200"
      }`}
    >
      {value}
    </span>
  </div>
);

// --- Main Component ---

const BlastRadiusModule: React.FC = () => {
  const services: ServiceImpact[] = [
    {
      name: "payments-apt",
      subtext: "Root cause · All traffic",
      type: "Direct",
      statusColor: "text-red-500",
    },
    {
      name: "checkout-service",
      subtext: "Cascading · 29% abandon",
      type: "Cascade",
      statusColor: "text-red-500",
    },
    {
      name: "api-gateway",
      subtext: "CB open · 2.1% error rate",
      type: "InDirect",
      statusColor: "text-indigo-500",
    },
    {
      name: "user-service",
      subtext: "Healthy · Monitored",
      type: "InDirect",
      statusColor: "text-emerald-500",
    },
  ];

  return (
    <div className="w-full max-w-6xl border border-white/5 rounded-3xl p-3 bg-dark flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center">
            <Target size={20} className="text-amber-500" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg leading-tight">
              Blast Radius Evaluation
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Impact analysis — always runs before guardrail check · CP enforced
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-1.5 border border-amber-500/40 bg-amber-500/5 rounded text-amber-500 text-xs font-bold">
            Medium Risk
          </div>
          <button className="p-1.5 border border-slate-700 rounded text-slate-400 hover:bg-white/5">
            <TriangleAlert size={16} />
          </button>
        </div>
      </div>

      {/* CP Zone Warning */}
      <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-4">
        <Info size={20} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-200/70 leading-relaxed">
          <span className="font-bold text-amber-500">CP Zone</span> — blast
          radius must be calculated and consistent before any guardrail or
          execution decision. Uncertainty blocks execution.
        </p>
      </div>

      {/* Service Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((svc) => (
          <ImpactCard key={svc.name} {...svc} />
        ))}
      </div>

      {/* Detailed Stats */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <DataRow label="Services Affected" value="3 direct" highlight />
        <DataRow label="Estimated User Impact" value="30%" highlight />
        <DataRow label="Revenue Impact / min" value="~$4,200" highlight />
        <DataRow label="Risk Classification" value="MEDIUM" highlight />
        <DataRow label="riskClassifier.computedLevel" value="2" />
      </div>

      {/* Progress Footer */}
      <div className="space-y-3">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          User Impact Meter
        </p>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)] transition-all duration-1000"
            style={{ width: "30%" }}
          />
        </div>
      </div>
    </div>
  );
};

export default BlastRadiusModule;
