"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, LogIn, UserCheck } from "lucide-react";

// Mock data reflecting the payload required by this dashboard widget block
const MOCK_ACTIVE_INCIDENT = {
  incidentId: "SI-000847",
  title: "Payment gateway latency spike",
  severity: "P0",
  durationUnacknowledged: "34 minutes",
  currentStep: "STEP 3 ACTIVE",
  nextTarget: "VP Engineering",
  initialRemainingSeconds: 523, // 08:43 from the original roster state template
  timeline: [
    {
      timestamp: "14:02:18 UTC",
      text: "Incident detected — payment.api error rate 42%",
      type: "detected",
    },
    {
      timestamp: "14:02:21 UTC",
      text: "Playbook matched · auto-routed to Aisha M.",
      type: "matched",
    },
    {
      timestamp: "14:07:21 UTC",
      text: "No acknowledgement after 5min · escalated to Kwame O.",
      type: "escalated",
    },
    {
      timestamp: "14:17:21 UTC",
      text: "No acknowledgement after 15min · escalated to Yemi A.",
      type: "escalated",
    },
    {
      timestamp: "14:22:21 UTC",
      text: "War room triggered · #inc-000847-warroom created",
      type: "warroom",
    },
  ],
};

export default function ActiveEscalationCard() {
  const incident = MOCK_ACTIVE_INCIDENT;
  const [secondsLeft, setSecondsLeft] = useState(
    incident.initialRemainingSeconds,
  );

  // Live real-time execution countdown clock worker loop
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  // Utility to format seconds into MM:SS
  const formatTimer = (totalSecs: number) => {
    const m = String(Math.floor(totalSecs / 60)).padStart(2, "0");
    const s = String(totalSecs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const getDotColor = (type: string) => {
    switch (type) {
      case "detected":
        return "bg-emerald-500";
      case "matched":
        return "bg-blue-500";
      case "escalated":
        return "bg-amber-500";
      case "warroom":
        return "bg-red-500";
      default:
        return "bg-zinc-400";
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
      {/* Section Card Header Controls row */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Active Escalation — {incident.incidentId}
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            {incident.title} · {incident.severity} ·{" "}
            {incident.durationUnacknowledged} unacknowledged
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/50 px-3 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors">
            <UserCheck size={14} /> Acknowledge
          </button>
          <button className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-500 px-3 text-xs font-semibold text-white shadow-xs hover:bg-emerald-600 transition-all">
            <LogIn size={14} /> Join War Room
          </button>
        </div>
      </div>

      {/* Core Split Layout: Left Timeline vs Right Progress Gauge */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Side: Live Activity Execution Trace Timeline */}
        <div className="flex-1 w-full relative pl-6 before:absolute before:left-[7px] before:top-1.5 before:bottom-1.5 before:w-[2px] before:bg-slate-200 dark:before:bg-zinc-800">
          <div className="space-y-4">
            {incident.timeline.map((event, index) => (
              <div key={index} className="relative group">
                {/* Visual state event target node tracking anchor */}
                <div
                  className={`absolute -left-[24px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-950 shadow-xs ${getDotColor(event.type)}`}
                />

                <div className="text-xs">
                  <div className="font-semibold text-slate-900 dark:text-zinc-100">
                    {event.text}
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] text-slate-400 dark:text-zinc-500">
                    {event.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Exact Auto-Escalation Status Meter Widget Box */}
        <div className="w-full md:w-[190px] shrink-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
            Auto-Esc Status
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50/50 p-3.5 dark:border-red-950/40 dark:bg-red-950/10">
            <div className="text-[11px] font-bold text-red-800 dark:text-red-400 mb-1.5 uppercase">
              {incident.currentStep}
            </div>

            <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
              Next escalation
            </div>

            {/* Live Ticking Code Timer display */}
            <div className="font-mono text-2xl font-black text-red-600 dark:text-red-500 leading-none my-1 tracking-tight">
              {formatTimer(secondsLeft)}
            </div>

            <div className="text-[11px] font-medium text-slate-600 dark:text-zinc-300 truncate">
              → {incident.nextTarget}
            </div>

            {/* Multi-Stop Structural CSS Status Gradient Indicator Bar */}
            <div className="relative mt-2.5 h-1.5 w-full rounded-full bg-gradient-to-r from-emerald-100 via-emerald-300 via-amber-200 to-red-400 dark:from-emerald-950/40 dark:via-amber-900/40 dark:to-red-900/60">
              {/* Positional Marker Circle Pinpoint matching the 75% offset configuration */}
              <div className="absolute top-1/2 -translate-y-1/2 left-[75%] h-3.5 w-3.5 rounded-full border-2 border-white bg-amber-500 shadow-md dark:border-zinc-950" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
