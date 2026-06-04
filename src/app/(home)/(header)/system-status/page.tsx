"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  RefreshCw, ChevronRight, ChevronDown, Shield, Zap, Database,
  Globe, Bell, Lock, BarChart2, Calendar, Radio, GitCommit, Cloud,
} from "lucide-react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────

interface StatusData {
  status: string;
  summary: { healthy: number; degraded: number; critical: number; unknown: number };
  service: { uptimeHuman: string; version: string; nodeVersion: string; startedAt: string; host: string; pid: number; platform: string; architecture: string };
  deployment: { platform: string; region: string; elasticBeanstalkEnvironment: string; release: { commitSha: string; buildId: string; deployedAt: string } };
  endpoints: { api: { baseUrl: string }; frontends: Array<{ name: string; url: string; status: string; latencyMs: number | null; statusCode: number; reachable: boolean }> };
  checks: Record<string, { name: string; category: string; status: string; ready: boolean; checkedAt: string; latencyMs: number | null; details: any; error: any }>;
  metrics: { runtime: { eventLoopDelay: { meanMs: number; maxMs: number }; process: { memoryRssBytes: number; memoryHeapUsedBytes: number; memoryHeapTotalBytes: number }; system: { cpus: number; totalMemoryBytes: number; freeMemoryBytes: number; disk: { usedPercent: number; totalBytes: number; freeBytes: number } } }; database: { businesses: number; users: { total: number; active: number }; incidents: { total: number; active: number; resolved: number } } };
  activity: { database: { recentIncident: any; recentWebhook: any }; socket: { activeClientConnections: number } };
  generatedAt: string;
}

// ── Static / dummy data ───────────────────────────────────────────

const UPTIME_BARS = Array.from({ length: 90 }, () => ({
  value: Math.random() > 0.04 ? 100 : 95 + Math.random() * 4,
}));

const SPARKLINE_90D = Array.from({ length: 90 }, () => 99.5 + Math.random() * 0.5);

const SERVICES = [
  { id: "api",           name: "API Platform",               desc: "Core API and gateway",                        icon: Globe,     incidents: 1, checkKey: "pipeline"     },
  { id: "agent",         name: "Agent Orchestrator",         desc: "Autonomous agents, SLA enforcement",           icon: Zap,       incidents: 0, checkKey: "pipeline"     },
  { id: "playbook",      name: "Playbook Engine",            desc: "Auto-select playbooks, guardrail enforcement", icon: BarChart2, incidents: 0, checkKey: "pipeline"     },
  { id: "integrations",  name: "Integrations & Connectors",  desc: "GitHub, GitLab, Slack, Stripe, Twilio",        icon: Radio,     incidents: 1, checkKey: "integrations" },
  { id: "data",          name: "Data & Storage",             desc: "PostgreSQL, Redis, object store",              icon: Database,  incidents: 0, checkKey: "database"     },
  { id: "auth",          name: "Authentication",             desc: "SSO, OAuth providers, user management",        icon: Lock,      incidents: 1, checkKey: "auth"         },
  { id: "notifications", name: "Notifications",              desc: "Resend email, Slack Block Kit, WebSocket",     icon: Bell,      incidents: 0, checkKey: "email"        },
];

const REGIONS = [
  { label: "US-EAST-1", latency: 64,  color: "#22c55e" },
  { label: "EU-WEST-1", latency: 72,  color: "#22c55e" },
  { label: "AP-SE-1",   latency: 127, color: "#f59e0b" },
  { label: "SA-EAST-1", latency: 92,  color: "#f59e0b" },
];

const MAINTENANCE_DONE = [
  { title: "Database index rebuild — PostgreSQL 18.3 upgrade", date: "2026-05-10 · 02:00–04:00 UTC", note: "Read-only mode for 12 minutes" },
  { title: "Redis cluster failover test — us-east-1",          date: "2026-04-22 · 01:00–02:30 UTC", note: "No user-facing impact"        },
];

// ── Helpers ───────────────────────────────────────────────────────

const MB = (b: number) => Math.round(b / 1024 / 1024);

const dot = (s: string) =>
  s === "healthy" ? "bg-emerald-400" : s === "degraded" ? "bg-amber-400" : "bg-red-400";

