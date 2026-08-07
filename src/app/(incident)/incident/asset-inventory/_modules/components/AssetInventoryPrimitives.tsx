"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { Compliance, Health, Risk } from "./assetInventory.data";

/* ───────────────────── badges ───────────────────── */

const TONE: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  red: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  blue: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
  neutral: "bg-zinc-100 text-black/60 dark:bg-zinc-800 dark:text-zinc-400",
};
const DOT: Record<string, string> = {
  green: "bg-emerald-500", amber: "bg-amber-500", red: "bg-rose-500", blue: "bg-sky-500", neutral: "bg-zinc-400",
};

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof TONE; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold", TONE[tone])}>
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT[tone])} />
      {children}
    </span>
  );
}

export function HealthBadge({ health }: { health: Health }) {
  const tone = health === "Healthy" ? "green" : health === "Degraded" ? "amber" : "red";
  return <Badge tone={tone}>{health}</Badge>;
}
export function RiskBadge({ risk }: { risk: Risk }) {
  const tone = risk === "Low" ? "green" : risk === "Medium" ? "blue" : risk === "High" ? "amber" : "red";
  return <Badge tone={tone}>{risk}</Badge>;
}
export function ComplianceBadge({ compliance }: { compliance: Compliance }) {
  const tone = compliance === "Compliant" ? "green" : compliance === "Violating" ? "red" : "neutral";
  return <Badge tone={tone}>{compliance}</Badge>;
}

/* ───────────────────── layout ───────────────────── */

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-lg bg-white p-5 shadow-sm shadow-light dark:bg-zinc-900/40", className)}>
      {children}
    </div>
  );
}

export function SectionAnchor({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-28">
      {children}
    </div>
  );
}

export function PanelHead({ title, hint, action }: { title: React.ReactNode; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3.5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="flex items-center gap-2 text-[14.5px] font-bold text-black dark:text-zinc-100">{title}</h3>
        {hint && <p className="mt-0.5 text-[12px] text-black/50 dark:text-zinc-500">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatTile({
  label, value, tone,
}: { label: string; value: React.ReactNode; tone?: "accent" | "warn" | "crit" }) {
  const border =
    tone === "accent" ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-500/10"
    : tone === "warn" ? "border-amber-300 dark:border-amber-800"
    : tone === "crit" ? "border-rose-300 dark:border-rose-800"
    : "border-zinc-200 dark:border-zinc-700";
  const valueColor =
    tone === "accent" ? "text-emerald-700 dark:text-emerald-400"
    : tone === "warn" ? "text-amber-600"
    : tone === "crit" ? "text-rose-600"
    : "text-black dark:text-zinc-100";
  return (
    <div className={cn("rounded-md border bg-white p-3.5 dark:bg-zinc-900/60", border)}>
      <div className="text-[12px] font-medium text-black/50 dark:text-zinc-500">{label}</div>
      <div className={cn("mt-1.5 font-ibm text-[21px] font-bold leading-none tracking-tight", valueColor)}>{value}</div>
    </div>
  );
}

/* ───────────────────── row-style lists ───────────────────── */

export function DistRow({
  label, color, n, total, onClick,
}: { label: string; color: string; n: number; total: number; onClick?: () => void }) {
  const pct = total > 0 ? Math.round((n / total) * 100) : 0;
  const Comp: any = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      type={onClick ? "button" : undefined}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-1 py-2 text-left",
        onClick && "hover:bg-zinc-50 dark:hover:bg-zinc-800/60",
      )}
    >
      <span className="flex w-[130px] shrink-0 items-center gap-2 text-[12.5px] font-semibold text-black dark:text-zinc-200">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
        {label}
      </span>
      <span className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </span>
      <span className="w-12 shrink-0 text-right font-ibm text-[12.5px] font-semibold text-black dark:text-zinc-200">{n}</span>
    </Comp>
  );
}

export function ListRow({
  onClick, icon, tone = "neutral", title, note, right,
}: {
  onClick?: () => void;
  icon?: React.ReactNode;
  tone?: keyof typeof TONE;
  title: React.ReactNode;
  note?: React.ReactNode;
  right?: React.ReactNode;
}) {
  const Comp: any = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      type={onClick ? "button" : undefined}
      className={cn(
        "flex w-full items-center gap-3 border-b border-zinc-100 py-2.5 text-left last:border-b-0 dark:border-zinc-800",
        onClick && "rounded-md px-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60",
      )}
    >
      {icon && (
        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md", TONE[tone])}>
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold text-black dark:text-zinc-200">{title}</div>
        {note && <div className="truncate text-[12px] text-black/50 dark:text-zinc-500">{note}</div>}
      </div>
      {right}
    </Comp>
  );
}

export function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-zinc-200 py-8 text-center text-[12.5px] text-black/40 dark:border-zinc-700 dark:text-zinc-500">
      {children}
    </div>
  );
}

/* ───────────────────── switch ───────────────────── */

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-[42px] shrink-0 rounded-full transition-colors",
        checked ? "bg-IMSDarkGreen" : "bg-zinc-300 dark:bg-zinc-700",
      )}
    >
      <span className={cn("absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", checked && "translate-x-[18px]")} />
    </button>
  );
}

/* ───────────────────── chips ───────────────────── */

export function Chip({
  active, onClick, children,
}: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors",
        active
          ? "border-IMSDarkGreen bg-IMSDarkGreen text-white"
          : "border-zinc-200 bg-white text-black/70 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
      )}
    >
      {children}
    </button>
  );
}
