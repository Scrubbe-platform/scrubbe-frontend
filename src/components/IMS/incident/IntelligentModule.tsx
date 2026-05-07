"use client";

import React from "react";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";

interface IntelligenceProps {
  confidence?: number;
  playbook?: string;
  description: string;
  relatedItems: { id: string; confidence?: number }[];
}

const IntelligenceModule: React.FC<IntelligenceProps> = ({
  confidence,
  playbook,
  description,
  relatedItems,
}) => {
  return (
    <div className="w-full flex flex-col gap-4">
      <h2 className="text-[11px] md:text-[13px] font-bold text-slate-600 uppercase tracking-[0.15em] mb-1 px-1">
        Scrubbe Intelligence
      </h2>

      <div className="bg-[#050b18]/40 border border-green-400/50 rounded-2xl p-4 md:p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 md:mb-6">
          <div className="w-fit px-3 py-1 border border-green-400/50 rounded-lg bg-green-400/5 shrink-0">
            <span className="text-[10px] md:text-xs font-bold text-green-400 uppercase tracking-tight">
              Scrubbe · Decision Engine
            </span>
          </div>
          <div className="flex gap-1.5 items-center">
            {typeof confidence === "number" && confidence > 0 ? (
              <span className="text-xs md:text-sm font-bold text-emerald-500 whitespace-nowrap">
                {confidence}% confidence
              </span>
            ) : (
              <span className="text-xs md:text-sm font-bold text-emerald-500 whitespace-nowrap">
                Live context
              </span>
            )}
            {playbook ? (
              <>
                <span className="text-slate-500 text-sm">·</span>
                <span className="text-xs md:text-sm font-bold text-emerald-500 whitespace-nowrap">
                  {playbook}
                </span>
              </>
            ) : null}
          </div>
        </div>

        <p className="text-slate-200 text-sm md:text-lg font-medium leading-relaxed tracking-tight">
          {description}
        </p>
      </div>

      <div className="flex overflow-x-auto no-scrollbar gap-3 mt-1 pb-1">
        {relatedItems.map((incident) => (
          <div
            key={incident.id}
            className="px-3 py-2 md:px-4 border border-slate-700/50 rounded-xl bg-slate-800/20 text-slate-400 text-[10px] md:text-xs font-medium whitespace-nowrap shrink-0"
          >
            {incident.id}
            {typeof incident.confidence === "number"
              ? ` · ${incident.confidence}%`
              : ""}
          </div>
        ))}
      </div>
    </div>
  );
};

const ScrubbeIntelligence = ({
  incident,
}: {
  incident: IncidentDetailRecord;
}) => {
  const confidenceValue = Math.round(
    Math.max(incident.score || 0, incident.riskScore || 0)
  );
  const relatedItems =
    incident.correlatedSignalIds.length > 0
      ? incident.correlatedSignalIds.map((id) => ({ id }))
      : [incident.service, incident.environment, incident.region]
          .filter(Boolean)
          .map((value) => ({ id: value }));

  return (
    <div className="p-4 md:p-6">
      <IntelligenceModule
        confidence={confidenceValue > 0 ? confidenceValue : undefined}
        playbook={incident.category || undefined}
        description={
          incident.aiAnalysis?.suggestion ||
          incident.impactSummary ||
          incident.techDescription ||
          incident.description ||
          "Scrubbe has not generated additional analysis for this incident yet."
        }
        relatedItems={relatedItems}
      />
    </div>
  );
};

export default ScrubbeIntelligence;
