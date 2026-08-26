"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Box,
  CheckCircle2,
  FileText,
  Info,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─────────────────────────────────────────────────────────────────
// Illustrative MTTR trend data
// ─────────────────────────────────────────────────────────────────

const MTTR_DATA = [
  { date: "Apr 21", minutes: 112 },
  { date: "Apr 28", minutes: 78 },
  { date: "May 5", minutes: 48 },
  { date: "May 12", minutes: 40 },
  { date: "May 19", minutes: 15 },
  { date: "May 26", minutes: 22 },
  { date: "Jun 2", minutes: 10 },
  { date: "Jun 9", minutes: 6 },
  { date: "Jun 16", minutes: 8 },
];

const STATS = [
  {
    label: "Total Incidents",
    value: "12,847",
    icon: AlertTriangle,
    iconColor: "#d97706",
    iconBg: "#fef3c7",
    trend: "+8.2% vs last month",
  },
  {
    label: "Open",
    value: "6",
    icon: CheckCircle2,
    iconColor: "#2563eb",
    iconBg: "#dbeafe",
  },
  {
    label: "Resolve Incidents",
    value: "12,612",
    icon: Box,
    iconColor: "#16a34a",
    iconBg: "#dcfce7",
  },
  {
    label: "Major Incidents",
    value: "163",
    icon: FileText,
    iconColor: "#7c3aed",
    iconBg: "#ede9fe",
  },
];

const RANGES = ["7d", "30d", "90d", "1y"] as const;

// ─────────────────────────────────────────────────────────────────
// Custom tooltip — matches the "Jun 16, 2024 / Mttr / 00:43 / minutes" card
// ─────────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const minutes = payload[0].value as number;
  const mm = String(Math.floor(minutes)).padStart(2, "0");
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 min-w-[140px]">
      <p className="text-[12px] text-gray-500 mb-1">{label}, 2024</p>
      <p className="text-[12px] font-semibold text-gray-700 mb-0.5">Mttr</p>
      <p className="text-[20px] font-bold text-emerald-600 leading-none mb-1">
        00:{mm}
      </p>
      <p className="text-[11px] text-gray-400">minutes</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Coded dashboard preview — recreated from the MTTR1.png mockup
// ─────────────────────────────────────────────────────────────────

function MttrDashboard() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("90d");

  return (
    <div className="w-full h-full bg-white p-6 md:p-8 flex flex-col">
      {/* Logo */}
      <div className="relative w-[130px] h-8 mb-6 shrink-0">
        <img
          src="/IMS/blacklogo.png"
          alt="Scrubbe"
          className="object-contain h-full"
        />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="border border-gray-200 rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-[12.5px] text-gray-500">{s.label}</span>
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: s.iconBg }}
                >
                  <Icon size={14} style={{ color: s.iconColor }} />
                </div>
              </div>
              <p className="text-[22px] font-bold text-black leading-none">
                {s.value}
              </p>
              {s.trend && (
                <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-[10.5px] font-semibold bg-emerald-100 text-emerald-700 whitespace-nowrap">
                  <ArrowUpRight size={11} className="shrink-0" />
                  {s.trend}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Chart card */}
      <div className="border border-gray-200 rounded-xl p-4 md:p-5 flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-bold text-black">
              Mttr (Minutes)
            </span>
            <Info size={13} className="text-gray-400" />
          </div>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className="px-3 py-1.5 text-[12px] font-semibold border-none cursor-pointer transition-colors"
                style={{
                  background: range === r ? "#111827" : "white",
                  color: range === r ? "white" : "#374151",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={MTTR_DATA}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="mttrFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke="#16a34a"
                strokeWidth={2}
                fill="url(#mttrFill)"
                dot={{ r: 3, stroke: "#16a34a", strokeWidth: 1, fill: "#16a34a" }}
                activeDot={{
                  r: 5,
                  stroke: "#111827",
                  strokeWidth: 2,
                  fill: "white",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default function MttrSection() {
  return (
    <section className="w-full py-16 px-6 bg-white">
      <div className="max-w-[1480px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left — wave background with headline + CTA */}
        <div
          className="relative rounded-2xl overflow-hidden flex flex-col justify-center px-10 py-14 md:px-14 min-h-[500px]"
          style={{
            backgroundImage: "url(/IMS/MTTR2.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <h2 className="font-serif font-bold text-white leading-[1.1] text-[clamp(32px,3.4vw,48px)] max-w-[420px]">
              Resolving Incidents Faster Everyday
            </h2>
            <p className="mt-5 text-[15px] text-white/85 leading-relaxed max-w-[380px]">
              Track how scrubbe reduces MTTR and resolves more incident over
              time
            </p>
            <button className="mt-9 px-6 py-3.5 rounded-lg bg-white text-black font-semibold text-[14.5px] cursor-pointer border-none hover:brightness-95 transition-all">
              Get Started
            </button>
          </div>
        </div>

        {/* Right — coded dashboard preview */}
        <div className="relative rounded-2xl overflow-hidden min-h-[500px] border border-gray-200">
          <MttrDashboard />
        </div>
      </div>
    </section>
  );
}
