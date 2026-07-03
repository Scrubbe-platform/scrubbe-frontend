"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";
import {
  IncidentContextRecord,
  IncidentDetailRecord,
} from "@/lib/incident/incident.types";

interface EzraAnalysis {
  id: string;
  rootCause: { hypothesis: string; riskLevel?: string };
  impact: {
    blastRadius: { summary: string };
    affectedUsers?: number;
    severity?: string;
  };
  remediation: { action: string };
}

interface AISuggestionsCardProps {
  incident: IncidentDetailRecord;
  context: IncidentContextRecord | null;
}

const AISuggestionsCard: React.FC<AISuggestionsCardProps> = ({
  incident,
  context,
}) => {
  const { get, post } = useFetch();
  const queryClient = useQueryClient();

  // Loads whatever analysis already exists for this incident (if Ezra has
  // run before) so the card shows real output on first load, not just after
  // a fresh click of "Generate".
  const { data: analysis } = useQuery<EzraAnalysis | null>({
    queryKey: ["ezra-analysis", incident.id],
    queryFn: async () => {
      const res = await get(`${endpoint.ezra.analysis}/${incident.id}`);
      return res.success
        ? ((res.data?.data ?? res.data) as EzraAnalysis)
        : null;
    },
    enabled: Boolean(incident.id),
    refetchOnWindowFocus: false,
    retry: false,
  });

  const { mutate: generate, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      const res = await post(endpoint.ezra.analyse, {
        incidentId: incident.id,
      });
      if (!res.success) throw new Error(res.data?.message ?? "Analysis failed");
      return (res.data?.data ?? res.data) as EzraAnalysis;
    },
    onSuccess: (result) => {
      queryClient.setQueryData(["ezra-analysis", incident.id], result);
    },
    onError: () => {
      toast.error("Unable to generate AI suggestions right now.");
    },
  });

  // 1. Build context-aware text strings using the real data properties —
  // shown until a real Ezra analysis exists for this incident, then real
  // analysis output takes over.
  const businessImpactText = analysis
    ? analysis.rootCause.hypothesis || "No root cause identified yet."
    : context?.businessImpact || incident.financialExposure
      ? `Partial customer degradation. Business impact: ${context?.businessImpact || incident.financialExposure}.`
      : "No business impact recorded yet.";

  const changesText = analysis
    ? analysis.remediation.action || "No recommended action yet."
    : "---";

  // Safely display real quantitative metrics based on context configurations
  const similarIncidentsText = incident.blastRadius
    ? `${incident.blastRadius} similar incidents found`
    : "No similar incidents found";

  return (
    <div className="w-full mx-auto p-4 font-sans selection:bg-emerald-100">
      <div className="bg-white dark:bg-zinc-950 rounded-md border border-zinc-400 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-400 dark:border-zinc-900">
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
            onClick={() => generate()}
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

          {/* Section 2: Changes — recommended action once a real analysis exists */}
          <div className="flex flex-col gap-1">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Changes
            </h4>
            <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
              {changesText}
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
