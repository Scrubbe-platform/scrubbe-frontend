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
  Link,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { useRouter } from "next/navigation";

// ── Helpers ───────────────────────────────────────────────────────

const formatConfidence = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return value <= 1 ? `${Math.round(value * 100)}%` : `${Math.round(value)}%`;
};

interface Hypothesis {
  id: string;
  title: string;
  confidence: number;
  runUrl: string;
  diffUrl: string;
}

// ── Actions data ──────────────────────────────────────────────────

const actionVariant: Record<string, string> = {
  amber:
    "border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 text-amber-700 dark:text-amber-400",
  red: "border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 text-red-600 dark:text-red-400",
  sky: "border-sky-200 dark:border-sky-500/20 bg-sky-50 dark:bg-sky-500/5 text-sky-600 dark:text-sky-400",
  violet:
    "border-violet-200 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/5 text-violet-600 dark:text-violet-400",
  emerald:
    "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",
};

// ── Component ─────────────────────────────────────────────────────

const Remediation: React.FC<{ incidentId?: string }> = ({ incidentId }) => {
  const { get } = useFetch();
  const router = useRouter();
  const { data: analysis } = useQuery({
    queryKey: ["ezra-analysis-delivery", incidentId],
    queryFn: async () => {
      if (!incidentId) return null;
      const res = await get(`${endpoint.ezra.analysis}/${incidentId}`);
      return res.success ? (res.data?.data ?? null) : null;
    },
    enabled: !!incidentId,
  });

  const rawHypotheses: any[] =
    analysis?.rootCause?.hypotheses ??
    analysis?.situation?.hypotheses ??
    analysis?.remediation?.options ??
    [];
  const hypotheses: Hypothesis[] = rawHypotheses.length
    ? rawHypotheses.map((h: any, i) => ({
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

  const actions = [
    {
      icon: <Code size={13} />,
      label: "Review in Code Engine",
      variant: "amber",
      action: () => router.push(`/incident/code-engine?id=${incidentId}`),
    },
    {
      icon: <PlayCircle size={13} />,
      label: "Execute safe action",
      variant: "red",
    },
    { icon: <Zap size={13} />, label: "Generate Ezra", variant: "red" },
    { icon: <Info size={13} />, label: "Suggestion details", variant: "sky" },
    {
      icon: <PlusSquare size={13} />,
      label: "Create PR",
      variant: "violet",
      action: () => router.push(`/incident/code-engine?id=${incidentId}`),
    },
    {
      icon: <Zap size={13} />,
      label: "Merge suggested PR",
      variant: "red",
      action: () => router.push(`/incident/code-engine?id=${incidentId}`),
    },
    {
      icon: <ArrowUpRight size={13} />,
      label: "Open Ezra full view",
      variant: "emerald",
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
    analysis?.remediation?.confidence ??
    analysis?.rootCause?.confidence ??
    null;
  const playbook =
    analysis?.remediation?.playbook ?? primaryOption?.playbook ?? null;
  const riskLevel =
    primaryOption?.riskLevel ?? analysis?.rootCause?.riskLevel ?? "--";
  const approvalMode = primaryOption?.approvalMode ?? "review-required";
  const recSource = primaryOption?.source ?? "--";

  const statusChips = [
    { label: "Confidence", value: formatConfidence(confidence) },
    { label: "Risk", value: riskLevel },
    { label: "Source", value: recSource },
    { label: "Approval", value: approvalMode },
  ];

  const outlineButtons = [
    "Auto-suggest fix",
    "Create PR",
    "Run CI/CD",
    "Merge (requires approval)",
  ];

  return (
    <div className="rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500 mb-0.5">
          Remediation
        </p>
        <p className="text-[14px] font-semibold text-black dark:text-zinc-100">
          Suggest, verify, summarize
        </p>
        <p className="text-[12px] text-black dark:text-zinc-500 mt-0.5">
          Default is PR-safe. Verification is shown after execution.
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* ── Action buttons ── */}
        <div className="flex flex-wrap gap-2">
          {actions.map(({ icon, label, variant, action }) => (
            <button
              key={label}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-colors hover:opacity-80 ${actionVariant[variant]}`}
              onClick={() => action?.()}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* ── Automated remediation ── */}
        <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500 mb-0.5">
              Automated remediation
            </p>
            <p className="text-[12px] text-black dark:text-zinc-500">
              Based on the failure type, Scrubbe proposes the next best actions
              (code patch, PR, CI rerun) and tracks outcomes.
            </p>
          </div>

          {/* Status chips */}
          <div className="flex flex-wrap gap-1.5">
            {statusChips.map(({ label, value }) => (
              <span
                key={label}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[11px] font-mono"
              >
                <span className="text-zinc-400 dark:text-zinc-500">
                  {label}:
                </span>
                <span className="text-black dark:text-zinc-300">{value}</span>
              </span>
            ))}
          </div>

          {/* Suggestion boxes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {[
              {
                title: "Suggested action",
                main: suggestion,
                note: playbook
                  ? `Playbook: ${playbook}`
                  : "Generate a connector-informed remediation PR before rerunning verification.",
              },
              {
                title: "Suggested PR change",
                main: prSuggestion,
                note: 'Files touched and risk should align with the "Diff provenance" review.',
              },
              {
                title: "Suggested CI action",
                main: ciSuggestion,
                note: "Verification results update automatically when actions run.",
              },
            ].map(({ title, main, note }) => (
              <div
                key={title}
                className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 p-3.5 space-y-2"
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
                  {title}
                </p>
                <p className="text-[12px] font-medium text-black dark:text-zinc-200 leading-snug">
                  {main}
                </p>
                <p className="text-[11px] text-black dark:text-zinc-500 leading-relaxed">
                  {note}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Two-col: suggestion preview + verification ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Suggestion preview */}
          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
                Suggestion preview
              </p>
              <div className="flex gap-1.5">
                <Chip label="id" value={primaryOption?.id ?? "--"} />
                <Chip label="conf" value={formatConfidence(confidence)} />
              </div>
            </div>
            <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 p-3 h-32 overflow-auto">
              <pre className="text-[11px] font-mono text-black dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                {suggestion}
              </pre>
            </div>
          </div>

          {/* Verification results */}
          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
              Verification results
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "CI rerun", value: ciSuggestion ? "Ready" : "--" },
                {
                  label: "Flake rate",
                  value: primaryOption?.safetyLevel ?? "--",
                },
                {
                  label: "Affected jobs",
                  value: hypotheses.length ? String(hypotheses.length) : "--",
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 p-2.5"
                >
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-black dark:text-zinc-500 mb-1">
                    {label}
                  </p>
                  <p className="text-[12px] font-mono text-zinc-600 dark:text-zinc-300">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-black dark:text-zinc-500">
              Execute a safe action to generate verification results.
            </p>
            <div className="space-y-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
                Ezra summaries
              </p>
              {[
                { label: "Executive", audience: "LEADERSHIP" },
                { label: "Analyst", audience: "ENGINEER" },
              ].map(({ label, audience }) => (
                <div key={label}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-black dark:text-zinc-500 mb-0.5">
                    {label}
                  </p>
                  <p className="text-[12px] text-black dark:text-zinc-400">
                    {analysis?.reports?.find(
                      (r: any) => r.audience === audience,
                    )?.narrative ?? "--"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Hypothesis panel ── */}
        <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
              Root-cause hypothesis panel
            </p>
            <button className="px-3 py-1 rounded-lg border border-zinc-500 dark:border-zinc-700 text-[11px] font-medium text-black dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              Expand
            </button>
          </div>

          <div className="space-y-2">
            {hypotheses.map((hyp) => (
              <div
                key={hyp.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 p-3.5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-black dark:text-zinc-200 leading-snug">
                    {hyp.title}
                  </p>
                  <p className="text-[11px] font-mono text-black dark:text-zinc-500 mt-1">
                    Confidence: {formatConfidence(hyp.confidence)}
                  </p>
                  <div className="flex gap-2 mt-2.5">
                    {["runUrl", "diffUrl"].map((key) => (
                      <a
                        key={key}
                        href={key === "runUrl" ? hyp.runUrl : hyp.diffUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 rounded-lg border border-zinc-500 dark:border-zinc-700 text-[10px] font-mono text-sky-600 dark:text-sky-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Link size={9} /> {key}
                      </a>
                    ))}
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-1 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-zinc-400 shrink-0">
                  {hyp.id}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Chip ──────────────────────────────────────────────────────────

const Chip = ({ label, value }: { label: string; value: string }) => (
  <span className="flex items-center gap-1 px-2 py-0.5 rounded border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[10px] font-mono">
    <span className="text-zinc-400 dark:text-zinc-500">{label}:</span>
    <span className="text-zinc-600 dark:text-zinc-300">{value}</span>
  </span>
);

export default Remediation;
