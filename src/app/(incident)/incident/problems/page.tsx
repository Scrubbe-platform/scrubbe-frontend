// app/developer/problems/page.tsx
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  SlidersHorizontal,
  Layers,
  Download,
  BarChart3,
  Sparkles,
  RefreshCw,
  X,
  FileText,
  Check,
  Trash2,
  ShieldAlert,
  ChevronDown,
  HelpCircle,
  Play,
  Pause,
  Activity,
  Clock,
  Plus,
  Bookmark,
  Eye,
  EyeOff,
  Lock,
  MessageSquare,
  Flame,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Calendar,
  User,
  List,
} from "lucide-react";
import StatsCard from "./_modules/components/StatsCard";
import Dropdown, { DropdownItem } from "@/components/ui/Dropdown";

// ─── INITIAL BASELINE REPOSITORY DATA MANIFESTS ───
const INITIAL_RECORDS = [
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
    assignee: "am",
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
        author: "ce",
        ts: "May 11 · 09:50",
        body: "Connection-pool saturation precedes every gateway error spike by 40–70 seconds, consistent across all five correlated incident windows.",
        source: "Telemetry · 5 incident windows",
        conf: 96,
      },
      {
        type: "Evidence",
        author: "df",
        ts: "May 11 · 10:03",
        body: "Database rejected 1,284 connection attempts at the 200-connection ceiling during the SI-003188 window, aligned with fleet scale-out to 12 replicas.",
        source: "pg_stat_activity + server logs",
        conf: 93,
      },
      {
        type: "Evidence",
        author: "ca",
        ts: "May 11 · 10:08",
        body: "maximumPoolSize is hardcoded to 20 and unaware of replica count; no shared connection layer (PgBouncer) is present in the path.",
        source: "payments-api@v4.18.2 config",
        conf: 99,
      },
      {
        type: "Observation",
        author: "am",
        ts: "May 11 · 10:15",
        body: "Confirmed the autoscaler reaches 12 replicas during the 18:00–20:00 checkout peak on every incident date. Connection demand at 12×20 exceeds the database ceiling — the maths is unambiguous.",
        source: null,
        conf: null,
      },
      {
        type: "Decision",
        author: "pi",
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
    assignee: "jt",
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
        author: "ce",
        ts: "May 30 · 08:20",
        body: "Heap grows approximately 80MB per hour between restarts under steady traffic, independent of message volume.",
        source: "Continuous heap sampling",
        conf: 90,
      },
      {
        type: "Hypothesis",
        author: "jt",
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
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [selectedId, setSelectedId] = useState<string | null>("PR-004417");
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
    dateField: "",
    datePreset: "",
  });

  // Seed Timeline logs on state mount
  const computedRecords = useMemo(() => {
    return records.map((r) => {
      const ev: any[] = [];
      ev.push({
        ts: r.opened + " · 00:00",
        author: "ce",
        t: "Problem record opened",
        d: "Matching incident signatures clustered into a single record.",
        ok: false,
      });
      r.findings.forEach((f) =>
        ev.push({
          ts: f.ts,
          author: f.author,
          t: "Finding added — " + f.type,
          d: f.body,
          ok: f.type === "Decision",
        }),
      );
      r.steps.forEach((s, i) => {
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
          author: "pi",
          t: "Record resolved and closed",
          d: "All remediation steps verified.",
          ok: true,
        });

      const timeline = ev
        .reverse()
        .map((e) => ({ ...e, hash: shortHash(e.ts + e.t + e.d + e.author) }));
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
        if (af.assignees.length && !af.assignees.includes(r.assignee))
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
  const handleAddNewFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fBody.trim() || !selectedId) return;

    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== selectedId) return r;
        const nextFindings = [
          ...r.findings,
          {
            type: fType,
            author: "pi",
            ts: "Just now",
            body: fBody.trim(),
            source: fSource.trim() || null,
            conf: fConf ? parseInt(fConf) : null,
          },
        ];
        let nextStatus = r.status;
        if (r.status === "Investigating" && fType === "Decision")
          nextStatus = "Known Error";
        return {
          ...r,
          findings: nextFindings,
          status: nextStatus,
          activity: "Just now",
        };
      }),
    );

    setFBody("");
    setFSource("");
    setFConf("");
    alert("Immutable finding recorded securely under audit hash trails.");
  };

  const handleSignoffStep = (idx: number) => {
    if (!selectedId) return;
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== selectedId) return r;
        const updated = [...r.steps];
        if (updated[idx].done) {
          updated[idx] = {
            ...updated[idx],
            done: false,
            by: undefined,
            at: undefined,
            note: undefined,
          };
        } else {
          setCompletingStepIdx(idx);
          setCompletionNote("");
          return r;
        }
        return { ...r, steps: updated, activity: "Just now" };
      }),
    );
  };

  const commitSignoffStep = (idx: number) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== selectedId) return r;
        const updated = [...r.steps];
        updated[idx] = {
          ...updated[idx],
          done: true,
          by: "pi",
          at: "Just now",
          note: completionNote.trim() || undefined,
        };
        return { ...r, steps: updated, activity: "Just now" };
      }),
    );
    setCompletingStepIdx(null);
  };

  const handleAddPlanStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepTitle.trim() || !selectedId) return;

    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== selectedId) return r;
        return {
          ...r,
          steps: [
            ...r.steps,
            {
              t: newStepTitle.trim(),
              d: newStepDetail.trim() || "No explicit description appended.",
              tags: newStepTags
                ? newStepTags.split(",").map((t) => t.trim())
                : ["Manual"],
              chg: newStepChg.trim() || null,
              done: false,
            },
          ],
          activity: "Just now",
        };
      }),
    );

    setNewStepTitle("");
    setNewStepDetail("");
    setNewStepTags("");
    setNewStepChg("");
    setIsAddingStep(false);
  };

  const handleCreateProblemRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecTitle.trim()) return;

    const nextId = `PR-00${4418 + records.length}`;
    const newRecordNode = {
      id: nextId,
      title: newRecTitle.trim(),
      priority: newRecPri,
      impact: "Moderate",
      urgency: "Medium",
      category: newRecCat,
      status: "Investigating",
      owner: "rel",
      assignee: "pi",
      watchers: 1,
      watching: true,
      opened: "Just now",
      target: "TBD",
      activity: "just now",
      confidence: 0,
      summary:
        newRecSummary.trim() ||
        "Investigation mapped from active telemetry configurations.",
      rootcause: {
        title: "Under Active Investigation",
        body: "Telemetry captures processing logs downstream.",
      },
      workaround: { active: false, text: "" },
      incidents: [],
      services: [],
      findings: [
        {
          type: "Observation",
          author: "pi",
          ts: "Just now",
          body: "Problem workspace established.",
          source: null,
          conf: null,
        },
      ],
      steps: [
        {
          t: "Establish and confirm core root cause metrics",
          d: "Isolate historical exception signatures.",
          tags: ["Investigation"],
          chg: null,
          done: false,
        },
      ],
      kb: {
        published: false,
        autoSync: true,
        articleId: null,
        lastSynced: null,
        verified: false,
      },
      timeline: [],
    };

    setRecords([newRecordNode, ...records]);
    setSelectedId(nextId);
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
            <StatsCard
              value={records.filter((r) => r.status !== "Resolved").length}
              label="Open"
            />
            <StatsCard
              value={records.filter((r) => r.status !== "Known Error").length}
              label="Know Error"
              valueColor="text-red-500"
            />
            <StatsCard
              value={records.filter((r) => r.status !== "Resolved").length}
              label="Resolved"
              valueColor="text-orange-500"
            />
            <StatsCard
              value={0}
              label="KB Articles"
              valueColor="text-red-500"
            />
          </div>
        </div>
      </div>

      {/* ─── WORKSPACE CONTROLS TOOLBAR ─── */}
      <div className="max-w-[1540px] mx-auto px-7 py-3 flex flex-wrap items-center gap-3">
        {/* Status Segments bar */}
        <div className="flex rounded-lg bg-slate-200/70 p-1 shadow-2xs gap-1">
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
                    <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase block">
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
                    <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase block">
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
                            className={`px-3 h-8 border rounded-lg flex items-center gap-2 font-mono text-[11px] font-bold transition-all ${active ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"}`}
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
                    <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase block">
                      Distortion Category
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
                    <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase block">
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
                    <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase block">
                      Assigned Problem Manager
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(PEOPLE)
                        .filter(([_, p]) => !p.sys)
                        .map(([key, value]) => {
                          const active =
                            advancedFilters.assignees.includes(key);
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() =>
                                handleToggleAdvancedFilter("assignees", key)
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

          <button
            onClick={() => setIsNewRecordModalOpen(true)}
            className=" p-2 bg-IMSCyan text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-1.5"
          >
            <Plus size={14} /> New Record
          </button>
        </div>
      </div>

      {/* ─── DUAL-COLUMN WORKSPACE STAGE CANVAS ─── */}
      <div className="max-w-[1540px] mx-auto px-7 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start mt-2">
        {/* SIDE BAR 1: PROBLEM RECORDS LEFTHAND LIST CHANNELS */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-3 bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden flex flex-col max-h-[calc(100vh-140px)] sticky top-20">
          <div className="px-4 py-3 bg-zinc-50/50 border-b flex items-center justify-between relative select-none">
            <label className="flex items-center gap-2 text-xs font-bold text-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isAllVisibleSelected}
                onChange={handleToggleSelectAll}
                className="accent-emerald-600 h-3.5 w-3.5 rounded"
              />
              <span>Records Feed</span>
            </label>
            <span className="font-mono text-[11px] font-bold text-zinc-400">
              ({processedRecords.length} items)
            </span>

            {/* Inline Bulk Operations Dock row header injection */}
            {isAnyVisibleSelected && (
              <div className="absolute inset-0 bg-zinc-950 text-white px-3 flex items-center justify-between text-xs font-bold animate-fadeIn">
                <span>{selectedRowIds.size} Selected</span>
                <div className="flex gap-1.5 text-[11px]">
                  <button
                    onClick={() => {
                      alert("Exporting JSON metadata mapping packet.");
                      setSelectedRowIds(new Set());
                    }}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => {
                      setRecords((prev) =>
                        prev.map((x) =>
                          selectedRowIds.has(x.id)
                            ? { ...x, status: "Resolved" }
                            : x,
                        ),
                      );
                      setSelectedRowIds(new Set());
                    }}
                    className="text-emerald-400 font-bold hover:opacity-90"
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

          <div className="overflow-y-auto divide-y divide-zinc-100 flex-1 scrollbar-thin">
            {processedRecords.map((r) => {
              const active = r.id === selectedId;
              const isChecked = selectedRowIds.has(r.id);
              const totalSteps = r.steps.length;
              const passedSteps = r.steps.filter((x) => x.done).length;
              const pct = totalSteps
                ? Math.round((passedSteps / totalSteps) * 100)
                : 0;

              return (
                <div
                  key={r.id}
                  onClick={() => {
                    setSelectedId(r.id);
                    setActiveTab("overview");
                  }}
                  className={`p-4 text-left cursor-pointer transition-all hover:bg-zinc-50/40 relative group ${active ? "bg-indigo-50/40 border-l-2 border-indigo-600" : isChecked ? "bg-zinc-50/70" : ""}`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleToggleRowCheckbox(r.id, e as any)}
                      className="accent-emerald-600 h-3 w-3 rounded opacity-0 group-hover:opacity-100 checked:opacity-100 transition-opacity"
                    />
                    <span className="font-mono font-bold text-[11px] text-zinc-400">
                      {r.id}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 border text-zinc-500 font-mono ml-auto">
                      {r.priority}
                    </span>
                  </div>
                  <h4
                    className={`text-zinc-900 font-bold tracking-tight leading-snug ${density === "compact" ? "text-xs line-clamp-1" : "text-[13px] line-clamp-2"}`}
                  >
                    {r.title}
                  </h4>

                  <div className="flex items-center justify-between text-[10.5px] font-medium text-zinc-400 mt-2.5 font-mono">
                    <span>{r.incidents.length} offenses</span>
                    <span>{r.activity}</span>
                  </div>
                  {/* Dynamic Resolution percentage bar */}
                  <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-indigo-500 transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor:
                          r.status === "Resolved" ? "#1f9d5b" : "#4f46e5",
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {processedRecords.length === 0 && (
              <div className="p-8 text-center text-xs text-zinc-400 italic">
                No historical problem records match the filter spectrum
                definitions.
              </div>
            )}
          </div>
        </div>

        {/* SIDE BAR 2: DETAILED RECORD AUDIT CANVAS WORKSPACE */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-9 bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden min-h-[500px]">
          {activeRecord ? (
            <div className="animate-fadeIn">
              {/* Header profile matrix area */}
              <div className="p-6 pb-4 space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-zinc-400">
                  <span className="font-mono text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border">
                    {activeRecord.id}
                  </span>
                  <span>&bull;</span>
                  <span className="capitalize text-zinc-700 bg-zinc-50 px-2 py-0.5 rounded border font-mono text-[11px]">
                    {activeRecord.category}
                  </span>

                  <div className="flex gap-1.5 ml-auto">
                    {activeRecord.status !== "Resolved" ? (
                      <button
                        onClick={() => {
                          setRecords((prev) =>
                            prev.map((x) =>
                              x.id === activeRecord.id
                                ? { ...x, status: "Resolved" }
                                : x,
                            ),
                          );
                          alert(
                            "Problem record closed. Downstream KBs synchronized successfully.",
                          );
                        }}
                        className="h-7 px-3.5 bg-zinc-950 text-white font-bold rounded-lg hover:bg-zinc-800 text-[11px] shadow-sm transition-all"
                      >
                        Resolve &amp; Close Record
                      </button>
                    ) : (
                      <span className="h-7 px-2.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-100 text-[11px] flex items-center">
                        ✓ Resolution Verified
                      </span>
                    )}
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 leading-snug">
                  {activeRecord.title}
                </h2>

                {/* Meta Matrix data block keys */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-zinc-100 pt-4 text-xs font-medium text-zinc-600 leading-none">
                  <div>
                    <span className="text-zinc-400 block mb-1 font-mono text-[9px] uppercase tracking-wider">
                      Owning Team
                    </span>{" "}
                    {OWNERS[activeRecord.owner] || activeRecord.owner}
                  </div>
                  <div>
                    <span className="text-zinc-400 block mb-1 font-mono text-[9px] uppercase tracking-wider">
                      Assignee Profile
                    </span>{" "}
                    {PEOPLE[activeRecord.assignee as keyof typeof PEOPLE]
                      ?.name || activeRecord.assignee}
                  </div>
                  <div>
                    <span className="text-zinc-400 block mb-1 font-mono text-[9px] uppercase tracking-wider">
                      Urgency Impact
                    </span>{" "}
                    {activeRecord.impact} / {activeRecord.urgency}
                  </div>
                  <div>
                    <span className="text-zinc-400 block mb-1 font-mono text-[9px] uppercase tracking-wider">
                      Corporate Watchers
                    </span>{" "}
                    {activeRecord.watchers} operators
                  </div>
                </div>
              </div>

              {/* Segmented layout Navigation Tabs panel strips */}
              <div className="flex border-b border-zinc-100 bg-zinc-50/50 px-6 gap-6 text-xs font-bold text-zinc-500">
                {[
                  { id: "overview", label: "Recap Overview" },
                  {
                    id: "findings",
                    label: `Investigation Findings Ledger (${activeRecord.findings.length})`,
                  },
                  {
                    id: "resolution",
                    label: `Remediation Checkpoints (${activeRecord.steps.filter((x) => x.done).length}/${activeRecord.steps.length})`,
                  },
                  {
                    id: "kb",
                    label: activeRecord.kb.published
                      ? "KB Asset Synced"
                      : "KB Generation Draft",
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 border-b-2 transition-colors cursor-pointer ${activeTab === tab.id ? "border-zinc-950 text-zinc-950 font-black" : "border-transparent hover:text-zinc-800"}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB INNER CONTENT HUB BOX VIEW SPANS */}
              <div className="p-6 min-h-[260px]">
                {/* SUB TAB VALUE 1: OVERVIEW METRIC CHANNELS */}
                {activeTab === "overview" && (
                  <div className="space-y-6 animate-fadeIn text-xs leading-relaxed">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase block">
                        Executive Recurrence Summary
                      </span>
                      <p className="text-sm font-normal text-zinc-700 leading-relaxed bg-zinc-50/40 p-3.5 border rounded-xl">
                        {activeRecord.summary}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Root cause confirmation card */}
                      <div className="p-4 border rounded-xl bg-zinc-50/50 space-y-2">
                        <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase block">
                          Root Cause Insight ({activeRecord.confidence}% match)
                        </span>
                        <h4 className="font-bold text-zinc-950 text-[13px]">
                          {activeRecord.rootcause.title}
                        </h4>
                        <p className="text-zinc-600 font-medium leading-normal">
                          {activeRecord.rootcause.body}
                        </p>
                      </div>

                      {/* Interim Workarounds modules logs */}
                      {activeRecord.workaround && (
                        <div className="p-4 border border-amber-200/80 bg-amber-50/30 rounded-xl space-y-2">
                          <span className="text-[10px] font-mono font-bold tracking-wider text-amber-700 uppercase block">
                            Active Interim Workaround Mitigation
                          </span>
                          <p className="text-amber-950 leading-relaxed font-medium">
                            {activeRecord.workaround.text}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Correlated offenses instances loop records */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase block">
                        Aggregated Telemetry Offenses
                      </span>
                      <div className="divide-y border rounded-xl overflow-hidden bg-white">
                        {activeRecord.incidents.map((i, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 flex items-center justify-between font-mono text-[11px] text-zinc-600 font-medium"
                          >
                            <span className="font-bold text-zinc-900">
                              {i.id}
                            </span>
                            <span className="font-sans truncate text-left flex-1 px-4 text-zinc-500">
                              {i.desc}
                            </span>
                            <span className="text-zinc-400 shrink-0">
                              {i.date}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB TAB VALUE 2: IMMUTABLE INVESTIGATION LEDGER */}
                {activeTab === "findings" && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Add new appended finding form composer panel */}
                    <form
                      onSubmit={handleAddNewFinding}
                      className="border bg-zinc-50/40 p-4 rounded-xl space-y-3"
                    >
                      <div className="text-xs font-bold text-zinc-700 flex items-center gap-1.5 uppercase">
                        <Plus size={14} className="text-emerald-600" /> Log
                        Diagnostic Observation Evidence
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <select
                          value={fType}
                          onChange={(e) => setFType(e.target.value)}
                          className="h-9 border px-2 text-xs font-bold bg-white rounded-md cursor-pointer outline-none"
                        >
                          {[
                            "Observation",
                            "Evidence",
                            "Hypothesis",
                            "Test result",
                            "Decision",
                          ].map((x) => (
                            <option key={x} value={x}>
                              {x}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Source telemetry reference..."
                          value={fSource}
                          onChange={(e) => setFSource(e.target.value)}
                          className="h-9 border px-3 text-xs bg-white rounded-md outline-none flex-1 col-span-2"
                        />
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Type absolute facts or transaction observations here. Once appended, logs cannot be modified."
                        value={fBody}
                        onChange={(e) => setFBody(e.target.value)}
                        className="w-full text-xs font-medium border p-2 rounded-md bg-white outline-none leading-relaxed resize-y"
                      />
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[10px] text-zinc-400 font-medium leading-tight max-w-sm">
                          Findings entry layers remain permanent. Authorship is
                          stamped on sign-off.
                        </span>
                        <button
                          type="submit"
                          className="h-8 px-3.5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-lg shadow-sm"
                        >
                          Append Findings Node
                        </button>
                      </div>
                    </form>

                    {/* Render existing listings reverse chronologically */}
                    <div className="space-y-2.5">
                      {[...activeRecord.findings].reverse().map((f, i) => (
                        <div
                          key={i}
                          className="p-4 border rounded-xl bg-white shadow-3xs space-y-2 text-xs"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded border font-mono font-bold tracking-wider text-[10px] uppercase bg-zinc-100 text-zinc-700">
                              {f.type}
                            </span>
                            <span className="font-mono text-zinc-400 text-[11px] ml-auto">
                              {f.ts}
                            </span>
                          </div>
                          <p className="text-zinc-800 leading-relaxed font-medium">
                            {f.body}
                          </p>
                          {f.source && (
                            <div className="text-[11px] font-mono text-indigo-700 font-semibold tracking-tight">
                              Source Context: {f.source}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUB TAB VALUE 3: REMEDIATION ACTION PLAN BLOCK */}
                {activeTab === "resolution" && (
                  <div className="space-y-4定位 animate-fadeIn">
                    {/* Add action plan steps matrix loop */}
                    <div className="space-y-3">
                      {activeRecord.steps.map((step, idx) => {
                        const isCompleting = completingStepIdx === idx;
                        return (
                          <div
                            key={idx}
                            className={`p-4 border rounded-xl space-y-2 text-xs font-medium relative transition-all ${step.done ? "border-emerald-200 bg-emerald-50/20 text-emerald-950" : "border-zinc-200 text-zinc-700"}`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={step.done}
                                onChange={() => handleSignoffStep(idx)}
                                className="accent-emerald-600 h-4 w-4 rounded shrink-0 mt-0.5 cursor-pointer"
                              />
                              <div className="flex-1 space-y-1">
                                <div className="font-mono text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider">
                                  Step {idx + 1}
                                </div>
                                <h4 className="font-bold text-zinc-950 text-[13.5px] leading-tight">
                                  {step.t}
                                </h4>
                                <p className="text-zinc-500 font-normal leading-relaxed">
                                  {step.d}
                                </p>
                              </div>
                            </div>

                            {/* Sign-off completion justification box form */}
                            {isCompleting && !step.done && (
                              <div className="bg-zinc-50 border p-3 rounded-lg flex gap-2 items-center mt-2 animate-fadeIn">
                                <input
                                  type="text"
                                  placeholder="Provide optional validation logs or change request hash..."
                                  value={completionNote}
                                  onChange={(e) =>
                                    setCompletionNote(e.target.value)
                                  }
                                  className="h-8.5 text-xs px-2.5 border bg-white flex-1 rounded outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => commitSignoffStep(idx)}
                                  className="h-8.5 px-3 bg-emerald-600 text-white rounded font-bold"
                                >
                                  Authorize Check
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCompletingStepIdx(null)}
                                  className="h-8.5 px-2.5 text-zinc-400 hover:text-zinc-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}

                            {step.done && step.by && (
                              <div className="text-[11px] font-mono text-emerald-800 font-bold bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 mt-1 flex items-center gap-1.5">
                                <CheckCircle2 size={12} /> Verified by
                                supervisor // {step.at}{" "}
                                {step.note ? `— "${step.note}"` : ""}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Step creation drawer form trigger */}
                    {isAddingStep ? (
                      <form
                        onSubmit={handleAddPlanStep}
                        className="border bg-zinc-50/40 p-4 rounded-xl space-y-3 text-xs animate-fadeIn"
                      >
                        <div className="font-bold text-zinc-700 uppercase tracking-wider">
                          Add Permanent Resolution Plan Step
                        </div>
                        <input
                          type="text"
                          placeholder="Step title (e.g. Apply schema indices migrations)"
                          value={newStepTitle}
                          onChange={(e) => setNewStepTitle(e.target.value)}
                          className="h-9 w-full border px-3 rounded-md outline-none bg-white font-medium"
                        />
                        <textarea
                          placeholder="How will this implementation path be explicitly validated?"
                          value={newStepDetail}
                          onChange={(e) => setNewStepDetail(e.target.value)}
                          className="w-full border p-2.5 rounded-md bg-white outline-none leading-relaxed"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setIsAddingStep(false)}
                            className="h-8.5 px-3 text-zinc-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="h-8.5 px-4 bg-zinc-950 text-white font-bold rounded-lg shadow-sm"
                          >
                            Append Plan Action
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setIsAddingStep(true)}
                        className="w-full h-11 border border-dashed border-zinc-200 hover:border-zinc-400 rounded-xl text-xs font-bold text-zinc-500 hover:text-zinc-700 transition-colors flex items-center justify-center gap-1.5 bg-zinc-50/20"
                      >
                        + Append New Resolution Step
                      </button>
                    )}
                  </div>
                )}

                {/* SUB TAB VALUE 4: KNOWLEDGE BASE INTEGRATION SYNCS */}
                {activeTab === "kb" && (
                  <div className="space-y-4 animate-fadeIn text-xs leading-relaxed">
                    <div className="p-4 border rounded-xl bg-zinc-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-zinc-900 text-sm">
                          {activeRecord.kb.published
                            ? "Knowledge Base Article Active"
                            : "Draft Asset Generation Available"}
                        </h4>
                        <p className="text-zinc-500 text-[11.5px] font-medium mt-0.5">
                          {activeRecord.kb.published
                            ? `Article reference ${activeRecord.kb.articleId} is distributed cluster-wide.`
                            : "Publish this problem record structure directly into internal support documentation matrices."}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-3">
                        <label className="flex items-center gap-1.5 font-semibold text-zinc-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activeRecord.kb.autoSync}
                            onChange={() => {}}
                            className="accent-emerald-600 h-3.5 w-3.5"
                          />{" "}
                          Auto-sync amendments
                        </label>
                        {!activeRecord.kb.published && (
                          <button
                            type="button"
                            onClick={() => {
                              setRecords((prev) =>
                                prev.map((x) =>
                                  x.id === activeRecord.id
                                    ? {
                                        ...x,
                                        kb: {
                                          ...x.kb,
                                          published: true,
                                          articleId: "KB-8912",
                                          lastSynced: "Just now",
                                        },
                                      }
                                    : x,
                                ),
                              );
                              alert(
                                "Knowledge Base summary published successfully.",
                              );
                            }}
                            className="h-8.5 px-3.5 bg-emerald-600 text-white font-bold rounded-lg shadow-sm text-xs hover:bg-emerald-500"
                          >
                            Publish KB
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Article synthesized document frame review mockup */}
                    <div className="border rounded-xl overflow-hidden bg-white">
                      <div className="px-4 py-2.5 bg-zinc-50/50 border-b font-mono font-bold uppercase tracking-wider text-[10px] text-zinc-400">
                        Synthesized Documentation Layout Blueprint
                      </div>
                      <div className="p-5 space-y-4 text-zinc-800">
                        <h3 className="text-base font-bold text-zinc-950 leading-tight">
                          {activeRecord.title}
                        </h3>
                        <div>
                          <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-700 uppercase block mb-1">
                            Causal Investigation Diagnoses
                          </span>
                          <p className="text-zinc-600 font-medium leading-relaxed">
                            {activeRecord.rootcause.body}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-xs text-zinc-400 italic">
              Select an active repository list node from the lefthand rail
              channel feed to load investigation vectors.
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
