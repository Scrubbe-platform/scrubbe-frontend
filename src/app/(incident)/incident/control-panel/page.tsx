// app/intelligence/page.tsx  (or wherever your route lives)
"use client";

import React, { useMemo, useState, useCallback } from "react";
import { ChevronDown, Download } from "lucide-react";
import Header from "@/components/IMS/DashboardHeader";
import Button from "@/components/ui/Button1";
import SideModal from "@/components/ui/SideModal";
import { KPIItem } from "../incident-control-panel/_modules/libs/data";
import { getChartMeta } from "../incident-control-panel/_modules/components/chart-drawer";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { querykeys } from "@/lib/constant";

// Section components
import LearningOverview from "../incident-control-panel/_modules/components/learning-overview";
import IncidentMemory from "../incident-control-panel/_modules/components/incident-memory";
import RemediationIntel from "../incident-control-panel/_modules/components/remediation-intel";
import KnowledgeGraph from "../incident-control-panel/_modules/components/knowledge-graph";
import GovernanceDash from "../incident-control-panel/_modules/components/government-dash";
import EALDistribution from "../incident-control-panel/_modules/components/eal-distribution";
import SLOHealth from "../incident-control-panel/_modules/components/slo-health";
import CostEfficiency from "../incident-control-panel/_modules/components/cost-efficiency";
import LiveFeed from "../incident-control-panel/_modules/components/live-feeds";
import OrchestrationEvolution from "../incident-control-panel/_modules/components/orchestration-evolution";
import AgentIntelligence from "../incident-control-panel/_modules/components/agent-intelligence";
import ExportModal from "../incident-control-panel/_modules/components/export-modal";
import ChartDrawerContent from "../incident-control-panel/_modules/components/chart-drawer";
import { KPIDetailChart } from "../incident-control-panel/_modules/components/charts";
import {
  PANEL_NOTES,
  PanelNote,
} from "../incident-control-panel/_modules/libs/panel-notes";

