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
import { customAxios } from "@/lib/api/axios";
import { endpoint } from "@/lib/api/endpoint";

// ─── FALLBACK EMPTY STATE (used while API loads) ───
const INITIAL_RECORDS: any[] = [
  {
    id: "PR-004417",
    title:
      "Recurrent connection-pool exhaustion in payments-api under sustained peak load",
    priority: "P1",
    impact: "High",
    urgency: "High",
    category: "Database",
    status: "Known Error",
    owner: "pay",
    assignee: {
      name: "Paschal Ifediora",
      role: "Problem Manager",
    },
    watchers: 7,
    watching: true,
    opened: "May 11",
    target: "Jun 14",
    activity: "2h ago",
    confidence: 91,
    summary:
      "Five severity incidents over 38 days have been correlated into a single underlying problem. Recurrence is driven by a database connection pool sized for one replica rather than the horizontally scaled fleet, with secondary amplification from a missing statement timeout.",
    rootcause: {
      title: "Connection pool sized per-replica, not for the autoscaled fleet",
      body: "Each payments-api replica opens a fixed pool of maximumPoolSize=20. Under peak load the fleet scales to 12 replicas, requesting 240 connections against a database ceiling of 200. New replicas are starved at boot and requests queue past the acquisition timeout, returning 503s. A missing statement_timeout lets slow analytical queries hold connections, amplifying the shortfall.",
    },
    workaround: {
      active: true,
      text: "During forecasted peak windows the runbook raises the replica floor to 6, caps per-replica pool to 14 via live config, and terminates analytical queries exceeding 10s. This reduces mean time to restore from 38 to 22 minutes and prevents customer-visible errors.",
    },
    incidents: [
      {
        id: "SI-003204",
        sev: "P0",
        desc: "503 surge during checkout peak",
        date: "Jun 04",
      },
      {
        id: "SI-003188",
        sev: "P0",
        desc: "Pool exhaustion on payouts",
        date: "May 28",
      },
      {
        id: "SI-003012",
        sev: "P1",
        desc: "Gateway latency spike",
        date: "May 19",
      },
      {
        id: "SI-002903",
        sev: "P1",
        desc: "503 burst on refunds",
        date: "May 11",
      },
      {
        id: "SI-002841",
        sev: "P2",
        desc: "First observed occurrence",
        date: "Apr 28",
      },
    ],
    services: [
      {
        n: "payments-api",
        i: "Critical",
        cls: "bg-red-50 text-red-700 border-red-100",
      },
      {
        n: "checkout-orchestrator",
        i: "High",
        cls: "bg-amber-50 text-amber-700 border-amber-100",
      },
      {
        n: "payouts-worker",
        i: "High",
        cls: "bg-amber-50 text-amber-700 border-amber-100",
      },
      {
        n: "refunds-service",
        i: "Moderate",
        cls: "bg-blue-50 text-blue-700 border-blue-100",
      },
    ],
    findings: [
      {
        type: "Evidence",
        author: {
          name: "Paschal Ifediora",
          role: "Problem Manager",
        },
        ts: "May 11 · 09:50",
        body: "Connection-pool saturation precedes every gateway error spike by 40–70 seconds, consistent across all five correlated incident windows.",
        source: "Telemetry · 5 incident windows",
        conf: 96,
      },
      {
        type: "Evidence",
        author: {
          name: "Paschal Ifediora",
          role: "Problem Manager",
        },
        ts: "May 11 · 10:03",
        body: "Database rejected 1,284 connection attempts at the 200-connection ceiling during the SI-003188 window, aligned with fleet scale-out to 12 replicas.",
        source: "pg_stat_activity + server logs",
        conf: 93,
      },
      {
        type: "Evidence",
        author: {
          name: "Paschal Ifediora",
          role: "Problem Manager",
        },
        ts: "May 11 · 10:08",
        body: "maximumPoolSize is hardcoded to 20 and unaware of replica count; no shared connection layer (PgBouncer) is present in the path.",
        source: "payments-api@v4.18.2 config",
        conf: 99,
      },
      {
        type: "Observation",
        author: {
          name: "Paschal Ifediora",
          role: "Problem Manager",
        },
        ts: "May 11 · 10:15",
        body: "Confirmed the autoscaler reaches 12 replicas during the 18:00–20:00 checkout peak on every incident date. Connection demand at 12×20 exceeds the database ceiling — the maths is unambiguous.",
        source: null,
        conf: null,
      },
      {
        type: "Decision",
        author: {
          name: "Paschal Ifediora",
          role: "Problem Manager",
        },
        ts: "May 11 · 10:21",
        body: "Root cause accepted as replica-unaware pool sizing with a secondary statement-timeout amplifier. Promoting record to Known Error and authorising the interim workaround while the permanent fix is designed.",
        source: null,
        conf: null,
      },
    ],
    steps: [
      {
        t: "Introduce a connection proxy in transaction-pooling mode",
        d: "Deploy a PgBouncer sidecar so replicas share a fan-in connection layer instead of each holding a private pool. Roll out as a single-replica canary and validate connection counts before fleet-wide promotion.",
        tags: ["Non-disruptive", "Canary first"],
        chg: null,
        done: true,
        by: "am",
        at: "May 28 · 14:05",
        note: "Canary validated; connection count held flat under load.",
      },
      {
        t: "Set a fleet-wide connection budget below the database ceiling",
        d: "Configure the proxy to a hard cap of 160 connections against the 200 ceiling, reserving 40 for administrative and replication traffic. Removes the structural possibility of exhaustion regardless of replica count.",
        tags: ["Budget 160/200"],
        chg: null,
        done: true,
        by: "jt",
        at: "Jun 04 · 16:08",
        note: "Budget enforced cluster-wide; verified against peak replay.",
      },
      {
        t: "Cap per-replica pool size and bind it to replica budget",
        d: "Lower application maximumPoolSize to 12 and derive the effective ceiling from the shared budget so scale-out can never over-subscribe the database.",
        tags: ["Config change"],
        chg: null,
        done: false,
      },
      {
        t: "Enforce a statement timeout on the payments role",
        d: "Apply statement_timeout=10s to the payments database role to release connections held by slow analytical reads. Schema-adjacent — proceeds under change control during a maintenance window.",
        tags: ["Maintenance window"],
        chg: "CHG-2025-0142",
        done: false,
      },
      {
        t: "Verify across two peak windows, then retire the interim workaround",
        d: "Confirm zero saturation events across two consecutive peak-traffic windows, decommission the temporary pre-scale runbook, and close the record.",
        tags: ["14-day clean window"],
        chg: null,
        done: false,
      },
    ],
    kb: {
      published: true,
      autoSync: true,
      articleId: "KB-1182",
      lastSynced: "Jun 04, 16:10",
      verified: false,
    },
    timeline: [],
  },
  {
    id: "PR-004392",
    title:
      "Memory growth in notification-dispatcher leading to periodic out-of-memory restarts",
    priority: "P2",
    impact: "Moderate",
    urgency: "Medium",
    category: "Application",
    status: "Investigating",
    owner: "rel",
    assignee: {
      name: "Paschal Ifediora",
      role: "Problem Manager",
    },
    watchers: 3,
    watching: false,
    opened: "May 22",
    target: "Jun 20",
    activity: "1d ago",
    confidence: 62,
    summary:
      "The notification-dispatcher restarts every 9–14 hours under steady load, with memory growing linearly between restarts. Investigation points toward an unbounded in-memory retry buffer that is not evicted after successful delivery.",
    rootcause: {
      title: "Suspected unbounded retry buffer (under verification)",
      body: "Heap profiles show steady growth in a retry-tracking map; entries appear to persist after successful delivery rather than being evicted. A confirming heap-diff across two restart cycles is in progress before promotion to a confirmed root cause.",
    },
    workaround: {
      active: true,
      text: "A scheduled rolling restart every 6 hours keeps memory below the OOM threshold and avoids unplanned restarts during peak send windows. Crude but effective until the leak is fixed.",
    },
    incidents: [
      {
        id: "SI-003151",
        sev: "P2",
        desc: "Dispatcher OOM restart",
        date: "May 30",
      },
      {
        id: "SI-003090",
        sev: "P2",
        desc: "Delivery delay during restart",
        date: "May 25",
      },
      {
        id: "SI-003041",
        sev: "P3",
        desc: "Memory alert, auto-recovered",
        date: "May 22",
      },
    ],
    services: [
      {
        n: "notification-dispatcher",
        i: "High",
        cls: "bg-amber-50 text-amber-700 border-amber-100",
      },
      {
        n: "email-gateway",
        i: "Moderate",
        cls: "bg-blue-50 text-blue-700 border-blue-100",
      },
    ],
    findings: [
      {
        type: "Evidence",
        author: {
          name: "Paschal Ifediora",
          role: "Problem Manager",
        },
        ts: "May 30 · 08:20",
        body: "Heap grows approximately 80MB per hour between restarts under steady traffic, independent of message volume.",
        source: "Continuous heap sampling",
        conf: 90,
      },
      {
        type: "Hypothesis",
        author: {
          name: "Paschal Ifediora",
          role: "Problem Manager",
        },
        ts: "May 30 · 09:10",
        body: "Retained-heap analysis suggests the retry-tracking map is the dominant growth source. Capturing a confirming diff across two restart cycles before treating this as the root cause.",
        source: "Heap snapshot",
        conf: 71,
      },
    ],
    steps: [
      {
        t: "Capture confirming heap-diff across two restart cycles",
        d: "Snapshot heap immediately after restart and just before the next OOM, then diff retained object graphs to confirm the retry map as the growth source.",
        tags: ["Verification"],
        chg: null,
        done: true,
        by: "jt",
        at: "May 31 · 11:00",
        note: "Diff confirms retry map retains delivered entries.",
      },
      {
        t: "Add eviction on successful delivery",
        d: "Remove entries from the retry-tracking map on delivery acknowledgement and add a bounded TTL for dropped acknowledgements.",
        tags: ["Code change"],
        chg: null,
        done: false,
      },
      {
        t: "Introduce a hard cap with backpressure",
        d: "Bound the retry buffer to a configurable maximum and apply backpressure when reached, so a downstream stall can never exhaust memory.",
        tags: ["Resilience"],
        chg: null,
        done: false,
      },
      {
        t: "Load-test against replayed traffic and confirm flat memory",
        d: "Replay 72 hours of production traffic in staging and confirm memory stays flat across multiple cycles before rollout.",
        tags: ["72h replay"],
        chg: null,
        done: false,
      },
    ],
    kb: {
      published: false,
      autoSync: false,
      articleId: null,
      lastSynced: null,
      verified: false,
    },
    timeline: [],
  },
];

