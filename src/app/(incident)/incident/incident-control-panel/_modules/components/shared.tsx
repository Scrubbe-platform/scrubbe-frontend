// components/ICP/shared.tsx
"use client";

import React from "react";

export function Panel({
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

export function SubH({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2.5">
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

export function MiniBar({ pct }: { pct: number }) {
  return (
    <span className="inline-block w-12 h-1.5 bg-zinc-100 rounded-full overflow-hidden align-middle">
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
      className={`cursor-pointer transition-all hover:ring-1 hover:ring-emerald-200 rounded-lg ${className || ""}`}
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
  P0: "text-red-600 bg-red-50 border-red-200",
  P1: "text-amber-700 bg-amber-50 border-amber-200",
  P2: "text-yellow-700 bg-yellow-50 border-yellow-200",
  P3: "text-blue-700 bg-blue-50 border-blue-200",
};

export const sloStatusStyles: Record<string, { pill: string; color: string }> =
  {
    healthy: { pill: "bg-emerald-50 text-emerald-700", color: "#02DD82" },
    warn: { pill: "bg-amber-50 text-amber-700", color: "#F59E0B" },
    breach: { pill: "bg-red-50 text-red-700", color: "#EF4444" },
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
