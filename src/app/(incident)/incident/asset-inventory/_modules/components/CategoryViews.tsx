"use client";

import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button1";
import { Asset, CLOUDS, ago } from "./assetInventory.data";
import { Card, Chip, HealthBadge, PanelHead, RiskBadge, StatTile } from "./AssetInventoryPrimitives";

export function MiniTable({ assets, onOpenDetail, limit = 40 }: { assets: Asset[]; onOpenDetail: (id: string) => void; limit?: number }) {
  const rows = assets.slice(0, limit);
  return (
    <Card className="p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-900/60">
              {["Asset", "Type", "Owner", "Environment", "Health", "Risk", "Modified"].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-[13px] text-black/50 dark:text-zinc-500">No assets in this category yet.</td></tr>
            ) : rows.map((a) => (
              <tr key={a.id} onClick={() => onOpenDetail(a.id)} className="cursor-pointer border-t border-zinc-100 first:border-t-0 hover:bg-zinc-50/70 dark:border-zinc-800 dark:hover:bg-zinc-900/40">
                <td className="px-4 py-3">
                  <div className="text-[13px] font-semibold text-black dark:text-zinc-100">{a.name}</div>
                  <div className="font-ibm text-[10.5px] text-black/40 dark:text-zinc-500">{a.id}</div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-[13px] text-black/70 dark:text-zinc-400">{a.type}</td>
                <td className="whitespace-nowrap px-4 py-3 text-[13px] text-black/70 dark:text-zinc-400">{a.owner}</td>
                <td className="whitespace-nowrap px-4 py-3 text-[13px] text-black/70 dark:text-zinc-400">{a.env}</td>
                <td className="whitespace-nowrap px-4 py-3"><HealthBadge health={a.health} /></td>
                <td className="whitespace-nowrap px-4 py-3"><RiskBadge risk={a.risk} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-[12px] text-black/50 dark:text-zinc-500">{ago(a.modMins)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-zinc-100 px-4 py-2.5 text-[12px] text-black/50 dark:border-zinc-800 dark:text-zinc-500">
        Showing {Math.min(limit, assets.length)} of {assets.length.toLocaleString()} assets
      </div>
    </Card>
  );
}

/* ───────────────────── Cloud Resources ───────────────────── */

export function CloudView({ assets, onOpenDetail, onJumpCategory }: { assets: Asset[]; onOpenDetail: (id: string) => void; onJumpCategory: (cat: string) => void }) {
  const [provider, setProvider] = useState(CLOUDS[0]);
  const items = useMemo(() => assets.filter((a) => a.cloud === provider), [assets, provider]);
  const byCat = useMemo(() => {
    const m: Record<string, number> = {};
    items.forEach((a) => { m[a.category] = (m[a.category] || 0) + 1; });
    return m;
  }, [items]);

  return (
    <>
      <div className="mb-4 flex gap-2">
        {CLOUDS.map((c) => (
          <Chip key={c} active={c === provider} onClick={() => setProvider(c)}>{c}</Chip>
        ))}
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total resources" value={items.length.toLocaleString()} />
        <StatTile label="Drift detected" value={items.filter((a) => a.drift).length} tone="warn" />
        <StatTile label="Public exposure risk" value={items.filter((a) => a.category === "Storage" && a.compliance === "Violating").length} tone="crit" />
        <StatTile label="Regions" value={new Set(items.map((a) => a.region)).size} />
      </div>
      <Card className="mb-4">
        <PanelHead title="Resource categories" />
        <div className="flex flex-wrap gap-2">
          {Object.entries(byCat).map(([c, n]) => (
            <Chip key={c} onClick={() => onJumpCategory(c)}>{c} · {n}</Chip>
          ))}
        </div>
      </Card>
      <MiniTable assets={items} onOpenDetail={onOpenDetail} />
    </>
  );
}

/* ───────────────────── Kubernetes ───────────────────── */

export function KubernetesView({ assets, onOpenDetail }: { assets: Asset[]; onOpenDetail: (id: string) => void }) {
  const k8s = assets.filter((a) => a.category === "Kubernetes");
  const failures: [string, number][] = [
    ["CrashLoopBackOff", k8s.filter((a) => a.health === "Critical").length || 3],
    ["ImagePullBackOff", 2], ["Node pressure", 1], ["Pending scheduling failures", 4],
  ];
  const health: [string, number, string][] = [["Healthy", 14, "#00C896"], ["Degraded", 3, "#B45309"], ["Critical", 1, "#C2273B"]];
  return (
    <>
      <div className="mb-4 grid grid-cols-3 gap-3">
        <StatTile label="Clusters" value="18" />
        <StatTile label="Nodes" value="1,240" />
        <StatTile label="Pods" value={k8s.length.toLocaleString()} />
      </div>
      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <PanelHead title="Cluster health" />
          {health.map(([lbl, n, color]) => (
            <div key={lbl} className="flex items-center gap-3 py-2">
              <span className="flex w-24 items-center gap-2 text-[12.5px] font-semibold text-black dark:text-zinc-200">
                <span className="h-2 w-2 rounded-full" style={{ background: color }} />{lbl}
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <span className="block h-full rounded-full" style={{ width: `${(n / 18) * 100}%`, background: color }} />
              </span>
              <span className="w-6 text-right font-ibm text-[12.5px] font-semibold">{n}</span>
            </div>
          ))}
        </Card>
        <Card>
          <PanelHead title="Failure detection" hint="Live failure signatures across all clusters." />
          {failures.map(([n, c]) => (
            <div key={n} className="flex items-center justify-between border-b border-zinc-100 py-2 last:border-b-0 dark:border-zinc-800">
              <span className="text-[13px] font-medium text-black/70 dark:text-zinc-300">{n}</span>
              <span className="font-ibm text-[13px] font-bold text-amber-600">{c}</span>
            </div>
          ))}
        </Card>
      </div>
      <MiniTable assets={k8s} onOpenDetail={onOpenDetail} />
    </>
  );
}

/* ───────────────────── Databases ───────────────────── */

export function DatabasesView({ assets, onOpenDetail }: { assets: Asset[]; onOpenDetail: (id: string) => void }) {
  const dbs = assets.filter((a) => a.category === "Database");
  const nominal = dbs.every((a) => a.health === "Healthy");
  const insights: [string, "red" | "amber"][] = [
    ["payments-db nearing connection limit", "red"], ["user-db replication delayed 18s", "amber"], ["analytics-db CPU spike correlated with batch job", "amber"],
  ];
  return (
    <>
      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <PanelHead title="Database health signals" />
          {["Replication lag", "Query latency", "Connection saturation", "Lock contention", "Storage exhaustion"].map((h) => (
            <div key={h} className="flex items-center justify-between border-b border-zinc-100 py-2 last:border-b-0 dark:border-zinc-800">
              <span className="text-[13px] font-medium text-black/70 dark:text-zinc-300">{h}</span>
              <span className={cn("font-ibm text-[12px] font-bold", nominal ? "text-emerald-600" : "text-amber-600")}>{nominal ? "Nominal" : "Monitoring"}</span>
            </div>
          ))}
        </Card>
        <Card>
          <PanelHead title="Critical insights" />
          {insights.map(([t, tone]) => (
            <div key={t} className="flex items-center justify-between border-b border-zinc-100 py-2.5 last:border-b-0 dark:border-zinc-800">
              <span className="text-[13px] text-black dark:text-zinc-200">{t}</span>
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", tone === "red" ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400")}>
                {tone === "red" ? "Critical" : "Warning"}
              </span>
            </div>
          ))}
        </Card>
      </div>
      <MiniTable assets={dbs} onOpenDetail={onOpenDetail} />
    </>
  );
}

