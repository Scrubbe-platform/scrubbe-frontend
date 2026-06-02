"use client";

import React from "react";
import { GitBranch, BarChart3, Zap, Workflow } from "lucide-react";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";

interface DetectionSignal {
  id: string;
  source: string;
  subSource: string;
  content: string;
  timestamp: string;
  icon: React.ReactNode;
  accent: string; // single tailwind color key e.g. "emerald" | "amber" | "red" | "blue"
}

// ── Map accent name → tailwind classes ───────────────────────────

const accentClasses: Record<string, { icon: string; border: string; bg: string }> = {
  emerald: { icon: "text-emerald-500",                         border: "border-emerald-500/20 dark:border-emerald-500/20", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  amber:   { icon: "text-amber-500",                           border: "border-amber-500/20 dark:border-amber-500/20",     bg: "bg-amber-50 dark:bg-amber-500/10"     },
  red:     { icon: "text-red-500",                             border: "border-red-500/20 dark:border-red-500/20",         bg: "bg-red-50 dark:bg-red-500/10"         },
  blue:    { icon: "text-blue-500 dark:text-blue-400",         border: "border-blue-500/20 dark:border-blue-400/20",       bg: "bg-blue-50 dark:bg-blue-500/10"       },
};

// ── Signal card ──────────────────────────────────────────────────

const SignalCard = ({ signal }: { signal: DetectionSignal }) => {
  const a = accentClasses[signal.accent] ?? accentClasses.emerald;

  return (
    <div className="flex gap-3 md:gap-4 items-start p-3.5 rounded-xl border border-zinc-100 dark:border-white/[0.06] bg-white dark:bg-zinc-900/40 hover:border-zinc-200 dark:hover:border-white/10 transition-colors">
      {/* Icon */}
      <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${a.border} ${a.bg}`}>
        <span className={a.icon}>
          {React.cloneElement(signal.icon as React.ReactElement, { size: 16 })}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1 gap-2">
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 truncate">
            {signal.source}
            <span className="mx-1.5 opacity-40">·</span>
            {signal.subSource}
          </p>
          <span className="text-[11px] font-mono text-zinc-300 dark:text-zinc-600 shrink-0 tabular-nums">
            {signal.timestamp}
          </span>
        </div>
        <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-100 leading-snug">
          {signal.content}
        </p>
      </div>
    </div>
  );
};

// ── Build signals from incident ──────────────────────────────────

const buildDetectionSignals = (incident: IncidentDetailRecord): DetectionSignal[] => {
  const signals: DetectionSignal[] = [];

  if (incident.sourceType || incident.detection) {
    signals.push({
      id: "source",
      source: incident.sourceType || "Incident Source",
      subSource: incident.source || "Detection",
      content: incident.detection || `${incident.title} triggered from ${incident.sourceType || "manual input"}.`,
      timestamp: incident.elapsedLabel,
      icon: <GitBranch />,
      accent: "emerald",
    });
  }

  if (incident.impactSummary || incident.service || incident.region) {
    signals.push({
      id: "impact",
      source: "Impact",
      subSource: incident.environment || "Runtime",
      content: incident.impactSummary || `${incident.service} is affected in ${incident.region}.`,
      timestamp: incident.elapsedLabel,
      icon: <BarChart3 />,
      accent: "amber",
    });
  }

  if (incident.techDescription || incident.description) {
    signals.push({
      id: "technical",
      source: "Technical Context",
      subSource: incident.category || "Analysis",
      content: incident.techDescription || incident.description,
      timestamp: incident.elapsedLabel,
      icon: <Zap />,
      accent: "red",
    });
  }

  if (incident.recommendedActions.length > 0) {
    signals.push({
      id: "action",
      source: "Recommended Action",
      subSource: incident.owningSquad || "Response",
      content: incident.recommendedActions[0],
      timestamp: incident.elapsedLabel,
      icon: <Workflow />,
      accent: "blue",
    });
  }

  return signals;
};

// ── Section ──────────────────────────────────────────────────────

const DetectionSignals: React.FC<{ incident: IncidentDetailRecord }> = ({ incident }) => {
  const signals = buildDetectionSignals(incident);

  return (
    <div className="px-5 md:px-8 py-6 border-b border-zinc-100 dark:border-white/[0.06]">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">
        Detection Signals
      </p>

      {signals.length > 0 ? (
        <div className="flex flex-col gap-2">
          {signals.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 px-5 py-6 text-[13px] text-zinc-400 dark:text-zinc-500">
          No live detection signals available for this incident yet.
        </div>
      )}
    </div>
  );
};

export default DetectionSignals;