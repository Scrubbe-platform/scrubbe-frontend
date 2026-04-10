import React from "react";

// --- Types ---

interface IntelligenceProps {
  confidence: number;
  playbook: string;
  description: string;
  correlatedIncidents: { id: string; confidence: number }[];
}

// --- Main Component ---

const IntelligenceModule: React.FC<IntelligenceProps> = ({
  confidence,
  playbook,
  description,
  correlatedIncidents,
}) => {
  return (
    <div className="w-full flex flex-col gap-4">
      {/* Title */}
      <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] mb-1 px-1">
        Scrubbe Intelligence
      </h2>

      {/* Main Intelligence Box */}
      <div className="bg-[#050b18]/40 border border-cyan-400/50 rounded-2xl p-6 relative overflow-hidden">
        {/* Header Row */}
        <div className="flex justify-between items-center mb-6">
          <div className="px-4 py-1.5 border border-cyan-400/50 rounded-lg bg-cyan-400/5">
            <span className="text-xs font-bold text-cyan-400">
              Scrubbe · Decision Engine
            </span>
          </div>
          <div className="flex gap-1.5 items-center">
            <span className="text-sm font-bold text-emerald-500">
              {confidence}% confidence
            </span>
            <span className="text-slate-500 text-sm">·</span>
            <span className="text-sm font-bold text-emerald-500">
              Playbook {playbook}
            </span>
          </div>
        </div>

        {/* Narrative Description */}
        <p className="text-slate-200 text-lg font-medium leading-relaxed tracking-tight">
          {description}
        </p>
      </div>

      {/* Correlated Incident Tags */}
      <div className="flex gap-3 mt-1">
        {correlatedIncidents.map((incident) => (
          <div
            key={incident.id}
            className="px-4 py-2 border border-slate-700/50 rounded-xl bg-slate-800/20 text-slate-400 text-xs font-medium"
          >
            {incident.id} · {incident.confidence}%
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Usage Example ---

const ScrubbeIntelligence = () => {
  return (
    <div className="p-6">
      <IntelligenceModule
        confidence={94}
        playbook="RBK-17"
        description="Same DB connection pool exhaustion as SI-0002310 and SI-0001870. Deploy #311 increased traffic by 41% — pool of 50 connections exhausted in 8 seconds. Pattern matched via signal correlation + 9 historical resolutions with 0 regressions. Expected resolution time with top fix: < 4 minutes. Blast radius: checkout-service only — 1 service, contained."
        correlatedIncidents={[
          { id: "SI-0002310", confidence: 97 },
          { id: "SI-0001870", confidence: 93 },
        ]}
      />
    </div>
  );
};

export default ScrubbeIntelligence;
