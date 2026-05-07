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
  iconColor: string;
}

const SignalCard = ({ signal }: { signal: DetectionSignal }) => (
  <div className="bg-darkEzra border border-white/5 rounded-xl p-3 md:p-4 flex gap-3 md:gap-4 items-start hover:border-white/10 transition-all group">
    <div
      className={`
      w-10 h-10 md:w-12 md:h-12 rounded-lg border flex items-center justify-center shrink-0
      bg-opacity-10 transition-transform group-hover:scale-105
      ${signal.iconColor.replace("text", "border")}/30
      ${signal.iconColor.replace("text", "bg")}/10
    `}
    >
      <div className={`${signal.iconColor} scale-90 md:scale-100`}>
        {React.cloneElement(signal.icon as React.ReactElement, { size: 18 })}
      </div>
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center mb-1">
        <p className="text-[10px] md:text-[11px] font-medium text-slate-500 truncate pr-2">
          {signal.source} <span className="mx-1 opacity-50">·</span>{" "}
          {signal.subSource}
        </p>
        <span className="text-[10px] md:text-[11px] font-mono text-slate-600 tabular-nums shrink-0">
          {signal.timestamp}
        </span>
      </div>
      <h4 className="text-[13px] md:text-[15px] font-semibold text-slate-100 leading-snug tracking-tight">
        {signal.content}
      </h4>
    </div>
  </div>
);

const buildDetectionSignals = (incident: IncidentDetailRecord): DetectionSignal[] => {
  const signals: DetectionSignal[] = [];

  if (incident.sourceType || incident.detection) {
    signals.push({
      id: "source",
      source: incident.sourceType || "Incident Source",
      subSource: incident.source || "Detection",
      content:
        incident.detection ||
        `${incident.title} triggered from ${incident.sourceType || "manual input"}.`,
      timestamp: incident.elapsedLabel,
      icon: <GitBranch />,
      iconColor: "text-emerald-500",
    });
  }

  if (incident.impactSummary || incident.service || incident.region) {
    signals.push({
      id: "impact",
      source: "Impact",
      subSource: incident.environment || "Runtime",
      content:
        incident.impactSummary ||
        `${incident.service} is affected in ${incident.region}.`,
      timestamp: incident.elapsedLabel,
      icon: <BarChart3 />,
      iconColor: "text-amber-500",
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
      iconColor: "text-red-500",
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
      iconColor: "text-blue-500",
    });
  }

  return signals;
};

const DetectionSignals: React.FC<{ incident: IncidentDetailRecord }> = ({
  incident,
}) => {
  const signals = buildDetectionSignals(incident);

  return (
    <div className="p-4 md:p-6">
      <div className="w-full bg-transparent flex flex-col gap-3 p-3 md:p-4 rounded-xl border border-white/20">
        <h2 className="text-[11px] md:text-[13px] font-bold text-slate-600 uppercase tracking-[0.15em] mb-1 md:mb-2 px-1">
          Detection Signals
        </h2>

        <div className="flex flex-col gap-3">
          {signals.length > 0 ? (
            signals.map((signal) => <SignalCard key={signal.id} signal={signal} />)
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-sm text-slate-400">
              No live detection signals are available for this incident yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetectionSignals;
