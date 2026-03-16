"use client";
import React, { ReactNode, useState } from "react";
import {
  Bell,
  ChevronRight,
  Share2,
  Info,
  Activity,
  GitBranch,
  Database,
  Terminal,
  Shield,
  Zap,
  Layout,
  Phone,
  Workflow,
  BookOpen,
  Logs,
  ShieldCheck,
  WorkflowIcon,
} from "lucide-react";
import CodeEngineRecommendation from "./_modules/components/code-engine-recommendation";
import { BiGitBranch } from "react-icons/bi";
import { GiHamburgerMenu } from "react-icons/gi";
import { PiSpiral } from "react-icons/pi";
import { TiFlowMerge } from "react-icons/ti";
import { IoCodeSlash } from "react-icons/io5";
import { LuClock2 } from "react-icons/lu";
import { FiGitPullRequest } from "react-icons/fi";
import moment from "moment";
import SideModal from "@/components/ui/SideModal";
import Pipeline from "./_modules/components/Pipeline";

const incidentData = [
  {
    ticketId: "INC-311",
    title: "Checkout-Service Deployment failed",
    timezone: "eu-west- 1",
    createdAt: new Date(),
    priority: "P1",
  },
  {
    ticketId: "INC-312",
    title: "Checkout-Service Deployment failed",
    timezone: "eu-west- 1",
    createdAt: new Date(),
    priority: "P2",
  },
  {
    ticketId: "INC-313",
    title: "Checkout-Service Deployment failed",
    timezone: "eu-west- 1",
    createdAt: new Date(),
    priority: "P3",
  },
];
export default function IncidentOverview() {
  const [openPipeline, setOpenPipeline] = useState(false);
  return (
    <div className="min-h-screen text-slate-300 p-6 font-sans selection:bg-cyan-500/30">
      <div className="flex gap-6 max-w-[1600px] mx-auto relative">
        {/* LEFT SIDEBAR - STICKY */}
        <aside className="w-72 shrink-0 self-start sticky top-6 space-y-4">
          <div className="flex items-center gap-2 mb-6 px-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Active Incidents (3)
            </h2>
          </div>

          <div className="space-y-3">
            {incidentData.map((incident) => (
              <ActiveIncidentCard
                id={incident.ticketId}
                priority={incident.priority}
                title={incident.title}
                timezone={incident.timezone}
                date={incident.createdAt}
                active
                key={incident.ticketId}
              />
            ))}
          </div>

          <button
            onClick={() => setOpenPipeline(true)}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-bold hover:bg-cyan-500/10 transition-all"
          >
            <Layout size={14} /> View Pipeline #311
          </button>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 space-y-6">
          {/* TOP HEADER */}
          <section className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-white tracking-tighter">
                  INC-311
                </h1>
                <span className="px-2 py-0.5 rounded bg-rose-500 text-[10px] text-black uppercase border border-rose-500/30">
                  P1 • Investigating
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                checkout-service failed integration tests due to DB pool
                exhaustion
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-IMSCyan text-IMSCyan text-xs transition-all">
                <Bell size={14} /> Notify
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 text-black text-xs transition-all hover:bg-cyan-300">
                <Phone size={14} /> Declare Incident
              </button>
            </div>
          </section>

          {/* KPI GRID */}
          <section className="grid grid-cols-4 gap-4 overflow-hidden">
            <StatBox label="Org MTTR (last 30 days)" value="27m" />
            <StatBox
              label="This incident"
              value="18m elapsed"
              valueClass="text-yellow-500"
            />
            <StatBox
              label="checkout-service SLO"
              value="99.9% / 30d"
              sub="Error budget used: 61%"
              subClass="text-rose-500"
            />
            <StatBox
              label="Current blast radius"
              value="Checkout only"
              sub="View topology"
              subIcon={<BiGitBranch size={16} />}
            />
          </section>

          {/* SCRUBBE INSIGHT (PURPLE) */}
          <section className="p-5 rounded-2xl border border-purple-500/30 bg-purple-500/5 space-y-3">
            <div className="flex items-center gap-2 ">
              <Zap size={16} fill="currentColor" className="text-yellow-400" />
              <span className="text-sm font-bold uppercase tracking-widest">
                Scrubbe Insight • 94% confidence
              </span>
            </div>
            <p className="text-sm text-slate-300">
              This is the same DB connection pool exhaustion seen in{" "}
              <span className="text-purple-400 underline cursor-pointer">
                INC-231
              </span>{" "}
              and{" "}
              <span className="text-purple-400 underline cursor-pointer">
                INC-187
              </span>
              . Code Intelligence has a production-safe fix below — expected
              MTTR: &lt; 4 minutes.
            </p>
          </section>

          {/* SECONDARY INFO GRID */}
          <section className="grid grid-cols-3 gap-4">
            <InfoCard
              icon={<PiSpiral size={16} />}
              title="SLO & error budget"
              desc={
                <div>
                  <p>
                    This failure consumes ~7% of the remaining monthly error
                    budget for checkout-service.
                  </p>
                  <div className="flex text-white gap-2 items-center cursor-pointer mt-2">
                    <p>Open SLO Context</p>
                    <GiHamburgerMenu className="text-IMSCyan" />
                  </div>
                </div>
              }
            />
            <InfoCard
              icon={<Workflow size={16} />}
              title="Blast radius snapshot"
              desc={
                <div>
                  <p>
                    Impacted:{" "}
                    <span className="text-green">
                      checkout-service → db-core
                    </span>
                     in eu-west-1. No evidence of cross-region or cross-service
                    spread yet.
                  </p>
                  <p className="mt-2">
                    If this drags on, payments-api and order-service may breach
                    latency SLO.
                  </p>
                </div>
              }
            />
            <InfoCard
              icon={<BookOpen size={16} />}
              title="Runbook suggestion"
              desc="Match found: RBK-17 - 'DB pool exhaustion during campaign'. Steps 2-4 are already covered."
            />
          </section>

          {/* CODE INTELLIGENCE ENGINE (GREEN) */}
          <section className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-6">
            <div className="flex items-center gap-2 text-emerald-400">
              <Shield size={16} />
              <span className="text-sm font-bold uppercase tracking-widest">
                Code Intelligence Engine • 3 Suggested Fixes
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <FixTag
                icon={<BiGitBranch size={14} />}
                label="Diff-based meaning"
              />
              <FixTag icon={<BookOpen size={14} />} label="Pattern matching" />
              <FixTag
                icon={<Logs size={14} />}
                label="Logs / metrics / fraud context"
              />
              <FixTag
                icon={<ShieldCheck size={14} />}
                label="Env guardrails & RBAC"
              />
              <FixTag
                icon={<WorkflowIcon size={14} />}
                label="Remediation Workflow"
              />
              <FixTag
                icon={<WorkflowIcon size={14} />}
                label="Service Topology"
                active
              />
              <FixTag
                icon={<TiFlowMerge size={14} />}
                label="Multi-step auto-remediation"
              />
              <FixTag
                icon={<IoCodeSlash size={14} />}
                label="Developer tooling integration"
              />
              <FixTag
                icon={<LuClock2 size={14} />}
                label="Rationale & Confidence Model"
              />
              <FixTag
                icon={<BookOpen size={14} />}
                label="Enterprise approval & RBAC"
              />
              <FixTag
                icon={<FiGitPullRequest size={14} />}
                label="SLO Impact"
              />
            </div>
          </section>

          {/* INFO WARNING (ORANGE) */}
          <section className="p-6 rounded-2xl border border-orange-500/20 bg-orange-500/5 space-y-4">
            <div className="flex items-center gap-2 text-orange-400">
              <Info size={16} />
              <span className="text-xs font-black uppercase tracking-widest">
                Code Intelligence is scoped to deployment-aware incidents
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              This incident wasn&apos;t triggered by a failed CI/CD deployment,
              so Scrubbe can&apos;t safely propose a code diff. Code
              Intelligence only makes changes when it has a clear deploy,
              service, and blast radius.
            </p>
            <ul className="space-y-2">
              {[
                "Review retry and timeout configuration for auth-service.",
                "Check recent config changes in config/auth.yml.",
                "Use Magic Insight and the unified timeline to identify the exact change that caused the spike.",
              ].map((text, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-xs text-slate-500 font-medium"
                >
                  <div className="w-1 h-1 rounded-full bg-slate-700" /> {text}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <CodeEngineRecommendation />
          </section>
        </main>
      </div>

      <>
        {openPipeline && (
          <SideModal
            title=""
            isOpen={openPipeline}
            onClose={() => setOpenPipeline(false)}
          >
            <Pipeline />
          </SideModal>
        )}
      </>
    </div>
  );
}

// Sub-components
const ActiveIncidentCard = ({
  id,
  priority,
  title,
  active = false,
  timezone,
  date,
  onClick,
}: {
  id: string;
  priority: string;
  title: string;
  active?: boolean;
  timezone?: string;
  date: Date;
  onClick?: (value: any) => void;
}) => (
  <div
    onClick={onClick}
    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
      active
        ? "bg-white/[0.04] border-white/20 ring-1 ring-white/10 shadow-2xl"
        : "bg-transparent border-white/5 hover:border-white/20 hover:bg-white/[0.02]"
    }`}
  >
    <div className="flex justify-between items-start mb-2">
      <span className="text-[10px] font-black text-slate-500 tracking-tighter">
        {id}
      </span>
      <span
        className={`px-1.5 py-0.5 rounded text-[8px] font-black border text-black ${
          priority === "P1"
            ? " bg-rose-500 border-rose-500/30"
            : "bg-amber-500 border-amber-500/30"
        }`}
      >
        {priority}
      </span>
    </div>
    <h3 className="text-[11px] font-bold text-white leading-snug">{title}</h3>
    <p className="text-[9px] text-slate-300 mt-1 uppercase">
      {timezone} • {moment(date).fromNow()}
    </p>
  </div>
);

const StatBox = ({
  label,
  value,
  sub,
  subClass,
  valueClass = "text-white",
  subIcon,
}: any) => (
  <div className="p-5 border rounded-xl border-slate-400 flex flex-col justify-between">
    <span className="text-[9px] font-bold text-slate-500 uppercase ">
      {label}
    </span>
    <div className="space-y-1">
      {value && (
        <div className={`text-lg font-black  ${valueClass}`}>{value}</div>
      )}
      {sub && (
        <div
          className={`text-[10px] flex items-center gap-1 font-bold ${
            subClass || "text-slate-500"
          }`}
        >
          {subIcon} {sub}
        </div>
      )}
    </div>
  </div>
);

const InfoCard = ({
  icon,
  title,
  desc,
}: {
  icon: ReactNode;
  title: string;
  desc: string | ReactNode;
}) => (
  <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] space-y-3">
    <div className="flex items-center gap-2 text-slate-200">
      {icon}{" "}
      <span className="text-[10px] font-black uppercase tracking-widest">
        {title}
      </span>
    </div>
    <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

const FixTag = ({
  label,
  active = false,
  icon,
}: {
  label: string;
  active?: boolean;
  icon: ReactNode;
}) => (
  <div
    className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 text-[9px] font-bold text-center transition-all cursor-pointer ${
      active
        ? "bg-emerald-500/20 border-emerald-400 text-emerald-400"
        : "bg-white/5 border-white/10 text-slate-500 hover:border-emerald-500/30"
    }`}
  >
    {icon}
    {label}
  </div>
);

const GaugeIcon = ({ size }: any) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 14 4-4" />
    <path d="M3.34 19a10 10 0 1 1 17.32 0" />
  </svg>
);
