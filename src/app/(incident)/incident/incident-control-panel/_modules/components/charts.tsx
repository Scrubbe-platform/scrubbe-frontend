// components/ICP/charts.tsx
"use client";

import React from "react";
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
import { CATEGORIES, REMEDIATIONS, AGENTS } from "../libs/data";

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

const NO_LEGEND = { display: false } as const;
const GRID_OFF = { display: false } as const;
const GRID_SOFT = { color: "#F1F5F9", drawBorder: false } as const;
const TICK = { font: { size: 9 as number }, color: "#94A3B8" };

// ── Sparkline (KPI tiles) ────────────────────────────────────────

export function Sparkline({
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

// ── KPI detail (big sparkline in the drawer) ─────────────────────

export function KPIDetailChart({
  data,
  color,
}: {
  data: number[];
  color: string;
}) {
  return (
    <div className="h-[180px]">
      <Line
        data={{
          labels: data.map((_, i) => `W${i + 1}`),
          datasets: [
            {
              data,
              borderColor: color,
              borderWidth: 2.5,
              tension: 0.4,
              fill: true,
              backgroundColor: color + "18",
              pointRadius: 3,
              pointBackgroundColor: color,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: NO_LEGEND },
          scales: {
            x: { grid: GRID_OFF, ticks: TICK },
            y: { grid: GRID_SOFT, ticks: TICK },
          },
        }}
      />
    </div>
  );
}

// ── MTTR Trend ───────────────────────────────────────────────────

export function MTTRChart({ big }: { big?: boolean }) {
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
                position: "bottom" as const,
                labels: { boxWidth: 12, font: { size: 11 } },
              }
            : NO_LEGEND,
          tooltip: { mode: "index" as const, intersect: false },
        },
        scales: {
          x: { grid: GRID_OFF, ticks: { ...TICK, maxRotation: 0 } },
          y: { grid: GRID_SOFT, ticks: TICK, beginAtZero: true },
        },
      }}
    />
  );
}

// ── Category Donut ───────────────────────────────────────────────

export function CategoryDonut({ big }: { big?: boolean }) {
  return (
    <Doughnut
      data={{
        labels: CATEGORIES.map((c) => c.name),
        datasets: [
          {
            data: CATEGORIES.map((c) => c.pct),
            backgroundColor: CATEGORIES.map((c) => c.color),
            borderWidth: 0,
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

// ── Effectiveness Bar ────────────────────────────────────────────

export function EffectivenessChart({ big }: { big?: boolean }) {
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
        indexAxis: "y" as const,
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
            ticks: { ...TICK, callback: (v) => v + "%" },
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

// ── Cluster Scatter ──────────────────────────────────────────────

export function ClusterScatter({ big }: { big?: boolean }) {
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

// ── Success / Compliance / Health Donut ───────────────────────────

export function SuccessDonut({
  rate = 87.6,
  big,
}: {
  rate?: number;
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

// ── EAL Trend ────────────────────────────────────────────────────

export function EALTrendChart({ big }: { big?: boolean }) {
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
                position: "bottom" as const,
                labels: { boxWidth: 12, font: { size: 11 } },
              }
            : NO_LEGEND,
        },
        scales: {
          x: { grid: GRID_OFF, ticks: TICK },
          y: { grid: GRID_SOFT, beginAtZero: true, ticks: TICK },
        },
      }}
    />
  );
}

// ── SLO Burn Rate ────────────────────────────────────────────────

export function BurnRateChart({ big }: { big?: boolean }) {
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
                position: "bottom" as const,
                labels: { boxWidth: 12, font: { size: 11 } },
              }
            : NO_LEGEND,
        },
        scales: {
          x: { grid: GRID_OFF, ticks: TICK },
          y: { grid: GRID_SOFT, min: 0, max: 5, ticks: TICK },
        },
      }}
    />
  );
}

// ── Cost Trend ───────────────────────────────────────────────────

export function CostTrendChart({ big }: { big?: boolean }) {
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
                position: "bottom" as const,
                labels: { boxWidth: 12, font: { size: 11 } },
              }
            : NO_LEGEND,
        },
        scales: {
          x: { grid: GRID_OFF, ticks: TICK },
          y: {
            grid: GRID_SOFT,
            beginAtZero: true,
            ticks: { ...TICK, callback: (v) => "$" + v + "K" },
          },
        },
      }}
    />
  );
}

// ── Orchestration Trend ──────────────────────────────────────────

export function OrchTrendChart({ big }: { big?: boolean }) {
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
                position: "bottom" as const,
                labels: { boxWidth: 12, font: { size: 11 } },
              }
            : NO_LEGEND,
        },
        scales: {
          x: { grid: GRID_OFF, ticks: TICK },
          y: {
            grid: GRID_SOFT,
            beginAtZero: true,
            ticks: { ...TICK, callback: (v) => v + "%" },
          },
        },
      }}
    />
  );
}

// ── Agent Accuracy Trend ─────────────────────────────────────────

export function AgentAccuracyChart({ big }: { big?: boolean }) {
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
                position: "bottom" as const,
                labels: { boxWidth: 12, font: { size: 10 } },
              }
            : NO_LEGEND,
        },
        scales: {
          x: { grid: GRID_OFF, ticks: TICK },
          y: {
            grid: GRID_SOFT,
            min: 75,
            max: 100,
            ticks: { ...TICK, callback: (v) => v + "%" },
          },
        },
      }}
    />
  );
}

// ── Legend row helper ────────────────────────────────────────────

export function ChartLegend({
  items,
}: {
  items: { color: string; label: string }[];
}) {
  return (
    <div className="flex justify-center gap-3 mt-2">
      {items.map((l) => (
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
  );
}
