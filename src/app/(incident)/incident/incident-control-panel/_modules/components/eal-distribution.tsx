// components/ICP/EALDistribution.tsx
"use client";

import React, { useState } from "react";
import { EAL_LEVELS } from "../libs/data";
import { Panel, SubH, ChartCard, LinkAction } from "./shared";
import { EALTrendChart, ChartLegend } from "./charts";
import SideModal from "@/components/ui/SideModal";

interface Props {
  onChartClick: (key: string) => void;
  onExpand: () => void;
  ealData?: any[];
}

export default function EALDistribution({ onChartClick, onExpand, ealData }: Props) {
  const [showEALPolicy, setShowEALPolicy] = useState(false);

  const levels = ealData?.length
    ? ealData.map((e: any, i: number) => ({
        num: e.level ?? e.num ?? `EAL-${i + 1}`,
        name: e.name ?? e.label ?? `Level ${i + 1}`,
        count: e.count ?? e.incidentCount ?? 0,
        pct: e.pct ?? e.percentage ?? 0,
        color: e.color ?? EAL_LEVELS[i % EAL_LEVELS.length]?.color ?? "#6B7280",
        active: e.active ?? false,
        desc: e.desc ?? e.description ?? "",
      }))
    : EAL_LEVELS;

  return (
    <>
      <Panel
        number="★"
        title="EAL Distribution & Autonomy Posture"
        onExpand={onExpand}
      >
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-5">
          {levels.map((e: any) => (
            <div
              key={e.num}
              className={`rounded-lg border p-3 cursor-default ${e.active ? "border-emerald-400 bg-emerald-50/50" : "border-zinc-100 bg-zinc-50"}`}
            >
              <div className="text-[9px] font-mono font-bold tracking-wider text-zinc-400 uppercase">
                {e.num}
              </div>
              <div className="text-[11px] font-bold text-zinc-800 mt-0.5 leading-snug">
                {e.name}
              </div>
              <div
                className="text-xl font-bold tracking-tight mt-1"
                style={{ color: e.color }}
              >
                {e.count}
              </div>
              <div className="h-1 rounded-full bg-zinc-200 mt-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${e.pct}%`, background: e.color }}
                />
              </div>
              <div className="text-[10px] text-zinc-400 mt-1.5">{e.desc}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ChartCard chartKey="ealTrend" onClick={onChartClick}>
            <SubH>EAL Transition Trend</SubH>
            <div className="h-[90px]">
              <EALTrendChart />
            </div>
            <ChartLegend
              items={[
                { color: "#02DD82", label: "EAL 3" },
                { color: "#A855F7", label: "EAL 4" },
                { color: "#3B82F6", label: "EAL 2" },
              ]}
            />
          </ChartCard>

          <div>
            <SubH>Autonomy Posture Summary</SubH>
            <div className="text-[12.5px] text-zinc-600 leading-relaxed space-y-2">
              <p>
                <strong className="text-zinc-900">60.9%</strong> of incidents
                are now handled at EAL 3 or above — up from 48% thirty days ago.
              </p>
              <p>
                EAL 4 headcount grew 33% as the learning loop validated new
                playbook classes.
              </p>
              <p className="text-zinc-400">
                Policy guardrails remain active across all EAL levels.
              </p>
            </div>
            <div className="mt-3">
              <button type="button" onClick={() => setShowEALPolicy(true)}>
                <LinkAction>View EAL policy settings →</LinkAction>
              </button>
            </div>
          </div>
        </div>
      </Panel>

      {showEALPolicy && (
        <SideModal
          isOpen={showEALPolicy}
          onClose={() => setShowEALPolicy(false)}
          title="EAL Policy Settings"
          subTitle="Effective Automation Level definitions and current posture."
        >
          <div className="space-y-5">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-200">
                    <th className="text-left pb-2 pr-2">Level</th>
                    <th className="text-left pb-2 pr-2">Name</th>
                    <th className="text-left pb-2 pr-2">Incidents</th>
                    <th className="text-left pb-2 pr-2">Share</th>
                    <th className="text-left pb-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {levels.map((e: any) => (
                    <tr
                      key={e.num}
                      className={`border-t border-zinc-100 ${e.active ? "bg-emerald-50/50" : ""}`}
                    >
                      <td className="py-2.5 pr-2">
                        <span
                          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                          style={{ background: e.color + "18", color: e.color }}
                        >
                          {e.num}
                        </span>
                      </td>
                      <td className="py-2.5 pr-2 font-semibold text-zinc-800">
                        {e.name}
                      </td>
                      <td
                        className="py-2.5 pr-2 font-mono font-bold"
                        style={{ color: e.color }}
                      >
                        {e.count}
                      </td>
                      <td className="py-2.5 pr-2 font-mono text-zinc-500">
                        {e.pct}%
                      </td>
                      <td className="py-2.5 text-zinc-500 text-[11px]">
                        {e.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4">
              <SubH>EAL Transition Trend</SubH>
              <div className="h-[200px]">
                <EALTrendChart big />
              </div>
              <ChartLegend
                items={[
                  { color: "#02DD82", label: "EAL 3" },
                  { color: "#A855F7", label: "EAL 4" },
                  { color: "#3B82F6", label: "EAL 2" },
                ]}
              />
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              EAL is computed once at match time and never recomputed. Policy
              guardrails constrain the maximum EAL any playbook can reach — even
              a fully automated playbook will be capped at the policy ceiling
              for its service and environment.
            </p>
          </div>
        </SideModal>
      )}
    </>
  );
}
