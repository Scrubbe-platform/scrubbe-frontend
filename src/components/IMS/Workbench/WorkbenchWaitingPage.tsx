"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ChevronRight } from "lucide-react";
import { useIncidentList } from "@/hooks/useIncidentList";
import { IncidentListItem } from "@/lib/incident/incident.types";

// ── Severity colours ──────────────────────────────────────────────

const SEV_BG: Record<string, string> = {
  P0: "bg-red-500",
  P1: "bg-orange-500",
  P2: "bg-amber-500",
  P3: "bg-yellow-400",
  P4: "bg-sky-500",
};

// ── Derive the "tag" from incident data ───────────────────────────
// Until the backend exposes a real workbenchTag field we infer it:
//   - P0 + sourceType not manual  → "Auto-raised"
//   - P0 + parentIncidentId set   → "Inherited P0"
//   - P0 + no workbench filled    → "No workbench"

type TagType = "inherited" | "auto" | "none";

function getTag(inc: IncidentListItem): { tagType: TagType; tagLabel: string } {
  // Check for parent linkage (field may be absent — safe optional chain)
  if (inc.source !== "MANUAL") {
    return { tagType: "auto", tagLabel: "Auto-raised" };
  }
  return { tagType: "none", tagLabel: "No workbench" };
}

const TAG_STYLE: Record<TagType, string> = {
  inherited:
    "bg-blue-50   dark:bg-blue-500/10   text-blue-600   dark:text-blue-400   border border-blue-200   dark:border-blue-500/20",
  auto: "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20",
  none: "text-zinc-400 dark:text-zinc-500",
};

type FilterTab = "all" | "auto-raised" | "inherited-p0" | "uncovered-p0";

// ── Skeleton card ─────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="flex items-center gap-4 px-6 py-5 animate-pulse">
    <div className="flex-1 space-y-2">
      <div className="h-3 w-36 bg-zinc-100 dark:bg-zinc-800 rounded" />
      <div className="h-4 w-64 bg-zinc-100 dark:bg-zinc-800 rounded" />
      <div className="h-3 w-28 bg-zinc-100 dark:bg-zinc-800 rounded" />
    </div>
    <div className="flex gap-2 shrink-0">
      <div className="h-8 w-28 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
      <div className="h-8 w-32 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
    </div>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────

