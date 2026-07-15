"use client";

import React, { useMemo, useState, useCallback } from "react";
import { Search, ChevronDown, Download } from "lucide-react";
import Header from "@/components/IMS/DashboardHeader";
import Button from "@/components/ui/Button1";
import Modal from "@/components/ui/Modal";
import SideModal from "@/components/ui/SideModal";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
  ScatterController,
} from "chart.js";
import { Line, Doughnut, Bar, Scatter } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
  ScatterController,
);

// ══════════════════════════════════════════════════════════════════
// CHART DEFAULTS
// ══════════════════════════════════════════════════════════════════

const NO_LEGEND = { display: false } as const;
const GRID_OFF = { display: false } as const;
const GRID_SOFT = { color: "#F1F5F9", drawBorder: false } as const;
const FONT = {
  family: "'IBM Plex Sans', system-ui, sans-serif",
  size: 10,
  color: "#94A3B8",
};

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
    spark: [40, 33, 30, 28, 24, 22, 18, 15],
  },
  {
    label: "Autonomous Success Rate",
    value: "89.3%",
    delta: "↑ 6.7%",
    cls: "text-emerald-600",
    color: "#02DD82",
    spark: [78, 80, 82, 84, 86, 88, 89, 89.3],
  },
  {
    label: "Human Override Rate",
    value: "8.7%",
    delta: "↓ 3.1%",
    cls: "text-purple-600",
    color: "#A855F7",
    spark: [14, 13, 12, 11, 10.5, 10, 9, 8.7],
  },
  {
    label: "Incidents Resolved",
    value: "156",
    delta: "↑ 18.4%",
    cls: "text-emerald-600",
    color: "#3B82F6",
    spark: [110, 118, 124, 130, 138, 145, 151, 156],
  },
  {
    label: "Knowledge Artifacts",
    value: "1,248",
    delta: "↑ 24.6%",
    cls: "text-emerald-600",
    color: "#3B82F6",
    spark: [820, 900, 960, 1020, 1090, 1150, 1200, 1248],
  },
  {
    label: "Confidence Calibration",
    value: "0.92",
    delta: "↑ 0.05",
    cls: "text-amber-600",
    color: "#F59E0B",
    spark: [0.84, 0.85, 0.86, 0.88, 0.89, 0.9, 0.91, 0.92],
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
  { name: "Restart Service", rate: 92, attempts: 128, color: "#02DD82" },
  { name: "Rollback Deployment", rate: 91, attempts: 103, color: "#3B82F6" },
  { name: "Scale Up", rate: 87, attempts: 98, color: "#A855F7" },
  { name: "Cache Clear", rate: 82, attempts: 74, color: "#22D3EE" },
  { name: "DB Connection Reset", rate: 78, attempts: 62, color: "#F59E0B" },
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
  {
    name: "Incident Triage Agent",
    accuracy: 94,
    tasks: 312,
    color: "#02DD82",
    trend: [88, 90, 91, 92, 93, 94],
  },
  {
    name: "Root Cause Agent",
    accuracy: 92,
    tasks: 278,
    color: "#3B82F6",
    trend: [85, 87, 88, 90, 91, 92],
  },
  {
    name: "Log Analysis Agent",
    accuracy: 89,
    tasks: 245,
    color: "#A855F7",
    trend: [80, 82, 85, 86, 88, 89],
  },
  {
    name: "Infra Agent",
    accuracy: 91,
    tasks: 301,
    color: "#F59E0B",
    trend: [84, 86, 88, 89, 90, 91],
  },
  {
    name: "Code Analysis Agent",
    accuracy: 87,
    tasks: 189,
    color: "#22D3EE",
    trend: [78, 80, 82, 84, 86, 87],
  },
  {
    name: "Remediation Agent",
    accuracy: 93,
    tasks: 256,
    color: "#EF4444",
    trend: [86, 88, 90, 91, 92, 93],
  },
];

// ── Chart AI analysis notes (from the blueprint) ──
const CHART_NOTES: Record<
  string,
  { title: string; tag: string; note: string }
