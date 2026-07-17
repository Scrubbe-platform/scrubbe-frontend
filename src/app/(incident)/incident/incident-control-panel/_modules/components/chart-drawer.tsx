// components/ICP/ChartDrawer.tsx
"use client";

import React from "react";
import { CHART_NOTES } from "../libs/chart-notes";
import {
  MTTRChart,
  CategoryDonut,
  EffectivenessChart,
  ClusterScatter,
  SuccessDonut,
  EALTrendChart,
  BurnRateChart,
  CostTrendChart,
  OrchTrendChart,
  AgentAccuracyChart,
} from "./charts";

const CHART_MAP: Record<string, React.ReactNode> = {
  mttr: (
    <div className="h-[280px]">
      <MTTRChart big />
    </div>
  ),
  categories: (
    <div className="max-w-[260px] mx-auto">
      <CategoryDonut big />
    </div>
  ),
  effective: (
    <div className="h-[260px]">
      <EffectivenessChart big />
    </div>
  ),
  cluster: (
    <div className="h-[300px]">
      <ClusterScatter big />
    </div>
  ),
  remDonut: (
    <div className="max-w-[220px] mx-auto">
      <SuccessDonut big />
    </div>
  ),
  compliance: (
    <div className="max-w-[220px] mx-auto">
      <SuccessDonut rate={96.2} big />
    </div>
  ),
  ealTrend: (
    <div className="h-[240px]">
      <EALTrendChart big />
    </div>
  ),
  sloBurn: (
    <div className="h-[240px]">
      <BurnRateChart big />
    </div>
  ),
  costTrend: (
    <div className="h-[280px]">
      <CostTrendChart big />
    </div>
  ),
  orchTrend: (
    <div className="h-[240px]">
      <OrchTrendChart big />
    </div>
  ),
  agentAcc: (
    <div className="h-[260px]">
      <AgentAccuracyChart big />
    </div>
  ),
  agentHealth: (
    <div className="max-w-[220px] mx-auto">
      <SuccessDonut rate={90.4} big />
    </div>
  ),
};

export default function ChartDrawerContent({ chartKey }: { chartKey: string }) {
  const note = CHART_NOTES[chartKey];
  if (!note)
    return (
      <p className="text-sm text-zinc-400">
        No analysis available for this chart.
      </p>
    );

  return (
    <div className="space-y-5">
      {CHART_MAP[chartKey] && (
        <div className="bg-zinc-50 rounded-xl border border-zinc-100 p-5">
          {CHART_MAP[chartKey]}
        </div>
      )}
      <div>
        <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-zinc-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            Ezra Analysis
          </span>
          <span className="text-[11px] text-zinc-400 italic ml-auto">
            Pre-computed
          </span>
        </div>
        <p className="text-[13px] text-zinc-600 leading-[1.72]">{note.note}</p>
      </div>
    </div>
  );
}

export function getChartMeta(key: string) {
  return CHART_NOTES[key];
}
