"use client";

import React, { useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CATEGORIES,
  CategoryDef,
  TemplateRecord,
  computeMetrics,
  recentlyUpdated,
  USAGE_SPARKLINE_PATH,
} from "./incidentTemplates.data";

export default function Overview({
  templates,
  onViewAll,
  onNewTemplate,
  onOpenTemplate,
}: {
  templates: TemplateRecord[];
  onViewAll: () => void;
  onNewTemplate: () => void;
  onOpenTemplate: (name: string) => void;
}) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const metrics = computeMetrics(templates);
  const recent = recentlyUpdated(templates, 5);

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <p className="max-w-2xl text-[14px] leading-relaxed text-black/60 dark:text-zinc-400">
          Standardized response blueprints that define how Scrubbe orchestrates
          agents, prioritizes signals, enforces governance, and remediates
          recurring incidents.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={onViewAll}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-[13px] font-semibold text-black hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            View All Templates
          </button>
          <button
            onClick={onNewTemplate}
            className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-emerald-700"
          >
            <Plus size={15} /> New Template
          </button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard label="Total Templates" value={metrics.total} />
        <MetricCard
          label="Active"
          value={metrics.active}
          valueClassName="text-emerald-600"
        />
        <MetricCard
          label="Draft"
          value={metrics.draft}
          valueClassName="text-amber-600"
        />
        <MetricCard
          label="Archived"
          value={metrics.archived}
          valueClassName="text-black/30 dark:text-zinc-600"
        />
        <MetricCard label="Usage · 30 days" value={metrics.usage30.toLocaleString()}>
          <svg viewBox="0 0 140 28" className="mt-1 h-6 w-full overflow-visible">
            <path
              d={USAGE_SPARKLINE_PATH}
              fill="none"
              stroke="#10b981"
              strokeWidth={1.5}
            />
          </svg>
        </MetricCard>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard
          label="Resolution Improvement"
          value={
            <>
              41<span className="text-[14px]">%</span>
            </>
          }
          sub="↑ vs. manual response"
          subClassName="text-emerald-600"
        />
        <MetricCard
          label="Automation Coverage"
          value={
            <>
              82<span className="text-[14px]">%</span>
            </>
          }
        />
        <MetricCard label="Most Used" value={metrics.mostUsed?.name} valueSmall />
      </div>

      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[16px] font-bold text-black dark:text-zinc-100">
            Template Categories
          </h2>
          <span className="text-[12px] text-black/40 dark:text-zinc-500">
            {CATEGORIES.length} categories · click to expand
          </span>
        </div>
        <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.name}
              cat={cat}
              open={openCategory === cat.name}
              onToggle={() =>
                setOpenCategory((c) => (c === cat.name ? null : cat.name))
              }
              onSelectItem={onOpenTemplate}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[16px] font-bold text-black dark:text-zinc-100">
            Recently Updated
          </h2>
          <span className="text-[12px] text-black/40 dark:text-zinc-500">
            {recent.length} templates changed this week
          </span>
        </div>
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40">
          {recent.map((t, i) => (
            <button
              key={t.name}
              onClick={() => onOpenTemplate(t.name)}
              className={cn(
                "flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/40",
                i !== recent.length - 1 &&
                  "border-b border-zinc-100 dark:border-zinc-800",
              )}
            >
              <div className="min-w-0">
                <div className="truncate text-[13.5px] font-bold text-black dark:text-zinc-100">
                  {t.name}
                </div>
                <div className="text-[11.5px] text-black/40 dark:text-zinc-500">
                  {t.cat}
                </div>
              </div>
              <span className="shrink-0 font-mono text-[12px] text-black/40 dark:text-zinc-500">
                {t.updated}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  valueClassName,
  sub,
  subClassName,
  valueSmall,
  children,
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
  sub?: string;
  subClassName?: string;
  valueSmall?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
      <span className="text-[11.5px] font-medium uppercase tracking-wide text-black/40 dark:text-zinc-500">
        {label}
      </span>
      <span
        className={cn(
          "font-mono text-[24px] font-bold tracking-tight text-black dark:text-zinc-100",
          valueSmall && "truncate font-sans text-[16px]",
          valueClassName,
        )}
      >
        {value}
      </span>
      {sub && (
        <span className={cn("text-[11.5px] font-semibold", subClassName)}>
          {sub}
        </span>
      )}
      {children}
    </div>
  );
}

function CategoryCard({
  cat,
  open,
  onToggle,
  onSelectItem,
}: {
  cat: CategoryDef;
  open: boolean;
  onToggle: () => void;
  onSelectItem: (name: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-[13.5px] font-bold text-black dark:text-zinc-100">
            {cat.name}
          </span>
          <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-black/50 dark:bg-zinc-800 dark:text-zinc-400">
            {cat.items.length}
          </span>
        </span>
        <ChevronRight
          size={15}
          className={cn(
            "shrink-0 text-black/30 transition-transform dark:text-zinc-600",
            open && "rotate-90",
          )}
        />
      </button>
      {open && (
        <ul className="border-t border-zinc-100 px-3.5 py-2.5 dark:border-zinc-800">
          {cat.items.map((item) => (
            <li key={item}>
              <button
                onClick={() => onSelectItem(item)}
                className="flex w-full items-center gap-2 rounded py-1.5 text-left text-[13px] text-black/60 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                <span className="h-1 w-1 shrink-0 rounded-full bg-black/30 dark:bg-zinc-600" />
                {item}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
