/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { Zap, Star, CheckSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { formatTime } from "@/lib/utils";

type DashboardMetrics = {
  totalIncidents: number;
  openIncidents: number;
  resolvedIncidents: number;
  autoRemediated: number;
  automationRate: number;
  avgMTTR: number;
  avgMTTA: number;
  slaCompliance: number;
  policyViolations: number;
};

type RecentExecution = {
  id: string;
  ticketId: string;
  title: string;
  status: string;
  createdAt: string;
  owner?: string;
  source?: string;
};

type Analytics = {
  recentExecutions?: RecentExecution[];
  [key: string]: any;
};

const statusColor = (s: string) =>
  s === "Success" || s === "RESOLVED"
    ? "text-green border-green/30 bg-green/5"
    : s === "Blocked" || s === "BLOCKED"
    ? "text-rose-500 border-rose-500/30 bg-rose-500/5"
    : "text-yellow-500 border-yellow-500/30 bg-yellow-500/5";

export default function Dashboard() {
  const { get } = useFetch();

  const { data: metrics, isLoading: loadingMetrics } = useQuery<DashboardMetrics>({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const res = await get(endpoint.dashboard.get_metrics);
      if (res.success) return res.data?.data ?? res.data ?? {};
      return {} as DashboardMetrics;
    },
    refetchOnWindowFocus: false,
    refetchInterval: 60000,
  });

  const { data: analytics, isLoading: loadingAnalytics } = useQuery<Analytics>({
    queryKey: ["dashboard-analytics"],
    queryFn: async () => {
      const res = await get(endpoint.dashboard.get_analytics);
      if (res.success) return res.data?.data ?? res.data ?? {};
      return {} as Analytics;
    },
    refetchOnWindowFocus: false,
    refetchInterval: 60000,
  });

  const stats = [
    {
      label: "Total Incidents",
      value: loadingMetrics ? "—" : (metrics?.totalIncidents ?? 0),
      subText: "All severities • 24h",
      valueColor: "text-cyan-400",
    },
    {
      label: "Auto-Remediated",
      value: loadingMetrics ? "—" : (metrics?.autoRemediated ?? 0),
      subText: metrics?.automationRate != null ? `${metrics.automationRate}% automation rate` : "—",
      valueColor: "text-green",
    },
    {
      label: "Avg MTTR",
      value: loadingMetrics ? "—" : (metrics?.avgMTTR != null ? formatTime(metrics.avgMTTR) : "—"),
      subText: `SLA compliance: ${metrics?.slaCompliance ?? "—"}%`,
      valueColor: "text-yellow-500",
    },
    {
      label: "Policy Violations",
      value: loadingMetrics ? "—" : (metrics?.policyViolations ?? 0),
      subText: "Require manual review",
      valueColor: "text-rose-500",
    },
  ];

  const executions: RecentExecution[] = analytics?.recentExecutions ?? [];

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
            <div className={`text-3xl font-bold tracking-tighter ${stat.valueColor}`}>
              {stat.value}
            </div>
            <div className="text-[11px] font-medium text-slate-500">
              {stat.subText}
            </div>
          </div>
        ))}
      </section>

      {/* Open Incidents Summary */}
      {metrics && (
        <section className="grid grid-cols-3 gap-6">
          <div className="bg-darkEzra border border-white/30 p-6 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Open Incidents</span>
            <div className="text-3xl font-bold text-rose-400">{metrics.openIncidents ?? 0}</div>
            <div className="text-[11px] text-slate-500">Active right now</div>
          </div>
          <div className="bg-darkEzra border border-white/30 p-6 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resolved</span>
            <div className="text-3xl font-bold text-emerald-400">{metrics.resolvedIncidents ?? 0}</div>
            <div className="text-[11px] text-slate-500">Last 24 hours</div>
          </div>
          <div className="bg-darkEzra border border-white/30 p-6 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg MTTA</span>
            <div className="text-3xl font-bold text-cyan-400">
              {metrics.avgMTTA != null ? formatTime(metrics.avgMTTA) : "—"}
            </div>
            <div className="text-[11px] text-slate-500">Mean time to acknowledge</div>
          </div>
        </section>
      )}

      {/* Recent Executions */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest opacity-60">
          Recent Executions
        </h2>
        {loadingAnalytics && (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-darkEzra border border-white/10 rounded-xl animate-pulse" />
            ))}
          </div>
        )}
        {!loadingAnalytics && executions.length === 0 && (
          <div className="text-center py-10 text-slate-500 text-sm border border-white/10 rounded-xl bg-darkEzra">
            No recent executions. Incidents will appear here as they are processed.
          </div>
        )}
        <div className="space-y-2">
          {executions.map((exec, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-darkEzra border border-white/30 rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-2 h-2 rounded-full ${
                    exec.status === "RESOLVED" ? "bg-green" :
                    exec.status === "OPEN" ? "bg-rose-500" : "bg-yellow-500"
                  }`}
                />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {exec.title ?? exec.ticketId}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    <span className="uppercase">{exec.ticketId}</span>
                    {exec.owner && ` • @${exec.owner}`}
                    {exec.source && ` • ${exec.source}`}
                  </p>
                </div>
              </div>
              <div
                className={`px-4 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${statusColor(exec.status)}`}
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
