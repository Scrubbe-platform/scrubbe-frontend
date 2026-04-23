"use client";
import React from "react";
import { cn } from "@/lib/utils";

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
      <h2 className="text-[11px] md:text-[13px] font-bold text-slate-600 uppercase tracking-[0.15em] mb-1 px-1">
        Scrubbe Intelligence
      </h2>

      {/* Main Intelligence Box */}
      <div className="bg-[#050b18]/40 border border-green-400/50 rounded-2xl p-4 md:p-6 relative overflow-hidden">
        {/* Header Row - Stacks on very small screens */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 md:mb-6">
          <div className="w-fit px-3 py-1 border border-green-400/50 rounded-lg bg-green-400/5 shrink-0">
            <span className="text-[10px] md:text-xs font-bold text-green-400 uppercase tracking-tight">
              Scrubbe · Decision Engine
            </span>
          </div>
          <div className="flex gap-1.5 items-center">
            <span className="text-xs md:text-sm font-bold text-emerald-500 whitespace-nowrap">
              {confidence}% confidence
            </span>
            <span className="text-slate-500 text-sm">·</span>
            <span className="text-xs md:text-sm font-bold text-emerald-500 whitespace-nowrap">
              Playbook {playbook}
            </span>
          </div>
        </div>

        {/* Narrative Description - Scaled font size */}
        <p className="text-slate-200 text-sm md:text-lg font-medium leading-relaxed tracking-tight">
          {description}
        </p>
      </div>

      {/* Correlated Incident Tags - Horizontal Scroll on Mobile */}
      <div className="flex overflow-x-auto no-scrollbar gap-3 mt-1 pb-1">
        {correlatedIncidents.map((incident) => (
          <div
            key={incident.id}
            className="px-3 py-2 md:px-4 border border-slate-700/50 rounded-xl bg-slate-800/20 text-slate-400 text-[10px] md:text-xs font-medium whitespace-nowrap shrink-0"
          >
            {incident.id} · {incident.confidence}%
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Usage Component ---

const ScrubbeIntelligence = () => {
  return (
    <div className="p-4 md:p-6">
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
