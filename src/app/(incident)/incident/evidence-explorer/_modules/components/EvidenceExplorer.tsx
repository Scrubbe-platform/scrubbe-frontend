"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";
import {
  AR_OPTS,
  EVIDENCE,
  QUICK,
  SRC_OPTS,
  SourceKey,
} from "./evidenceExplorer.data";
import { customAxios } from "@/lib/api/axios";
import { endpoint } from "@/lib/api/endpoint";
import EvidenceSourcesRail from "./EvidenceSourcesRail";
import EvidenceFeed from "./EvidenceFeed";
import EvidenceOverview from "./EvidenceOverview";
import EzraPanel, { EzraPanelHandle } from "./EzraPanel";
import FilterBar, { FilterChip } from "./FilterBar";
import RemediationModal from "./RemediationModal";
import SettingsDrawer, { SettingsState } from "./SettingsDrawer";
import CommandPalette, { Cmd, buildAskCommands } from "./CommandPalette";
import { displayFont, monoFont, sansFont } from "./fonts";
import { Settings } from "lucide-react";

const rnd = (a: number, b: number) =>
  Math.floor(Math.random() * (b - a + 1)) + a;

const DEFAULT_FILTERS: FilterChip[] = [
  { id: "f-svc", type: "service", label: "Service", value: "payments-api" },
  { id: "f-env", type: "env", label: "Environment", value: "production" },
  { id: "f-reg", type: "region", label: "Region", value: "eu-west-1" },
  {
    id: "f-phase",
    type: "phase",
    label: "Incident Phase",
    value: "investigation",
  },
];

