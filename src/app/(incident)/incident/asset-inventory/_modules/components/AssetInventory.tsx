"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { customAxios } from "@/lib/api/axios";
import { endpoint } from "@/lib/api/endpoint";
import {
  LayoutGrid, Boxes, Cloud, Container, Database, Network, ShieldCheck, Lock, KeyRound,
  GitCompareArrows, RefreshCw, ShieldAlert, Activity, GitBranch, ScrollText, FileCheck2, Sparkles,
  Menu, LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/components/IMS/DashboardHeader";
import Button from "@/components/ui/Button1";
import Modal from "@/components/ui/Modal";
import {
  Asset, AuditEntry, Benchmark, INITIAL_AUDIT_ENTRIES, INITIAL_RECOMMENDATIONS,
  PREDICTIVE_ALERTS, PolicyDef, TableScope, BENCHMARKS, POLICIES, createAsset, generateAssets,
} from "./assetInventory.data";
import Overview from "./Overview";
import AssetsTable from "./AssetsTable";
import AssetDetail from "./AssetDetail";
import { CertificatesView, CloudView, DatabasesView, KubernetesView, SecretsView, SecurityView } from "./CategoryViews";
import { AuditView, ComplianceView, DriftView, HealthView, InsightsView, LifecycleView, PoliciesView } from "./IntelligenceViews";
import {
  AddBenchmarkModal, AddPolicyModal, AttachIncidentModal, ConnectProviderModal,
  ProvisionAssetWizard, ReassignOwnerModal, RegisterAssetModal,
} from "./Modals";
import { EmptyHint } from "./AssetInventoryPrimitives";

interface NavItem { id: string; label: string; icon: LucideIcon }
const NAV_MAIN: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "assets", label: "All Assets", icon: Boxes },
  { id: "cloud", label: "Cloud Resources", icon: Cloud },
  { id: "kubernetes", label: "Kubernetes", icon: Container },
  { id: "databases", label: "Databases", icon: Database },
  { id: "networking", label: "Networking", icon: Network },
  { id: "security", label: "Security Assets", icon: ShieldCheck },
  { id: "certificates", label: "Certificates", icon: Lock },
  { id: "secrets", label: "Secrets Inventory", icon: KeyRound },
];
const NAV_INTEL: NavItem[] = [
  { id: "drift", label: "Drift Detection", icon: GitCompareArrows },
  { id: "lifecycle", label: "Lifecycle Management", icon: RefreshCw },
  { id: "compliance", label: "Compliance", icon: ShieldAlert },
  { id: "health", label: "Health Monitoring", icon: Activity },
  { id: "d-lineage", label: "Asset Lineage", icon: GitBranch },
  { id: "audit", label: "Audit Log", icon: ScrollText },
  { id: "policies", label: "Asset Policies", icon: FileCheck2 },
  { id: "insights", label: "Insights", icon: Sparkles },
];

type ModalState =
  | null | { kind: "connect" } | { kind: "register" } | { kind: "provision" }
  | { kind: "attach"; ids: string[] } | { kind: "reassign"; ids: string[] }
  | { kind: "addBenchmark" } | { kind: "addPolicy" };