> = {
  mttr: {
    title: "MTTR Trend",
    tag: "Mean time to resolution · last 30 days",
    note: "Mean time to resolution has trended steadily downward across the window, falling from roughly forty hours to about fifteen. The green trend line confirms the decline is structural rather than noise, with each dip being held rather than reverting. This tracks closely with the rise in autonomous remediation success. The occasional upward spikes correspond to novel incident types the playbooks have not yet learned, where the orchestrator falls back to slower, human-paced resolution.",
  },
  categories: {
    title: "Top Recurring Incident Categories",
    tag: "Share of incidents by category",
    note: "Performance degradation is the single largest source of incidents at 28%, with deployment- and release-related issues close behind at 22%. Together these two categories account for half of all incidents, which is precisely where orchestration improvements and pre-deploy checks will return the most leverage. The shape of this distribution is a good sign: no single category dominates so heavily that it masks systemic problems elsewhere.",
  },
  effective: {
    title: "Most Effective Remediations",
    tag: "Success rate by remediation type",
    note: "Restart Service and Rollback Deployment are the workhorses of the remediation library, succeeding 92% and 91% of the time. These rates feed directly into the confidence scores that gate autonomous execution. A remediation with a consistently high success rate earns a higher automation stage, which is how the system safely widens what it is allowed to do on its own.",
  },
  cluster: {
    title: "Similar Incident Clusters",
    tag: "Vector-embedded incident similarity",
    note: "Each point is an incident embedded by similarity, so tight clusters represent recurring, well-understood failure patterns while scattered points are genuinely novel events. The dominant cluster is the recurring class the system has seen most — likely the performance-degradation incidents. The smaller, looser groupings are where human review still adds the most value.",
  },
  remDonut: {
    title: "Remediation Success Rate",
    tag: "Overall autonomous + assisted success",
    note: "Overall remediation success sits at 87.6%, up 7.3 points over the prior thirty days. The remaining twelve percent is not all failure: a good portion is deliberately conservative blocks where guardrails halted on uncertainty rather than risked an unsafe action. The combination to watch is a rising success rate alongside a falling human override rate, and that is exactly what is happening here.",
  },
  compliance: {
    title: "Policy Compliance",
    tag: "Overall policy compliance rate",
    note: "Policy compliance sits at 96.2%, up 2.4 points. Five policy violations were recorded this period, down 37.5% from the prior window. The remaining violations are concentrated in the Risk-Guardrail policy, where novel incident types occasionally trigger actions before coverage is complete.",
  },
  ealTrend: {
    title: "EAL Transition Trend",
    tag: "Effective Automation Level distribution over time",
    note: "60.9% of incidents are now handled at EAL 3 or above — autonomously or conditionally automated — up from 48% thirty days ago. EAL 4 headcount grew 33% as the learning loop validated new playbook classes against the blast-radius model. EAL 0 and 1 are reserved for novel incident types where precedent is insufficient.",
  },
  sloBurn: {
    title: "Error Budget Burn Rate",
    tag: "SLO error budget consumption over 7 days",
    note: "Payment API and Search Service are burning error budget fastest. Search Service has already breached its SLO, burning at 4.2x — well above the 2.5x alert threshold. Payment API is trending toward breach if the current trajectory holds. Checkout Service remains well within budget at 0.42x burn rate.",
  },
  costTrend: {
    title: "Monthly Cost Avoidance Trend",
    tag: "Autonomous savings and reduced escalations",
    note: "Autonomous cost avoidance has grown from $62K to $198K over eight months — a 3.2x increase driven by the compounding effect of the learning loop. Reduced escalations contribute an additional $52K monthly, reflecting fewer incidents requiring senior engineering attention.",
  },
  orchTrend: {
    title: "Workflow Evolution Over Time",
    tag: "Orchestration improvement metrics",
    note: "MTTR improvement and efficiency gain have both trended upward steadily, with MTTR improvement leading at 32% and efficiency gain at 28%. The gap between the two is narrowing, suggesting that workflow optimizations are becoming more broadly applicable across incident types.",
  },
  agentAcc: {
    title: "Agent Accuracy Over Time",
    tag: "Per-agent accuracy trends",
    note: "All six agents show positive accuracy trajectories. Incident Triage Agent leads at 94%, having gained 6 points over the window. Code Analysis Agent trails at 87% but shows the steepest improvement curve, suggesting rapid learning from newly encountered code patterns.",
  },
  agentHealth: {
    title: "Agent Health",
    tag: "Fleet-wide agent health score",
    note: "90.4% fleet health with all six agents in a healthy state. The 4.2% improvement reflects both accuracy gains and reduced latency drift. No agent currently requires intervention or retraining outside the normal learning cycle.",
  },
};

// ══════════════════════════════════════════════════════════════════
// CHART COMPONENTS
// ══════════════════════════════════════════════════════════════════

