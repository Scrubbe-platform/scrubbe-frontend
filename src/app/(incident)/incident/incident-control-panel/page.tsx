"use client";

import React, { useMemo, useState } from "react";
import { Search, ChevronDown, Download } from "lucide-react";
import Header from "@/components/IMS/DashboardHeader";
import Button from "@/components/ui/Button1";
import Modal from "@/components/ui/Modal";
import SideModal from "@/components/ui/SideModal";

// ══════════════════════════════════════════════════════════════════
// DUMMY DATA
// ══════════════════════════════════════════════════════════════════

const KPI_DATA = [
  {
    label: "MTTR Improvement",
    value: "32.8%",
    delta: "vs 30 days ago",
    cls: "text-emerald-600",
    color: "#02DD82",
  },
  {
    label: "Autonomous Success Rate",
    value: "89.3%",
    delta: "↑ 6.7%",
    cls: "text-emerald-600",
    color: "#02DD82",
  },
  {
    label: "Human Override Rate",
    value: "8.7%",
    delta: "↓ 3.1%",
    cls: "text-purple-600",
    color: "#A855F7",
  },
  {
    label: "Incidents Resolved",
    value: "156",
    delta: "↑ 18.4%",
    cls: "text-emerald-600",
    color: "#3B82F6",
  },
  {
    label: "Knowledge Artifacts",
    value: "1,248",
    delta: "↑ 24.6%",
    cls: "text-emerald-600",
    color: "#3B82F6",
  },
  {
    label: "Confidence Calibration",
    value: "0.92",
    delta: "↑ 0.05",
    cls: "text-amber-600",
    color: "#F59E0B",
  },
];

const CATEGORIES = [
  { name: "Performance Degradation", pct: 28, color: "#3B82F6" },
  { name: "Deployment / Release", pct: 22, color: "#F59E0B" },
  { name: "Infrastructure", pct: 18, color: "#02DD82" },
  { name: "Configuration", pct: 15, color: "#A855F7" },
  { name: "Dependency / Third Party", pct: 10, color: "#22D3EE" },
  { name: "Other", pct: 7, color: "#94A3B8" },
];

const REMEDIATIONS = [
  { name: "Restart Service", rate: 92, attempts: 128 },
  { name: "Rollback Deployment", rate: 91, attempts: 103 },
  { name: "Scale Up", rate: 87, attempts: 98 },
  { name: "Cache Clear", rate: 82, attempts: 74 },
  { name: "DB Connection Reset", rate: 78, attempts: 62 },
];

const RISKS = [
  { name: "DB Failover", rate: 24 },
  { name: "Schema Change", rate: 18 },
  { name: "Full Cache Flush", rate: 16 },
  { name: "Service Restart All", rate: 12 },
];

const INCIDENTS = [
  {
    sev: "P0",
    name: "Checkout Service - Payment Failures",
    meta: "May 27, 10:14 AM · 47m · 4 services",
    similar: "12 incidents",
    id: "SI-004821",
  },
  {
    sev: "P1",
    name: "Kafka Consumer Lag",
    meta: "May 27, 09:08 AM · 32m · 2 services",
    similar: "8 incidents",
    id: "SI-004817",
  },
  {
    sev: "P1",
    name: "User Authentication Degradation",
    meta: "May 26, 11:42 PM · 18m · 3 services",
    similar: "6 incidents",
    id: "SI-004809",
  },
  {
    sev: "P2",
    name: "Slow API Responses",
    meta: "May 26, 09:31 PM · 26m · 5 services",
    similar: "15 incidents",
    id: "SI-004802",
  },
  {
    sev: "P3",
    name: "Error Rate Increase - Reporting",
    meta: "May 26, 07:12 PM · 14m · 1 service",
    similar: "7 incidents",
    id: "SI-004798",
  },
];

const GOV_KPIS = [
  {
    label: "Autonomous Actions",
    value: "312",
    delta: "↑ 23.1%",
    cls: "text-emerald-600",
  },
  {
    label: "Actions Approved",
    value: "284",
    delta: "91.0%",
    cls: "text-emerald-600",
  },
  {
    label: "Actions Denied",
    value: "28",
    delta: "9.0%",
    cls: "text-amber-600",
  },
  {
    label: "Policy Violations",
    value: "5",
    delta: "↓ 37.5%",
    cls: "text-emerald-600",
  },
];

