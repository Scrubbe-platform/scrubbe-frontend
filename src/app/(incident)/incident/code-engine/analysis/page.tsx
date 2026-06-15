"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { ArrowLeft, RefreshCw, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  InvestigationVariant,
  ReportData,
} from "../_modules/types/invetigation";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api/apiClient";
import { endpoint } from "@/lib/api/endpoint";

// ─── Narrative defaults by variant ───────────────────────────────────────────

function buildNarrativeDefaults(
  variant: InvestigationVariant,
  ticketId: string
): Pick<
  ReportData,
  | "scopeTitle"
  | "scopeBody"
  | "scopeSub"
  | "analysisTitle"
  | "analysisBody"
  | "analysisSub"
  | "unfoldedTitle"
  | "unfoldedBody1"
  | "unfoldedBody2"
  | "unfoldedBody3"
  | "highlightText"
  | "actionsTitle"
> {
  if (variant === "contributed") {
    return {
      scopeTitle: "Ezra consulted every intelligence source attached to the incident.",
      scopeBody: `This analysis is not the Code Engine speaking alone. Ezra read the full incident corpus for ${ticketId} spanning code, infrastructure, pipeline, configuration, dependencies, signals, runbooks, and prior incidents — and reconciled their findings into one account.`,
      scopeSub: "Multiple sources contributed evidence; the Code Engine was assessed as a contributing factor.",
      analysisTitle: "Code, deployments, metrics, and dependencies were correlated against one timeline.",
      analysisBody: `Every artefact was tested against the same scenario: when degradation began, which services were affected, and in what order. That covered logs, metrics, the deployments and commits that reached the affected services, infrastructure and node state, configuration changes, and dependency behaviour.`,
      analysisSub: "The question put to each was identical — does this correlate with onset, and does it touch the path that broke.",
      unfoldedTitle: "A code change became an outage because conditions allowed it to.",
      unfoldedBody1: "The deployment introduced a regression that under normal conditions might have remained contained. It did not fail in isolation.",
      unfoldedBody2: "System conditions at the time amplified the impact and allowed the regression to cascade into a customer-visible failure.",
      unfoldedBody3: "Recovery was slower than it should have been because automated mechanisms were not in place to catch and revert the change without manual intervention.",
      highlightText: "A clear code origin is a result, not a diagnosis. It names the starting point — the conditions that let it spread are equally important.",
      actionsTitle: "Stop impact first, then close the conditions that let it spread.",
    };
  }
  return {
    scopeTitle: "Ezra consulted every intelligence source, code included.",
    scopeBody: `Being consulted is not the same as contributing. Ezra read the full incident corpus for ${ticketId} — spanning code, infrastructure, pipeline, configuration, dependencies, signals, runbooks, and prior incidents. The Code Engine was among them, and it returned a finding: analysed, no link.`,
    scopeSub: "Code was examined thoroughly and excluded, which narrows the search rather than ending it.",
    analysisTitle: "The full code history was reviewed, not a sample.",
    analysisBody: `Every code artefact connected to the degraded services was correlated against the incident timeline — covering repositories, commits, pull requests, and deployments that reached affected services in the relevant window — alongside metrics, infrastructure state, and dependency behaviour.`,
    analysisSub: "Each change was tested against two questions: did it land close enough in time to have triggered the failure, and does it touch the code that broke.",
    unfoldedTitle: "The cause is operational, amplified by conditions outside the codebase.",
    unfoldedBody1: "Impact originated outside the codebase. Infrastructure conditions and external dependencies were involved in the degradation.",
    unfoldedBody2: "The codebase was settled at the time of the incident. No change correlated with onset across the examined repositories.",
    unfoldedBody3: "Recovery was shaped by the infrastructure conditions and runbook availability rather than any code issue.",
    highlightText: "Clearing code is a result, not a dead end. It removes an entire class of remediation and focuses the response where it matters.",
    actionsTitle: "Restore stability, harden the environment, and close the runbook gap.",
  };
}

// ─── API response type ────────────────────────────────────────────────────────

