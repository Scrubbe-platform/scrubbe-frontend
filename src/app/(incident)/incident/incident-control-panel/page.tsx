// app/intelligence/page.tsx  (or wherever your route lives)
"use client";

import React, { useState, useCallback } from "react";
import { ChevronDown, Download } from "lucide-react";
import Header from "@/components/IMS/DashboardHeader";
import Button from "@/components/ui/Button1";
import SideModal from "@/components/ui/SideModal";
import { KPIItem } from "./_modules/libs/data";
import { getChartMeta } from "./_modules/components/chart-drawer";

// Section components
import LearningOverview from "./_modules/components/learning-overview";
import IncidentMemory from "./_modules/components/incident-memory";
import RemediationIntel from "./_modules/components/remediation-intel";
import KnowledgeGraph from "./_modules/components/knowledge-graph";
import GovernanceDash from "./_modules/components/government-dash";
import EALDistribution from "./_modules/components/eal-distribution";
import SLOHealth from "./_modules/components/slo-health";
import CostEfficiency from "./_modules/components/cost-efficiency";
import LiveFeed from "./_modules/components/live-feeds";
import OrchestrationEvolution from "./_modules/components/orchestration-evolution";
import AgentIntelligence from "./_modules/components/agent-intelligence";
import ExportModal from "./_modules/components/export-modal";
import ChartDrawerContent from "./_modules/components/chart-drawer";
import { KPIDetailChart } from "./_modules/components/charts";

export default function IntelligenceControlPlanePage() {
  const [exportOpen, setExportOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");
  const [drawerSubTitle, setDrawerSubTitle] = useState("");
  const [drawerContent, setDrawerContent] = useState<React.ReactNode>(null);

  // ── Chart click → open side drawer with big chart + AI note ──
  const openChartDrawer = useCallback((key: string) => {
    const meta = getChartMeta(key);
    if (!meta) return;
    setDrawerTitle(meta.title);
    setDrawerSubTitle(meta.tag);
    setDrawerContent(<ChartDrawerContent chartKey={key} />);
    setDrawerOpen(true);
  }, []);

  // ── KPI click → open side drawer with expanded sparkline ──
  const openKpiDrawer = useCallback((kpi: KPIItem) => {
    setDrawerTitle(kpi.label);
    setDrawerSubTitle("Learning Overview KPI · last 30 days");
    setDrawerContent(
      <div className="space-y-5">
        <div className="bg-zinc-50 rounded-xl border border-zinc-100 p-5">
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
          <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-zinc-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              Ezra Analysis
            </span>
          </div>
          <p className="text-[13px] text-zinc-600 leading-[1.72]">
            Detailed trend for {kpi.label} over the selected window. Full
            analysis will be connected to the backend Ezra reasoning engine.
          </p>
        </div>
      </div>,
    );
    setDrawerOpen(true);
  }, []);

  return (
    <>
      <Header title="Intelligence Control Plane" />
      <main className="p-4 sm:p-6 pb-24 max-w-[2000px] mx-auto space-y-5 font-ibm">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <p className="text-sm text-zinc-500 max-w-2xl">
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

        {/* ═══════ ROW 1: Learning + Incident Memory ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.62fr_1fr] gap-5">
          <LearningOverview
            onChartClick={openChartDrawer}
            onKpiClick={openKpiDrawer}
          />
          <IncidentMemory onChartClick={openChartDrawer} />
        </div>

        {/* ═══════ ROW 2: Remediation + KG + Governance ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <RemediationIntel onChartClick={openChartDrawer} />
          <KnowledgeGraph onChartClick={openChartDrawer} />
          <GovernanceDash onChartClick={openChartDrawer} />
        </div>

        {/* ═══════ ROW 3: EAL + SLO ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <EALDistribution onChartClick={openChartDrawer} />
          <SLOHealth onChartClick={openChartDrawer} />
        </div>

        {/* ═══════ ROW 4: Cost + Live Feed ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <CostEfficiency onChartClick={openChartDrawer} />
          <LiveFeed />
        </div>

        {/* ═══════ ROW 5: Orchestration + Agents ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <OrchestrationEvolution onChartClick={openChartDrawer} />
          <AgentIntelligence onChartClick={openChartDrawer} />
        </div>
      </main>

      {/* Modals */}
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
