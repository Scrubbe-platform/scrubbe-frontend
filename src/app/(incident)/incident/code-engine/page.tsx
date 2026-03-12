import React from "react";
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
} from "lucide-react";
import CodeEngineRecommendation from "./_modules/components/code-engine-recommendation";

export default function IncidentOverview() {
  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-300 p-6 font-sans selection:bg-cyan-500/30">
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
            <ActiveIncidentCard
              id="INC-311"
              priority="P1"
              title="Checkout-Service Deployment failed"
              active
            />
            <ActiveIncidentCard
              id="INC-305"
              priority="P2"
              title="auth-service latency spike"
            />
            <ActiveIncidentCard
              id="INC-208"
              priority="P3"
              title="Scheduled Maintenance Window"
            />
          </div>

          <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-bold hover:bg-cyan-500/10 transition-all">
            <Layout size={14} /> View Pipeline #311
          </button>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 space-y-6">
          {/* TOP HEADER */}
          <section className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-white italic tracking-tighter">
                  INC-311
                </h1>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-500 text-[10px] font-black uppercase border border-rose-500/30">
                  P1 • Investigating
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                checkout-service failed integration tests due to DB pool
                exhaustion
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-xs font-bold transition-all">
                <Bell size={14} /> Notify
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 text-black text-xs font-black transition-all hover:bg-cyan-300">
                <Share2 size={14} /> Declare Incident
              </button>
            </div>
          </section>

          {/* KPI GRID */}
          <section className="grid grid-cols-4 gap-px bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
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
              subIcon={<Activity size={12} />}
            />
          </section>

          {/* SCRUBBE INSIGHT (PURPLE) */}
          <section className="p-5 rounded-2xl border border-purple-500/30 bg-purple-500/5 space-y-3">
            <div className="flex items-center gap-2 text-purple-400">
              <Zap size={16} fill="currentColor" />
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
              icon={<GaugeIcon size={16} />}
              title="SLO & error budget"
              desc="This failure consumes ~7% of the remaining monthly error budget for checkout-service."
            />
            <InfoCard
              icon={<Database size={16} />}
              title="Blast radius snapshot"
              desc="Impacted: checkout-service -> db-core in eu-west-1. No evidence of cross-region spread yet."
            />
            <InfoCard
              icon={<Terminal size={16} />}
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
            <div className="grid grid-cols-5 gap-2">
              <FixTag label="Diff-based meaning" />
              <FixTag label="Pattern matching" />
              <FixTag label="Logs / Context" />
              <FixTag label="Env guardrails" />
              <FixTag label="Workflow" />
              <FixTag label="Remediation" active />
              <FixTag label="Tooling" />
              <FixTag label="Rationale" />
              <FixTag label="Approval" />
              <FixTag label="SLO Impact" />
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
                "Review retry configuration",
                "Check recent config changes",
                "Use Magic Insight timeline",
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
    </div>
  );
}

// Sub-components
const ActiveIncidentCard = ({
  id,
  priority,
  title,
  active = false,
}: {
  id: string;
  priority: string;
  title: string;
  active?: boolean;
}) => (
  <div
    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
      active
        ? "bg-white/[0.04] border-white/20 ring-1 ring-white/10 shadow-2xl"
        : "bg-transparent border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
    }`}
  >
    <div className="flex justify-between items-start mb-2">
      <span className="text-[10px] font-black text-slate-500 tracking-tighter">
        {id}
      </span>
      <span
        className={`px-1.5 py-0.5 rounded text-[8px] font-black border ${
          priority === "P1"
            ? "bg-rose-500/10 text-rose-500 border-rose-500/30"
            : "bg-amber-500/10 text-amber-500 border-amber-500/30"
        }`}
      >
        {priority}
      </span>
    </div>
    <h3 className="text-[11px] font-bold text-white leading-snug">{title}</h3>
    <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold tracking-widest">
      eu-west-1 • 23m ago
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
  <div className="bg-[#0d1425] p-5 flex flex-col justify-between">
    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-4">
      {label}
    </span>
    <div className="space-y-1">
      <div
        className={`text-lg font-black italic tracking-tighter ${valueClass}`}
      >
        {value}
      </div>
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

const InfoCard = ({ icon, title, desc }: any) => (
  <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] space-y-3">
    <div className="flex items-center gap-2 text-slate-400">
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
}: {
  label: string;
  active?: boolean;
}) => (
  <div
    className={`px-3 py-1.5 rounded-lg border text-[9px] font-bold text-center transition-all cursor-pointer ${
      active
        ? "bg-emerald-500/20 border-emerald-400 text-emerald-400"
        : "bg-white/5 border-white/10 text-slate-500 hover:border-emerald-500/30"
    }`}
  >
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
