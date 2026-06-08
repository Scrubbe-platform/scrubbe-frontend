"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Filter,
  Bookmark,
  ChevronDown,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { IncidentListItem } from "@/lib/incident/incident.types";

// ── Types ─────────────────────────────────────────────────────────

export interface IncidentFilters {
  priorities: string[]; // ["P0","P1",...]
  incidentId: string;
  titleQuery: string;
  dateFrom: Date | null;
  dateTo: Date | null;
}

interface Props {
  incidents: IncidentListItem[];
  onApply: (filters: IncidentFilters) => void;
  onCancel: () => void;
}

// ── Priority config ───────────────────────────────────────────────

const PRIORITIES = [
  {
    value: "P0",
    label: "P0 – Critical",
    sub: "Service down or major impact",
    dot: "bg-red-500",
  },
  {
    value: "P1",
    label: "P1 – High",
    sub: "Major degradation or at risk",
    dot: "bg-orange-500",
  },
  {
    value: "P2",
    label: "P2 – Medium",
    sub: "Partial impact",
    dot: "bg-yellow-400",
  },
  {
    value: "P3",
    label: "P3 – Low",
    sub: "Minimal impact",
    dot: "bg-green-500",
  },
];

// ── Severity badge colour ─────────────────────────────────────────

const SEV_COLOR: Record<string, string> = {
  P0: "text-red-600    bg-red-50    border-red-200",
  P1: "text-orange-600 bg-orange-50 border-orange-200",
  P2: "text-amber-600  bg-amber-50  border-amber-200",
  P3: "text-yellow-600 bg-yellow-50 border-yellow-200",
  P4: "text-sky-600    bg-sky-50    border-sky-200",
};