/* ───────────────────── Security ───────────────────── */

export function SecurityView({ assets, onOpenDetail }: { assets: Asset[]; onOpenDetail: (id: string) => void }) {
  const sec = assets.filter((a) => a.category === "Security");
  const overview: [string, string][] = [["Roles", "IAM Role"], ["Policies", "IAM Policy"], ["Users", "IAM User"], ["Service accounts", "Service Account"]];
  const risk: [string, number][] = [["Over-permissioned roles", 4], ["Public endpoints exposed", 2], ["Secret leakage risk", 3], ["Weak encryption policies", 1]];
  return (
    <>
      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <PanelHead title="IAM overview" />
          {overview.map(([lbl, type]) => {
            const n = sec.filter((a) => a.type === type).length;
            return (
              <div key={lbl} className="flex items-center gap-3 py-2">
                <span className="w-36 shrink-0 text-[12.5px] font-semibold text-black dark:text-zinc-200">{lbl}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <span className="block h-full rounded-full bg-sky-500" style={{ width: `${Math.min(100, 40 + n * 8)}%` }} />
                </span>
                <span className="w-6 text-right font-ibm text-[12.5px] font-semibold">{n}</span>
              </div>
            );
          })}
        </Card>
        <Card>
          <PanelHead title="Security risk panel" />
          {risk.map(([r, n]) => (
            <div key={r} className="flex items-center justify-between border-b border-zinc-100 py-2 last:border-b-0 dark:border-zinc-800">
              <span className="text-[13px] font-medium text-black/70 dark:text-zinc-300">{r}</span>
              <span className="font-ibm text-[13px] font-bold text-amber-600">{n}</span>
            </div>
          ))}
        </Card>
      </div>
      <Card className="mb-4">
        <PanelHead title="Key insights" />
        {[
          ["admin-role overly permissive", "red"], ["3 secrets accessed outside normal pattern", "amber"], ["Expired key still active in prod", "red"],
        ].map(([t, tone]) => (
          <div key={t} className="flex items-center justify-between border-b border-zinc-100 py-2.5 last:border-b-0 dark:border-zinc-800">
            <span className="text-[13px] text-black dark:text-zinc-200">{t}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", tone === "red" ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400")}>
              {tone === "red" ? "Critical" : "Warning"}
            </span>
          </div>
        ))}
      </Card>
      <MiniTable assets={sec} onOpenDetail={onOpenDetail} />
    </>
  );
}

