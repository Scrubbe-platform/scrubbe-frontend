"use client";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";
import { AR_OPTS, EVIDENCE, QUICK, SRC_OPTS, SourceKey } from "./evidenceExplorer.data";
import EvidenceSourcesRail from "./EvidenceSourcesRail";
import EvidenceFeed from "./EvidenceFeed";
import EvidenceOverview from "./EvidenceOverview";
import EzraPanel, { EzraPanelHandle } from "./EzraPanel";
import FilterBar, { FilterChip } from "./FilterBar";
import RemediationModal from "./RemediationModal";
import SettingsDrawer, { SettingsState } from "./SettingsDrawer";
import CommandPalette, { Cmd, buildAskCommands } from "./CommandPalette";
import { displayFont, monoFont, sansFont } from "./fonts";

const rnd = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;

const DEFAULT_FILTERS: FilterChip[] = [
  { id: "f-svc", type: "service", label: "Service", value: "payments-api" },
  { id: "f-env", type: "env", label: "Environment", value: "production" },
  { id: "f-reg", type: "region", label: "Region", value: "eu-west-1" },
  { id: "f-phase", type: "phase", label: "Incident Phase", value: "investigation" },
];

const EvidenceExplorer: React.FC<{ incident: IncidentDetailRecord }> = ({ incident }) => {
  const [live, setLive] = useState({
    payErr: 2432, payWarn: 984, pgConn: 483, k8sRestart: 214,
    signals: 1_400_000, errRate: 1842, latency: 732, affected: 14293,
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
  const [settings, setSettings] = useState<SettingsState>({ live: true, compact: false, autoscroll: false, reduceMotion: false });

  const [elapsed, setElapsed] = useState(14 * 60);
  const startRef = useRef(Date.now());
  const ezraRef = useRef<EzraPanelHandle>(null);

  useEffect(() => {
    const id = setInterval(() => setElapsed(14 * 60 + Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const doTick = () => {
    setLive((prev) => ({
      payErr: prev.payErr + rnd(0, 6),
      payWarn: prev.payWarn,
      signals: prev.signals + rnd(700, 3600),
      pgConn: Math.random() < 0.55 ? prev.pgConn + rnd(0, 3) : prev.pgConn,
      k8sRestart: Math.random() < 0.3 ? prev.k8sRestart + 1 : prev.k8sRestart,
      errRate: 1842 + rnd(-90, 150),
      latency: 732 + rnd(-60, 95),
      affected: Math.random() < 0.6 ? prev.affected + rnd(15, 120) : prev.affected,
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
    const items = EVIDENCE.filter((e) => activeSource === "all" || e.source === activeSource);
    const head = ["timestamp", "type", "title", "source", "service", "environment", "region", "severity"];
    const rows = items.map((e) =>
      [e.ts, e.kind, e.title, e.srcLabel, e.services.join("|"), e.env, e.region, e.sev].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
    );
    const csv = [head.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evidence_SI-7A42K91_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Evidence exported", { description: `${items.length} entries · CSV downloaded` });
  };

  const feedCount = EVIDENCE.filter((e) => activeSource === "all" || e.source === activeSource).length;

  const CMDS: Cmd[] = [
    { grp: "Navigate", label: "Go to Overview", sub: "Dashboard panels", run: () => setTab("overview") },
    { grp: "Navigate", label: "Go to Evidence", sub: "Signal feed", run: () => setTab("evidence") },
    ...QUICK.map(([lab, mins]): Cmd => ({ grp: "Time range", label: lab, sub: "Set the dashboard window", run: () => setWindowMinutes(mins) })),
    { grp: "Actions", label: "Refresh now", sub: "Pull the latest signals", run: () => { doTick(); toast.success("Dashboard refreshed"); } },
    { grp: "Actions", label: "Export evidence", sub: "Download visible signals as CSV", run: doExport },
    { grp: "Actions", label: "Review remediation", sub: "Open the rollback plan", run: () => setRemediationOpen(true) },
    { grp: "Actions", label: "Toggle filters", sub: "Show or hide the filter bar", run: () => setFiltersVisible((v) => !v) },
    { grp: "Actions", label: "Open settings", sub: "Live updates, density, motion", run: () => setSettingsOpen(true) },
    ...SRC_OPTS.map(([lab, key]): Cmd => ({ grp: "Sources", label: `Source: ${lab}`, sub: "Filter the evidence feed", run: () => { setActiveSource(key); setTab("evidence"); } })),
    ...buildAskCommands((q) => { setTab("overview"); ezraRef.current?.ask(q); }),
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
    <div className={`${sansFont.className} min-h-screen bg-[#FBFBF9] text-[#15151A] flex flex-col`}>
      {/* Top bar */}
      <header className="flex items-center gap-[18px] px-[22px] py-3 bg-white border-b border-[#E7E6E0] flex-wrap">
        <div className="min-w-0">
          <div className={`${displayFont.className} text-[10.5px] font-semibold tracking-[.14em] uppercase text-[#8A8A93]`}>
            Incidents · SI-7A42K91
          </div>
          <h1 className={`${displayFont.className} text-[17px] font-semibold tracking-tight m-0`}>Evidence Explorer</h1>
          <p className="text-[11.5px] text-[#8A8A93] m-0 mt-px">Investigate every signal correlated to this incident.</p>
        </div>
        <div className="flex-1" />
        <div className="flex items-stretch border border-[#E7E6E0] rounded-[10px] overflow-hidden bg-white shrink-0">
          <Cell k="Incident" v={incident.ticketId || "SI-7A42K91"} mono />
          <Cell
            k="Severity"
            v={
              <span className="inline-flex items-center gap-1.5 text-[#B42A30]">
                <span className="w-[7px] h-[7px] rounded-full bg-[#E5484D]" /> Critical
              </span>
            }
          />
          <Cell
            k="Status"
            v={
              <span className="inline-flex items-center gap-1.5 text-[#9C5E06]">
                <span className="relative w-[7px] h-[7px] rounded-full bg-[#E0890B]">
                  <span className="absolute inset-[-4px] rounded-full border-[1.5px] border-[#E0890B] opacity-45 animate-ping" />
                </span>
                Investigating
              </span>
            }
          />
          <Cell k="Commander" v={<span className="inline-flex items-center gap-1.5"><span className={`${displayFont.className} w-[22px] h-[22px] rounded-full text-white text-[10px] font-semibold flex items-center justify-center`} style={{ background: "linear-gradient(140deg,#2540F2,#5b6bff)" }}>AM</span>A. Mensah</span>} />
          <Cell k="Elapsed" v={`${Math.floor(elapsed / 60)}m`} mono />
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-[22px] py-2.5 bg-white border-b border-[#E7E6E0] flex-wrap sticky top-0 z-[25]">
        <div className="relative">
          <button
            onClick={() => { setSourceOpen((o) => !o); setTimeOpen(false); setAutoOpen(false); }}
            className="flex items-center gap-1.5 h-8 px-3 rounded-[7px] border border-[#E7E6E0] bg-white text-[12.5px] font-medium min-w-[170px] justify-between hover:bg-[#F6F6F3]"
          >
            <span className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase text-[#8A8A93]">Source</span>
              <span>{SRC_OPTS.find(([, k]) => k === activeSource)?.[0]}</span>
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`w-3.5 h-3.5 opacity-55 transition-transform ${sourceOpen ? "rotate-180" : ""}`}><path d="M6 9l6 6 6-6" /></svg>
          </button>
          {sourceOpen && (
            <div className="absolute z-30 top-[calc(100%+6px)] left-0 min-w-[210px] bg-white border border-[#E7E6E0] rounded-[10px] shadow-lg p-[5px]">
              <div className="text-[10px] tracking-wide uppercase text-[#B5B5BC] px-[9px] pt-1.5 pb-1">Evidence source</div>
              {SRC_OPTS.map(([lab, key]) => (
                <button key={key} onClick={() => { setActiveSource(key); setSourceOpen(false); }} className={`w-full flex items-center justify-between text-left px-[9px] py-[7px] text-[12.5px] rounded-[6px] hover:bg-[#F6F6F3] ${activeSource === key ? "text-[#1B30C4] font-semibold" : ""}`}>
                  {lab}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1" />

        <button onClick={() => setCmdkOpen(true)} className="flex items-center gap-2 h-8 px-[11px] rounded-[7px] border border-[#E7E6E0] bg-white text-[12.5px] text-[#8A8A93] hover:bg-[#F6F6F3] hover:text-[#52525B]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} className="w-3.5 h-3.5 opacity-60"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
          <span className="hidden sm:inline">Search</span>
          <span className={`${monoFont.className} text-[10.5px] border border-[#E7E6E0] rounded-[5px] px-1.5`}>⌘K</span>
        </button>

        <div className="relative">
          <button onClick={() => { setTimeOpen((o) => !o); setSourceOpen(false); setAutoOpen(false); }} className="flex items-center gap-1.5 h-8 px-3 rounded-[7px] border border-[#E7E6E0] bg-white text-[12.5px] font-medium hover:bg-[#F6F6F3]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5 opacity-70"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
            {QUICK.find(([, m]) => m === windowMinutes)?.[0] ?? `Last ${windowMinutes} minutes`}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`w-3.5 h-3.5 opacity-55 transition-transform ${timeOpen ? "rotate-180" : ""}`}><path d="M6 9l6 6 6-6" /></svg>
          </button>
          {timeOpen && (
            <div className="absolute z-30 top-[calc(100%+6px)] right-0 w-[220px] bg-white border border-[#E7E6E0] rounded-[10px] shadow-lg p-3">
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK.map(([lab, mins]) => (
                  <button key={lab} onClick={() => { setWindowMinutes(mins); setTimeOpen(false); }} className={`text-left rounded-[7px] px-2.5 py-[7px] text-[12px] border ${windowMinutes === mins ? "bg-[#EEF0FF] text-[#1B30C4] border-[#DCE0FF] font-semibold" : "border-[#E7E6E0] hover:bg-[#F6F6F3]"}`}>
                    {lab}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative inline-flex border border-[#E7E6E0] rounded-[7px] overflow-hidden bg-white">
          <button onClick={doTick} title="Refresh now" className="flex items-center h-8 px-2.5 hover:bg-[#F6F6F3]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} className="w-3.5 h-3.5"><path d="M20 11A8 8 0 105.6 6.6M20 5v5h-5" /></svg>
          </button>
          <button onClick={() => { setAutoOpen((o) => !o); setSourceOpen(false); setTimeOpen(false); }} className={`${monoFont.className} flex items-center gap-1 h-8 px-2 border-l border-[#F0EFEA] text-[11.5px] text-[#52525B] hover:bg-[#F6F6F3]`}>
            <span className="inline-block w-[6px] h-[6px] rounded-full bg-[#0EA47F]" />
            {AR_OPTS.find(([, ms]) => ms === autoRefreshMs)?.[0] ?? "Off"}
          </button>
          {autoOpen && (
            <div className="absolute z-30 top-[calc(100%+6px)] right-0 min-w-[130px] bg-white border border-[#E7E6E0] rounded-[10px] shadow-lg p-[5px]">
              <div className="text-[10px] tracking-wide uppercase text-[#B5B5BC] px-[9px] pt-1.5 pb-1">Auto refresh</div>
              {AR_OPTS.map(([lab, ms]) => (
                <button key={lab} onClick={() => { setAutoRefreshMs(ms); setAutoOpen(false); }} className={`w-full text-left px-[9px] py-[7px] text-[12.5px] rounded-[6px] hover:bg-[#F6F6F3] ${autoRefreshMs === ms ? "text-[#1B30C4] font-semibold" : ""}`}>
                  {lab}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setFiltersVisible((v) => !v)}
          aria-pressed={filtersVisible}
          className={`flex items-center gap-1.5 h-8 px-3 rounded-[7px] border text-[12.5px] font-medium ${filtersVisible ? "bg-[#EEF0FF] border-[#DCE0FF] text-[#1B30C4]" : "border-[#E7E6E0] bg-white hover:bg-[#F6F6F3]"}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} className="w-3.5 h-3.5"><path d="M4 5h16l-6 7v6l-4 2v-8L4 5z" /></svg>
          Filters
        </button>
        <button onClick={doExport} className="flex items-center gap-1.5 h-8 px-3 rounded-[7px] border border-[#E7E6E0] bg-white text-[12.5px] font-medium hover:bg-[#F6F6F3]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} className="w-3.5 h-3.5"><path d="M12 4v11M8 11l4 4 4-4M5 19h14" /></svg>
          Export Evidence
        </button>
        <button onClick={() => setSettingsOpen(true)} title="Settings" className="flex items-center justify-center w-8 h-8 rounded-[7px] border border-[#E7E6E0] bg-white hover:bg-[#F6F6F3]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="w-3.5 h-3.5"><circle cx="12" cy="12" r="3" /><path d="M19.4 13a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-2.9 1.2V21a2 2 0 11-4 0v-.1A1.7 1.7 0 006 19.4l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00-1.2-2.9H2a2 2 0 110-4h.1A1.7 1.7 0 004.6 6l-.1-.1a2 2 0 112.8-2.8l.1.1A1.7 1.7 0 0010 4.6V4a2 2 0 114 0v.1a1.7 1.7 0 002.9 1.2l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 001.2 2.9H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /></svg>
        </button>
      </div>

      {/* Filter bar */}
      {filtersVisible && tab === "evidence" && <FilterBar filters={filters} onChange={setFilters} />}

      {/* Workspace: sources rail (left) + tabstrip/panes (center) + Ezra (right) — always all three */}
      <div className="grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)_360px] gap-4 px-[22px] py-3.5 items-start">
        <EvidenceSourcesRail active={activeSource} onSelect={setActiveSource} live={live} />

        <div className="min-w-0">
          {/* Tabstrip */}
          <div className="sticky top-0 z-[8] flex items-center gap-0.5 border-b border-[#F0EFEA] bg-[#FBFBF9] mb-3">
            {[
              { key: "overview" as const, label: "Overview", icon: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></> },
              { key: "evidence" as const, label: "Evidence", icon: <path d="M4 5h16M4 12h16M4 19h10" />, count: feedCount },
            ].map((tabItem) => (
              <button
                key={tabItem.key}
                onClick={() => setTab(tabItem.key)}
                className={`relative flex items-center gap-1.5 h-[39px] px-3.5 text-[13px] font-medium ${displayFont.className} ${tab === tabItem.key ? "text-[#15151A] after:content-[''] after:absolute after:left-2.5 after:right-2.5 after:-bottom-px after:h-0.5 after:bg-[#2540F2] after:rounded-full" : "text-[#8A8A93] hover:text-[#15151A]"}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} className="w-3.5 h-3.5 opacity-70">{tabItem.icon}</svg>
                {tabItem.label}
                {tabItem.count != null && (
                  <span className={`${monoFont.className} text-[10.5px] px-1.5 rounded-full border ${tab === tabItem.key ? "text-[#1B30C4] bg-[#EEF0FF] border-[#DCE0FF]" : "text-[#8A8A93] bg-[#F6F6F3] border-[#F0EFEA]"}`}>
                    {tabItem.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {tab === "overview" ? (
            <EvidenceOverview
              live={live}
              tick={tick}
              windowMinutes={windowMinutes}
              onOpenRemediation={() => setRemediationOpen(true)}
              onScopeSource={(key) => { setActiveSource(key); setTab("evidence"); }}
              onScopeMinute={(m) => { setScopeMinute(m); if (m != null) setTab("evidence"); }}
            />
          ) : (
            <>
              <div className="flex items-center gap-3 mb-2 px-1">
                <p className="text-[11px] text-[#8A8A93]">
                  Showing <b className="text-[#15151A] font-semibold">{SRC_OPTS.find(([, k]) => k === activeSource)?.[0]}</b> · <b className="text-[#15151A] font-semibold">{QUICK.find(([, m]) => m === windowMinutes)?.[0]}</b>
                </p>
                <span className={`${monoFont.className} ml-auto text-[11.5px] text-[#52525B] bg-white border border-[#E7E6E0] rounded-full px-2.5 py-[3px]`}>{feedCount} entries</span>
              </div>
              <EvidenceFeed activeSource={activeSource} windowMinutes={windowMinutes} live={live} filters={filters} scopeMinute={scopeMinute} />
            </>
          )}
        </div>

        <EzraPanel ref={ezraRef} confidence={confidence} onOpenRemediation={() => setRemediationOpen(true)} ticketId={incident.id} />
      </div>

      {/* Status bar */}
      <footer className="flex items-center gap-0 bg-[#15151A] text-[#e9e9ee] px-2 h-[34px] overflow-x-auto mt-auto">
        <StatusCell k="Evidence Sources" v="24" />
        <StatusCell k="Signals Processed" v={`${(live.signals / 1e6).toFixed(2)}M`} />
        <StatusCell k="Agent Findings" v="18" />
        <StatusCell k="Root Cause Candidates" v="3" />
        <StatusCell k="Investigation Confidence" v={`${confidence}%`} last accent />
      </footer>

      <RemediationModal
        open={remediationOpen}
        onClose={() => setRemediationOpen(false)}
        onApprove={() => {
          setRemediationOpen(false);
          toast.success("Rollback initiated", { description: "payments-api v4.3.8 → v4.3.7 · simulated" });
        }}
      />
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} settings={settings} onToggle={(k) => setSettings((s) => ({ ...s, [k]: !s[k] }))} />
      <CommandPalette open={cmdkOpen} onClose={() => setCmdkOpen(false)} commands={CMDS} />
    </div>
  );
};

const Cell = ({ k, v, mono }: { k: string; v: React.ReactNode; mono?: boolean }) => (
  <div className="px-[13px] py-1.5 flex flex-col gap-px border-r last:border-r-0 border-[#F0EFEA] whitespace-nowrap">
    <span className="text-[9.5px] tracking-wide uppercase text-[#8A8A93]">{k}</span>
    <span className={`text-[12.5px] font-semibold ${mono ? monoFont.className : ""}`}>{v}</span>
  </div>
);

const StatusCell = ({ k, v, last, accent }: { k: string; v: string; last?: boolean; accent?: boolean }) => (
  <div className={`flex items-center gap-1.5 px-3.5 border-r border-[#2a2a32] whitespace-nowrap ${last ? "ml-auto border-l border-r-0" : ""}`}>
    <span className="text-[10px] tracking-wide uppercase text-[#9c9ca6]">{k}</span>
    <span className={`${monoFont.className} text-[12px] font-medium ${accent ? "text-[#9fb0ff]" : ""}`}>{v}</span>
  </div>
);

export default EvidenceExplorer;