function Sparkline({
  data,
  color,
  height = 30,
}: {
  data: number[];
  color: string;
  height?: number;
}) {
  return (
    <div style={{ height }}>
      <Line
        data={{
          labels: data.map((_, i) => i),
          datasets: [
            {
              data,
              borderColor: color,
              borderWidth: 1.5,
              fill: true,
              backgroundColor: color + "18",
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 0,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: NO_LEGEND, tooltip: { enabled: false } },
          scales: { x: { display: false }, y: { display: false } },
        }}
      />
    </div>
  );
}

function MTTRChart({ big }: { big?: boolean }) {
  const labels = [
    "Apr 29",
    "May 3",
    "May 6",
    "May 10",
    "May 13",
    "May 17",
    "May 20",
    "May 24",
    "May 27",
    "May 29",
    "Jun 1",
    "Jun 3",
  ];
  const data = [40, 33, 30, 38, 28, 24, 30, 22, 26, 18, 24, 15];
  const trend = data.map((_, i) => 38 - i * 1.9);
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: "MTTR (hrs)",
            data,
            borderColor: "#3B82F6",
            borderWidth: 2,
            tension: 0.35,
            pointRadius: big ? 3 : 2,
            pointBackgroundColor: "#3B82F6",
            fill: false,
          },
          {
            label: "Trend",
            data: trend,
            borderColor: "#02DD82",
            borderWidth: 1.5,
            borderDash: [4, 3],
            tension: 0.3,
            pointRadius: 0,
            fill: false,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: big
            ? {
                position: "bottom",
                labels: { boxWidth: 12, font: { size: 11 } },
              }
            : NO_LEGEND,
          tooltip: { mode: "index", intersect: false },
        },
        scales: {
          x: {
            grid: GRID_OFF,
            ticks: { font: { size: 9 }, color: "#94A3B8", maxRotation: 0 },
          },
          y: {
            grid: GRID_SOFT,
            ticks: { font: { size: 9 }, color: "#94A3B8" },
            beginAtZero: true,
          },
        },
      }}
    />
  );
}

function CategoryDonut({ big }: { big?: boolean }) {
  return (
    <Doughnut
      data={{
        labels: CATEGORIES.map((c) => c.name),
        datasets: [
          {
            data: CATEGORIES.map((c) => c.pct),
            backgroundColor: CATEGORIES.map((c) => c.color),
            borderWidth: 0,
            // cutout: big ? "68%" : "72%",
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: NO_LEGEND,
          tooltip: {
            callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}%` },
          },
        },
      }}
    />
  );
}

function EffectivenessChart({ big }: { big?: boolean }) {
  return (
    <Bar
      data={{
        labels: REMEDIATIONS.map((r) => r.name),
        datasets: [
          {
            data: REMEDIATIONS.map((r) => r.rate),
            backgroundColor: REMEDIATIONS.map((r) => r.color),
            borderRadius: 4,
            barThickness: big ? 18 : 12,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        plugins: {
          legend: NO_LEGEND,
          tooltip: {
            callbacks: { label: (ctx) => `${ctx.parsed.x}% success rate` },
          },
        },
        scales: {
          x: {
            grid: GRID_SOFT,
            min: 60,
            max: 100,
            ticks: {
              font: { size: 9 },
              color: "#94A3B8",
              callback: (v) => v + "%",
            },
          },
          y: {
            grid: GRID_OFF,
            ticks: { font: { size: 10 }, color: "#475569" },
          },
        },
      }}
    />
  );
}

function ClusterScatter({ big }: { big?: boolean }) {
  const clusters = [
    { cx: 65, cy: 55, r: 30, n: 35, color: "#A855F7" },
    { cx: 30, cy: 50, r: 24, n: 22, color: "#3B82F6" },
    { cx: 28, cy: 82, r: 22, n: 20, color: "#F59E0B" },
    { cx: 62, cy: 85, r: 22, n: 20, color: "#02DD82" },
  ];
  const datasets = clusters.map((c, i) => ({
    label: `Cluster ${i + 1}`,
    data: Array.from({ length: c.n }, () => ({
      x: c.cx + (Math.random() - 0.5) * c.r * 2,
      y: c.cy + (Math.random() - 0.5) * c.r * 1.6,
    })),
    backgroundColor: c.color + "AA",
    pointRadius: big ? 4.5 : 3,
    pointHoverRadius: big ? 6 : 4,
  }));
  return (
    <Scatter
      data={{ datasets }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: NO_LEGEND },
        scales: {
          x: { display: false, min: 0, max: 100 },
          y: { display: false, min: 20, max: 110 },
        },
      }}
    />
  );
}

function SuccessDonut({
  rate = 87.6,
  label = "Overall Success",
  big,
}: {
  rate?: number;
  label?: string;
  big?: boolean;
}) {
  return (
    <Doughnut
      data={{
        labels: ["Success", "Remaining"],
        datasets: [
          {
            data: [rate, 100 - rate],
            backgroundColor: ["#02DD82", "#E8EDF3"],
            borderWidth: 0,
            // cutout: big ? "72%" : "76%",
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: NO_LEGEND,
          tooltip: {
            callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}%` },
          },
        },
      }}
    />
  );
}

