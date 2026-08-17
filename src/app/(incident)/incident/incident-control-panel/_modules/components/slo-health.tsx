// components/ICP/SLOHealth.tsx
"use client";

import React, { useState } from "react";
import { SLO_DATA } from "../libs/data";
import {
  Panel,
  SubH,
  Pill,
  ChartCard,
  LinkAction,
  sloStatusStyles,
} from "./shared";
import { BurnRateChart, ChartLegend } from "./charts";
import SideModal from "@/components/ui/SideModal";

interface Props {
  onChartClick: (key: string) => void;
  onExpand: () => void;
  sloMetrics?: any[];
}

export default function SLOHealth({ onChartClick, onExpand, sloMetrics }: Props) {
  const [showAllSLO, setShowAllSLO] = useState(false);

  const data = sloMetrics?.length
    ? sloMetrics.map((s: any) => ({
        svc: s.service ?? s.svc ?? "Service",
        target: s.target ?? s.sloTarget ?? "99.9%",
        actual: s.actual ?? s.currentValue ?? 99.9,
        budget: s.budget ?? s.errorBudgetRemaining ?? 5,
        burn: s.burn ?? s.burnRate ?? 0.5,
        status: (s.status === "BREACH" || s.status === "breach") ? "breach" as const : (s.status === "WARN" || s.status === "warn" || s.status === "AT_RISK") ? "warn" as const : "healthy" as const,
      }))
    : SLO_DATA;

  const healthy = data.filter((s) => s.status === "healthy").length;
  const atRisk = data.filter((s) => s.status === "warn").length;
  const breached = data.filter((s) => s.status === "breach").length;
  const avg = (
    data.reduce((a, s) => a + s.actual, 0) / data.length
  ).toFixed(2);
  const fastest = [...data].sort((a, b) => b.burn - a.burn)[0];

  return (
    <>
      <Panel number="★" title="SLO Health & Error Budget" onExpand={onExpand}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {data.map((s) => {
            const st = sloStatusStyles[s.status];
            return (
              <div
                key={s.svc}
                className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 rounded-lg p-3"
              >
                <div className="text-[11.5px] font-bold text-zinc-800 dark:text-zinc-100">
                  {s.svc}
                </div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mb-2">
                  SLO target: {s.target}
                </div>
                <div
                  className="text-xl font-bold tracking-tight"
                  style={{ color: st.color }}
                >
                  {s.actual}%
                </div>
                <Pill
                  color={
                    s.status === "healthy"
                      ? "green"
                      : s.status === "warn"
                        ? "amber"
                        : "red"
                  }
                >
                  {s.status === "healthy"
                    ? "Healthy"
                    : s.status === "warn"
                      ? "At Risk"
                      : "Breached"}
                </Pill>
                <div className="flex justify-between text-[10.5px] text-zinc-400 dark:text-zinc-500 mt-2">
                  <span>Error budget</span>
                  <span
                    className={`font-mono font-semibold ${s.budget < 0 ? "text-red-500 dark:text-red-400" : "text-zinc-600 dark:text-zinc-300"}`}
                  >
                    {s.budget > 0 ? "+" : ""}
                    {s.budget}h
                  </span>
                </div>
                <div className="h-1 rounded-full bg-zinc-200 dark:bg-zinc-800 mt-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (s.burn / 5) * 100)}%`,
                      background: st.color,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10.5px] text-zinc-400 dark:text-zinc-500 mt-1">
                  <span>Burn rate</span>
                  <span className="font-mono font-semibold text-zinc-600 dark:text-zinc-300">
                    {s.burn}x
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <ChartCard chartKey="sloBurn" onClick={onChartClick}>
          <SubH>Error Budget Burn Rate — Last 7 Days</SubH>
          <div className="h-[80px]">
            <BurnRateChart />
          </div>
          <ChartLegend
            items={[
              { color: "#EF4444", label: "Search Svc" },
              { color: "#F59E0B", label: "Payment API" },
              { color: "#02DD82", label: "Checkout" },
            ]}
          />
        </ChartCard>

        <div className="mt-3">
          <button type="button" onClick={() => setShowAllSLO(true)}>
            <LinkAction>View all SLO reports →</LinkAction>
          </button>
        </div>
      </Panel>

      {showAllSLO && (
        <SideModal
          isOpen={showAllSLO}
          onClose={() => setShowAllSLO(false)}
          title="SLO Reports"
          subTitle="Reliability targets, error-budget consumption and burn rate across every tracked service."
        >
          <div className="space-y-4">
            {/* Summary KPIs */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 rounded-lg p-3">
                <div className="text-[10.5px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
                  Services tracked
                </div>
                <div className="text-2xl font-bold tracking-tight mt-1 dark:text-zinc-100 font-ibm">
                  {data.length}
                </div>
                <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Across production surfaces
                </div>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 rounded-lg p-3">
                <div className="text-[10.5px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
                  Avg attainment
                </div>
                <div className="text-2xl font-bold tracking-tight mt-1 dark:text-zinc-100 font-ibm">
                  {avg}%
                </div>
                <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  30-day rolling window
                </div>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 rounded-lg p-3">
                <div className="text-[10.5px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
                  Fastest burn
                </div>
                <div
                  className="text-2xl font-bold tracking-tight mt-1 dark:text-zinc-100 font-ibm"
                  style={{ color: fastest.burn > 2.5 ? "#DC2626" : undefined }}
                >
                  {fastest.svc}
                </div>
                <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  {fastest.burn.toFixed(2)}× budget rate
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 rounded-lg p-3">
                <div className="text-[10.5px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
                  Healthy
                </div>
                <div className="text-2xl font-bold tracking-tight mt-1 text-emerald-600 dark:text-emerald-400 font-ibm">
                  {healthy}
                </div>
                <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Within target & budget
                </div>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 rounded-lg p-3">
                <div className="text-[10.5px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
                  At risk
                </div>
                <div
                  className="text-2xl font-bold tracking-tight mt-1 dark:text-zinc-100 font-ibm"
                  style={{ color: atRisk ? "#B45309" : undefined }}
                >
                  {atRisk}
                </div>
                <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Elevated burn rate
                </div>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 rounded-lg p-3">
                <div className="text-[10.5px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
                  Breached
                </div>
                <div
                  className="text-2xl font-bold tracking-tight mt-1 dark:text-zinc-100 font-ibm"
                  style={{ color: breached ? "#DC2626" : undefined }}
                >
                  {breached}
                </div>
                <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Budget exhausted
                </div>
              </div>
            </div>

            {/* Full SLO table */}
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="text-left pb-2 pr-2">Service</th>
                    <th className="text-left pb-2 pr-2">SLO target</th>
                    <th className="text-left pb-2 pr-2">Current</th>
                    <th className="text-left pb-2 pr-2">Error budget</th>
                    <th className="text-left pb-2 pr-2">Burn rate</th>
                    <th className="text-left pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((s) => {
                    const st = sloStatusStyles[s.status];
                    return (
                      <tr key={s.svc} className="border-t border-zinc-100 dark:border-zinc-800">
                        <td className="py-2.5 pr-2 font-semibold text-zinc-800 dark:text-zinc-100">
                          {s.svc}
                        </td>
                        <td className="py-2.5 pr-2 font-mono text-zinc-500 dark:text-zinc-500">
                          {s.target}
                        </td>
                        <td
                          className="py-2.5 pr-2 font-mono font-bold"
                          style={{ color: st.color }}
                        >
                          {s.actual}%
                        </td>
                        <td className="py-2.5 pr-2">
                          <span
                            className={
                              s.budget < 0 ? "text-red-600 dark:text-red-400" : "text-zinc-600 dark:text-zinc-300"
                            }
                          >
                            {s.budget > 0 ? "+" : ""}
                            {s.budget}% of target
                          </span>
                        </td>
                        <td className="py-2.5 pr-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              s.burn > 2.5
                                ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                                : s.burn > 1
                                  ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500"
                            }`}
                          >
                            {s.burn.toFixed(2)}×
                          </span>
                        </td>
                        <td className="py-2.5">
                          <Pill
                            color={
                              s.status === "healthy"
                                ? "green"
                                : s.status === "warn"
                                  ? "amber"
                                  : "red"
                            }
                          >
                            {s.status === "healthy"
                              ? "Healthy"
                              : s.status === "warn"
                                ? "At Risk"
                                : "Breached"}
                          </Pill>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
              Burn rate is the 30-day error-budget consumption multiple — a
              value above <strong className="text-zinc-600 dark:text-zinc-300">1×</strong> means
              the budget is being spent faster than the window allows; above{" "}
              <strong className="text-zinc-600 dark:text-zinc-300">2.5×</strong> the service is
              flagged at risk.
              {breached > 0
                ? " A breached service holds budget-dependent auto-execution until reliability recovers."
                : " All tracked services currently retain error budget."}
            </p>
          </div>
        </SideModal>
      )}
    </>
  );
}
