"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronRight, Sparkles, Fingerprint, Copy, Plus, Check, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button1";
import Select from "@/components/ui/select";
import Input from "@/components/ui/input";
import Modal from "@/components/ui/Modal";
import {
  Asset, BENCHMARKS, ENVIRONMENTS, INCIDENTS, LIFECYCLE_STAGES, OWNERS, REGIONS,
  ago, aiSummary, daysUntil, freshSeconds, opsProfile, recommendedActions, todayISO,
} from "./assetInventory.data";
import { Card, ComplianceBadge, EmptyHint, HealthBadge, RiskBadge, SectionAnchor, Switch } from "./AssetInventoryPrimitives";

const NAV_SECTIONS: [string, string][] = [
  ["ops", "Operational summary"],
  ["overview", "Overview"],
  ["manage", "Manage asset"],
  ["expiry", "Expiry & scheduling"],
  ["incidents", "Linked incidents"],
  ["lifecycle", "Lifecycle"],
  ["changes", "Change timeline"],
  ["compliance", "Compliance"],
  ["lineage", "Asset lineage"],
  ["actions", "Actions"],
];

function expiryBadge(a: Asset): { label: string; tone: "green" | "amber" | "red" | "neutral" } {
  if (!a.expiry) return { label: "No expiry set", tone: "neutral" };
  const d = daysUntil(a.expiry.date);
  if (d < 0) return { label: `Expired ${Math.abs(d)}d ago`, tone: "red" };
  if (d <= 14) return { label: `Expires in ${d}d`, tone: "amber" };
  return { label: `Expires in ${d}d`, tone: "green" };
}
const BADGE_CLS: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  red: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  neutral: "bg-zinc-100 text-black/60 dark:bg-zinc-800 dark:text-zinc-400",
};

function Meta({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11.5px] text-black/40 dark:text-zinc-500">{k}</div>
      <div className="mt-0.5 text-[13px] font-semibold text-black dark:text-zinc-200">{v}</div>
    </div>
  );
}
function Metric({ label, value, onClick }: { label: string; value: React.ReactNode; onClick?: () => void }) {
  const Comp: any = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "w-full rounded-md border border-zinc-200 bg-zinc-50 px-3.5 py-3 text-left dark:border-zinc-700 dark:bg-zinc-800/40",
        onClick && "cursor-pointer transition-colors hover:border-IMSDarkGreen/40 hover:bg-IMSDarkGreen/5",
      )}
    >
      <div className="text-[11px] uppercase tracking-wide text-black/40 dark:text-zinc-500">{label}</div>
      <div className="mt-1 truncate font-ibm text-[15px] font-bold text-black dark:text-zinc-100">{value}</div>
    </Comp>
  );
}