// ── Mini calendar ─────────────────────────────────────────────────

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const MiniCalendar = ({
  value,
  onChange,
  highlight,
}: {
  value: Date | null;
  onChange: (d: Date) => void;
  highlight?: Date | null;
}) => {
  const today = new Date();
  const [view, setView] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const prevMonth = () =>
    setView(new Date(view.getFullYear(), view.getMonth() - 1, 1));
  const nextMonth = () =>
    setView(new Date(view.getFullYear(), view.getMonth() + 1, 1));

  const firstDay = view.getDay();
  const daysInMonth = new Date(
    view.getFullYear(),
    view.getMonth() + 1,
    0,
  ).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const isSame = (d: Date | null, day: number) =>
    d &&
    d.getFullYear() === view.getFullYear() &&
    d.getMonth() === view.getMonth() &&
    d.getDate() === day;

  const inRange = (day: number) => {
    if (!value || !highlight) return false;
    const d = new Date(view.getFullYear(), view.getMonth(), day);
    const [a, b] = value < highlight ? [value, highlight] : [highlight, value];
    return d > a && d < b;
  };

  return (
    <div className="w-[230px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
        >
          <ChevronLeft size={14} className="text-zinc-400" />
        </button>
        <span className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-100">
          {MONTHS[view.getMonth()]} {view.getFullYear()}
        </span>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
        >
          <ChevronRight size={14} className="text-zinc-400" />
        </button>
      </div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-semibold text-zinc-400 py-1"
          >
            {d}
          </div>
        ))}
      </div>
      {/* Cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const selected = isSame(value, day) || isSame(highlight as any, day);
          const rangeMiddle = inRange(day);
          return (
            <button
              key={i}
              onClick={() =>
                onChange(new Date(view.getFullYear(), view.getMonth(), day))
              }
              className={`text-[12px] h-7 w-7 mx-auto flex items-center justify-center rounded-full transition-colors font-medium ${
                selected
                  ? "bg-violet-600 text-white"
                  : rangeMiddle
                    ? "bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 rounded-none"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── Main panel ────────────────────────────────────────────────────

const IncidentFilterPanel: React.FC<Props> = ({
  incidents,
  onApply,
  onCancel,
}) => {
  const [priorities, setPriorities] = useState<string[]>([]);
  const [incidentId, setIncidentId] = useState("");
  const [titleQuery, setTitleQuery] = useState("");
  const [titleSearch, setTitleSearch] = useState("");
  const [titleOpen, setTitleOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [datePickMode, setDatePickMode] = useState<"from" | "to" | null>(null);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [filtersShown, setFiltersShown] = useState(true);
  const titleRef = useRef<HTMLDivElement>(null);

  // Count active filters
  const activeCount = [
    priorities.length > 0,
    incidentId.trim() !== "",
    titleQuery.trim() !== "",
    dateFrom !== null || dateTo !== null,
  ].filter(Boolean).length;

  // Click outside to close title dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (titleRef.current && !titleRef.current.contains(e.target as Node))
        setTitleOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const togglePriority = (p: string) =>
    setPriorities((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );

  const clearAll = () => {
    setPriorities([]);
    setIncidentId("");
    setTitleQuery("");
    setTitleSearch("");
    setDateFrom(null);
    setDateTo(null);
  };

  const filteredTitleOptions = incidents
    .filter(
      (inc) =>
        !titleSearch ||
        inc.title.toLowerCase().includes(titleSearch.toLowerCase()) ||
        inc.ticketId.toLowerCase().includes(titleSearch.toLowerCase()),
    )
    .slice(0, 8);

  const fmtDate = (d: Date | null) =>
    d
      ? d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null;

  const priorityLabel =
    priorities.length === 0
      ? "All priorities"
      : priorities.length <= 2
        ? priorities.join(" · ")
        : `${priorities[0]} +${priorities.length - 1}`;

  const QUICK_RANGES = [
    {
      label: "Today",
      fn: () => {
        const t = new Date();
        setDateFrom(t);
        setDateTo(t);
        setDatePickMode(null);
      },
    },
    {
      label: "Yesterday",
      fn: () => {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        setDateFrom(y);
        setDateTo(y);
        setDatePickMode(null);
      },
    },
    {
      label: "Last 7 days",
      fn: () => {
        const t = new Date();
        const s = new Date();
        s.setDate(s.getDate() - 7);
        setDateFrom(s);
        setDateTo(t);
        setDatePickMode(null);
      },
    },
    {
      label: "Last 30 days",
      fn: () => {
        const t = new Date();
        const s = new Date();
        s.setDate(s.getDate() - 30);
        setDateFrom(s);
        setDateTo(t);
        setDatePickMode(null);
      },
    },
    {
      label: "This month",
      fn: () => {
        const t = new Date();
        setDateFrom(new Date(t.getFullYear(), t.getMonth(), 1));
        setDateTo(t);
        setDatePickMode(null);
      },
    },
    {
      label: "Last month",
      fn: () => {
        const t = new Date();
        const s = new Date(t.getFullYear(), t.getMonth() - 1, 1);
        const e = new Date(t.getFullYear(), t.getMonth(), 0);
        setDateFrom(s);
        setDateTo(e);
        setDatePickMode(null);
      },
    },
    { label: "Custom range", fn: () => setDatePickMode("from") },
  ];

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl z-10">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-violet-500" />
          <span className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-100">
            Filters
          </span>
          {activeCount > 0 && (
            <span className="text-[11px] font-bold bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 rounded-full px-2 py-0.5">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[12px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <Bookmark size={12} /> Save Filter
          </button>
          <button
            onClick={() => setFiltersShown((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[12px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {filtersShown ? "Hide Filters" : "Show Filters"}
            <ChevronDown
              size={12}
              className={`transition-transform ${filtersShown ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {filtersShown && (
        <>
          {/* ── Title + subtitle ── */}
          <div className="px-5 pt-5 pb-2">
            <h2 className="text-[16px] font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              Filter Incidents
            </h2>
            <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
              Refine your search to find the right incidents faster.
            </p>
          </div>

          {/* ── Four filter columns ── */}
          <div className="px-5 py-4 grid lg:grid-cols-2 grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-300">
                  Priority
                </span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setPriorityOpen((v) => !v)}
                  className="w-full flex items-center justify-between border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-[13px] text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
                >
                  <span>{priorityLabel}</span>
                  <ChevronDown
                    size={13}
                    className={`text-zinc-400 transition-transform ${priorityOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {priorityOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-[999] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                    {PRIORITIES.map((p) => (
                      <label
                        key={p.value}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                      >
                        <input
                          type="checkbox"
                          checked={priorities.includes(p.value)}
                          onChange={() => togglePriority(p.value)}
                          className="mt-0.5 accent-violet-600 w-4 h-4 rounded"
                        />
                        <div
                          className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ${p.dot}`}
                        />
                        <div>
                          <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-100">
                            {p.label}
                          </p>
                          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                            {p.sub}
                          </p>
                        </div>
                      </label>
                    ))}
                    <button
                      onClick={() => {
                        setPriorities([]);
                        setPriorityOpen(false);
                      }}
                      className="w-full text-center py-2.5 text-[13px] font-semibold text-violet-600 dark:text-violet-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Incident ID */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-300">
                  Incident ID
                </span>
              </div>
              <div className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 bg-white dark:bg-zinc-800/60 focus-within:border-zinc-400 dark:focus-within:border-zinc-500 transition-colors">
                <span className="text-zinc-400 text-[13px] font-mono">#</span>
                <input
                  type="text"
                  value={incidentId}
                  onChange={(e) => setIncidentId(e.target.value)}
                  placeholder="Enter Incident ID"
                  className="flex-1 bg-transparent outline-none text-[13px] text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400"
                />
                {incidentId && (
                  <button onClick={() => setIncidentId("")}>
                    <X
                      size={12}
                      className="text-zinc-400 hover:text-zinc-600"
                    />
                  </button>
                )}
              </div>
            </div>

            {/* Incident Title */}
            <div className="col-span-2">
              <div ref={titleRef} className="col-span-2 relative">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-300">
                    Incident Title
                  </span>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setTitleOpen((v) => !v)}
                    className="w-full flex items-center justify-between border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-[13px] bg-white dark:bg-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
                  >
                    <span
                      className={
                        titleQuery
                          ? "text-zinc-800 dark:text-zinc-200"
                          : "text-zinc-400"
                      }
                    >
                      {titleQuery || "Search and select incident"}
                    </span>
                    <ChevronDown size={13} className="text-zinc-400" />
                  </button>
                  {titleOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-[999] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                        <Search size={13} className="text-zinc-400 shrink-0" />
                        <input
                          autoFocus
                          type="text"
                          value={titleSearch}
                          onChange={(e) => setTitleSearch(e.target.value)}
                          placeholder="Search incident title"
                          className="flex-1 bg-transparent outline-none text-[13px] text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400"
                        />
                      </div>
                      <div className="max-h-[220px] overflow-y-auto">
                        {filteredTitleOptions.length > 0 ? (
                          filteredTitleOptions.map((inc) => (
                            <button
                              key={inc.id}
                              onClick={() => {
                                setTitleQuery(inc.title);
                                setTitleOpen(false);
                                setTitleSearch("");
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-b border-zinc-50 dark:border-zinc-800/60 last:border-0 text-left transition-colors"
                            >
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${SEV_COLOR[inc.severity] ?? SEV_COLOR.P4}`}
                              >
                                {inc.ticketId}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-100 truncate">
                                  {inc.title}
                                </p>
                                <p className="text-[11px] text-zinc-400">
                                  {inc.severity} · {inc.sidebarStatus} ·{" "}
                                  {inc.elapsedLabel}
                                </p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center text-[12px] text-zinc-400">
                            No incidents found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Date Range — full width */}
            <div className="col-span-2 ">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-300">
                  Date Range
                </span>
              </div>
              <button
                onClick={() => setDatePickMode(datePickMode ? null : "from")}
                className="w-full flex items-center justify-between border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 bg-white dark:bg-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="flex items-center gap-2 text-[13px]">
                  <span
                    className={
                      dateFrom
                        ? "text-zinc-800 dark:text-zinc-200"
                        : "text-zinc-400"
                    }
                  >
                    {fmtDate(dateFrom) ?? "Start date"}
                  </span>
                  {(dateFrom || dateTo) && (
                    <span className="text-zinc-300 dark:text-zinc-600">→</span>
                  )}
                  {dateTo && (
                    <span className="text-zinc-800 dark:text-zinc-200">
                      {fmtDate(dateTo)}
                    </span>
                  )}
                </div>
                <ChevronDown size={13} className="text-zinc-400" />
              </button>

              {datePickMode && (
                <div className="mt-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden">
                  <div className="flex">
                    {/* Quick ranges */}
                    <div className="w-[130px] border-r border-zinc-100 dark:border-zinc-800 py-2 shrink-0">
                      {QUICK_RANGES.map((r) => (
                        <button
                          key={r.label}
                          onClick={r.fn}
                          className={`w-full text-left px-4 py-2 text-[12px] font-medium transition-colors ${
                            r.label === "Last 7 days" ||
                            r.label === "Last 30 days"
                              ? "text-violet-600 dark:text-violet-400"
                              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                    {/* Calendar */}
                    <div className="p-3 flex-1">
                      <MiniCalendar
                        value={datePickMode === "from" ? dateFrom : dateTo}
                        highlight={datePickMode === "from" ? dateTo : dateFrom}
                        onChange={(d) => {
                          if (datePickMode === "from") {
                            setDateFrom(d);
                            setDatePickMode("to");
                          } else {
                            setDateTo(d);
                            setDatePickMode(null);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[13px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <RotateCcw size={13} /> Clear Filters
            </button>
            <div className="flex items-center gap-2.5">
              <button
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[13px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  onApply({
                    priorities,
                    incidentId,
                    titleQuery,
                    dateFrom,
                    dateTo,
                  })
                }
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-[13px] font-bold text-white transition-colors"
              >
                <Filter size={13} /> Apply Filters
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default IncidentFilterPanel;
