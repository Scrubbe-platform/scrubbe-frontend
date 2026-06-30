// app/incidents/library/components/LibraryModals.tsx
import React, { useState, useEffect, useMemo } from "react";
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
import { IncidentListItem } from "@/lib/incident/incident.types";
import Modal from "@/components/ui/Modal";

interface ReplayModalProps {
  isOpen: boolean;
  incident: IncidentListItem | null;
  onClose: () => void;
  onOpenPlaybook: (incident: IncidentListItem) => void;
}

export function ReplayModal({
  isOpen,
  incident,
  onClose,
  onOpenPlaybook,
}: ReplayModalProps) {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const timelineSteps = useMemo(() => {
    const base = new Date(incident?.createdAt || "");
    const getOffset = (m: number) =>
      new Date(base.getTime() + m * 60000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    return [
      {
        label: "Anomaly Detected",
        time: getOffset(0),
        d: "Saturated request parameters tripped operational error baselines.",
        color: "bg-red-500",
      },
      {
        label: "Telemetry Vectors Bound",
        time: getOffset(8),
        d: `Automated diagnostic extractors snapshot variables on ${incident?.service}.`,
        color: "bg-amber-500",
      },
      {
        label: "Commander Allocated",
        time: getOffset(15),
        d: `${incident?.incidentCommander} assigned via routing roster gates.`,
        color: "bg-blue-500",
      },
      {
        label: "Remediation Completed",
        time: getOffset(34),
        d: "Mitigation playbook scripts committed. Service metrics returned to normal bounds.",
        color: "bg-emerald-500",
      },
    ];
  }, [incident]);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setStep((s) => (s < timelineSteps.length - 1 ? s + 1 : s));
        setIsPlaying(false);
      }, 1800 / speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed, timelineSteps.length]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Structural layout card blueprint split blocks */}
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl border animate-fadeIn">
        <div className="px-5 h-14 border-b flex justify-between items-center bg-zinc-50/50">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <span className="font-mono text-xs bg-zinc-200 px-1.5 py-0.5 rounded text-zinc-600">
                {incident?.id}
              </span>{" "}
              Replay Analysis Workspace
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Asynchronous baseline audit logging reconstruction framework
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-600"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── SPLIT WORKSPACE BODY GRID ──[cite: 4] */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 h-[340px] overflow-hidden">
          {/* Left Column Section: Progress Timeline Items */}
          <div className="md:col-span-7 space-y-4 overflow-y-auto pr-2 border-r border-zinc-100 pr-4">
            {timelineSteps.map((s, idx) => {
              const active = idx === step;
              return (
                <div
                  key={idx}
                  className={`relative pl-6 border-l-2 transition-all ${active ? "border-indigo-500 opacity-100" : idx < step ? "border-zinc-300 opacity-60" : "border-transparent opacity-20"}`}
                >
                  <div
                    className={`absolute -left-[6px] top-1 h-2.5 w-2.5 rounded-full ${active ? "bg-indigo-500 ring-4 ring-indigo-50" : "bg-zinc-300"}`}
                  />
                  <div className="flex justify-between text-xs font-bold text-zinc-900">
                    <span>{s.label}</span>
                    <span className="font-mono text-[10px] text-zinc-400 font-medium">
                      {s.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-normal mt-0.5">
                    {s.d}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column Section: Intelligence Metrics Panel Data */}
          <div className="md:col-span-5 bg-zinc-50 rounded-xl p-4 flex flex-col justify-between border">
            <div className="space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-indigo-500" /> Active
                Stage Context
              </div>
              <div className="text-xs space-y-2.5 text-zinc-800 font-medium">
                <div>
                  <span className="text-zinc-400 block mb-0.5">
                    Current Execution State:
                  </span>{" "}
                  <span className="text-[13px] font-bold text-zinc-950">
                    {timelineSteps[step]?.label}
                  </span>
                </div>
                <div className="pt-2">
                  <span className="text-zinc-400 block mb-0.5">
                    Ezra Reasoning Metrics:
                  </span>
                  <p className="italic text-zinc-500 leading-relaxed bg-white border p-2 rounded shadow-3xs">
                    "Evaluating historical delta signatures. Correlating
                    connection timeouts on {incident?.service}."
                  </p>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 font-bold block text-right">
              Step {step + 1} of {timelineSteps.length}
            </span>
          </div>
        </div>

        {/* Playback controls foot row toolbar[cite: 4] */}
        <div className="p-4 border-t bg-zinc-50/50 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-9 w-9 bg-zinc-950 text-white rounded-full flex items-center justify-center hover:opacity-90 transition-transform active:scale-95 shadow-sm"
          >
            {isPlaying ? (
              <Pause size={13} fill="currentColor" />
            ) : (
              <Play size={13} fill="currentColor" className="ml-0.5" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max={timelineSteps.length - 1}
            value={step}
            onChange={(e) => {
              setStep(Number(e.target.value));
              setIsPlaying(false);
            }}
            className="flex-1 accent-indigo-600 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer outline-none"
          />
          <div className="flex gap-0.5 bg-zinc-200 p-0.5 rounded-md text-[10px] font-mono font-bold">
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeed(s)}
                className={`px-1.5 py-0.5 rounded ${speed === s ? "bg-white text-zinc-950 font-black shadow-2xs" : "text-zinc-500"}`}
              >
                {s}x
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenPlaybook(incident!);
            }}
            className="h-8.5 px-3 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors whitespace-nowrap"
          >
            Run Runbook
          </button>
        </div>
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
}: {
  isOpen: boolean;
  incidentIds: string[];
  allData: IncidentListItem[];
  onClose: () => void;
}) {
  if (!isOpen || !incidentIds || incidentIds.length < 2) return null;

  const recordA = allData.find((i) => i.id === incidentIds[0]);
  const recordB = allData.find((i) => i.id === incidentIds[1]);

  if (!recordA || !recordB) return null;

  const compareRows = [
    { attr: "Headline Summary", a: recordA.title, b: recordB.title },
    { attr: "Severity Priority", a: recordA.priority, b: recordB.priority },
    { attr: "Affected Microservice", a: recordA.service, b: recordB.service },
    { attr: "Root Cause Diagnosis", a: recordA.reason, b: recordB.reason },
    {
      attr: "Duration MTTR Metrics",
      a: `${recordA.MTTR} mins`,
      b: `${recordB.MTTR} mins`,
    },
    {
      attr: "Incident Commander",
      a: recordA.incidentCommander,
      b: recordB.incidentCommander,
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-950 rounded-xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-zinc-900">
              Side-by-Side Root Cause Comparison
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Automated delta matrix highlighting divergent metrics across
              instances
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-600"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3 pl-6">Attribute Meta</th>
                <th className="p-3 font-mono font-bold text-indigo-600 bg-indigo-50/20">
                  {recordA.id}
                </th>
                <th className="p-3 font-mono font-bold text-indigo-600 bg-indigo-50/20">
                  {recordB.id}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {compareRows.map((r, idx) => {
                const isDifferent = r.a !== r.b;
                return (
                  <tr
                    key={idx}
                    className={`hover:bg-zinc-50/30 transition-colors ${isDifferent ? "bg-indigo-50/10" : ""}`}
                  >
                    <td className="p-3 pl-6 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">
                      {r.attr}
                    </td>
                    <td className="p-3 leading-relaxed">{r.a}</td>
                    <td className="p-3 leading-relaxed border-l border-zinc-100">
                      {r.b}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg bg-zinc-900 text-white text-xs font-bold shadow-sm hover:bg-zinc-800 transition-colors"
          >
            Close Workspace
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── 3. SYSTEM PERFORMANCE TRENDS PANEL ───
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

  const topServices = ["Checkout", "Payments", "Database", "Authentication"];
  const counts = topServices.map(
    (s) => allData.filter((i) => i.service === s).length,
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-lg bg-white dark:bg-zinc-950 rounded-xl p-6 space-y-6">
        <div className="border-b pb-3 flex justify-between items-center">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
            Systemic Anomaly Distribution Trends
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-600"
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            Most Frequent Recurring Outages
          </div>
          <div className="space-y-3">
            {topServices.map((s, idx) => {
              const maxVal = Math.max(...counts);
              const percentage = maxVal > 0 ? (counts[idx] / maxVal) * 100 : 0;
              return (
                <div
                  key={s}
                  className="flex items-center gap-3 text-xs font-medium"
                >
                  <span className="w-24 text-zinc-700 truncate">{s}</span>
                  <div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-6 text-right font-mono text-zinc-400">
                    {counts[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-100 text-right">
          <button
            onClick={onClose}
            className="h-8 px-4 rounded-md bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-all"
          >
            Dismiss
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── 4. AUTOMATED DOCUMENTATION GENERATOR ───
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
      ? "Root Cause Analysis Summary"
      : kind === "report"
        ? "Incident Performance Review"
        : "Executive Briefing Log";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              {docTitle}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Synthesized by Ezra AI across {records.length} operational
              components
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-600"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 max-h-[50vh] overflow-y-auto bg-zinc-950 text-zinc-200 font-mono text-xs leading-relaxed space-y-4 shadow-inner">
          <p className="text-zinc-400 border-b border-zinc-800 pb-2">
            SCRUBBE RESPONSE LOG DATA // COMPILED: {new Date().toUTCString()}
          </p>
          {records.map((i) => (
            <div
              key={i.id}
              className="space-y-2 border-b border-zinc-900 last:border-0 pb-4 last:pb-0"
            >
              <div className="text-indigo-400 font-bold">
                ▶ {i.id} — {i.title}
              </div>
              <div>
                [Telemetry] Service: {i.service} // Severity: {i.priority} //
                Commander: {i.incidentCommander}
              </div>
              <div className="text-zinc-400">
                [Analysis] Root Cause: {i.reason}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 flex justify-end gap-2">
          <button
            onClick={() => alert("Copied compiled layout text.")}
            className="h-8 px-3 rounded-lg border text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 transition-colors flex items-center gap-1"
          >
            <Copy size={12} /> Copy to Clipboard
          </button>
          <button
            onClick={onClose}
            className="h-8 px-4 rounded-lg bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-colors"
          >
            Close
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