/* ───────────────────── Certificates ───────────────────── */

export function CertificatesView({
  assets, onOpenDetail, onRenew,
}: { assets: Asset[]; onOpenDetail: (id: string) => void; onRenew: (a: Asset) => void }) {
  const certs = [...assets.filter((a) => a.category === "Certificates")].sort((x, y) => (x.expiresInDays ?? 0) - (y.expiresInDays ?? 0));
  return (
    <Card className="p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-900/60">
              {["Domain", "Owner", "Status", "Expires", ""].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {certs.map((c) => (
              <tr key={c.id} onClick={() => onOpenDetail(c.id)} className="cursor-pointer border-t border-zinc-100 first:border-t-0 hover:bg-zinc-50/70 dark:border-zinc-800 dark:hover:bg-zinc-900/40">
                <td className="px-4 py-3 text-[13px] font-semibold text-black dark:text-zinc-100">{c.name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-[13px] text-black/70 dark:text-zinc-400">{c.owner}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    c.certStatus === "Critical" ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                      : c.certStatus === "Warning" ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
                  )}>
                    {c.certStatus}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-ibm text-[13px] text-black/70 dark:text-zinc-400">
                  {(c.expiresInDays ?? 0) <= 0 ? "Expired" : `in ${c.expiresInDays} days`}
                </td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline-dark" size="sm" onClick={() => onRenew(c)}>Renew</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ───────────────────── Secrets ───────────────────── */

export function SecretsView({ assets, onOpenDetail }: { assets: Asset[]; onOpenDetail: (id: string) => void }) {
  const secrets = assets.filter((a) => a.category === "Secrets");
  return (
    <Card className="p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-900/60">
              {["Secret", "Type", "Owner", "Last accessed", "Rotation", "Exposure risk"].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {secrets.map((s) => (
              <tr key={s.id} onClick={() => onOpenDetail(s.id)} className="cursor-pointer border-t border-zinc-100 first:border-t-0 hover:bg-zinc-50/70 dark:border-zinc-800 dark:hover:bg-zinc-900/40">
                <td className="px-4 py-3 text-[13px] font-semibold text-black dark:text-zinc-100">{s.name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-[13px] text-black/70 dark:text-zinc-400">{s.type}</td>
                <td className="whitespace-nowrap px-4 py-3 text-[13px] text-black/70 dark:text-zinc-400">{s.owner}</td>
                <td className="whitespace-nowrap px-4 py-3 text-[12px] text-black/50 dark:text-zinc-500">{ago(s.modMins)}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  {s.drift
                    ? <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">Overdue</span>
                    : <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">Current</span>}
                </td>
                <td className="whitespace-nowrap px-4 py-3"><RiskBadge risk={s.risk} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
