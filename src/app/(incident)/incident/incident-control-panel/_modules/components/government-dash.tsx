// components/ICP/GovernanceDash.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { GOV_KPIS, GOV_EVENTS } from "../libs/data";
import { Panel, SubH, ChartCard, LinkAction, govEventDot } from "./shared";
import { SuccessDonut } from "./charts";
import SideModal from "@/components/ui/SideModal";
import { customAxios } from "@/lib/api/axios";
import { endpoint } from "@/lib/api/endpoint";

const POLICY_COMPLIANCE_FALLBACK = [
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
  const [policyCompliance, setPolicyCompliance] = useState(POLICY_COMPLIANCE_FALLBACK);
  const [overallCompliance, setOverallCompliance] = useState(96.2);
  const [govEvents, setGovEvents] = useState(GOV_EVENTS);

  useEffect(() => {
    // Fetch real guardrails for policy compliance
    customAxios.get(endpoint.guardrails.list).then((res) => {
      const list: any[] = res.data?.data ?? res.data ?? [];
      if (list.length > 0) {
        const mapped = list.slice(0, 8).map((g: any) => ({
          name: g.name ?? g.id,
          rate: g.complianceRate ?? 95,
        }));
        setPolicyCompliance(mapped);
        const avg = mapped.reduce((s, g) => s + g.rate, 0) / mapped.length;
        setOverallCompliance(Math.round(avg * 10) / 10);
      }
    }).catch(() => {});

    // Fetch real decisions for governance events
    customAxios.get(endpoint.decisions.list + "?limit=8").then((res) => {
      const list: any[] = res.data?.data ?? res.data ?? [];
      if (list.length > 0) {
        setGovEvents(list.map((d: any) => ({
          type: d.status === "APPROVED" ? "ok" : d.status === "BLOCKED" ? "deny" : "info",
          title: d.title ?? "Governance decision",
          detail: d.description ?? "",
          policy: d.guardrailId ?? "Policy",
          time: d.createdAt ? new Date(d.createdAt).toLocaleTimeString() : "—",
        })));
      }
    }).catch(() => {});
  }, []);

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
              <SuccessDonut rate={overallCompliance} />
            </div>
            <span className="text-[11px] font-mono font-semibold text-emerald-600">
              {overallCompliance}% avg
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
            {govEvents.map((ev, i) => (
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
                <SuccessDonut rate={overallCompliance} big />
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
                {policyCompliance.map((p) => (
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
                {govEvents.map((ev, i) => (
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
