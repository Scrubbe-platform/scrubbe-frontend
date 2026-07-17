// components/ICP/LearningOverview.tsx
"use client";

import React from "react";
import { KPI_DATA, CATEGORIES } from "../libs/data";
import { Panel, SubH, ChartCard } from "./shared";
import {
  Sparkline,
  MTTRChart,
  CategoryDonut,
  EffectivenessChart,
} from "./charts";

interface Props {
  onChartClick: (key: string) => void;
  onKpiClick: (kpi: (typeof KPI_DATA)[number]) => void;
  onExpand: () => void;
}

export default function LearningOverview({
  onChartClick,
  onKpiClick,
  onExpand,
}: Props) {
  return (
    <Panel
      number="1."
      title="Learning Overview Dashboard"
      onExpand={onExpand}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
        {KPI_DATA.map((kpi) => (
          <button
            key={kpi.label}
            type="button"
            onClick={() => onKpiClick(kpi)}
            className="text-left bg-zinc-50 border border-zinc-100 rounded-lg p-3 hover:border-zinc-300 hover:bg-white transition-all cursor-pointer"
          >
            <div className="text-[11px] text-zinc-500 leading-snug h-7">
              {kpi.label}
            </div>
            <div className="text-2xl font-bold tracking-tight mt-1 font-ibm">
              {kpi.value}
            </div>
            <div className={`text-[11px] font-semibold mt-0.5 ${kpi.cls}`}>
              {kpi.delta}
            </div>
            <Sparkline data={kpi.spark} color={kpi.color} />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 3xl:grid-cols-3 gap-4">
        <ChartCard
          chartKey="mttr"
          onClick={onChartClick}
          className="bg-zinc-50 border border-zinc-100 rounded-lg p-3.5"
        >
          <SubH>MTTR Trend</SubH>
          <div className="h-[130px]">
            <MTTRChart />
          </div>
        </ChartCard>

        <ChartCard
          chartKey="categories"
          onClick={onChartClick}
          className="bg-zinc-50 border border-zinc-100 rounded-lg p-3.5"
        >
          <SubH>Top Recurring Categories</SubH>
          <div className="flex items-center gap-3">
            <div className="w-[90px] shrink-0">
              <CategoryDonut />
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              {CATEGORIES.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center gap-2 text-[11px] text-zinc-600"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: c.color }}
                  />
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="font-mono font-semibold text-zinc-800">
                    {c.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard
          chartKey="effective"
          onClick={onChartClick}
          className="bg-zinc-50 border border-zinc-100 rounded-lg p-3.5"
        >
          <SubH>Most Effective Remediations</SubH>
          <div className="h-[140px]">
            <EffectivenessChart />
          </div>
        </ChartCard>
      </div>
    </Panel>
  );
}