export default function AssetDetail({
  asset, onBack, onUpdate, onRunHealthCheck, onRunDriftScan, logAudit,
}: {
  asset: Asset;
  onBack: () => void;
  onUpdate: (updater: (a: Asset) => Asset) => void;
  onRunHealthCheck: (a: Asset) => void;
  onRunDriftScan: (a: Asset) => void;
  logAudit: (change: string, assetName: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(NAV_SECTIONS[0][0]);
  const [incidentPopup, setIncidentPopup] = useState(false);
  const [watcherPopup, setWatcherPopup] = useState<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = NAV_SECTIONS.map(([id]) => root.querySelector<HTMLElement>(`#s-${id}`)).filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((en) => en.isIntersecting);
        if (visible.length) {
          const top = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
          setActive(top.target.id.replace("s-", ""));
        }
      },
      { rootMargin: "-112px 0px -70% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [asset.id]);

  const p = useMemo(() => opsProfile(asset), [asset]);
  const recs = useMemo(() => recommendedActions(asset), [asset]);
  const badge = expiryBadge(asset);

  function runRecommendation(key: string) {
    if (key === "review-violation") {
      document.getElementById("s-compliance")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (key === "rotate-cert") {
      onUpdate((a) => ({
        ...a,
        expiresInDays: a.category === "Certificates" ? 365 : a.expiresInDays,
        certStatus: a.category === "Certificates" ? "Valid" : a.certStatus,
        expiry: { date: todayISO(365), auto: true, retentionDays: a.expiry?.retentionDays ?? null },
        modMins: 0,
      }));
      logAudit("Certificate rotated", asset.name);
      toast.success(`Certificate rotated on ${asset.name} — valid for another 365 days`);
      return;
    }
    if (key === "restart-pod") {
      onUpdate((a) => ({ ...a, restarts: 0, errorRate: "0.1", cpu: Math.min(a.cpu, 62), modMins: 0, health: a.health === "Degraded" ? "Healthy" : a.health }));
      logAudit("Pod restarted", asset.name);
      toast.success(`${asset.name} restarted — readiness probes passing`);
      return;
    }
    if (key === "patch-version") {
      onUpdate((a) => ({ ...a, drift: false, driftType: null, modMins: 0 }));
      logAudit("Reconciled to declared state", asset.name);
      toast.success(`${asset.name} reconciled — drift cleared`);
      return;
    }
    if (key === "rotate-secret") {
      onUpdate((a) => ({ ...a, drift: false, driftType: null, modMins: 0 }));
      logAudit("Secret rotated", asset.name);
      toast.success(`${asset.name} rotated — consumers updated`);
      return;
    }
    if (key === "apply-tags") {
      onUpdate((a) => ({ ...a, tagged: true, modMins: 0 }));
      logAudit("Governance tags applied", asset.name);
      toast.success(`Governance tags applied to ${asset.name}`);
      return;
    }
  }

  return (
    <div ref={rootRef} className="mx-auto max-w-[1600px] p-4 font-ibm sm:p-6">
      <div className="mb-2 flex items-center gap-1.5 text-[12.5px] text-black/40 dark:text-zinc-500">
        <button onClick={onBack} className="hover:text-black dark:hover:text-zinc-200">Asset inventory</button>
        <ChevronRight size={13} />
        <span className="font-semibold text-black dark:text-zinc-200">{asset.name}</span>
      </div>

      <div className="mb-5 rounded-lg bg-white p-6 shadow-sm shadow-light dark:bg-zinc-900/40 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[22px] font-bold leading-tight text-black dark:text-zinc-100">{asset.name}</h1>
              <HealthBadge health={asset.health} />
              <ComplianceBadge compliance={asset.compliance} />
              <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold", BADGE_CLS[badge.tone])}>{badge.label}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-7 gap-y-3">
              <Meta k="Asset ID" v={<span className="font-ibm">{asset.id}</span>} />
              <Meta k="Type" v={asset.type} />
              <Meta k="Service" v={asset.service} />
              <Meta k="Owner" v={asset.owner} />
              <Meta k="Environment" v={`${asset.env} · ${asset.region}`} />
              <Meta k="Lifecycle" v={asset.lifecycle} />
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline-dark" size="sm" onClick={() => onRunHealthCheck(asset)}>Run health check</Button>
            <Button variant="outline-dark" size="sm" onClick={() => onRunDriftScan(asset)}>Run drift scan</Button>
            <Button
              variant="solid"
              size="sm"
              onClick={() => document.getElementById("s-incidents")?.scrollIntoView({ behavior: "smooth" })}
            >
              Attach to incident
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[220px_1fr]">
        <nav className="top-20 hidden max-h-[calc(100vh-100px)] overflow-y-auto rounded-lg bg-white p-2.5 shadow-sm shadow-light dark:bg-zinc-900/40 lg:sticky lg:block">
          {NAV_SECTIONS.map(([id, label]) => (
            <a
              key={id}
              href={`#s-${id}`}
              className={cn(
                "block truncate rounded-md px-2.5 py-1.5 text-[12.5px] font-medium transition-colors",
                active === id
                  ? "bg-IMSDarkGreen/10 text-IMSDarkGreen"
                  : "text-black/55 hover:bg-zinc-50 hover:text-black dark:text-zinc-500 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200",
              )}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex min-w-0 flex-col gap-5">
          {/* ── Operational summary ── */}
          <SectionAnchor id="s-ops">
            <Card>
              <span className="font-ibm text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">Operational summary</span>
              <h2 className="mt-0.5 text-[16.5px] font-bold text-black dark:text-zinc-100">Where this asset stands right now</h2>
              <p className="mt-1 text-[13px] text-black/60 dark:text-zinc-400">The state an operator needs before touching anything.</p>

              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                <Metric label="Status" value={<HealthBadge health={asset.health} />} />
                <Metric label="Watching" value={p.watching} />
                <Metric label="Last incident" value={<span className="font-ibm">{p.lastIncident}</span>} onClick={() => setIncidentPopup(true)} />
                <Metric label="Operational confidence" value={`${p.confidence}%`} />
                <Metric label="Business criticality" value={p.tier} />
              </div>

              <div className="mt-4 flex gap-3 rounded-md border border-zinc-200 border-l-[3px] border-l-IMSDarkGreen bg-zinc-50 p-4 dark:border-zinc-700 dark:border-l-IMSDarkGreen dark:bg-zinc-800/40">
                <Sparkles size={16} className="mt-0.5 shrink-0 text-IMSDarkGreen" />
                <div>
                  <p className="text-[13px] leading-relaxed text-black dark:text-zinc-200">{aiSummary(asset)}</p>
                  <p className="mt-1.5 font-ibm text-[10.5px] uppercase tracking-wide text-black/40 dark:text-zinc-500">
                    Generated from live telemetry · {freshSeconds(asset.id, 3)}s ago
                  </p>
                </div>
              </div>

              <h3 className="mb-1 mt-6 text-[13.5px] font-bold text-black dark:text-zinc-100">Currently watching</h3>
              <p className="mb-3 text-[12px] text-black/50 dark:text-zinc-500">People on the hook and agents subscribed to this asset&apos;s signals.</p>
              <div className="flex flex-wrap gap-2">
                {asset.watchers.map((w, i) => (
                  <button
                    key={i}
                    onClick={() => setWatcherPopup(i)}
                    className={cn(
                      "flex items-center gap-2 rounded-full border py-1 pl-1.5 pr-3 text-[12.5px] font-semibold",
                      w.kind === "agent"
                        ? "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-500/10 dark:text-sky-400"
                        : "border-zinc-200 bg-white text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200",
                    )}
                  >
                    <span className={cn("flex h-5 w-5 items-center justify-center rounded-full", w.kind === "agent" ? "bg-sky-100 dark:bg-sky-500/20" : "bg-zinc-100 dark:bg-zinc-800")}>
                      {w.kind === "agent" ? <Bot size={11} /> : <User size={11} />}
                    </span>
                    {w.name}
                  </button>
                ))}
                <button
                  onClick={() => {
                    if (asset.watchers.some((w) => w.name === "Paschal Ifediora")) { toast.info("You are already watching this asset"); return; }
                    onUpdate((a) => ({ ...a, watchers: [...a.watchers, { name: "Paschal Ifediora", kind: "person", role: "Watching by request" }] }));
                    logAudit("Started watching", asset.name);
                    toast.success(`You are now watching ${asset.name}`);
                  }}
                  className="flex items-center gap-1.5 rounded-full border border-dashed border-zinc-300 px-3 py-1 text-[12.5px] font-semibold text-black/60 hover:border-zinc-400 dark:border-zinc-600 dark:text-zinc-400"
                >
                  <Plus size={12} /> Watch this asset
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-700">
                  <h4 className="text-[13.5px] font-bold text-black dark:text-zinc-100">Historical incidents</h4>
                  <p className="mt-0.5 text-[12px] text-black/50 dark:text-zinc-500">What this asset has done before — and how often it fixed itself.</p>
                  <div className="mt-3 space-y-2.5">
                    <div className="flex items-center justify-between text-[13px]"><span className="text-black/60 dark:text-zinc-400">Incidents on record · last {p.lastIncidentAge}</span><span className="font-ibm font-bold text-black dark:text-zinc-100">{p.incidents}</span></div>
                    <div className="flex items-center justify-between text-[13px]"><span className="text-black/60 dark:text-zinc-400">Most common failure</span><span className="font-ibm font-bold text-black dark:text-zinc-100">{p.commonFailure}</span></div>
                    <div className="flex items-center justify-between text-[13px]"><span className="text-black/60 dark:text-zinc-400">Resolved automatically</span><span className="font-ibm font-bold text-IMSDarkGreen">{p.autoResolved}</span></div>
                    <div className="flex items-center justify-between text-[13px]"><span className="text-black/60 dark:text-zinc-400">Known fixes available</span><span className="font-ibm font-bold text-black dark:text-zinc-100">{p.knownFixes}</span></div>
                  </div>
                </div>
                <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-700">
                  <h4 className="flex items-center gap-2 text-[13.5px] font-bold text-black dark:text-zinc-100"><Fingerprint size={15} /> Fingerprint</h4>
                  <p className="mt-0.5 text-[12px] text-black/50 dark:text-zinc-500">How this asset is identified across restarts and rebuilds.</p>
                  <div className="mt-3 space-y-2.5">
                    <div className="flex items-center justify-between text-[13px]"><span className="text-black/60 dark:text-zinc-400">Identity</span><span className="font-ibm font-bold text-black dark:text-zinc-100">{p.fingerprint}</span></div>
                    <div className="flex items-center justify-between text-[13px]"><span className="text-black/60 dark:text-zinc-400">Match confidence</span><span className="font-ibm font-bold text-black dark:text-zinc-100">{p.fpConfidence}%</span></div>
                    <div className="flex items-center justify-between text-[13px]"><span className="text-black/60 dark:text-zinc-400">Observed</span><span className="font-ibm font-bold text-black dark:text-zinc-100">{p.observed} times</span></div>
                    <div className="flex items-center justify-between text-[13px]"><span className="text-black/60 dark:text-zinc-400">Source</span><span className="font-ibm font-bold text-black dark:text-zinc-100">{p.source}</span></div>
                    <div className="flex items-center justify-between text-[13px]"><span className="text-black/60 dark:text-zinc-400">Dependencies</span><span className="text-black/60 dark:text-zinc-400">{p.upstream} up · {p.downstream} down</span></div>
                    <Button
                      variant="outline-dark"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        navigator.clipboard?.writeText(p.fingerprint).catch(() => {});
                        toast.success(`Fingerprint ${p.fingerprint} copied to clipboard`);
                      }}
                    >
                      <Copy size={13} /> Copy fingerprint
                    </Button>
                  </div>
                </div>
              </div>

              <h3 className="mb-1 mt-6 text-[13.5px] font-bold text-black dark:text-zinc-100">Recommended actions</h3>
              <p className="mb-2.5 text-[12px] text-black/50 dark:text-zinc-500">Derived from this asset&apos;s current state. Running one updates the inventory immediately.</p>
              {recs.length ? (
                <div className="overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700">
                  {recs.map((r) => (
                    <div key={r.key} className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 last:border-b-0 dark:border-zinc-800">
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold text-black dark:text-zinc-200">{r.nm}</div>
                        <div className="text-[12px] text-black/50 dark:text-zinc-500">{r.note}</div>
                      </div>
                      <Button variant="solid" size="sm" onClick={() => runRecommendation(r.key)}>Run</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-md border border-zinc-200 px-4 py-3 dark:border-zinc-700">
                  <Check size={16} className="text-IMSDarkGreen" />
                  <div>
                    <div className="text-[13px] font-semibold text-black dark:text-zinc-200">No action required</div>
                    <div className="text-[12px] text-black/50 dark:text-zinc-500">Healthy, compliant, tagged, and inside its expiry window.</div>
                  </div>
                </div>
              )}
            </Card>
          </SectionAnchor>

          {/* ── Overview ── */}
          <SectionAnchor id="s-overview">
            <Card>
              <span className="font-ibm text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">Identity</span>
              <h2 className="mt-0.5 text-[16.5px] font-bold text-black dark:text-zinc-100">Overview</h2>
              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <Metric label="Status" value={<HealthBadge health={asset.health} />} />
                <Metric label="Risk" value={<RiskBadge risk={asset.risk} />} />
                <Metric label="Compliance" value={<ComplianceBadge compliance={asset.compliance} />} />
                <Metric label="Cloud" value={asset.cloud} />
                <Metric label="Region" value={<span className="font-ibm">{asset.region}</span>} />
                <Metric label="Created" value={`${asset.createdDays} days ago`} />
                <Metric label="Last modified" value={ago(asset.modMins)} />
                <Metric label="Tags" value={asset.tagged ? <span className="text-IMSDarkGreen">Tagged</span> : <span className="text-rose-600">Untagged</span>} />
              </div>
            </Card>
          </SectionAnchor>

          {/* ── Manage asset ── */}
          <ManageAssetSection asset={asset} onUpdate={onUpdate} logAudit={logAudit} />

          {/* ── Expiry & scheduling ── */}
          <ExpirySection asset={asset} onUpdate={onUpdate} logAudit={logAudit} />

          {/* ── Linked incidents ── */}
          <IncidentsSection asset={asset} onUpdate={onUpdate} logAudit={logAudit} />

          {/* ── Lifecycle ── */}
          <SectionAnchor id="s-lifecycle">
            <Card>
              <span className="font-ibm text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">State machine</span>
              <h2 className="mt-0.5 text-[16.5px] font-bold text-black dark:text-zinc-100">Lifecycle</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {LIFECYCLE_STAGES.map((s) => (
                  <span
                    key={s}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[12px] font-semibold",
                      s === asset.lifecycle
                        ? "border-IMSDarkGreen bg-IMSDarkGreen text-white"
                        : "border-zinc-200 bg-white text-black/60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400",
                    )}
                  >
                    {s}
                  </span>
                ))}
              </div>
              <Button
                variant="outline-dark"
                size="sm"
                className="mt-4"
                onClick={() => {
                  const idx = LIFECYCLE_STAGES.indexOf(asset.lifecycle);
                  const next = LIFECYCLE_STAGES[Math.min(LIFECYCLE_STAGES.length - 1, idx + 1)];
                  onUpdate((a) => ({ ...a, lifecycle: next }));
                  logAudit(`Lifecycle advanced to "${next}"`, asset.name);
                  toast.success(`${asset.name} advanced to "${next}"`);
                }}
                disabled={asset.lifecycle === LIFECYCLE_STAGES[LIFECYCLE_STAGES.length - 1]}
              >
                Advance to next stage
              </Button>
            </Card>
          </SectionAnchor>

          {/* ── Change timeline ── */}
          <SectionAnchor id="s-changes">
            <Card>
              <span className="font-ibm text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">From Change Intelligence</span>
              <h2 className="mt-0.5 text-[16.5px] font-bold text-black dark:text-zinc-100">Change timeline</h2>
              <div className="mt-4">
                {(asset.id === "AST-100001"
                  ? [["10:02", "Deployment v1.2.7"], ["10:05", "ConfigMap updated"], ["10:06", "Pod restart spike"], ["10:08", "Error rate increase"], ["10:10", "Auto-scale triggered"]]
                  : [["Yesterday", "Version bump"], ["3 days ago", "Config change applied"], ["1 week ago", "Tag updated"], ["2 weeks ago", "Provisioned"]]
                ).map(([t, d], i, arr) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", i === 0 ? "bg-IMSDarkGreen" : "border-2 border-zinc-300 dark:border-zinc-600")} />
                      {i < arr.length - 1 && <span className="w-px flex-1 bg-zinc-200 dark:bg-zinc-800" />}
                    </div>
                    <div className="pb-4">
                      <div className="flex items-center gap-2.5">
                        <span className="font-ibm text-[13.5px] font-semibold text-black dark:text-zinc-100">{t}</span>
                        <span className="text-[13px] text-black/60 dark:text-zinc-400">{d}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </SectionAnchor>

          {/* ── Compliance ── */}
          <ComplianceSection asset={asset} onUpdate={onUpdate} logAudit={logAudit} />

          {/* ── Asset lineage ── */}
          <SectionAnchor id="s-lineage">
            <Card>
              <span className="font-ibm text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">Full history</span>
              <h2 className="mt-0.5 text-[16.5px] font-bold text-black dark:text-zinc-100">Asset lineage</h2>
              <p className="mt-1 text-[13px] text-black/60 dark:text-zinc-400">Provisioning source, ownership transfers, and lifecycle transitions.</p>
              <div className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
                <div className="py-2.5"><span className="text-[13px] font-semibold text-black dark:text-zinc-200">Provisioned via</span><span className="ml-2 text-[13px] text-black/50 dark:text-zinc-500">{asset.category === "Kubernetes" ? "Helm release" : asset.category === "Database" ? "Terraform module" : "Cloud console / Terraform"}</span></div>
                <div className="py-2.5"><span className="text-[13px] font-semibold text-black dark:text-zinc-200">Ownership transfers</span><span className="ml-2 text-[13px] text-black/50 dark:text-zinc-500">{asset.createdDays > 200 ? "1 transfer on record" : "None on record"}</span></div>
                <div className="py-2.5"><span className="text-[13px] font-semibold text-black dark:text-zinc-200">Lifecycle transitions</span><span className="ml-2 text-[13px] text-black/50 dark:text-zinc-500">Provisioned → Active{asset.lifecycle !== "Active" ? ` → ${asset.lifecycle}` : ""}</span></div>
              </div>
            </Card>
          </SectionAnchor>

          {/* ── Actions ── */}
          <SectionAnchor id="s-actions">
            <Card className="border border-black dark:border-zinc-100">
              <span className="font-ibm text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">Remediation</span>
              <h2 className="mt-0.5 text-[16.5px] font-bold text-black dark:text-zinc-100">Actions</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {(asset.category === "Kubernetes"
                  ? [["Restart pod", "restart"], ["Rollback deployment", "rollback"], ["Drain node", "drain"], ["Scale replica set", "scale"], ["Run diagnostic agent", "diagnostic"]]
                  : [["Run health check", "healthchk"], ["Run drift scan", "driftscan"], ["Run diagnostic agent", "diagnostic"]]
                ).map(([label, key]) => (
                  <Button
                    key={key}
                    variant="outline-dark"
                    size="sm"
                    onClick={() => {
                      if (key === "healthchk") return onRunHealthCheck(asset);
                      if (key === "driftscan") return onRunDriftScan(asset);
                      if (key === "restart") return runRecommendation("restart-pod");
                      if (key === "rollback") {
                        onUpdate((a) => ({ ...a, drift: false, driftType: null, restarts: 0, modMins: 0, health: a.health !== "Healthy" ? "Degraded" : a.health }));
                        logAudit("Rolled back to last verified release", asset.name);
                        toast.success(`${asset.name} rolled back to the last verified release`);
                        return;
                      }
                      if (key === "drain") {
                        onUpdate((a) => ({ ...a, lifecycle: "Deprecated", modMins: 0 }));
                        logAudit("Node drained — workloads rescheduled", asset.name);
                        toast.success(`${asset.name} drained — workloads rescheduled`);
                        return;
                      }
                      if (key === "scale") {
                        onUpdate((a) => {
                          const cpu = Math.max(20, Math.round(a.cpu * 0.6));
                          return { ...a, cpu, mem: Math.max(20, Math.round(a.mem * 0.7)), modMins: 0, health: a.health === "Degraded" && cpu < 70 ? "Healthy" : a.health };
                        });
                        logAudit("ReplicaSet scaled", asset.name);
                        toast.success(`${asset.name} scaled`);
                        return;
                      }
                      if (key === "diagnostic") {
                        toast.info(`Diagnostic agent dispatched to ${asset.name}…`);
                        setTimeout(() => {
                          logAudit("Diagnostic agent report filed", asset.name);
                          toast[asset.health === "Healthy" ? "success" : "warning"](
                            `Diagnostic complete — ${asset.drift ? "drift is the likely cause: " + (asset.driftType || "").toLowerCase() : asset.health === "Healthy" ? "no fault found" : "resource saturation is the likely cause"}`,
                          );
                        }, 1200);
                      }
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </Card>
          </SectionAnchor>
        </div>
      </div>

      <Modal isOpen={incidentPopup} onClose={() => setIncidentPopup(false)}>
        <div className="p-4">
          <h3 className="text-[17px] font-bold text-black dark:text-zinc-100">{p.lastIncident}</h3>
          <p className="mt-1 text-[13px] text-black/60 dark:text-zinc-400">Last incident recorded on {asset.name}</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
              <span className="text-[13px] font-semibold text-black dark:text-zinc-200">Trigger</span>
              <span className="text-[13px] text-black/60 dark:text-zinc-400">{p.commonFailure}</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
              <span className="text-[13px] font-semibold text-black dark:text-zinc-200">Opened</span>
              <span className="text-[13px] text-black/60 dark:text-zinc-400">{p.lastIncidentAge}</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
              <span className="text-[13px] font-semibold text-black dark:text-zinc-200">Resolution</span>
              <span className="text-[13px] text-black/60 dark:text-zinc-400">{p.autoResolved > 0 ? "Closed by an agent without human action" : "Closed manually by the owning team"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-black dark:text-zinc-200">Known fixes replayed</span>
              <span className="text-[13px] text-black/60 dark:text-zinc-400">{p.knownFixes} verified remediation{p.knownFixes === 1 ? "" : "s"} available</span>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2.5">
            <Button
              variant="outline-dark" size="sm"
              onClick={() => {
                setIncidentPopup(false);
                setTimeout(() => document.getElementById("s-incidents")?.scrollIntoView({ behavior: "smooth" }), 30);
              }}
            >
              Link a live incident
            </Button>
            <Button variant="solid" size="sm" onClick={() => setIncidentPopup(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={watcherPopup !== null} onClose={() => setWatcherPopup(null)}>
        {watcherPopup !== null && asset.watchers[watcherPopup] && (
          <div className="p-4">
            <h3 className="text-[17px] font-bold text-black dark:text-zinc-100">{asset.watchers[watcherPopup].name}</h3>
            <p className="mt-1 text-[13px] text-black/60 dark:text-zinc-400">
              {asset.watchers[watcherPopup].kind === "agent" ? "Autonomous agent" : "Person"} watching {asset.name}
            </p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
                <span className="text-[13px] font-semibold text-black dark:text-zinc-200">Responsible for</span>
                <span className="text-[13px] text-black/60 dark:text-zinc-400">{asset.watchers[watcherPopup].role}</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
                <span className="text-[13px] font-semibold text-black dark:text-zinc-200">Notified on</span>
                <span className="text-[13px] text-black/60 dark:text-zinc-400">
                  {asset.watchers[watcherPopup].kind === "agent" ? "Every state change, continuously" : "Health changes, drift, and linked incidents"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-black dark:text-zinc-200">Watching since</span>
                <span className="text-[13px] text-black/60 dark:text-zinc-400">{asset.createdDays > 30 ? "Asset was provisioned" : `${asset.createdDays} days ago`}</span>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2.5">
              <Button
                variant="outline-dark" size="sm"
                className="!border-rose-300 !text-rose-600 hover:!bg-rose-50"
                onClick={() => {
                  const w = asset.watchers[watcherPopup];
                  onUpdate((a) => ({ ...a, watchers: a.watchers.filter((x) => x.name !== w.name) }));
                  logAudit(`${w.name} stopped watching`, asset.name);
                  toast.warning(`${w.name} is no longer watching ${asset.name}`);
                  setWatcherPopup(null);
                }}
              >
                Stop watching
              </Button>
              <Button variant="solid" size="sm" onClick={() => setWatcherPopup(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ───────────────────── Manage asset ───────────────────── */

function ManageAssetSection({ asset, onUpdate, logAudit }: { asset: Asset; onUpdate: (u: (a: Asset) => Asset) => void; logAudit: (c: string, n: string) => void }) {
  const [owner, setOwner] = useState(asset.owner);
  const [env, setEnv] = useState(asset.env);
  const [region, setRegion] = useState(asset.region);
  const [service, setService] = useState(asset.service);
  const [tagged, setTagged] = useState(asset.tagged);

  return (
    <SectionAnchor id="s-manage">
      <Card>
        <span className="font-ibm text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">Ownership &amp; metadata</span>
        <h2 className="mt-0.5 text-[16.5px] font-bold text-black dark:text-zinc-100">Manage asset</h2>
        <p className="mt-1 text-[13px] text-black/60 dark:text-zinc-400">Update ownership, placement, and tagging.</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select label="Owner team" value={owner} onChange={(e: any) => setOwner(e.target.value)} options={[...OWNERS, "Unassigned"].map((o) => ({ value: o, label: o }))} />
          <Select label="Environment" value={env} onChange={(e: any) => setEnv(e.target.value)} options={ENVIRONMENTS.map((o) => ({ value: o, label: o }))} />
          <Select label="Region" value={region} onChange={(e: any) => setRegion(e.target.value)} options={Array.from(new Set([...REGIONS, asset.region])).map((o) => ({ value: o, label: o }))} />
          <Input label="Service" value={service} onChange={(e) => setService(e.target.value)} />
        </div>
        <label className="mt-4 flex w-fit cursor-pointer items-center gap-2.5 text-[13px] font-medium text-black dark:text-zinc-200">
          <Switch checked={tagged} onChange={setTagged} label="Governance tags applied" />
          Governance tags applied
        </label>
        <div className="mt-4 flex gap-2.5">
          <Button
            variant="solid"
            size="sm"
            onClick={() => {
              onUpdate((a) => ({ ...a, owner, env, region, service: service.trim() || a.service, tagged, modMins: 0 }));
              logAudit("Asset metadata updated", asset.name);
              toast.success(`${asset.name} updated — owner ${owner}, ${env}/${region}`);
            }}
          >
            Save changes
          </Button>
          <Button
            variant="outline-dark"
            size="sm"
            onClick={() => { setOwner(asset.owner); setEnv(asset.env); setRegion(asset.region); setService(asset.service); setTagged(asset.tagged); }}
          >
            Reset
          </Button>
        </div>
      </Card>
    </SectionAnchor>
  );
}

/* ───────────────────── Expiry & scheduling ───────────────────── */

function ExpirySection({ asset, onUpdate, logAudit }: { asset: Asset; onUpdate: (u: (a: Asset) => Asset) => void; logAudit: (c: string, n: string) => void }) {
  const [date, setDate] = useState(asset.expiry?.date || "");
  const [auto, setAuto] = useState(asset.expiry?.auto ?? false);
  const [retention, setRetention] = useState<string>(asset.expiry?.retentionDays ? String(asset.expiry.retentionDays) : "");
  const badge = expiryBadge(asset);

  function extend(days: number) {
    const base = asset.expiry?.date || todayISO();
    const d = new Date(base + "T00:00:00");
    d.setDate(d.getDate() + days);
    const next = d.toISOString().slice(0, 10);
    onUpdate((a) => ({ ...a, expiry: { auto: false, retentionDays: null, ...(a.expiry || {}), date: next } }));
    setDate(next);
    toast.success(`Expiry extended ${days} days — now ${next}`);
  }

  return (
    <SectionAnchor id="s-expiry">
      <Card>
        <span className="font-ibm text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">Retirement &amp; retention</span>
        <h2 className="mt-0.5 text-[16.5px] font-bold text-black dark:text-zinc-100">Expiry &amp; scheduling</h2>
        <p className="mt-1 text-[13px] text-black/60 dark:text-zinc-400">Schedule when this asset should be retired and cleaned up.</p>

        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/40">
          <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold", BADGE_CLS[badge.tone])}>{badge.label}</span>
          {asset.expiry?.date && <span className="font-ibm text-[12.5px] text-black/60 dark:text-zinc-400">Scheduled for {asset.expiry.date}</span>}
          {asset.expiry?.auto && <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-400">Auto-expire on</span>}
          {asset.expiry?.retentionDays && <span className="text-[12.5px] text-black/60 dark:text-zinc-400">Retain {asset.expiry.retentionDays}d after expiry</span>}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Expiry date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Select
            label="Retention after expiry"
            value={retention}
            onChange={(e: any) => setRetention(e.target.value)}
            options={[{ value: "", label: "Delete immediately" }, ...[7, 30, 90, 180].map((d) => ({ value: String(d), label: `${d} days` }))]}
          />
        </div>
        <label className="mt-3 flex w-fit cursor-pointer items-center gap-2.5 text-[13px] font-medium text-black dark:text-zinc-200">
          <Switch checked={auto} onChange={setAuto} label="Automatically expire on this date" />
          Automatically expire on this date
        </label>

        <div className="mt-4 flex flex-wrap gap-2.5">
          <Button
            variant="solid" size="sm"
            onClick={() => {
              if (!date) { toast.error("Pick an expiry date first"); return; }
              onUpdate((a) => ({ ...a, expiry: { date, auto, retentionDays: retention ? +retention : null } }));
              logAudit(`Expiry scheduled for ${date}`, asset.name);
              toast.success(`Expiry scheduled for ${asset.name} on ${date}${auto ? " (auto)" : ""}`);
            }}
          >
            Schedule expiry
          </Button>
          <Button variant="outline-dark" size="sm" onClick={() => extend(30)}>Extend 30 days</Button>
          <Button variant="outline-dark" size="sm" onClick={() => extend(90)}>Extend 90 days</Button>
          <Button
            variant="outline-dark" size="sm"
            className="!border-rose-300 !text-rose-600 hover:!bg-rose-50"
            onClick={() => {
              onUpdate((a) => ({ ...a, lifecycle: "Retired", expiry: { auto: false, retentionDays: null, ...(a.expiry || {}), date: todayISO() } }));
              logAudit("Asset expired", asset.name);
              toast.warning(`${asset.name} expired and marked Retired`);
            }}
          >
            Expire now
          </Button>
          {asset.expiry?.date && (
            <Button
              variant="outline-dark" size="sm"
              onClick={() => {
                onUpdate((a) => ({ ...a, expiry: null }));
                setDate(""); setRetention(""); setAuto(false);
                logAudit("Expiry removed", asset.name);
                toast.success(`Expiry removed from ${asset.name}`);
              }}
            >
              Remove expiry
            </Button>
          )}
        </div>
      </Card>
    </SectionAnchor>
  );
}

/* ───────────────────── Linked incidents ───────────────────── */

function IncidentsSection({ asset, onUpdate, logAudit }: { asset: Asset; onUpdate: (u: (a: Asset) => Asset) => void; logAudit: (c: string, n: string) => void }) {
  const [choice, setChoice] = useState("");
  const linked = asset.linkedIncidents.map((id) => INCIDENTS.find((x) => x.id === id)).filter((x): x is NonNullable<typeof x> => !!x);
  const available = INCIDENTS.filter((x) => !asset.linkedIncidents.includes(x.id));

  return (
    <SectionAnchor id="s-incidents">
      <Card>
        <span className="font-ibm text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">Cloud incidents</span>
        <h2 className="mt-0.5 text-[16.5px] font-bold text-black dark:text-zinc-100">Linked incidents</h2>
        <p className="mt-1 text-[13px] text-black/60 dark:text-zinc-400">Connect this asset to active or past cloud incidents.</p>

        <div className="mt-4">
          {linked.length ? (
            <div className="overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700">
              {linked.map((inc) => (
                <div key={inc.id} className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 last:border-b-0 dark:border-zinc-800">
                  <span
                    className={cn(
                      "shrink-0 rounded px-1.5 py-0.5 font-ibm text-[10.5px] font-bold",
                      inc.severity === "SEV-1" ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                        : inc.severity === "SEV-2" ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                        : "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
                    )}
                  >
                    {inc.severity}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-black dark:text-zinc-200">{inc.title}</div>
                    <div className="text-[12px] text-black/50 dark:text-zinc-500"><span className="font-ibm">{inc.id}</span> · {inc.service} · {inc.status}</div>
                  </div>
                  <Button
                    variant="outline-dark" size="sm"
                    className="!border-rose-300 !text-rose-600 hover:!bg-rose-50"
                    onClick={() => onUpdate((a) => ({ ...a, linkedIncidents: a.linkedIncidents.filter((x) => x !== inc.id) }))}
                  >
                    Unlink
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyHint>No incidents linked. Link one below to give responders infrastructure context.</EmptyHint>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto]">
          <Select
            label="Link a cloud incident"
            value={choice}
            onChange={(e: any) => setChoice(e.target.value)}
            options={available.length ? available.map((x) => ({ value: x.id, label: `${x.id} — ${x.title} (${x.severity})` })) : [{ value: "", label: "All incidents already linked" }]}
          />
          <Button
            variant="solid" size="sm"
            disabled={!available.length || !choice}
            onClick={() => {
              onUpdate((a) => (a.linkedIncidents.includes(choice) ? a : { ...a, linkedIncidents: [...a.linkedIncidents, choice] }));
              const inc = INCIDENTS.find((x) => x.id === choice);
              logAudit("Linked to incident " + choice, asset.name);
              toast.success(`${asset.name} linked to ${choice}${inc ? " — " + inc.title : ""}`);
              setChoice("");
            }}
          >
            Link incident
          </Button>
        </div>
        <Button
          variant="outline-dark" size="sm" className="mt-3"
          onClick={() => {
            const id = "INC-" + Math.floor(4030 + Math.random() * 900);
            INCIDENTS.unshift({ id, title: `Investigation on ${asset.name}`, severity: "SEV-3", status: "Open", service: asset.service });
            onUpdate((a) => ({ ...a, linkedIncidents: [...a.linkedIncidents, id] }));
            logAudit("Created & linked incident " + id, asset.name);
            toast.success(`Created ${id} and linked it to ${asset.name}`);
          }}
        >
          Create &amp; link new incident
        </Button>
      </Card>
    </SectionAnchor>
  );
}

/* ───────────────────── Compliance ───────────────────── */

function ComplianceSection({ asset, onUpdate, logAudit }: { asset: Asset; onUpdate: (u: (a: Asset) => Asset) => void; logAudit: (c: string, n: string) => void }) {
  const applicable = BENCHMARKS.filter((b) => asset.benchmarks.includes(b.id));
  return (
    <SectionAnchor id="s-compliance">
      <Card>
        <span className="font-ibm text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">Standards &amp; benchmarks</span>
        <h2 className="mt-0.5 text-[16.5px] font-bold text-black dark:text-zinc-100">Compliance</h2>
        <p className="mt-1 text-[13px] text-black/60 dark:text-zinc-400">Violations are set against a specific benchmark and can be cleared the same way.</p>
        {applicable.length ? (
          <div className="mt-4 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700">
            {applicable.map((b) => {
              const violated = asset.violations.includes(b.id);
              return (
                <div key={b.id} className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 last:border-b-0 dark:border-zinc-800">
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-black dark:text-zinc-200">{b.rule}</div>
                    <div className="text-[12px] text-black/50 dark:text-zinc-500">{b.standard} · <span className="font-ibm">{b.id}</span></div>
                  </div>
                  <ComplianceBadge compliance={violated ? "Violating" : "Compliant"} />
                  <Button
                    variant="outline-dark" size="sm"
                    className={violated ? "" : "!border-rose-300 !text-rose-600 hover:!bg-rose-50"}
                    onClick={() => {
                      onUpdate((a) => {
                        const has = a.violations.includes(b.id);
                        const violations = has ? a.violations.filter((x) => x !== b.id) : [...a.violations, b.id];
                        return { ...a, violations, compliance: violations.length > 0 ? "Violating" : a.benchmarks.length > 0 ? "Compliant" : "Unknown" };
                      });
                      toast[violated ? "success" : "warning"](violated ? `"${b.rule}" marked resolved for ${asset.name}` : `Violation reported: "${b.rule}" on ${asset.name}`);
                    }}
                  >
                    {violated ? "Mark resolved" : "Report violation"}
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyHint>No benchmarks assigned to this asset&apos;s category yet.</EmptyHint>
        )}
      </Card>
    </SectionAnchor>
  );
}