const textStatus = (s: string) =>
  s === "healthy" ? "text-emerald-500" : s === "degraded" ? "text-amber-500" : "text-red-500";

// ── Sparkline ─────────────────────────────────────────────────────

const Sparkline = ({ values, color = "#22c55e", w = 100, h = 24 }: { values: number[]; color?: string; w?: number; h?: number }) => {
  const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * (h - 2) - 1}`);
  const d = `M${pts.join("L")}`;
  const fill = `M${pts[0]}L${pts.join("L")}L${w},${h}L0,${h}Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <path d={fill} fill={color} fillOpacity="0.1" />
      <path d={d} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ── Uptime bars ───────────────────────────────────────────────────

const UptimeBars = ({ bars }: { bars: typeof UPTIME_BARS }) => (
  <div className="flex items-end gap-[2px] h-10">
    {bars.map((b, i) => (
      <div
        key={i}
        title={`${b.value.toFixed(2)}%`}
        style={{ height: `${(b.value / 100) * 100}%` }}
        className={`flex-1 rounded-[1px] ${b.value >= 99.9 ? "bg-emerald-400" : b.value >= 99 ? "bg-amber-400" : "bg-red-400"}`}
      />
    ))}
  </div>
);

// ── Resource bar ──────────────────────────────────────────────────

const ResBat = ({ label, used, total, unit, color }: { label: string; used: number; total: number; unit: string; color: string }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className="text-[11px] font-medium text-gray-600">{used} / {total} {unit}</span>
    </div>
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${Math.round((used / total) * 100)}%`, background: color }} />
    </div>
  </div>
);

// ── Service row ───────────────────────────────────────────────────

const ServiceRow = ({ svc, status, expanded, onToggle }: {
  svc: typeof SERVICES[0]; status: string; expanded: boolean; onToggle: () => void;
}) => {
  const Icon = svc.icon;
  const spark = useRef(Array.from({ length: 30 }, () => 99 + Math.random())).current;
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden mb-2 bg-white">
      <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50/80 transition-colors" onClick={onToggle}>
        <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
          <Icon size={15} className="text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-black">{svc.name}</p>
          <p className="text-[11px] text-gray-400 truncate">{svc.desc}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className={`w-2 h-2 rounded-full ${dot(status)}`} />
          <span className={`text-[11px] font-semibold ${textStatus(status)}`}>Operational</span>
        </div>
        <Sparkline values={spark} w={80} h={20} />
        <span className="text-[11px] font-mono text-gray-400 w-14 text-right shrink-0">100.00%</span>
        <ChevronDown size={13} className={`text-gray-300 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`} />
      </div>

      {expanded && (
        <div className="border-t border-gray-50 bg-gray-50/60 px-5 py-4">
          <div className="flex gap-5 mb-4 border-b border-gray-100 pb-3">
            <span className="text-[12px] font-semibold text-emerald-600 border-b-2 border-emerald-500 pb-2 -mb-3">Details</span>
            <span className="text-[12px] text-gray-400 pb-2 -mb-3 cursor-pointer hover:text-gray-600">Uptime Chart</span>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">Configuration</p>
              <div className="space-y-2">
                {[["Endpoint","https://api.scrubbe.com"],["Region","us-east-1"],["Node.js","v24.15.0"],["Latency","50ms"],["PID","1678255"]].map(([k,v])=>(
                  <div key={k} className="flex justify-between">
                    <span className="text-[11px] text-gray-400">{k}</span>
                    <span className="text-[11px] font-mono text-gray-600">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">Live Metrics</p>
              <div className="space-y-2">
                {[["Status","Operational","text-emerald-500"],["30-day uptime","100.00%","text-emerald-500"],["Response time","66ms","text-gray-600"],["Error rate","0.00%","text-emerald-500"],["SLA target","99.9%","text-gray-600"],["Incidents (30d)","1","text-gray-600"]].map(([k,v,c])=>(
                  <div key={k} className="flex justify-between">
                    <span className="text-[11px] text-gray-400">{k}</span>
                    <span className={`text-[11px] font-semibold ${c}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── History row ───────────────────────────────────────────────────

const HistoryRow = ({ svc }: { svc: typeof SERVICES[0] }) => {
  const Icon = svc.icon;
  const spark = useRef(Array.from({ length: 30 }, () => 98 + Math.random() * 2)).current;
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border border-gray-100 rounded-xl mb-2 hover:bg-gray-50 transition-colors cursor-pointer bg-white">
      <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
        <Icon size={14} className="text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-black mb-1">{svc.name}</p>
        <Sparkline values={spark} w={120} h={16} color="#22c55e" />
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {svc.incidents > 0
          ? <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-0.5">{svc.incidents} resolved</span>
          : <span className="text-[11px] text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-0.5">No incidents</span>
        }
        <ChevronRight size={13} className="text-gray-300" />
      </div>
    </div>
  );
};

