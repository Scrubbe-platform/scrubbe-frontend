// components/ICP/RemediationIntel.tsx
"use client";

import React, { useState } from "react";
import { REMEDIATION_TABS } from "../libs/data";
import { Panel, SubH, ChartCard, MiniBar, LinkAction } from "./shared";
import { SuccessDonut } from "./charts";

const TABS = [
  "Overview",
  "By Service",
  "By Environment",
  "By Category",
] as const;

interface Props {
  onChartClick: (key: string) => void;
  onExpand: () => void;
  remediationData?: any;
}

const REMEDIATION_COLORS = ["#02DD82", "#3B82F6", "#A855F7", "#22D3EE", "#F59E0B"];

export default function RemediationIntel({ onChartClick, onExpand, remediationData }: Props) {
  const [tab, setTab] = useState<string>("Overview");

  const liveTabs: Record<string, typeof REMEDIATION_TABS.Overview> | null = remediationData
    ? {
        Overview: {
          successRate: remediationData.successRate ?? remediationData.overallSuccessRate ?? REMEDIATION_TABS.Overview.successRate,
          delta: remediationData.delta ?? remediationData.trend ?? REMEDIATION_TABS.Overview.delta,
          remediations: remediationData.topRemediations?.length
            ? remediationData.topRemediations.map((r: any, i: number) => ({
                name: r.name ?? r.action ?? r.type ?? "Remediation",
                rate: r.successRate ?? r.rate ?? 0,
                attempts: r.attempts ?? r.count ?? 0,
                color: REMEDIATION_COLORS[i % REMEDIATION_COLORS.length],
              }))
            : REMEDIATION_TABS.Overview.remediations,
          risks: remediationData.risks?.length
            ? remediationData.risks.map((r: any) => ({ name: r.name ?? r.risk, rate: r.rate ?? r.riskScore ?? 0 }))
            : REMEDIATION_TABS.Overview.risks,
          note: remediationData.note ?? REMEDIATION_TABS.Overview.note,
        },
      }
    : null;

  const tabs = liveTabs ?? REMEDIATION_TABS;
  const view = tabs[tab] || REMEDIATION_TABS[tab] || REMEDIATION_TABS.Overview;

  return (
    <Panel number="3." title="Remediation Intelligence" onExpand={onExpand}>
      <div className="flex gap-1 border-b border-zinc-100 dark:border-zinc-800 mb-4">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`py-2 px-3 text-xs font-semibold border-b-2 -mb-px transition-colors ${
              tab === t
                ? "border-emerald-500 dark:border-emerald-400 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[0.85fr_1.25fr_1fr] gap-4">
        {/* Success donut — rate changes per tab */}
        <ChartCard
          chartKey="remDonut"
          onClick={onChartClick}
          className="flex flex-col items-center gap-2"
        >
          <SubH>Success Rate</SubH>
          <div className="w-[100px]">
            <SuccessDonut rate={view.successRate} />
          </div>
          <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
            {view.delta}
          </span>
        </ChartCard>

        {/* Remediation table — rows change per tab */}
        <div>
          <SubH>
            {tab === "Overview"
              ? "Top Remediations by Success Rate"
              : `Success Rate ${tab}`}
          </SubH>
          <table className="w-full text-[11.5px]">
            <thead>
              <tr className="text-zinc-400 dark:text-zinc-500 font-semibold text-[10.5px]">
                <th className="text-left pb-2">
                  {tab === "Overview" ? "Remediation" : tab.replace("By ", "")}
                </th>
                <th className="text-right pb-2">Success</th>
                <th className="text-right pb-2">Att.</th>
              </tr>
            </thead>
            <tbody>
              {view.remediations.map((r) => (
                <tr key={r.name} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="py-1.5 font-medium text-zinc-700 dark:text-zinc-300">{r.name}</td>
                  <td className="text-right">
                    <MiniBar pct={r.rate} />
                  </td>
                  <td className="text-right font-mono text-zinc-500 dark:text-zinc-500">
                    {r.attempts}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Risks — change per tab */}
        <div>
          <SubH>
            {tab === "Overview" ? "Remediation Risks" : `Risks ${tab}`}
          </SubH>
          {view.risks.map((r) => (
            <div
              key={r.name}
              className="flex items-center gap-2 py-1.5 border-t border-zinc-100 dark:border-zinc-800 first:border-t-0 text-[11.5px] text-zinc-600 dark:text-zinc-400"
            >
              <span className="flex-1">{r.name}</span>
              <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                {r.rate}%
              </span>
            </div>
          ))}
          <div className="mt-3">
            <LinkAction>View all risk analysis →</LinkAction>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-zinc-400 dark:text-zinc-500 italic mt-3">{view.note}</div>
    </Panel>
  );
}
