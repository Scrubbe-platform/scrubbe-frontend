"use client";

import React from "react";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { colorOf, initOf, isAgent, type Presence } from "./liveWarRoom.data";

export function Avatar({ name, size = 22, showPresence, presence }: { name: string; size?: number; showPresence?: boolean; presence?: Presence }) {
  const ai = isAgent(name);
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <span
        className={cn("flex h-full w-full items-center justify-center rounded-full font-ibm font-bold text-white", ai && "bg-zinc-900 dark:bg-zinc-700")}
        style={{ fontSize: Math.max(8, size * 0.42), background: ai ? undefined : colorOf(name) }}
        title={name}
      >
        {ai ? <Bot size={Math.max(9, size * 0.55)} /> : initOf(name)}
      </span>
      {showPresence && (
        <span className={cn("absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-[1.5px] ring-white dark:ring-grayscrubbe-900", presence === "on" ? "bg-IMSLightGreen" : "bg-zinc-400")} />
      )}
    </span>
  );
}

export function SeverityPill({ sev }: { sev: string }) {
  const rank = Number(String(sev).replace(/[^0-9]/g, "")) || 2;
  const tones: Record<number, string> = {
    0: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    1: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    2: "bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300",
    3: "bg-zinc-50 text-zinc-500 dark:bg-white/5 dark:text-zinc-400",
  };
  return <span className={cn("inline-flex h-[22px] items-center rounded-md px-2 font-mono text-[11px] font-bold tracking-wide", tones[rank] ?? tones[2])}>{sev}</span>;
}
