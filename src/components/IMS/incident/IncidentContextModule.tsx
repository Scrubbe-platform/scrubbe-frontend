"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import {
  IncidentContextRecord,
  IncidentDetailRecord,
} from "@/lib/incident/incident.types";

interface AISuggestionsCardProps {
  incident: IncidentDetailRecord;
  context: IncidentContextRecord | null;
  onGenerate?: () => void;
  isLoading?: boolean;
}

const AISuggestionsCard: React.FC<AISuggestionsCardProps> = ({
  incident,
  context,
  onGenerate,
  isLoading = false,
}) => {
  // 1. Build context-aware text strings using the real data properties
  const businessImpactText =
    context?.businessImpact || incident.financialExposure
      ? `Partial customer degradation. Business impact: ${context?.businessImpact || incident.financialExposure}.`
      : "No business impact recorded yet.";

  const recentChangesText = incident.techDescription || "No recent change";

  // Safely display real quantitative metrics based on context configurations
  const similarIncidentsText = incident.blastRadius
    ? `${incident.blastRadius} similar incidents found`
    : "No similar incidents found";

  return (
    <div className="w-full max-w-7xl mx-auto p-4 font-sans selection:bg-emerald-100">
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-500 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Sparkles size={15} fill="currentColor" className="opacity-90" />
            </div>
            <h3 className="text-[14px] font-bold text-zinc-800 dark:text-zinc-100 tracking-wide">
              AI Suggestions
            </h3>
          </div>

          <button
            type="button"
            onClick={onGenerate}
            disabled={isLoading}
            className="rounded-lg border border-emerald-600 px-4 py-1.5 text-[12px] font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? "Generating..." : "Generate"}
          </button>
        </div>

        {/* Content Body Layout driven by Incident Records */}
        <div className="p-5 flex flex-col gap-5">
          {/* Section 1: Scrubbe Decision Engine */}
          <div className="flex flex-col gap-1">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Scrubbe Decision Engine
            </h4>
            <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
              {businessImpactText}{" "}
              {incident.sourceType
                ? `Recent source: ${incident.sourceType}`
                : ""}
            </p>
          </div>

          {/* Section 2: Changes */}
          <div className="flex flex-col gap-1">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Changes
            </h4>
            <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
              {recentChangesText}
            </p>
          </div>

          {/* Section 3: Similar Incidents */}
          <div className="flex flex-col gap-1">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Similar Incidents
            </h4>
            <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
              {similarIncidentsText}
            </p>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="px-5 pb-4 pt-1 bg-white dark:bg-zinc-950">
          <p className="text-[11px] italic font-normal text-slate-400 dark:text-zinc-500 select-none">
            AI suggestions are generated based on incident data and may need
            review.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AISuggestionsCard;