const EvidenceExplorer: React.FC<{ incident: IncidentDetailRecord }> = ({
  incident,
}) => {
  const router = useRouter();
  const [live, setLive] = useState({
    payErr: 2432,
    payWarn: 984,
    pgConn: 483,
    k8sRestart: 214,
    signals: 1_400_000,
    errRate: 1842,
    latency: 732,
    affected: 14293,
  });
  const [tick, setTick] = useState(0);
  const [autoRefreshMs, setAutoRefreshMs] = useState(10000);
  const [windowMinutes, setWindowMinutes] = useState(15);
  const [activeSource, setActiveSource] = useState<SourceKey>("all");
  const [tab, setTab] = useState<"overview" | "evidence">("overview");
  const [scopeMinute, setScopeMinute] = useState<number | null>(null);
  const [filters, setFilters] = useState<FilterChip[]>(DEFAULT_FILTERS);
  const [filtersVisible, setFiltersVisible] = useState(true);

  const [sourceOpen, setSourceOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [autoOpen, setAutoOpen] = useState(false);

  const [remediationOpen, setRemediationOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [ezraOpen, setEzraOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsState>({
    live: true,
    compact: false,
    autoscroll: false,
    reduceMotion: false,
  });

  const ezraRef = useRef<EzraPanelHandle>(null);

  // Load real signal stats from the API; fall back to hardcoded init values
  useEffect(() => {
    const incidentId = incident?.id;
    const url = incidentId
      ? `${endpoint.signals.stats}?incidentId=${encodeURIComponent(incidentId)}`
      : endpoint.signals.stats;
    customAxios.get(url).then((res) => {
      const stats = res.data?.data ?? res.data;
      if (stats) {
        setLive((prev) => ({
          ...prev,
          signals: stats.total ?? stats.count ?? prev.signals,
          errRate: stats.errorCount ?? stats.errors ?? prev.errRate,
          affected: stats.affectedUsers ?? stats.userImpact ?? prev.affected,
          latency: stats.avgLatencyMs ?? stats.latency ?? prev.latency,
          payErr: stats.errorEvents ?? stats.paymentErrors ?? prev.payErr,
          pgConn: stats.dbErrors ?? stats.connectionFailures ?? prev.pgConn,
          k8sRestart: stats.k8sRestarts ?? stats.podRestarts ?? prev.k8sRestart,
        }));
      }
    }).catch(() => {});
  }, [incident?.id]);

  const doTick = () => {
    setLive((prev) => ({
      payErr: prev.payErr + rnd(0, 6),
      payWarn: prev.payWarn,
      signals: prev.signals + rnd(700, 3600),
      pgConn: Math.random() < 0.55 ? prev.pgConn + rnd(0, 3) : prev.pgConn,
      k8sRestart: Math.random() < 0.3 ? prev.k8sRestart + 1 : prev.k8sRestart,
      errRate: 1842 + rnd(-90, 150),
      latency: 732 + rnd(-60, 95),
      affected:
        Math.random() < 0.6 ? prev.affected + rnd(15, 120) : prev.affected,
    }));
    setTick((t) => t + 1);
  };

  useEffect(() => {
    if (!autoRefreshMs || !settings.live) return;
    const id = setInterval(doTick, autoRefreshMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefreshMs, settings.live]);

  const doExport = () => {
    const items = EVIDENCE.filter(
      (e) => activeSource === "all" || e.source === activeSource,
    );
    const head = [
      "timestamp",
      "type",
      "title",
      "source",
      "service",
      "environment",
      "region",
      "severity",
    ];
    const rows = items.map((e) =>
      [
        e.ts,
        e.kind,
        e.title,
        e.srcLabel,
        e.services.join("|"),
        e.env,
        e.region,
        e.sev,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [head.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evidence_SI-7A42K91_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Evidence exported", {
      description: `${items.length} entries · CSV downloaded`,
    });
  };

  const feedCount = EVIDENCE.filter(
    (e) => activeSource === "all" || e.source === activeSource,
  ).length;

  const CMDS: Cmd[] = [
    {
      grp: "Navigate",
      label: "Go to Overview",
      sub: "Dashboard panels",
      run: () => setTab("overview"),
    },
    {
      grp: "Navigate",
      label: "Go to Evidence",
      sub: "Signal feed",
      run: () => setTab("evidence"),
    },
    ...QUICK.map(
      ([lab, mins]): Cmd => ({
        grp: "Time range",
        label: lab,
        sub: "Set the dashboard window",
        run: () => setWindowMinutes(mins),
      }),
    ),
    {
      grp: "Actions",
      label: "Refresh now",
      sub: "Pull the latest signals",
      run: () => {
        doTick();
        toast.success("Dashboard refreshed");
      },
    },
    {
      grp: "Actions",
      label: "Export evidence",
      sub: "Download visible signals as CSV",
      run: doExport,
    },
    {
      grp: "Actions",
      label: "Review remediation",
      sub: "Open the rollback plan",
      run: () => setRemediationOpen(true),
    },
    {
      grp: "Actions",
      label: "Toggle filters",
      sub: "Show or hide the filter bar",
      run: () => setFiltersVisible((v) => !v),
    },
    {
      grp: "Actions",
      label: "Open settings",
      sub: "Live updates, density, motion",
      run: () => setSettingsOpen(true),
    },
    {
      grp: "Actions",
      label: "Open Ezra",
      sub: "Investigation assistant sidebar",
      run: () => setEzraOpen(true),
    },
    ...SRC_OPTS.map(
      ([lab, key]): Cmd => ({
        grp: "Sources",
        label: `Source: ${lab}`,
        sub: "Filter the evidence feed",
        run: () => {
          setActiveSource(key);
          setTab("evidence");
        },
      }),
    ),
    ...buildAskCommands((q) => {
      setTab("overview");
      setEzraOpen(true);
      ezraRef.current?.ask(q);
    }),
  ];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdkOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const confidence = 82;

  return (
    <div
      className={`${sansFont.className} min-h-screen bg-[#FBFBF9] dark:bg-zinc-950 text-[#15151A] dark:text-zinc-100 flex flex-col`}
    >
      {/* Top bar */}
      <header className="px-[22px] py-4 bg-white dark:bg-zinc-900 border-b border-[#E7E6E0] dark:border-zinc-800">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 h-9 px-4 rounded-[10px] border border-[#E7E6E0] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[13.5px] font-medium text-[#15151A] dark:text-zinc-100 hover:bg-[#F6F6F3] dark:hover:bg-zinc-800 transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-4 h-4"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </button>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() =>
                toast.success("Incident marked resolved (simulated)")
              }
              className="h-9 px-5 rounded-[10px] bg-emerald-600 text-white text-[13.5px] font-semibold hover:bg-emerald-700 transition-colors"
            >
              Resolve
            </button>
            <button
              onClick={() => toast.info("Escalation triggered (simulated)")}
              className="h-9 px-5 rounded-[10px] border border-[#E7E6E0] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[13.5px] font-medium text-[#15151A] dark:text-zinc-100 hover:bg-[#F6F6F3] dark:hover:bg-zinc-800 transition-colors"
            >
              Escalate
            </button>
            <button
              onClick={() => toast.info("Handoff request sent (simulated)")}
              className="h-9 px-5 rounded-[10px] border border-[#E7E6E0] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[13.5px] font-medium text-[#15151A] dark:text-zinc-100 hover:bg-[#F6F6F3] dark:hover:bg-zinc-800 transition-colors"
            >
              Handoff
            </button>
          </div>
        </div>
        <div className="mt-4 min-w-0">
          <h1
            className={`${displayFont.className} text-[26px] font-bold tracking-tight text-[#15151A] dark:text-zinc-100 m-0`}
          >
            Evidence Explorer
          </h1>
          <p className="text-[13px] text-[#8A8A93] dark:text-zinc-500 m-0 mt-1">
            Investigate every signal correlated to this incident.
          </p>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex items-center gap-2.5 px-[22px] py-2.5 bg-white dark:bg-zinc-900 border-b border-[#E7E6E0] dark:border-zinc-800 flex-wrap sticky top-0 z-[25]">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-[#8A8A93] dark:text-zinc-500">Source</span>
          <div className="relative">
            <button
              onClick={() => {
                setSourceOpen((o) => !o);
                setTimeOpen(false);
                setAutoOpen(false);
              }}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-[9px] border border-[#E7E6E0] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[13px] font-medium text-[#15151A] dark:text-zinc-100 hover:bg-[#F6F6F3] dark:hover:bg-zinc-800"
            >
              {SRC_OPTS.find(([, k]) => k === activeSource)?.[0]}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className={`w-3.5 h-3.5 opacity-55 transition-transform ${sourceOpen ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {sourceOpen && (
              <div className="absolute z-30 top-[calc(100%+6px)] left-0 min-w-[210px] bg-white dark:bg-zinc-900 border border-[#E7E6E0] dark:border-zinc-800 rounded-[10px] shadow-lg p-[5px]">
                <div className="text-[10px] tracking-wide uppercase text-[#B5B5BC] dark:text-zinc-600 px-[9px] pt-1.5 pb-1">
                  Evidence source
                </div>
                {SRC_OPTS.map(([lab, key]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveSource(key);
                      setSourceOpen(false);
                    }}
                    className={`w-full flex items-center justify-between text-left px-[9px] py-[7px] text-[12.5px] rounded-[6px] text-[#15151A] dark:text-zinc-100 hover:bg-[#F6F6F3] dark:hover:bg-zinc-800 ${activeSource === key ? "text-[#1B30C4] dark:text-blue-400 font-semibold" : ""}`}
                  >
                    {lab}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1" />

        <button
          onClick={() => setCmdkOpen(true)}
          className="flex items-center justify-between gap-4 h-9 px-3.5 min-w-[170px] rounded-[9px] border border-[#E7E6E0] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[13px] text-[#8A8A93] dark:text-zinc-500 hover:bg-[#F6F6F3] dark:hover:bg-zinc-800"
        >
          <span>Search</span>
          <span
            className={`${monoFont.className} text-[10.5px] border border-[#E7E6E0] dark:border-zinc-800 rounded-[5px] px-1.5`}
          >
            ⌘K
          </span>
        </button>

        <div className="relative">
          <button
            onClick={() => {
              setTimeOpen((o) => !o);
              setSourceOpen(false);
              setAutoOpen(false);
            }}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-[9px] border border-[#E7E6E0] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[13px] font-medium text-[#15151A] dark:text-zinc-100 hover:bg-[#F6F6F3] dark:hover:bg-zinc-800"
          >
            {QUICK.find(([, m]) => m === windowMinutes)?.[0] ??
              `Last ${windowMinutes} minutes`}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className={`w-3.5 h-3.5 opacity-55 transition-transform ${timeOpen ? "rotate-180" : ""}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {timeOpen && (
            <div className="absolute z-30 top-[calc(100%+6px)] right-0 w-[220px] bg-white dark:bg-zinc-900 border border-[#E7E6E0] dark:border-zinc-800 rounded-[10px] shadow-lg p-3">
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK.map(([lab, mins]) => (
                  <button
                    key={lab}
                    onClick={() => {
                      setWindowMinutes(mins);
                      setTimeOpen(false);
                    }}
                    className={`text-left rounded-[7px] px-2.5 py-[7px] text-[12px] border ${windowMinutes === mins ? "bg-[#EEF0FF] dark:bg-blue-500/10 text-[#1B30C4] dark:text-blue-400 border-[#DCE0FF] dark:border-blue-500/20 font-semibold" : "border-[#E7E6E0] dark:border-zinc-800 text-[#15151A] dark:text-zinc-100 hover:bg-[#F6F6F3] dark:hover:bg-zinc-800"}`}
                  >
                    {lab}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative inline-flex items-stretch border border-[#E7E6E0] dark:border-zinc-800 rounded-[9px] overflow-hidden bg-white dark:bg-zinc-900">
          <button
            onClick={doTick}
            title="Refresh now"
            className="flex items-center h-9 px-2.5 text-[#15151A] dark:text-zinc-100 hover:bg-[#F6F6F3] dark:hover:bg-zinc-800"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.9}
              className="w-3.5 h-3.5"
            >
              <path d="M20 11A8 8 0 105.6 6.6M20 5v5h-5" />
            </svg>
          </button>
          <button
            onClick={() => {
              setAutoOpen((o) => !o);
              setSourceOpen(false);
              setTimeOpen(false);
            }}
            className={`${monoFont.className} flex items-center gap-1.5 h-9 px-3 border-l border-[#F0EFEA] dark:border-zinc-800 text-[13px] text-[#15151A] dark:text-zinc-100 hover:bg-[#F6F6F3] dark:hover:bg-zinc-800`}
          >
            <span className="inline-block w-[6px] h-[6px] rounded-full bg-[#0EA47F]" />
            {AR_OPTS.find(([, ms]) => ms === autoRefreshMs)?.[0] ?? "Off"}
          </button>
          {autoOpen && (
            <div className="absolute z-30 top-[calc(100%+6px)] right-0 min-w-[130px] bg-white dark:bg-zinc-900 border border-[#E7E6E0] dark:border-zinc-800 rounded-[10px] shadow-lg p-[5px]">
              <div className="text-[10px] tracking-wide uppercase text-[#B5B5BC] dark:text-zinc-600 px-[9px] pt-1.5 pb-1">
                Auto refresh
              </div>
              {AR_OPTS.map(([lab, ms]) => (
                <button
                  key={lab}
                  onClick={() => {
                    setAutoRefreshMs(ms);
                    setAutoOpen(false);
                  }}
                  className={`w-full text-left px-[9px] py-[7px] text-[12.5px] rounded-[6px] text-[#15151A] dark:text-zinc-100 hover:bg-[#F6F6F3] dark:hover:bg-zinc-800 ${autoRefreshMs === ms ? "text-[#1B30C4] dark:text-blue-400 font-semibold" : ""}`}
                >
                  {lab}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setFiltersVisible((v) => !v)}
          aria-pressed={filtersVisible}
          className={`h-9 px-3.5 rounded-[9px] border text-[13px] font-medium ${filtersVisible ? "bg-[#EEF0FF] dark:bg-blue-500/10 border-[#DCE0FF] dark:border-blue-500/20 text-[#1B30C4] dark:text-blue-400" : "border-[#E7E6E0] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#15151A] dark:text-zinc-100 hover:bg-[#F6F6F3] dark:hover:bg-zinc-800"}`}
        >
          Filters
        </button>
        <button
          onClick={doExport}
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-[9px] border border-[#E7E6E0] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[13px] font-semibold text-[#15151A] dark:text-zinc-100 hover:bg-[#F6F6F3] dark:hover:bg-zinc-800"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-3.5 h-3.5"
          >
            <path d="M12 4v11M8 11l4 4 4-4M5 19h14" />
          </svg>
          Export Evidence
        </button>
        <button
          onClick={() => setSettingsOpen(true)}
          title="Settings"
          className="flex items-center justify-center w-9 h-9 rounded-[9px] border border-[#E7E6E0] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#15151A] dark:text-zinc-100 hover:bg-[#F6F6F3] dark:hover:bg-zinc-800"
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Filter bar */}
      {filtersVisible && tab === "evidence" && (
        <FilterBar filters={filters} onChange={setFilters} />
      )}

      {/* Workspace: sources rail (left) + tabstrip/panes (center); Ezra lives in a slide-in sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-[360px_minmax(0,1fr)] gap-4 px-[22px] py-3.5 items-start">
        <EvidenceSourcesRail
          active={activeSource}
          onSelect={setActiveSource}
          live={live}
        />

        <div className="min-w-0">
          {/* Tabstrip */}
          <div className="sticky top-0 z-[8] flex items-center gap-4 border-b border-[#F0EFEA] dark:border-zinc-800 bg-[#FBFBF9] dark:bg-zinc-950 mb-3">
            {[
              { key: "overview" as const, label: "Overview" },
              { key: "evidence" as const, label: "Evidence" },
            ].map((tabItem) => (
              <button
                key={tabItem.key}
                onClick={() => setTab(tabItem.key)}
                className={`relative h-[39px] text-[14px] ${displayFont.className} ${tab === tabItem.key ? "text-[#16A34A] dark:text-emerald-400 font-semibold after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-px after:h-0.5 after:bg-[#16A34A] dark:after:bg-emerald-400 after:rounded-full" : "text-[#8A8A93] dark:text-zinc-500 font-medium hover:text-[#15151A] dark:hover:text-zinc-100"}`}
              >
                {tabItem.label}
              </button>
            ))}
          </div>

          {tab === "overview" ? (
            <EvidenceOverview
              live={live}
              tick={tick}
              windowMinutes={windowMinutes}
              onOpenRemediation={() => setRemediationOpen(true)}
              onOpenEzra={() => setEzraOpen(true)}
              onScopeSource={(key) => {
                setActiveSource(key);
                setTab("evidence");
              }}
              onScopeMinute={(m) => {
                setScopeMinute(m);
                if (m != null) setTab("evidence");
              }}
            />
          ) : (
            <>
              <div className="flex items-start justify-between gap-3 mb-4 px-1">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8A8A93] dark:text-zinc-500">
                    Evidence Feed
                  </p>
                  <p className="text-[14px] text-[#15151A] dark:text-zinc-100 mt-0.5">
                    Showing {SRC_OPTS.find(([, k]) => k === activeSource)?.[0]}
                    {filters.find((f) => f.type === "env") && (
                      <> · {filters.find((f) => f.type === "env")?.value}</>
                    )}{" "}
                    · {QUICK.find(([, m]) => m === windowMinutes)?.[0]}
                  </p>
                </div>
                <span className="text-[12.5px] text-[#52525B] dark:text-zinc-400 bg-[#F1F0EB] dark:bg-zinc-800 rounded-full px-3 py-1 shrink-0">
                  {feedCount} entries
                </span>
              </div>
              <EvidenceFeed
                activeSource={activeSource}
                windowMinutes={windowMinutes}
                live={live}
                filters={filters}
                scopeMinute={scopeMinute}
              />
            </>
          )}
        </div>
      </div>

      {/* Ezra: slide-in investigation sidebar, opened via "More details" */}
      {ezraOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setEzraOpen(false)}
        />
      )}
      <div
        className={`fixed inset-y-0 right-0 z-40 w-[400px] max-w-[92vw] bg-[#FBFBF9] dark:bg-zinc-950 shadow-2xl transition-transform duration-300 ${
          ezraOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col p-3">
          <button
            onClick={() => setEzraOpen(false)}
            aria-label="Close"
            className="self-end mb-2 flex items-center justify-center w-8 h-8 rounded-[8px] border border-[#E7E6E0] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#8A8A93] dark:text-zinc-500 hover:bg-[#F6F6F3] dark:hover:bg-zinc-800 hover:text-[#15151A] dark:hover:text-zinc-100 shrink-0"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-4 h-4"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <EzraPanel
              ref={ezraRef}
              confidence={confidence}
              onOpenRemediation={() => setRemediationOpen(true)}
              ticketId={incident.id}
            />
          </div>
        </div>
      </div>

      {/* Status bar */}

      <RemediationModal
        open={remediationOpen}
        onClose={() => setRemediationOpen(false)}
        onApprove={() => {
          setRemediationOpen(false);
          toast.success("Rollback initiated", {
            description: "payments-api v4.3.8 → v4.3.7 · simulated",
          });
        }}
      />
      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onToggle={(k) => setSettings((s) => ({ ...s, [k]: !s[k] }))}
      />
      <CommandPalette
        open={cmdkOpen}
        onClose={() => setCmdkOpen(false)}
        commands={CMDS}
      />
    </div>
  );
};

const StatusCell = ({
  k,
  v,
  last,
  accent,
}: {
  k: string;
  v: string;
  last?: boolean;
  accent?: boolean;
}) => (
  <div
    className={`flex items-center gap-1.5 px-3.5 border-r border-[#2a2a32] whitespace-nowrap ${last ? "ml-auto border-l border-r-0" : ""}`}
  >
    <span className="text-[10px] tracking-wide uppercase text-[#9c9ca6]">
      {k}
    </span>
    <span
      className={`${monoFont.className} text-[12px] font-medium ${accent ? "text-[#9fb0ff]" : ""}`}
    >
      {v}
    </span>
  </div>
);

export default EvidenceExplorer;
