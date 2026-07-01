// app/incidents/library/components/FilterRail.tsx
import React from "react";
import { IncidentListItem } from "@/lib/incident/incident.types";

interface FilterRailProps {
  filters: {
    status: Set<string>;
    priority: Set<string>;
    environment: Set<string>;
    service: Set<string>;
  };
  onFilterChange: React.Dispatch<React.SetStateAction<any>>;
  onClear: () => void;
  dataList: IncidentListItem[];
}

export default function FilterRail({
  filters,
  onFilterChange,
  onClear,
  dataList,
}: FilterRailProps) {
  // Dynamic item calculations matching native template loops
  const countMetrics = (key: keyof IncidentListItem, val: string) => {
    return dataList.filter(
      (i) => String(i[key]).toLowerCase() === val.toLowerCase(),
    ).length;
  };

  const handleCheckboxToggle = (
    group: "status" | "priority" | "environment" | "service",
    val: string,
  ) => {
    onFilterChange((prev: any) => {
      const nextSet = new Set(prev[group]);
      nextSet.has(val) ? nextSet.delete(val) : nextSet.add(val);
      return { ...prev, [group]: nextSet };
    });
  };

  const groupsConfig = [
    {
      label: "Incident Status",
      key: "status" as const,
      options: ["Resolved", "Closed", "Investigating", "Monitoring"],
    },
    {
      label: "Priority Severity",
      key: "priority" as const,
      options: ["P0", "P1", "P2", "P3"],
    },
    {
      label: "Runtime Environment",
      key: "environment" as const,
      options: ["Production", "Staging", "Development"],
    },
    {
      label: "Affected Service Layer",
      key: "service" as const,
      options: [
        "Checkout",
        "Payments",
        "API Gateway",
        "Authentication",
        "Database",
        "Notifications",
      ],
    },
  ];

  const totalActive = Object.values(filters).reduce(
    (acc, set) => acc + set.size,
    0,
  );

  return (
    <div className="bg-white border border-zinc-200 rounded-md shadow-2xs sticky top-20 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="flex items-center justify-between px-4 h-11 border-b border-zinc-100">
        <span className="text-[10px]  uppercase text-zinc-500 font-medium">
          Filter
        </span>
        {totalActive > 0 && (
          <button
            onClick={onClear}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="divide-y divide-zinc-100 p-2">
        {groupsConfig.map((g) => (
          <div key={g.label} className="p-3 space-y-2">
            <div className="text-[11px] font-medium tracking-wider">
              {g.label}
            </div>
            <div className="space-y-1.5">
              {g.options.map((opt) => {
                const isChecked = (filters[g.key] as Set<string>).has(opt);
                const metricsCount = countMetrics(g.key, opt);
                return (
                  <label
                    key={opt}
                    className="flex items-center gap-2 text-xs font-medium text-zinc-700 hover:text-zinc-900 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCheckboxToggle(g.key, opt)}
                      className="accent-IMSDarkGreen h-3.5 w-3.5 rounded border-zinc-300"
                    />
                    <span className="flex-1 truncate">{opt}</span>
                    <span className="font-mono text-[10.5px] text-zinc-400">
                      {metricsCount}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
