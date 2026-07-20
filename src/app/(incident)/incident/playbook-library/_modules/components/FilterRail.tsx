import React from "react";
import { ChevronDown, X } from "lucide-react";
import { FILTER_DEFS, fval } from "../data";
import { FilterKey, Playbook } from "../types";

interface FilterRailProps {
  filters: Record<FilterKey, Set<string>>;
  onFilterChange: React.Dispatch<React.SetStateAction<Record<FilterKey, Set<string>>>>;
  onClear: () => void;
  dataList: Playbook[];
}

export default function FilterRail({
  filters,
  onFilterChange,
  onClear,
  dataList,
}: FilterRailProps): React.JSX.Element {
  const countFor = (key: FilterKey, val: string): number =>
    dataList.filter((p) => fval(p, key) === val).length;

  const handleToggle = (key: FilterKey, val: string) => {
    onFilterChange((prev) => {
      const next = new Set(prev[key]);
      next.has(val) ? next.delete(val) : next.add(val);
      return { ...prev, [key]: next };
    });
  };

  const totalActive = Object.values(filters).reduce((acc, s) => acc + s.size, 0);

  return (
    <div className="bg-white shadow-sm shadow-light rounded-xl sticky top-20 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="flex items-center justify-between px-4 h-11 border-b border-zinc-100">
        <span className="text-sm font-semibold text-zinc-800">Filters</span>
        {totalActive > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <X size={11} />
            Clear {totalActive}
          </button>
        )}
      </div>

      <div className="divide-y divide-zinc-100">
        {FILTER_DEFS.map((def) => {
          const activeCount = filters[def.key]?.size ?? 0;
          return (
            <details key={def.key} open className="group">
              <summary className="flex items-center justify-between px-4 py-2.5 cursor-pointer list-none text-xs font-medium text-zinc-600 select-none">
                <span className="flex items-center gap-1.5">
                  {def.label}
                  {activeCount > 0 && (
                    <span className="h-4 min-w-4 px-1 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                      {activeCount}
                    </span>
                  )}
                </span>
                <ChevronDown
                  size={13}
                  className="text-zinc-400 group-open:rotate-180 transition-transform"
                />
              </summary>
              <div className="px-3 pb-3 flex flex-col gap-0.5">
                {def.opts.map((opt) => {
                  const isChecked = filters[def.key]?.has(opt) ?? false;
                  const count = countFor(def.key, opt);
                  return (
                    <label
                      key={opt}
                      className="flex items-center gap-2 px-1.5 py-1 rounded cursor-pointer hover:bg-zinc-50"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggle(def.key, opt)}
                        className="accent-indigo-600 w-3.5 h-3.5 flex-shrink-0 cursor-pointer"
                      />
                      <span className="flex-1 text-xs text-zinc-700 truncate">{opt}</span>
                      <span
                        className={`text-[10px] tabular-nums ${
                          count > 0 ? "text-zinc-500 font-medium" : "text-zinc-300"
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
