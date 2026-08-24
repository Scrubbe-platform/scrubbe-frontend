import React from "react";
import { Playbook } from "../../../types";
import SectionShell from "../SectionShell";

interface AnalyticsCostSectionProps {
  playbook: Playbook;
}

function Metric({ k, v }: { k: string; v: React.ReactNode }): React.JSX.Element {
  return (
    <div className="border border-zinc-200 rounded-lg bg-zinc-50 px-3.5 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="text-xs text-zinc-500 dark:text-zinc-400">{k}</div>
      <div className="font-mono font-semibold text-[22px] tracking-tight mt-1 dark:text-zinc-100">{v}</div>
    </div>
  );
}

export default function AnalyticsCostSection({ playbook: p }: AnalyticsCostSectionProps): React.JSX.Element {
  const manualCost = 340 + p.priority * 60;
  const autoCost = Math.round(manualCost * 0.09);
  const perIncidentSavings = manualCost - autoCost;
  const monthlyExec = Math.round(p.executed / 6) || 0;
  const monthlySavings = perIncidentSavings * monthlyExec;
  const hoursSaved = Math.round(monthlyExec * 0.4);
  const roi = Math.max(1, Math.round(perIncidentSavings / Math.max(1, autoCost)));

  return (
    <>
      <SectionShell id="analytics" eyebrow="Performance" title="Analytics" sub="Measured across all executions of the current major version.">
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))" }}>
          <Metric k="Times executed" v={p.executed.toLocaleString()} />
          <Metric k="Success rate" v={`${p.success}%`} />
          <Metric k="Average MTTR" v={p.mttr} />
          <Metric k="Average approval time" v={p.approvalTime} />
          <Metric k="Rollback rate" v={p.rollbackRate} />
          <Metric k="Failures" v={p.failures} />
        </div>
      </SectionShell>

      <SectionShell
        id="cost"
        eyebrow="Automation value"
        title="Cost & ROI"
        sub="What this playbook is worth compared to a manual, human-run response — measured over the last 30 days."
        illustrative
      >
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))" }}>
          <Metric k="Avg. cost — manual response" v={`$${manualCost}`} />
          <Metric k="Avg. cost — automated response" v={<span className="text-emerald-600 dark:text-emerald-400">${autoCost}</span>} />
          <Metric k="Engineer-hours saved" v={<>{hoursSaved}<span className="text-xs text-zinc-400 dark:text-zinc-500"> hrs/mo</span></>} />
          <Metric k="Monthly savings" v={<span className="text-emerald-600 dark:text-emerald-400">${monthlySavings.toLocaleString()}</span>} />
        </div>
        <div className="flex items-baseline gap-2.5 mt-4">
          <span className="font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-400">{roi}×</span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">return on automation investment</span>
        </div>
      </SectionShell>
    </>
  );
}
