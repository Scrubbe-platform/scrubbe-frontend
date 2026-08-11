"use client";

import React, { useEffect, useState } from "react";
import { useDashboardMetrics } from "@/hooks/useImsData";
import { customAxios } from "@/lib/api/axios";
import { endpoint } from "@/lib/api/endpoint";

type IncidentStatus = "Active" | "Investigating" | "Monitoring" | "Resolved" | "OPEN" | "CLOSED" | "MITIGATED";

interface IncidentItem {
  id: string;
  ticketId?: string;
  title: string;
  subtitle: string;
  status: IncidentStatus;
  severity?: string;
}

interface StatCardProps {
  label: string;
  value: string | number;
  subValue: string;
  colorClass: string;
}

function mapStatus(raw: string): IncidentStatus {
  const s = (raw ?? "").toUpperCase();
  if (s === "OPEN" || s === "ACTIVE") return "Active";
  if (s === "INVESTIGATING") return "Investigating";
  if (s === "MITIGATED" || s === "MONITORING") return "Monitoring";
  if (s === "RESOLVED" || s === "CLOSED") return "Resolved";
  return "Investigating";
}

function buildSubtitle(inc: any): string {
  const parts: string[] = [];
  if (inc.severity) parts.push(inc.severity);
  if (inc.affectedSystem) parts.push(inc.affectedSystem);
  if (inc.assignedTo) parts.push(`@${inc.assignedTo}`);
  if (inc.createdAt) {
    const diff = Math.round((Date.now() - new Date(inc.createdAt).getTime()) / 60000);
    if (diff < 60) parts.push(`${diff}m ago`);
    else parts.push(`${Math.round(diff / 60)}h ago`);
  }
  return parts.join(" • ") || "No additional details";
}

const Incidents = () => {
  const { data: metrics, loading: metricsLoading } = useDashboardMetrics();
  const [allIncidents, setAllIncidents] = useState<IncidentItem[]>([]);
  const [incLoading, setIncLoading] = useState(true);

  useEffect(() => {
    customAxios
      .get(endpoint.incident_ticket.get)
      .then((res) => {
        const list: any[] = res.data?.data ?? res.data ?? [];
        setAllIncidents(
          list.map((inc: any) => ({
            id: inc.ticketId ?? inc.id,
            title: inc.title ?? inc.summary ?? "Untitled incident",
            subtitle: buildSubtitle(inc),
            status: mapStatus(inc.status),
            severity: inc.severity,
          }))
        );
      })
      .catch(() => setAllIncidents([]))
      .finally(() => setIncLoading(false));
  }, []);

  const activeIncidents = allIncidents.filter(
    (i) => i.status === "Active" || i.status === "Investigating" || i.status === "Monitoring"
  );
  const resolvedIncidents = allIncidents.filter(
    (i) => i.status === "Resolved"
  );

  const p1Count = metrics?.p1Count ?? metrics?.bySeverity?.["P1"] ?? (metricsLoading ? "…" : "—");
  const mttr = metrics?.avgMttr ?? (metricsLoading ? "…" : "—");
  const resolvedToday = metrics?.resolvedToday ?? (metricsLoading ? "…" : "—");
  const agentCount = metrics?.activeAgents ?? (metricsLoading ? "…" : "—");

  return (
    <main className="max-w-[1400px] mx-auto p-10 space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-white">Incidents</h1>
        <p className="text-slate-500 text-sm font-medium">
          Active, investigating &amp; recently resolved incidents
        </p>
      </header>

      {/* Top KPI Cards */}
      <section className="grid grid-cols-4 gap-6">
        <StatCard
          label="P1 Active"
          value={p1Count}
          subValue="Highest severity"
          colorClass="text-rose-500"
        />
        <StatCard
          label="MTTR (7d)"
          value={mttr}
          subValue="Mean time to resolve"
          colorClass="text-yellow-500"
        />
        <StatCard
          label="Resolved Today"
          value={resolvedToday}
          subValue="Closed this calendar day"
          colorClass="text-green-500"
        />
        <StatCard
          label="Agents Running"
          value={agentCount}
          subValue="AI agents active now"
          colorClass="text-green-400"
        />
      </section>

      {/* Active Incidents List */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest opacity-60">
          Active Incidents
        </h2>
        <div className="space-y-2">
          {incLoading ? (
            <div className="text-slate-500 text-sm p-4">Loading incidents…</div>
          ) : activeIncidents.length === 0 ? (
            <div className="text-slate-500 text-sm p-4">No active incidents.</div>
          ) : (
            activeIncidents.map((incident) => (
              <IncidentRow key={incident.id} {...incident} />
            ))
          )}
        </div>
      </section>

      {/* Recently Resolved List */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest opacity-60">
          Recently Resolved
        </h2>
        <div className="space-y-2">
          {resolvedIncidents.length === 0 ? (
            <div className="text-slate-500 text-sm p-4">No resolved incidents today.</div>
          ) : (
            resolvedIncidents.slice(0, 5).map((incident) => (
              <IncidentRow key={incident.id} {...incident} />
            ))
          )}
        </div>
      </section>
    </main>
  );
};

export default Incidents;

const StatCard = ({ label, value, subValue, colorClass }: StatCardProps) => (
  <div className="bg-darkEzra border border-white/30 p-6 rounded-xl space-y-2">
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
      {label}
    </span>
    <div className={`text-3xl font-bold tracking-tighter ${colorClass}`}>
      {value}
    </div>
    <div className="text-[11px] font-medium text-slate-500">{subValue}</div>
  </div>
);

const IncidentRow = ({ id, title, subtitle, status }: IncidentItem) => {
  const displayStatus = mapStatus(status as string);

  const statusStyles: Record<string, string> = {
    Active: "text-rose-500 border-rose-500/30 bg-rose-500/5",
    Investigating: "text-yellow-500 border-yellow-500/30 bg-yellow-500/5",
    Monitoring: "text-amber-500 border-amber-500/30 bg-amber-500/5",
    Resolved: "text-green-500 border-green-500/30 bg-green-500/5",
  };

  const dotColors: Record<string, string> = {
    Active: "bg-rose-500",
    Investigating: "bg-yellow-500",
    Monitoring: "bg-amber-500",
    Resolved: "bg-green-500",
  };

  return (
    <div className="group flex items-center justify-between p-4 bg-darkEzra border border-white/30 rounded-xl hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer">
      <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full ${dotColors[displayStatus] ?? "bg-slate-500"}`} />
        <div>
          <h3 className="text-sm font-bold text-white leading-relaxed">{title}</h3>
          <p className="text-[11px] text-slate-500 font-medium">
            <span className="uppercase">{id}</span> • {subtitle}
          </p>
        </div>
      </div>
      <div
        className={`px-4 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${statusStyles[displayStatus] ?? "text-slate-400 border-slate-500/30"}`}
      >
        {displayStatus}
      </div>
    </div>
  );
};