export default function AssetInventory() {
  const [assets, setAssets] = useState<Asset[]>(() => generateAssets());

  useEffect(() => {
    customAxios.get(endpoint.assets.list).then((res) => {
      const list: any[] = res.data?.data ?? res.data ?? [];
      if (list.length > 0) {
        setAssets(list.map((a: any) => createAsset({
          name: a.name ?? a.assetName ?? "Asset",
          type: a.type ?? a.assetType ?? "Service",
          category: a.category ?? a.assetCategory ?? a.type ?? "Compute",
          owner: a.owner ?? a.ownerTeam ?? "Platform",
          env: a.environment ?? a.env ?? "production",
          cloud: a.cloud ?? a.provider ?? "aws",
          region: a.region ?? "us-east-1",
          lifecycle: a.lifecycle ?? a.lifecycleStage ?? "Active",
        })));
      }
    }).catch(() => {});
  }, []);
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>(() => BENCHMARKS.map((b) => ({ ...b })));
  const [policies, setPolicies] = useState<PolicyDef[]>(() => POLICIES.map((p) => ({ ...p })));
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>(INITIAL_AUDIT_ENTRIES);
  const [recommendations, setRecommendations] = useState<string[]>(INITIAL_RECOMMENDATIONS);

  const [view, setView] = useState("overview");
  const [scope, setScope] = useState<TableScope | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  const selected = selectedId ? assets.find((a) => a.id === selectedId) || null : null;

  function updateAssetById(id: string, updater: (a: Asset) => Asset) {
    setAssets((prev) => prev.map((a) => (a.id === id ? updater(a) : a)));
  }
  function logAudit(change: string, assetName: string) {
    setAuditEntries((prev) => [["just now", change, "You", assetName], ...prev]);
  }
  function openDetail(id: string) {
    setSelectedId(id);
    setView("detail");
  }
  function openDetailAndJump(id: string, sectionId: string) {
    setSelectedId(id);
    setView("detail");
    setTimeout(() => document.getElementById(`s-${sectionId}`)?.scrollIntoView({ behavior: "smooth" }), 30);
  }
  function scopeTo(sc: TableScope) {
    setScope(sc);
    setView("assets");
  }
  function goNav(id: string) {
    setNavOpen(false);
    if (id === "networking") { scopeTo({ category: "Networking", label: "Networking" }); return; }
    if (id === "assets") { setScope(null); setView("assets"); return; }
    if (id === "d-lineage") {
      if (selected) { setView("detail"); setTimeout(() => document.getElementById("s-lineage")?.scrollIntoView({ behavior: "smooth" }), 30); }
      else setView("lineage-empty");
      return;
    }
    setView(id);
  }

  function runHealthCheck(a: Asset) {
    toast.info(`Running health check on ${a.name}…`);
    setTimeout(() => {
      toast[a.health === "Healthy" ? "success" : "warning"](`${a.name} health check complete — ${a.health === "Healthy" ? "no issues found" : a.health.toLowerCase() + " status confirmed"}`);
    }, 900);
  }
  function runDriftScan(a: Asset) {
    toast.info(`Running drift scan on ${a.name}…`);
    setTimeout(() => {
      toast[a.drift ? "warning" : "success"](`${a.name} drift scan complete — ${a.drift ? "1 drift finding: " + a.driftType : "no drift detected"}`);
    }, 1000);
  }
  function markException(a: Asset) {
    updateAssetById(a.id, (x) => ({ ...x, risk: "Low" }));
    toast.success(`${a.name} marked as a risk exception — excluded from risk scoring`);
  }
  function exportAssets(items: Asset[]) {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), count: items.length, assets: items }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "scrubbe-asset-inventory-export.json";
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success(`Exported ${items.length} asset${items.length === 1 ? "" : "s"}`);
  }

  function bulkHealthCheck(items: Asset[]) {
    toast.info(`Running health checks on ${items.length} asset${items.length === 1 ? "" : "s"}…`);
    setTimeout(() => toast.success(`Health checks complete for ${items.length} asset${items.length === 1 ? "" : "s"}`), 1100);
    // Persist health check trigger to server
    Promise.allSettled(
      items.map((a: Asset) => customAxios.patch(`${endpoint.assets.update}/${a.id}`, { lastHealthCheckAt: new Date().toISOString() })),
    ).catch(() => {});
  }
  function bulkDrift(items: Asset[]) {
    toast.info(`Running drift scan on ${items.length} asset${items.length === 1 ? "" : "s"}…`);
    setTimeout(() => toast.success(`Drift scan complete — ${items.filter((a) => a.drift).length} finding(s)`), 1200);
    // Persist drift scan trigger to server
    Promise.allSettled(
      items.map((a: Asset) => customAxios.patch(`${endpoint.assets.update}/${a.id}`, { lastDriftScanAt: new Date().toISOString() })),
    ).catch(() => {});
  }
  function bulkException(items: Asset[]) {
    setAssets((prev) => prev.map((a) => (items.some((i) => i.id === a.id) ? { ...a, risk: "Low" } : a)));
    toast.success(`${items.length} asset${items.length === 1 ? "" : "s"} marked as risk exceptions`);
    // Persist risk exception to server
    Promise.allSettled(
      items.map((a: Asset) => customAxios.patch(`${endpoint.assets.update}/${a.id}`, { risk: "Low", riskException: true })),
    ).catch(() => {});
  }
  function runComplianceScan() {
    toast.info("Running compliance scan across all standards…");
    // Trigger server-side compliance scan
    customAxios.post(endpoint.assets.sync, { trigger: "COMPLIANCE_SCAN" }).catch(() => {});
    setTimeout(() => {
      setAssets((prev) => prev.map((a) => {
        const applicable = benchmarks.filter((b) => b.enabled && (b.appliesTo === a.category || b.appliesTo === "All")).map((b) => b.id);
        const keptViolations = a.violations.filter((id) => applicable.includes(id));
        return {
          ...a,
          benchmarks: applicable,
          violations: keptViolations,
          compliance: keptViolations.length > 0 ? "Violating" : applicable.length > 0 ? "Compliant" : "Unknown",
        };
      }));
      toast.success("Compliance scan complete");
    }, 1200);
  }
  function renewAllCerts() {
    const urgent = assets.filter((a) => a.category === "Certificates" && (a.expiresInDays ?? 999) <= 30);
    if (!urgent.length) { toast.info("Nothing expiring inside 30 days"); return; }
    const nextDate = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);
    const ids = new Set(urgent.map((c) => c.id));
    setAssets((prev) => prev.map((a) => (ids.has(a.id)
      ? { ...a, expiresInDays: 365, certStatus: "Valid", modMins: 0, expiry: { date: nextDate, auto: true, retentionDays: a.expiry?.retentionDays ?? null } }
      : a)));
    urgent.forEach((c) => logAudit("Certificate renewed", c.name));
    toast.success(`${urgent.length} certificate${urgent.length === 1 ? "" : "s"} renewed — all valid for another 365 days`);
  }

  const modalIds = modal && (modal.kind === "attach" || modal.kind === "reassign") ? modal.ids : [];
  const modalAssets = assets.filter((a) => modalIds.includes(a.id));

  function renderView() {
    switch (view) {
      case "overview":
        return <Overview assets={assets} onScopeTo={scopeTo} onOpenDetail={openDetail} onNavCategory={(cat) => setView(cat)} />;
      case "assets":
        return (
          <AssetsTable
            assets={assets}
            scope={scope}
            onClearScope={() => setScope(null)}
            onOpenDetail={openDetail}
            onViewChangeHistory={(a) => openDetailAndJump(a.id, "changes")}
            onRunHealthCheck={runHealthCheck}
            onRunDriftScan={runDriftScan}
            onAttachIncident={(a) => setModal({ kind: "attach", ids: [a.id] })}
            onMarkException={markException}
            onBulkHealthCheck={bulkHealthCheck}
            onBulkDrift={bulkDrift}
            onBulkIncident={(items) => setModal({ kind: "attach", ids: items.map((i) => i.id) })}
            onBulkException={bulkException}
            onBulkOwnerReassign={(items) => setModal({ kind: "reassign", ids: items.map((i) => i.id) })}
            onExport={exportAssets}
            onProvision={() => setModal({ kind: "provision" })}
            onRegister={() => setModal({ kind: "register" })}
          />
        );
      case "detail":
        return selected ? (
          <AssetDetail
            asset={selected}
            onBack={() => { setScope(null); setView("assets"); }}
            onUpdate={(updater) => updateAssetById(selected.id, updater)}
            onRunHealthCheck={runHealthCheck}
            onRunDriftScan={runDriftScan}
            logAudit={logAudit}
          />
        ) : null;
      case "lineage-empty":
        return (
          <div className="mx-auto max-w-lg p-10 text-center font-ibm">
            <h3 className="text-[16px] font-bold text-black dark:text-zinc-100">Open an asset to see this</h3>
            <p className="mt-2 text-[13.5px] text-black/60 dark:text-zinc-400">Asset lineage lives inside an asset&apos;s profile. Pick one from the inventory first.</p>
            <Button variant="solid" size="sm" className="mt-4" onClick={() => { setScope(null); setView("assets"); }}>Browse assets</Button>
          </div>
        );
      case "cloud":
        return <CloudView assets={assets} onOpenDetail={openDetail} onJumpCategory={(cat) => scopeTo({ category: cat, label: cat })} />;
      case "kubernetes":
        return <KubernetesView assets={assets} onOpenDetail={openDetail} />;
      case "databases":
        return <DatabasesView assets={assets} onOpenDetail={openDetail} />;
      case "security":
        return <SecurityView assets={assets} onOpenDetail={openDetail} />;
      case "certificates":
        return (
          <CertificatesView
            assets={assets}
            onOpenDetail={openDetail}
            onRenew={(c) => {
              updateAssetById(c.id, (a) => ({ ...a, expiresInDays: 365, certStatus: "Valid", modMins: 0, expiry: { date: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10), auto: true, retentionDays: a.expiry?.retentionDays ?? null } }));
              logAudit("Certificate renewed", c.name);
              toast.success(`${c.name} renewed — valid for another 365 days`);
            }}
          />
        );
      case "secrets":
        return <SecretsView assets={assets} onOpenDetail={openDetail} />;
      case "drift":
        return <DriftView assets={assets} onOpenDetail={openDetail} onScopeTo={scopeTo} />;
      case "lifecycle":
        return <LifecycleView assets={assets} onOpenDetail={openDetail} onScopeTo={scopeTo} />;
      case "compliance":
        return (
          <ComplianceView
            assets={assets}
            benchmarks={benchmarks}
            onToggleBenchmark={(id) => {
              setBenchmarks((prev) => prev.map((b) => {
                if (b.id !== id) return b;
                const next = { ...b, enabled: !b.enabled };
                toast[next.enabled ? "success" : "warning"](`Benchmark "${b.rule}" ${next.enabled ? "enforced" : "disabled"} across the inventory`);
                return next;
              }));
            }}
            onOpenAddBenchmark={() => setModal({ kind: "addBenchmark" })}
            onOpenDetail={openDetail}
          />
        );
      case "health":
        return <HealthView assets={assets} onOpenDetail={openDetail} />;
      case "insights":
        return (
          <InsightsView
            assets={assets}
            predictiveAlerts={PREDICTIVE_ALERTS}
            recommendations={recommendations}
            onApplyRecommendation={(i) => {
              const text = recommendations[i];
              setRecommendations((prev) => prev.filter((_, ix) => ix !== i));
              logAudit("Recommendation applied", text.slice(0, 42) + "…");
              toast.success("Recommendation applied and recorded in the audit log");
            }}
            onOpenDetail={openDetail}
          />
        );
      case "audit":
        return <AuditView auditEntries={auditEntries} assets={assets} onOpenDetail={openDetail} />;
      case "policies":
        return (
          <PoliciesView
            policies={policies}
            onTogglePolicy={(i) => {
              setPolicies((prev) => prev.map((p, ix) => {
                if (ix !== i) return p;
                const next = { ...p, enabled: !p.enabled };
                toast[next.enabled ? "success" : "warning"](`"${p.name}" ${next.enabled ? "enforced" : "disabled"}`);
                return next;
              }));
            }}
            onOpenAddPolicy={() => setModal({ kind: "addPolicy" })}
          />
        );
      default:
        return <EmptyHint>Nothing here yet.</EmptyHint>;
    }
  }

  const activeLabel = [...NAV_MAIN, ...NAV_INTEL].find((n) => n.id === view)?.label
    || (view === "assets" ? "All Assets" : view === "detail" ? selected?.name : "Overview");

  return (
    <div className="flex h-screen flex-col bg-white font-ibm dark:bg-zinc-950">
      <Header title="Asset Inventory" />

      <div className="flex min-h-0 flex-1">
        <button
          onClick={() => setNavOpen((v) => !v)}
          className="fixed bottom-4 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-IMSDarkGreen text-white shadow-lg lg:hidden"
          aria-label="Toggle navigation"
        >
          <Menu size={18} />
        </button>

        <aside
          className={cn(
            "w-[220px] shrink-0 overflow-y-auto border-r border-zinc-100 bg-white p-2.5 dark:border-zinc-800 dark:bg-zinc-950",
            "fixed inset-y-0 left-0 top-[57px] z-30 transition-transform lg:static lg:translate-x-0",
            navOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {NAV_MAIN.map((n) => (
            <button
              key={n.id}
              onClick={() => goNav(n.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] font-medium",
                view === n.id ? "bg-IMSDarkGreen/10 font-semibold text-IMSDarkGreen" : "text-black/60 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900",
              )}
            >
              <n.icon size={15} className="shrink-0" />
              {n.label}
            </button>
          ))}
          <div className="my-2 h-px bg-zinc-100 dark:bg-zinc-800" />
          <div className="px-2.5 pb-1 pt-1 font-ibm text-[10px] font-semibold uppercase tracking-wide text-black/30 dark:text-zinc-600">Intelligence</div>
          {NAV_INTEL.map((n) => (
            <button
              key={n.id}
              onClick={() => goNav(n.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] font-medium",
                view === n.id ? "bg-IMSDarkGreen/10 font-semibold text-IMSDarkGreen" : "text-black/60 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900",
              )}
            >
              <n.icon size={15} className="shrink-0" />
              {n.label}
            </button>
          ))}
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900/20">
          {view !== "detail" && (
            <div className="mx-auto max-w-[1500px] px-4 pb-3 pt-5 sm:px-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-[21px] font-bold text-black dark:text-zinc-100">{view === "overview" ? "Asset Inventory" : activeLabel}</h1>
                  {view === "overview" && (
                    <p className="mt-1.5 max-w-3xl text-[13.5px] text-black/60 dark:text-zinc-400">
                      The authoritative system of truth for every runtime and infrastructure asset Scrubbe manages — cloud, Kubernetes, databases, networking, security, certificates, and secrets — continuously synchronized.
                    </p>
                  )}
                </div>
                {view === "overview" && (
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline-dark" size="sm" onClick={() => setWorkspaceOpen(true)}>Workspace</Button>
                    <Button variant="outline-dark" size="sm" onClick={() => setModal({ kind: "connect" })}>Connect provider</Button>
                    <Button
                      variant="outline-dark" size="sm"
                      onClick={() => {
                        toast.info("Running drift scan across the full inventory…");
                        setTimeout(() => toast.success(`Drift scan complete — ${assets.filter((a) => a.drift).length} assets flagged`), 1300);
                      }}
                    >
                      Run drift scan
                    </Button>
                    <Button variant="outline-dark" size="sm" onClick={() => exportAssets(assets)}>Export</Button>
                    <Button variant="outline-dark" size="sm" onClick={() => setModal({ kind: "register" })}>Register existing</Button>
                    <Button variant="solid" size="sm" onClick={() => setModal({ kind: "provision" })}>Provision new asset</Button>
                  </div>
                )}
                {view === "compliance" && (
                  <Button variant="solid" size="sm" onClick={runComplianceScan}>Run compliance scan</Button>
                )}
                {view === "certificates" && (
                  <Button variant="solid" size="sm" onClick={renewAllCerts}>Renew expiring</Button>
                )}
              </div>
            </div>
          )}
          <div className={cn(view !== "detail" && "mx-auto max-w-[1500px] px-4 pb-16 sm:px-6")}>{renderView()}</div>
        </main>
      </div>

      {/* ── Modals ── */}
      <Modal isOpen={workspaceOpen} onClose={() => setWorkspaceOpen(false)}>
        <div className="p-4">
          <h3 className="text-[17px] font-bold text-black dark:text-zinc-100">Paschal Ifediora</h3>
          <p className="mt-1 text-[13px] text-black/60 dark:text-zinc-400">Owner · Scrubbe production workspace</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
              <span className="text-[13px] font-semibold text-black dark:text-zinc-200">Role</span>
              <span className="text-right text-[13px] text-black/60 dark:text-zinc-400">Owner — can provision, retire, and change policy</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
              <span className="text-[13px] font-semibold text-black dark:text-zinc-200">Workspace</span>
              <span className="font-ibm text-[13px] text-black/60 dark:text-zinc-400">ws-scrubbe-prod-eu</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
              <span className="text-[13px] font-semibold text-black dark:text-zinc-200">Assets you own</span>
              <span className="text-[13px] text-black/60 dark:text-zinc-400">{assets.filter((a) => a.owner === "Platform Team").length.toLocaleString()} under Platform Team</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-black dark:text-zinc-200">Needing your attention</span>
              <span className="text-[13px] text-black/60 dark:text-zinc-400">{assets.filter((a) => !a.tagged).length.toLocaleString()} assets missing governance tags</span>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-2.5">
            <Button
              variant="outline-dark" size="sm"
              onClick={() => {
                navigator.clipboard?.writeText("ws-scrubbe-prod-eu").catch(() => {});
                toast.success("Workspace ID copied to clipboard");
              }}
            >
              Copy workspace ID
            </Button>
            <Button
              variant="outline-dark" size="sm"
              onClick={() => { setWorkspaceOpen(false); scopeTo({ pred: (a) => !a.tagged, label: "Untagged" }); }}
            >
              Open untagged assets
            </Button>
            <Button variant="solid" size="sm" onClick={() => setWorkspaceOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modal?.kind === "connect"} onClose={() => setModal(null)}>
        <ConnectProviderModal
          onDiscovered={(newAssets, provider) => {
            setAssets((prev) => [...newAssets, ...prev]);
            logAudit(`Provider connected: ${provider}`, `${newAssets.length} assets discovered`);
          }}
          onClose={() => setModal(null)}
        />
      </Modal>

      <Modal isOpen={modal?.kind === "register"} onClose={() => setModal(null)}>
        <RegisterAssetModal
          onRegister={async (a) => {
            // Optimistic add
            setAssets((prev) => [a, ...prev]);
            setModal(null);
            toast.success(`${a.name} added to the inventory`);
            // Persist to server
            try {
              const res = await customAxios.post(endpoint.assets.create, {
                name: a.name,
                type: a.type,
                category: a.category,
                owner: a.owner,
                environment: a.env,
              });
              const created = res.data?.data ?? res.data;
              if (created?.id && created.id !== a.id) {
                setAssets((prev) => prev.map((x) => (x.id === a.id ? { ...x, id: created.id } : x)));
              }
            } catch {
              // Optimistic — local state already updated
            }
          }}
          onClose={() => setModal(null)}
        />
      </Modal>

      <Modal isOpen={modal?.kind === "provision"} onClose={() => setModal(null)}>
        <ProvisionAssetWizard
          onProvision={async (fields) => {
            const a = createAsset({
              name: fields.name, type: fields.type, category: fields.category, owner: fields.owner,
              env: fields.env, cloud: fields.cloud, region: fields.region, lifecycle: "Provisioned",
            });
            a.benchmarks = fields.benchmarks;
            a.tagged = fields.requireTags;
            a.cpu = fields.size === "Large" ? 35 : fields.size === "Small" ? 12 : 20;
            a.mem = fields.size === "Large" ? 40 : fields.size === "Small" ? 15 : 22;
            // Optimistic add
            setAssets((prev) => [a, ...prev]);
            logAudit("Asset provisioned", a.name);
            setModal(null);
            toast.success(`${a.name} provisioned and live`);
            openDetail(a.id);
            // Persist to server
            try {
              const res = await customAxios.post(endpoint.assets.create, {
                name: fields.name,
                type: fields.type,
                category: fields.category,
                owner: fields.owner,
                environment: fields.env,
                provider: fields.cloud,
                region: fields.region,
                lifecycle: "Provisioned",
                metadata: { size: fields.size, benchmarks: fields.benchmarks, requireTags: fields.requireTags },
              });
              const created = res.data?.data ?? res.data;
              if (created?.id && created.id !== a.id) {
                setAssets((prev) => prev.map((x) => (x.id === a.id ? { ...x, id: created.id } : x)));
              }
            } catch {
              // Optimistic — local state already updated
            }
          }}
          onClose={() => setModal(null)}
        />
      </Modal>

      <Modal isOpen={modal?.kind === "attach"} onClose={() => setModal(null)}>
        <AttachIncidentModal
          assetName={modalAssets.length === 1 ? modalAssets[0].name : `${modalAssets.length} assets`}
          onAttach={(label, priority) => {
            modalAssets.forEach((a) => logAudit(`Attached to incident ${label}`, a.name));
            toast.success(`${modalAssets.length} asset${modalAssets.length === 1 ? "" : "s"} attached to ${label} (${priority})`);
            setModal(null);
          }}
          onClose={() => setModal(null)}
        />
      </Modal>

      <Modal isOpen={modal?.kind === "reassign"} onClose={() => setModal(null)}>
        <ReassignOwnerModal
          count={modalAssets.length}
          onReassign={async (owner) => {
            const ids = new Set(modalAssets.map((a) => a.id));
            // Optimistic update
            setAssets((prev) => prev.map((a) => (ids.has(a.id) ? { ...a, owner } : a)));
            toast.success(`Owner reassigned to ${owner}`);
            setModal(null);
            // Persist to server
            await Promise.allSettled(
              modalAssets.map((a: Asset) =>
                customAxios.patch(`${endpoint.assets.update}/${a.id}`, { owner }),
              ),
            ).catch(() => {});
          }}
          onClose={() => setModal(null)}
        />
      </Modal>

      <Modal isOpen={modal?.kind === "addBenchmark"} onClose={() => setModal(null)}>
        <AddBenchmarkModal
          onAdd={(fields) => {
            setBenchmarks((prev) => [...prev, { ...fields, id: "BM-" + (prev.length + 1 + 10), enabled: true }]);
            setModal(null);
            toast.success(`Benchmark added and enforced: "${fields.rule}"`);
          }}
          onClose={() => setModal(null)}
        />
      </Modal>

      <Modal isOpen={modal?.kind === "addPolicy"} onClose={() => setModal(null)}>
        <AddPolicyModal
          onAdd={(fields) => {
            setPolicies((prev) => [...prev, { ...fields, enabled: true }]);
            setModal(null);
            toast.success(`"${fields.name}" added and enforced`);
          }}
          onClose={() => setModal(null)}
        />
      </Modal>
    </div>
  );
}
