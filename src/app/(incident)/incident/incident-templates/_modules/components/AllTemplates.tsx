"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronRight, Copy, MoreVertical, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { TemplateRecord, TemplateStatus } from "./incidentTemplates.data";

const PAGE_SIZE = 8;
type Filter = "All" | TemplateStatus;
const FILTERS: Filter[] = ["All", "Active", "Draft", "Archived"];

export default function AllTemplates({
  templates,
  initialSearch = "",
  onOpenTemplate,
  onNewTemplate,
  onBackToOverview,
}: {
  templates: TemplateRecord[];
  initialSearch?: string;
  onOpenTemplate: (name: string) => void;
  onNewTemplate: () => void;
  onBackToOverview: () => void;
}) {
  const [localTemplates, setLocalTemplates] = useState<TemplateRecord[]>(templates);
  const [search, setSearch] = useState(initialSearch);
  const [filter, setFilter] = useState<Filter>("All");
  const [page, setPage] = useState(1);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  useEffect(() => {
    if (!menuFor) return;
    const close = () => setMenuFor(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuFor]);

  const counts = useMemo(
    () => ({
      All: localTemplates.length,
      Active: localTemplates.filter((t) => t.status === "Active").length,
      Draft: localTemplates.filter((t) => t.status === "Draft").length,
      Archived: localTemplates.filter((t) => t.status === "Archived").length,
    }),
    [localTemplates],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return localTemplates.filter((t) => {
      if (filter !== "All" && t.status !== filter) return false;
      if (q && !t.name.toLowerCase().includes(q) && !t.cat.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [localTemplates, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const pageNumbers = useMemo(() => {
    const windowSize = 6;
    let start = Math.max(1, safePage - Math.floor(windowSize / 2));
    const end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [safePage, totalPages]);

  function updateFilter(next: Filter) {
    setFilter(next);
    setPage(1);
  }
  function updateSearch(v: string) {
    setSearch(v);
    setPage(1);
  }

  function duplicate(t: TemplateRecord) {
    const base = t.name.replace(/ \(copy( \d+)?\)$/, "");
    let n = 1;
    let newName = `${base} (copy)`;
    while (localTemplates.some((x) => x.name === newName)) {
      n++;
      newName = `${base} (copy ${n})`;
    }
    const clone: TemplateRecord = {
      ...t,
      name: newName,
      status: "Draft",
      usage: 0,
      updated: "just now",
    };
    setLocalTemplates((prev) => [clone, ...prev]);
    setMenuFor(null);
  }

  function toggleArchive(t: TemplateRecord) {
    setLocalTemplates((prev) =>
      prev.map((x) =>
        x.name === t.name
          ? { ...x, status: x.status === "Archived" ? "Active" : "Archived" }
          : x,
      ),
    );
    setMenuFor(null);
  }

  function toggleDraft(t: TemplateRecord) {
    setLocalTemplates((prev) =>
      prev.map((x) =>
        x.name === t.name ? { ...x, status: x.status === "Draft" ? "Active" : "Draft" } : x,
      ),
    );
    setMenuFor(null);
  }

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6">
      <div className="mb-2 flex items-center gap-1.5 text-[12.5px] text-black/40 dark:text-zinc-500">
        <button
          onClick={onBackToOverview}
          className="hover:text-black dark:hover:text-zinc-200"
        >
          Overview
        </button>
        <ChevronRight size={13} />
        <span className="font-semibold text-black dark:text-zinc-200">
          Incident Template
        </span>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-black dark:text-zinc-100">
            All Templates
          </h1>
          <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-black/60 dark:text-zinc-400">
            Standardized response blueprints that define how Scrubbe orchestrates
            agents, prioritizes signals, enforces governance, and remediates
            recurring incidents.
          </p>
        </div>
        <button
          onClick={onNewTemplate}
          className="shrink-0 rounded-md bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-emerald-700"
        >
          + New Template
        </button>
      </div>

      <div className="mb-4 mt-5 flex flex-wrap items-center gap-2.5">
        <div className="relative w-full max-w-[420px]">
          <Search
            size={15}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-zinc-500"
          />
          <input
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Search Template"
            className="h-[42px] w-full rounded-full border border-zinc-200 bg-white pl-10 pr-4 text-[13.5px] text-black placeholder:text-black/40 focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          />
        </div>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => updateFilter(f)}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-[13px] font-semibold",
              filter === f
                ? "bg-black text-white"
                : "border border-zinc-200 bg-white text-black/60 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400",
            )}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/60">
                <Th>Template</Th>
                <Th align="right">Agents</Th>
                <Th align="right">Playbooks</Th>
                <Th align="right">Rules</Th>
                <Th align="right">Usage</Th>
                <Th>Status</Th>
                <Th>Updated</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-14 text-center text-[13px] text-black/50 dark:text-zinc-500"
                  >
                    No templates match {search ? `"${search}"` : "these filters"}.
                    Try a different term or clear the filter.
                  </td>
                </tr>
              ) : (
                pageRows.map((t) => (
                  <tr
                    key={t.name}
                    className="border-t border-zinc-100 first:border-t-0 hover:bg-zinc-50/70 dark:border-zinc-800 dark:hover:bg-zinc-900/40"
                  >
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => onOpenTemplate(t.name)}
                        className="text-left text-[13.5px] font-bold text-black hover:text-emerald-600 hover:underline dark:text-zinc-100"
                      >
                        {t.name}
                      </button>
                      <div className="text-[11.5px] text-black/40 dark:text-zinc-500">
                        {t.cat}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-[13px] text-black/70 dark:text-zinc-400">
                      {t.agents}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-[13px] text-black/70 dark:text-zinc-400">
                      {t.playbooks}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-[13px] text-black/70 dark:text-zinc-400">
                      {t.rules}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-[13px] text-black/70 dark:text-zinc-400">
                      {t.usage}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusPill status={t.status} />
                    </td>
                    <td className="px-4 py-3.5 text-[12.5px] text-black/50 dark:text-zinc-500">
                      {t.updated}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="relative flex items-center justify-end gap-1">
                        <button
                          onClick={() => duplicate(t)}
                          title="Duplicate"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-black/40 hover:bg-zinc-100 hover:text-black dark:text-zinc-500 dark:hover:bg-zinc-800"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuFor((m) => (m === t.name ? null : t.name));
                          }}
                          title="More"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-black/40 hover:bg-zinc-100 hover:text-black dark:text-zinc-500 dark:hover:bg-zinc-800"
                        >
                          <MoreVertical size={14} />
                        </button>
                        {menuFor === t.name && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-8 z-20 w-40 rounded-md border border-zinc-200 bg-white p-1 shadow-md dark:border-zinc-700 dark:bg-zinc-900"
                          >
                            <button
                              onClick={() => toggleDraft(t)}
                              className="block w-full rounded px-2.5 py-1.5 text-left text-[12.5px] text-black hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
                            >
                              {t.status === "Draft" ? "Mark Active" : "Mark Draft"}
                            </button>
                            <button
                              onClick={() => toggleArchive(t)}
                              className="block w-full rounded px-2.5 py-1.5 text-left text-[12.5px] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                            >
                              {t.status === "Archived" ? "Unarchive" : "Archive"}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-black/50 dark:text-zinc-500">
          <span>
            Showing {(safePage - 1) * PAGE_SIZE + 1}-
            {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}{" "}
            templates
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
                    ? "bg-black text-white"
                    : "border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700",
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
  );
}

function Th({
  children,
  align,
}: {
  children?: React.ReactNode;
  align?: "right";
}) {
  return (
    <th
      className={cn(
        "px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500",
        align === "right" && "text-right",
      )}
    >
      {children}
    </th>
  );
}

const STATUS_STYLE: Record<TemplateStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  Draft: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  Archived: "bg-zinc-100 text-black/50 dark:bg-zinc-800 dark:text-zinc-500",
};
const STATUS_DOT: Record<TemplateStatus, string> = {
  Active: "bg-emerald-500",
  Draft: "bg-amber-500",
  Archived: "bg-zinc-400",
};

function StatusPill({ status }: { status: TemplateStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-wide",
        STATUS_STYLE[status],
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[status])} />
      {status}
    </span>
  );
}
