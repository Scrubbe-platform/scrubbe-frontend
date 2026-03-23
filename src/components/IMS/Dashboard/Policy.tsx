import React from "react";
import { Search, Shield, Bell, LayoutGrid } from "lucide-react";

// --- Types ---
type PolicyStatus = "Success" | "Blocked" | "Warning";

interface PolicyItem {
  title: string;
  description: string;
  status: PolicyStatus;
}

// --- Sub-Components ---
const StatCard = ({
  label,
  value,
  sub,
  colorClass,
}: {
  label: string;
  value: number | string;
  sub: string;
  colorClass: string;
}) => (
  <div className="bg-darkEzra border border-white/30 p-5 rounded-xl flex flex-col justify-between min-h-[140px]">
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
      {label}
    </span>
    <div className={`text-4xl font-bold tracking-tighter ${colorClass}`}>
      {value}
    </div>
    <div className="text-[11px] text-slate-500 font-medium">{sub}</div>
  </div>
);

const PolicyRow = ({ title, description, status }: PolicyItem) => (
  <div className="flex items-center justify-between p-4 bg-darkEzra border border-white/30 rounded-xl hover:bg-white/[0.04] transition-all group">
    <div className="flex items-center gap-4">
      <div className="p-2.5 bg-white/5 rounded-lg border border-white/10 group-hover:border-white/20">
        <Shield size={18} className="text-slate-400" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-100">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">{description}</p>
      </div>
    </div>
    <span
      className={`px-4 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${
        status === "Success"
          ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
          : "text-rose-500 border-rose-500/20 bg-rose-500/5"
      }`}
    >
      {status}
    </span>
  </div>
);

// --- Main Dashboard ---
export default function Policy() {
  const policies: PolicyItem[] = [
    {
      title: "Destructive Action Approval Gate",
      description:
        "Requires senior engineer sign-off before executing any fix on payment, auth, or core infrastructure services. Blocks auto-remediation for P1 incidents.",
      status: "Success",
    },
    {
      title: "Auto-Rollback on Verification Failure",
      description:
        "Automatically triggers rollback if verification agent detects service degradation within 5 minutes of fix execution. Applies to all services.",
      status: "Success",
    },
    {
      title: "Change Freeze Window Enforcement",
      description:
        "Blocks all fix executions during Friday 17:00—Monday 09:00 UTC unless incident severity is P0. Overridable by on-call team lead with MFAn",
      status: "Success",
    },
    {
      title: "Rate Limiting — Fix Executions",
      description:
        "Maximum 3 fix executions per service per hour. Prevents runaway automation loops. Counters reset on the hour boundary.",
      status: "Blocked",
    },
  ];

  return (
    <main className="max-w-[1400px] mx-auto p-10 space-y-5">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-500 text-sm font-medium">
          Operations overview — last 24 hours
        </p>
      </header>

      {/* Top KPI Grid */}
      <section className="grid grid-cols-4 gap-6">
        <StatCard
          label="Active Policies"
          value={17}
          sub="Enforced on all agents"
          colorClass="text-cyan-400"
        />
        <StatCard
          label="Draft Policies"
          value={3}
          sub="Pending review"
          colorClass="text-emerald-500"
        />
        <StatCard
          label="Policy Triggers"
          value={94}
          sub="Last 7 days"
          colorClass="text-yellow-500"
        />
        <StatCard
          label="Violations"
          value={2}
          sub="Require manual review"
          colorClass="text-rose-500"
        />
      </section>

      {/* Remediation Policies List */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest opacity-60">
          Remediation Policies
        </h2>
        <div className="space-y-2">
          {policies.map((p, i) => (
            <PolicyRow key={i} {...p} />
          ))}
        </div>
      </section>
    </main>
  );
}