const GOV_EVENTS = [
  {
    title: "High risk action denied",
    detail: "DB Schema Change on prod-db",
    policy: "Risk-Guardrail",
    time: "10m ago",
    type: "deny",
  },
  {
    title: "Autonomous rollback approved",
    detail: "checkout-service deployment",
    policy: "Auto-Rollback",
    time: "15m ago",
    type: "ok",
  },
  {
    title: "Policy updated",
    detail: "Increased confidence threshold for prod",
    policy: "Confidence",
    time: "1h ago",
    type: "info",
  },
  {
    title: "Manual approval logged",
    detail: "Scale-up on api-gateway approved by on-call",
    policy: "Capacity",
    time: "2h ago",
    type: "ok",
  },
  {
    title: "Guardrail evaluated",
    detail: "Blast radius check passed for redis-cache",
    policy: "Blast-Radius",
    time: "3h ago",
    type: "info",
  },
];

const EAL_LEVELS = [
  {
    num: "EAL 0",
    name: "Full Manual",
    count: 2,
    pct: 1.3,
    color: "#94A3B8",
    desc: "Human executes every step",
  },
  {
    num: "EAL 1",
    name: "Assisted",
    count: 18,
    pct: 11.5,
    color: "#F59E0B",
    desc: "AI proposes, human approves each action",
  },
  {
    num: "EAL 2",
    name: "Supervised",
    count: 41,
    pct: 26.3,
    color: "#3B82F6",
    desc: "Batch approval with override window",
  },
  {
    num: "EAL 3",
    name: "Conditional Auto",
    count: 67,
    pct: 42.9,
    color: "#02DD82",
    desc: "Auto-executes within policy guardrails",
    active: true,
  },
  {
    num: "EAL 4",
    name: "Full Auto",
    count: 28,
    pct: 18.0,
    color: "#A855F7",
    desc: "Autonomous end-to-end with audit",
  },
];

const SLO_DATA = [
  {
    svc: "Checkout Service",
    target: "99.9%",
    actual: 99.94,
    budget: 2.6,
    burn: 0.42,
    status: "healthy",
  },
  {
    svc: "Payment API",
    target: "99.95%",
    actual: 99.91,
    budget: 1.1,
    burn: 3.1,
    status: "warn",
  },
  {
    svc: "User Auth",
    target: "99.9%",
    actual: 99.97,
    budget: 3.8,
    burn: 0.19,
    status: "healthy",
  },
  {
    svc: "Redis Cache",
    target: "99.5%",
    actual: 99.61,
    budget: 3.2,
    burn: 0.67,
    status: "healthy",
  },
  {
    svc: "Search Service",
    target: "99.0%",
    actual: 98.87,
    budget: -0.8,
    burn: 4.2,
    status: "breach",
  },
  {
    svc: "Notifications",
    target: "99.5%",
    actual: 99.72,
    budget: 5.1,
    burn: 0.23,
    status: "healthy",
  },
];

const COST_KPIS = [
  {
    label: "Engineer Hours Saved",
    value: "1,840h",
    delta: "↑ 22.3% vs last period",
    cls: "text-emerald-600",
  },
  {
    label: "Autonomous Cost Avoidance",
    value: "$218K",
    delta: "↑ 31.4% vs last period",
    cls: "text-emerald-600",
  },
  {
    label: "Avg Resolution Cost",
    value: "$94",
    delta: "↓ $41 vs manual baseline",
    cls: "text-emerald-600",
  },
  {
    label: "ROI on Automation",
    value: "6.2×",
    delta: "↑ 0.9× vs last period",
    cls: "text-emerald-600",
  },
];

const COST_BARS = [
  { label: "Performance Degradation", value: 520, color: "#02DD82" },
  { label: "Deployment / Release", value: 410, color: "#3B82F6" },
  { label: "Infrastructure", value: 320, color: "#A855F7" },
  { label: "Configuration", value: 280, color: "#F59E0B" },
  { label: "Dependency", value: 190, color: "#22D3EE" },
];

