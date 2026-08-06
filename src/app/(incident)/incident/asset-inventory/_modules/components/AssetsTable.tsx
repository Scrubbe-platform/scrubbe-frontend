"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Activity, ChevronDown, EllipsisVertical, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button1";
import {
  Asset, CATEGORY_DEFS, COMPLIANCE_STATES, ENVIRONMENTS, HEALTHS, OWNERS, RISKS, TableScope, ago,
} from "./assetInventory.data";
import { HealthBadge } from "./AssetInventoryPrimitives";

const PAGE_SIZE = 14;

interface FilterDef {
  key: "category" | "env" | "owner" | "health" | "risk" | "compliance";
  label: string;
  opts: string[];
}
const FILTER_DEFS: FilterDef[] = [
  { key: "category", label: "Asset type", opts: CATEGORY_DEFS.map((d) => d.cat) },
  { key: "env", label: "Environment", opts: ENVIRONMENTS },
  { key: "owner", label: "Owner", opts: OWNERS },
  { key: "health", label: "Health", opts: HEALTHS },
  { key: "risk", label: "Risk", opts: RISKS },
  { key: "compliance", label: "Compliance", opts: COMPLIANCE_STATES },
];

function matchesScope(a: Asset, sc: TableScope | null): boolean {
  if (!sc) return true;
  if (sc.category && a.category !== sc.category) return false;
  if (sc.health && a.health !== sc.health) return false;
  if (sc.compliance && a.compliance !== sc.compliance) return false;
  if (sc.lifecycle && a.lifecycle !== sc.lifecycle) return false;
  if (sc.driftType && a.driftType !== sc.driftType) return false;
  if (sc.name && a.name !== sc.name) return false;
  if (sc.pred && !sc.pred(a)) return false;
  return true;
}