// ── KPI Ezra analysis — live fetch ──
function KpiEzraAnalysis({ label }: { label: string }) {
  const { get } = useFetch();
  const { data, isLoading } = useQuery({
    queryKey: ["kpi-ezra-analysis", label],
    queryFn: async () => {
      const res = await get(`${endpoint.dashboard.get_analytics}?metric=${encodeURIComponent(label)}`);
      return res.success ? (res.data?.data ?? res.data) : null;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const narrative = data?.narrative ?? data?.analysis ?? data?.summary ?? null;

  if (isLoading) {
    return <p className="text-[13px] text-zinc-400 dark:text-zinc-500 leading-[1.72] animate-pulse">Analysing {label} trend…</p>;
  }
  if (narrative) {
    return <p className="text-[13px] text-zinc-600 dark:text-zinc-300 leading-[1.72]">{narrative}</p>;
  }
  return (
    <p className="text-[13px] text-zinc-600 dark:text-zinc-300 leading-[1.72]">
      Detailed trend for <strong>{label}</strong> over the selected window. Ezra continuously monitors this metric, surfaces anomalies, and tracks contributing factors to drive continuous improvement.
    </p>
  );
}

// ── Panel digest drawer content ──
function PanelExpandContent({ panel, panelKey }: { panel: PanelNote; panelKey: string }) {
  const { get } = useFetch();
  const { data: ezraRes, isLoading: ezraLoading } = useQuery({
    queryKey: ["ezra-panel-analysis", panelKey],
    queryFn: async () => {
      const res = await get(`${endpoint.ezra.analyses}?context=${encodeURIComponent(panelKey)}&type=panel`);
      return res.success ? (res.data?.data ?? res.data) : null;
    },
    retry: false,
    staleTime: 10 * 60 * 1000,
  });

  const liveNote: string | null = ezraRes?.narrative ?? ezraRes?.analysis ?? ezraRes?.summary ?? null;
  const liveStats: typeof panel.stats | null = ezraRes?.stats?.length
    ? ezraRes.stats.map((s: any, i: number) => ({
        label: s.label ?? panel.stats[i]?.label ?? `Stat ${i + 1}`,
        value: s.value ?? "—",
        delta: s.delta ?? s.change ?? "",
        color: s.color ?? panel.stats[i]?.color ?? "#0F172A",
      }))
    : null;
  const displayStats = liveStats ?? panel.stats;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2.5">
        {displayStats.map((s) => (
          <div
            key={s.label}
            className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 rounded-lg p-3"
          >
            <div className="text-[10.5px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
              {s.label}
            </div>
            <div
              className="text-xl font-bold tracking-tight mt-1 font-ibm"
              style={{ color: s.color }}
            >
              {s.value}
            </div>
            {s.delta && (
              <div className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-0.5">{s.delta}</div>
            )}
          </div>
        ))}
      </div>
      <div>
        <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full">
            Ezra Analysis
          </span>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 italic ml-auto">
            {ezraLoading ? "Loading…" : liveNote ? "Live" : "Pre-computed"}
          </span>
        </div>
        {ezraLoading ? (
          <p className="text-[13px] text-zinc-400 dark:text-zinc-500 leading-[1.72] animate-pulse">Fetching Ezra analysis…</p>
        ) : (
          (liveNote ?? panel.note).split("\n\n").map((para, i) => (
            <p
              key={i}
              className="text-[13px] text-zinc-600 dark:text-zinc-300 leading-[1.72] mb-3 last:mb-0"
            >
              {para}
            </p>
          ))
        )}
      </div>
      <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 rounded-lg p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
          Data context
        </div>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-500 leading-relaxed">
          {ezraRes?.dataContext ?? panel.ctx}
        </p>
      </div>
    </div>
  );
}

export default function IntelligenceControlPlanePage() {
  const [exportOpen, setExportOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");
  const [drawerSubTitle, setDrawerSubTitle] = useState("");
  const [drawerContent, setDrawerContent] = useState<React.ReactNode>(null);

  const { get } = useFetch();

  const { data: metricsRes } = useQuery({
    queryKey: [querykeys.METRICS, "icp-dashboard"],
    queryFn: () => get(endpoint.dashboard.get_metrics),
    staleTime: 60_000,
  });

  const { data: analyticsRes } = useQuery({
    queryKey: [querykeys.ANALYTICS, "icp-dashboard"],
    queryFn: () => get(endpoint.dashboard.get_analytics),
    staleTime: 60_000,
  });

  const { data: serviceMapRes } = useQuery({
    queryKey: ["service-map-topology", "icp"],
    queryFn: () => get(endpoint.service_map.topology),
    staleTime: 5 * 60_000,
  });

  const m = metricsRes?.data?.data ?? metricsRes?.data ?? null;
  const a = analyticsRes?.data?.data ?? analyticsRes?.data ?? null;
  const serviceMap = serviceMapRes?.data?.data ?? serviceMapRes?.data ?? null;

  // KPI cards — derived from real metrics when available
  const liveKpis: KPIItem[] | null = useMemo(() => {
    if (!m) return null;
    const humanOverride =
      m.automationRate > 0 ? +(100 - m.automationRate).toFixed(1) : 0;
    return [
      {
        label: "MTTR Improvement",
        value: m.avgMTTR ? `${m.avgMTTR}m` : "—",
        delta: "last 30 days",
        cls: "text-emerald-600 dark:text-emerald-400",
        color: "#02DD82",
        spark: [m.avgMTTR ?? 0],
      },
      {
        label: "Autonomous Success Rate",
        value: `${m.automationRate ?? 0}%`,
        delta: `${m.autoRemediated ?? 0} auto-remediated`,
        cls: "text-emerald-600 dark:text-emerald-400",
        color: "#02DD82",
        spark: [m.automationRate ?? 0],
      },
      {
        label: "Human Override Rate",
        value: `${humanOverride}%`,
        delta: "vs autonomous",
        cls: "text-purple-600 dark:text-purple-400",
        color: "#A855F7",
        spark: [humanOverride],
      },
      {
        label: "Incidents Resolved",
        value: `${m.resolvedIncidents ?? m.metrics?.resolvedThisMonth ?? 0}`,
        delta: "last 30 days",
        cls: "text-emerald-600 dark:text-emerald-400",
        color: "#3B82F6",
        spark: [m.resolvedIncidents ?? 0],
      },
      {
        label: "Open Incidents",
        value: `${m.openIncidents ?? 0}`,
        delta: `${m.criticalIncidents ?? 0} critical`,
        cls: m.criticalIncidents > 0 ? "text-red-500 dark:text-red-400" : "text-zinc-500 dark:text-zinc-500",
        color: "#F59E0B",
        spark: [m.openIncidents ?? 0],
      },
      {
        label: "SLA Compliance",
        value: `${m.slaCompliance ?? 0}%`,
        delta: `${m.policyViolations ?? 0} violations`,
        cls: m.slaCompliance >= 95 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400",
        color: "#22D3EE",
        spark: [m.slaCompliance ?? 0],
      },
    ];
  }, [m]);

  // Categories from recurring issues in analytics
  const CATEGORY_COLORS = [
    "#3B82F6",
    "#F59E0B",
    "#02DD82",
    "#A855F7",
    "#22D3EE",
    "#94A3B8",
  ];
  const liveCategories = useMemo(() => {
    if (!a?.recurringIssues?.length) return null;
    const total = a.recurringIssues.reduce(
      (s: number, r: any) => s + r.count,
      0,
    );
    return a.recurringIssues.slice(0, 6).map((r: any, i: number) => ({
      name: r.category,
      pct: total > 0 ? Math.round((r.count / total) * 100) : 0,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));
  }, [a]);

  // Feed events from recent executions in analytics
  const liveFeedEvents = useMemo(() => {
    if (!a?.recentExecutions?.length) return null;
    return a.recentExecutions.map((e: any) => ({
      type: e.automationLevel === "AUTOMATIC" ? "remediation" : "governance",
      title: e.title ?? `${e.ticketId} — ${e.status}`,
      detail:
        `${e.service ?? ""} · ${e.priority ?? ""} · ${e.assignedTo ?? "Unassigned"}`.replace(
          /^[\s·]+|[\s·]+$/g,
          "",
        ),
      time: e.createdAt
        ? new Date(e.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
    }));
  }, [a]);

  // Active incidents from analytics → IncidentMemory format
  const liveIncidents = useMemo(() => {
    if (!a?.activeIncidents?.length) return null;
    return a.activeIncidents.map((i: any) => ({
      sev:
        i.priority === "CRITICAL"
          ? "P0"
          : i.priority === "HIGH"
            ? "P1"
            : i.priority === "MEDIUM"
              ? "P2"
              : "P3",
      name: i.title ?? "Untitled",
      meta: `${i.service ?? ""} · ${i.environment ?? ""}`.replace(
        /^·\s|[\s·]+$/g,
        "",
      ),
      similar: "",
      id: i.ticketId ?? i.id,
      uuid: i.id,
      svc: i.service ?? "",
      env: i.environment ?? "",
      cat: i.category ?? "",
    }));
  }, [a]);

  // ── Chart click → expand chart + AI note ──
  const openChartDrawer = useCallback((key: string) => {
    const meta = getChartMeta(key);
    if (!meta) return;
    setDrawerTitle(meta.title);
    setDrawerSubTitle(meta.tag);
    setDrawerContent(<ChartDrawerContent chartKey={key} />);
    setDrawerOpen(true);
  }, []);

  // ── KPI click → expand sparkline ──
  const openKpiDrawer = useCallback((kpi: KPIItem) => {
    setDrawerTitle(kpi.label);
    setDrawerSubTitle("Learning Overview KPI · last 30 days");
    setDrawerContent(
      <div className="space-y-5">
        <div className="bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-100 dark:border-zinc-800 p-5">
          <div className="text-center mb-4">
            <div
              className="text-4xl font-bold font-ibm"
              style={{ color: kpi.color }}
            >
              {kpi.value}
            </div>
            <div className={`text-sm font-semibold mt-1 ${kpi.cls}`}>
              {kpi.delta}
            </div>
          </div>
          <KPIDetailChart data={kpi.spark} color={kpi.color} />
        </div>
        <div>
          <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full">
              Ezra Analysis
            </span>
          </div>
          <KpiEzraAnalysis label={kpi.label} />
        </div>
      </div>,
    );
    setDrawerOpen(true);
  }, []);

  // ── Panel expand & explain → full digest ──
  const openPanelDrawer = useCallback((key: string) => {
    const panel = PANEL_NOTES[key];
    if (!panel) return;
    setDrawerTitle(panel.title);
    setDrawerSubTitle(panel.tag);
    setDrawerContent(<PanelExpandContent panel={panel} panelKey={key} />);
    setDrawerOpen(true);
  }, []);

  return (
    <>
      <Header title="Intelligence Control Plane" />
      <main className="p-4 sm:p-6 pb-24 max-w-[2000px] mx-auto space-y-5 font-ibm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-500 max-w-2xl">
            Closed-loop learning. Continuous improvement.
          </p>
          <div className="flex items-center gap-2.5">
            <Button variant="outline-dark" size="sm">
              <ChevronDown size={14} /> Last 30 Days
            </Button>
            <Button
              variant="outline-dark"
              size="sm"
              onClick={() => setExportOpen(true)}
            >
              <Download size={14} /> Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <LearningOverview
            onChartClick={openChartDrawer}
            onKpiClick={openKpiDrawer}
            onExpand={() => openPanelDrawer("learning")}
            kpis={liveKpis ?? undefined}
            categories={liveCategories ?? undefined}
          />
          <IncidentMemory
            onChartClick={openChartDrawer}
            incidents={liveIncidents ?? undefined}
          />
        </div>

        <div className="grid grid-cols-1 gap-5">
          <RemediationIntel
            onChartClick={openChartDrawer}
            onExpand={() => openPanelDrawer("remediation")}
            remediationData={a?.remediationIntelligence}
          />
          <KnowledgeGraph
            onChartClick={openChartDrawer}
            graphData={serviceMap}
          />
          <GovernanceDash
            onChartClick={openChartDrawer}
            onExpand={() => openPanelDrawer("governance")}
            policyViolations={m?.policyViolations}
            totalAutonomousActions={m?.autoRemediated}
          />
        </div>

        <div className="grid grid-cols-1 gap-5">
          <EALDistribution
            onChartClick={openChartDrawer}
            onExpand={() => openPanelDrawer("eal")}
            ealData={a?.ealDistribution}
          />
          <SLOHealth
            onChartClick={openChartDrawer}
            onExpand={() => openPanelDrawer("slo")}
            sloMetrics={a?.sloMetrics}
          />
        </div>

        <div className="grid grid-cols-1 gap-5">
          <CostEfficiency
            onChartClick={openChartDrawer}
            onExpand={() => openPanelDrawer("cost")}
            costMetrics={a?.costMetrics}
          />
          <LiveFeed events={liveFeedEvents ?? undefined} />
        </div>

        <div className="grid grid-cols-1  gap-5">
          <OrchestrationEvolution
            onChartClick={openChartDrawer}
            onExpand={() => openPanelDrawer("orch")}
            teamWorkload={a?.teamWorkload}
            incidentTrends={a?.incidentTrends}
          />
          <AgentIntelligence
            onChartClick={openChartDrawer}
            onExpand={() => openPanelDrawer("agents")}
            agentData={a?.agentPerformance}
          />
        </div>
      </main>

      <ExportModal isOpen={exportOpen} onClose={() => setExportOpen(false)} />

      {drawerOpen && (
        <SideModal
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={drawerTitle}
          subTitle={drawerSubTitle}
        >
          {drawerContent}
        </SideModal>
      )}
    </>
  );
}