function EALTrendChart({ big }: { big?: boolean }) {
  const labels = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10"];
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: "EAL 3",
            data: [28, 31, 34, 38, 41, 45, 50, 55, 60, 67],
            borderColor: "#02DD82",
            borderWidth: 2,
            tension: 0.35,
            pointRadius: big ? 3 : 0,
            fill: false,
          },
          {
            label: "EAL 4",
            data: [8, 9, 10, 12, 14, 17, 19, 22, 25, 28],
            borderColor: "#A855F7",
            borderWidth: 2,
            tension: 0.35,
            pointRadius: big ? 3 : 0,
            fill: false,
          },
          {
            label: "EAL 2",
            data: [55, 54, 52, 50, 48, 46, 44, 43, 42, 41],
            borderColor: "#3B82F6",
            borderWidth: 2,
            tension: 0.35,
            pointRadius: big ? 3 : 0,
            fill: false,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: big
            ? {
                position: "bottom",
                labels: { boxWidth: 12, font: { size: 11 } },
              }
            : NO_LEGEND,
        },
        scales: {
          x: { grid: GRID_OFF, ticks: { font: { size: 9 }, color: "#94A3B8" } },
          y: {
            grid: GRID_SOFT,
            beginAtZero: true,
            ticks: { font: { size: 9 }, color: "#94A3B8" },
          },
        },
      }}
    />
  );
}

function BurnRateChart({ big }: { big?: boolean }) {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: "Search Svc",
            data: [1.2, 1.8, 2.4, 3.0, 3.6, 4.0, 4.2],
            borderColor: "#EF4444",
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            backgroundColor: "#EF444412",
            pointRadius: big ? 3 : 0,
          },
          {
            label: "Payment API",
            data: [0.8, 1.1, 1.9, 2.4, 2.8, 3.0, 3.1],
            borderColor: "#F59E0B",
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            backgroundColor: "#F59E0B12",
            pointRadius: big ? 3 : 0,
          },
          {
            label: "Checkout",
            data: [0.3, 0.4, 0.3, 0.4, 0.4, 0.4, 0.42],
            borderColor: "#02DD82",
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            backgroundColor: "#02DD8212",
            pointRadius: big ? 3 : 0,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: big
            ? {
                position: "bottom",
                labels: { boxWidth: 12, font: { size: 11 } },
              }
            : NO_LEGEND,
          // annotation: undefined,
        },
        scales: {
          x: { grid: GRID_OFF, ticks: { font: { size: 9 }, color: "#94A3B8" } },
          y: {
            grid: GRID_SOFT,
            min: 0,
            max: 5,
            ticks: { font: { size: 9 }, color: "#94A3B8" },
          },
        },
      }}
    />
  );
}

function CostTrendChart({ big }: { big?: boolean }) {
  const labels = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: "Autonomous savings",
            data: [62, 74, 88, 104, 121, 140, 165, 198],
            borderColor: "#02DD82",
            borderWidth: 2,
            tension: 0.35,
            fill: true,
            backgroundColor: "#02DD8215",
            pointRadius: big ? 3 : 2,
            pointBackgroundColor: "#02DD82",
          },
          {
            label: "Reduced escalations",
            data: [18, 22, 26, 30, 34, 39, 45, 52],
            borderColor: "#3B82F6",
            borderWidth: 2,
            tension: 0.35,
            fill: true,
            backgroundColor: "#3B82F615",
            pointRadius: big ? 3 : 2,
            pointBackgroundColor: "#3B82F6",
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: big
            ? {
                position: "bottom",
                labels: { boxWidth: 12, font: { size: 11 } },
              }
            : NO_LEGEND,
        },
        scales: {
          x: { grid: GRID_OFF, ticks: { font: { size: 9 }, color: "#94A3B8" } },
          y: {
            grid: GRID_SOFT,
            beginAtZero: true,
            ticks: {
              font: { size: 9 },
              color: "#94A3B8",
              callback: (v) => "$" + v + "K",
            },
          },
        },
      }}
    />
  );
}

