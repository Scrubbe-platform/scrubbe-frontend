"use client";

import React from "react";
import { Sparkles } from "lucide-react";
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
    <div className="flex flex-col gap-4">

      {/* Main card */}
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-500/5 p-5">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/25 flex items-center justify-center shrink-0">
              <Sparkles size={13} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Scrubbe · Decision Engine
            </span>
          </div>

          <div className="flex items-center gap-2 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
            {typeof confidence === "number" && confidence > 0 ? (
              <span>{confidence}% confidence</span>
            ) : (
              <span>Live context</span>
            )}
            {playbook && (
              <>
                <span className="text-emerald-300 dark:text-emerald-700">·</span>
                <span>{playbook}</span>
              </>
            )}
          </div>
        </div>

        {/* Analysis text */}
        <p className="text-[14px] text-zinc-700 dark:text-zinc-200 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Related signal chips */}
      {relatedItems.length > 0 && (
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-0.5">
          {relatedItems.map((item) => (
            <span
              key={item.id}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/40 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap shrink-0"
            >
              {item.id}
              {typeof item.confidence === "number" ? ` · ${item.confidence}%` : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const ScrubbeIntelligence = ({ incident }: { incident: IncidentDetailRecord }) => {
  const confidenceValue = Math.round(Math.max(incident.score || 0, incident.riskScore || 0));

  const relatedItems =
    incident.correlatedSignalIds.length > 0
      ? incident.correlatedSignalIds.map((id) => ({ id }))
      : [incident.service, incident.environment, incident.region]
          .filter(Boolean)
          .map((value) => ({ id: value }));

  return (
    <div className="px-5 md:px-8 py-6 border-b border-zinc-100 dark:border-white/[0.06]">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">
        Scrubbe Intelligence
      </p>

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