const WorkbenchAwaitingPage: React.FC = () => {
  const router = useRouter();
  const { data, isLoading } = useIncidentList();
  const [tab, setTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  // All incidents from the hook — in real usage, filter to P0/P1 or
  // those missing workbench; for now show everything so real data appears.
  const allIncidents: IncidentListItem[] = data?.incidents ?? [];

  // Derived stats from real data
  const autoRaisedCount = allIncidents.filter(
    (i) => getTag(i).tagType === "auto",
  ).length;
  const inheritedCount = allIncidents.filter(
    (i) => getTag(i).tagType === "inherited",
  ).length;
  const uncoveredCount = allIncidents.filter(
    (i) => getTag(i).tagType === "none",
  ).length;
  const slaBreachingCount = allIncidents.filter(
    (i) => i.severity === "P0",
  ).length;
  const p0InheritCount = allIncidents.filter(
    (i) => getTag(i).tagType === "inherited",
  ).length;

  const STATS = [
    { value: String(allIncidents.length), label: "Awaiting workbench" },
    { value: String(autoRaisedCount), label: "Auto-raised" },
    { value: String(p0InheritCount), label: "P0 by inheritance" },
    { value: String(uncoveredCount), label: "Uncovered P0" },
    { value: String(slaBreachingCount), label: "SLA breaching" },
  ];

  const filtered = useMemo(() => {
    return allIncidents.filter((inc) => {
      const { tagType } = getTag(inc);

      if (
        search &&
        !inc.title.toLowerCase().includes(search.toLowerCase()) &&
        !inc.ticketId.toLowerCase().includes(search.toLowerCase()) &&
        !(inc.service ?? "").toLowerCase().includes(search.toLowerCase())
      )
        return false;

      if (tab === "auto-raised") return tagType === "auto";
      if (tab === "inherited-p0") return tagType === "inherited";
      if (tab === "uncovered-p0") return tagType === "none";
      return true;
    });
  }, [allIncidents, tab, search]);

  const tabCount = (t: FilterTab) => {
    if (t === "all") return allIncidents.length;
    if (t === "auto-raised") return autoRaisedCount;
    if (t === "inherited-p0") return inheritedCount;
    return uncoveredCount;
  };

  const tabCls = (t: FilterTab) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
      tab === t
        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
    }`;

  const CountBadge = ({ t }: { t: FilterTab }) => (
    <span className="text-[11px] font-bold bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full px-1.5 py-0.5">
      {tabCount(t)}
    </span>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 p-8">
      <div className="max-w-[900px] mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] text-zinc-400 dark:text-zinc-500 mb-2">
          <Link
            href="/incident/workbench"
            className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            Workbench
          </Link>
          <ChevronRight size={12} />
          <span className="text-zinc-600 dark:text-zinc-300">
            Awaiting a workbench
          </span>
        </div>

        <h1 className="text-[22px] font-black text-zinc-900 dark:text-zinc-100 mb-8">
          Incidents awaiting a workbench
        </h1>

        {/* Overview stats */}
        {/* <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 mb-6">
          <p className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
            Overview
          </p>
          <div className="grid grid-cols-5 gap-0 divide-x divide-zinc-200 dark:divide-zinc-700">
            {STATS.map((s) => (
              <div key={s.label} className="px-4 first:pl-0">
                {isLoading ? (
                  <div className="h-7 w-10 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse mb-1" />
                ) : (
                  <p className="text-[28px] font-black text-zinc-900 dark:text-zinc-100 leading-none mb-1">
                    {s.value}
                  </p>
                )}
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div> */}

        {/* Tabs + search */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1">
            <button className={tabCls("all")} onClick={() => setTab("all")}>
              {" "}
              All <CountBadge t="all" />
            </button>
            <button
              className={tabCls("auto-raised")}
              onClick={() => setTab("auto-raised")}
            >
              {" "}
              Auto-raised <CountBadge t="auto-raised" />
            </button>
            <button
              className={tabCls("inherited-p0")}
              onClick={() => setTab("inherited-p0")}
            >
              {" "}
              Inherited P0 <CountBadge t="inherited-p0" />
            </button>
            <button
              className={tabCls("uncovered-p0")}
              onClick={() => setTab("uncovered-p0")}
            >
              {" "}
              Uncovered P0 <CountBadge t="uncovered-p0" />
            </button>
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search incident, service, or title..."
              className="w-full pl-8 pr-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[13px] bg-white dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
            />
          </div>
        </div>

        {/* Incident cards */}
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-[13px] text-zinc-400 dark:text-zinc-500">
              {search
                ? `No incidents matched "${search}"`
                : "No incidents awaiting a workbench."}
            </div>
          ) : (
            filtered.map((inc) => {
              const { tagType, tagLabel } = getTag(inc);
              return (
                <div
                  key={inc.id}
                  className="flex items-center gap-4 px-6 py-5 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                >
                  {/* Left meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[12px] font-mono font-semibold text-zinc-500 dark:text-zinc-400">
                        {inc.ticketId}
                      </span>
                      <span
                        className={`text-[10px] font-black text-white rounded px-2 py-0.5 ${SEV_BG[inc.severity] ?? "bg-zinc-400"}`}
                      >
                        {inc.severity}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${TAG_STYLE[tagType]}`}
                      >
                        {tagLabel}
                      </span>
                    </div>
                    <h3 className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100 mb-1 truncate">
                      {inc.title}
                    </h3>
                    <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
                      {inc.service && `${inc.service} · `}
                      {inc.elapsedLabel}
                    </p>
                  </div>

                  {/* Right — overdue badge + actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {inc.severity === "P0" && (
                      <p className="text-[12px] font-semibold text-red-500">
                        Workbench overdue
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/incident/tickets?id=${inc.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[12px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        View Incident
                      </Link>
                      <button
                        onClick={() =>
                          router.push(`/incident/workbench/${inc.id}`)
                        }
                        className="px-4 py-2 rounded-lg text-[12px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
                      >
                        Fill Workbench
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkbenchAwaitingPage;
