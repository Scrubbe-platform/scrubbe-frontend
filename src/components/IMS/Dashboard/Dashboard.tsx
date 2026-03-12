import React from "react";
import {
  BarChart3,
  Settings,
  CheckCircle2,
  ShieldAlert,
  Search,
  Zap,
  Star,
  CheckSquare,
} from "lucide-react";

// --- Type Definitions ---

interface DashboardStat {
  label: string;
  value: string | number;
  subText: string;
  valueColor?: string;
}

interface ActivityAgent {
  icon: React.ReactNode;
  name: string;
  status: string;
  incident: string;
  progress: number;
  color: string;
}

interface ExecutionItem {
  id: string;
  title: string;
  meta: string;
  status: "Success" | "Blocked" | "Failed";
}

// --- Main Component ---

export default function Dashboard() {
  const stats: DashboardStat[] = [
    {
      label: "Total Incidents",
      value: 17,
      subText: "All severities • 24h",
      valueColor: "text-cyan-400",
    },
    {
      label: "Auto-Remediated",
      value: 8,
      subText: "47% automation rate",
      valueColor: "text-green",
    },
    {
      label: "Avg MTTR",
      value: "19m",
      subText: "-31% vs last week",
      valueColor: "text-yellow-500",
    },
    {
      label: "Policy Violations",
      value: 2,
      subText: "Require manual review",
      valueColor: "text-rose-500",
    },
  ];

  const agents: ActivityAgent[] = [
    {
      icon: <Zap size={14} className="text-green-500" />,
      name: "Root Cause Agent",
      status: "Running",
      incident: "INC-2041",
      progress: 85,
      color: "bg-green",
    },
    {
      icon: <Star size={14} className="text-cyan-400" />,
      name: "Fix Generator",
      status: "Running",
      incident: "INC-2040",
      progress: 62,
      color: "bg-cyan-400",
    },
    {
      icon: <CheckSquare size={14} className="text-yellow-500" />,
      name: "Verification Agent",
      status: "Queued",
      incident: "INC-2039",
      progress: 68,
      color: "bg-yellow-500",
    },
  ];

  const executions: ExecutionItem[] = [
    {
      id: "INC-2036",
      title: "Execute Fix — db-proxy connection poolcy",
      meta: "@mike • 14:31 UTC • Policy validated",
      status: "Success",
    },
    {
      id: "INC-2035",
      title: "Rollback Fix — auth-api rate limiter",
      meta: "@sarah • 13:14 UTC • Manual approval",
      status: "Success",
    },
    {
      id: "INC-2037",
      title: "Execute Fix — search index rebuild",
      meta: "System • 12:22 UTC • Auto-remediation",
      status: "Success",
    },
    {
      id: "INC-2038",
      title: "Analytics Pipeline Backlog — 6hr queue depth",
      meta: "P3 • analytics-pipeline • Started 6h ago",
      status: "Blocked",
    },
  ];

  return (
    <main className="max-w-[1400px] mx-auto p-10 space-y-12">
      <header>
        <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-500 text-sm font-medium">
          Operations overview — last 24 hours
        </p>
      </header>

      {/* Top Stats Grid */}
      <section className="grid grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-darkEzra border border-white/30 p-6 rounded-xl space-y-2"
          >
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {stat.label}
            </span>
            <div
              className={`text-3xl font-bold tracking-tighter ${stat.valueColor}`}
            >
              {stat.value}
            </div>
            <div className="text-[11px] font-medium text-slate-500">
              {stat.subText}
            </div>
          </div>
        ))}
      </section>

      {/* Recent Activity (Agents) */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest opacity-60">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {agents.map((agent, i) => (
            <div
              key={i}
              className="bg-darkEzra border border-white/30 rounded-xl overflow-hidden p-4 space-y-3"
            >
              <div className=" flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                  {agent.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{agent.name}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-tight text-slate-500">
                    <span className={agent.color.replace("bg-", "text-")}>
                      {agent.status}
                    </span>{" "}
                    — {agent.incident}
                  </p>
                </div>
              </div>
              <div className="h-1.5 w-full bg-white/5 relative">
                <div
                  className={`absolute inset-y-0 left-0 ${agent.color} transition-all duration-1000`}
                  style={{ width: `${agent.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Executions */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest opacity-60">
          Recent Executions
        </h2>
        <div className="space-y-2">
          {executions.map((exec, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-darkEzra border border-white/30 rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-2 h-2 rounded-full ${
                    exec.status === "Blocked" ? "bg-rose-500" : "bg-yellow-500"
                  }`}
                />
                <div>
                  <h3 className="text-sm font-bold text-white">{exec.title}</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    <span className="uppercase">{exec.id}</span> • {exec.meta}
                  </p>
                </div>
              </div>
              <div
                className={`px-4 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${
                  exec.status === "Success"
                    ? "text-green border-green/30 bg-green/5"
                    : "text-rose-500 border-rose-500/30 bg-rose-500/5"
                }`}
              >
                {exec.status}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
