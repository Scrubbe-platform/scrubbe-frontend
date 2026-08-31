// app/developer/problems/page.tsx
"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  Layers,
  X,
  Activity,
  Plus,
  Bookmark,
  Lock,
  CheckCircle2,
  AlertCircle,
  User,
  List,
  BookOpen,
  FileText,
} from "lucide-react";
import StatsCard from "./_modules/components/StatsCard";
import Dropdown, { DropdownItem } from "@/components/ui/Dropdown";
import Button from "@/components/ui/Button1";
import { useProblems, createProblem, updateProblem } from "@/hooks/useImsData";
import useMember from "@/hooks/useMember";
import { customAxios } from "@/lib/api/axios";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";

const OWNERS: Record<string, string> = {
  rel: "Platform Reliability",
  data: "Data Platform",
  net: "Network Engineering",
  sec: "Security & Trust",
  pay: "Payments Engineering",
};

const BUILTIN_VIEWS = [
  { id: "all", name: "All records", icon: <Layers size={13} /> },
  { id: "mine", name: "Assigned to me", icon: <User size={13} /> },
  { id: "active", name: "Active (not resolved)", icon: <Activity size={13} /> },
  { id: "known", name: "Known errors", icon: <AlertCircle size={13} /> },
];

// Cryptographic hash helpers
function hash(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(8, "0");
}
function shortHash(s: string) {
  return hash(s).slice(0, 6) + "…";
}

// The API sends raw ISO timestamps (createdAt / updatedAt) — the UI wants
// short display strings, so format them client-side instead of expecting
// the backend to pre-format dates.
function formatShortDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatRelativeTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = Date.now() - d.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatShortDate(iso);
}

function getErrorMessage(err: any, fallback: string): string {
  return err?.response?.data?.message || fallback;
}

