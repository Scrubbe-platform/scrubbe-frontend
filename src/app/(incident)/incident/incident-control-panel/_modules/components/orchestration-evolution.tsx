// components/ICP/OrchestrationEvolution.tsx
"use client";

import React, { useState } from "react";
import { IMPROVEMENTS } from "../libs/data";
import { Panel, SubH, ChartCard, LinkAction } from "./shared";
import { OrchTrendChart, ChartLegend } from "./charts";
import SideModal from "@/components/ui/SideModal";

// ── Flow visualization data ──────────────────────────────────────

const FLOW_BEFORE = [
  { color: "#02DD82", label: "Detect" },
  { color: "#3B82F6", label: "Triage" },
  { color: "#F59E0B", label: "Escalate" },
  { color: "#A855F7", label: "Diagnose" },
  { color: "#02DD82", label: "Remediate" },
  { color: "#02DD82", label: "Verify" },
];

const FLOW_AFTER = [
  { color: "#02DD82", label: "Detect" },
  { color: "#EF4444", label: "Auto-triage" },
  { color: "#F59E0B", label: "Diagnose" },
  { color: "#3B82F6", label: "Remediate" },
  { color: "#02DD82", label: "Verify" },
];

function FlowLine({ steps }: { steps: { color: string; label: string }[] }) {
  return (
    <div className="flex items-center gap-1.5 my-2">
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-zinc-300 text-[11px]">→</span>}
          <div
            className="flex items-center justify-center w-7 h-7 rounded-full border-[1.5px] shrink-0"
            style={{
              borderColor: step.color,
              background: step.color + "18",
            }}
            title={step.label}
          >
            <span
              className="w-[9px] h-[9px] rounded-full"
              style={{ background: step.color }}
            />
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────

interface Props {
  onChartClick: (key: string) => void;
  onExpand: () => void;
}

export default function OrchestrationEvolution({
  onChartClick,
  onExpand,
}: Props) {
  const [showAllImprovements, setShowAllImprovements] = useState(false);

  return (
    <>
      <Panel number="6." title="Orchestration Evolution" onExpand={onExpand}>
        <div className="grid grid-cols-1 sm:grid-cols-[1.1fr_1fr_0.92fr] gap-4">
          {/* Chart */}
          <ChartCard chartKey="orchTrend" onClick={onChartClick}>
            <SubH>Workflow Evolution Over Time</SubH>
            <div className="text-[10.5px] text-zinc-400 mb-1">
              Improvement %
            </div>
            <div className="h-[120px]">
              <OrchTrendChart />
            </div>
            <ChartLegend
              items={[
                { color: "#02DD82", label: "MTTR Improvement" },
                { color: "#3B82F6", label: "Efficiency Gain" },
              ]}
            />
          </ChartCard>

          {/* Improvements list */}
          <div>
            <SubH>Top Orchestration Improvements</SubH>
            <div className="flex justify-end text-[10px] text-zinc-400 mb-1">
              Impact
            </div>
            {IMPROVEMENTS.map((imp) => (
              <div
                key={imp.name}
                className="flex items-center gap-2.5 py-2 border-t border-zinc-100 first:border-t-0 text-xs"
              >
                <span className="flex-1 text-zinc-600 min-w-0 truncate">
                  {imp.name}
                </span>
                <span className="font-mono font-semibold text-emerald-600 shrink-0">
                  {imp.impact}
                </span>
              </div>
            ))}
          </div>

          {/* Current vs Optimized Flow */}
          <div>
            <SubH>Current vs Optimized Flow</SubH>

            <div className="text-[10.5px] text-zinc-500 font-medium mb-1">
              Before
            </div>
            <FlowLine steps={FLOW_BEFORE} />

            <div className="text-[10.5px] text-zinc-500 font-medium mb-1 mt-3.5">
              After (Learned)
            </div>
            <FlowLine steps={FLOW_AFTER} />

            <div className="mt-4">
              <div className="text-[11px] text-zinc-500 mb-0.5">
                Expected MTTR Reduction
              </div>
              <div className="text-3xl font-bold tracking-tight text-emerald-600 font-ibm">
                23.6%
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-3">
          <button type="button" onClick={() => setShowAllImprovements(true)}>
            <LinkAction>View all improvements →</LinkAction>
          </button>
        </div>
      </Panel>

      {/* ── All Improvements Side Modal ── */}
      {showAllImprovements && (
        <SideModal
          isOpen={showAllImprovements}
          onClose={() => setShowAllImprovements(false)}
          title="Orchestration Improvements"
          subTitle="Learned workflow optimizations and their rollout status."
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                Expected MTTR reduction 23.6%
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-200">
                    <th className="text-left pb-2 pr-2">Improvement</th>
                    <th className="text-left pb-2 pr-2">Impact</th>
                    <th className="text-left pb-2 pr-2">Services</th>
                    <th className="text-left pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {IMPROVEMENTS.map((imp) => {
                    const statusColor =
                      imp.status === "Rolled out"
                        ? "bg-emerald-50 text-emerald-700"
                        : imp.status === "Testing"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-zinc-100 text-zinc-500";
                    return (
                      <tr key={imp.name} className="border-t border-zinc-100">
                        <td className="py-2.5 pr-2 font-semibold text-zinc-800">
                          {imp.name}
                        </td>
                        <td className="py-2.5 pr-2">
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                            {imp.impact}
                          </span>
                        </td>
                        <td className="py-2.5 pr-2 text-zinc-500">
                          {imp.services}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor}`}
                          >
                            {imp.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </SideModal>
      )}
    </>
  );
}
