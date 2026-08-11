// components/ICP/CostEfficiency.tsx
"use client";

import React from "react";
import { COST_KPIS, COST_BARS } from "../libs/data";
import { Panel, SubH, ChartCard } from "./shared";
import { CostTrendChart, ChartLegend } from "./charts";

interface Props {
  onChartClick: (key: string) => void;
  onExpand: () => void;
  costMetrics?: any;
}

export default function CostEfficiency({ onChartClick, onExpand, costMetrics }: Props) {
  const kpis = costMetrics?.kpis?.length
    ? costMetrics.kpis.map((k: any) => ({
        label: k.label ?? k.name ?? "Metric",
        value: k.value ?? k.formattedValue ?? "—",
        delta: k.delta ?? k.change ?? "",
        cls: (k.positive ?? k.delta?.startsWith("+")) ? "text-emerald-600" : "text-red-500",
      }))
    : COST_KPIS;
  const bars = costMetrics?.bars?.length
    ? costMetrics.bars.map((b: any, i: number) => ({
        label: b.label ?? b.category ?? `Category ${i + 1}`,
        value: b.value ?? b.hoursSaved ?? 0,
        color: b.color ?? "#02DD82",
      }))
    : COST_BARS;
  const maxBar = Math.max(...bars.map((b: any) => b.value), 1);

  return (
    <Panel
      number="★"
      title="Cost & Engineering Efficiency"
      onExpand={onExpand}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        {kpis.map((k: any) => (
          <div
            key={k.label}
            className="bg-zinc-50 border border-zinc-100 rounded-lg p-3"
          >
            <div className="text-[11px] text-zinc-500 leading-snug h-6">
              {k.label}
            </div>
            <div className="text-xl font-bold tracking-tight mt-1 font-ibm">
              {k.value}
            </div>
            <div className={`text-[11px] font-semibold ${k.cls}`}>
              {k.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ChartCard chartKey="costBars" onClick={onChartClick}>
          <SubH>Engineer Hours Saved by Category</SubH>
          {bars.map((b: any) => (
            <div
              key={b.label}
              className="flex items-center gap-2.5 mb-2.5 text-[11.5px]"
            >
              <span className="text-zinc-500 w-[130px] shrink-0 truncate">
                {b.label}
              </span>
              <div className="flex-1 h-[7px] bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(b.value / maxBar) * 100}%`,
                    background: b.color,
                  }}
                />
              </div>
              <span className="font-mono text-[10.5px] text-zinc-500 w-10 text-right">
                {b.value}h
              </span>
            </div>
          ))}
        </ChartCard>

        <ChartCard chartKey="costTrend" onClick={onChartClick}>
          <SubH>Monthly Cost Avoidance Trend</SubH>
          <div className="h-[120px]">
            <CostTrendChart />
          </div>
          <ChartLegend
            items={[
              { color: "#02DD82", label: "Autonomous savings" },
              { color: "#3B82F6", label: "Reduced escalations" },
            ]}
          />
        </ChartCard>
      </div>
    </Panel>
  );
}