export default function ProblemRecordsDashboard() {
  // ─── WORKSPACE STATES ───
  const router = useRouter();
  const searchParams = useSearchParams();

  // ─── REAL API DATA ───
  const {
    data: apiProblems,
    loading: problemsLoading,
    refetch: refetchProblems,
  } = useProblems();
  const { data: members = [] } = useMember();
  const [records, setRecords] = useState<any[]>([]);

  // Sync API data into local state (preserving optimistic updates)
  useEffect(() => {
    if (apiProblems && apiProblems.length > 0) {
      setRecords(apiProblems);
    }
  }, [apiProblems]);

  const [selectedId, setSelectedId] = useState<string | null>(
    () => searchParams.get("id") || null,
  );

  // Auto-select first record when data loads
  useEffect(() => {
    if (!selectedId && records.length > 0) {
      setSelectedId(records[0]?.id ?? records[0]?.ticketId ?? null);
    }
  }, [records, selectedId]);

  // Keep the selected record in sync with the `id` search param — lets other
  // pages deep-link straight to a specific problem, e.g. /incident/problems?id=<record-id>.
  useEffect(() => {
    const paramId = searchParams.get("id");
    if (paramId) setSelectedId(paramId);
  }, [searchParams]);

  // Selecting a record locally should also push the id into the URL, so the
  // address bar always reflects what's open (and stays shareable/bookmarkable).
  const selectRecord = (id: string) => {
    setSelectedId(id);
    router.replace(`/incident/problems?id=${id}`, { scroll: false });
  };

  const [activeTab, setActiveTab] = useState("overview");
  const [density, setDensity] = useState<"comfortable" | "compact">(
    "comfortable",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Selection and Popover matrices
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [activePopover, setActivePopover] = useState<
    "filter" | "views" | "density" | null
  >(null);
  const [customViews, setCustomViews] = useState<any[]>([]);
  const [activeViewId, setActiveViewId] = useState("all");

  // Inline forms editors states
  const [completingStepIdx, setCompletingStepIdx] = useState<number | null>(
    null,
  );
  const [completionNote, setCompletionNote] = useState("");
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);

  // New Finding Composer parameters
  const [fType, setFType] = useState("Observation");
  const [fSource, setFSource] = useState("");
  const [fConf, setFConf] = useState("");
  const [fBody, setFBody] = useState("");

  // New Step Composer parameters
  const [newStepTitle, setNewStepTitle] = useState("");
  const [newStepDetail, setNewStepDetail] = useState("");
  const [newStepTags, setNewStepTags] = useState("");
  const [newStepChg, setNewStepChg] = useState("");

  // New Record Creator Form state
  const [newRecTitle, setNewRecTitle] = useState("");
  const [newRecPri, setNewRecPri] = useState("P1");
  const [newRecCat, setNewRecCat] = useState("Database");
  const [newRecOwner, setNewRecOwner] = useState("rel");
  const [newRecAssigneeEmail, setNewRecAssigneeEmail] = useState("");
  const [newRecSummary, setNewRecSummary] = useState("");

  // Multiselect advanced popover filters
  const [advancedFilters, setAdvancedFilters] = useState({
    pris: [] as string[],
    cats: [] as string[],
    owners: [] as string[],
    assignees: [] as string[],
    kb: "any",
    dateField: "opened",
    datePreset: "any",
  });

  const ezraLogRef = useRef<HTMLDivElement>(null);

  // Seed Timeline logs on state mount
  const computedRecords = useMemo(() => {
    return records.map((r: any) => {
      const recordOwner = r.assignee ?? { name: "System", role: "Automated" };
      const ev: any[] = [];
      ev.push({
        ts: formatShortDate(r.createdAt) + " · 00:00",
        author: recordOwner,
        t: "Problem record opened",
        d: "Matching incident signatures clustered into a single record.",
        ok: false,
      });
      r?.findings?.forEach((f: any) =>
        ev.push({
          ts: f.ts,
          author: f.author,
          t: "Finding added — " + f.type,
          d: f.body,
          ok: f.type === "Decision",
        }),
      );
      r?.steps?.forEach((s: any, i: number) => {
        if (s.done)
          ev.push({
            ts: s.at,
            author: s.by,
            t: "Step " + (i + 1) + " signed off",
            d: s.t + (s.note ? " — " + s.note : ""),
            ok: true,
          });
      });
      if (r.status === "Resolved")
        ev.push({
          ts: r.kb?.lastSynced || formatRelativeTime(r.updatedAt),
          author: recordOwner,
          t: "Record resolved and closed",
          d: "All remediation steps verified.",
          ok: true,
        });

      const timeline = ev.reverse().map((e: any) => ({
        ...e,
        hash: shortHash(
          e.ts +
            e.t +
            e.d +
            (typeof e.author === "string" ? e.author : e.author?.name),
        ),
      }));
      return { ...r, timeline };
    });
  }, [records]);

  const activeRecord =
    computedRecords.find((x: any) => x.id === selectedId) || null;

  // Real API records don't guarantee the same rich shape as the mock
  // fallback data — derive safe, always-defined views of the fields that
  // get accessed repeatedly below instead of optional-chaining every use.
  const activeSteps = activeRecord?.steps ?? [];
  const activeKb = activeRecord?.kb ?? {};

  // Real assignee names pulled from whatever records are actually loaded,
  // instead of a hardcoded roster.
  const dynamicAssignees = useMemo(() => {
    const seen = new Set<string>();
    computedRecords.forEach((r: any) => {
      if (r.assignee?.name) seen.add(r.assignee.name);
    });
    return Array.from(seen).sort();
  }, [computedRecords]);

  // ─── FILTER & SORT PROCESSING LOOP ───
  const processedRecords = useMemo(() => {
    return computedRecords
      .filter((r: any) => {
        if (statusFilter === "open" && r.status === "Resolved") return false;
        if (
          statusFilter !== "all" &&
          statusFilter !== "open" &&
          r.status !== statusFilter
        )
          return false;

        const af = advancedFilters;
        if (af.pris.length && !af.pris.includes(r.priority)) return false;
        if (af.cats.length && !af.cats.includes(r.category)) return false;
        if (af.owners.length && !af.owners.includes(r.owner)) return false;
        if (af.assignees.length && !af.assignees.includes(r.assignee?.name))
          return false;
        if (af.kb === "published" && !r.kb?.published) return false;
        if (af.kb === "unpublished" && r.kb?.published) return false;

        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matches =
            r.title?.toLowerCase().includes(q) ||
            r.id?.toLowerCase().includes(q) ||
            r.description?.toLowerCase().includes(q);
          if (!matches) return false;
        }
        return true;
      })
      .sort((a: any, b: any) => {
        if (sortBy === "priority")
          return (a.priority ?? "").localeCompare(b.priority ?? "");
        return 0;
      });
  }, [computedRecords, statusFilter, advancedFilters, searchQuery, sortBy]);

  // Bulk selectors operations handlers
  const isAllVisibleSelected =
    processedRecords.length > 0 &&
    processedRecords.every((r: any) => selectedRowIds.has(r.id));
  const isAnyVisibleSelected = processedRecords.some((r: any) =>
    selectedRowIds.has(r.id),
  );

  const handleToggleSelectAll = () => {
    if (isAllVisibleSelected) {
      const next = new Set(selectedRowIds);
      processedRecords.forEach((r: any) => next.delete(r.id));
      setSelectedRowIds(next);
    } else {
      const next = new Set(selectedRowIds);
      processedRecords.forEach((r: any) => next.add(r.id));
      setSelectedRowIds(next);
    }
  };

  const handleToggleRowCheckbox = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedRowIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRowIds(next);
  };

  // ─── MUTATIONS PACK ───
  const handleAddNewFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fBody.trim() || !selectedId) return;
    try {
      await customAxios.post(
        `${endpoint.problems.update}/${selectedId}/findings`,
        {
          type: fType,
          body: fBody.trim(),
          source: fSource.trim() || null,
          confidence: fConf ? Number(fConf) : null,
        },
      );
      await refetchProblems();
      setFBody("");
      setFSource("");
      setFConf("");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't save the finding — try again."));
    }
  };

  const handleSignoffStep = (idx: number) => {
    if (!selectedId) return;
    setCompletingStepIdx(idx);
  };

  const commitSignoffStep = async (idx: number) => {
    if (!selectedId) return;
    try {
      await customAxios.post(
        `${endpoint.problems.update}/${selectedId}/steps/${idx}/complete`,
        {
          note: completionNote,
        },
      );
      await refetchProblems();
      setCompletionNote("");
      setCompletingStepIdx(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't complete this step — try again."));
    }
  };

  const handleAddPlanStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepTitle.trim() || !selectedId) return;
    try {
      await customAxios.post(
        `${endpoint.problems.update}/${selectedId}/steps`,
        {
          title: newStepTitle.trim(),
          detail: newStepDetail.trim(),
          tags: newStepTags ? newStepTags.split(",").map((t) => t.trim()) : [],
          changeRequest: newStepChg.trim() || null,
        },
      );
      await refetchProblems();
      setNewStepTitle("");
      setNewStepDetail("");
      setNewStepTags("");
      setNewStepChg("");
      setIsAddingStep(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't add this step — try again."));
    }
  };

  const handleCreateProblemRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecTitle.trim()) return;

    const assigneeMember = members.find((m) => m.email === newRecAssigneeEmail);
    const assignee = assigneeMember
      ? {
          name:
            `${assigneeMember.firstname ?? ""} ${assigneeMember.lastname ?? ""}`.trim() ||
            assigneeMember.email,
          role: assigneeMember.role,
        }
      : undefined;

    try {
      const priorityMap: Record<string, string> = {
        P0: "CRITICAL",
        P1: "HIGH",
        P2: "MEDIUM",
        P3: "LOW",
      };
      const created = await createProblem({
        title: newRecTitle.trim(),
        priority: priorityMap[newRecPri] ?? "MEDIUM",
        category: newRecCat,
        description:
          newRecSummary.trim() ||
          "Investigation mapped from active telemetry configurations.",
        status: "Investigating",
        impact: "Service degradation",
        owner: newRecOwner,
        assignee,
      });

      await refetchProblems();
      if (created?.id) selectRecord(created.id);
      setIsNewRecordModalOpen(false);
      setNewRecTitle("");
      setNewRecSummary("");
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Couldn't create the problem record — try again."),
      );
    }
  };

  const handleToggleAdvancedFilter = (
    group: "pris" | "cats" | "owners" | "assignees",
    val: string,
  ) => {
    setAdvancedFilters((prev) => {
      const current = prev[group] as string[];
      const next = current.includes(val)
        ? current.filter((x) => x !== val)
        : [...current, val];
      return { ...prev, [group]: next };
    });
  };

  const sortDropdownItems: DropdownItem[] = [
    { value: "recent", label: "Sort: Most Recent" },
    { value: "priority", label: "Sort: Severity Priority" },
  ];

  const viewsDropdownItems: DropdownItem[] = [
    { type: "label", label: "Standard Views" },
    ...BUILTIN_VIEWS.map((v) => ({
      value: v.id,
      label: v.name,
      icon: v.icon,
      onClick: () => setActiveViewId(v.id),
    })),
    { type: "divider" },
    { type: "label", label: "Custom Views Operations" },
    {
      value: "save",
      label: "Save Current Filters Matrix",
      icon: <Bookmark size={13} />,
      onClick: () => alert("State filters configurations exported."),
    },
  ];

  const densityDropdownItems: DropdownItem[] = [
    {
      value: "comfortable",
      label: "Comfortable Row Height",
      icon: <List size={13} />,
      onClick: () => setDensity("comfortable"),
    },
    {
      value: "compact",
      label: "Compact Density View",
      icon: <Layers size={13} />,
      onClick: () => setDensity("compact"),
    },
  ];

  // Wire resolve to real API
  const handleResolveRecord = async (id: string) => {
    try {
      await updateProblem(id, { status: "Resolved" });
      await refetchProblems();
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't resolve this record — try again."));
    }
  };

  const openCount = records.filter((r: any) => r.status !== "Resolved").length;
  const knownErrorCount = records.filter(
    (r: any) => r.status === "Known Error",
  ).length;
  const resolvedCount = records.filter(
    (r: any) => r.status === "Resolved",
  ).length;
  const kbCount = records.filter((r: any) => r.kb?.published).length;

  return (
    <div className="bg-[#F6F7F9] dark:bg-zinc-950 text-[#161A22] dark:text-zinc-100 min-h-screen font-ibm antialiased pb-20 selection:bg-emerald-500/20">
      {/* ─── CONTENT HERO BREADCRUMBS LAYER ─── */}
      <div className="max-w-[1540px] mx-auto px-7 pt-6 space-y-4">
        <div className="flex flex-col gap-4 border-b border-zinc-200 dark:border-zinc-700 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100">
              Problem Records
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-500 max-w-2xl mt-1 leading-relaxed">
              Recurring architectural failures correlated into structural
              root-cause registries. Append findings logs and authorize
              execution blocks.
            </p>
          </div>

          {/* Statistics matrix logs */}
          <div className="grid grid-cols-2 md:grid-cols-4  border border-zinc-200 dark:border-zinc-700 rounded-sm overflow-hidden shadow-2xs bg-white dark:bg-zinc-900/40">
            <StatsCard value={problemsLoading ? "…" : openCount} label="Open" />
            <StatsCard
              value={problemsLoading ? "…" : knownErrorCount}
              label="Known Error"
            />
            <StatsCard
              value={problemsLoading ? "…" : resolvedCount}
              label="Resolved"
            />
            <StatsCard
              value={problemsLoading ? "…" : kbCount}
              label="KB Articles"
            />
          </div>
        </div>
      </div>

      {/* ─── WORKSPACE CONTROLS TOOLBAR ─── */}
      <div className="max-w-[1540px] mx-auto px-7 py-3 flex flex-wrap items-center gap-3">
        {/* Status Segments bar */}
        <div className="flex rounded-lg bg-gray-100/70 dark:bg-zinc-800/60 p-1 shadow-2xs gap-1">
          {["all", "Investigating", "Known Error", "Resolved"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-semibold rounded-md capitalize ${statusFilter === st ? "bg-white dark:bg-zinc-700 text-black dark:text-zinc-100 shadow-xs" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* IMPLEMENTING USER DROPDOWN COMPONENT EXACTLY FOR SORTING */}
          <Dropdown
            items={sortDropdownItems}
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            align="left"
          />

          {/* IMPLEMENTING USER DROPDOWN COMPONENT EXACTLY FOR VIEWS */}
          <Dropdown
            items={viewsDropdownItems}
            value={activeViewId}
            onChange={(val) => setActiveViewId(val)}
            align="right"
          />

          {/* IMPLEMENTING USER DROPDOWN COMPONENT EXACTLY FOR DENSITY CONFIG */}

          <div className="relative">
            <button
              onClick={() =>
                setActivePopover(activePopover === "filter" ? null : "filter")
              }
              className={`h-8.5 p-2 rounded-lg border text-sm font-semibold flex items-center gap-1.5 shadow-2xs bg-white dark:bg-zinc-900/40 transition-all ${activePopover === "filter" ? "border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50/20 dark:bg-emerald-500/10" : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
            >
              <SlidersHorizontal size={13} /> Filters Grid
            </button>

            {activePopover === "filter" && (
              <div className="absolute right-0 mt-2 w-[380px] max-w-[calc(100vw-24px)] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn text-xs flex flex-col font-ibm text-[#161A22] dark:text-zinc-100">
                {/* Panel Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    Advanced Filter Config
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setAdvancedFilters({
                        pris: [],
                        cats: [],
                        owners: [],
                        assignees: [],
                        kb: "any",
                        dateField: "opened",
                        datePreset: "any",
                      })
                    }
                    className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Reset all
                  </button>
                </div>

                {/* Panel Body Elements Scroll */}
                <div className="p-4 space-y-4 max-h-[440px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 scrollbar-thin">
                  {/* Section: Date & Time parameters */}
                  <div className="space-y-2 pb-2">
                    <label className="text-[10px]  font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase block">
                      Date Constraints
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={advancedFilters.dateField}
                        onChange={(e) =>
                          setAdvancedFilters((prev) => ({
                            ...prev,
                            dateField: e.target.value,
                          }))
                        }
                        className=" border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 dark:text-zinc-200 rounded-lg text-xs font-medium p-2 outline-none flex-1 cursor-pointer"
                      >
                        <option value="opened">Opened Date</option>
                        <option value="activity">Last Activity</option>
                        <option value="incident">Incident Window Date</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {["any", "7d", "30d", "90d"].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() =>
                            setAdvancedFilters((prev) => ({
                              ...prev,
                              datePreset: preset,
                            }))
                          }
                          className={`h-7 rounded border text-[11px] font-semibold transition-all ${advancedFilters.datePreset === preset ? "bg-zinc-950 text-white border-zinc-950" : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
                        >
                          {preset === "any" ? "Any time" : preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section: Priority Code Options Grid */}
                  <div className="space-y-2 pt-3 pb-1">
                    <span className="text-[10px]  font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase block">
                      Severity Scale
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {["P0", "P1", "P2", "P3"].map((p) => {
                        const active = advancedFilters.pris.includes(p);
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() =>
                              handleToggleAdvancedFilter("pris", p)
                            }
                            className={`px-3 h-8 border rounded-lg flex items-center gap-2  text-[11px] font-bold transition-all ${active ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
                          >
                            <span
                              className={`w-3 h-3 rounded-sm border flex items-center justify-center text-[8px] text-white ${active ? "bg-emerald-600 border-emerald-600" : "border-zinc-300 dark:border-zinc-600"}`}
                            >
                              {active && "✓"}
                            </span>
                            <span>{p}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section: Infrastructure Categories */}
                  <div className="space-y-2 pt-3 pb-1">
                    <span className="text-[10px]  font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase block">
                      Type Category
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        "Database",
                        "Network",
                        "Compute",
                        "Application",
                        "Security",
                        "Data",
                      ].map((c) => {
                        const active = advancedFilters.cats.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() =>
                              handleToggleAdvancedFilter("cats", c)
                            }
                            className={`px-3 h-8 border rounded-lg flex items-center gap-2 font-medium transition-all ${active ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
                          >
                            <span
                              className={`w-3 h-3 rounded-sm border flex items-center justify-center text-[8px] text-white ${active ? "bg-emerald-600 border-emerald-600" : "border-zinc-300 dark:border-zinc-600"}`}
                            >
                              {active && "✓"}
                            </span>
                            <span>{c}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section: Owning team lists grids */}
                  <div className="space-y-2 pt-3 pb-1">
                    <span className="text-[10px]  font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase block">
                      Owning Operational Team
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(OWNERS).map(([key, value]) => {
                        const active = advancedFilters.owners.includes(key);
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() =>
                              handleToggleAdvancedFilter("owners", key)
                            }
                            className={`px-3 h-8 border rounded-lg flex items-center gap-2 font-medium transition-all ${active ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
                          >
                            <span
                              className={`w-3 h-3 rounded-sm border flex items-center justify-center text-[8px] text-white ${active ? "bg-emerald-600 border-emerald-600" : "border-zinc-300 dark:border-zinc-600"}`}
                            >
                              {active && "✓"}
                            </span>
                            <span>{value}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section: Assignees */}
                  <div className="space-y-2 pt-3">
                    <span className="text-[10px]  font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase block">
                      Assigned Problem Manager
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {dynamicAssignees.length === 0 && (
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 italic">
                          No assignees on loaded records yet.
                        </span>
                      )}
                      {dynamicAssignees.map((name) => {
                        const active = advancedFilters.assignees.includes(name);
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() =>
                              handleToggleAdvancedFilter("assignees", name)
                            }
                            className={`px-3 h-8 border rounded-lg flex items-center gap-2 font-medium transition-all ${active ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
                          >
                            <span
                              className={`w-3 h-3 rounded-sm border flex items-center justify-center text-[8px] text-white ${active ? "bg-emerald-600 border-emerald-600" : "border-zinc-300 dark:border-zinc-600"}`}
                            >
                              {active && "✓"}
                            </span>
                            <span>{name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer panel configurations summary */}
                <div className="p-3 border-t dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-800/60 flex items-center justify-between gap-2">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium font-serif">
                    {processedRecords.length} records matching
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePopover(null)}
                    className="h-8 px-4 bg-zinc-950 text-white font-bold text-xs rounded-lg shadow-sm hover:bg-zinc-800 transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-1" />

          <Button
            onClick={() => setIsNewRecordModalOpen(true)}
            size="sm"
            leftIcon={<Plus size={14} />}
          >
            New Record
          </Button>
        </div>
      </div>

      {/* ─── DUAL-COLUMN WORKSPACE ─── */}
      <div className="max-w-[1540px] mx-auto px-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-2">
        {/* LEFT RAIL */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-3 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-140px)] sticky top-20">
          <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between relative select-none">
            <label className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer">
              <input
                type="checkbox"
                checked={isAllVisibleSelected}
                onChange={handleToggleSelectAll}
                className="accent-emerald-500 h-3.5 w-3.5 rounded"
              />
              Records Feed
            </label>
            <span className=" text-[11px] text-zinc-400 dark:text-zinc-500">
              ({processedRecords.length} items)
            </span>

            {isAnyVisibleSelected && (
              <div className="absolute inset-0 bg-zinc-950 text-white px-3 flex items-center justify-between text-xs font-bold animate-fadeIn z-10">
                <span>{selectedRowIds.size} selected</span>
                <div className="flex gap-2 text-[11px]">
                  <button
                    onClick={() => {
                      alert("Exporting selection.");
                      setSelectedRowIds(new Set());
                    }}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Export
                  </button>
                  <button
                    onClick={async () => {
                      await Promise.allSettled(
                        Array.from(selectedRowIds).map((id) =>
                          handleResolveRecord(id),
                        ),
                      );
                      setSelectedRowIds(new Set());
                    }}
                    className="text-emerald-400 font-bold"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => setSelectedRowIds(new Set())}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 flex-1">
            {processedRecords.map((r: any) => {
              const active = r.id === selectedId;
              const isChecked = selectedRowIds.has(r.id);
              const pct = r?.steps?.length
                ? Math.round(
                    (r.steps.filter((x: any) => x.done).length /
                      r.steps.length) *
                      100,
                  )
                : 0;
              const isDone = r.status === "Resolved";

              return (
                <div
                  key={r.id}
                  onClick={() => {
                    selectRecord(r.id);
                    setActiveTab("overview");
                  }}
                  className={`p-4 cursor-pointer transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/60 relative group border-l-2 ${
                    active ? "bg-blue-50/60 dark:bg-blue-500/10" : "border-l-transparent"
                  } ${isChecked ? "bg-zinc-50 dark:bg-zinc-800/60" : ""}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleToggleRowCheckbox(r.id, e as any)}
                      className="accent-emerald-500 h-3 w-3 rounded opacity-0 group-hover:opacity-100 checked:opacity-100 transition-opacity"
                    />
                    <div className="flex items-center gap-2">
                      <span className=" text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
                        {r.ticketId}
                      </span>
                      {/* Priority badge */}
                      <span
                        className={`  text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          r.priority === "P0"
                            ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                            : r.priority === "P1"
                              ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400"
                              : r.priority === "P2"
                                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        {r.priority}
                      </span>
                    </div>
                  </div>

                  <h4
                    className={`font-semibold text-zinc-900 dark:text-zinc-100 leading-snug mb-2 ${
                      density === "compact"
                        ? "text-xs line-clamp-1"
                        : "text-[13.5px] line-clamp-2"
                    }`}
                  >
                    {r.title}
                  </h4>

                  <div className="flex items-center gap-4 text-[11px]  text-zinc-400 dark:text-zinc-500 mb-2">
                    <span>{r.findings?.length ?? 0} findings</span>
                    <span>{formatRelativeTime(r.updatedAt)}</span>
                  </div>
                </div>
              );
            })}

            {processedRecords.length === 0 && (
              <div className="p-10 text-center text-sm text-zinc-400 dark:text-zinc-500 italic">
                {problemsLoading
                  ? "Loading problem records…"
                  : "No records match the current filter."}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT DETAIL PANEL */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-9 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
          {activeRecord ? (
            <div className="animate-fadeIn">
              {/* Detail header */}
              <div className="px-7 pt-6 pb-0">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className=" text-[10.5px] text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 px-2 py-0.5 rounded border border-zinc-100 dark:border-zinc-800">
                    {activeRecord?.ticketId}
                  </span>

                  <div className="flex gap-2 ml-auto">
                    {activeRecord.status !== "Resolved" ? (
                      <Button
                        onClick={() => handleResolveRecord(activeRecord.id)}
                        size="sm"
                      >
                        Resolve &amp; close record
                      </Button>
                    ) : (
                      <span className="h-8 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-100 dark:border-emerald-500/20 text-xs flex items-center gap-1.5">
                        <CheckCircle2 size={13} /> Resolution verified
                      </span>
                    )}
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100 leading-snug mb-5">
                  {activeRecord.title}
                </h2>

                {/* Meta grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 py-4 border-t border-zinc-100 dark:border-zinc-800">
                  {[
                    {
                      label: "Owning team",
                      value:
                        OWNERS[activeRecord.owner] || activeRecord.owner || "—",
                    },
                    {
                      label: "Assignee",
                      value: activeRecord.assignee?.name || "Unassigned",
                    },
                    {
                      label: "Impact / Urgency",
                      value:
                        [activeRecord.impact, activeRecord.urgency]
                          .filter(Boolean)
                          .join(" / ") || "—",
                    },
                    {
                      label: "Opened",
                      value: formatShortDate(activeRecord.createdAt),
                    },
                    {
                      label: "Watchers",
                      value:
                        typeof activeRecord.watchers === "number"
                          ? `${activeRecord.watchers} operators`
                          : "—",
                    },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className=" text-[9.5px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
                        {label}
                      </p>
                      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress strip */}
              {(() => {
                const total = activeSteps.length;
                const done = activeSteps.filter((x: any) => x.done).length;
                const pct = total ? Math.round((done / total) * 100) : 0;
                const full = pct === 100;
                return (
                  <div className="flex items-center gap-4 px-7 py-3 bg-zinc-50/60 dark:bg-zinc-800/60 border-y border-zinc-100 dark:border-zinc-800">
                    <span className=" text-xs font-bold text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                      Permanent resolution <strong>{pct}</strong>%
                    </span>
                    <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: full ? "#00C896" : "#1A4FA0",
                        }}
                      />
                    </div>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      <b className="text-zinc-900 dark:text-zinc-100 font-bold">{done}</b> of{" "}
                      <b className="text-zinc-900 dark:text-zinc-100 font-bold">{total}</b> steps
                      complete
                    </span>
                  </div>
                );
              })()}

              {/* Tabs */}
              <div className="flex gap-0 px-7 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 overflow-x-auto">
                {[
                  { id: "overview", label: "Overview" },
                  {
                    id: "findings",
                    label: "Findings",
                    count: activeRecord.findings?.length ?? 0,
                  },
                  {
                    id: "resolution",
                    label: "Resolution",
                    count: `${activeSteps.filter((x: any) => x.done).length}/${activeSteps.length}`,
                  },
                  {
                    id: "kb",
                    label: "Knowledge Base",
                    count: activeKb.published ? "synced" : "draft",
                  },
                  {
                    id: "activity",
                    label: "Activity",
                    count: activeRecord.timeline?.length ?? 0,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3.5 mr-6 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                      activeTab === tab.id
                        ? "border-emerald-500 text-zinc-900 dark:text-zinc-100"
                        : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                  >
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className=" text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-7 min-h-[260px]">
                {/* OVERVIEW TAB */}
                {activeTab === "overview" && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Summary */}
                    <div>
                      <p className=" text-[9.5px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
                        Summary
                      </p>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50/50 dark:bg-zinc-800/60 p-4 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                        {activeRecord.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {/* Root cause card — two column with confidence ring */}
                      <div className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50/40 dark:bg-zinc-800/60 flex gap-4 items-start">
                        {/* Confidence ring */}
                        <div className="shrink-0 flex flex-col items-center gap-1 pt-1">
                          <svg width="64" height="64" viewBox="0 0 64 64">
                            <circle
                              cx="32"
                              cy="32"
                              r="26"
                              fill="none"
                              stroke="#E8EAEF"
                              strokeWidth="6"
                            />
                            <circle
                              cx="32"
                              cy="32"
                              r="26"
                              fill="none"
                              stroke="#067A5C"
                              strokeWidth="6"
                              strokeLinecap="round"
                              strokeDasharray={`${((activeRecord.confidence ?? 0) / 100) * 163.4} 163.4`}
                              transform="rotate(-90 32 32)"
                            />
                            <text
                              x="32"
                              y="32"
                              dy="0.3em"
                              textAnchor="middle"
                              fontSize="13"
                              fontWeight="800"
                              fill="#067A5C"
                              fontFamily="inherit"
                            >
                              {activeRecord.confidence ?? 0}%
                            </text>
                          </svg>
                          <span className=" text-[8.5px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                            match
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className=" text-[9.5px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
                            Root cause
                          </p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            {activeRecord.rootCauseNote || "Not yet determined."}
                          </p>
                        </div>
                      </div>

                      {/* Proposed fix */}
                      {activeRecord.proposedFix && (
                        <div className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50/40 dark:bg-zinc-800/60 flex gap-3 items-start">
                          <AlertCircle
                            size={18}
                            className="text-amber-500 shrink-0 mt-0.5"
                          />
                          <div>
                            <p className="font-bold text-black dark:text-zinc-100 text-sm mb-1">
                              Proposed fix
                            </p>
                            <p className="text-xs text-gray-900/80 dark:text-zinc-300 leading-relaxed">
                              {activeRecord.proposedFix}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Affected services */}
                    {(activeRecord.services?.length ?? 0) > 0 && (
                      <div>
                        <p className=" text-[9.5px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">
                          Affected services
                        </p>
                        <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
                          {activeRecord.services.map(
                            (svc: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 px-4 py-3"
                              >
                                <span className=" text-sm text-zinc-700 dark:text-zinc-300 flex-1">
                                  {svc.n}
                                </span>
                                <span
                                  className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${svc.cls}`}
                                >
                                  {svc.i}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* FINDINGS TAB */}
                {activeTab === "findings" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 rounded-lg px-3 py-2">
                      <Lock size={12} />
                      Findings are immutable once appended. Authorship is
                      stamped on sign-off.
                    </div>

                    <form
                      onSubmit={handleAddNewFinding}
                      className="border border-zinc-200 dark:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-800/60 p-4 rounded-xl space-y-3"
                    >
                      <div className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <Plus size={14} className="text-emerald-600" /> Log
                        diagnostic observation
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <select
                          value={fType}
                          onChange={(e) => setFType(e.target.value)}
                          className="h-9 border px-2 text-sm font-semibold bg-white dark:bg-zinc-900 dark:text-zinc-200 rounded-lg outline-none border-zinc-200 dark:border-zinc-700 focus:border-emerald-500"
                        >
                          {[
                            "Observation",
                            "Evidence",
                            "Hypothesis",
                            "Test result",
                            "Decision",
                          ].map((x) => (
                            <option key={x}>{x}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Source / telemetry reference..."
                          value={fSource}
                          onChange={(e) => setFSource(e.target.value)}
                          className="h-9 border px-3 text-sm bg-white dark:bg-zinc-900 dark:text-zinc-200 rounded-lg outline-none col-span-2 border-zinc-200 dark:border-zinc-700 focus:border-emerald-500"
                        />
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Type observations here. Once appended, entries cannot be modified."
                        value={fBody}
                        onChange={(e) => setFBody(e.target.value)}
                        className="w-full text-sm border p-3 rounded-lg bg-white dark:bg-zinc-900 dark:text-zinc-200 outline-none leading-relaxed resize-y border-zinc-200 dark:border-zinc-700 focus:border-emerald-500"
                      />
                      <div className="flex justify-end">
                        <Button type="submit" size="sm">
                          Append finding
                        </Button>
                      </div>
                    </form>

                    <div className="space-y-3">
                      {Array.from(activeRecord.findings ?? [])
                        .reverse()
                        .map((f: any, i: number) => (
                          <div
                            key={i}
                            className="p-4 border border-zinc-100 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/40 space-y-2"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2 py-0.5 rounded border  font-bold text-[10px] uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700">
                                {f.type}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="bg-blue-900 text-white rounded-md size-7 text-sm justify-center items-center flex uppercase">
                                  {f?.author?.name?.slice(0, 2)}
                                </div>
                                <span className="text-sm">
                                  {f?.author?.name}
                                </span>
                              </div>
                              {f.conf && (
                                <span className=" text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                                  {f.conf}% confidence
                                </span>
                              )}
                              <span className=" text-[11px] text-zinc-400 dark:text-zinc-500 ml-auto">
                                {f.ts}
                              </span>
                            </div>
                            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                              {f.body}
                            </p>
                            {f.source && (
                              <p className=" text-[11px] text-blue-700 dark:text-blue-400 font-semibold">
                                ↳ {f.source}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* RESOLUTION TAB */}
                {activeTab === "resolution" && (
                  <div className="space-y-3 animate-fadeIn">
                    {activeSteps.map((step: any, idx: number) => {
                      const isCompleting = completingStepIdx === idx;
                      return (
                        <div
                          key={idx}
                          className={`p-4 border rounded-xl space-y-2 text-sm transition-all ${
                            step.done
                              ? "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-500/10"
                              : "border-zinc-200 dark:border-zinc-700"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={step.done}
                              onChange={() => handleSignoffStep(idx)}
                              className="accent-emerald-600 h-4 w-4 rounded shrink-0 mt-0.5 cursor-pointer"
                            />
                            <div className="flex-1 space-y-1">
                              <p className=" text-[9.5px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                                Step {idx + 1}
                              </p>
                              <h4 className="font-bold text-zinc-950 dark:text-zinc-100 text-[13.5px] leading-tight">
                                {step.t}
                              </h4>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                {step.d}
                              </p>
                              {step.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {step.tags.map((tag: any) => (
                                    <span
                                      key={tag}
                                      className=" text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {isCompleting && !step.done && (
                            <div className="bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 p-3 rounded-lg flex gap-2 items-center animate-fadeIn">
                              <input
                                type="text"
                                placeholder="Optional validation note or change request..."
                                value={completionNote}
                                onChange={(e) =>
                                  setCompletionNote(e.target.value)
                                }
                                className="h-8 text-xs px-2.5 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 dark:text-zinc-200 flex-1 rounded-lg outline-none focus:border-emerald-500"
                              />
                              <button
                                type="button"
                                onClick={() => commitSignoffStep(idx)}
                                className="h-8 px-3 bg-emerald-600 text-white rounded-lg font-semibold text-xs"
                              >
                                Authorize
                              </button>
                              <button
                                type="button"
                                onClick={() => setCompletingStepIdx(null)}
                                className="h-8 px-2.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          )}

                          {step.done && step.by && (
                            <div className="text-[11px]  text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-500/10 p-2 rounded-lg border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-1.5 mt-1">
                              <CheckCircle2 size={12} /> Verified · {step.at}
                              {step.note ? ` — "${step.note}"` : ""}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {isAddingStep ? (
                      <form
                        onSubmit={handleAddPlanStep}
                        className="border border-zinc-200 dark:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-800/60 p-4 rounded-xl space-y-3 text-sm animate-fadeIn"
                      >
                        <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                          Add resolution step
                        </p>
                        <input
                          type="text"
                          placeholder="Step title..."
                          value={newStepTitle}
                          onChange={(e) => setNewStepTitle(e.target.value)}
                          className="h-9 w-full border border-zinc-200 dark:border-zinc-700 px-3 rounded-lg outline-none bg-white dark:bg-zinc-900 dark:text-zinc-200 text-sm focus:border-emerald-500"
                        />
                        <textarea
                          placeholder="How will this be validated?"
                          value={newStepDetail}
                          onChange={(e) => setNewStepDetail(e.target.value)}
                          className="w-full border border-zinc-200 dark:border-zinc-700 p-2.5 rounded-lg bg-white dark:bg-zinc-900 dark:text-zinc-200 outline-none leading-relaxed text-sm resize-y focus:border-emerald-500"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setIsAddingStep(false)}
                            className="h-8 px-3 text-zinc-500 dark:text-zinc-400 text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="h-8 px-4 bg-zinc-950 text-white font-semibold rounded-lg text-sm"
                          >
                            Add step
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setIsAddingStep(true)}
                        className="w-full h-10 border border-dashed border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 rounded-xl text-sm font-semibold text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Plus size={14} /> Add resolution step
                      </button>
                    )}
                  </div>
                )}

                {/* KB TAB */}
                {activeTab === "kb" && (
                  <div className="space-y-5 animate-fadeIn">
                    {/* Status card */}
                    <div className="flex items-center gap-4 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50/60 dark:bg-zinc-800/60 flex-wrap">
                      {/* Icon */}
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          activeKb.published ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-zinc-100 dark:bg-zinc-800"
                        }`}
                      >
                        {activeKb.published ? (
                          <BookOpen size={20} className="text-emerald-600" />
                        ) : (
                          <FileText size={20} className="text-zinc-400 dark:text-zinc-500" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                          {activeKb.published
                            ? "Published to knowledge base"
                            : "Not yet published"}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 margin-top:2px">
                          {activeKb.published ? (
                            <>
                              Article{" "}
                              <span className="text-emerald-700 dark:text-emerald-400 font-semibold font-mono">
                                {activeKb.articleId}
                              </span>{" "}
                              &middot; last synced {activeKb.lastSynced}
                            </>
                          ) : (
                            "Publish this record to generate a searchable knowledge base article for support and on-call teams."
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ACTIVITY TAB */}
                {activeTab === "activity" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 rounded-lg px-3 py-2">
                      <Lock size={12} />
                      Complete audit trail &bull; every entry is attributed,
                      timestamped and content-hashed. This log is append-only.
                    </div>

                    <div className="relative pl-6 border-l border-zinc-200 dark:border-zinc-700 ml-3 space-y-6">
                      {(activeRecord.timeline ?? []).map((item: any, idx: number) => {
                        const isStringAuthor = typeof item.author === "string";
                        const authorName = isStringAuthor
                          ? item.author
                          : item.author?.name;
                        const authorInitials =
                          item.author?.init ||
                          authorName
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("") ||
                          "??";

                        return (
                          <div key={item.hash || idx} className="relative">
                            {/* Timeline Node Ring Marker */}
                            <div
                              className={`absolute -left-[30px] top-1.5 w-2 h-2 rounded-full border bg-white dark:bg-zinc-900 ${item.ok ? "border-emerald-500 ring-4 ring-emerald-50 dark:ring-emerald-500/10" : "border-blue-500 ring-4 ring-blue-50 dark:ring-blue-500/10"}`}
                            />

                            <div className="space-y-1 text-xs">
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500 ">
                                <span className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100/50 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded font-sans font-medium flex items-center gap-1.5">
                                  {/* <span className="w-6 h-6 rounded bg-blue-700 text-white text-[8px] flex items-center justify-center font-bold ">
                                    {authorInitials}
                                  </span> */}
                                  {authorName}
                                </span>
                                <span>&bull;</span>
                                <span>{item.ts}</span>
                                <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-100/30 dark:border-emerald-500/20">
                                  <Lock size={10} /> {item.hash}
                                </span>
                              </div>
                              <h5 className="font-bold text-zinc-950 dark:text-zinc-100 text-[13.5px] tracking-tight">
                                {item.t}
                              </h5>
                              <p className="text-zinc-500 dark:text-zinc-400 font-normal leading-relaxed text-xs">
                                {item.d}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-sm text-zinc-400 dark:text-zinc-500 italic">
              {problemsLoading
                ? "Loading problem records…"
                : "Select a record from the left rail to load its investigation workspace."}
            </div>
          )}
        </div>
      </div>

      {/* ─── MODAL DIALOGS INJECTION MATRICES ─── */}
      {isNewRecordModalOpen && (
        <div
          className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsNewRecordModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border dark:border-zinc-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-growIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b dark:border-zinc-700 pb-2 flex justify-between items-center">
              <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-100">
                Open Corporate Problem Record
              </h3>
              <button
                onClick={() => setIsNewRecordModalOpen(false)}
                className="p-1 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={handleCreateProblemRecord}
              className="space-y-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              <div className="flex flex-col gap-1">
                <label>Problem Record Summary Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Intermittent timeout spikes breaking notifications service layers"
                  value={newRecTitle}
                  onChange={(e) => setNewRecTitle(e.target.value)}
                  className="h-9 px-3 border dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 outline-none font-medium text-zinc-800 dark:text-zinc-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label>Severity Level</label>
                  <select
                    value={newRecPri}
                    onChange={(e) => setNewRecPri(e.target.value)}
                    className="h-9 px-2 border dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 dark:text-zinc-200 cursor-pointer outline-none"
                  >
                    <option>P0</option>
                    <option>P1</option>
                    <option>P2</option>
                    <option>P3</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label>Infrastructure Category</label>
                  <select
                    value={newRecCat}
                    onChange={(e) => setNewRecCat(e.target.value)}
                    className="h-9 px-2 border dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 dark:text-zinc-200 cursor-pointer outline-none"
                  >
                    <option>Database</option>
                    <option>Network</option>
                    <option>Compute</option>
                    <option>Application</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label>Owning Team</label>
                  <select
                    value={newRecOwner}
                    onChange={(e) => setNewRecOwner(e.target.value)}
                    className="h-9 px-2 border dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 dark:text-zinc-200 cursor-pointer outline-none"
                  >
                    {Object.entries(OWNERS).map(([code, label]) => (
                      <option key={code} value={code}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label>Assign To</label>
                  <select
                    value={newRecAssigneeEmail}
                    onChange={(e) => setNewRecAssigneeEmail(e.target.value)}
                    className="h-9 px-2 border dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 dark:text-zinc-200 cursor-pointer outline-none"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => {
                      const n =
                        `${m.firstname ?? ""} ${m.lastname ?? ""}`.trim() ||
                        m.email;
                      return (
                        <option key={m.id} value={m.email}>
                          {n} ({m.email})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label>Overview Summary Narrative</label>
                <textarea
                  rows={3}
                  placeholder="Recount the recurring error trends or cluster patterns being compiled..."
                  value={newRecSummary}
                  onChange={(e) => setNewRecSummary(e.target.value)}
                  className="w-full p-2.5 border dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 outline-none font-medium leading-relaxed resize-y text-zinc-800 dark:text-zinc-200"
                />
              </div>
              <div className="pt-2 border-t dark:border-zinc-700 flex justify-end gap-2 font-bold">
                <button
                  type="button"
                  onClick={() => setIsNewRecordModalOpen(false)}
                  className="h-9 px-4 border dark:border-zinc-700 rounded-lg text-zinc-500 dark:text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm"
                >
                  Establish Record Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