function OrchTrendChart({ big }: { big?: boolean }) {
  const labels = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: "MTTR Improvement",
            data: [12, 15, 18, 21, 24, 27, 30, 32],
            borderColor: "#02DD82",
            borderWidth: 2,
            tension: 0.35,
            fill: false,
            pointRadius: big ? 3 : 2,
            pointBackgroundColor: "#02DD82",
          },
          {
            label: "Efficiency Gain",
            data: [8, 11, 14, 17, 19, 22, 25, 28],
            borderColor: "#3B82F6",
            borderWidth: 2,
            tension: 0.35,
            fill: false,
            pointRadius: big ? 3 : 2,
            pointBackgroundColor: "#3B82F6",
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: big
            ? {
                position: "bottom",
                labels: { boxWidth: 12, font: { size: 11 } },
              }
            : NO_LEGEND,
        },
        scales: {
          x: { grid: GRID_OFF, ticks: { font: { size: 9 }, color: "#94A3B8" } },
          y: {
            grid: GRID_SOFT,
            beginAtZero: true,
            ticks: {
              font: { size: 9 },
              color: "#94A3B8",
              callback: (v) => v + "%",
            },
          },
        },
      }}
    />
  );
}

function AgentAccuracyChart({ big }: { big?: boolean }) {
  const labels = ["W1", "W2", "W3", "W4", "W5", "W6"];
  return (
    <Line
      data={{
        labels,
        datasets: AGENTS.map((a) => ({
          label: a.name.replace(" Agent", ""),
          data: a.trend,
          borderColor: a.color,
          borderWidth: 1.8,
          tension: 0.35,
          pointRadius: big ? 3 : 0,
          fill: false,
        })),
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: big
            ? {
                position: "bottom",
                labels: { boxWidth: 12, font: { size: 10 } },
              }
            : NO_LEGEND,
        },
        scales: {
          x: { grid: GRID_OFF, ticks: { font: { size: 9 }, color: "#94A3B8" } },
          y: {
            grid: GRID_SOFT,
            min: 75,
            max: 100,
            ticks: {
              font: { size: 9 },
              color: "#94A3B8",
              callback: (v) => v + "%",
            },
          },
        },
      }}
    />
  );
}

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

