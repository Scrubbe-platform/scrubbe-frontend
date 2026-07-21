"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ReferenceLine,
  BarChart, Bar, Cell,
} from "recharts";
import { ALERTS as ALERTS_SEED, Alert, EVIDENCE, NOW, SRC_OPTS, SourceKey, WRLOG, secToHMS, t } from "./evidenceExplorer.data";
import { COLORS } from "./colors";
import { displayFont, monoFont } from "./fonts";

const axisTick = { fontSize: 10, fill: COLORS.ink3, fontFamily: "monospace" };

// ── KPI tiles ───────────────────────────────────────────────────────
function poolUsed(pgConn: number) {
  return Math.min(200, 150 + Math.round(pgConn / 12));
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return <svg className="absolute right-2.5 bottom-2.5 w-[72px] h-6" />;
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1;
  const path = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 72;
      const y = 24 - ((v - mn) / rng) * 24;
      return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg className="absolute right-2.5 bottom-2.5 w-[72px] h-6 opacity-85" viewBox="0 0 72 24" preserveAspectRatio="none">
      <path d={path} fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
  );
}

const KSPARK_KEYS = ["err", "lat", "pool", "usr", "sig"] as const;

const EvidenceOverview: React.FC<{
  live: Record<string, number>;
  tick: number;
  onOpenRemediation: () => void;
  onScopeSource: (key: SourceKey) => void;
  onScopeMinute: (min: number | null) => void;
  windowMinutes: number;
}> = ({ live, tick, onOpenRemediation, onScopeSource, onScopeMinute, windowMinutes }) => {
  const [kspark, setKspark] = useState<Record<string, number[]>>({ err: [], lat: [], pool: [], usr: [], sig: [] });

  useEffect(() => {
    const pool = poolUsed(live.pgConn);
    setKspark((prev) => {
      const next = { ...prev };
      const map: Record<string, number> = { err: live.errRate, lat: live.latency, pool, usr: live.affected, sig: live.signals };
      KSPARK_KEYS.forEach((k) => {
        const arr = [...next[k], map[k]];
        if (arr.length > 24) arr.shift();
        next[k] = arr;
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const pool = poolUsed(live.pgConn);
  const kpis = [
    { k: "Error rate", sv: live.errRate.toLocaleString("en-US"), unit: "/min", sd: "▲ 54× over baseline", sp: "err", col: COLORS.crit, thr: COLORS.crit },
    { k: "DB latency", sv: String(live.latency), unit: "ms", sd: "▲ from 18ms baseline", sp: "lat", col: COLORS.warn, thr: COLORS.warn },
    { k: "Pool usage", sv: `${pool}/200`, unit: "", sd: "pgbouncer clients", sp: "pool", col: COLORS.warn, thr: COLORS.warn },
    { k: "Users impacted", sv: live.affected.toLocaleString("en-US"), unit: "", sd: "checkout + portal", sp: "usr", col: COLORS.crit, thr: COLORS.crit },
    { k: "Signals", sv: (live.signals / 1e6).toFixed(2) + "M", unit: "", sd: "processed this incident", sp: "sig", col: COLORS.live, thr: COLORS.live },
  ];

  // ── Signal-rate time series (seeded once, ticks forward) ──────────
  const seriesRef = useRef<{ time: string; errors: number; latency: number; signal: number }[]>([]);
  const deployIdxRef = useRef(23);
  const [seriesVersion, setSeriesVersion] = useState(0);
  if (seriesRef.current.length === 0) {
    const N = 80;
    const rnd = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
    for (let i = 0; i < N; i++) {
      const after = i >= deployIdxRef.current;
      const ramp = after ? Math.min(1, (i - deployIdxRef.current) / 10) : 0;
      seriesRef.current.push({
        time: `${-Math.round((N - 1 - i) * (15 / (N - 1)))}m`,
        errors: Math.max(0, Math.round((after ? 60 + ramp * 1780 : 30) + rnd(-40, 40))),
        latency: Math.max(0, Math.round((after ? 40 + ramp * 690 : 18) + rnd(-15, 15))),
        signal: Math.max(0, Math.round(9000 + (after ? ramp * 22000 : 0) + i * 60 + rnd(-800, 800))),
      });
    }
  }
  useEffect(() => {
    const rnd = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
    seriesRef.current = [
      ...seriesRef.current.slice(1),
      {
        time: "now",
        errors: Math.max(0, live.errRate + rnd(-40, 40)),
        latency: Math.max(0, live.latency + rnd(-25, 25)),
        signal: Math.max(0, 9000 + rnd(8000, 30000)),
      },
    ];
    deployIdxRef.current -= 1;
    setSeriesVersion((v) => v + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  // ── Histogram ───────────────────────────────────────────────────
  const [histMode, setHistMode] = useState<"minute" | "source">("minute");
  const [histSel, setHistSel] = useState<string | null>(null);
  const sevRank = (e: (typeof EVIDENCE)[number]) => (e.sev === "crit" ? 3 : e.sev === "warn" ? 2 : 1);
  const sevColor = (r: number) => (r === 3 ? COLORS.crit : r === 2 ? COLORS.warn : COLORS.accent);
  const histBuckets = useMemo(() => {
    if (histMode === "source") {
      return SRC_OPTS.slice(1).map(([lab, key]) => {
        const items = EVIDENCE.filter((e) => e.source === key);
        return { id: key, label: lab.split(" ")[0], count: items.length, sev: items.reduce((m, e) => Math.max(m, sevRank(e)), 1) };
      });
    }
    const winMin = Math.min(windowMinutes, 60);
    const nowMin = Math.floor(NOW / 60), startMin = nowMin - winMin;
    const map: Record<number, typeof EVIDENCE> = {};
    EVIDENCE.forEach((e) => {
      const m = Math.floor(t(e.ts) / 60);
      if (m >= startMin && m <= nowMin) (map[m] = map[m] || []).push(e);
    });
    const out: { id: number; label: string; count: number; sev: number }[] = [];
    for (let m = startMin; m <= nowMin; m++) {
      const items = map[m] || [];
      out.push({ id: m, label: secToHMS(m * 60), count: items.length, sev: items.reduce((a, e) => Math.max(a, sevRank(e)), 1) });
    }
    return out;
  }, [histMode, windowMinutes]);

  // ── Alerts ──────────────────────────────────────────────────────
  const [alerts, setAlerts] = useState<Alert[]>(ALERTS_SEED);
  const [alFilter, setAlFilter] = useState<"all" | "firing" | "silenced">("all");
  const visibleAlerts = alerts.filter((a) => (alFilter === "all" ? true : alFilter === "firing" ? a.state === "firing" : a.state === "silenced"));
  const setAlertState = (id: string, state: Alert["state"]) => setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, state } : a)));

  // ── War room ────────────────────────────────────────────────────
  const [wrLog, setWrLog] = useState(WRLOG);
  const pageStartRef = useRef(Date.now());
  const [elapsed, setElapsed] = useState(14 * 60 + 22);
  useEffect(() => {
    const id = setInterval(() => setElapsed(14 * 60 + 22 + Math.floor((Date.now() - pageStartRef.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  const logAct = (cls: "" | "act" | "appr", who: string, html: string) => {
    setWrLog((prev) => [...prev, { t: secToHMS(NOW + Math.floor((Date.now() - pageStartRef.current) / 1000)), cls: cls || "act", who, html }]);
    toast.success("Action recorded", { description: who });
  };
  const wrActions = [
    {
      icon: <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />,
      t: "Declare major incident", s: "Escalate to company-wide major",
      run: () => logAct("act", "A. Mensah (IC)", "Declared <b>major incident</b> · execs notified"),
    },
    {
      icon: <><path d="M15.6 3.2A2 2 0 0 0 12 4.5 2 2 0 0 0 8.4 3.2 2.5 2.5 0 0 0 5 6.7c0 4.6 7 9.3 7 9.3s7-4.7 7-9.3a2.5 2.5 0 0 0-3.4-3.5z" /><path d="M3 21h6" /></>,
      t: "Page on-call", s: "Notify secondary responder",
      run: () => logAct("", "PagerDuty", "Paged <b>secondary on-call</b> · ack pending"),
    },
    {
      icon: <path d="M4 4h16v12H5.2L4 17.2z" />,
      t: "Post status update", s: "Publish to statuspage",
      run: () => logAct("", "Comms", "Posted <b>status update</b> · investigating payments degradation"),
    },
    {
      icon: <path d="M9 11l3 3 8-8M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />,
      t: "Review remediation", s: "Open the rollback plan",
      run: onOpenRemediation,
    },
    {
      icon: <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.4 2.6L3 8M3 4v4h4" />,
      t: "Start rollback", s: "payments-api v4.3.8 → v4.3.7",
      run: onOpenRemediation, danger: true,
    },
  ];

  return (
    <div className="flex flex-col gap-3.5">
      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {kpis.map((k) => (
          <div key={k.k} className="relative rounded-[10px] border border-[#DDDDDD] bg-white px-[13px] pt-[11px] pb-2.5 min-h-[78px] overflow-hidden">
            <span className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: k.thr }} />
            <div className="text-[10px] tracking-wide uppercase text-[#8A8A93]">{k.k}</div>
            <div className={`${monoFont.className} text-[25px] font-semibold tracking-tight leading-none mt-1`} style={{ color: k.col }}>
              {k.sv}
              {k.unit && <span className="text-[13px] text-[#8A8A93] font-medium ml-0.5">{k.unit}</span>}
            </div>
            <div className={`${monoFont.className} text-[11px] mt-1.5 text-[#8A8A93]`}>{k.sd}</div>
            <Sparkline data={kspark[k.sp] ?? []} color={k.col} />
          </div>
        ))}
      </div>

      {/* Signal rate */}
      <div className="rounded-[10px] border border-[#DDDDDD] bg-white overflow-hidden">
        <div className="flex items-center gap-2 px-[13px] py-2.5 border-b border-[#F0EFEA]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} className="w-3.5 h-3.5 opacity-60">
            <path d="M3 17l5-6 4 3 5-8 4 5" />
          </svg>
          <span className={`${displayFont.className} font-semibold text-[12.5px]`}>Signal rate</span>
          <span className="text-[11px] text-[#8A8A93]">events / minute across sources</span>
        </div>
        <div className="p-[13px]">
          <ResponsiveContainer width="100%" height={230}>
            <ComposedChart data={seriesRef.current} key={seriesVersion}>
              <XAxis dataKey="time" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 9, border: `1px solid ${COLORS.line}` }} />
              <ReferenceLine x={seriesRef.current[Math.max(0, deployIdxRef.current)]?.time} stroke={COLORS.accent} strokeDasharray="4 3" label={{ value: "Deploy v4.3.8", position: "insideTopLeft", fill: COLORS.accentPress, fontSize: 10.5 }} />
              <Area type="monotone" dataKey="errors" name="Errors / min" stroke={COLORS.crit} fill={COLORS.crit} fillOpacity={0.08} strokeWidth={1.9} />
              <Line type="monotone" dataKey="latency" name="DB latency (ms)" stroke={COLORS.warn} strokeWidth={1.9} dot={false} />
              <Line type="monotone" dataKey="signal" name="Signal rate" stroke={COLORS.accent} strokeWidth={1.9} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-3.5">
        {/* Volume histogram */}
        <div className="rounded-[10px] border border-[#DDDDDD] bg-white overflow-hidden">
          <div className="flex items-center gap-2 px-[13px] py-2.5 border-b border-[#F0EFEA]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} className="w-3.5 h-3.5 opacity-60">
              <path d="M4 20V10M9 20V4M14 20v-7M19 20v-12" />
            </svg>
            <span className={`${displayFont.className} font-semibold text-[12.5px]`}>Signal volume</span>
            <div className="ml-auto inline-flex border border-[#E7E6E0] rounded-[7px] overflow-hidden">
              {(["minute", "source"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setHistMode(m); setHistSel(null); }}
                  className={`text-[11.5px] font-medium px-2.5 py-[5px] border-r last:border-r-0 border-[#F0EFEA] ${
                    histMode === m ? "bg-[#EEF0FF] text-[#1B30C4]" : "text-[#52525B] hover:bg-[#F6F6F3]"
                  }`}
                >
                  {m === "minute" ? "By minute" : "By source"}
                </button>
              ))}
            </div>
          </div>
          <div className="p-[13px]">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={histBuckets}>
                <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} interval={histMode === "source" ? 0 : "preserveStartEnd"} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 9, border: `1px solid ${COLORS.line}` }} />
                <Bar
                  dataKey="count"
                  radius={[3, 3, 0, 0]}
                  onClick={(d: any) => {
                    const id = d?.payload?.id ?? d?.id;
                    if (histMode === "source") {
                      setHistSel(id);
                      onScopeSource(id);
                      toast.info("Scoped to source", { description: id });
                    } else if (String(histSel) === String(id)) {
                      setHistSel(null);
                      onScopeMinute(null);
                      toast.info("Scope cleared", { description: "Showing the full time range" });
                    } else {
                      setHistSel(id);
                      onScopeMinute(Number(id));
                      toast.info("Scoped to minute", { description: secToHMS(Number(id) * 60) });
                    }
                  }}
                  className="cursor-pointer"
                >
                  {histBuckets.map((b, i) => (
                    <Cell key={i} fill={sevColor(b.sev)} opacity={b.count ? (String(histSel) === String(b.id) ? 1 : 0.82) : 0.12} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts */}
        <div className="rounded-[10px] border border-[#DDDDDD] bg-white overflow-hidden">
          <div className="flex items-center gap-2 px-[13px] py-2.5 border-b border-[#F0EFEA]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5 opacity-60">
              <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            </svg>
            <span className={`${displayFont.className} font-semibold text-[12.5px]`}>Alerts</span>
            <div className="ml-auto inline-flex border border-[#E7E6E0] rounded-[7px] overflow-hidden">
              {(["all", "firing", "silenced"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setAlFilter(f)}
                  className={`text-[11.5px] font-medium px-2.5 py-[5px] border-r last:border-r-0 border-[#F0EFEA] capitalize ${
                    alFilter === f ? "bg-[#EEF0FF] text-[#1B30C4]" : "text-[#52525B] hover:bg-[#F6F6F3]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="p-[13px] flex flex-col gap-2 max-h-[280px] overflow-y-auto">
            {visibleAlerts.length === 0 ? (
              <div className="py-4 text-center text-[12.5px] text-[#8A8A93]">No alerts in this view.</div>
            ) : (
              visibleAlerts.map((a) => (
                <div key={a.id} className={`rounded-[9px] border border-[#E7E6E0] bg-white px-[11px] py-2.5 flex gap-2.5 items-start transition-opacity ${a.state !== "firing" ? "opacity-60" : ""}`}>
                  <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${a.sev === "crit" ? "bg-[#E5484D]" : "bg-[#E0890B]"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[12.5px] text-[#15151A]">{a.name}</span>
                      <span
                        className={`ml-auto text-[9px] font-bold uppercase tracking-wide px-[7px] py-0.5 rounded-[5px] shrink-0 ${
                          a.state === "firing" ? "bg-[#FDECEC] text-[#B42A30]" : a.state === "acked" ? "bg-[#FBF1DF] text-[#9a6206]" : "bg-[#F1F0EB] text-[#52525B]"
                        }`}
                      >
                        {a.state === "firing" ? "Firing" : a.state === "acked" ? "Acknowledged" : "Silenced"}
                      </span>
                    </div>
                    <div className={`${monoFont.className} text-[11px] text-[#8A8A93] mt-0.5`}>{a.meta}</div>
                    <div className="flex gap-1.5 mt-2">
                      {a.state === "firing" && (
                        <>
                          <button onClick={() => { setAlertState(a.id, "acked"); toast.success("Alert acknowledged", { description: a.name }); }} className="mini-btn h-[26px] px-2.5 rounded-[6px] border border-[#E7E6E0] bg-white text-[11.5px] font-medium hover:bg-[#F6F6F3]">Acknowledge</button>
                          <button onClick={() => { setAlertState(a.id, "silenced"); toast.info("Alert silenced", { description: a.name }); }} className="h-[26px] px-2.5 rounded-[6px] border border-[#E7E6E0] bg-white text-[11.5px] font-medium hover:bg-[#F6F6F3]">Silence</button>
                        </>
                      )}
                      {a.state === "acked" && (
                        <>
                          <button onClick={() => { setAlertState(a.id, "silenced"); toast.info("Alert silenced", { description: a.name }); }} className="h-[26px] px-2.5 rounded-[6px] border border-[#E7E6E0] bg-white text-[11.5px] font-medium hover:bg-[#F6F6F3]">Silence</button>
                          <button onClick={() => { setAlertState(a.id, "firing"); toast.info("Alert active", { description: a.name }); }} className="h-[26px] px-2.5 rounded-[6px] border border-[#E7E6E0] bg-white text-[11.5px] font-medium hover:bg-[#F6F6F3]">Reset</button>
                        </>
                      )}
                      {a.state === "silenced" && (
                        <button onClick={() => { setAlertState(a.id, "firing"); toast.info("Alert active", { description: a.name }); }} className="h-[26px] px-2.5 rounded-[6px] border border-[#E7E6E0] bg-white text-[11.5px] font-medium hover:bg-[#F6F6F3]">Activate</button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* War room */}
      <div className="rounded-[10px] border border-[#DDDDDD] bg-white overflow-hidden">
        <div className="flex items-center gap-2 px-[13px] py-2.5 border-b border-[#F0EFEA]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} className="w-3.5 h-3.5 opacity-60">
            <path d="M3 12h4l2-7 4 14 2-5h6" />
          </svg>
          <span className={`${displayFont.className} font-semibold text-[12.5px]`}>War room</span>
          <span className="text-[11px] text-[#8A8A93]">coordinated response · SI-7A42K91</span>
        </div>
        <div className="p-[13px]">
          <div className="flex items-center gap-2 px-[11px] py-2 rounded-[8px] border border-[#DCE0FF] bg-[#EEF0FF] mb-3 text-[12px]">
            <span className="relative w-[7px] h-[7px] rounded-full bg-[#E5484D]">
              <span className="absolute inset-[-4px] rounded-full border-[1.5px] border-[#E5484D] opacity-50 animate-ping" />
            </span>
            <b>War room live</b>
            <span className="text-[#8A8A93]">· 4 responders + 3 agents</span>
            <span className={`${monoFont.className} ml-auto text-[#52525B]`}>
              elapsed {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col max-h-[288px] overflow-y-auto pr-1">
              {wrLog.map((e, i) => (
                <div key={i} className="grid grid-cols-[46px_1fr] gap-2.5 py-2 border-b last:border-0 border-[#F0EFEA] text-[12px]">
                  <span className={`${monoFont.className} text-[10.5px] text-[#8A8A93] pt-0.5`}>{e.t}</span>
                  <div>
                    <div
                      className={e.cls === "gate" ? "[&_b]:text-[#1B30C4]" : e.cls === "appr" ? "[&_b]:text-[#0a7a5e]" : e.cls === "act" ? "[&_b]:text-[#B42A30]" : ""}
                      dangerouslySetInnerHTML={{ __html: e.html }}
                    />
                    <div className="text-[10.5px] text-[#8A8A93] mt-0.5">{e.who}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-[7px]">
              {wrActions.map((a, i) => (
                <button
                  key={i}
                  onClick={a.run}
                  className={`flex items-center gap-2.5 w-full text-left border rounded-[8px] px-[11px] py-2.5 text-[12.5px] font-medium transition-colors ${
                    a.danger
                      ? "border-[#E7E6E0] bg-white hover:border-[#E5484D] hover:bg-[#FDECEC] hover:text-[#B42A30]"
                      : "border-[#E7E6E0] bg-white hover:border-[#2540F2] hover:bg-[#EEF0FF] hover:text-[#1B30C4]"
                  }`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 opacity-70 shrink-0">
                    {a.icon}
                  </svg>
                  <span className="flex-1">
                    {a.t}
                    <small className="block font-normal text-[11px] text-[#8A8A93] mt-0.5">{a.s}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceOverview;
