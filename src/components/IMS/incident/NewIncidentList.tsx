"use client";
import React from "react";
import {
  Search,
  Bell,
  Shield,
  Activity,
  Terminal,
  Layers,
  ChevronRight,
  Plus,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import ExactIncidentSidebar from "./IncidentSidebarList";
import IncidentHeader from "./IncidentHeader";
import IncidentLifecycle from "./IncidentLifecycle";
import DetectionSignals from "./DetectionSignals";
import IncidentContextModule from "./IncidentContextModule";
import ScrubbeIntelligence from "./IntelligentModule";
import ActivityAuditTrail from "./ActivityAuditTrail";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AddContextForm from "./ContextForm";
import ContextList from "./ContextList";

const IncidentOverview: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentTab = searchParams.get("tab");

  return (
    <div className="flex h-screen  text-slate-300 font-sans overflow-hidden">
      {/* 1. LEFT SIDEBAR: INCIDENT LIST */}
      <aside className=" border-r border-white/5 flex flex-col">
        <ExactIncidentSidebar />
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Header Section */}
        <IncidentHeader />
        {(currentTab === "overview" || !currentTab) && (
          <>
            <IncidentLifecycle currentStep="Analysed" />
            <DetectionSignals />
            <ScrubbeIntelligence />
            <IncidentContextModule />
            <ActivityAuditTrail />
          </>
        )}
        {currentTab === "context" && (
          <>
            <ContextList />
            <AddContextForm />
          </>
        )}
      </main>
    </div>
  );
};

/* --- Component Helpers --- */

const IncidentCard = ({
  id,
  title,
  severity,
  status,
  time,
  active = false,
}: any) => (
  <div
    className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${
      active ? "bg-blue-600/5" : "hover:bg-white/[0.02]"
    }`}
  >
    <div className="flex justify-between items-center mb-2">
      <span className="text-[10px] font-bold text-red-500">{severity}</span>
      <span className="text-[10px] font-bold text-slate-500">{status}</span>
    </div>
    <h4
      className={`text-xs font-bold mb-1 truncate ${
        active ? "text-white" : "text-slate-400"
      }`}
    >
      {title}
    </h4>
    <div className="flex justify-between items-center text-[10px] text-slate-600">
      <span>{id}</span>
      <span>{time}</span>
    </div>
  </div>
);

const StepNode = ({ label, status, num }: any) => {
  const styles = {
    done: "bg-emerald-500 border-emerald-500 text-white",
    active: "bg-[#03050c] border-amber-500 text-amber-500",
    pending: "bg-[#03050c] border-slate-800 text-slate-600",
  };
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
          (styles as any)[status]
        }`}
      >
        {status === "done" ? <CheckCircle2 size={16} /> : num || "1"}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
    </div>
  );
};

const SignalRow = ({ source, text, time }: any) => (
  <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-lg group hover:border-white/10 transition-colors">
    <div className="flex items-center gap-4">
      <span className="text-[10px] font-bold text-slate-500 w-24 uppercase">
        {source}
      </span>
      <p className="text-xs text-slate-300">{text}</p>
    </div>
    <span className="text-[10px] font-mono text-slate-600">{time}</span>
  </div>
);

const ContextBox = ({ label, value, valueColor = "text-white" }: any) => (
  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
      {label}
    </p>
    <p className={`text-xs font-semibold ${valueColor}`}>{value}</p>
  </div>
);

export default IncidentOverview;
