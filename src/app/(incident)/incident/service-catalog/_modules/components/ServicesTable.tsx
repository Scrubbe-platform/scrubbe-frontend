"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, MoreVertical, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import Select from "@/components/ui/select";
import Modal from "@/components/ui/Modal";
import { EalPill, HealthBadge, TierBadge } from "./ServiceCatalogPrimitives";
import { ExportModal } from "./ExportModal";
import {
  CLOUDS,
  ENVIRONMENTS,
  OWNERS,
  RUNTIMES,
  SERVICES,
  ServiceRecord,
  ealOf,
  readiness,
} from "./serviceCatalog.data";
import { downloadCsv, servicesToCsv } from "./csv";

const SORT_OPTIONS = [
  { value: "name", label: "Name (A–Z)" },
  { value: "readiness_desc", label: "Automation readiness (high to low)" },
  { value: "readiness_asc", label: "Automation readiness (low to high)" },
  { value: "level_desc", label: "Automation level (high to low)" },
  { value: "health", label: "Health (critical first)" },
];
const HEALTH_ORDER: Record<string, number> = {
  Critical: 0,
  Warning: 1,
  Healthy: 2,
};

export interface ServicesFilterPreset {
  search?: string;
  eal?: string;
  readiness?: string;
  owner?: string;
  health?: string;
  tier?: string;
  env?: string;
  runtime?: string;
  cloud?: string;
}

const PAGE_SIZE = 10;

interface FilterDef {
  key: keyof ServicesFilterPreset;
  label: string;
  opts: string[];
}
const FILTER_DEFS: FilterDef[] = [
  {
    key: "readiness",
    label: "Automation readiness",
    opts: ["Ready", "Conditional", "Not ready"],
  },
  {
    key: "eal",
    label: "Automation level",
    opts: ["Gate blocked", "L0", "L1", "L2", "L3", "L4"],
  },
  { key: "env", label: "Environment", opts: ENVIRONMENTS },
  { key: "owner", label: "Owner", opts: [...OWNERS, "Unassigned"] },
  { key: "health", label: "Health", opts: ["Healthy", "Warning", "Critical"] },
  {
    key: "tier",
    label: "Criticality",
    opts: ["Tier 0", "Tier 1", "Tier 2", "Tier 3"],
  },
  { key: "runtime", label: "Runtime", opts: RUNTIMES },
  { key: "cloud", label: "Cloud", opts: CLOUDS },
];

function fval(s: ServiceRecord, key: FilterDef["key"]): string {
  if (key === "tier") return "Tier " + s.tier;
  if (key === "readiness") return readiness(s).band;
  if (key === "eal") {
    const e = ealOf(s);
    return e.blocked ? "Gate blocked" : "L" + e.level;
  }
  return String((s as unknown as Record<string, unknown>)[key] ?? "");
}

