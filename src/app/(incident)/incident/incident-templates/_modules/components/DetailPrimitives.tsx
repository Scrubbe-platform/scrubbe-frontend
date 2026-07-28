"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
        "rounded-lg bg-white p-6 shadow-sm shadow-light dark:bg-zinc-900/60",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="text-[15px] font-bold text-black dark:text-zinc-100">{title}</h2>
      {hint && (
        <span className="text-[12px] text-black/40 dark:text-zinc-500">{hint}</span>
      )}
    </div>
  );
}

export function KVRows({
  rows,
}: {
  rows: [string, React.ReactNode, ("yes" | "no" | "danger" | undefined)?][];
}) {
  return (
    <div>
      {rows.map(([k, v, tone], i) => (
        <div
          key={k}
          className={cn(
            "flex items-center justify-between gap-4 py-3 text-[13.5px]",
            i !== rows.length - 1 && "border-b border-zinc-100 dark:border-zinc-800",
          )}
        >
          <span className="text-black/60 dark:text-zinc-400">{k}</span>
          <span
            className={cn(
              "font-semibold text-black dark:text-zinc-100",
              tone === "yes" && "text-emerald-600 dark:text-emerald-400",
              tone === "no" && "text-black/40 dark:text-zinc-500",
              tone === "danger" && "text-rose-600 dark:text-rose-400",
            )}
          >
            {v}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((c) => (
        <li
          key={c}
          className="flex items-center gap-2.5 text-[13.5px] text-black dark:text-zinc-200"
        >
          <Check size={15} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
          {c}
        </li>
      ))}
    </ul>
  );
}

export function Chip({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[12.5px] font-medium text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200",
        onClick && "hover:border-emerald-400 hover:text-emerald-600",
        className,
      )}
    >
      {children}
    </Comp>
  );
}

export function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "yes";
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 font-mono text-[17px] font-bold text-black dark:text-zinc-100",
          tone === "yes" && "text-emerald-600 dark:text-emerald-400",
        )}
      >
        {value}
      </div>
    </div>
  );
}

export function RankList({ items }: { items: string[] }) {
  return (
    <ol className="flex flex-col">
      {items.map((s, i) => (
        <li
          key={s}
          className={cn(
            "flex items-center gap-3 py-2.5 text-[13px] text-black dark:text-zinc-200",
            i !== items.length - 1 && "border-b border-zinc-100 dark:border-zinc-800",
          )}
        >
          <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md bg-zinc-100 font-mono text-[11px] font-bold text-black/50 dark:bg-zinc-800 dark:text-zinc-400">
            {i + 1}
          </span>
          {s}
        </li>
      ))}
    </ol>
  );
}