const FEED_EVENTS = [
  {
    type: "remediation",
    title: "Autonomous restart completed",
    detail: "checkout-service · EAL 3 · confidence 0.94",
    time: "2m ago",
  },
  {
    type: "governance",
    title: "Guardrail blocked execution",
    detail: "DB schema change denied by Risk-Guardrail",
    time: "8m ago",
  },
  {
    type: "agent",
    title: "Agent retrained",
    detail: "Log Analysis Agent accuracy +1.4% after 312 new patterns",
    time: "15m ago",
  },
  {
    type: "remediation",
    title: "Scale-up approved",
    detail: "api-gateway · EAL 2 · approved by on-call",
    time: "22m ago",
  },
  {
    type: "governance",
    title: "Policy updated",
    detail: "Confidence threshold raised to 0.90 for production",
    time: "1h ago",
  },
  {
    type: "agent",
    title: "Knowledge artifact created",
    detail: "New pattern: Redis eviction storm → cache warm strategy",
    time: "1.5h ago",
  },
];

const IMPROVEMENTS = [
  {
    name: "Changed agent order for infra issues",
    impact: "+18.2%",
    status: "Rolled out",
  },
  {
    name: "Parallelized log + metric analysis",
    impact: "+14.7%",
    status: "Rolled out",
  },
  {
    name: "Added pre-check for known issues",
    impact: "+11.3%",
    status: "Testing",
  },
  {
    name: "Optimized escalation timing",
    impact: "+9.8%",
    status: "Rolled out",
  },
  {
    name: "Reduced unnecessary tool calls",
    impact: "+7.6%",
    status: "Proposed",
  },
];

const AGENTS = [
  { name: "Incident Triage Agent", accuracy: 94, tasks: 312, color: "#02DD82" },
  { name: "Root Cause Agent", accuracy: 92, tasks: 278, color: "#3B82F6" },
  { name: "Log Analysis Agent", accuracy: 89, tasks: 245, color: "#A855F7" },
  { name: "Infra Agent", accuracy: 91, tasks: 301, color: "#F59E0B" },
  { name: "Code Analysis Agent", accuracy: 87, tasks: 189, color: "#22D3EE" },
  { name: "Remediation Agent", accuracy: 93, tasks: 256, color: "#EF4444" },
];

// ══════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════

const sevColors: Record<string, string> = {
  P0: "text-red-600 bg-red-50 border-red-200",
  P1: "text-amber-700 bg-amber-50 border-amber-200",
  P2: "text-yellow-700 bg-yellow-50 border-yellow-200",
  P3: "text-blue-700 bg-blue-50 border-blue-200",
};

const sloStatusStyles: Record<string, { pill: string; color: string }> = {
  healthy: { pill: "bg-emerald-50 text-emerald-700", color: "#02DD82" },
  warn: { pill: "bg-amber-50 text-amber-700", color: "#F59E0B" },
  breach: { pill: "bg-red-50 text-red-700", color: "#EF4444" },
};

const govEventDot: Record<string, string> = {
  deny: "bg-red-400",
  ok: "bg-emerald-400",
  info: "bg-blue-400",
};

const feedDot: Record<string, string> = {
  remediation: "bg-emerald-400",
  governance: "bg-amber-400",
  agent: "bg-blue-400",
};

function HBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  return (
    <div className="mb-2.5">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-zinc-500">{label}</span>
        <span className="font-mono font-semibold text-zinc-700">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${(value / max) * 100}%`, background: color }}
        />
      </div>
    </div>
  );
}

function MiniBar({ pct }: { pct: number }) {
  return (
    <span className="inline-block w-12 h-1.5 bg-zinc-100 rounded-full overflow-hidden align-middle">
      <span
        className="block h-full rounded-full bg-emerald-400"
        style={{ width: `${pct}%` }}
      />
    </span>
  );
}

// ── Panel wrapper ──
function Panel({
  number,
  title,
  children,
  className,
}: {
  number?: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm shadow-light p-5 ${className || ""}`}
    >
      <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800 mb-4 flex items-center gap-2">
        {number && (
          <span className="text-emerald-600 font-mono text-xs">{number}</span>
        )}
        {title}
      </h2>
      {children}
    </div>
  );
}

function SubH({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2.5">
      {children}
    </h3>
  );
}

