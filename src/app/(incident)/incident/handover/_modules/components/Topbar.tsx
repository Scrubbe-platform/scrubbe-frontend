// components/Topbar.tsx
"use client";
import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";

// Local sub-component to handle the StatusDot contract cleanly
const StatusDot = ({ color }: { color: "red" | "green" | "amber" }) => {
  const colorMap = {
    red: "bg-red-600 dark:bg-red-500",
    green: "bg-green-600 dark:bg-green-500",
    amber: "bg-amber-600 dark:bg-amber-500",
  };

  return (
    <div
      className={`h-1.5 w-1.5 rounded-full animate-pulse ${colorMap[color] || colorMap.red}`}
    />
  );
};

interface Viewer {
  initials: string;
  color: string;
}

interface TopbarProps {
  activeIncidents?: number;
}

// Senior Frontend Practice: Move static dummy contract shapes outside the render loop
const MOCK_VIEWERS: Viewer[] = [
  { initials: "P.", color: "#7c3aed" }, // Purple
  { initials: "M.", color: "#2563eb" }, // Blue
  { initials: "S.", color: "#059669" }, // Green
  { initials: "H.D", color: "#d97706" }, // Amber
];

export default function Topbar({ activeIncidents = 3 }: TopbarProps) {
  const [currentTime, setCurrentTime] = useState("––:––:–– UTC");

  // Keep the real-time clock ticking for production operational needs
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, "0");
      const m = String(now.getUTCMinutes()).padStart(2, "0");
      const s = String(now.getUTCSeconds()).padStart(2, "0");
      setCurrentTime(`${h}:${m}:${s} UTC`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Data contract mock matching your layout identifiers
  const TOP_BAR = {
    time: currentTime,
    activeIncidents: activeIncidents,
  };

  const VIEWERS = MOCK_VIEWERS;

  return (
    <div className="flex items-center justify-between px-8 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-50">
      {/* Breadcrumbs Left */}
      <div className="flex items-center gap-1.5 text-[13px] text-zinc-400 dark:text-zinc-500">
        <span>Operations</span>
        <ChevronRight size={13} />
        <span className="font-semibold text-zinc-800 dark:text-zinc-100">
          Handovers
        </span>
      </div>

      {/* Metrics & Presence Context Right */}
      <div className="flex items-center gap-4">
        {/* Active Viewers Stack */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {VIEWERS.map((v, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-zinc-950 flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                style={{ backgroundColor: v.color }}
              >
                {v.initials}
              </div>
            ))}
          </div>
          <span className="text-[12px] font-medium text-zinc-400 dark:text-zinc-500">
            +4 Viewing
          </span>
        </div>

        {/* Real-time UTC Timestamp */}
        <span className="text-[13px] font-mono text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900/50">
          {TOP_BAR.time}
        </span>

        {/* Dynamic Incident Severity Status Anchor */}
        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-1.5">
          <StatusDot color="red" /> {TOP_BAR.activeIncidents} Active Incidents
        </span>
      </div>
    </div>
  );
}
