// app/incidents/library/components/FilterRail.tsx
"use client";

import React, { useMemo } from "react";
import { IncidentListItem } from "@/lib/incident/incident.types";
import { ChevronDown, X } from "lucide-react";

export type FilterKey =
  | "status"
  | "severity"
  | "environment"
  | "service"
  | "rootCause"
  | "incidentType"
  | "warRoom"
  | "codeEngine";

interface FilterRailProps {
  filters: Record<FilterKey, Set<string>>;
  onFilterChange: React.Dispatch<React.SetStateAction<any>>;
  onClear: () => void;
  dataList: IncidentListItem[];
  dateRange: string | null;
  onDateRangeChange: (range: string | null) => void;
}

const DATE_OPTIONS = ["Today", "Yesterday", "Last 7 days", "Last 30 days"];

// Field mapping: filter key → IncidentListItem field for counting
const FILTER_TO_FIELD: Partial<Record<FilterKey, keyof IncidentListItem>> = {
  status: "status",
  severity: "severity",
  environment: "environment",
  service: "service",
  rootCause: "reason",
  incidentType: "sourceType",
};

const STATIC_GROUPS: { label: string; key: FilterKey; options?: string[] }[] = [
  {
    label: "Incident Status",
    key: "status",
    options: [
      "Open",
      "Investigating",
      "Diagnosed",
      "Remediating",
      "Monitoring",
      "Review",
      "Resolved",
      "Closed",
    ],
  },
  {
    label: "Priority",
    key: "severity", // maps to IncidentListItem.severity (P0–P3)
    options: ["P0", "P1", "P2", "P3"],
  },
  {
    label: "Environment",
    key: "environment",
    options: ["Production", "Staging", "Development"],
  },
  {
    label: "Service",
    key: "service",
    // options: derived dynamically from dataList below
  },
  {
    label: "Root Cause",
    key: "rootCause",
    options: [
      "Code Regression",
      "Infrastructure",
      "Configuration",
      "Database",
      "Network",
      "Third Party",
      "Capacity",
      "Security",
    ],
  },
  {
    label: "Incident Type",
    key: "incidentType",
    options: [
      "Manual",
      "Automatic",
      "Major Incident",
      "Child",
      "Mother",
      "Risk Incident",
    ],
  },
  {
    label: "War Room",
    key: "warRoom",
    options: ["Has War Room", "No War Room"],
  },
  {
    label: "Code Engine",
    key: "codeEngine",
    options: ["Code Related", "Non Code Related"],
  },
];

export default function FilterRail({
  filters,
  onFilterChange,
  onClear,
  dataList,
  dateRange,
  onDateRangeChange,
}: FilterRailProps) {
  // Derive unique services from live data (alphabetical)
  const dynamicServices = useMemo(() => {
    const seen = new Set<string>();
    dataList.forEach((i) => {
      if (i.service && i.service.trim()) seen.add(i.service.trim());
    });
    return Array.from(seen).sort();
  }, [dataList]);

  // Count incidents matching a given filter option
  const countFor = (key: FilterKey, val: string): number => {
    const field = FILTER_TO_FIELD[key];
    if (!field) return 0;
    return dataList.filter(
      (i) => String(i[field] ?? "").toLowerCase() === val.toLowerCase(),
    ).length;
  };

  const handleToggle = (group: FilterKey, val: string) => {
    onFilterChange((prev: any) => {
      const nextSet = new Set<string>(prev[group]);
      nextSet.has(val) ? nextSet.delete(val) : nextSet.add(val);
      return { ...prev, [group]: nextSet };
    });
  };

  const totalActive =
    Object.values(filters).reduce((acc, set) => acc + set.size, 0) +
    (dateRange ? 1 : 0);

  const groups = STATIC_GROUPS.map((g) =>
    g.key === "service"
      ? {
          ...g,
          options: dynamicServices.length
            ? dynamicServices
            : ["No services found"],
        }
      : g,
  );

  return (
    <div className="bg-white dark:bg-zinc-900/40 shadow-sm shadow-light rounded-xl sticky top-20 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="flex items-center justify-between px-4 h-11 border-b border-zinc-100 dark:border-zinc-800">
        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Filters</span>
        {totalActive > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            <X size={11} />
            Clear {totalActive}
          </button>
        )}
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {/* Date Range */}
        <details open className="group">
          <summary className="flex items-center justify-between px-4 py-2.5 cursor-pointer list-none text-xs font-medium text-zinc-600 dark:text-zinc-400 select-none">
            <span>Date Range</span>
            <ChevronDown
              size={13}
              className="text-zinc-400 dark:text-zinc-500 group-open:rotate-180 transition-transform"
            />
          </summary>
          <div className="px-3 pb-3 grid grid-cols-2 gap-1.5">
            {DATE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() =>
                  onDateRangeChange(dateRange === opt ? null : opt)
                }
                className={`py-1.5 text-[10px] rounded-md border font-medium transition-colors ${
                  dateRange === opt
                    ? "bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30 text-blue-700 dark:text-blue-400"
                    : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </details>

        {/* Dynamic filter groups */}
        {groups.map((g) => {
          const activeCount = filters[g.key]?.size ?? 0;
          return (
            <details key={g.key} className="group">
              <summary className="flex items-center justify-between px-4 py-2.5 cursor-pointer list-none text-sm font-medium text-zinc-600 dark:text-zinc-400 select-none">
                <span className="flex items-center gap-1.5">
                  {g.label}
                  {activeCount > 0 && (
                    <span className="h-4 min-w-4 px-1 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                      {activeCount}
                    </span>
                  )}
                </span>
                <ChevronDown
                  size={13}
                  className="text-zinc-400 dark:text-zinc-500 group-open:rotate-180 transition-transform"
                />
              </summary>
              <div className="px-3 pb-3 flex flex-col gap-0.5">
                {(g.options ?? []).map((opt) => {
                  const isChecked = filters[g.key]?.has(opt) ?? false;
                  const count = countFor(g.key, opt);
                  return (
                    <label
                      key={opt}
                      className="flex items-center gap-2 px-1.5 py-1 rounded cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 group/item"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggle(g.key, opt)}
                        className="accent-indigo-600 w-3.5 h-3.5 flex-shrink-0 cursor-pointer"
                      />
                      <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300 truncate">
                        {opt}
                      </span>
                      <span
                        className={`text-[10px] tabular-nums ${
                          count > 0
                            ? "text-zinc-500 dark:text-zinc-400 font-medium"
                            : "text-zinc-300 dark:text-zinc-600"
                        }`}
                      >
                        {count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