export default function ServicesTable({
  initialPreset,
  onNewService,
  onOpenServiceDetail,
  onBackToOverview,
}: {
  initialPreset?: ServicesFilterPreset;
  onNewService: () => void;
  onOpenServiceDetail: (name: string) => void;
  onBackToOverview: () => void;
}) {
  const [search, setSearch] = useState(initialPreset?.search ?? "");
  const [filters, setFilters] = useState<Record<string, Set<string>>>(() => {
    const init: Record<string, Set<string>> = {};
    FILTER_DEFS.forEach((d) => (init[d.key] = new Set()));
    if (initialPreset) {
      FILTER_DEFS.forEach((d) => {
        const v = initialPreset[d.key];
        if (v) init[d.key] = new Set([v]);
      });
    }
    return init;
  });
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState("name");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    if (!menuFor) return;
    const close = () => setMenuFor(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuFor]);

  function toggleGroup(key: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }
  function toggleFilterValue(key: string, value: string) {
    setFilters((prev) => {
      const next = { ...prev, [key]: new Set(prev[key]) };
      if (next[key].has(value)) next[key].delete(value);
      else next[key].add(value);
      return next;
    });
    setPage(1);
  }
  function clearAllFilters() {
    const cleared: Record<string, Set<string>> = {};
    FILTER_DEFS.forEach((d) => (cleared[d.key] = new Set()));
    setFilters(cleared);
    setSearch("");
    setPage(1);
    toast.info("Filters cleared");
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SERVICES.filter((s) => {
      for (const def of FILTER_DEFS) {
        const set = filters[def.key];
        if (set.size && !set.has(fval(s, def.key))) return false;
      }
      if (!q) return true;
      return [s.name, s.id, s.owner, s.env, s.runtime, s.cloud, s.lang]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [search, filters]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sortKey) {
      case "readiness_desc":
        list.sort((a, b) => readiness(b).score - readiness(a).score);
        break;
      case "readiness_asc":
        list.sort((a, b) => readiness(a).score - readiness(b).score);
        break;
      case "level_desc":
        list.sort((a, b) => {
          const ea = ealOf(a),
            eb = ealOf(b);
          return (eb.blocked ? -1 : eb.level) - (ea.blocked ? -1 : ea.level);
        });
        break;
      case "health":
        list.sort((a, b) => HEALTH_ORDER[a.health] - HEALTH_ORDER[b.health]);
        break;
      default:
        list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [filtered, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleSelectAllOnPage() {
    const allSelected = pageRows.every((s) => selected.has(s.id));
    setSelected((prev) => {
      const next = new Set(prev);
      pageRows.forEach((s) =>
        allSelected ? next.delete(s.id) : next.add(s.id),
      );
      return next;
    });
  }

  const pageNumbers = useMemo(() => {
    const windowSize = 6;
    let start = Math.max(1, safePage - Math.floor(windowSize / 2));
    const end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [safePage, totalPages]);

  return (
    <div className="mx-auto max-w-[1600px] p-4 font-ibm sm:p-6">
      <div className="mb-2 flex items-center gap-1.5 text-[12.5px] text-black/40 dark:text-zinc-500">
        <button
          onClick={onBackToOverview}
          className="hover:text-black dark:hover:text-zinc-200"
        >
          Overview
        </button>
        <ChevronRight size={13} />
        <span className="font-semibold text-black dark:text-zinc-200">
          Services
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-black dark:text-zinc-100">
            Services
          </h1>
          <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-black/60 dark:text-zinc-400">
            Every service registered in the catalog, continuously synchronized
            from Kubernetes, cloud providers, source control, and the Signal
            Graph.
          </p>
        </div>
        <button
          onClick={onNewService}
          className="shrink-0 rounded-md bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-IMSLightGreen"
        >
          + Add service
        </button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <div className="relative w-full max-w-[420px]">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40 dark:text-zinc-500"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search services, owners, repositories…"
            className="h-[42px] w-full rounded-md border border-zinc-300 bg-white pl-9 pr-3 text-[13.5px] text-black placeholder:text-black/40 focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          />
        </div>
        <button
          onClick={() => setExportOpen(true)}
          className="rounded-md border border-zinc-300 bg-white px-3.5 py-2.5 text-[13px] font-semibold text-black hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          Export
        </button>
        <span className="ml-auto text-[12.5px] text-black/40 dark:text-zinc-500">
          {filtered.length} of {SERVICES.length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[224px_1fr] lg:items-start">
        <aside className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
          <h3 className="mb-2 text-[13px] font-bold text-black dark:text-zinc-100">
            Filters
          </h3>
          {FILTER_DEFS.map((def) => {
            const open = openGroups.has(def.key);
            const activeCount = filters[def.key]?.size ?? 0;
            return (
              <div
                key={def.key}
                className="border-b border-zinc-100 py-2.5 last:border-b-0 dark:border-zinc-800"
              >
                <button
                  onClick={() => toggleGroup(def.key)}
                  className="flex w-full items-center gap-2 text-left text-[13px] font-medium text-black dark:text-zinc-200"
                >
                  <ChevronDown
                    size={14}
                    className={cn(
                      "shrink-0 text-black/40 transition-transform dark:text-zinc-500",
                      !open && "-rotate-90",
                    )}
                  />
                  {def.label}
                  {activeCount > 0 && (
                    <span className="ml-auto rounded-full bg-emerald-50 px-1.5 py-0.5 font-ibm text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      {activeCount}
                    </span>
                  )}
                </button>
                {open && (
                  <div className="mt-2 space-y-1 pl-5">
                    {def.opts.map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-2 text-[12.5px] text-black/70 dark:text-zinc-400"
                      >
                        <input
                          type="checkbox"
                          checked={filters[def.key]?.has(opt) ?? false}
                          onChange={() => toggleFilterValue(def.key, opt)}
                          className="h-3.5 w-3.5 accent-zinc-900"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <button
            onClick={clearAllFilters}
            className="mt-3 w-full rounded-md border border-zinc-300 px-3 py-2 text-[12.5px] font-semibold text-black hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200"
          >
            Clear filter
          </button>
        </aside>

        <div>
          <div className="overflow-hidden rounded-lg bg-white border border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-800">
            <div className="flex flex-wrap items-center gap-3 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <h2 className="text-[14px] font-bold text-black dark:text-zinc-100">
                All Services
              </h2>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[12.5px] font-medium text-black/40 dark:text-zinc-500">
                  Sort
                </span>
                <Select
                  value={sortKey}
                  onChange={(e) => setSortKey(String(e.target.value))}
                  options={SORT_OPTIONS}
                  className="min-w-[220px]"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900/60">
                    <th className="w-10 px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={
                          pageRows.length > 0 &&
                          pageRows.every((s) => selected.has(s.id))
                        }
                        onChange={toggleSelectAllOnPage}
                        className="h-3.5 w-3.5 accent-zinc-900"
                        aria-label="Select all services on this page"
                      />
                    </th>
                    {[
                      "Service",
                      "Automation readiness",
                      "Automation level",
                      "Health",
                      "Owner",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-4 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-14 text-center text-[13px] text-black/50 dark:text-zinc-500"
                      >
                        No services match these filters.
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((s) => {
                      const r = readiness(s);
                      const e = ealOf(s);
                      return (
                        <tr
                          key={s.id}
                          className="cursor-pointer border-t border-zinc-100 first:border-t-0 hover:bg-zinc-50/70 dark:border-zinc-800 dark:hover:bg-zinc-900/40"
                          onClick={() => onOpenServiceDetail(s.name)}
                        >
                          <td
                            className="px-4 py-3.5"
                            onClick={(e2) => e2.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={selected.has(s.id)}
                              onChange={() => toggleSelect(s.id)}
                              className="h-3.5 w-3.5 accent-zinc-900"
                              aria-label={`Select ${s.name}`}
                            />
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[13.5px] font-semibold text-black dark:text-zinc-100">
                                {s.name}
                              </span>
                              {s.tier === 0 && <TierBadge tier={0} />}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 font-ibm text-[13.5px] font-semibold text-black dark:text-zinc-100">
                            {r.score}
                          </td>
                          <td className="px-4 py-3.5">
                            <EalPill eal={e} />
                          </td>
                          <td className="px-4 py-3.5">
                            <HealthBadge health={s.health} />
                          </td>
                          <td className="px-4 py-3.5 text-[13px] text-black dark:text-zinc-200">
                            {s.owner === "Unassigned" ? (
                              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11.5px] font-semibold text-black/50 dark:bg-zinc-800 dark:text-zinc-500">
                                Unassigned
                              </span>
                            ) : (
                              s.owner
                            )}
                          </td>
                          <td
                            className="px-4 py-3.5 text-right"
                            onClick={(e2) => e2.stopPropagation()}
                          >
                            <div className="relative inline-block">
                              <button
                                onClick={() =>
                                  setMenuFor((m) => (m === s.id ? null : s.id))
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-md text-black/40 hover:bg-zinc-100 hover:text-black dark:text-zinc-500 dark:hover:bg-zinc-800"
                              >
                                <MoreVertical size={14} />
                              </button>
                              {menuFor === s.id && (
                                <div
                                  onClick={(e3) => e3.stopPropagation()}
                                  className="absolute right-0 top-8 z-20 w-44 rounded-md border border-zinc-200 bg-white p-1 shadow-md dark:border-zinc-700 dark:bg-zinc-900"
                                >
                                  {[
                                    { label: "View", onClick: () => onOpenServiceDetail(s.name) },
                                    { label: "Run health scan", onClick: () => toast.info(`Running a health scan for ${s.name}…`) },
                                    { label: "Re-evaluate level", onClick: () => toast.info(`Re-evaluating automation level for ${s.name}…`) },
                                    {
                                      label: "Export",
                                      onClick: () => {
                                        downloadCsv(`${s.name}.csv`, servicesToCsv([s]));
                                        toast.success(`Exported "${s.name}"`);
                                      },
                                    },
                                  ].map((item) => (
                                    <button
                                      key={item.label}
                                      onClick={() => {
                                        setMenuFor(null);
                                        item.onClick();
                                      }}
                                      className="block w-full rounded px-2.5 py-1.5 text-left text-[12.5px] text-black hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
                                    >
                                      {item.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {filtered.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-black/50 dark:text-zinc-500">
              <span>
                Showing {(safePage - 1) * PAGE_SIZE + 1}-
                {Math.min(safePage * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length} services
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="rounded-md border border-zinc-200 px-3 py-1.5 font-semibold disabled:opacity-40 dark:border-zinc-700"
                >
                  Previous
                </button>
                {pageNumbers.map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={cn(
                      "h-8 w-8 rounded-md font-semibold",
                      n === safePage
                        ? "bg-black text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800",
                    )}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="rounded-md border border-zinc-200 px-3 py-1.5 font-semibold disabled:opacity-40 dark:border-zinc-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={exportOpen} onClose={() => setExportOpen(false)}>
        <ExportModal services={sorted} onClose={() => setExportOpen(false)} />
      </Modal>
    </div>
  );
}
