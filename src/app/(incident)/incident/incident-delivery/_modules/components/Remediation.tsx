"use client";

import React from "react";
import {
  Sparkles,
  Code,
  PlayCircle,
  Zap,
  Info,
  PlusSquare,
  ArrowUpRight,
  Minus,
  Link,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";

interface Hypothesis {
  id: string;
  title: string;
  confidence: number;
  runUrl: string;
  diffUrl: string;
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  color: string;
}

const formatConfidence = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return value <= 1 ? `${Math.round(value * 100)}%` : `${Math.round(value)}%`;
};

const Remediation: React.FC<{ incidentId?: string }> = ({ incidentId }) => {
  const { get } = useFetch();

  const { data: analysis } = useQuery({
    queryKey: ["ezra-analysis-delivery", incidentId],
    queryFn: async () => {
      if (!incidentId) return null;
      const res = await get(`${endpoint.ezra.analysis}/${incidentId}`);
      if (res.success) return res.data?.data ?? null;
      return null;
    },
    enabled: !!incidentId,
  });

  const rawHypotheses: any[] =
    analysis?.rootCause?.hypotheses ??
    analysis?.situation?.hypotheses ??
    analysis?.remediation?.options ??
    [];

  const hypotheses: Hypothesis[] = rawHypotheses.length
    ? rawHypotheses.map((h: any, i: number) => ({
        id: h.id ?? `HYP-${i + 1}`,
        title: h.title ?? h.description ?? String(h),
        confidence: h.confidence ?? h.score ?? 0.7,
        runUrl: h.runUrl ?? "#",
        diffUrl: h.diffUrl ?? "#",
      }))
    : [
        {
          id: "HYP-1",
          title: "Waiting for connector hypotheses",
          confidence: 0.4,
          runUrl: "#",
          diffUrl: "#",
        },
      ];

  const primaryOption = analysis?.remediation?.options?.[0] ?? null;
  const suggestion =
    analysis?.remediation?.recommendedAction ??
    analysis?.remediation?.suggested ??
    analysis?.remediation?.action ??
    "Waiting for a connector remediation suggestion";
  const prSuggestion =
    analysis?.remediation?.prChange ??
    primaryOption?.prChange ??
    "No PR patch has been generated yet.";
  const ciSuggestion =
    analysis?.remediation?.ciAction ??
    primaryOption?.ciAction ??
    "No CI verification action is available yet.";
  const confidence =
    analysis?.remediation?.confidence ?? analysis?.rootCause?.confidence ?? null;
  const playbook =
    analysis?.remediation?.playbook ?? primaryOption?.playbook ?? null;
  const riskLevel = primaryOption?.riskLevel ?? analysis?.rootCause?.riskLevel ?? "--";
  const approvalMode = primaryOption?.approvalMode ?? "review-required";
  const recommendedSource = primaryOption?.source ?? "--";

  return (
    <div className=" p-5 border border-IMSCyan/40 rounded-xl text-gray-700 dark:text-slate-300 bg-gradient-to-b from-IMSCyan/30 to-IMSCyan/10 dark:from-IMSCyan/20 dark:to-grayscrubbe-800 flex items-start justify-center">
      <div className="w-full">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">Remediation</h2>
            <p className=" text-slate-300 font-medium mt-4">
              Suggest, verify, summarize
            </p>
            <p className="text-base text-slate-500">
              Default is PR-safe. Verification is shown after execution.
            </p>
          </div>
          <button className="p-2 bg-slate-900/80 border border-slate-800 rounded-full">
            <Minus size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <ActionButton
            icon={<Sparkles size={14} />}
            label="Generate Suggestion"
            color="bg-[#eab308]"
          />
          <ActionButton
            icon={<Code size={14} />}
            label="Review in Code Engine"
            color="bg-[#d97706]"
          />
          <ActionButton
            icon={<PlayCircle size={14} />}
            label="Execute safe action"
            color="bg-[#f43f5e]"
          />
          <ActionButton
            icon={<Zap size={14} />}
            label="Generate Ezra"
            color="bg-[#f43f5e]"
          />
          <ActionButton
            icon={<Info size={14} />}
            label="Suggestion Details"
            color="bg-[#06b6d4]"
          />
          <ActionButton
            icon={<PlusSquare size={14} />}
            label="Create PR from Suggestion"
            color="bg-[#d946ef]"
          />
          <ActionButton
            icon={<Zap size={14} />}
            label="Merge Suggested PR"
            color="bg-[#f43f5e]"
          />
          <ActionButton
            icon={<ArrowUpRight size={14} />}
            label="Open Ezra Full View"
            color="bg-[#22c55e]"
          />
        </div>

        <div className="bg-black border border-slate-500 rounded-2xl p-6 mb-6">
          <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest mb-1">
            Automated remediation
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">
            Based on the failure type, Scrubbe proposes the next best actions
            (code patch, PR, CI rerun) and tracks outcomes.
          </p>

          <div className="flex gap-2 mb-6 flex-wrap">
            <StatusPill label={`Confidence: ${formatConfidence(confidence)}`} />
            <StatusPill label={`Risk: ${riskLevel}`} />
            <StatusPill label={`Source: ${recommendedSource}`} />
            <StatusPill label={`Approval: ${approvalMode}`} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <SuggestionBox
              title="Suggested action"
              boldText={suggestion}
              desc={
                playbook
                  ? `Playbook hint: ${playbook}`
                  : "Generate a connector-informed remediation PR before rerunning verification."
              }
            />
            <SuggestionBox
              title="Suggested PR change"
              boldText={prSuggestion}
              desc='Files touched and risk should align with the "Diff provenance" review.'
            />
            <SuggestionBox
              title="Suggested CI/CD action"
              boldText={ciSuggestion}
              desc="Verification results update automatically when actions run."
            />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <OutlineButton label="Auto-Suggest fix" />
            <OutlineButton label="Create PR" />
            <OutlineButton label="Run CI/CD" />
            <OutlineButton label="Merge(requires approval )" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-black border border-slate-500 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Suggestion (preview)</h3>
            <div className="flex gap-2 mb-4">
              <StatusPill label={`id: ${primaryOption?.id ?? "--"}`} />
              <StatusPill label={`Confidence: ${formatConfidence(confidence)}`} />
            </div>
            <div className="h-40 bg-black/60 rounded-xl border border-slate-800 p-4 overflow-auto">
              <span className="text-slate-300 font-mono text-sm">{suggestion}</span>
            </div>
          </div>

          <div className="bg-black border border-slate-500 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">3. Verification results</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <MetricBox label="CI rerun" value={ciSuggestion ? "Ready" : "--"} />
              <MetricBox label="Flake rate" value={primaryOption?.safetyLevel ?? "--"} />
              <MetricBox
                label="Affected jobs"
                value={hypotheses.length ? String(hypotheses.length) : "--"}
              />
            </div>
            <p className="text-[11px] text-slate-500 mb-4">
              Execute a safe action to generate verification results.
            </p>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">
              Ezra Summaries
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">
                  Executive
                </p>
                <p className="text-xs text-slate-400">
                  {analysis?.reports?.find((r: any) => r.audience === "LEADERSHIP")
                    ?.narrative ?? "--"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">
                  Analyst
                </p>
                <p className="text-xs text-slate-400">
                  {analysis?.reports?.find((r: any) => r.audience === "ENGINEER")
                    ?.narrative ?? "--"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black border border-slate-500 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-white">
              2. Root-cause hypothesis panel
            </h3>
            <button className="px-4 py-1.5 border border-green-500 text-green-500 rounded-lg text-xs font-bold">
              Expand
            </button>
          </div>

          <div className="space-y-3">
            {hypotheses.map((hyp) => (
              <div
                key={hyp.id}
                className="flex justify-between items-center p-4 bg-black/60 rounded-xl border border-slate-800 hover:border-green-500/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-bold text-slate-100">{hyp.title}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-1">
                    Confidence: {formatConfidence(hyp.confidence)}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button className="flex items-center gap-1.5 px-2 py-1 border border-slate-800 rounded-xl text-[10px] text-slate-200 font-mono">
                      <Link2Icon /> runUrl
                    </button>
                    <button className="flex items-center gap-1.5 px-2 py-1 border border-slate-800 rounded-xl text-[10px] text-slate-200 font-mono">
                      <Link2Icon /> diffUrl
                    </button>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-200 border border-slate-500 px-2 py-1 rounded-xl">
                  {hyp.id}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, color }) => (
  <button
    className={`flex items-center gap-2 px-3 py-1.5 ${color} text-black rounded-md text-[10px] font-black uppercase tracking-tight hover:opacity-90`}
  >
    {icon} {label}
  </button>
);

const SuggestionBox: React.FC<{
  title: string;
  boldText: string;
  desc: string;
}> = ({ title, boldText, desc }) => (
  <div className="bg-white dark:bg-grayscrubbe-800 p-4 rounded-xl border border-slate-500 min-h-[140px]">
    <p className="text-sm font-black uppercase text-white mb-2">{title}</p>
    <p className="text-sm font-semibold text-slate-200 leading-tight">
      {boldText}
    </p>
    <p className="text-sm text-white mt-2 leading-relaxed">{desc}</p>
  </div>
);

const OutlineButton: React.FC<{ label: string }> = ({ label }) => (
  <button className="w-full py-2 border border-IMSCyan text-IMSCyan text-xs font-bold rounded-lg hover:bg-green-500/10 transition-colors">
    {label}
  </button>
);

const StatusPill: React.FC<{ label: string }> = ({ label }) => (
  <div className="px-3 py-1 bg-black border border-slate-800 rounded-full text-[10px] font-mono text-slate-400">
    {label}
  </div>
);

const MetricBox: React.FC<{ label: string; value?: string }> = ({
  label,
  value = "--",
}) => (
  <div className="bg-black p-3 rounded-lg border border-slate-500">
    <p className="text-[9px] font-bold text-slate-200 uppercase mb-1">{label}</p>
    <p className="text-sm font-mono text-slate-400">{value}</p>
  </div>
);

const Link2Icon = () => <Link size={10} className="text-IMSCyan" />;

export default Remediation;
