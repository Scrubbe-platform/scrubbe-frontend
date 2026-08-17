// components/ICP/shared.tsx
"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

// ── Panel with optional Expand & explain button, and a collapsible body ──

export function Panel({
  number,
  title,
  children,
  className,
  onExpand,
  defaultOpen = false,
}: {
  number?: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  onExpand?: () => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`bg-white dark:bg-zinc-900/40 rounded-xl shadow-sm shadow-light p-5 ${className || ""}`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex w-full items-center gap-2 text-left ${open ? "mb-4" : ""}`}
      >
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-100 flex items-center gap-2 flex-1">
          {number && (
            <span className="text-emerald-600 font-mono text-xs">{number}</span>
          )}
          {title}
        </h2>
        <ChevronDown
          size={16}
          className={`shrink-0 text-zinc-400 dark:text-zinc-500 transition-transform ${open ? "" : "-rotate-90"}`}
        />
      </button>

      {open && (
        <>
          {onExpand && (
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={onExpand}
                className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1.5 rounded-lg hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors shrink-0"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="12"
                  height="12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
                Expand & explain
              </button>
            </div>
          )}
          {children}
        </>
      )}
    </div>
  );
}

export function SubH({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 mb-2.5">
      {children}
    </h3>
  );
}

export function Pill({
  children,
  color = "grey",
}: {
  children: React.ReactNode;
  color?: string;
}) {
  const styles: Record<string, string> = {
    green: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400",
    red: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400",
    blue: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400",
    grey: "bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-500",
  };
  return (
    <span
      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${styles[color]}`}
    >
      {children}
    </span>
  );
}

export function MiniBar({ pct }: { pct: number }) {
  return (
    <span className="inline-block w-12 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden align-middle">
      <span
        className="block h-full rounded-full bg-emerald-400"
        style={{ width: `${pct}%` }}
      />
    </span>
  );
}

export function ChartCard({
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
      className={`cursor-pointer transition-all hover:ring-1 hover:ring-emerald-200 dark:hover:ring-emerald-500/30 rounded-lg ${className || ""}`}
    >
      {children}
    </div>
  );
}

export function LinkAction({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold text-emerald-600 cursor-pointer hover:text-emerald-700">
      {children}
    </span>
  );
}

export const sevColors: Record<string, string> = {
  P0: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-800/40",
  P1: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-800/40",
  P2: "text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-800/40",
  P3: "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-800/40",
};

export const sloStatusStyles: Record<string, { pill: string; color: string }> =
  {
    healthy: { pill: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", color: "#02DD82" },
    warn: { pill: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400", color: "#F59E0B" },
    breach: { pill: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400", color: "#EF4444" },
  };

export const govEventDot: Record<string, string> = {
  deny: "bg-red-400",
  ok: "bg-emerald-400",
  info: "bg-blue-400",
};
export const feedDot: Record<string, string> = {
  remediation: "bg-emerald-400",
  governance: "bg-amber-400",
  agent: "bg-blue-400",
};