function Pill({
  children,
  color = "grey",
}: {
  children: React.ReactNode;
  color?: string;
}) {
  const styles: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
    grey: "bg-zinc-100 text-zinc-500",
  };
  return (
    <span
      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${styles[color]}`}
    >
      {children}
    </span>
  );
}

// ── Chart placeholder ──
function ChartPlaceholder({
  height = "h-[140px]",
  label,
}: {
  height?: string;
  label?: string;
}) {
  return (
    <div
      className={`${height} rounded-lg bg-zinc-50 border border-dashed border-zinc-200 flex items-center justify-center`}
    >
      <span className="text-[11px] text-zinc-400">
        {label || "Chart placeholder"}
      </span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// REM TABS
// ══════════════════════════════════════════════════════════════════

const REM_TABS = [
  "Overview",
  "By Service",
  "By Environment",
  "By Category",
] as const;

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════

export default function IntelligenceControlPlanePage() {
  const [remTab, setRemTab] = useState<string>("Overview");
  const [kgFilter, setKgFilter] = useState("Services");
  const [feedFilter, setFeedFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");
  const [drawerContent, setDrawerContent] = useState<React.ReactNode>(null);

  const filteredFeed =
    feedFilter === "all"
      ? FEED_EVENTS
      : FEED_EVENTS.filter((e) => e.type === feedFilter);

  const openDrawer = (title: string, content: React.ReactNode) => {
    setDrawerTitle(title);
    setDrawerContent(content);
    setDrawerOpen(true);
  };

  return (
    <>
      <Header title="Intelligence Control Plane" />
      <main className="p-4 sm:p-6 pb-24 max-w-[1600px] mx-auto space-y-5 font-ibm">
        {/* ── Header Row ── */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-500 max-w-2xl">
              Closed-loop learning. Continuous improvement.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button variant="outline-dark" size="sm">
              <ChevronDown size={14} />
              Last 30 Days
            </Button>
            <Button
              variant="outline-dark"
              size="sm"
              onClick={() => setExportOpen(true)}
            >
              <Download size={14} />
              Export
            </Button>
          </div>
        </div>

        {/* ═══════ ROW 1: Learning + Incident Memory ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.62fr_1fr] gap-5">
          {/* 1. Learning Overview */}
          <Panel number="1." title="Learning Overview Dashboard">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
              {KPI_DATA.map((kpi) => (
                <button
                  key={kpi.label}
                  type="button"
                  onClick={() =>
                    openDrawer(
                      kpi.label,
                      <div>
                        <div className="text-center mb-6">
                          <div
                            className="text-4xl font-bold font-ibm"
                            style={{ color: kpi.color }}
                          >
                            {kpi.value}
                          </div>
                          <div
                            className={`text-sm font-semibold mt-1 ${kpi.cls}`}
                          >
                            {kpi.delta}
                          </div>
                        </div>
                        <ChartPlaceholder
                          height="h-[200px]"
                          label={`${kpi.label} trend chart`}
                        />
                        <p className="text-sm text-zinc-500 mt-4 leading-relaxed">
                          Detailed analysis for {kpi.label} will be populated
                          once the backend is connected.
                        </p>
                      </div>,
                    )
                  }
                  className="text-left bg-zinc-50 border border-zinc-100 rounded-lg p-3 hover:border-zinc-300 hover:bg-white transition-all cursor-pointer"
                >
                  <div className="text-[11px] text-zinc-500 leading-snug h-7">
                    {kpi.label}
                  </div>
                  <div className="text-2xl font-bold tracking-tight mt-1 font-ibm">
                    {kpi.value}
                  </div>
                  <div
                    className={`text-[11px] font-semibold mt-0.5 ${kpi.cls}`}
                  >
                    {kpi.delta}
                  </div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-3.5">
                <SubH>MTTR Trend</SubH>
                <ChartPlaceholder height="h-[120px]" label="MTTR line chart" />
              </div>
              <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-3.5">
                <SubH>Top Recurring Categories</SubH>
                <div className="flex items-center gap-3.5">
                  <ChartPlaceholder height="h-[100px]" label="Donut" />
                  <div className="space-y-1.5 flex-1">
                    {CATEGORIES.map((c) => (
                      <div
                        key={c.name}
                        className="flex items-center gap-2 text-[11px] text-zinc-600"
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: c.color }}
                        />
                        <span className="flex-1 truncate">{c.name}</span>
                        <span className="font-mono font-semibold text-zinc-800">
                          {c.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-3.5">
                <SubH>Most Effective Remediations</SubH>
                {REMEDIATIONS.slice(0, 5).map((r) => (
                  <HBar
                    key={r.name}
                    label={r.name}
                    value={r.rate}
                    max={100}
                    color="#02DD82"
                  />
                ))}
              </div>
            </div>
          </Panel>

          {/* 2. Incident Memory Explorer */}
          <Panel number="2." title="Incident Memory Explorer">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search incidents, services, errors..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg text-xs bg-zinc-50 border border-zinc-200 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1.35fr_1fr] gap-4">
              <div>
                <SubH>Recent & Similar Incidents</SubH>
                <div className="space-y-0.5">
                  {INCIDENTS.map((inc) => (
                    <div
                      key={inc.id}
                      className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-zinc-50 cursor-pointer transition"
                    >
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-1 rounded border min-w-[28px] text-center ${sevColors[inc.sev]}`}
                      >
                        {inc.sev}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12.5px] font-semibold text-zinc-800 truncate">
                          {inc.name}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {inc.meta}
                        </div>
                      </div>
                      <div className="text-[10.5px] text-zinc-400 text-right shrink-0">
                        {inc.similar}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-3">
                  <span className="text-xs font-semibold text-emerald-600 cursor-pointer hover:text-emerald-700">
                    View all incidents →
                  </span>
                </div>
              </div>
              <div>
                <SubH>Similar Incident Clusters</SubH>
                <div className="text-[10.5px] text-zinc-400 mb-2">
                  Vector-embedded incidents grouped by similarity
                </div>
                <ChartPlaceholder
                  height="h-[180px]"
                  label="Scatter cluster chart"
                />
                <div className="text-center mt-3">
                  <span className="text-xs font-semibold text-emerald-600 cursor-pointer hover:text-emerald-700">
                    View in Knowledge Graph →
                  </span>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* ═══════ ROW 2: Remediation + Knowledge Graph + Governance ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* 3. Remediation Intelligence */}
          <Panel number="3." title="Remediation Intelligence">
            <div className="flex gap-1 border-b border-zinc-100 mb-4">
              {REM_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setRemTab(tab)}
                  className={`py-2 px-3 text-xs font-semibold border-b-2 -mb-px transition-colors ${
                    remTab === tab
                      ? "border-emerald-500 text-emerald-700"
                      : "border-transparent text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[0.85fr_1.25fr_1fr] gap-4">
              <div className="flex flex-col items-center gap-2">
                <SubH>Success Rate</SubH>
                <ChartPlaceholder height="h-[100px]" label="87.6%" />
                <span className="text-[11px] font-mono font-semibold text-emerald-600">
                  ↑ 7.3% vs 30 days ago
                </span>
              </div>
              <div>
                <SubH>Top Remediations by Success Rate</SubH>
                <table className="w-full text-[11.5px]">
                  <thead>
                    <tr className="text-zinc-400 font-semibold text-[10.5px]">
                      <th className="text-left pb-2">Remediation</th>
                      <th className="text-right pb-2">Success</th>
                      <th className="text-right pb-2">Att.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {REMEDIATIONS.map((r) => (
                      <tr key={r.name} className="border-t border-zinc-100">
                        <td className="py-1.5 font-medium text-zinc-700">
                          {r.name}
                        </td>
                        <td className="text-right">
                          <MiniBar pct={r.rate} />
                        </td>
                        <td className="text-right font-mono text-zinc-500">
                          {r.attempts}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <SubH>Remediation Risks</SubH>
                <div className="text-[10.5px] text-zinc-400 mb-2">
                  High Risk Remediations
                </div>
                {RISKS.map((r) => (
                  <div
                    key={r.name}
                    className="flex items-center gap-2 py-1.5 border-t border-zinc-100 first:border-t-0 text-[11.5px] text-zinc-600"
                  >
                    <span className="flex-1">{r.name}</span>
                    <span className="font-mono font-semibold text-amber-600">
                      {r.rate}%
                    </span>
                  </div>
                ))}
                <div className="mt-3">
                  <span className="text-xs font-semibold text-emerald-600 cursor-pointer hover:text-emerald-700">
                    View all risk analysis →
                  </span>
                </div>
              </div>
            </div>
            <div className="text-[11px] text-zinc-400 italic mt-3">
              Showing aggregated metrics across all services and environments.
            </div>
          </Panel>

          {/* 4. Knowledge Graph */}
          <Panel number="4." title="Operational Knowledge Graph">
            <div className="flex flex-wrap gap-1.5 items-center mb-3">
              {[
                "Services",
                "Infrastructure",
                "Deployments",
                "Incidents",
                "Dependencies",
              ].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setKgFilter(f)}
                  className={`text-[11px] px-2 py-1 rounded-md transition-colors ${
                    kgFilter === f
                      ? "bg-zinc-200 text-zinc-800 font-semibold"
                      : "text-zinc-500 hover:bg-zinc-100"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <ChartPlaceholder
              height="h-[220px]"
              label="Knowledge graph visualization"
            />
            <div className="flex flex-wrap gap-3 mt-3">
              {[
                { color: "#02DD82", label: "Healthy" },
                { color: "#F59E0B", label: "Warning" },
                { color: "#EF4444", label: "Critical" },
                { color: "#94A3B8", label: "Unknown" },
              ].map((l) => (
                <span
                  key={l.label}
                  className="flex items-center gap-1.5 text-[11px] text-zinc-500"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: l.color }}
                  />
                  {l.label}
                </span>
              ))}
            </div>
            <div className="text-center mt-3">
              <span className="text-xs font-semibold text-emerald-600 cursor-pointer hover:text-emerald-700">
                Explore full graph →
              </span>
            </div>
          </Panel>

          {/* 5. Governance Dashboard */}
          <Panel number="5." title="Governance Dashboard">
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {GOV_KPIS.map((k) => (
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
              <div>
                <SubH>Policy Compliance</SubH>
                <div className="flex flex-col items-center gap-2">
                  <ChartPlaceholder height="h-[100px]" label="96.2%" />
                  <span className="text-[11px] font-mono font-semibold text-emerald-600">
                    ↑ 2.4%
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-xs font-semibold text-emerald-600 cursor-pointer hover:text-emerald-700">
                    View compliance report →
                  </span>
                </div>
              </div>
              <div>
                <SubH>Recent Governance Events</SubH>
                {GOV_EVENTS.map((ev, i) => (
                  <div
                    key={i}
                    className="flex gap-2.5 py-2 border-t border-zinc-100 first:border-t-0 items-start"
                  >
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${govEventDot[ev.type]}`}
                    />
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
                <div className="mt-2">
                  <span className="text-xs font-semibold text-emerald-600 cursor-pointer hover:text-emerald-700">
                    View all events →
                  </span>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* ═══════ ROW 3: EAL + SLO ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* EAL Distribution */}
          <Panel number="★" title="EAL Distribution & Autonomy Posture">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-5">
              {EAL_LEVELS.map((e) => (
                <div
                  key={e.num}
                  className={`rounded-lg border p-3 transition-all cursor-default ${
                    e.active
                      ? "border-emerald-400 bg-emerald-50/50"
                      : "border-zinc-100 bg-zinc-50"
                  }`}
                >
                  <div className="text-[9px] font-mono font-bold tracking-wider text-zinc-400 uppercase">
                    {e.num}
                  </div>
                  <div className="text-[11px] font-bold text-zinc-800 mt-0.5 leading-snug">
                    {e.name}
                  </div>
                  <div
                    className="text-xl font-bold tracking-tight mt-1"
                    style={{ color: e.color }}
                  >
                    {e.count}
                  </div>
                  <div className="h-1 rounded-full bg-zinc-200 mt-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${e.pct}%`, background: e.color }}
                    />
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1.5">
                    {e.desc}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <SubH>EAL Transition Trend</SubH>
                <ChartPlaceholder height="h-[90px]" label="EAL trend lines" />
              </div>
              <div>
                <SubH>Autonomy Posture Summary</SubH>
                <div className="text-[12.5px] text-zinc-600 leading-relaxed space-y-2">
                  <p>
                    <strong className="text-zinc-900">60.9%</strong> of
                    incidents are now handled at EAL 3 or above — up from 48%
                    thirty days ago.
                  </p>
                  <p>
                    EAL 4 headcount grew 33% as the learning loop validated new
                    playbook classes.
                  </p>
                  <p className="text-zinc-400">
                    Policy guardrails remain active across all EAL levels.
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-600 cursor-pointer hover:text-emerald-700 mt-3 inline-block">
                  View EAL policy settings →
                </span>
              </div>
            </div>
          </Panel>

          {/* SLO Health */}
          <Panel number="★" title="SLO Health & Error Budget">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {SLO_DATA.map((s) => {
                const st = sloStatusStyles[s.status];
                return (
                  <div
                    key={s.svc}
                    className="bg-zinc-50 border border-zinc-100 rounded-lg p-3"
                  >
                    <div className="text-[11.5px] font-bold text-zinc-800">
                      {s.svc}
                    </div>
                    <div className="text-[10px] text-zinc-400 mb-2">
                      SLO target: {s.target}
                    </div>
                    <div
                      className="text-xl font-bold tracking-tight"
                      style={{ color: st.color }}
                    >
                      {s.actual}%
                    </div>
                    <Pill
                      color={
                        s.status === "healthy"
                          ? "green"
                          : s.status === "warn"
                            ? "amber"
                            : "red"
                      }
                    >
                      {s.status === "healthy"
                        ? "Healthy"
                        : s.status === "warn"
                          ? "At Risk"
                          : "Breached"}
                    </Pill>
                    <div className="flex justify-between text-[10.5px] text-zinc-400 mt-2">
                      <span>Error budget</span>
                      <span
                        className={`font-mono font-semibold ${s.budget < 0 ? "text-red-500" : "text-zinc-600"}`}
                      >
                        {s.budget > 0 ? "+" : ""}
                        {s.budget}h
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-zinc-200 mt-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (s.burn / 5) * 100)}%`,
                          background: st.color,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10.5px] text-zinc-400 mt-1">
                      <span>Burn rate</span>
                      <span className="font-mono font-semibold text-zinc-600">
                        {s.burn}x
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <SubH>Error Budget Burn Rate — Last 7 Days</SubH>
            <ChartPlaceholder height="h-[80px]" label="Burn rate area chart" />
            <span className="text-xs font-semibold text-emerald-600 cursor-pointer hover:text-emerald-700 mt-3 inline-block">
              View all SLO reports →
            </span>
          </Panel>
        </div>

        {/* ═══════ ROW 4: Cost + Live Feed ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Cost & Efficiency */}
          <Panel number="★" title="Cost & Engineering Efficiency">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
              {COST_KPIS.map((k) => (
                <div
                  key={k.label}
                  className="bg-zinc-50 border border-zinc-100 rounded-lg p-3"
                >
                  <div className="text-[11px] text-zinc-500 leading-snug h-6">
                    {k.label}
                  </div>
                  <div className="text-xl font-bold tracking-tight mt-1 font-ibm">
                    {k.value}
                  </div>
                  <div className={`text-[11px] font-semibold ${k.cls}`}>
                    {k.delta}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <SubH>Engineer Hours Saved by Category</SubH>
                {COST_BARS.map((b) => (
                  <div
                    key={b.label}
                    className="flex items-center gap-2.5 mb-2.5 text-[11.5px]"
                  >
                    <span className="text-zinc-500 w-[130px] shrink-0 truncate">
                      {b.label}
                    </span>
                    <div className="flex-1 h-[7px] bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(b.value / 520) * 100}%`,
                          background: b.color,
                        }}
                      />
                    </div>
                    <span className="font-mono text-[10.5px] text-zinc-500 w-10 text-right">
                      {b.value}h
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <SubH>Monthly Cost Avoidance Trend</SubH>
                <ChartPlaceholder height="h-[120px]" label="Cost trend chart" />
              </div>
            </div>
          </Panel>

          {/* Live Activity Feed */}
          <Panel number="★" title="Live Activity Feed">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] text-zinc-400">
                Real-time orchestration activity
              </div>
              <div className="flex gap-1">
                {["all", "remediation", "governance", "agent"].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFeedFilter(f)}
                    className={`text-[11px] px-2 py-1 rounded-md capitalize transition-colors ${
                      feedFilter === f
                        ? "bg-zinc-200 text-zinc-800 font-semibold"
                        : "text-zinc-500 hover:bg-zinc-100"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-0">
              {filteredFeed.map((ev, i) => (
                <div
                  key={i}
                  className="flex gap-2.5 py-2.5 border-t border-zinc-100 first:border-t-0 items-start"
                >
                  <span
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${feedDot[ev.type]}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-zinc-800">
                      {ev.title}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      {ev.detail}
                    </div>
                  </div>
                  <span className="text-[10.5px] text-zinc-400 shrink-0">
                    {ev.time}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <span className="text-xs font-semibold text-emerald-600 cursor-pointer hover:text-emerald-700">
                View full audit trail →
              </span>
            </div>
          </Panel>
        </div>

        {/* ═══════ ROW 5: Orchestration + Agents ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* 6. Orchestration Evolution */}
          <Panel number="6." title="Orchestration Evolution">
            <div className="grid grid-cols-1 sm:grid-cols-[1.1fr_1fr_0.92fr] gap-4">
              <div>
                <SubH>Workflow Evolution Over Time</SubH>
                <ChartPlaceholder
                  height="h-[120px]"
                  label="Improvement trend"
                />
              </div>
              <div>
                <SubH>Top Improvements</SubH>
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
              <div>
                <SubH>Expected MTTR Reduction</SubH>
                <div className="text-3xl font-bold tracking-tight text-emerald-600 font-ibm mt-2">
                  23.6%
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  Based on learned orchestration improvements
                </div>
              </div>
            </div>
            <div className="text-center mt-3">
              <span className="text-xs font-semibold text-emerald-600 cursor-pointer hover:text-emerald-700">
                View all improvements →
              </span>
            </div>
          </Panel>

          {/* 7. Agent Intelligence */}
          <Panel number="7." title="Agent Intelligence">
            <div className="grid grid-cols-1 sm:grid-cols-[1.05fr_1.25fr_0.7fr] gap-4">
              <div>
                <SubH>Agent Performance</SubH>
                <table className="w-full text-[11.5px]">
                  <thead>
                    <tr className="text-zinc-400 font-semibold text-[10.5px]">
                      <th className="text-left pb-2">Agent</th>
                      <th className="text-left pb-2">Acc.</th>
                      <th className="text-left pb-2">Tasks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {AGENTS.map((a) => (
                      <tr key={a.name} className="border-t border-zinc-100">
                        <td className="py-1.5 font-medium text-zinc-700 truncate max-w-[120px]">
                          {a.name}
                        </td>
                        <td className="font-mono text-emerald-600 font-semibold">
                          {a.accuracy}%
                        </td>
                        <td className="font-mono text-zinc-500">{a.tasks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-3">
                  <span className="text-xs font-semibold text-emerald-600 cursor-pointer hover:text-emerald-700">
                    View all agents →
                  </span>
                </div>
              </div>
              <div>
                <SubH>Accuracy Over Time</SubH>
                <ChartPlaceholder
                  height="h-[140px]"
                  label="Agent accuracy trend"
                />
              </div>
              <div>
                <SubH>Agent Health</SubH>
                <div className="flex flex-col items-center gap-2">
                  <ChartPlaceholder height="h-[100px]" label="90.4%" />
                  <span className="text-[11px] font-mono font-semibold text-emerald-600">
                    ↑ 4.2%
                  </span>
                </div>
                <div className="text-center mt-3">
                  <span className="text-xs font-semibold text-emerald-600 cursor-pointer hover:text-emerald-700">
                    View agent health →
                  </span>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </main>

      {/* ═══════ EXPORT MODAL ═══════ */}
      <Modal isOpen={exportOpen} onClose={() => setExportOpen(false)}>
        <div className="p-4 space-y-5">
          <div>
            <h2 className="text-base font-bold text-zinc-900">
              Export Intelligence Report
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: "PDF Report", sub: "Board-ready format", emoji: "📄" },
              { label: "CSV Data", sub: "Raw metrics export", emoji: "📊" },
              { label: "JSON / API", sub: "Programmatic access", emoji: "🔗" },
            ].map((fmt) => (
              <button
                key={fmt.label}
                type="button"
                className="border border-zinc-200 rounded-xl p-3 text-center hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors"
              >
                <div className="text-2xl mb-1">{fmt.emoji}</div>
                <div className="text-xs font-bold text-zinc-800">
                  {fmt.label}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  {fmt.sub}
                </div>
              </button>
            ))}
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-600 mb-2">
              Include Sections
            </div>
            <div className="space-y-2">
              {[
                "Learning Overview Dashboard",
                "Incident Memory & Clustering",
                "Remediation Intelligence",
                "Governance & Compliance Audit Trail",
                "EAL Distribution & Autonomy Trends",
                "Cost & Engineering Hours Saved",
                "Agent Intelligence Detail",
              ].map((s) => (
                <label
                  key={s}
                  className="flex items-center gap-2.5 text-xs text-zinc-600 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2.5">
            <Button
              variant="outline-dark"
              size="sm"
              onClick={() => setExportOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={() => setExportOpen(false)}>
              Generate Report
            </Button>
          </div>
        </div>
      </Modal>

      {/* ═══════ SIDE DRAWER (Expand & Explain) ═══════ */}
      {drawerOpen && (
        <SideModal
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={drawerTitle}
          subTitle="Expand & explain"
        >
          {drawerContent}
        </SideModal>
      )}
    </>
  );
}
