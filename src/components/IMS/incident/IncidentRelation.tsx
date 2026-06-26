"use client";
import React, { useEffect, useRef, useState } from "react";
import { Info, Search, X, ChevronDown, Plus } from "lucide-react";
import { useIncidentList } from "@/hooks/useIncidentList";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";

// ── Types ─────────────────────────────────────────────────────────

interface LinkedChild {
  id: string;
  ticketId: string;
  title: string;
  severity: string;
}

interface Props {
  incident: IncidentDetailRecord; // the current (mother) incident
  value: LinkedChild[]; // controlled list of children
  onChange: (children: LinkedChild[]) => void;
}

// ── Severity colours ──────────────────────────────────────────────

const SEV: Record<string, string> = {
  P0: "text-red-600    bg-red-50    border-red-200",
  P1: "text-orange-600 bg-orange-50 border-orange-200",
  P2: "text-amber-600  bg-amber-50  border-amber-200",
  P3: "text-yellow-600 bg-yellow-50 border-yellow-200",
  P4: "text-sky-600    bg-sky-50    border-sky-200",
};

// ── Tooltip ───────────────────────────────────────────────────────

const Tooltip = ({ text }: { text: string }) => (
  <span className="group relative inline-flex">
    <Info size={14} className="text-zinc-400 dark:text-zinc-500 cursor-help" />
    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-lg bg-zinc-800 dark:bg-zinc-700 px-3 py-2 text-[11px] text-white leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg text-center">
      {text}
    </span>
  </span>
);

// ── Main component ────────────────────────────────────────────────

const IncidentRelationship: React.FC<Props> = ({
  incident,
  value,
  onChange,
}) => {
  const { data } = useIncidentList();
  const [search, setSearch] = useState("");
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node))
        setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // All incidents except the current one and already-linked children
  const linkedIds = new Set(value.map((c) => c.id));
  const candidates = (data?.incidents ?? []).filter(
    (inc) =>
      inc.id !== incident.id &&
      !linkedIds.has(inc.id) &&
      (!search.trim() ||
        inc.title.toLowerCase().includes(search.toLowerCase()) ||
        inc.ticketId.toLowerCase().includes(search.toLowerCase())),
  );

  const addChild = (inc: (typeof candidates)[0]) => {
    onChange([
      ...value,
      {
        id: inc.id,
        ticketId: inc.ticketId,
        title: inc.title,
        severity: inc.severity,
      },
    ]);
    setSearch("");
    setDropOpen(false);
  };

  const removeChild = (id: string) =>
    onChange(value.filter((c) => c.id !== id));

  return (
    <div className=" ">
      {/* ── Header ── */}

      <div>
        {/* ── Mother incident (current) ── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              Mother Incident{" "}
              <span className="text-zinc-400 dark:text-zinc-500 font-normal">
                (Current Incident)
              </span>
            </p>
            <Tooltip text="This is the current incident. It will act as the parent for all linked child incidents." />
          </div>

          {/* Mother card — read-only */}
          <div className="flex-1 bg-transparent outline-none text-[13px] text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 border p-2 rounded-lg">
                <span className="text-[11px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                  {incident.ticketId}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${SEV[incident.severity] ?? SEV.P4}`}
                >
                  {incident.severity}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[12px] text-zinc-400 dark:text-zinc-500 mt-2 ml-1">
            This is the current incident.
          </p>
        </div>

        {/* ── Child incidents ── */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              Child Incidents
            </p>
            <Tooltip text="Select one or more incidents to link as children. They will inherit enrichment and resolution updates from this incident." />
            {value.length > 0 && (
              <span className="text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-full px-2 py-0.5">
                {value.length}
              </span>
            )}
          </div>

          {/* Search / select dropdown */}
          <div ref={dropRef} className="relative mb-4">
            <div
              onClick={() => setDropOpen((v) => !v)}
              className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 bg-white dark:bg-zinc-800/60 cursor-pointer transition-colors ${
                dropOpen
                  ? "border-zinc-400 dark:border-zinc-500"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
              }`}
            >
              <Search size={14} className="text-zinc-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setDropOpen(true);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setDropOpen(true);
                }}
                placeholder="Search by incident ID or title…"
                className="flex-1 bg-transparent outline-none text-[13px] text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              />
              <ChevronDown
                size={14}
                className={`text-zinc-400 shrink-0 transition-transform ${dropOpen ? "rotate-180" : ""}`}
              />
            </div>

            {/* Dropdown list */}
            {dropOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden">
                {candidates.length === 0 ? (
                  <div className="px-4 py-5 text-center text-[13px] text-zinc-400 dark:text-zinc-500">
                    {search
                      ? "No matching incidents"
                      : "No other incidents available"}
                  </div>
                ) : (
                  <div className="max-h-[240px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                    {candidates.map((inc) => (
                      <button
                        key={inc.id}
                        type="button"
                        onClick={() => addChild(inc)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-left transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                              {inc.ticketId}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${SEV[inc.severity] ?? SEV.P4}`}
                            >
                              {inc.severity}
                            </span>
                          </div>
                          <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 truncate">
                            {inc.title}
                          </p>
                          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                            {inc.service} · {inc.elapsedLabel}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <Plus size={13} /> Link
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Linked children list */}
          {value.length === 0 ? (
            <p className="text-[12px] text-zinc-400 dark:text-zinc-500 ml-1">
              Select an incident to link as child.
            </p>
          ) : (
            <div className="space-y-2.5">
              {value.map((child, idx) => (
                <div
                  key={child.id}
                  className="flex items-center gap-3 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 bg-white dark:bg-zinc-800/40 group"
                >
                  {/* Index badge */}
                  <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 flex items-center justify-center text-[10px] font-bold text-zinc-500 dark:text-zinc-400 shrink-0">
                    {idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        {child.ticketId}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${SEV[child.severity] ?? SEV.P4}`}
                      >
                        {child.severity}
                      </span>
                    </div>
                    <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {child.title}
                    </p>
                  </div>

                  <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-lg px-2.5 py-1 shrink-0">
                    Child
                  </span>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeChild(child.id)}
                    className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-700 hover:bg-red-50 dark:hover:bg-red-500/10 border border-zinc-200 dark:border-zinc-600 hover:border-red-200 dark:hover:border-red-500/30 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentRelationship;
