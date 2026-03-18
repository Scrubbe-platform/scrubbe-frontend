"use client";
import React, { useState } from "react";
import { Search, Activity, Clock, CheckCircle2, Bot } from "lucide-react";
import Incidents from "./Incidents";
import Dashboard from "./Dashboard";
import Policy from "./Policy";
import Modal from "@/components/ui/Modal";
import GlobalSearch from "./GlobalSearch";
import { useCommands } from "@/lib/stores/command.store";

// --- Type Definitions ---

// --- Main Component ---
const tabs = ["Incidents", "Dashboards", "Policy"];

export default function OperationalDashboard() {
  const [tab, setTab] = useState(tabs[0]);
  const { openCommandPalette, setOpenCommandPalette } = useCommands();

  return (
    <div className="min-h-screen text-slate-300 font-sans selection:bg-cyan-500/30">
      {/* Top Navigation */}
      <nav className=" px-8 py-4 flex items-center justify-end">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-bold text-green-500">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            3 active incidents
          </div>
          <div className="relative" onClick={() => setOpenCommandPalette(true)}>
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              className="bg-white/5 border border-white/10 rounded-lg py-1.5 pl-9 pr-4 text-xs w-64 focus:outline-none focus:border-white/20"
              placeholder="Global Search"
              onClick={() => setOpenCommandPalette(true)}
            />
          </div>
        </div>
      </nav>

      <div className="flex gap-8 text-base font-medium w-full border-b border-slate-500 justify-center ">
        {tabs.map((value) => (
          <div key={value} className="flex-1 text-center">
            <button
              onClick={() => setTab(value)}
              className={`${
                value === tab
                  ? "text-IMSCyan border-IMSCyan"
                  : "text-slate-300 border-transparent"
              } border-b-2  pb-4 flex-1 text-base`}
            >
              {value}
            </button>
          </div>
        ))}
      </div>

      {tab === tabs[0] && <Incidents />}
      {tab === tabs[1] && <Dashboard />}
      {tab === tabs[2] && <Policy />}
    </div>
  );
}

// --- Internal UI Components ---