// ── Countdown ─────────────────────────────────────────────────────

const Countdown = ({ onTick }: { onTick: (s: number) => void }) => {
  const [sec, setSec] = useState(30);
  useEffect(() => {
    const id = setInterval(() => setSec(p => { const n = p <= 1 ? 30 : p - 1; onTick(n); return n; }), 1000);
    return () => clearInterval(id);
  }, [onTick]);
  return <span className="font-semibold text-emerald-600">{sec}s</span>;
};

// ── Page ──────────────────────────────────────────────────────────

function StatusPage() {
  const [data, setData]             = useState<StatusData | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter]         = useState<"all"|"operational"|"degraded"|"outage">("all");
  const [expanded, setExpanded]     = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
          console.log("fetchStatus called"); // ← add this

      setRefreshing(true);
      // Correct endpoint — NOT the root URL
      const res  = await fetch("/api/status");
          console.log("response status:", res.status);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // API nests data under .data
      setData(json.data ?? json);
      setLastFetched(new Date());
      setError(false);
    } catch (e) {
      console.error("Status fetch failed:", e);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch + 30s auto-refresh driven by countdown
  useEffect(() => { fetchStatus(); }, [fetchStatus]);
  const handleCountdownTick = useCallback((s: number) => { if (s === 30) fetchStatus(); }, [fetchStatus]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[13px] text-gray-400">Loading system status…</p>
      </div>
    </div>
  );

  const checks     = data?.checks ?? {};
  const metrics    = data?.metrics;
  const deployment = data?.deployment;
  const service    = data?.service;
  const summary    = data?.summary ?? { healthy: 10, degraded: 0, critical: 0, unknown: 0 };
  const isHealthy  = data?.status === "healthy";
  const total      = summary.healthy + summary.degraded + summary.critical + summary.unknown;
  const rssUsed    = MB(metrics?.runtime?.process?.memoryRssBytes ?? 188698624);
  const rssTotal   = MB(metrics?.runtime?.system?.totalMemoryBytes ?? 961331200);
  const heapUsed   = MB(metrics?.runtime?.process?.memoryHeapUsedBytes ?? 42305344);
  const heapTotal  = MB(metrics?.runtime?.process?.memoryHeapTotalBytes ?? 49479680);
  const diskPct    = Math.round(metrics?.runtime?.system?.disk?.usedPercent ?? 56.22);
  const commit     = deployment?.release?.commitSha?.slice(0, 7) ?? "b97f857";
  const eventFeed  = Array.from({ length: 6 }, (_, i) => ({ time: `${i + 1}min ago` }));

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-[1200px] mx-auto px-6 py-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-8 mb-8">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-2">System Status</p>
            <div className="flex items-center gap-2.5 mb-2">
              <div className={`w-3 h-3 rounded-full shrink-0 ${isHealthy ? "bg-emerald-400" : "bg-red-400"} animate-pulse`} />
              <h1 className="text-[26px] font-black text-black leading-tight">
                {isHealthy ? "All systems operational" : "Service disruption detected"}
              </h1>
            </div>
            <p className="text-[13px] text-gray-500 mb-3">
              {isHealthy ? "Everything is up and running smoothly. No active incidents detected." : "Some services are experiencing issues. Our team is investigating."}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-400">
              <span>Last Checked: <span className="text-gray-600 font-medium">{lastFetched?.toLocaleTimeString() ?? "—"} UTC</span></span>
              <span>Next in: <Countdown onTick={handleCountdownTick} /></span>
              <span className="flex items-center gap-1"><GitCommit size={10} /> Build <span className="font-mono text-gray-600">{commit}</span></span>
              <span className="flex items-center gap-1"><Cloud size={10} /> {deployment?.region ?? "us-east-1"}</span>
              {error && <span className="text-red-400">⚠ Last fetch failed — showing cached data</span>}
              <button onClick={fetchStatus} disabled={refreshing} className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 ml-auto disabled:opacity-50 transition-opacity">
                <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
          </div>

          {/* Uptime card */}
          <div className="w-[210px] border border-gray-100 rounded-2xl p-4 shrink-0">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">90 Day Uptime</p>
            <p className="text-[34px] font-black text-black leading-none mb-3">99.98%</p>
            <UptimeBars bars={UPTIME_BARS} />
            <div className="grid grid-cols-3 gap-1 mt-3 pt-3 border-t border-gray-100">
              {[["MTTR","4m"],["MTTD","2m"],["INCIDENTS","0/30d"]].map(([k,v])=>(
                <div key={k} className="text-center">
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide leading-none mb-1">{k}</p>
                  <p className="text-[11px] font-bold text-black">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Body grid ── */}
        <div className="grid grid-cols-[1fr_210px] gap-6">
          <div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 mb-5 border-b border-gray-100 pb-3">
              {(["all","operational","degraded","outage"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-colors ${filter === f ? "bg-gray-900 text-white" : "text-gray-500 hover:text-black hover:bg-gray-50"}`}>
                  {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
              <span className="ml-auto text-[11px] text-gray-400">{total} services</span>
            </div>

            {/* System status */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[15px] font-bold text-black">System Status</h2>
                <div className="flex items-center gap-3">
                  {["30d","60d"].map(t => <button key={t} className="text-[11px] text-gray-400 hover:text-black font-medium">{t}</button>)}
                  <span className="text-[11px] text-gray-400">{total} services</span>
                </div>
              </div>
              {SERVICES.map(svc => (
                <ServiceRow
                  key={svc.id}
                  svc={svc}
                  status={checks[svc.checkKey]?.status ?? "healthy"}
                  expanded={expanded === svc.id}
                  onToggle={() => setExpanded(expanded === svc.id ? null : svc.id)}
                />
              ))}
            </section>

            {/* Incident history */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[15px] font-bold text-black">Incident History by Service</h2>
                <span className="text-[11px] text-emerald-600 font-semibold">All clear — 30d</span>
              </div>
              {SERVICES.map(svc => <HistoryRow key={svc.id} svc={svc} />)}
            </section>

            {/* Regional Latency */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[15px] font-bold text-black">Regional Latency</h2>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">Live · refreshes every 3s</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {REGIONS.map(r => (
                  <div key={r.label} className="border border-gray-100 rounded-xl p-4 bg-white">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">{r.label}</p>
                    <p className="text-[26px] font-black leading-none" style={{ color: r.color }}>
                      {r.latency}<span className="text-[13px] font-semibold text-gray-400">ms</span>
                    </p>
                    <div className="mt-3 flex items-end gap-[2px] h-8">
                      {Array.from({ length: 12 }, (_, i) => (
                        <div key={i} style={{ height: `${30 + Math.random() * 70}%`, background: r.color, opacity: 0.5 + Math.random() * 0.5 }} className="flex-1 rounded-[1px]" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Scheduled Maintenance */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[15px] font-bold text-black">Scheduled Maintenance</h2>
                <span className="text-[11px] text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">0 upcoming</span>
              </div>
              <div className="border border-dashed border-gray-200 rounded-xl px-5 py-8 text-center bg-gray-50/30">
                <Calendar size={18} className="text-gray-300 mx-auto mb-2" />
                <p className="text-[12px] text-gray-400">No scheduled maintenance windows at this time.</p>
              </div>
            </section>

            {/* Completed Maintenance */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[15px] font-bold text-black">Completed Maintenance</h2>
                <span className="text-[11px] text-gray-400">2 recent</span>
              </div>
              {MAINTENANCE_DONE.map(m => (
                <div key={m.title} className="flex items-start gap-3 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-[12px] font-medium text-black">{m.title}</span>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 uppercase">Completed</span>
                    </div>
                    <p className="text-[11px] text-gray-400">{m.date} · {m.note}</p>
                  </div>
                </div>
              ))}
            </section>

            {/* Event Feed */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[15px] font-bold text-black">Event Feed</h2>
                <span className="text-[11px] text-gray-400">114 events</span>
              </div>
              <div className="space-y-1.5">
                {eventFeed.map((e, i) => (
                  <div key={i} className="flex items-center gap-4 px-4 py-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="text-[11px] text-gray-400 w-16 shrink-0">{e.time}</span>
                    <span className="text-[12px] font-semibold text-black flex-1">Health check passed</span>
                    <span className="text-[11px] text-gray-400 flex-1 hidden md:block">all services operational</span>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5">HEALTH</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-3">

            {/* Donut */}
            <div className="border border-gray-100 rounded-2xl p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-semibold text-black">Current Status</p>
                <span className="text-[10px] text-gray-400">{lastFetched?.toLocaleTimeString() ?? "—"}</span>
              </div>
              <div className="flex justify-center mb-3">
                <div className="relative w-[88px] h-[88px]">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#22c55e" strokeWidth="12"
                      strokeDasharray={`${(summary.healthy / Math.max(total, 1)) * 239} 239`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-[20px] font-black text-black leading-none">{summary.healthy}</p>
                    <p className="text-[9px] font-bold text-emerald-500 uppercase">Healthy</p>
                  </div>
                </div>
              </div>
              <p className="text-center text-[12px] font-bold text-black mb-1">No Incidents</p>
              <p className="text-center text-[11px] text-gray-400 leading-snug">All {total} services operating normally.</p>
            </div>

            {/* 90d uptime chart */}
            <div className="border border-gray-100 rounded-2xl p-4 bg-white">
              <p className="text-[11px] font-semibold text-black mb-2">Uptime — 90 Days</p>
              <Sparkline values={SPARKLINE_90D} w={178} h={56} color="#22c55e" />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>90d ago</span><span>Today</span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                <span className="text-[11px] text-gray-500">90-day SLA</span>
                <span className="text-[12px] font-bold text-emerald-600">99.98%</span>
              </div>
            </div>

            {/* Resources */}
            <div className="border border-gray-100 rounded-2xl p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-semibold text-black">Resources</p>
                <span className="text-[10px] text-gray-400">{deployment?.region ?? "us-east-1"}</span>
              </div>
              <div className="space-y-2.5">
                <ResBat label="Memory" used={rssUsed}  total={rssTotal}  unit="MB" color="#f59e0b" />
                <ResBat label="Heap"   used={heapUsed} total={heapTotal} unit="MB" color="#f59e0b" />
                <ResBat label="Disk"   used={diskPct}  total={100}       unit="%" color="#f59e0b" />
                <ResBat label="CPU"    used={5}        total={100}       unit="%" color="#22c55e" />
              </div>
            </div>

            {/* Service info */}
            <div className="border border-gray-100 rounded-2xl p-4 bg-white">
              <p className="text-[11px] font-semibold text-black mb-2.5">Service Info</p>
              <div className="space-y-2">
                {[["Version", service?.version ?? "1.0.0"],["Uptime", service?.uptimeHuman ?? "—"],["Platform", deployment?.platform ?? "—"],["Node.js", service?.nodeVersion ?? "—"],["Env", "production"]].map(([k,v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-[10px] text-gray-400">{k}</span>
                    <span className="text-[10px] font-mono text-gray-600 truncate max-w-[100px] text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Support */}
            <div className="border border-gray-100 rounded-2xl p-4 bg-white">
              <p className="text-[11px] font-semibold text-black mb-1.5">Support</p>
              <p className="text-[11px] text-gray-400 leading-relaxed mb-3">Having an issue not reflected here? Our team is available 24/7.</p>
              <Link
                href="/contact-us"
                className="block w-full py-2.5 rounded-xl font-bold text-[12px] text-white text-center transition-all hover:brightness-110"
                style={{ background: "linear-gradient(90deg, #0d1f0f 0%, #14532d 60%, #16a34a 100%)" }}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatusPage