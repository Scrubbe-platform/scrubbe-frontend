"use client";
import React, { useState } from "react";
import { Search, Plus, MoreVertical } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Modal from "@/components/ui/Modal";
import RaiseIncidentModal from "./IncidentForm";

// --- Types ---

// The 9 specific statuses/stages found in the Incident Lifecycle

export type LifecycleStatus =
  | "Detected"
  | "Enriched"
  | "Analyzed"
  | "Proposed"
  | "Approved"
  | "Executing"
  | "Resolved"
  | "Post-Mortem"
  | "Investigating";

export interface Incident {
  id: string;
  severity: "P1" | "P2" | "P3";
  status: LifecycleStatus;
  title: string;
  service: string;
  region: string;
  time: string;
  stageProgress: number; // Represents the segments filled (1-9)
}

export const dummyIncidents: Incident[] = [
  {
    id: "SI-0003110",
    severity: "P1",
    status: "Investigating",
    title:
      "checkout-service failed integration tests — DB connection pool exhaustion",
    service: "checkout-service",
    region: "eu-west-1",
    time: "18m ago",
    stageProgress: 3,
  },
  {
    id: "SI-0003090",
    severity: "P1",
    status: "Proposed",
    title: "payments-api error rate 8.4% — JWT validation failures cascading",
    service: "payments-api",
    region: "us-east-1",
    time: "34m ago",
    stageProgress: 4,
  },
  {
    id: "SI-0003085",
    severity: "P1",
    status: "Executing",
    title: "auth-service pod CrashLoopBackOff — OOMKilled after 14 restarts",
    service: "auth-service Kubernetes",
    region: "prod",
    time: "51m ago",
    stageProgress: 6,
  },
  {
    id: "SI-0003112",
    severity: "P3",
    status: "Detected",
    title: "Scheduled maintenance window — storage-service migration",
    service: "storage-service",
    region: "eu-west-1",
    time: "1h ago",
    stageProgress: 1,
  },
  {
    id: "SI-0003115",
    severity: "P2",
    status: "Enriched",
    title: "Redis cache eviction spike detected in staging-cluster",
    service: "redis-cache",
    region: "us-west-2",
    time: "2h ago",
    stageProgress: 2,
  },
  {
    id: "SI-0003118",
    severity: "P1",
    status: "Approved",
    title: "Primary database failover triggered — write latency > 500ms",
    service: "postgres-primary",
    region: "ap-southeast-1",
    time: "5m ago",
    stageProgress: 5,
  },
  {
    id: "SI-0003120",
    severity: "P2",
    status: "Resolved",
    title: "API Gateway rate limiting misconfiguration",
    service: "api-gateway",
    region: "global",
    time: "4h ago",
    stageProgress: 7,
  },
  {
    id: "SI-0003122",
    severity: "P1",
    status: "Post-Mortem",
    title: "Total outage: eu-west-1 availability zone partition",
    service: "infrastructure",
    region: "eu-west-1",
    time: "1d ago",
    stageProgress: 9,
  },
  {
    id: "SI-0003125",
    severity: "P3",
    status: "Analyzed",
    title: "Minor latency increase in recommendation-engine",
    service: "ml-service",
    region: "us-east-1",
    time: "12m ago",
    stageProgress: 3,
  },
];

// --- Sub-Components ---

const FilterPill = ({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) => (
  <button
    className={`px-3 py-1 rounded-md border text-[11px] font-bold uppercase tracking-wider transition-all
    ${
      active
        ? "border-cyan-400 text-cyan-400 bg-cyan-400/5 shadow-[0_0_10px_rgba(34,211,238,0.1)]"
        : "border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20"
    }`}
  >
    {label}
  </button>
);

const StatusBadge = ({ status }: { status: LifecycleStatus }) => {
  const styles: Record<LifecycleStatus, string> = {
    Investigating: "border-amber-500/50 text-amber-500 bg-amber-500/5",
    Proposed: "border-blue-500/50 text-blue-400 bg-blue-500/5",
    Detected: "border-cyan-500/50 text-cyan-400 bg-cyan-500/5",
    Approved: "border-emerald-500/50 text-emerald-500 bg-emerald-500/5",
    Enriched: "border-purple-500/50 text-purple-400 bg-purple-500/5",
    Analyzed: "border-indigo-500/50 text-indigo-400 bg-indigo-500/5",
    Executing: "border-yellow-500/50 text-yellow-500 bg-yellow-500/5",
    Resolved: "border-slate-500/50 text-slate-400 bg-slate-500/5",
    "Post-Mortem": "border-pink-500/50 text-pink-400 bg-pink-500/5",
  };
  return (
    <span
      className={`text-[9px] px-2 py-0.5 rounded border font-black uppercase tracking-tighter ${styles[status]}`}
    >
      {status}
    </span>
  );
};

const IncidentCard = ({
  incident,
  onClick,
  isActive,
}: {
  incident: Incident;
  onClick: () => void;
  isActive: boolean;
}) => (
  <div
    onClick={onClick}
    className={` border rounded-xl p-4 mb-3 transition-all cursor-pointer group
        ${
          isActive
            ? "border-cyan-400/60 bg-cyan-400/5 ring-1 ring-cyan-400/20 bg-darkEzra"
            : "border-white/5 hover:border-white/20"
        }`}
  >
    <div className="flex justify-between items-start mb-3">
      <div className="px-2 py-0.5 rounded border border-red-500/40 text-[10px] font-black text-red-500 bg-red-500/5">
        {incident.severity}
      </div>
      <StatusBadge status={incident.status} />
    </div>

    <div className="mb-2">
      <span className="text-[10px] font-mono text-slate-600 block mb-1 uppercase tracking-widest">
        {incident.id}
      </span>
      <h3 className="text-[13px] font-semibold text-cyan-400 group-hover:text-cyan-300 leading-snug line-clamp-2">
        {incident.title}
      </h3>
    </div>

    <div className="text-[10px] text-slate-500 mb-4 font-medium">
      {incident.service} · {incident.region} · {incident.time}
    </div>

    {/* The 9-Stage Progress Bar */}
    <div className="flex gap-1">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-sm transition-all duration-700 ${
            i + 1 <= incident.stageProgress
              ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
              : "bg-white/5"
          }`}
        />
      ))}
    </div>
  </div>
);

// --- Main Sidebar Component ---

const ExactIncidentSidebar: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const activeId = searchParams.get("id");
  const [open, setOpen] = useState(false);
  const handleIncidentClick = (id: string) => {
    router.replace(`${pathname}?id=${id}`);
  };

  return (
    <div className="w-full h-screen md:border-r border-white/5 flex flex-col p-3 md:p-6 overflow-hidden">
      {/* 1. Top Bar & Raise Incident Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className=" font-semibold text-white">Incidents {}</p>
        </div>
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="px-5 py-2 border border-IMSCyan text-IMSCyan rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-cyan-400/5 transition-all"
        >
          Raise an Incident
        </button>
      </div>

      {/* 2. The Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterPill label="All" active />
        <FilterPill label="P1" />
        <FilterPill label="P2-P3" />
        <FilterPill label="Resolved" />
        <FilterPill label="Auto" />
        <FilterPill label="Manual" />
      </div>

      {/* 3. The Search Input */}
      <div className="relative mb-8">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
          size={14}
        />
        <input
          type="text"
          placeholder="Search incidents, services, ID"
          className="w-full bg-white/[0.02] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-xs text-slate-300 focus:outline-none focus:border-cyan-400/40 transition-all placeholder:text-slate-600 font-medium"
        />
      </div>

      {/* 4. Incident List (The 9-Status Implementation) */}
      <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
        {dummyIncidents.map((incident) => (
          <IncidentCard
            key={incident.id}
            incident={incident}
            onClick={() => handleIncidentClick(incident.id)}
            isActive={activeId === incident.id}
          />
        ))}
      </div>

      <Modal onClose={() => setOpen(false)} isOpen={open}>
        <RaiseIncidentModal onClose={() => setOpen(false)} />
      </Modal>
    </div>
  );
};

export default ExactIncidentSidebar;