/** Clickable chart wrapper that opens the side modal on click */
function ChartCard({
  chartKey,
  onClick,
  children,
  className,
}: {
  chartKey: string;
  onClick: (key: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      onClick={() => onClick(chartKey)}
      className={`cursor-pointer transition-all hover:ring-1 hover:ring-emerald-200 rounded-lg ${className || ""}`}
    >
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// CHART MODAL CONTENT BUILDER
// ══════════════════════════════════════════════════════════════════

function ChartModalContent({ chartKey }: { chartKey: string }) {
  const note = CHART_NOTES[chartKey];
  if (!note)
    return <p className="text-sm text-zinc-400">No analysis available.</p>;

  const chartMap: Record<string, React.ReactNode> = {
    mttr: (
      <div className="h-[280px]">
        <MTTRChart big />
      </div>
    ),
    categories: (
      <div className="max-w-[260px] mx-auto">
        <CategoryDonut big />
      </div>
    ),
    effective: (
      <div className="h-[260px]">
        <EffectivenessChart big />
      </div>
    ),
    cluster: (
      <div className="h-[300px]">
        <ClusterScatter big />
      </div>
    ),
    remDonut: (
      <div className="max-w-[220px] mx-auto">
        <SuccessDonut big />
      </div>
    ),
    compliance: (
      <div className="max-w-[220px] mx-auto">
        <SuccessDonut rate={96.2} label="Compliant" big />
      </div>
    ),
    ealTrend: (
      <div className="h-[240px]">
        <EALTrendChart big />
      </div>
    ),
    sloBurn: (
      <div className="h-[240px]">
        <BurnRateChart big />
      </div>
    ),
    costTrend: (
      <div className="h-[280px]">
        <CostTrendChart big />
      </div>
    ),
    orchTrend: (
      <div className="h-[240px]">
        <OrchTrendChart big />
      </div>
    ),
    agentAcc: (
      <div className="h-[260px]">
        <AgentAccuracyChart big />
      </div>
    ),
    agentHealth: (
      <div className="max-w-[220px] mx-auto">
        <SuccessDonut rate={90.4} label="Healthy" big />
      </div>
    ),
  };

  return (
    <div className="space-y-5">
      {chartMap[chartKey] && (
        <div className="bg-zinc-50 rounded-xl border border-zinc-100 p-5">
          {chartMap[chartKey]}
        </div>
      )}
      <div>
        <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-zinc-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            Ezra Analysis
          </span>
          <span className="text-[11px] text-zinc-400 italic ml-auto">
            Pre-computed
          </span>
        </div>
        <p className="text-[13px] text-zinc-600 leading-[1.72]">{note.note}</p>
      </div>
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
  const [drawerSubTitle, setDrawerSubTitle] = useState("");
  const [drawerContent, setDrawerContent] = useState<React.ReactNode>(null);

  const filteredFeed =
    feedFilter === "all"
      ? FEED_EVENTS
      : FEED_EVENTS.filter((e) => e.type === feedFilter);

  const openChartDrawer = useCallback((key: string) => {
    const note = CHART_NOTES[key];
    if (!note) return;
    setDrawerTitle(note.title);
    setDrawerSubTitle(note.tag);
    setDrawerContent(<ChartModalContent chartKey={key} />);
    setDrawerOpen(true);
  }, []);

  const openKpiDrawer = useCallback((kpi: (typeof KPI_DATA)[0]) => {
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
          <div className="h-[180px]">
            <Line
              data={{
                labels: kpi.spark.map((_, i) => `W${i + 1}`),
                datasets: [
                  {
                    data: kpi.spark,
                    borderColor: kpi.color,
                    borderWidth: 2.5,
                    tension: 0.4,
                    fill: true,
                    backgroundColor: kpi.color + "18",
                    pointRadius: 3,
                    pointBackgroundColor: kpi.color,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: NO_LEGEND },
                scales: {
                  x: {
                    grid: GRID_OFF,
                    ticks: { font: { size: 9 }, color: "#94A3B8" },
                  },
                  y: {
                    grid: GRID_SOFT,
                    ticks: { font: { size: 9 }, color: "#94A3B8" },
                  },
                },
              }}
            />
          </div>
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
      <main className="p-4 sm:p-6 pb-24 max-w-[1600px] mx-auto space-y-5 font-ibm">
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

        {/* ═══════ ROW 1 ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.62fr_1fr] gap-5">
          {/* 1. Learning Overview */}
          <Panel number="1." title="Learning Overview Dashboard">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
              {KPI_DATA.map((kpi) => (
                <button
                  key={kpi.label}
                  type="button"
                  onClick={() => openKpiDrawer(kpi)}
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
                  <Sparkline data={kpi.spark} color={kpi.color} />
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ChartCard
                chartKey="mttr"
                onClick={openChartDrawer}
                className="bg-zinc-50 border border-zinc-100 rounded-lg p-3.5"
              >
                <SubH>MTTR Trend</SubH>
                <div className="h-[130px]">
                  <MTTRChart />
                </div>
              </ChartCard>
              <ChartCard
                chartKey="categories"
                onClick={openChartDrawer}
                className="bg-zinc-50 border border-zinc-100 rounded-lg p-3.5"
              >
                <SubH>Top Recurring Categories</SubH>
                <div className="flex items-center gap-3">
                  <div className="w-[90px] shrink-0">
                    <CategoryDonut />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
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
              </ChartCard>
              <ChartCard
                chartKey="effective"
                onClick={openChartDrawer}
                className="bg-zinc-50 border border-zinc-100 rounded-lg p-3.5"
              >
                <SubH>Most Effective Remediations</SubH>
                <div className="h-[140px]">
                  <EffectivenessChart />
                </div>
              </ChartCard>
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
              <ChartCard chartKey="cluster" onClick={openChartDrawer}>
                <SubH>Similar Incident Clusters</SubH>
                <div className="text-[10.5px] text-zinc-400 mb-2">
                  Vector-embedded incidents grouped by similarity
                </div>
                <div className="h-[180px]">
                  <ClusterScatter />
                </div>
                <div className="text-center mt-3">
                  <span className="text-xs font-semibold text-emerald-600 cursor-pointer hover:text-emerald-700">
                    View in Knowledge Graph →
                  </span>
                </div>
              </ChartCard>
            </div>
          </Panel>
        </div>

        {/* ═══════ ROW 2 ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* 3. Remediation Intelligence */}
          <Panel number="3." title="Remediation Intelligence">
            <div className="flex gap-1 border-b border-zinc-100 mb-4">
              {REM_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setRemTab(tab)}
                  className={`py-2 px-3 text-xs font-semibold border-b-2 -mb-px transition-colors ${remTab === tab ? "border-emerald-500 text-emerald-700" : "border-transparent text-zinc-400 hover:text-zinc-600"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[0.85fr_1.25fr_1fr] gap-4">
              <ChartCard
                chartKey="remDonut"
                onClick={openChartDrawer}
                className="flex flex-col items-center gap-2"
              >
                <SubH>Success Rate</SubH>
                <div className="w-[100px]">
                  <SuccessDonut />
                </div>
                <span className="text-[11px] font-mono font-semibold text-emerald-600">
                  ↑ 7.3% vs 30d ago
                </span>
              </ChartCard>
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
                  <span className="text-xs font-semibold text-emerald-600 cursor-pointer">
                    View all risk analysis →
                  </span>
                </div>
              </div>
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
                  className={`text-[11px] px-2 py-1 rounded-md transition-colors ${kgFilter === f ? "bg-zinc-200 text-zinc-800 font-semibold" : "text-zinc-500 hover:bg-zinc-100"}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <ChartCard chartKey="cluster" onClick={openChartDrawer}>
              <div className="h-[220px]">
                <ClusterScatter />
              </div>
            </ChartCard>
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
              <span className="text-xs font-semibold text-emerald-600 cursor-pointer">
                Explore full graph →
              </span>
            </div>
          </Panel>

          {/* 5. Governance */}
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
              <ChartCard
                chartKey="compliance"
                onClick={openChartDrawer}
                className="flex flex-col items-center gap-2"
              >
                <SubH>Policy Compliance</SubH>
                <div className="w-[100px]">
                  <SuccessDonut rate={96.2} label="Compliant" />
                </div>
                <span className="text-[11px] font-mono font-semibold text-emerald-600">
                  ↑ 2.4%
                </span>
                <span className="text-xs font-semibold text-emerald-600 cursor-pointer mt-2">
                  View compliance report →
                </span>
              </ChartCard>
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
              </div>
            </div>
          </Panel>
        </div>

        {/* ═══════ ROW 3: EAL + SLO ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Panel number="★" title="EAL Distribution & Autonomy Posture">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-5">
              {EAL_LEVELS.map((e) => (
                <div
                  key={e.num}
                  className={`rounded-lg border p-3 cursor-default ${e.active ? "border-emerald-400 bg-emerald-50/50" : "border-zinc-100 bg-zinc-50"}`}
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
              <ChartCard chartKey="ealTrend" onClick={openChartDrawer}>
                <SubH>EAL Transition Trend</SubH>
                <div className="h-[90px]">
                  <EALTrendChart />
                </div>
                <div className="flex justify-center gap-3 mt-2">
                  {[
                    { color: "#02DD82", label: "EAL 3" },
                    { color: "#A855F7", label: "EAL 4" },
                    { color: "#3B82F6", label: "EAL 2" },
                  ].map((l) => (
                    <span
                      key={l.label}
                      className="flex items-center gap-1.5 text-[11px] text-zinc-500"
                    >
                      <span
                        className="w-3 h-[3px] rounded"
                        style={{ background: l.color }}
                      />
                      {l.label}
                    </span>
                  ))}
                </div>
              </ChartCard>
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
                <span className="text-xs font-semibold text-emerald-600 cursor-pointer mt-3 inline-block">
                  View EAL policy settings →
                </span>
              </div>
            </div>
          </Panel>

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
            <ChartCard chartKey="sloBurn" onClick={openChartDrawer}>
              <SubH>Error Budget Burn Rate — Last 7 Days</SubH>
              <div className="h-[80px]">
                <BurnRateChart />
              </div>
              <div className="flex justify-center gap-3 mt-2">
                {[
                  { color: "#EF4444", label: "Search Svc" },
                  { color: "#F59E0B", label: "Payment API" },
                  { color: "#02DD82", label: "Checkout" },
                ].map((l) => (
                  <span
                    key={l.label}
                    className="flex items-center gap-1.5 text-[11px] text-zinc-500"
                  >
                    <span
                      className="w-3 h-[3px] rounded"
                      style={{ background: l.color }}
                    />
                    {l.label}
                  </span>
                ))}
              </div>
            </ChartCard>
            <span className="text-xs font-semibold text-emerald-600 cursor-pointer mt-3 inline-block">
              View all SLO reports →
            </span>
          </Panel>
        </div>

        {/* ═══════ ROW 4: Cost + Live Feed ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
              <ChartCard chartKey="costTrend" onClick={openChartDrawer}>
                <SubH>Monthly Cost Avoidance Trend</SubH>
                <div className="h-[120px]">
                  <CostTrendChart />
                </div>
                <div className="flex justify-center gap-3 mt-2">
                  {[
                    { color: "#02DD82", label: "Autonomous savings" },
                    { color: "#3B82F6", label: "Reduced escalations" },
                  ].map((l) => (
                    <span
                      key={l.label}
                      className="flex items-center gap-1.5 text-[11px] text-zinc-500"
                    >
                      <span
                        className="w-3 h-[3px] rounded"
                        style={{ background: l.color }}
                      />
                      {l.label}
                    </span>
                  ))}
                </div>
              </ChartCard>
            </div>
          </Panel>

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
                    className={`text-[11px] px-2 py-1 rounded-md capitalize transition-colors ${feedFilter === f ? "bg-zinc-200 text-zinc-800 font-semibold" : "text-zinc-500 hover:bg-zinc-100"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
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
            <div className="mt-3">
              <span className="text-xs font-semibold text-emerald-600 cursor-pointer">
                View full audit trail →
              </span>
            </div>
          </Panel>
        </div>

        {/* ═══════ ROW 5: Orchestration + Agents ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Panel number="6." title="Orchestration Evolution">
            <div className="grid grid-cols-1 sm:grid-cols-[1.1fr_1fr_0.92fr] gap-4">
              <ChartCard chartKey="orchTrend" onClick={openChartDrawer}>
                <SubH>Workflow Evolution Over Time</SubH>
                <div className="h-[120px]">
                  <OrchTrendChart />
                </div>
                <div className="flex justify-center gap-3 mt-2">
                  {[
                    { color: "#02DD82", label: "MTTR Improvement" },
                    { color: "#3B82F6", label: "Efficiency Gain" },
                  ].map((l) => (
                    <span
                      key={l.label}
                      className="flex items-center gap-1.5 text-[11px] text-zinc-500"
                    >
                      <span
                        className="w-3 h-[3px] rounded"
                        style={{ background: l.color }}
                      />
                      {l.label}
                    </span>
                  ))}
                </div>
              </ChartCard>
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
          </Panel>

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
                  <span className="text-xs font-semibold text-emerald-600 cursor-pointer">
                    View all agents →
                  </span>
                </div>
              </div>
              <ChartCard chartKey="agentAcc" onClick={openChartDrawer}>
                <SubH>Accuracy Over Time</SubH>
                <div className="h-[140px]">
                  <AgentAccuracyChart />
                </div>
              </ChartCard>
              <ChartCard
                chartKey="agentHealth"
                onClick={openChartDrawer}
                className="flex flex-col items-center gap-2"
              >
                <SubH>Agent Health</SubH>
                <div className="w-[90px]">
                  <SuccessDonut rate={90.4} label="Healthy" />
                </div>
                <span className="text-[11px] font-mono font-semibold text-emerald-600">
                  ↑ 4.2%
                </span>
                <span className="text-xs font-semibold text-emerald-600 cursor-pointer mt-2">
                  View agent health →
                </span>
              </ChartCard>
            </div>
          </Panel>
        </div>
      </main>

      {/* ═══════ EXPORT MODAL ═══════ */}
      <Modal isOpen={exportOpen} onClose={() => setExportOpen(false)}>
        <div className="p-4 space-y-5">
          <h2 className="text-base font-bold text-zinc-900">
            Export Intelligence Report
          </h2>
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
            {[
              "Learning Overview Dashboard",
              "Incident Memory & Clustering",
              "Remediation Intelligence",
              "Governance & Compliance",
              "EAL Distribution & Autonomy",
              "Cost & Engineering Hours Saved",
              "Agent Intelligence Detail",
            ].map((s) => (
              <label
                key={s}
                className="flex items-center gap-2.5 text-xs text-zinc-600 cursor-pointer py-1"
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

      {/* ═══════ SIDE DRAWER ═══════ */}
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
