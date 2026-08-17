// components/ICP/IncidentMemory.tsx
"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  INCIDENTS,
  SERVICES,
  ENVIRONMENTS,
  PRIORITIES,
  type IncidentItem,
} from "../libs/data";
import { Panel, SubH, ChartCard, LinkAction, sevColors } from "./shared";
import { ClusterScatter } from "./charts";
import SideModal from "@/components/ui/SideModal";
import Button from "@/components/ui/Button1";

interface Props {
  onChartClick: (key: string) => void;
  incidents?: IncidentItem[];
}

// ── Advanced Filter chip ──
function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors ${
        active
          ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-400 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-semibold"
          : "bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700"
      }`}
    >
      {label}
    </button>
  );
}

export default function IncidentMemory({ onChartClick, incidents }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAllIncidents, setShowAllIncidents] = useState(false);

  const sourceIncidents = incidents ?? INCIDENTS;

  // Advanced filter state
  const [filterSvc, setFilterSvc] = useState("");
  const [filterEnv, setFilterEnv] = useState("");
  const [filterSevs, setFilterSevs] = useState<Set<string>>(new Set());
  const [similarity, setSimilarity] = useState(70);

  const toggleSev = (sev: string) => {
    setFilterSevs((prev) => {
      const next = new Set(prev);
      next.has(sev) ? next.delete(sev) : next.add(sev);
      return next;
    });
  };

  const clearFilters = () => {
    setFilterSvc("");
    setFilterEnv("");
    setFilterSevs(new Set());
    setSimilarity(70);
    setSearch("");
  };

  const activeFilterCount =
    (filterSvc ? 1 : 0) + (filterEnv ? 1 : 0) + filterSevs.size;

  // ── Filter logic ──
  const filtered = useMemo(() => {
    return sourceIncidents.filter((i) => {
      const kw = search.toLowerCase();
      const matchesSearch =
        !kw ||
        i.name.toLowerCase().includes(kw) ||
        i.id.toLowerCase().includes(kw) ||
        i.svc.toLowerCase().includes(kw) ||
        i.cat.toLowerCase().includes(kw);
      const matchesSvc = !filterSvc || i.svc === filterSvc;
      const matchesEnv = !filterEnv || i.env === filterEnv;
      const matchesSev = filterSevs.size === 0 || filterSevs.has(i.sev);
      return matchesSearch && matchesSvc && matchesEnv && matchesSev;
    });
  }, [search, filterSvc, filterEnv, filterSevs]);

  const navigateToIncident = (inc: IncidentItem) => {
    router.push(`/incident/tickets?id=${inc.uuid}`);
  };

  return (
    <>
      <Panel number="2." title="Incident Memory Explorer">
        {/* Search bar + advanced link */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search incidents, services, errors, keywords..."
              className="w-full h-9 pl-9 pr-3 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition dark:text-zinc-100"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 whitespace-nowrap flex items-center gap-1.5"
          >
            Advanced Search
            {activeFilterCount > 0 && (
              <span className="text-[9px] font-bold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Advanced filter panel (collapsible) ── */}
        {showAdvanced && (
          <div className="mb-4 p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Service */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-1.5 block">
                  Service
                </label>
                <select
                  value={filterSvc}
                  onChange={(e) => setFilterSvc(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900/40 text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-400"
                >
                  <option value="">All services</option>
                  {SERVICES?.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Environment */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-1.5 block">
                  Environment
                </label>
                <select
                  value={filterEnv}
                  onChange={(e) => setFilterEnv(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900/40 text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-400"
                >
                  <option value="">All environments</option>
                  {ENVIRONMENTS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority chips */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-1.5 block">
                Priority
              </label>
              <div className="flex gap-1.5">
                {PRIORITIES.map((p) => (
                  <FilterChip
                    key={p}
                    label={p}
                    active={filterSevs.has(p)}
                    onClick={() => toggleSev(p)}
                  />
                ))}
              </div>
            </div>

            {/* Similarity threshold */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-1.5 flex justify-between">
                <span>Similarity threshold</span>
                <span className="text-zinc-400 dark:text-zinc-500 font-mono normal-case">
                  ≥ {similarity}% match
                </span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={similarity}
                onChange={(e) => setSimilarity(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Filter actions */}
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={() => setShowAdvanced(false)}>
                Search memory
              </Button>
              <Button variant="outline-dark" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            </div>

            {/* Active filter summary */}
            {activeFilterCount > 0 && (
              <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
                {filtered.length} incident{filtered.length !== 1 ? "s" : ""}{" "}
                match{filtered.length === 1 ? "es" : ""} your filters
              </div>
            )}
          </div>
        )}

        {/* ── Main split: list + cluster ── */}
        <div className="grid grid-cols-1 md:grid-cols-[1.35fr_1fr] gap-4">
          {/* Incident list */}
          <div>
            <SubH>Recent & Similar Incidents</SubH>
            <div className="space-y-0.5">
              {(filtered.length > 0 ? filtered : sourceIncidents)
                .slice(0, 5)
                .map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => navigateToIncident(inc)}
                    className="flex items-center gap-2.5 py-2.5 px-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition group"
                  >
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-1 rounded border min-w-[28px] text-center ${sevColors[inc.sev]}`}
                    >
                      {inc.sev}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-semibold text-zinc-800 dark:text-zinc-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {inc.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                        {inc.meta}
                      </div>
                    </div>
                    <div className="text-[10.5px] text-zinc-400 dark:text-zinc-500 text-right shrink-0">
                      {inc.similar}
                    </div>
                  </div>
                ))}

              {filtered.length === 0 && (
                <div className="py-6 text-center text-sm text-zinc-400 dark:text-zinc-500 italic">
                  No incidents match these filters.
                </div>
              )}
            </div>

            <div className="text-center mt-3">
              <button type="button" onClick={() => setShowAllIncidents(true)}>
                <LinkAction>View all incidents →</LinkAction>
              </button>
            </div>
          </div>

          {/* Cluster scatter */}
          <ChartCard chartKey="cluster" onClick={onChartClick}>
            <SubH>Similar Incident Clusters</SubH>
            <div className="text-[10.5px] text-zinc-400 dark:text-zinc-500 mb-2">
              Vector-embedded incidents grouped by similarity
            </div>
            <div className="h-[180px]">
              <ClusterScatter />
            </div>
            <div className="text-center mt-3">
              <LinkAction>View in Knowledge Graph →</LinkAction>
            </div>
          </ChartCard>
        </div>
      </Panel>

      {/* ── "View all incidents" side modal ── */}
      {showAllIncidents && (
        <SideModal
          isOpen={showAllIncidents}
          onClose={() => setShowAllIncidents(false)}
          title="Incident Memory"
          subTitle="Full index of incidents stored in memory with similarity links."
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-500 rounded-full px-2.5 py-1">
                {sourceIncidents.length} incidents
              </span>
            </div>

            {/* Full incident table */}
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="text-left pb-2 pr-2">Priority</th>
                    <th className="text-left pb-2 pr-2">Incident</th>
                    <th className="text-left pb-2 pr-2">Service</th>
                    <th className="text-left pb-2 pr-2">Env</th>
                    <th className="text-left pb-2 pr-2">Category</th>
                    <th className="text-left pb-2">Similar</th>
                  </tr>
                </thead>
                <tbody>
                  {sourceIncidents.map((inc) => (
                    <tr
                      key={inc.id}
                      onClick={() => {
                        setShowAllIncidents(false);
                        navigateToIncident(inc);
                      }}
                      className="border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 pr-2">
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-1 rounded border ${sevColors[inc.sev]}`}
                        >
                          {inc.sev}
                        </span>
                      </td>
                      <td className="py-2.5 pr-2">
                        <div className="font-semibold text-zinc-800 dark:text-zinc-100">
                          {inc.name}
                        </div>
                        <div className="text-[10.5px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                          {inc.meta}
                        </div>
                      </td>
                      <td className="py-2.5 pr-2 text-zinc-600 dark:text-zinc-300">{inc.svc}</td>
                      <td className="py-2.5 pr-2 text-zinc-600 dark:text-zinc-300">{inc.env}</td>
                      <td className="py-2.5 pr-2 text-zinc-600 dark:text-zinc-300">{inc.cat}</td>
                      <td className="py-2.5 text-zinc-400 dark:text-zinc-500">{inc.similar}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </SideModal>
      )}
    </>
  );
}
