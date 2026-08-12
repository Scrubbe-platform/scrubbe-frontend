"use client";

import React from "react";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { colorOf, initOf, isAgent, sevRank, type Severity, type WarRoomStatus } from "./warRoomLibrary.data";

export function SeverityPill({ sev }: { sev: Severity }) {
  const rank = sevRank(sev);
  const tones: Record<number, string> = {
    0: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    1: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    2: "bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300",
    3: "bg-zinc-50 text-zinc-500 dark:bg-white/5 dark:text-zinc-400",
  };
  return <span className={cn("inline-flex h-5 items-center rounded-md px-2 font-mono text-[11px] font-bold tracking-wide", tones[rank])}>{sev}</span>;
}

export function StatusBadge({ status }: { status: WarRoomStatus }) {
  const resolved = status === "resolved";
  return (
    <span className={cn(
      "inline-flex h-[22px] items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold",
      resolved ? "bg-IMSLightGreen/10 text-IMSLightGreen border-IMSLightGreen/25" : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/25",
    )}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {resolved ? "Resolved" : "Monitoring"}
    </span>
  );
}

export function PersonAvatar({ name, size = 21 }: { name: string; size?: number }) {
  const ai = isAgent(name);
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-ibm font-bold text-white", ai ? "bg-zinc-900 dark:bg-zinc-700" : "")}
      style={{ width: size, height: size, fontSize: Math.max(8, size * 0.42), background: ai ? undefined : colorOf(name) }}
      title={name}
    >
      {ai ? <Bot size={Math.max(9, size * 0.55)} /> : initOf(name)}
    </span>
  );
}

export function AvatarStack({ names, size = 21, max = 6 }: { names: string[]; size?: number; max?: number }) {
  const shown = names.slice(0, max);
  const overflow = names.length - shown.length;
  return (
    <span className="flex items-center">
      {shown.map((n, i) => (
        <span key={n + i} className="rounded-full ring-2 ring-white dark:ring-grayscrubbe-900" style={{ marginLeft: i === 0 ? 0 : -6 }}>
          <PersonAvatar name={n} size={size} />
        </span>
      ))}
      {overflow > 0 && <span className="ml-1.5 text-[11.5px] font-semibold text-zinc-400">+{overflow}</span>}
    </span>
  );
}

export function KpiTile({ label, value, sub, dot }: { label: string; value: React.ReactNode; sub: string; dot?: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-grayscrubbe-900 p-3.5 shadow-sm">
      <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot }} />}
        {label}
      </div>
      <div className="mt-1.5 font-mono text-2xl font-bold tracking-tight tabular-nums">{value}</div>
      <div className="text-[11.5px] text-zinc-400">{sub}</div>
    </div>
  );
}

export function TypeTag({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex min-w-[64px] shrink-0 items-center justify-center rounded-md border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 px-1.5 py-0.5 text-center font-mono text-[9.5px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{children}</span>;
}
