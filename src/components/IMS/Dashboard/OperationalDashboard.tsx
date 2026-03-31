"use client";
import React, { useState } from "react";
import {
  Search,
  Activity,
  ShieldCheck,
  LayoutDashboard,
  Zap,
} from "lucide-react";
import Incidents from "./Incidents";
import Dashboard from "./Dashboard";
import Policy from "./Policy";
import { useCommands } from "@/lib/stores/command.store";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "Incidents", icon: Activity, label: "Incident Command" },
  { id: "Dashboards", icon: LayoutDashboard, label: "Performance Hub" },
  { id: "Policy", icon: ShieldCheck, label: "Governance & Policy" },
];

export default function OperationalDashboard() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const { setOpenCommandPalette } = useCommands();

  return (
    <div className="min-h-screen bg-void text-slate-300 font-sans selection:bg-IMSCyan/30">
      {/* 2.1 TOP NAVIGATION — Governance & Search */}
      <nav className="px-8 py-4 flex items-center justify-between border-b border-white/5 bg-panel/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-6">
          {/* CP-Zone Status Indicator [cite: 77, 109] */}
          <div className="flex items-center gap-3 px-3 py-1.5 bg-IMSLightGreen/5 border border-IMSLightGreen/20 rounded-lg">
            <div className="relative flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-IMSLightGreen animate-pulse" />
              <div className="absolute w-2 h-2 rounded-full bg-IMSLightGreen animate-ping opacity-75" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-IMSLightGreen uppercase tracking-tighter leading-none">
                CP-Zone Active
              </span>
              <span className="text-[8px] text-gray-500 font-mono uppercase tracking-widest mt-0.5">
                Strict Consistency Mode
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-2 text-[11px] font-mono text-gray-500">
            <Zap size={12} className="text-amber-500" />
            <span>3 Active Incidents</span>
          </div>
        </div>

        {/* Global Search — [cite: 118, 128] */}
        <div
          className="group relative cursor-pointer"
          onClick={() => setOpenCommandPalette(true)}
        >
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-IMSCyan transition-colors"
          />
          <div className="bg-white/5 border border-white/10 group-hover:border-IMSCyan/30 rounded-xl py-2 pl-10 pr-4 text-[12px] w-72 flex justify-between items-center transition-all">
            <span className="text-gray-500">Search Signal Graph...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono">
              ⌘K
            </kbd>
          </div>
        </div>
      </nav>

      {/* 1.2 LIFECYCLE TABS — [cite: 17, 19] */}
      <div className="w-full bg-panel/30">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex gap-12">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative pt-6 pb-4 flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest transition-all",
                    isActive
                      ? "text-IMSCyan"
                      : "text-gray-500 hover:text-gray-300"
                  )}
                >
                  <tab.icon
                    size={16}
                    className={isActive ? "text-IMSCyan" : "text-gray-600"}
                  />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-IMSCyan shadow-[0_-4px_12px_rgba(6,238,253,0.3)]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 1.3 CONTENT AREA — [cite: 113, 157] */}
      <main className="max-w-[1400px] mx-auto p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "Incidents" && <Incidents />}
            {activeTab === "Dashboards" && <Dashboard />}
            {activeTab === "Policy" && <Policy />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