export default function AssetsTable({
  assets, scope, onClearScope, onOpenDetail, onViewChangeHistory,
  onRunHealthCheck, onRunDriftScan, onAttachIncident, onMarkException,
  onBulkHealthCheck, onBulkDrift, onBulkIncident, onBulkException, onBulkOwnerReassign,
  onExport, onProvision, onRegister,
}: {
  assets: Asset[];
  scope: TableScope | null;
  onClearScope: () => void;
  onOpenDetail: (id: string) => void;
  onViewChangeHistory: (a: Asset) => void;
  onRunHealthCheck: (a: Asset) => void;
  onRunDriftScan: (a: Asset) => void;
  onAttachIncident: (a: Asset) => void;
  onMarkException: (a: Asset) => void;
  onBulkHealthCheck: (items: Asset[]) => void;
  onBulkDrift: (items: Asset[]) => void;
  onBulkIncident: (items: Asset[]) => void;
  onBulkException: (items: Asset[]) => void;
  onBulkOwnerReassign: (items: Asset[]) => void;
  onExport: (items: Asset[]) => void;
  onProvision: () => void;
  onRegister: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, Set<string>>>(() => {
    const init: Record<string, Set<string>> = {};
    FILTER_DEFS.forEach((d) => (init[d.key] = new Set()));
    return init;
  });
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(["category"]));
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [menuFor, setMenuFor] = useState<string | null>(null);

  useEffect(() => setPage(1), [scope]);
  useEffect(() => {
    if (!menuFor) return;
    const close = () => setMenuFor(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuFor]);

  function toggleGroup(key: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }
  function toggleFilterValue(key: string, value: string) {
    setFilters((prev) => {
      const next = { ...prev, [key]: new Set(prev[key]) };
      next[key].has(value) ? next[key].delete(value) : next[key].add(value);
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
    onClearScope();
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assets.filter((a) => {
      for (const def of FILTER_DEFS) {
        const set = filters[def.key];
        if (set.size && !set.has((a as any)[def.key])) return false;
      }
      if (!matchesScope(a, scope)) return false;
      if (!q) return true;
      return [a.name, a.id, a.owner, a.service, a.type, a.env].join(" ").toLowerCase().includes(q);
    });
  }, [assets, search, filters, scope]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function toggleSelectAllOnPage() {
    const allSelected = pageRows.every((a) => selected.has(a.id));
    setSelected((prev) => {
      const next = new Set(prev);
      pageRows.forEach((a) => (allSelected ? next.delete(a.id) : next.add(a.id)));
      return next;
    });
  }
  const selectedItems = useMemo(() => assets.filter((a) => selected.has(a.id)), [assets, selected]);
  const isNetworking = scope?.category === "Networking";

  const title = scope?.label || "All Assets";
  const sub = scope?.label
    ? `Filtered view — assets matching "${scope.label}".`
    : "Every discovered asset across cloud, Kubernetes, data, network, and security layers.";

  return (
    <div className="font-ibm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-[22px] font-bold text-black dark:text-zinc-100">
            {title}
            {scope?.label && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 rounded-full border border-zinc-200 px-2.5 py-0.5 text-[11px] font-semibold text-black/50 hover:border-zinc-300 hover:text-black dark:border-zinc-700 dark:text-zinc-500"
              >
                <X size={11} /> Clear
              </button>
            )}
          </h1>
          <p className="mt-1.5 max-w-2xl text-[13.5px] text-black/60 dark:text-zinc-400">{sub}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline-dark" size="sm" onClick={onRegister}>Register existing</Button>
          <Button variant="solid" size="sm" onClick={onProvision}>+ Provision new asset</Button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <div className="relative w-full max-w-[420px]">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40 dark:text-zinc-500" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search assets, owners, services, IDs…"
            className="h-[42px] w-full rounded-md border border-zinc-300 bg-white pl-9 pr-3 text-[13.5px] text-black placeholder:text-black/40 focus:border-IMSDarkGreen focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          />
        </div>
        <Button variant="outline-dark" size="sm" onClick={() => onExport(filtered)}>Export</Button>
        <span className="ml-auto text-[12.5px] text-black/40 dark:text-zinc-500">{filtered.length.toLocaleString()} matching</span>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[224px_1fr] lg:items-start">
        <aside className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
          <h3 className="mb-2 text-[13px] font-bold text-black dark:text-zinc-100">Filters</h3>
          {FILTER_DEFS.map((def) => {
            const open = openGroups.has(def.key);
            const activeCount = filters[def.key]?.size ?? 0;
            return (
              <div key={def.key} className="border-b border-zinc-100 py-2.5 last:border-b-0 dark:border-zinc-800">
                <button onClick={() => toggleGroup(def.key)} className="flex w-full items-center gap-2 text-left text-[13px] font-medium text-black dark:text-zinc-200">
                  <ChevronDown size={14} className={cn("shrink-0 text-black/40 transition-transform dark:text-zinc-500", !open && "-rotate-90")} />
                  {def.label}
                  {activeCount > 0 && (
                    <span className="ml-auto rounded-full bg-IMSDarkGreen/10 px-1.5 py-0.5 font-ibm text-[10px] font-semibold text-IMSDarkGreen">{activeCount}</span>
                  )}
                </button>
                {open && (
                  <div className="mt-2 space-y-1 pl-5">
                    {def.opts.map((opt) => {
                      const n = assets.filter((a) => (a as any)[def.key] === opt).length;
                      return (
                        <label key={opt} className="flex items-center gap-2 text-[12.5px] text-black/70 dark:text-zinc-400">
                          <input
                            type="checkbox"
                            checked={filters[def.key]?.has(opt) ?? false}
                            onChange={() => toggleFilterValue(def.key, opt)}
                            className="h-3.5 w-3.5 accent-IMSDarkGreen"
                          />
                          <span className="flex-1 truncate">{opt}</span>
                          <span className="font-ibm text-[10px] text-black/30 dark:text-zinc-600">{n}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          <button
            onClick={clearAllFilters}
            className="mt-3 w-full rounded-md border border-zinc-300 px-3 py-2 text-[12.5px] font-semibold text-black hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200"
          >
            Clear all filters
          </button>
        </aside>

        <div>
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900/60">
                    <th className="w-10 px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={pageRows.length > 0 && pageRows.every((a) => selected.has(a.id))}
                        onChange={toggleSelectAllOnPage}
                        className="h-3.5 w-3.5 accent-IMSDarkGreen"
                        aria-label="Select all assets on this page"
                      />
                    </th>
                    {(isNetworking ? ["Asset", "Type", "Service", "Health", "Modified", ""] : ["Asset", "Type", "Service", "Owner", "Health", "Modified", ""]).map((h) => (
                      <th key={h} className="whitespace-nowrap px-4 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={isNetworking ? 7 : 8} className="px-4 py-14 text-center text-[13px] text-black/50 dark:text-zinc-500">
                        No assets match. Adjust filters or search terms.
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((a) => (
                      <tr
                        key={a.id}
                        className="cursor-pointer border-t border-zinc-100 first:border-t-0 hover:bg-zinc-50/70 dark:border-zinc-800 dark:hover:bg-zinc-900/40"
                        onClick={() => onOpenDetail(a.id)}
                      >
                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selected.has(a.id)}
                            onChange={() => toggleSelect(a.id)}
                            className="h-3.5 w-3.5 accent-IMSDarkGreen"
                            aria-label={`Select ${a.name}`}
                          />
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="text-[13px] font-semibold text-black dark:text-zinc-100">{a.name}</div>
                          <div className="mt-0.5 font-ibm text-[10.5px] text-black/40 dark:text-zinc-500">
                            {a.id}{a.drift ? " · drift detected" : ""}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-[13px] text-black/70 dark:text-zinc-400">{a.type}</td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-[13px] text-black/70 dark:text-zinc-400">{a.service}</td>
                        {!isNetworking && (
                          <td className="whitespace-nowrap px-4 py-3.5 text-[13px] text-black/70 dark:text-zinc-400">{a.owner}</td>
                        )}
                        <td className="whitespace-nowrap px-4 py-3.5"><HealthBadge health={a.health} /></td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-[12px] text-black/50 dark:text-zinc-500">{ago(a.modMins)}</td>
                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onRunHealthCheck(a)}
                              title="Run health check"
                              className="flex h-7 w-7 items-center justify-center rounded-md text-black/40 hover:bg-zinc-100 hover:text-black dark:text-zinc-500 dark:hover:bg-zinc-800"
                            >
                              <Activity size={14} />
                            </button>
                            <div className="relative inline-block">
                              <button
                                onClick={() => setMenuFor((m) => (m === a.id ? null : a.id))}
                                title="More"
                                className="flex h-7 w-7 items-center justify-center rounded-md text-black/40 hover:bg-zinc-100 hover:text-black dark:text-zinc-500 dark:hover:bg-zinc-800"
                              >
                                <EllipsisVertical size={14} />
                              </button>
                              {menuFor === a.id && (
                                <div
                                  onClick={(e2) => e2.stopPropagation()}
                                  className="absolute right-0 top-8 z-20 w-52 rounded-md border border-zinc-200 bg-white p-1 shadow-md dark:border-zinc-700 dark:bg-zinc-900"
                                >
                                  {[
                                    { label: "View asset", onClick: () => onOpenDetail(a.id) },
                                    { label: "View change history", onClick: () => onViewChangeHistory(a) },
                                    { label: "Attach to incident", onClick: () => onAttachIncident(a) },
                                    { label: "Run health check", onClick: () => onRunHealthCheck(a) },
                                    { label: "Run drift scan", onClick: () => onRunDriftScan(a) },
                                    { label: "Mark as risk exception", onClick: () => onMarkException(a) },
                                  ].map((item) => (
                                    <button
                                      key={item.label}
                                      onClick={() => { setMenuFor(null); item.onClick(); }}
                                      className="block w-full rounded px-2.5 py-1.5 text-left text-[12.5px] text-black hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
                                    >
                                      {item.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center gap-3 border-t border-zinc-100 bg-zinc-50 px-4 py-3 text-[12.5px] text-black/50 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-500">
              <span>
                Showing {filtered.length ? (safePage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length.toLocaleString()} synced assets
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="rounded-md border border-zinc-200 px-3 py-1.5 font-semibold disabled:opacity-40 dark:border-zinc-700"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, safePage - 3), Math.max(0, safePage - 3) + 6)
                  .map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={cn(
                        "h-8 w-8 rounded-md font-semibold",
                        n === safePage ? "bg-IMSDarkGreen text-white" : "border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700",
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
          </div>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="sticky bottom-4 z-30 mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-white shadow-lg dark:bg-zinc-800">
          <span className="border-r border-white/20 pr-3 text-[13px] font-bold">{selected.size} selected</span>
          <button className="rounded-md px-2.5 py-1.5 text-[12.5px] font-semibold hover:bg-white/10" onClick={() => onBulkHealthCheck(selectedItems)}>Run health check</button>
          <button className="rounded-md px-2.5 py-1.5 text-[12.5px] font-semibold hover:bg-white/10" onClick={() => onBulkDrift(selectedItems)}>Run drift scan</button>
          <button className="rounded-md px-2.5 py-1.5 text-[12.5px] font-semibold hover:bg-white/10" onClick={() => onBulkIncident(selectedItems)}>Attach to incident</button>
          <button className="rounded-md px-2.5 py-1.5 text-[12.5px] font-semibold hover:bg-white/10" onClick={() => onBulkException(selectedItems)}>Mark risk exception</button>
          <button className="rounded-md px-2.5 py-1.5 text-[12.5px] font-semibold hover:bg-white/10" onClick={() => onBulkOwnerReassign(selectedItems)}>Reassign owner</button>
          <button className="rounded-md px-2.5 py-1.5 text-[12.5px] font-semibold hover:bg-white/10" onClick={() => onExport(selectedItems)}>Export</button>
          <button className="ml-auto rounded-md px-2.5 py-1.5 text-[12.5px] font-semibold hover:bg-white/10" onClick={() => setSelected(new Set())}>Clear</button>
        </div>
      )}
    </div>
  );
}
