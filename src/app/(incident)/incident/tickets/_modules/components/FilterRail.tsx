// app/incidents/library/components/FilterRail.tsx
import React from "react";
import { IncidentListItem } from "@/lib/incident/incident.types";

type FilterKey =
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

const groupsConfig = [
  {
    label: "Incident status",
    key: "status" as FilterKey,
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
    key: "priority" as FilterKey,
    options: ["P0", "P1", "P2", "P3"],
  },
  {
    label: "Environment",
    key: "environment" as FilterKey,
    options: ["Production", "Staging", "Development"],
  },
  {
    label: "Service",
    key: "service" as FilterKey,
    options: [
      "Checkout",
      "Payments",
      "API Gateway",
      "Authentication",
      "Database",
      "Search",
      "Notifications",
      "Cart",
      "Inventory",
      "User Profile",
      "Recommendations",
      "Billing",
    ],
  },
  {
    label: "Root cause",
    key: "rootCause" as FilterKey,
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
    label: "Incident type",
    key: "incidentType" as FilterKey,
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
    label: "War room",
    key: "warRoom" as FilterKey,
    options: ["Has War Room", "No War Room"],
  },
  {
    label: "Code engine",
    key: "codeEngine" as FilterKey,
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
  const countMetrics = (key: keyof IncidentListItem, val: string) =>
    dataList.filter((i) => String(i[key]).toLowerCase() === val.toLowerCase())
      .length;

  const handleCheckboxToggle = (group: FilterKey, val: string) => {
    onFilterChange((prev: any) => {
      const nextSet = new Set(prev[group]);
      nextSet.has(val) ? nextSet.delete(val) : nextSet.add(val);
      return { ...prev, [group]: nextSet };
    });
  };

  const totalActive =
    Object.values(filters).reduce((acc, set) => acc + set.size, 0) +
    (dateRange ? 1 : 0);

  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm sticky top-20 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="flex items-center justify-between px-4 h-11 border-b border-zinc-100">
        <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
          Filters
        </span>
        {totalActive > 0 && (
          <button
            onClick={onClear}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="divide-y divide-zinc-100">
        {/* Date range */}
        <details open className="group">
          <summary className="flex items-center justify-between px-4 py-2.5 cursor-pointer list-none text-xs font-medium text-zinc-800">
            <span>Date range</span>
            <ChevronIcon />
          </summary>
          <div className="px-3 pb-3 grid grid-cols-2 gap-1.5">
            {DATE_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() =>
                  onDateRangeChange(dateRange === opt ? null : opt)
                }
                className={`py-1.5 text-[10px] rounded-md border transition-colors ${
                  dateRange === opt
                    ? "bg-blue-50 border-blue-300 text-blue-700 font-medium"
                    : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-zinc-300"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </details>

        {/* Dynamic groups */}
        {groupsConfig.map((g) => (
          <details key={g.key} open className="group">
            <summary className="flex items-center justify-between px-4 py-2.5 cursor-pointer list-none text-xs font-medium text-zinc-800">
              <span>{g.label}</span>
              <ChevronIcon />
            </summary>
            <div className="px-3 pb-3 flex flex-col gap-0.5">
              {g.options.map((opt) => {
                const isChecked = filters[g.key]?.has(opt) ?? false;
                const count = countMetrics(
                  g.key as keyof IncidentListItem,
                  opt,
                );
                return (
                  <label
                    key={opt}
                    className="flex items-center gap-2 px-1 py-1 rounded cursor-pointer hover:bg-zinc-50"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCheckboxToggle(g.key, opt)}
                      className="accent-green-700 w-3.5 h-3.5 flex-shrink-0"
                    />
                    <span className="flex-1 text-xs text-zinc-700 truncate">
                      {opt}
                    </span>
                    <span className="text-[11px] text-zinc-400 tabular-nums">
                      {count}
                    </span>
                  </label>
                );
              })}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className="text-zinc-400"
    >
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
