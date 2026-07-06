// app/incidents/library/components/LibraryModals.tsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  X,
  Play,
  Pause,
  ArrowRight,
  Check,
  ShieldCheck,
  Download,
  Copy,
  BookOpen,
} from "lucide-react";
import {
  IncidentHistoryRecord,
  IncidentListItem,
} from "@/lib/incident/incident.types";
import Modal from "@/components/ui/Modal";
import { priText } from "./IncidentLibrary";
import { useQuery } from "@tanstack/react-query";
import { querykeys } from "@/lib/constant";
import { fetchIncidentHistory } from "@/lib/incident/incident.api";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

export function TrendsModal({
  isOpen,
  allData,
  onClose,
}: {
  isOpen: boolean;
  allData: IncidentListItem[];
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const rootCauses = useMemo(() => {
    const counts: Record<string, number> = {};
    allData.forEach((i) => {
      const key = i.reason || "Unknown";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [allData]);

  const services = useMemo(() => {
    const counts: Record<string, number> = {};
    allData.forEach((i) => {
      const key = i.service || "Unknown";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [allData]);

  const signals = useMemo(() => {
    const counts: Record<string, number> = {};
    allData.forEach((i) => {
      const key = i.source || "Unknown";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [allData]);

  const volumeByMonth = useMemo(() => {
    const months = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    const counts: Record<number, number> = {};
    allData.forEach((i) => {
      const month = new Date(i.createdAt).getMonth();
      counts[month] = (counts[month] || 0) + 1;
    });
    // Show last 6 months with data, or fallback to first 6 months
    const entries = Object.entries(counts).map(([m, c]) => ({
      month: months[Number(m)],
      count: c,
    }));
    if (entries.length === 0) {
      return months.slice(0, 6).map((m) => ({ month: m, count: 0 }));
    }
    return entries.slice(-6);
  }, [allData]);

  const majorIncidents = allData.filter(
    (i) => i.priority === "P0" || i.priority === "P1",
  ).length;

  const BarRows = ({
    data,
    color,
  }: {
    data: [string, number][];
    color: string;
  }) => {
    const max = Math.max(...data.map((d) => d[1]), 1);
    return (
      <div className="space-y-3 mt-3">
        {data.map(([label, count]) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-32 text-sm text-zinc-700 truncate shrink-0">
              {label}
            </span>
            <div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(count / max) * 100}%`,
                  backgroundColor: color,
                }}
              />
            </div>
            <span className="text-sm text-zinc-500 font-medium w-6 text-right shrink-0">
              {count}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="!max-w-4xl">
      <div className="w-full bg-white dark:bg-zinc-950 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Trends
            </h3>
            <p className="text-sm text-zinc-400 mt-0.5">
              Patterns across the historical register
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 transition-colors mt-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2x2 grid */}
        <div className="px-6 pb-6 grid grid-cols-2 gap-4">
          {/* Most common root causes */}
          <div className="border border-zinc-100 rounded-xl p-5">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400">
              Most common root causes
            </p>
            <BarRows data={rootCauses} color="#5B5BD6" />
          </div>

          {/* Recurring services */}
          <div className="border border-zinc-100 rounded-xl p-5">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400">
              Recurring services
            </p>
            <BarRows data={services} color="#F97316" />
          </div>

          {/* Most frequent signals */}
          <div className="border border-zinc-100 rounded-xl p-5">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400">
              Most frequent signals
            </p>
            <BarRows data={signals} color="#3B82F6" />
          </div>

          {/* Incident volume */}
          <div className="border border-zinc-100 rounded-xl p-5 flex flex-col">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400 mb-3">
              Incident volume
            </p>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={volumeByMonth} barSize={18}>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: "#a1a1aa" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#a1a1aa" }}
                    axisLine={false}
                    tickLine={false}
                    width={24}
                  />
                  <Bar dataKey="count" fill="#F97316" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 mt-2">
              <span className="text-sm text-zinc-500">Major incidents</span>
              <span className="text-lg font-bold text-zinc-900">
                {majorIncidents}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

interface ReplayModalProps {
  isOpen: boolean;
  incident: IncidentListItem | null;
  onClose: () => void;
  onOpenPlaybook: (incident: IncidentListItem) => void;
}

const stepColor = (action: string, index: number) => {
  if (action === "status_changed") {
    const colors = [
      "bg-red-500",
      "bg-amber-400",
      "bg-blue-500",
      "bg-emerald-500",
    ];
    return colors[index % colors.length];
  }
  return "bg-zinc-400";
};

const formatStepLabel = (item: IncidentHistoryRecord) => {
  if (item.action === "status_changed") {
    const map: Record<string, string> = {
      OPEN: "Incident opened",
      INVESTIGATION: "Signals correlated",
      INVESTIGATING: "Investigating",
      DIAGNOSED: "Root cause diagnosed",
      REMEDIATING: "Remediation deployed",
      MONITORING: "Monitoring recovery",
      RESOLVED: "Resolved",
      CLOSED: "Closed",
    };
    return map[item.newValue?.toUpperCase()] ?? item.newValue;
  }
  if (item.comment === "attachments") return "Attachment added";
  if (item.comment === "context") return "Context saved";
  return item.action.replace(/_/g, " ");
};

const formatStepDetail = (
  item: IncidentHistoryRecord,
  incident: IncidentListItem | null,
) => {
  if (item.comment === "status") {
    const map: Record<string, string> = {
      OPEN: "Auto-detected by signal correlation",
      INVESTIGATION: `${incident?.source ?? "Signals detected"}`,
      INVESTIGATING: `${incident?.incidentCommander ?? item.actor} assigned as IC`,
      DIAGNOSED: incident?.reason ?? "Root cause identified",
      REMEDIATING: "Rollback / fix shipped",
      MONITORING: "Metrics returning to baseline",
      RESOLVED: `MTTR ${incident?.MTTR}m`,
      CLOSED: "Incident closed",
    };
    return map[item.newValue?.toUpperCase()] ?? item.newValue;
  }
  if (item.comment === "attachments") return item.newValue;
  if (item.comment === "context") return "Incident context updated";
  return item.newValue;
};

const ezraReasoning = (
  item: IncidentHistoryRecord,
  incident: IncidentListItem | null,
) => {
  const val = item.newValue?.toUpperCase();
  if (val === "OPEN")
    return "Anomaly thresholds breached. Initiating signal correlation sweep.";
  if (val === "INVESTIGATION")
    return `Correlating signals across services to isolate the blast radius.`;
  if (val === "INVESTIGATING")
    return `Assigning incident commander. Scoping impact on ${incident?.service ?? "service"}.`;
  if (val === "DIAGNOSED")
    return `Root cause confirmed: ${incident?.reason ?? "under analysis"}. Preparing remediation steps.`;
  if (val === "REMEDIATING")
    return "Remediation playbook executing. Monitoring rollback success rate.";
  if (val === "MONITORING")
    return "Signal levels normalising. Watching for regression indicators.";
  if (val === "RESOLVED")
    return `Incident resolved. MTTR ${incident?.MTTR}m. Post-mortem recommended.`;
  if (item.comment === "attachments")
    return "Evidence artifact attached to incident record.";
  if (item.comment === "context")
    return "Operator context ingested. Updating reasoning graph.";
  return "Processing state transition. Updating incident timeline.";
};

const liveStatus = (item: IncidentHistoryRecord) => {
  if (item.comment !== "status") return null;
  const map: Record<string, string> = {
    OPEN: "Open",
    INVESTIGATION: "Investigating",
    INVESTIGATING: "Investigating",
    DIAGNOSED: "Diagnosed",
    REMEDIATING: "Remediating",
    MONITORING: "Monitoring",
    RESOLVED: "Resolved",
    CLOSED: "Closed",
  };
  return map[item.newValue?.toUpperCase()] ?? item.newValue;
};

export function ReplayModal({
  isOpen,
  incident,
  onClose,
  onOpenPlaybook,
}: ReplayModalProps) {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  const { data: historyData, isLoading } = useQuery({
    queryKey: [querykeys.HISTORY, incident?.id],
    queryFn: async () =>
      incident?.id ? fetchIncidentHistory(incident.id) : [],
    enabled: Boolean(incident?.id) && isOpen,
    refetchOnWindowFocus: false,
  });

  // Sort ascending by timestamp
  const history: IncidentHistoryRecord[] = useMemo(() => {
    const raw = historyData ?? [];
    return [...raw].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  }, [historyData]);

  // Reset step when history changes
  useEffect(() => {
    setStep(0);
    setIsPlaying(false);
  }, [history]);

  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying) return;
    if (step >= history.length - 1) {
      setIsPlaying(false);
      return;
    }
    const interval = setInterval(() => {
      setStep((s) => {
        if (s >= history.length - 1) {
          setIsPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 1800 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, speed, history.length, step]);

  // Scroll active step into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-step="${step}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [step]);

  if (!isOpen || !incident) return null;

  const currentItem = history[step];
  const firstTime = history[0]
    ? new Date(history[0].timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  const midTime = history[Math.floor(history.length / 2)]
    ? new Date(
        history[Math.floor(history.length / 2)].timestamp,
      ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";
  const lastTime = history[history.length - 1]
    ? new Date(history[history.length - 1].timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="!max-w-4xl">
      <div className="w-full bg-white dark:bg-zinc-950 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex justify-between items-start border-b border-zinc-200">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Replay · {incident.ticketId}
            </h3>
            <p className="text-sm text-zinc-400 mt-0.5">{incident.title}</p>
          </div>
        </div>

        {/* Playback controls */}
        <div className="px-6 py-4 flex items-center gap-4 border-b border-zinc-100">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={isLoading || history.length === 0}
            className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-700 transition-colors shrink-0 disabled:opacity-40"
          >
            {isPlaying ? (
              <Pause size={14} fill="currentColor" />
            ) : (
              <Play size={14} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          <div className="flex-1 flex flex-col gap-3">
            <input
              type="range"
              min={0}
              max={Math.max(history.length - 1, 0)}
              value={step}
              onChange={(e) => {
                setStep(Number(e.target.value));
                setIsPlaying(false);
              }}
              className="w-full accent-zinc-900 h-0.5 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
              <span>{firstTime}</span>
              <span>{midTime}</span>
              <span>{lastTime}</span>
            </div>
          </div>

          <div className="flex gap-0.5 bg-slate-100 p-0.5 rounded-md shrink-0">
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                  speed === s
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-sm text-zinc-400">
            Loading history...
          </div>
        ) : history.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-sm text-zinc-400">
            No history available for this incident.
          </div>
        ) : (
          <div className="grid grid-cols-2 divide-x divide-zinc-100 max-h-[480px]">
            {/* Left — timeline */}
            <div ref={listRef} className="overflow-y-auto p-6 ">
              {history.map((item, idx) => {
                const active = idx === step;
                const past = idx < step;
                return (
                  <div
                    key={item.id}
                    data-step={idx}
                    onClick={() => {
                      setStep(idx);
                      setIsPlaying(false);
                    }}
                    className="flex gap-3 cursor-pointer"
                  >
                    {/* Dot */}
                    <div className="flex flex-col items-center gap-1 pt-0.5">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 transition-all ${
                          active
                            ? `${stepColor(item.action, idx)} ${stepColor(item.action, idx).replace("bg-", "ring-")}`
                            : past
                              ? "bg-zinc-300"
                              : "bg-zinc-200"
                        }`}
                      />
                      {idx < history.length - 1 && (
                        <div
                          className={`w-px flex-1 min-h-[35px] ${past || active ? "bg-zinc-200" : "bg-zinc-100"}`}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div
                      className={`pb-2 transition-opacity ${active ? "opacity-100" : past ? "opacity-50" : "opacity-30"}`}
                    >
                      <p className="text-[11px] text-zinc-400 font-medium mb-0.5">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p
                        className={`text-sm font-semibold ${active ? "text-zinc-900" : "text-zinc-600"}`}
                      >
                        {formatStepLabel(item)}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {formatStepDetail(item, incident)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right — live state panel */}
            <div className="p-6 flex flex-col gap-6">
              {/* Live state */}
              <div>
                <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400 mb-3">
                  Live state at this step
                </p>
                <div className="space-y-0 divide-y divide-zinc-100">
                  {[
                    {
                      label: "Status",
                      value: liveStatus(currentItem) ?? incident.status,
                    },
                    { label: "Step", value: `${step + 1} / ${history.length}` },
                    { label: "War room", value: "—" },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between py-2.5"
                    >
                      <span className="text-sm text-zinc-400">{label}</span>
                      <span className="text-sm font-semibold text-zinc-900">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ezra reasoning */}
              <div>
                <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400 mb-3">
                  Ezra reasoning
                </p>
                <p className="text-sm text-zinc-500 italic leading-relaxed">
                  {currentItem ? ezraReasoning(currentItem, incident) : "—"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── 2. COMPREHENSIVE AUTOMATED SIDE-BY-SIDE SIDE COMPARATOR MODAL ───
export function CompareModal({
  isOpen,
  incidentIds,
  allData,
  onClose,
  onGenerateRca,
}: {
  isOpen: boolean;
  incidentIds: string[];
  allData: IncidentListItem[];
  onClose: () => void;
  onGenerateRca?: (ids: string[]) => void;
}) {
  if (!isOpen || !incidentIds || incidentIds.length < 2) return null;

  const recordA = allData.find((i) => i.id === incidentIds[0]);
  const recordB = allData.find((i) => i.id === incidentIds[1]);

  if (!recordA || !recordB) return null;

  const compareRows: { attr: string; a: string; b: string }[] = [
    { attr: "Title", a: recordA.title, b: recordB.title },
    {
      attr: "Priority",
      a: priText[recordA.priority],
      b: priText[recordB.priority],
    },
    { attr: "Status", a: recordA.status, b: recordB.status },
    { attr: "Service", a: recordA.service, b: recordB.service },
    { attr: "Root cause", a: recordA.reason, b: recordB.reason },
    {
      attr: "Root cause detail",
      a: recordA.description,
      b: recordB.description,
    },
    { attr: "Signals", a: recordA.source, b: recordB.source },
    { attr: "Duration / MTTR", a: `${recordA.MTTR}m`, b: `${recordB.MTTR}m` },
    { attr: "Customer impact", a: recordA.severity, b: recordB.severity },
    {
      attr: "Playbook",
      a: recordA.recommendedActions?.[0] ?? "—",
      b: recordB.recommendedActions?.[0] ?? "—",
    },
  ];

  // Simple similarity score: % of rows where values match
  const matchCount = compareRows.filter(
    (r) => r.a?.toLowerCase() === r.b?.toLowerCase(),
  ).length;
  const similarityPct = Math.round((matchCount / compareRows.length) * 100);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="!max-w-3xl">
      <div className="w-full bg-white dark:bg-zinc-950 overflow-hidden">
        {/* Header */}
        <div className="px-6   pb-4 flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Compare incidents
            </h3>
            <p className="text-sm text-zinc-400 mt-0.5">
              Root cause analysis · side by side
            </p>
          </div>
        </div>

        {/* Similarity bar */}
        <div className="px-6 pb-4 flex items-center gap-3">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400 w-20 shrink-0">
            Similarity
          </span>
          <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${similarityPct}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-indigo-500 w-10 text-right">
            {similarityPct}%
          </span>
        </div>

        {/* Table */}
        <div className="max-h-[55vh] overflow-y-auto border-t border-zinc-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="px-6 py-3 text-[10px] font-semibold tracking-widest uppercase text-zinc-400 w-[180px]">
                  Attribute
                </th>
                <th className="px-6 py-3 text-[10px] font-semibold tracking-widest uppercase text-zinc-400 ">
                  {recordA.ticketId}
                </th>
                <th className="px-6 py-3 text-[10px] font-semibold tracking-widest uppercase text-zinc-400  border-l border-zinc-100">
                  {recordB.ticketId}
                </th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors"
                >
                  <td className="px-6 py-3.5 text-[10px] text-zinc-400 align-top">
                    {row.attr}
                  </td>
                  {row.attr === "Root cause detail" ? (
                    <>
                      <td className="px-6 py-3.5 text-[10px] text-zinc-800 dark:text-zinc-200 align-top leading-relaxed">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: row.a || "—",
                          }}
                        />
                      </td>
                      <td className="px-6 py-3.5 text-[10px] text-zinc-800 dark:text-zinc-200 align-top leading-relaxed border-l border-zinc-100">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: row.b || "—",
                          }}
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-3.5 text-[10px] text-zinc-800 dark:text-zinc-200 align-top leading-relaxed">
                        {row.a || "—"}
                      </td>
                      <td className="px-6 py-3.5 text-[10px] text-zinc-800 dark:text-zinc-200 align-top leading-relaxed border-l border-zinc-100">
                        {row.b || "—"}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end border-t border-zinc-100">
          <button
            onClick={() => { onGenerateRca?.(incidentIds); onClose(); }}
            className="h-9 px-5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
          >
            Generate comparative RCA
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── 3. SYSTEM PERFORMANCE TRENDS PANEL ───

export function DocGenModal({
  isOpen,
  kind,
  incidentIds,
  allData,
  onClose,
}: {
  isOpen: boolean;
  kind?: "rca" | "report" | "exec";
  incidentIds?: string[];
  allData: IncidentListItem[];
  onClose: () => void;
}) {
  if (!isOpen || !incidentIds || !kind) return null;

  const records = allData.filter((i) => incidentIds.includes(i.id));

  const docTitle =
    kind === "rca"
      ? "Root Cause Analysis"
      : kind === "report"
        ? "Incident Performance Review"
        : "Executive Summary";

  const generatedAt = new Date().toLocaleString();

  const docText = (() => {
    const header = [
      `SCRUBBE · ${
        kind === "rca"
          ? "ROOT CAUSE ANALYSIS"
          : kind === "report"
            ? "INCIDENT PERFORMANCE REVIEW"
            : "EXECUTIVE SUMMARY"
      }`,
      `Generated ${generatedAt}`,
      `Incidents: ${records.map((r) => r.ticketId).join(", ")}`,
      ``,
    ].join("\n");

    const body = records
      .map((i) => {
        const divider = `─────────────────────────`;

        if (kind === "exec") {
          return [
            divider,
            ``,
            `${i.ticketId} — ${i.title}`,
            `Priority ${i.priority} · ${i.status} · ${i.service} · ${i.reason}`,
            `Impact: ${i.severity}. MTTR ${Math.floor(i.MTTR / 60)}h ${i.MTTR % 60}m. ${i.summary}`,
          ].join("\n");
        }

        if (kind === "report") {
          return [
            divider,
            ``,
            `${i.ticketId} — ${i.title}`,
            `Priority ${i.priority} · ${i.status} · ${i.service} · ${i.reason}`,
            `Opened ${new Date(i.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${new Date(i.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}  Duration ${i.MTTR}m`,
            `Root cause: ${i.description}`,
            `Commander: ${i.incidentCommander}`,
            `Squad: ${i.owningSquad}`,
          ].join("\n");
        }

        // rca (default)
        return [
          divider,
          ``,
          `${i.ticketId} — ${i.title}`,
          `Priority ${i.priority} · ${i.status} · ${i.service} · ${i.reason}`,
          `Opened ${new Date(i.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${new Date(i.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}  Duration ${i.MTTR}m`,
          `Root cause: ${i.description}`,
          `Signals: ${i.source}`,
          `Playbook: ${i.recommendedActions?.[0] ?? "—"}`,
          `Lessons: ${i.summary}`,
        ].join("\n");
      })
      .join("\n\n");

    return `${header}\n${body}`;
  })();

  const handleCopy = () => {
    navigator.clipboard.writeText(docText);
  };

  const handleDownload = () => {
    const blob = new Blob([docText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${kind}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full bg-white dark:bg-zinc-950 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {docTitle}
            </h3>
            <p className="text-sm text-zinc-400 mt-1">
              Auto-generated by Ezra · {records.length} incident
              {records.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Document body */}
        <div className="mx-6 mb-6 border border-zinc-100 rounded-lg">
          <pre className="p-6 font-mono text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-[50vh] overflow-y-auto">
            {docText}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex justify-end gap-2">
          <button
            onClick={handleCopy}
            className="h-9 px-5 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 transition-colors"
          >
            Copy
          </button>
          <button
            onClick={handleDownload}
            className="h-9 px-5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
          >
            Download
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── 5. REMEDIATION PLAYBOOK SIMULATOR ───
export function PlaybookModal({
  isOpen,
  incident,
  onClose,
}: {
  isOpen: boolean;
  incident: IncidentListItem | null;
  onClose: () => void;
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const playbookSteps = [
    "Isolate bad container replica instances",
    "Freeze secondary upstream deployment pipelines",
    "Execute hotfix rollbacks to previous validated tag",
    "Flush endpoint telemetry caches across clusters",
    "Verify endpoint baseline metrics return to specification bounds",
  ];

  useEffect(() => {
    let timer: any;
    if (isRunning && currentStep < playbookSteps.length) {
      timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 800);
    } else if (currentStep === playbookSteps.length) {
      setIsRunning(false);
    }
    return () => clearTimeout(timer);
  }, [isRunning, currentStep]);

  if (!isOpen || !incident) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-xl p-5 space-y-4 shadow-2xl">
        <div className="border-b pb-3 flex justify-between items-center">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen size={14} className="text-indigo-600" /> Active Runbook
            Automation
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-600"
          >
            <X size={15} />
          </button>
        </div>

        <div className="bg-zinc-50 border p-3 rounded-lg font-mono text-[11px] text-zinc-500">
          Remediation Sequence Target:{" "}
          <span className="font-bold text-zinc-900">
            {incident.recommendedActions[0] || "Standard Triage Code Rollback"}
          </span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {playbookSteps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep && isRunning;
            return (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-3 transition-all ${
                  isCompleted
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : isActive
                      ? "border-indigo-300 bg-indigo-50/50 text-indigo-900 animate-pulse"
                      : "border-zinc-100 text-zinc-400 bg-white"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full border text-[10px] font-mono font-bold flex items-center justify-center ${isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-zinc-200 text-zinc-400"}`}
                >
                  {isCompleted ? "✓" : idx + 1}
                </div>
                <div className="flex-1 truncate">{step}</div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100">
          <button
            onClick={onClose}
            className="h-8.5 px-3 rounded-lg border text-xs font-medium text-zinc-600 bg-white"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setIsRunning(true);
              setCurrentStep(0);
            }}
            disabled={isRunning || currentStep === playbookSteps.length}
            className={`h-8.5 px-4 rounded-lg text-white text-xs font-bold transition-all shadow-sm ${currentStep === playbookSteps.length ? "bg-emerald-500 hover:bg-emerald-600" : "bg-indigo-600 hover:bg-indigo-700"}`}
          >
            {currentStep === playbookSteps.length
              ? "Execution Complete ✓"
              : isRunning
                ? "Running Automation..."
                : "Trigger Playbook Sequence"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
