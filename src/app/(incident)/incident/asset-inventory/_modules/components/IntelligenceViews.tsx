"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button1";
import {
  Asset, AuditEntry, Benchmark, DRIFT_TYPES, LIFECYCLE_STAGES, PolicyDef,
  PredictiveAlert, TableScope,
} from "./assetInventory.data";
import { Card, Chip, EmptyHint, PanelHead, StatTile, Switch } from "./AssetInventoryPrimitives";
import { MiniTable } from "./CategoryViews";

/* ───────────────────── Drift Detection ───────────────────── */

export function DriftView({ assets, onOpenDetail, onScopeTo }: { assets: Asset[]; onOpenDetail: (id: string) => void; onScopeTo: (scope: TableScope) => void }) {
  const drifted = assets.filter((a) => a.drift);
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    DRIFT_TYPES.forEach((t) => (m[t] = drifted.filter((a) => a.driftType === t).length));
    return m;
  }, [drifted]);
  return (
    <>
      <Card className="mb-4">
        <PanelHead
          title={
            <span className="flex items-center gap-2">
              Drift findings
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11.5px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                {drifted.length.toLocaleString()} assets drifted
              </span>
            </span>
          }
          hint="Click a finding type to open the assets behind it."
        />
        <div>
          {DRIFT_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => onScopeTo({ driftType: t, label: t })}
              className="flex w-full items-center justify-between border-b border-zinc-100 py-2.5 text-left last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60"
            >
              <span className="text-[13px] font-semibold text-black dark:text-zinc-200">{t}</span>
              <span className="font-ibm text-[13px] font-bold text-amber-600">{counts[t]}</span>
            </button>
          ))}
        </div>
      </Card>
      <MiniTable assets={drifted} onOpenDetail={onOpenDetail} />
    </>
  );
}

/* ───────────────────── Lifecycle Management ───────────────────── */

export function LifecycleView({ assets, onOpenDetail, onScopeTo }: { assets: Asset[]; onOpenDetail: (id: string) => void; onScopeTo: (scope: TableScope) => void }) {
  const orphans = assets.filter((a) => a.lifecycle === "Retired");
  const deprecated = assets.filter((a) => a.lifecycle === "Deprecated");
  const untagged = assets.filter((a) => !a.tagged);

  function chipsFor(list: Asset[]) {
    if (!list.length) return <span className="text-[12.5px] text-black/40 dark:text-zinc-500">None found.</span>;
    return list.slice(0, 10).map((a) => (
      <Chip key={a.id} onClick={() => onOpenDetail(a.id)}>{a.name}</Chip>
    ));
  }

  return (
    <>
      <Card className="mb-4">
        <PanelHead title="Assets by stage" hint="Pick a stage to open exactly the assets sitting in it." />
        <div className="flex flex-wrap gap-2">
          {LIFECYCLE_STAGES.map((s) => {
            const n = assets.filter((a) => a.lifecycle === s).length;
            return (
              <Chip key={s} onClick={() => onScopeTo({ lifecycle: s, label: s })}>
                {s} <b className="ml-1 font-ibm">{n}</b>
              </Chip>
            );
          })}
        </div>
      </Card>

      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card>
          <PanelHead title="Orphaned resources" hint={`${orphans.length} resources with no active owner`} />
          <div className="flex flex-wrap gap-1.5">{chipsFor(orphans)}</div>
        </Card>
        <Card>
          <PanelHead title="Stuck in deprecated" hint={`${deprecated.length} assets stuck in deprecated state`} />
          <div className="flex flex-wrap gap-1.5">{chipsFor(deprecated)}</div>
        </Card>
        <Card>
          <PanelHead title="Never tagged" hint={`${untagged.length} assets never tagged`} />
          <div className="flex flex-wrap gap-1.5">{chipsFor(untagged)}</div>
        </Card>
      </div>

      <MiniTable assets={assets.filter((a) => a.lifecycle !== "Active")} onOpenDetail={onOpenDetail} />
    </>
  );
}

/* ───────────────────── Compliance ───────────────────── */

const STANDARDS = ["SOC2", "ISO27001", "PCI-DSS", "GDPR"];

function Ring({ pct }: { pct: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const color = pct > 90 ? "#00C896" : "#B45309";
  return (
    <svg width={64} height={64} viewBox="0 0 64 64">
      <circle cx={32} cy={32} r={r} fill="none" stroke="#E7EAF0" strokeWidth={6} />
      <circle
        cx={32} cy={32} r={r} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 32 32)"
      />
      <text x={32} y={37} textAnchor="middle" fontFamily="var(--font-mono, monospace)" fontSize={13} fontWeight={700} fill={color}>{pct}%</text>
    </svg>
  );
}