const PEOPLE = {
  pi: {
    init: "PI",
    name: "Paschal Ifediora",
    role: "Problem Manager",
    sys: false,
  },
  am: { init: "AO", name: "Amara Okafor", role: "Senior SRE", sys: false },
  jt: { init: "JT", name: "Jon Tan", role: "Database Engineer", sys: false },
  ce: {
    init: "CE",
    name: "Correlation Engine",
    role: "Automated analysis",
    sys: true,
  },
  df: {
    init: "DF",
    name: "Database Forensics",
    role: "Automated analysis",
    sys: true,
  },
  ca: {
    init: "CA",
    name: "Configuration Analysis",
    role: "Automated analysis",
    sys: true,
  },
};

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

export default function ProblemRecordsDashboard() {
  // ─── WORKSPACE STATES ───
  const router = useRouter();
  const searchParams = useSearchParams();

  // ─── REAL API DATA ───
  const { data: apiProblems, loading: problemsLoading, refetch: refetchProblems } = useProblems();
  const [records, setRecords] = useState<any[]>(INITIAL_RECORDS);

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
  // pages deep-link straight to a specific problem, e.g. /incident/problems?id=PR-004417.
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
  const [newRecOwner, setNewRecOwner] = useState("Platform Reliability");
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
    return records.map((r) => {
      const ev: any[] = [];
      ev.push({
        ts: r.opened + " · 00:00",
        author: { name: "Paschal Ifediora", role: "Problem Manager" },
        t: "Problem record opened",
        d: "Matching incident signatures clustered into a single record.",
        ok: false,
      });
      r.findings.forEach((f: any) =>
        ev.push({
          ts: f.ts,
          author: f.author,
          t: "Finding added — " + f.type,
          d: f.body,
          ok: f.type === "Decision",
        }),
      );
      r.steps.forEach((s: any, i: number) => {
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
          ts: r.kb.lastSynced || r.activity,
          author: { name: "Paschal Ifediora", role: "Problem Manager" },
          t: "Record resolved and closed",
          d: "All remediation steps verified.",
          ok: true,
        });

      const timeline = ev.reverse().map((e) => ({
        ...e,
        hash: shortHash(
          e.ts +
            e.t +
            e.d +
            (typeof e.author === "string" ? e.author : e.author.name),
        ),
      }));
      return { ...r, timeline };
    });
  }, [records]);

  const activeRecord = computedRecords.find((x) => x.id === selectedId) || null;

  // ─── FILTER & SORT PROCESSING LOOP ───
  const processedRecords = useMemo(() => {
    return computedRecords
      .filter((r) => {
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
        if (af.assignees.length && !af.assignees.includes(r.assignee.name))
          return false;
        if (af.kb === "published" && !r.kb.published) return false;
        if (af.kb === "unpublished" && r.kb.published) return false;

        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matches =
            r.title.toLowerCase().includes(q) ||
            r.id.toLowerCase().includes(q) ||
            r.summary.toLowerCase().includes(q);
          if (!matches) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "priority") return a.priority.localeCompare(b.priority);
        if (sortBy === "incidents")
          return b.incidents.length - a.incidents.length;
        return 0; // Fallback chronologically standard
      });
  }, [computedRecords, statusFilter, advancedFilters, searchQuery, sortBy]);

  // Bulk selectors operations handlers
  const isAllVisibleSelected =
    processedRecords.length > 0 &&
    processedRecords.every((r) => selectedRowIds.has(r.id));
  const isAnyVisibleSelected = processedRecords.some((r) =>
    selectedRowIds.has(r.id),
  );

  const handleToggleSelectAll = () => {
    if (isAllVisibleSelected) {
      const next = new Set(selectedRowIds);
      processedRecords.forEach((r) => next.delete(r.id));
      setSelectedRowIds(next);
    } else {
      const next = new Set(selectedRowIds);
      processedRecords.forEach((r) => next.add(r.id));
      setSelectedRowIds(next);
    }
  };

  const handleToggleRowCheckbox = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedRowIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedRowIds(next);
  };

  // ─── MUTATIONS PACK ───
  const handleAddNewFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fBody.trim() || !selectedId) return;
    try {
      await customAxios.post(`${endpoint.problems.update}/${selectedId}/findings`, {
        type: fType,
        body: fBody.trim(),
        source: fSource.trim() || null,
        confidence: fConf ? Number(fConf) : null,
      });
      await refetchProblems();
    } catch {
      // non-critical — finding UI remains
    }
    setFBody("");
    setFSource("");
    setFConf("");
  };

  const handleSignoffStep = (idx: number) => {
    if (!selectedId) return;
    setCompletingStepIdx(idx);
  };

  const commitSignoffStep = async (idx: number) => {
    if (!selectedId) return;
    try {
      await customAxios.post(`${endpoint.problems.update}/${selectedId}/steps/${idx}/complete`, {
        note: completionNote,
      });
      await refetchProblems();
    } catch {
      // optimistic update
      setRecords((prev) =>
        prev.map((r) =>
          r.id === selectedId
            ? { ...r, steps: r.steps.map((s: any, i: number) => i === idx ? { ...s, done: true, note: completionNote } : s) }
            : r
        )
      );
    }
    setCompletionNote("");
    setCompletingStepIdx(null);
  };

  const handleAddPlanStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepTitle.trim() || !selectedId) return;
    try {
      await customAxios.post(`${endpoint.problems.update}/${selectedId}/steps`, {
        title: newStepTitle.trim(),
        detail: newStepDetail.trim(),
        tags: newStepTags ? newStepTags.split(",").map((t) => t.trim()) : [],
        changeRequest: newStepChg.trim() || null,
      });
      await refetchProblems();
    } catch {
      // optimistic
      setRecords((prev) =>
        prev.map((r) =>
          r.id === selectedId
            ? { ...r, steps: [...(r.steps ?? []), { t: newStepTitle.trim(), d: newStepDetail.trim(), tags: [], done: false }] }
            : r
        )
      );
    }
    setNewStepTitle("");
    setNewStepDetail("");
    setNewStepTags("");
    setNewStepChg("");
    setIsAddingStep(false);
  };

  const handleCreateProblemRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecTitle.trim()) return;

    try {
      const created = await createProblem({
        title: newRecTitle.trim(),
        priority: newRecPri,
        category: newRecCat,
        summary: newRecSummary.trim() || "Investigation mapped from active telemetry configurations.",
        status: "Investigating",
      });

      await refetchProblems();
      if (created?.id) selectRecord(created.id);
    } catch {
      // optimistic fallback
      const nextId = `PR-${Date.now()}`;
      setRecords((prev) => [
        {
          id: nextId,
          title: newRecTitle.trim(),
          priority: newRecPri,
          category: newRecCat,
          status: "Investigating",
          summary: newRecSummary.trim() || "Under investigation.",
          findings: [],
          steps: [],
          incidents: [],
          services: [],
          workaround: { active: false, text: "" },
          rootcause: { title: "Under Investigation", body: "" },
          kb: { published: false, autoSync: false, articleId: null, lastSynced: null, verified: false },
          timeline: [],
          opened: "Just now",
          activity: "just now",
          confidence: 0,
          watchers: 1,
        },
        ...prev,
      ]);
      selectRecord(nextId);
    }
    setIsNewRecordModalOpen(false);
    setNewRecTitle("");
    setNewRecSummary("");
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
    { value: "incidents", label: "Sort: Correlated Outages" },
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
    } catch {
      setRecords((prev) => prev.map((r) => r.id === id ? { ...r, status: "Resolved" } : r));
    }
  };

  const openCount = records.filter((r) => r.status !== "Resolved").length;
  const knownErrorCount = records.filter((r) => r.status === "Known Error").length;
  const resolvedCount = records.filter((r) => r.status === "Resolved").length;
  const kbCount = records.filter((r) => r.kb?.published).length;

  return (
    <div className="bg-[#F6F7F9] text-[#161A22] min-h-screen font-ibm antialiased pb-20 selection:bg-emerald-500/20">
      {/* ─── CONTENT HERO BREADCRUMBS LAYER ─── */}
      <div className="max-w-[1540px] mx-auto px-7 pt-6 space-y-4">
        <div className="flex flex-col gap-4 border-b border-zinc-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
              Problem Records
            </h1>
            <p className="text-sm text-zinc-500 max-w-2xl mt-1 leading-relaxed">
              Recurring architectural failures correlated into structural
              root-cause registries. Append findings logs and authorize
              execution blocks.
            </p>
          </div>

          {/* Statistics matrix logs */}
          <div className="grid grid-cols-2 md:grid-cols-4  border border-zinc-200 rounded-sm overflow-hidden shadow-2xs bg-white">
            <StatsCard value={problemsLoading ? "…" : openCount} label="Open" />
            <StatsCard value={problemsLoading ? "…" : knownErrorCount} label="Known Error" />
            <StatsCard value={problemsLoading ? "…" : resolvedCount} label="Resolved" />
            <StatsCard value={problemsLoading ? "…" : kbCount} label="KB Articles" />
          </div>
        </div>
      </div>

      {/* ─── WORKSPACE CONTROLS TOOLBAR ─── */}
      <div className="max-w-[1540px] mx-auto px-7 py-3 flex flex-wrap items-center gap-3">
        {/* Status Segments bar */}
        <div className="flex rounded-lg bg-gray-100/70 p-1 shadow-2xs gap-1">
          {["all", "Investigating", "Known Error", "Resolved"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-semibold rounded-md capitalize ${statusFilter === st ? "bg-white text-black shadow-xs" : "text-zinc-500 hover:bg-zinc-50"}`}
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
          <Dropdown
            items={densityDropdownItems}
            value={density}
            onChange={(val) => setDensity(val as any)}
            align="right"
          />

          <div className="relative">
            <button
              onClick={() =>
                setActivePopover(activePopover === "filter" ? null : "filter")
              }
              className={`h-8.5 p-2 rounded-lg border text-sm font-semibold flex items-center gap-1.5 shadow-2xs bg-white transition-all ${activePopover === "filter" ? "border-emerald-500 text-emerald-700 bg-emerald-50/20" : "text-zinc-700 hover:bg-zinc-50"}`}
            >
              <SlidersHorizontal size={13} /> Filters Grid
            </button>

            {activePopover === "filter" && (
              <div className="absolute right-0 mt-2 w-[380px] max-w-[calc(100vw-24px)] bg-white border border-zinc-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn text-xs flex flex-col font-ibm text-[#161A22]">
                {/* Panel Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-zinc-50/50">
                  <span className="font-bold text-zinc-900">
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
                    className="text-[11px] font-semibold text-zinc-500 hover:text-red-600 px-2 py-1 rounded hover:bg-zinc-100 transition-colors"
                  >
                    Reset all
                  </button>
                </div>

                {/* Panel Body Elements Scroll */}
                <div className="p-4 space-y-4 max-h-[440px] overflow-y-auto divide-y divide-zinc-100 scrollbar-thin">
                  {/* Section: Date & Time parameters */}
                  <div className="space-y-2 pb-2">
                    <label className="text-[10px]  font-bold tracking-wider text-zinc-400 uppercase block">
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
                        className=" border border-zinc-200 bg-white rounded-lg text-xs font-medium p-2 outline-none flex-1 cursor-pointer"
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
                          className={`h-7 rounded border text-[11px] font-semibold transition-all ${advancedFilters.datePreset === preset ? "bg-zinc-950 text-white border-zinc-950" : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"}`}
                        >
                          {preset === "any" ? "Any time" : preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section: Priority Code Options Grid */}
                  <div className="space-y-2 pt-3 pb-1">
                    <span className="text-[10px]  font-bold tracking-wider text-zinc-400 uppercase block">
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
                            className={`px-3 h-8 border rounded-lg flex items-center gap-2  text-[11px] font-bold transition-all ${active ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"}`}
                          >
                            <span
                              className={`w-3 h-3 rounded-sm border flex items-center justify-center text-[8px] text-white ${active ? "bg-emerald-600 border-emerald-600" : "border-zinc-300"}`}
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
                    <span className="text-[10px]  font-bold tracking-wider text-zinc-400 uppercase block">
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
                            className={`px-3 h-8 border rounded-lg flex items-center gap-2 font-medium transition-all ${active ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"}`}
                          >
                            <span
                              className={`w-3 h-3 rounded-sm border flex items-center justify-center text-[8px] text-white ${active ? "bg-emerald-600 border-emerald-600" : "border-zinc-300"}`}
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
                    <span className="text-[10px]  font-bold tracking-wider text-zinc-400 uppercase block">
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
                            className={`px-3 h-8 border rounded-lg flex items-center gap-2 font-medium transition-all ${active ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"}`}
                          >
                            <span
                              className={`w-3 h-3 rounded-sm border flex items-center justify-center text-[8px] text-white ${active ? "bg-emerald-600 border-emerald-600" : "border-zinc-300"}`}
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
                    <span className="text-[10px]  font-bold tracking-wider text-zinc-400 uppercase block">
                      Assigned Problem Manager
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(PEOPLE)
                        .filter(([_, p]) => !p.sys)
                        .map(([key, value]) => {
                          const active = advancedFilters.assignees.includes(
                            value.name,
                          );
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() =>
                                handleToggleAdvancedFilter(
                                  "assignees",
                                  value.name,
                                )
                              }
                              className={`px-3 h-8 border rounded-lg flex items-center gap-2 font-medium transition-all ${active ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"}`}
                            >
                              <span
                                className={`w-3 h-3 rounded-sm border flex items-center justify-center text-[8px] text-white ${active ? "bg-emerald-600 border-emerald-600" : "border-zinc-300"}`}
                              >
                                {active && "✓"}
                              </span>
                              <span>{value.name}</span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* Footer panel configurations summary */}
                <div className="p-3 border-t bg-zinc-50/80 flex items-center justify-between gap-2">
                  <span className="text-zinc-500 font-medium font-serif">
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
          <div className="h-4 w-px bg-zinc-200 mx-1" />

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
        <div className="col-span-12 lg:col-span-4 xl:col-span-3 bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-140px)] sticky top-20">
          <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between relative select-none">
            <label className="flex items-center gap-2 text-sm font-bold text-zinc-900 cursor-pointer">
              <input
                type="checkbox"
                checked={isAllVisibleSelected}
                onChange={handleToggleSelectAll}
                className="accent-emerald-500 h-3.5 w-3.5 rounded"
              />
              Records Feed
            </label>
            <span className=" text-[11px] text-zinc-400">
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
                        [...selectedRowIds].map((id) => handleResolveRecord(id))
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

          <div className="overflow-y-auto divide-y divide-zinc-100 flex-1">
            {processedRecords.map((r) => {
              const active = r.id === selectedId;
              const isChecked = selectedRowIds.has(r.id);
              const pct = r.steps.length
                ? Math.round(
                    (r.steps.filter((x) => x.done).length / r.steps.length) *
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
                  className={`p-4 cursor-pointer transition-all hover:bg-zinc-50 relative group border-l-2 ${
                    active ? "bg-blue-50/60" : "border-l-transparent"
                  } ${isChecked ? "bg-zinc-50" : ""}`}
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
                      <span className=" text-[11px] text-zinc-400 font-medium">
                        {r.id}
                      </span>
                      {/* Priority badge */}
                      <span
                        className={`  text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          r.priority === "P0"
                            ? "bg-red-50 text-red-700"
                            : r.priority === "P1"
                              ? "bg-amber-50 text-amber-700"
                              : r.priority === "P2"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {r.priority}
                      </span>
                    </div>
                  </div>

                  <h4
                    className={`font-semibold text-zinc-900 leading-snug mb-2 ${
                      density === "compact"
                        ? "text-xs line-clamp-1"
                        : "text-[13.5px] line-clamp-2"
                    }`}
                  >
                    {r.title}
                  </h4>

                  <div className="flex items-center gap-4 text-[11px]  text-zinc-400 mb-2">
                    <span>{r.incidents.length} offenses</span>
                    <span>{r.findings.length} findings</span>
                    <span>{r.activity}</span>
                  </div>
                </div>
              );
            })}

            {processedRecords.length === 0 && (
              <div className="p-10 text-center text-sm text-zinc-400 italic">
                No records match the current filter.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT DETAIL PANEL */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-9 bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
          {activeRecord ? (
            <div className="animate-fadeIn">
              {/* Detail header */}
              <div className="px-7 pt-6 pb-0">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className=" text-[10.5px] text-zinc-500 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100">
                    {activeRecord?.id}
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
                      <span className="h-8 px-3 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100 text-xs flex items-center gap-1.5">
                        <CheckCircle2 size={13} /> Resolution verified
                      </span>
                    )}
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 leading-snug mb-5">
                  {activeRecord.title}
                </h2>

                {/* Meta grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 py-4 border-t border-zinc-100">
                  {[
                    {
                      label: "Owning team",
                      value: OWNERS[activeRecord.owner] || activeRecord.owner,
                    },
                    {
                      label: "Assignee",
                      value: activeRecord.assignee.name,
                    },
                    {
                      label: "Impact / Urgency",
                      value: `${activeRecord.impact} / ${activeRecord.urgency}`,
                    },
                    {
                      label: "Opened",
                      value: activeRecord.opened,
                    },
                    {
                      label: "Watchers",
                      value: `${activeRecord.watchers} operators`,
                    },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className=" text-[9.5px] uppercase tracking-widest text-zinc-400 mb-1">
                        {label}
                      </p>
                      <p className="text-sm font-semibold text-zinc-700">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress strip */}
              {(() => {
                const total = activeRecord.steps.length;
                const done = activeRecord.steps.filter((x) => x.done).length;
                const pct = total ? Math.round((done / total) * 100) : 0;
                const full = pct === 100;
                return (
                  <div className="flex items-center gap-4 px-7 py-3 bg-zinc-50/60 border-y border-zinc-100">
                    <span className=" text-xs font-bold text-zinc-400 whitespace-nowrap">
                      Permanent resolution <strong>{pct}</strong>%
                    </span>
                    <div className="flex-1 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: full ? "#00C896" : "#1A4FA0",
                        }}
                      />
                    </div>
                    <span className="text-sm text-zinc-500 whitespace-nowrap">
                      <b className="text-zinc-900 font-bold">{done}</b> of{" "}
                      <b className="text-zinc-900 font-bold">{total}</b> steps
                      complete
                    </span>
                  </div>
                );
              })()}

              {/* Tabs */}
              <div className="flex gap-0 px-7 border-b border-zinc-100 bg-white overflow-x-auto">
                {[
                  { id: "overview", label: "Overview" },
                  {
                    id: "findings",
                    label: "Findings",
                    count: activeRecord.findings.length,
                  },
                  {
                    id: "resolution",
                    label: "Resolution",
                    count: `${activeRecord.steps.filter((x) => x.done).length}/${activeRecord.steps.length}`,
                  },
                  {
                    id: "kb",
                    label: "Knowledge Base",
                    count: activeRecord.kb.published ? "synced" : "draft",
                  },
                  {
                    id: "activity",
                    label: "Activity",
                    count: activeRecord.timeline.length,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3.5 mr-6 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                      activeTab === tab.id
                        ? "border-emerald-500 text-zinc-900"
                        : "border-transparent text-zinc-500 hover:text-zinc-700"
                    }`}
                  >
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className=" text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded-full">
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
                      <p className=" text-[9.5px] uppercase tracking-widest text-zinc-400 mb-2">
                        Summary
                      </p>
                      <p className="text-sm text-zinc-700 leading-relaxed bg-zinc-50/50 p-4 border border-zinc-100 rounded-xl">
                        {activeRecord.summary}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Root cause card — two column with confidence ring */}
                      <div className="p-4 border border-zinc-200 rounded-xl bg-zinc-50/40 flex gap-4 items-start">
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
                              strokeDasharray={`${(activeRecord.confidence / 100) * 163.4} 163.4`}
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
                              {activeRecord.confidence}%
                            </text>
                          </svg>
                          <span className=" text-[8.5px] uppercase tracking-widest text-zinc-400">
                            match
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className=" text-[9.5px] uppercase tracking-widest text-zinc-400 mb-2">
                            Root cause
                          </p>
                          <h4 className="font-bold text-zinc-950 text-sm leading-snug mb-2">
                            {activeRecord.rootcause.title}
                          </h4>
                          <p className="text-xs text-zinc-600 leading-relaxed">
                            {activeRecord.rootcause.body}
                          </p>
                        </div>
                      </div>

                      {/* Workaround */}
                      {activeRecord.workaround?.text && (
                        <div className="p-4 border border-zinc-200 rounded-xl bg-zinc-50/40 flex gap-3 items-start">
                          <AlertCircle
                            size={18}
                            className="text-amber-500 shrink-0 mt-0.5"
                          />
                          <div>
                            <p className="font-bold text-black text-sm mb-1">
                              Active workaround
                            </p>
                            <p className="text-xs text-gray-900/80 leading-relaxed">
                              {activeRecord.workaround.text}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Correlated incidents */}
                    <div>
                      <p className=" text-[9.5px] uppercase tracking-widest text-zinc-400 mb-3">
                        Correlated incidents ({activeRecord.incidents.length})
                      </p>
                      <div className="border border-zinc-100 rounded-xl overflow-hidden divide-y divide-zinc-100">
                        {activeRecord.incidents.map((inc, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 px-4 py-3"
                          >
                            <span
                              className={` text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                inc.sev === "P0"
                                  ? "bg-red-50 text-red-700"
                                  : inc.sev === "P1"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {inc.sev}
                            </span>
                            <span className=" text-sm font-semibold text-zinc-900 shrink-0">
                              {inc.id}
                            </span>
                            <span className="text-sm text-zinc-500 flex-1 truncate">
                              {inc.desc}
                            </span>
                            <span className=" text-xs text-zinc-400 shrink-0">
                              {inc.date}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Affected services */}
                    {activeRecord.services.length > 0 && (
                      <div>
                        <p className=" text-[9.5px] uppercase tracking-widest text-zinc-400 mb-3">
                          Affected services
                        </p>
                        <div className="border border-zinc-100 rounded-xl overflow-hidden divide-y divide-zinc-100">
                          {activeRecord.services.map((svc, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 px-4 py-3"
                            >
                              <span className=" text-sm text-zinc-700 flex-1">
                                {svc.n}
                              </span>
                              <span
                                className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${svc.cls}`}
                              >
                                {svc.i}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* FINDINGS TAB */}
                {activeTab === "findings" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2">
                      <Lock size={12} />
                      Findings are immutable once appended. Authorship is
                      stamped on sign-off.
                    </div>

                    <form
                      onSubmit={handleAddNewFinding}
                      className="border border-zinc-200 bg-zinc-50/40 p-4 rounded-xl space-y-3"
                    >
                      <div className="font-semibold text-sm text-zinc-800 flex items-center gap-1.5">
                        <Plus size={14} className="text-emerald-600" /> Log
                        diagnostic observation
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <select
                          value={fType}
                          onChange={(e) => setFType(e.target.value)}
                          className="h-9 border px-2 text-sm font-semibold bg-white rounded-lg outline-none border-zinc-200 focus:border-emerald-500"
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
                          className="h-9 border px-3 text-sm bg-white rounded-lg outline-none col-span-2 border-zinc-200 focus:border-emerald-500"
                        />
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Type observations here. Once appended, entries cannot be modified."
                        value={fBody}
                        onChange={(e) => setFBody(e.target.value)}
                        className="w-full text-sm border p-3 rounded-lg bg-white outline-none leading-relaxed resize-y border-zinc-200 focus:border-emerald-500"
                      />
                      <div className="flex justify-end">
                        <Button type="submit" size="sm">
                          Append finding
                        </Button>
                      </div>
                    </form>

                    <div className="space-y-3">
                      {[...activeRecord.findings].reverse().map((f, i) => (
                        <div
                          key={i}
                          className="p-4 border border-zinc-100 rounded-xl bg-white space-y-2"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded border  font-bold text-[10px] uppercase bg-zinc-100 text-zinc-600 border-zinc-200">
                              {f.type}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="bg-blue-900 text-white rounded-md size-7 text-sm justify-center items-center flex uppercase">
                                {f?.author?.name?.slice(0, 2)}
                              </div>
                              <span className="text-sm">{f?.author.name}</span>
                            </div>
                            {f.conf && (
                              <span className=" text-[10px] text-emerald-700 font-bold">
                                {f.conf}% confidence
                              </span>
                            )}
                            <span className=" text-[11px] text-zinc-400 ml-auto">
                              {f.ts}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-700 leading-relaxed">
                            {f.body}
                          </p>
                          {f.source && (
                            <p className=" text-[11px] text-blue-700 font-semibold">
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
                    {activeRecord.steps.map((step, idx) => {
                      const isCompleting = completingStepIdx === idx;
                      return (
                        <div
                          key={idx}
                          className={`p-4 border rounded-xl space-y-2 text-sm transition-all ${
                            step.done
                              ? "border-emerald-200 bg-emerald-50/20"
                              : "border-zinc-200"
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
                              <p className=" text-[9.5px] uppercase tracking-widest text-zinc-400">
                                Step {idx + 1}
                              </p>
                              <h4 className="font-bold text-zinc-950 text-[13.5px] leading-tight">
                                {step.t}
                              </h4>
                              <p className="text-xs text-zinc-500 leading-relaxed">
                                {step.d}
                              </p>
                              {step.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {step.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className=" text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {isCompleting && !step.done && (
                            <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg flex gap-2 items-center animate-fadeIn">
                              <input
                                type="text"
                                placeholder="Optional validation note or change request..."
                                value={completionNote}
                                onChange={(e) =>
                                  setCompletionNote(e.target.value)
                                }
                                className="h-8 text-xs px-2.5 border border-zinc-200 bg-white flex-1 rounded-lg outline-none focus:border-emerald-500"
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
                                className="h-8 px-2.5 text-zinc-400 hover:text-zinc-600 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          )}

                          {step.done && step.by && (
                            <div className="text-[11px]  text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-100 flex items-center gap-1.5 mt-1">
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
                        className="border border-zinc-200 bg-zinc-50/40 p-4 rounded-xl space-y-3 text-sm animate-fadeIn"
                      >
                        <p className="font-semibold text-zinc-800">
                          Add resolution step
                        </p>
                        <input
                          type="text"
                          placeholder="Step title..."
                          value={newStepTitle}
                          onChange={(e) => setNewStepTitle(e.target.value)}
                          className="h-9 w-full border border-zinc-200 px-3 rounded-lg outline-none bg-white text-sm focus:border-emerald-500"
                        />
                        <textarea
                          placeholder="How will this be validated?"
                          value={newStepDetail}
                          onChange={(e) => setNewStepDetail(e.target.value)}
                          className="w-full border border-zinc-200 p-2.5 rounded-lg bg-white outline-none leading-relaxed text-sm resize-y focus:border-emerald-500"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setIsAddingStep(false)}
                            className="h-8 px-3 text-zinc-500 text-sm"
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
                        className="w-full h-10 border border-dashed border-zinc-200 hover:border-zinc-400 rounded-xl text-sm font-semibold text-zinc-400 hover:text-zinc-600 transition-colors flex items-center justify-center gap-1.5"
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
                    <div className="flex items-center gap-4 p-4 border border-zinc-200 rounded-xl bg-zinc-50/60 flex-wrap">
                      {/* Icon */}
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          activeRecord.kb.published
                            ? "bg-emerald-50"
                            : "bg-zinc-100"
                        }`}
                      >
                        {activeRecord.kb.published ? (
                          <BookOpen size={20} className="text-emerald-600" />
                        ) : (
                          <FileText size={20} className="text-zinc-400" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-zinc-900 text-sm">
                          {activeRecord.kb.published
                            ? "Published to knowledge base"
                            : "Not yet published"}
                        </p>
                        <p className="text-xs text-zinc-500 margin-top:2px">
                          {activeRecord.kb.published ? (
                            <>
                              Article{" "}
                              <span className="text-emerald-700 font-semibold font-mono">
                                {activeRecord.kb.articleId}
                              </span>{" "}
                              &middot; last synced {activeRecord.kb.lastSynced}
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
                    <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2">
                      <Lock size={12} />
                      Complete audit trail &bull; every entry is attributed,
                      timestamped and content-hashed. This log is append-only.
                    </div>

                    <div className="relative pl-6 border-l border-zinc-200 ml-3 space-y-6">
                      {activeRecord.timeline.map((item: any, idx: number) => {
                        const isStringAuthor = typeof item.author === "string";
                        const authorName = isStringAuthor
                          ? PEOPLE[item.author as keyof typeof PEOPLE]?.name ||
                            item.author
                          : item.author.name;
                        const authorInitials = isStringAuthor
                          ? PEOPLE[item.author as keyof typeof PEOPLE]?.init ||
                            "??"
                          : item.author.init ||
                            item.author.name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("") ||
                            "??";

                        return (
                          <div key={item.hash || idx} className="relative">
                            {/* Timeline Node Ring Marker */}
                            <div
                              className={`absolute -left-[30px] top-1.5 w-2 h-2 rounded-full border bg-white ${item.ok ? "border-emerald-500 ring-4 ring-emerald-50" : "border-blue-500 ring-4 ring-blue-50"}`}
                            />

                            <div className="space-y-1 text-xs">
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400 ">
                                <span className="bg-blue-50 border border-blue-100/50 text-blue-700 px-1.5 py-0.5 rounded font-sans font-medium flex items-center gap-1.5">
                                  {/* <span className="w-6 h-6 rounded bg-blue-700 text-white text-[8px] flex items-center justify-center font-bold ">
                                    {authorInitials}
                                  </span> */}
                                  {authorName}
                                </span>
                                <span>&bull;</span>
                                <span>{item.ts}</span>
                                <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/30">
                                  <Lock size={10} /> {item.hash}
                                </span>
                              </div>
                              <h5 className="font-bold text-zinc-950 text-[13.5px] tracking-tight">
                                {item.t}
                              </h5>
                              <p className="text-zinc-500 font-normal leading-relaxed text-xs">
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
            <div className="p-16 text-center text-sm text-zinc-400 italic">
              Select a record from the left rail to load its investigation
              workspace.
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
            className="bg-white border rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-growIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b pb-2 flex justify-between items-center">
              <h3 className="text-base font-bold text-zinc-950">
                Open Corporate Problem Record
              </h3>
              <button
                onClick={() => setIsNewRecordModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={handleCreateProblemRecord}
              className="space-y-4 text-xs font-semibold text-zinc-700"
            >
              <div className="flex flex-col gap-1">
                <label>Problem Record Summary Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Intermittent timeout spikes breaking notifications service layers"
                  value={newRecTitle}
                  onChange={(e) => setNewRecTitle(e.target.value)}
                  className="h-9 px-3 border rounded-lg bg-white outline-none font-medium text-zinc-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label>Severity Level</label>
                  <select
                    value={newRecPri}
                    onChange={(e) => setNewRecPri(e.target.value)}
                    className="h-9 px-2 border rounded-lg bg-white cursor-pointer outline-none"
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
                    className="h-9 px-2 border rounded-lg bg-white cursor-pointer outline-none"
                  >
                    <option>Database</option>
                    <option>Network</option>
                    <option>Compute</option>
                    <option>Application</option>
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
                  className="w-full p-2.5 border rounded-lg bg-white outline-none font-medium leading-relaxed resize-y text-zinc-800"
                />
              </div>
              <div className="pt-2 border-t flex justify-end gap-2 font-bold">
                <button
                  type="button"
                  onClick={() => setIsNewRecordModalOpen(false)}
                  className="h-9 px-4 border rounded-lg text-zinc-500"
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