interface ApiAnalysis {
  incidentId: string;
  ticketId: string;
  variant: InvestigationVariant;
  eyebrow: string;
  title: string;
  subtitle: string;
  summaryTitle: string;
  summaryBody: string;
  summarySub: string;
  assessmentTitle: string;
  assessmentBadge: string;
  assessmentBody: string;
  metrics: {
    deployments: number;
    commits: number;
    pullRequests: number;
    repositories: number;
    windowLabel: string;
    windowValue: string;
  };
  causalFactors: Array<{ id?: number; factor: string; confidence: number; meaning: string }>;
  actions: string[];
  generatedAt: string;
}

// ─── Map API response → ReportData ───────────────────────────────────────────

function mapToReportData(api: ApiAnalysis): ReportData {
  const narrative = buildNarrativeDefaults(api.variant, api.ticketId);
  return {
    variant: api.variant,
    eyebrow: api.eyebrow,
    title: api.title,
    subtitle: api.subtitle,
    summaryTitle: api.summaryTitle,
    summaryBody: api.summaryBody,
    summarySub: api.summarySub,
    assessmentTitle: api.assessmentTitle,
    assessmentBadge: api.assessmentBadge,
    assessmentBody: api.assessmentBody,
    metrics: api.metrics,
    causalFactors: api.causalFactors.map((cf, i) => ({
      id: cf.id ?? i + 1,
      factor: cf.factor,
      confidence: cf.confidence,
      meaning: cf.meaning,
    })),
    actions: api.actions,
    ...narrative,
  };
}

// ─── Inner component (uses useSearchParams) ────────────────────────────────

function InvestigationAnalysisInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const incidentId = searchParams.get("id");

  const [data, setData] = useState<ReportData | null>(null);
  const [ticketId, setTicketId] = useState<string>("");
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<{ data: ApiAnalysis }>(
        `${endpoint.investigation_analysis.get}/${id}`
      );
      const api = res.data.data;
      setData(mapToReportData(api));
      setTicketId(api.ticketId);
      setGeneratedAt(api.generatedAt);
    } catch (err: any) {
      // If not found, auto-generate
      if (err?.response?.status === 404) {
        await handleGenerate(id);
      } else {
        setError(err?.message ?? "Failed to load analysis.");
        setLoading(false);
      }
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGenerate = async (id?: string) => {
    const target = id ?? incidentId;
    if (!target) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await apiClient.post<{ data: ApiAnalysis }>(
        `${endpoint.investigation_analysis.generate}/${target}/generate`
      );
      const api = res.data.data;
      setData(mapToReportData(api));
      setTicketId(api.ticketId);
      setGeneratedAt(api.generatedAt);
    } catch (err: any) {
      setError(err?.message ?? "Failed to generate analysis.");
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!incidentId) {
      setError("No incident ID provided. Navigate here with ?id=<incidentId>.");
      setLoading(false);
      return;
    }
    void fetchAnalysis(incidentId);
  }, [incidentId, fetchAnalysis]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading || generating) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-slate-400" size={28} />
          <p className="text-sm text-slate-500 font-medium">
            {generating ? "Generating investigation analysis…" : "Loading analysis…"}
          </p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4">
          <p className="text-sm text-red-500 font-medium">
            {error ?? "No analysis data available."}
          </p>
          {incidentId && (
            <button
              onClick={() => void handleGenerate()}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors"
            >
              Generate Analysis
            </button>
          )}
          <button
            onClick={() => router.back()}
            className="block mx-auto text-xs text-slate-400 hover:text-slate-600 underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const timeAgo = generatedAt
    ? new Date(generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] p-4 md:p-8 max-w-[1000px] mx-auto font-sans antialiased">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 px-3 py-1.5 border mb-2 border-slate-200 rounded-lg text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors shadow-sm"
      >
        <ArrowLeft size={14} />
        <span>Back</span>
      </button>
      <div className="max-w-[1000px] mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* ACTION HEADER BAR */}
        <header className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">
              Investigation Analysis
            </h1>
            {ticketId && (
              <span className="text-xs font-mono text-slate-400">{ticketId}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {timeAgo && (
              <span className="text-xs font-medium text-slate-400 font-mono hidden sm:inline">
                Generated {timeAgo}
              </span>
            )}
            <button
              onClick={() => void handleGenerate()}
              disabled={generating}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            >
              {generating ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              <span>Re-run</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors shadow-sm">
              <Download size={13} />
              <span>Export</span>
            </button>
          </div>
        </header>

        {/* MAIN BODY LAYOUT */}
        <div className="p-6 md:p-10 space-y-12">
          {/* RUN LOG TOP SUMMARY HEADER */}
          <section className="space-y-3">
            <p className="text-[11px] font-mono font-bold tracking-[0.15em] text-slate-400 uppercase">
              {data.eyebrow}
            </p>
            <h2 className="text-[22px] md:text-[26px] font-bold text-slate-900 tracking-tight leading-snug max-w-[850px]">
              {data.title}
            </h2>
            <p className="text-[14px] md:text-[15px] font-medium text-slate-500 leading-relaxed max-w-[900px]">
              {data.subtitle}
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* 1. EXECUTIVE SUMMARY */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-mono font-bold tracking-[0.15em] text-slate-400 uppercase">
              1. EXECUTIVE SUMMARY
            </h3>
            <h4 className="text-[16px] md:text-[18px] font-bold text-slate-900 tracking-tight">
              {data.summaryTitle}
            </h4>
            <div className="space-y-4 text-[14px] font-medium text-slate-600 leading-relaxed max-w-[900px]">
              <p>{data.summaryBody}</p>
              <p className="text-slate-500">{data.summarySub}</p>
            </div>
          </section>

          {/* 2. INVESTIGATION SCOPE */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-mono font-bold tracking-[0.15em] text-slate-400 uppercase">
              2. INVESTIGATION SCOPE
            </h3>
            <h4 className="text-[16px] md:text-[18px] font-bold text-slate-900 tracking-tight">
              {data.scopeTitle}
            </h4>
            <div className="space-y-4 text-[14px] font-medium text-slate-600 leading-relaxed max-w-[900px]">
              <p>{data.scopeBody}</p>
              <p className="text-slate-500">{data.scopeSub}</p>
            </div>
          </section>

          {/* 3. WHAT WAS ANALYSED */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-mono font-bold tracking-[0.15em] text-slate-400 uppercase">
              3. WHAT WAS ANALYSED
            </h3>
            <h4 className="text-[16px] md:text-[18px] font-bold text-slate-900 tracking-tight">
              {data.analysisTitle}
            </h4>
            <div className="space-y-4 text-[14px] font-medium text-slate-600 leading-relaxed max-w-[900px]">
              <p>{data.analysisBody}</p>
              <p className="text-slate-500">{data.analysisSub}</p>
            </div>
          </section>

          {/* 4. CODE ENGINE ASSESSMENT */}
          <section className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-[11px] font-mono font-bold tracking-[0.15em] text-slate-400 uppercase">
                4. CODE ENGINE ASSESSMENT
              </h3>
              <h4 className="text-[16px] md:text-[18px] font-bold text-slate-900 tracking-tight">
                {data.assessmentTitle}
              </h4>
            </div>

            {/* Assessment Meta Block Container */}
            <div className="border border-slate-200/80 rounded-xl bg-slate-50/50 p-5 md:p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded">
                  {data.assessmentBadge}
                </span>
              </div>
              <p className="text-[13px] md:text-[14px] font-medium text-slate-600 leading-relaxed">
                {data.assessmentBody}
              </p>

              {/* Strict Value Numerical Strip Layout */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 pt-2">
                <MetricBlock label="Deployments" value={data.metrics.deployments} />
                <MetricBlock label="Commits" value={data.metrics.commits} />
                <MetricBlock label="Pull Requests" value={data.metrics.pullRequests} />
                <MetricBlock label="Repositories" value={data.metrics.repositories} />

                <div className="flex flex-col col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-slate-200/80 pt-4 sm:pt-0 sm:pl-6 min-w-0">
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block truncate">
                    {data.metrics.windowLabel}
                  </span>
                  <span className="text-[14px] font-bold text-slate-800 tracking-tight block truncate mt-1">
                    {data.metrics.windowValue}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 5. CAUSAL FACTORS MATRIX */}
          {data.causalFactors.length > 0 && (
            <section className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-[11px] font-mono font-bold tracking-[0.15em] text-slate-400 uppercase">
                  5. CAUSAL FACTORS
                </h3>
                <h4 className="text-[16px] md:text-[18px] font-bold text-slate-900 tracking-tight">
                  Ezra records every factor, and does not collapse them into one root cause.
                </h4>
              </div>

              {/* Matrix Data Density Table */}
              <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-sm bg-white">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4 w-12 text-center">#</th>
                        <th className="py-3 px-4 w-1/4">Factor</th>
                        <th className="py-3 px-4 w-24 text-right">Confidence</th>
                        <th className="py-3 px-6">What It Means</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {data.causalFactors.map((factor, index: number) => {
                        const isHighlightedRow =
                          (data.variant === "not-contributed" && factor.id === 4) ||
                          (data.variant === "contributed" && factor.id === 1);
                        return (
                          <tr
                            key={factor.id}
                            className={cn(
                              "transition-colors hover:bg-slate-50/50 font-medium text-slate-700",
                              isHighlightedRow && "bg-emerald-50/40 hover:bg-emerald-50/60"
                            )}
                          >
                            <td className="py-4 px-4 text-center font-mono text-xs text-slate-400">
                              {index + 1}
                            </td>
                            <td className="py-4 px-4 font-bold text-slate-900 tracking-tight">
                              {factor.factor}
                            </td>
                            <td className="py-4 px-4 font-mono text-right font-bold tabular-nums text-slate-900">
                              {factor.confidence}%
                            </td>
                            <td className="py-4 px-6 text-slate-500 leading-normal">
                              {factor.meaning}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="bg-slate-50/50 px-4 py-2.5 border-t border-slate-100">
                  <p className="text-[10px] font-mono font-medium text-slate-400">
                    Confidence Reflects Ezra&apos;s Assessment Per Factor, Not A Single Root Cause.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* 6. HOW IT UNFOLDED */}
          <section className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-[11px] font-mono font-bold tracking-[0.15em] text-slate-400 uppercase">
                6. HOW IT UNFOLDED
              </h3>
              <h4 className="text-[16px] md:text-[18px] font-bold text-slate-900 tracking-tight">
                {data.unfoldedTitle}
              </h4>
            </div>

            <div className="space-y-4 text-[14px] font-medium text-slate-600 leading-relaxed max-w-[900px]">
              <p>{data.unfoldedBody1}</p>
              <p>{data.unfoldedBody2}</p>
              <p>{data.unfoldedBody3}</p>
            </div>

            <div className="p-5 bg-emerald-50/40 border border-emerald-500/10 rounded-xl mt-4">
              <p className="text-[13px] md:text-[14px] font-medium text-emerald-900 leading-relaxed">
                {data.highlightText}
              </p>
            </div>
          </section>

          {/* 7. RECOMMENDED ACTIONS LIST */}
          {data.actions.length > 0 && (
            <section className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-[11px] font-mono font-bold tracking-[0.15em] text-slate-400 uppercase">
                  7. RECOMMENDED ACTIONS
                </h3>
                <h4 className="text-[16px] md:text-[18px] font-bold text-slate-900 tracking-tight">
                  {data.actionsTitle}
                </h4>
              </div>

              <ol className="space-y-3 max-w-[900px]">
                {data.actions.map((action: string, i: number) => (
                  <li
                    key={i}
                    className="flex gap-3 text-[14px] font-medium leading-relaxed text-slate-600"
                  >
                    <span className="font-mono text-slate-400 shrink-0 select-none">{i + 1}.</span>
                    <p>{action}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Default export (Suspense boundary for useSearchParams) ──────────────────

export default function InvestigationAnalysis() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
          <Loader2 className="animate-spin text-slate-400" size={28} />
        </div>
      }
    >
      <InvestigationAnalysisInner />
    </Suspense>
  );
}

interface MetricBlockProps {
  label: string;
  value: number;
}

function MetricBlock({ label, value }: MetricBlockProps) {
  return (
    <div className="flex flex-col min-w-0">
      <span className="text-[14px] font-bold text-slate-800 tracking-tight block">{value}</span>
      <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mt-0.5 truncate">
        {label}
      </span>
    </div>
  );
}