export function ComplianceView({
  assets, benchmarks, onToggleBenchmark, onOpenAddBenchmark, onOpenDetail,
}: {
  assets: Asset[];
  benchmarks: Benchmark[];
  onToggleBenchmark: (id: string) => void;
  onOpenAddBenchmark: () => void;
  onOpenDetail: (id: string) => void;
}) {
  const scores = useMemo(() => {
    const out: Record<string, number> = {};
    STANDARDS.forEach((std) => {
      const relevantIds = benchmarks.filter((b) => b.standard === std).map((b) => b.id);
      const applicable = assets.filter((a) => a.benchmarks.some((id) => relevantIds.includes(id)));
      const violating = applicable.filter((a) => a.violations.some((id) => relevantIds.includes(id)));
      out[std] = applicable.length ? Math.round((1 - violating.length / applicable.length) * 100) : 100;
    });
    return out;
  }, [assets, benchmarks]);

  const activeViolations = useMemo(() => {
    const byBenchmark: Record<string, Asset[]> = {};
    assets.forEach((a) => a.violations.forEach((id) => { (byBenchmark[id] = byBenchmark[id] || []).push(a); }));
    return Object.entries(byBenchmark)
      .map(([id, list]) => ({ bm: benchmarks.find((b) => b.id === id), assets: list }))
      .filter((v): v is { bm: Benchmark; assets: Asset[] } => !!v.bm);
  }, [assets, benchmarks]);

  return (
    <>
      <Card className="mb-4">
        <PanelHead title="Standards coverage" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STANDARDS.map((s) => (
            <div key={s} className="flex flex-col items-center rounded-md border border-zinc-200 p-4 text-center dark:border-zinc-700">
              <Ring pct={scores[s]} />
              <div className="mt-2 text-[13px] font-bold text-black dark:text-zinc-100">{s}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-4">
        <PanelHead
          title="Compliance benchmarks"
          hint="Assigned automatically by asset category at provisioning time, and enforceable retroactively across the inventory."
          action={<Button variant="solid" size="sm" onClick={onOpenAddBenchmark}>+ Add benchmark</Button>}
        />
        <div>
          {benchmarks.map((b) => (
            <div key={b.id} className="flex items-center gap-3 border-b border-zinc-100 py-2.5 last:border-b-0 dark:border-zinc-800">
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-black dark:text-zinc-200">{b.rule}</div>
                <div className="text-[12px] text-black/50 dark:text-zinc-500">{b.standard} · applies to {b.appliesTo} · <span className="font-ibm">{b.id}</span></div>
              </div>
              <span className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                b.severity === "Critical" ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                  : b.severity === "High" ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                  : "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
              )}>
                {b.severity}
              </span>
              <label className="flex shrink-0 items-center gap-2 text-[12px] font-semibold text-black/60 dark:text-zinc-400">
                <Switch checked={b.enabled} onChange={() => onToggleBenchmark(b.id)} />
                {b.enabled ? "Enforced" : "Disabled"}
              </label>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <PanelHead title="Active violations" />
        {activeViolations.length ? (
          <div>
            {activeViolations.map((v) => (
              <div key={v.bm.id} className="flex items-center justify-between border-b border-zinc-100 py-2.5 last:border-b-0 dark:border-zinc-800">
                <div>
                  <div className="text-[13px] font-semibold text-black dark:text-zinc-200">{v.bm.rule}</div>
                  <div className="text-[12px] text-black/50 dark:text-zinc-500">{v.bm.standard} · {v.assets.length} asset{v.assets.length === 1 ? "" : "s"} affected</div>
                </div>
                <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11.5px] font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">{v.assets.length}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyHint>No active violations right now.</EmptyHint>
        )}
      </Card>
    </>
  );
}

/* ───────────────────── Health Monitoring ───────────────────── */

export function HealthView({ assets, onOpenDetail }: { assets: Asset[]; onOpenDetail: (id: string) => void }) {
  const hotspots = assets.filter((a) => a.cpu > 85 || a.mem > 85).slice(0, 6);
  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="CPU saturation clusters" value={assets.filter((a) => a.cpu > 85).length} tone="warn" />
        <StatTile label="Memory pressure hotspots" value={assets.filter((a) => a.mem > 80).length} tone="warn" />
        <StatTile label="Network latency spikes" value={3} />
        <StatTile label="Disk exhaustion trend" value="+4% this week" />
      </div>
      <Card>
        <PanelHead title="Hotspot clusters" hint="Services with the highest concentration of saturated infrastructure." />
        {hotspots.length ? (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {hotspots.map((a) => (
              <button
                key={a.id}
                onClick={() => onOpenDetail(a.id)}
                className="rounded-md bg-rose-50 p-3.5 text-left dark:bg-rose-500/10"
              >
                <div className="text-[13px] font-bold text-black dark:text-zinc-100">{a.name}</div>
                <div className="mt-1 font-ibm text-[11px] font-semibold text-rose-600 dark:text-rose-400">CPU {a.cpu}% · Mem {a.mem}%</div>
              </button>
            ))}
          </div>
        ) : (
          <EmptyHint>No saturated infrastructure right now.</EmptyHint>
        )}
      </Card>
    </>
  );
}

/* ───────────────────── Insights ───────────────────── */

export function InsightsView({
  assets, predictiveAlerts, recommendations, onApplyRecommendation, onOpenDetail,
}: {
  assets: Asset[];
  predictiveAlerts: PredictiveAlert[];
  recommendations: string[];
  onApplyRecommendation: (index: number) => void;
  onOpenDetail: (id: string) => void;
}) {
  return (
    <>
      <Card className="mb-4">
        <PanelHead title="Predictive alerts" />
        {predictiveAlerts.map((p, i) => (
          <button
            key={i}
            onClick={() => { const a = assets.find((x) => x.name === p.jump.name); if (a) onOpenDetail(a.id); }}
            className="flex w-full items-center justify-between border-b border-zinc-100 py-2.5 text-left last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60"
          >
            <span className="text-[13px] text-black dark:text-zinc-200">{p.text}</span>
            <span className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
              p.sev === "Critical" ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                : p.sev === "High" ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                : "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
            )}>
              {p.sev}
            </span>
          </button>
        ))}
      </Card>
      <Card>
        <PanelHead title="Recommendations" />
        {recommendations.length ? (
          <div>
            {recommendations.map((r, i) => (
              <div key={i} className="flex items-center gap-3 border-b border-zinc-100 py-2.5 last:border-b-0 dark:border-zinc-800">
                <span className="min-w-0 flex-1 text-[13px] text-black dark:text-zinc-200">{r}</span>
                <Button variant="outline-dark" size="sm" onClick={() => onApplyRecommendation(i)}>Apply</Button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyHint>Every recommendation has been applied. New ones appear as telemetry changes.</EmptyHint>
        )}
      </Card>
    </>
  );
}

/* ───────────────────── Audit Log ───────────────────── */

export function AuditView({ auditEntries, assets, onOpenDetail }: { auditEntries: AuditEntry[]; assets: Asset[]; onOpenDetail: (id: string) => void }) {
  return (
    <Card className="p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-900/60">
              {["When", "Change", "Who", "Asset"].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {auditEntries.map(([when, change, who, assetName], i) => {
              const target = assets.find((a) => a.name === assetName);
              return (
                <tr
                  key={i}
                  onClick={() => target && onOpenDetail(target.id)}
                  className={cn("border-t border-zinc-100 first:border-t-0 dark:border-zinc-800", target && "cursor-pointer hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40")}
                >
                  <td className="whitespace-nowrap px-4 py-3 font-ibm text-[12px] text-black/60 dark:text-zinc-400">{when}</td>
                  <td className="px-4 py-3 text-[13px] font-semibold text-black dark:text-zinc-200">{change}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-[13px] text-black/70 dark:text-zinc-400">{who}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-[13px] text-black/70 dark:text-zinc-400">{assetName}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ───────────────────── Asset Policies ───────────────────── */

export function PoliciesView({ policies, onTogglePolicy, onOpenAddPolicy }: { policies: PolicyDef[]; onTogglePolicy: (index: number) => void; onOpenAddPolicy: () => void }) {
  return (
    <Card>
      <PanelHead title="Enterprise controls" hint="Governing who can act on what, and under which conditions." action={<Button variant="solid" size="sm" onClick={onOpenAddPolicy}>+ Add policy</Button>} />
      <div>
        {policies.map((p, i) => (
          <div key={p.name} className="flex items-center gap-3 border-b border-zinc-100 py-3 last:border-b-0 dark:border-zinc-800">
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-black dark:text-zinc-200">{p.name}</div>
              <div className="text-[12px] text-black/50 dark:text-zinc-500">{p.scope} — {p.rule}</div>
            </div>
            <label className="flex shrink-0 items-center gap-2 text-[12px] font-semibold text-black/60 dark:text-zinc-400">
              <Switch checked={p.enabled} onChange={() => onTogglePolicy(i)} />
              {p.enabled ? "Enforced" : "Disabled"}
            </label>
          </div>
        ))}
      </div>
    </Card>
  );
}
