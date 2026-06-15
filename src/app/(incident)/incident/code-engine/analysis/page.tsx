// components/InvestigationAnalysis.tsx
"use client";

import React, { useState } from "react";
import { ArrowLeft, RefreshCw, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  InvestigationVariant,
  ReportData,
} from "../_modules/types/invetigation";
import { useRouter } from "next/navigation";

const mockReports: Record<
  "contributed" | "not-contributed",
  ReportData
> = {
  "not-contributed": {
    variant: "not-contributed",
    eyebrow: "EZRA SUMMIT INTELLIGENCE",
    title: "Source code did not contribute to this incident.",
    subtitle:
      "Ezra examined the full code history behind the affected services and ruled it out. No commit, pull request, or deployment correlates with onset. There is nothing to revert and nothing to patch — the cause lies in infrastructure and a third-party dependency.",
    summaryTitle: "The cause is operational, not in the codebase.",
    summaryBody:
      "On the evidence available, source code is not a contributing factor to 91-4839281. The most recent changes to the affected services predate the failure and touch none of the paths where impact appeared.",
    summarySub:
      "The consequence for the response is direct. No rollback will help, and no hotfix is waiting to be written. Time spent searching the codebase is time not spent where the cause actually lives — Infrastructure and a degraded dependency.",
    scopeTitle: "Ezra consulted every intelligence source, code included.",
    scopeBody:
      "Being consulted is not the same as contributing. Ezra read the full incident corpus — 11 services spanning code, infrastructure, pipeline, configuration, dependencies, signals, runbooks, and prior incidents. The Code Engine was among them, and it returned a finding: analysed, no link.",
    scopeSub:
      "Of the eleven sources, three were assessed as contributing. Code was examined thoroughly and excluded, which narrows the search rather than ending it.",
    analysisTitle: "The full code history was reviewed, not a sample.",
    analysisBody:
      "Every code artefact connected to the degraded services was correlated against the incident timeline. That covered 14 repositories, 127 commits, 36 pull requests, and the 9 deployments that reached those services in the relevant window — alongside metrics, infrastructure state, and dependency behaviour.",
    analysisSub:
      "Each change was tested against two questions: did it land close enough in time to have triggered the failure, and does it touch the code that broke. Both returned the same answer across all 14 repositories.",
    assessmentTitle:
      "The codebase was assessed directly – here is what that assessment found.",
    assessmentBadge: "Contributed – None",
    assessmentBody:
      "Code Engine analysed 9 deployments, 127 commits, 36 pull requests and 14 repositories within the incident window. No evidence linked source code changes to customer impact. Code Engine is classified as a non-contributing intelligence source for this incident.",
    metrics: {
      deployments: 7,
      commits: 31,
      pullRequests: 9,
      repositories: 3,
      windowLabel: "Window size: 14:10-14:40",
      windowValue: "Examined window",
    },
    causalFactors: [
      {
        id: 1,
        factor: "Node memory exhaustion",
        confidence: 92,
        meaning: "Cluster ran out of memory headroom under load",
      },
      {
        id: 2,
        factor: "Third-party dependency",
        confidence: 95,
        meaning: "Upstream provider latency rose sharply at onset",
      },
      {
        id: 3,
        factor: "Runbook gap",
        confidence: 87,
        meaning: "No remediation guidance for this failure mode",
      },
      {
        id: 4,
        factor: "Code changes",
        confidence: 4,
        meaning: "No action — examined and cleared",
      },
    ],
    unfoldedTitle:
      "A degraded dependency met a cluster with no headroom, and a runbook gap slowed recovery.",
    unfoldedBody1:
      "Impact originated outside the codebase. A third-party provider the checkout path depends on began returning elevated latency, which backed up requests and drove memory consumption upward across the serving nodes.",
    unfoldedBody2:
      "The cluster had little headroom to absorb it. Memory exhaustion followed, and the service degraded — not because of anything that was shipped, but because of how the running system met an external slowdown. The settled code behaved exactly as written.",
    unfoldedBody3:
      "Recovery was then delayed by a missing runbook. There was no documented remediation for this specific failure mode, so the response had to be assembled live rather than executed from a known procedure.",
    highlightText:
      "Clearing code is a result, not a dead end. It removes an entire class of remediation and spares the first-hour mistake of preparing a rollback that would change nothing.",
    actionsTitle:
      "Restore headroom, harden the dependency, and write the missing runbook.",
    actions: [
      "Relieve the dependency pressure. Fail over or shed load from the degraded provider to stop memory climbing on the serving nodes.",
      "Add memory headroom to the checkout tier so an external slowdown no longer saturates the cluster before mitigation lands.",
      "Write the missing runbook for dependency-driven memory exhaustion, so the next occurrence is executed, not improvised. Treat the codebase as settled.",
    ],
  },
  contributed: {
    variant: "contributed",
    eyebrow: "EZRA SUMMIT INTELLIGENCE",
    title:
      "A deployment to checkout introduced the fault that caused this incident.",
    subtitle:
      "Ezra attributes the outage to several conditions that aligned. The leading factor is a code change: a release reached the checkout service eleven minutes before impact began. There is a change to revert, and rollback is the fastest path to recovery.",
    summaryTitle:
      "The incident has a code origin, amplified by infrastructure and a recovery gap.",
    summaryBody:
      "This was not a single-failure failure. A deployment introduced a memory regression in the checkout service; elevated traffic then accelerated node saturation; and the absence of an automated rollback extended customer impact. Each condition was necessary; together they produced the outage.",
    summarySub:
      "For the people running this incident, the first move is clear. Roll back the checkout release that landed at 14:21 UTC — it is the single action that addresses the originating factor and stops impact accruing.",
    scopeTitle:
      "Ezra consulted every intelligence source attached to the incident.",
    scopeBody:
      "This analysis is not the Code Engine speaking alone. Ezra read the full incident corpus — 11 services spanning code, infrastructure, pipeline, configuration, dependencies, signals, runbooks, and prior incidents — and reconciled their findings into one account.",
    scopeSub:
      "Eleven sources contributed evidence; three were assessed as contributing factors. The rest were consulted and cleared, which is itself part of the result.",
    analysisTitle:
      "Code, deployments, metrics, and dependencies were correlated against one timeline.",
    analysisBody:
      "Every artefact was tested against the same scenario: when degradation began, which services were affected, and in what order. That covered logs and metrics, the 7 deployments and 31 commits that reached the affected services, infrastructure and node state, configuration changes, dependency behaviour, and two historically similar incidents.",
    analysisSub:
      "The question put to each was identical — does this correlate with onset, and does it touch the path that broke. For the checkout release, both answers were yes.",
    assessmentTitle:
      "The codebase was assessed directly – here is what that assessment found.",
    assessmentBadge: "Contribution – High",
    assessmentBody:
      "Code Engine identified a deployment to the checkout service that completed approximately 11 minutes before customer impact. Exception rates in the affected path rose sharply in the same window, and the change modifies the code that failed. Code Engine is assessed as a direct contributing factor.",
    metrics: {
      deployments: 7,
      commits: 31,
      pullRequests: 9,
      repositories: 3,
      windowLabel: "Window: 14:10–14:40 UTC",
      windowValue: "Examined window",
    },
    causalFactors: [
      {
        id: 1,
        factor: "Code deployment",
        confidence: 92,
        meaning: "Checkout release introduced a memory regression",
      },
      {
        id: 2,
        factor: "Memory saturation",
        confidence: 95,
        meaning: "Node memory exhaustion reduced recovery headroom",
      },
      {
        id: 3,
        factor: "Missing rollback procedure",
        confidence: 87,
        meaning: "No automated rollback, recovery was manual",
      },
    ],
    unfoldedTitle:
      "A small regression became an outage because two other conditions were already in place.",
    unfoldedBody1:
      "The checkout release introduced higher memory consumption. Under normal load this would have stayed within headroom and gone unnoticed. It did not fail in isolation.",
    unfoldedBody2:
      "Traffic at the time was elevated, which raised memory pressure and accelerated node saturation. Once nodes began to saturate, the regression that would otherwise have been benign tipped the service into failure.",
    unfoldedBody3:
      "Recovery was then slower than it should have been. With no automated rollback in place, the responders had to intervene by hand, which extended customer impact by roughly 19 minutes beyond the point at which the cause was understood.",
    highlightText:
      "A benign change, elevated traffic, and a manual recovery path. Remove any one and there is no outage. That is why the fix is more than a rollback.",
    actionsTitle:
      "Stop impact first, then close the two conditions that let it spread.",
    actions: [
      "Roll back the checkout release (14:21 UTC). It addresses the originating factor and is reversible. This is the recovery action.",
      "Add an automated rollback trigger on exception-rate breach for checkout, so the next regression is reverted without a responder in the loop.",
      "Right-size node memory headroom for the checkout tier so a single regression under peak traffic no longer saturates the cluster.",
    ],
  },
};
export default function InvestigationAnalysis() {
  const [variant, setVariant] =
    useState<InvestigationVariant>("not-contributed");
  const data: ReportData = mockReports[variant];
  const router = useRouter();
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
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400 font-mono hidden sm:inline">
              Executed 2 min ago
            </span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors shadow-sm">
              <RefreshCw size={13} />
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
                <MetricBlock
                  label="Deployments"
                  value={data.metrics.deployments}
                />
                <MetricBlock label="Commits" value={data.metrics.commits} />
                <MetricBlock
                  label="Pull Requests"
                  value={data.metrics.pullRequests}
                />
                <MetricBlock
                  label="Repositories"
                  value={data.metrics.repositories}
                />

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
          <section className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-[11px] font-mono font-bold tracking-[0.15em] text-slate-400 uppercase">
                5. CAUSAL FACTORS
              </h3>
              <h4 className="text-[16px] md:text-[18px] font-bold text-slate-900 tracking-tight">
                Ezra records every factor, and does not collapse them into one
                root cause.
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
                        (data.variant === "not-contributed" &&
                          factor.id === 4) ||
                        (data.variant === "contributed" && factor.id === 1);
                      return (
                        <tr
                          key={factor.id}
                          className={cn(
                            "transition-colors hover:bg-slate-50/50 font-medium text-slate-700",
                            isHighlightedRow &&
                              "bg-emerald-50/40 hover:bg-emerald-50/60",
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
                  Confidence Reflects Ezra's Assessment Per Factor, Not A Single
                  Root Cause.
                </p>
              </div>
            </div>
          </section>

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
                  <span className="font-mono text-slate-400 shrink-0 select-none">
                    {i + 1}.
                  </span>
                  <p>{action}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}

interface MetricBlockProps {
  label: string;
  value: number;
}

function MetricBlock({ label, value }: MetricBlockProps) {
  return (
    <div className="flex flex-col min-w-0">
      <span className="text-[14px] font-bold text-slate-800 tracking-tight block">
        {value}
      </span>
      <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mt-0.5 truncate">
        {label}
      </span>
    </div>
  );
}
