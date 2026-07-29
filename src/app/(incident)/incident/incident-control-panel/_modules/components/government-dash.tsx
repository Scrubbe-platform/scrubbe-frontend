// components/ICP/GovernanceDash.tsx
"use client";

import React, { useMemo, useState } from "react";
import { GOV_KPIS, GOV_EVENTS } from "../libs/data";
import { Panel, SubH, ChartCard, LinkAction, govEventDot } from "./shared";
import { SuccessDonut } from "./charts";
import SideModal from "@/components/ui/SideModal";

const POLICY_COMPLIANCE = [
  { name: "Risk-Guardrail", rate: 98.4 },
  { name: "Auto-Rollback", rate: 97.1 },
  { name: "Confidence", rate: 95.6 },
  { name: "Capacity", rate: 94.2 },
  { name: "Blast-Radius", rate: 96.9 },
];

interface Props {
  onChartClick: (key: string) => void;
  onExpand: () => void;
  policyViolations?: number;
  totalAutonomousActions?: number;
}

export default function GovernanceDash({
  onChartClick,
  onExpand,
  policyViolations,
  totalAutonomousActions,
}: Props) {
  const [showCompliance, setShowCompliance] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const displayKpis = useMemo(() => {
    if (policyViolations === undefined && totalAutonomousActions === undefined)
      return GOV_KPIS;
    return GOV_KPIS.map((k) => {
      if (k.label === "Policy Violations" && policyViolations !== undefined) {
        return { ...k, value: String(policyViolations) };
      }
      if (
        k.label === "Autonomous Actions" &&
        totalAutonomousActions !== undefined
      ) {
        return { ...k, value: String(totalAutonomousActions) };
      }
      return k;
    });
  }, [policyViolations, totalAutonomousActions]);

  return (
    <>
      <Panel number="5." title="Governance Dashboard" onExpand={onExpand}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
          {displayKpis.map((k) => (
            <div
              key={k.label}
              className="bg-zinc-50 border border-zinc-100 rounded-lg p-3"
            >
              <div className="text-[11px] text-zinc-500">{k.label}</div>
              <div className="text-2xl font-bold tracking-tight mt-1 font-ibm">
                {k.value}
              </div>
              <div className={`text-[11px] font-semibold ${k.cls}`}>
                {k.delta}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[0.78fr_1.22fr] gap-4">
          <ChartCard
            chartKey="compliance"
            onClick={onChartClick}
            className="flex flex-col items-center gap-2"
          >
            <SubH>Policy Compliance</SubH>
            <div className="w-[100px]">
              <SuccessDonut rate={96.2} />
            </div>
            <span className="text-[11px] font-mono font-semibold text-emerald-600">
              ↑ 2.4%
            </span>
            <div className="mt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCompliance(true);
                }}
              >
                <LinkAction>View compliance report →</LinkAction>
              </button>
            </div>
          </ChartCard>

          <div>
            <SubH>Recent Governance Events</SubH>
            {GOV_EVENTS.map((ev, i) => (
              <div
                key={i}
                className="flex gap-2.5 py-2 border-t border-zinc-100 first:border-t-0 items-start"
              >
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${
                    ev.type === "deny"
                      ? "bg-red-50 text-red-500"
                      : ev.type === "ok"
                        ? "bg-emerald-50 text-emerald-500"
                        : "bg-blue-50 text-blue-500"
                  }`}
                >
                  {ev.type === "deny" ? "✕" : ev.type === "ok" ? "✓" : "i"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-zinc-800">
                    {ev.title}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    {ev.detail}
                  </div>
                  <span className="text-[10px] font-mono bg-zinc-100 border border-zinc-200 text-zinc-500 px-1.5 py-0.5 rounded mt-1 inline-block">
                    Policy: {ev.policy}
                  </span>
                </div>
                <span className="text-[10.5px] text-zinc-400 shrink-0">
                  {ev.time}
                </span>
              </div>
            ))}
            <div className="mt-2.5">
              <button type="button" onClick={() => setShowAllEvents(true)}>
                <LinkAction>View all governance events →</LinkAction>
              </button>
            </div>
          </div>
        </div>
      </Panel>

      {/* ── Compliance Report Side Modal ── */}
      {showCompliance && (
        <SideModal
          isOpen={showCompliance}
          onClose={() => setShowCompliance(false)}
          title="Compliance Report"
          subTitle="Policy compliance breakdown for the selected window."
        >
          <div className="space-y-5">
            {/* Overall donut */}
            <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-5 flex flex-col items-center">
              <div className="w-[160px]">
                <SuccessDonut rate={96.2} big />
              </div>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full mt-3">
                ↑ 2.4% vs prior period
              </span>
            </div>

            {/* Per-policy breakdown */}
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                By policy
              </h3>
              <div className="space-y-3">
                {POLICY_COMPLIANCE.map((p) => (
                  <div key={p.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-600 font-medium">
                        {p.name}
                      </span>
                      <span className="font-mono font-bold text-zinc-800">
                        {p.rate}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${p.rate}%`,
                          background:
                            "linear-gradient(90deg, #02DD82, #0bbf78)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-zinc-400 mt-4 leading-relaxed">
                5 policy violations recorded this period, down 37.5%. Remaining
                violations are concentrated in the Capacity policy where novel
                scaling patterns occasionally exceed pre-approved thresholds.
              </p>
            </div>
          </div>
        </SideModal>
      )}

      {/* ── All Governance Events Side Modal ── */}
      {showAllEvents && (
        <SideModal
          isOpen={showAllEvents}
          onClose={() => setShowAllEvents(false)}
          title="Governance Events"
          subTitle="Append-only audit trail of autonomous and manual governance decisions."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-200">
                  <th className="text-left pb-2 pr-2">Event</th>
                  <th className="text-left pb-2 pr-2">Detail</th>
                  <th className="text-left pb-2 pr-2">Policy</th>
                  <th className="text-left pb-2">When</th>
                </tr>
              </thead>
              <tbody>
                {GOV_EVENTS.map((ev, i) => (
                  <tr key={i} className="border-t border-zinc-100">
                    <td className="py-2.5 pr-2 font-semibold text-zinc-800">
                      {ev.title}
                    </td>
                    <td className="py-2.5 pr-2 text-zinc-500">{ev.detail}</td>
                    <td className="py-2.5 pr-2">
                      <span className="text-[10px] font-mono bg-zinc-100 border border-zinc-200 text-zinc-500 px-1.5 py-0.5 rounded">
                        {ev.policy}
                      </span>
                    </td>
                    <td className="py-2.5 text-zinc-400">{ev.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[11px] text-zinc-400 mt-4 leading-relaxed">
              Every state transition is written to an immutable audit record
              with its exact policy version.
            </p>
          </div>
        </SideModal>
      )}
    </>
  );
}
