"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { EalResult, Health, LEVEL } from "./serviceCatalog.data";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg bg-white p-5 shadow-sm shadow-light dark:bg-zinc-900/40",
        className,
      )}
    >
      {children}
    </div>
  );
}

const HEALTH_STYLE: Record<Health, string> = {
  Healthy:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  Warning:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  Critical: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
};
const HEALTH_DOT: Record<Health, string> = {
  Healthy: "bg-emerald-500",
  Warning: "bg-amber-500",
  Critical: "bg-rose-500",
};
export function HealthBadge({ health }: { health: Health }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold",
        HEALTH_STYLE[health],
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", HEALTH_DOT[health])} />
      {health}
    </span>
  );
}

export function TierBadge({ tier }: { tier: number }) {
  return (
    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-[11.5px] font-semibold text-black/60 dark:bg-zinc-800 dark:text-zinc-400">
      Tier {tier}
    </span>
  );
}

const EAL_STYLE: Record<number, string> = {
  0: "bg-zinc-100 text-black/60 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
  1: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
  2: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  3: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
  4: "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900",
};
export function EalPill({ eal, long }: { eal: EalResult; long?: boolean }) {
  if (eal.blocked) {
    return (
      <span className="inline-flex items-center rounded-md border border-rose-300 bg-rose-50 px-2 py-0.5 font-ibm text-[11px] font-bold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
        GATE BLOCKED
      </span>
    );
  }
  const lvl = LEVEL(eal.level);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-ibm text-[11px] font-bold",
        EAL_STYLE[eal.level],
      )}
    >
      {lvl.short}
      {long && <span className="font-ibm font-semibold">{lvl.name}</span>}
    </span>
  );
}

export function CardHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2">
      <h3 className="text-[14.5px] font-bold text-black dark:text-zinc-100">
        {title}
      </h3>
      {hint && (
        <span className="text-[12px] text-black/40 dark:text-zinc-500">
          {hint}
        </span>
      )}
    </div>
  );
}

export function KVRows({
  rows,
}: {
  rows: { k: string; v: React.ReactNode; tone?: "ok" | "warn" | "bad" }[];
}) {
  const TONE: Record<string, string> = {
    ok: "text-emerald-700 dark:text-emerald-400",
    warn: "text-amber-700 dark:text-amber-400",
    bad: "text-rose-700 dark:text-rose-400",
  };
  return (
    <div>
      {rows.map((row, i) => (
        <div
          key={row.k}
          className={cn(
            "flex items-center justify-between gap-4 py-2.5 text-[13px]",
            i !== rows.length - 1 &&
              "border-b border-zinc-100 dark:border-zinc-800",
          )}
        >
          <span className="text-black/60 dark:text-zinc-400">{row.k}</span>
          <span
            className={cn(
              "font-semibold text-black dark:text-zinc-100",
              row.tone && TONE[row.tone],
            )}
          >
            {row.v}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CheckList({
  items,
}: {
  items: { label: string; ok: boolean; note?: string }[];
}) {
  return (
    <ul className="space-y-2.5">
      {items.map((it) => (
        <li key={it.label} className="flex items-start gap-2.5 text-[13px]">
          <span
            className={cn(
              "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
              it.ok
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
            )}
          >
            {it.ok ? "✓" : "✕"}
          </span>
          <span>
            <span className="font-medium text-black dark:text-zinc-200">
              {it.label}
            </span>
            {it.note && (
              <span className="block text-[12px] text-black/50 dark:text-zinc-500">
                {it.note}
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function StatePill({
  label,
  cls,
}: {
  label: string;
  cls: "ok" | "warn" | "bad";
}) {
  const STYLE: Record<string, string> = {
    ok: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    warn: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    bad: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  };
  const DOT: Record<string, string> = {
    ok: "bg-emerald-500",
    warn: "bg-amber-500",
    bad: "bg-rose-500",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold",
        STYLE[cls],
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT[cls])} />
      {label}
    </span>
  );
}

export function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  tone?: "ok" | "warn" | "bad";
}) {
  const TONE: Record<string, string> = {
    ok: "text-emerald-700 dark:text-emerald-400",
    warn: "text-amber-700 dark:text-amber-400",
    bad: "text-rose-700 dark:text-rose-400",
  };
  return (
    <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 font-ibm text-[15px] font-bold text-black/90 dark:text-zinc-100",
        )}
      >
        {value}
      </div>
    </div>
  );
}

export function Section({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="scroll-mt-28">
      {children}
    </div>
  );
}

export function ReadinessRing({
  score,
  band,
  size = 112,
}: {
  score: number;
  band: string;
  size?: number;
}) {
  const r = (size - 20) / 2;
  const c = 2 * Math.PI * r;
  const color =
    band === "Ready"
      ? "#059669"
      : band === "Conditional"
        ? "#d97706"
        : "#e11d48";
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#E7EAF0"
        strokeWidth={10}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={c.toFixed(1)}
        strokeDashoffset={(c * (1 - score / 100)).toFixed(1)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2}
        y={size / 2 + 6}
        textAnchor="middle"
        fontFamily="monospace"
        fontSize={size / 4.3}
        fontWeight={700}
        fill="#0B1220"
      >
        {score}
      </text>
      <text
        x={size / 2}
        y={size / 2 + 20}
        textAnchor="middle"
        fontFamily="inherit"
        fontSize={10}
        fill="#8B93A1"
      >
        of 100
      </text>
    </svg>
  );
}
