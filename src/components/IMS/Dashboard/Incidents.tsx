import React from "react";

type IncidentStatus = "Active" | "Investigating" | "Monitoring" | "Resolved";

interface IncidentItem {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  status: IncidentStatus;
}

interface StatCardProps {
  label: string;
  value: string | number;
  subValue: string;
  colorClass: string;
}

const Incidents = () => {
  const activeIncidents: IncidentItem[] = [
    {
      id: "INC-2041",
      title: "Payment Gateway Timeout — checkout-svc elevated latency",
      subtitle: "P1 • payment-svc • Started 23min ago • @sarah",
      meta: "",
      status: "Active",
    },
    {
      id: "INC-2040",
      title: "Auth Service 5xx Spike — login failure rate 18%",
      subtitle: "P1 • auth-api • Started 1h 4min ago • @mike",
      meta: "",
      status: "Investigating",
    },
    {
      id: "INC-2039",
      title: "Notification Delivery Lag — push delay >90s",
      subtitle: "P2 • notif-worker • RCA agent running",
      meta: "",
      status: "Investigating",
    },
    {
      id: "INC-2038",
      title: "Analytics Pipeline Backlog — 6hr queue depth",
      subtitle: "P3 • analytics-pipeline • Started 6h ago",
      meta: "",
      status: "Monitoring",
    },
  ];

  const resolvedIncidents: IncidentItem[] = [
    {
      id: "INC-2037",
      title: "Search Index Stale — product search returning outdated results",
      subtitle: "P2 • search-svc • Auto-remediated in 4m 12s",
      meta: "",
      status: "Resolved",
    },
    {
      id: "INC-2037-2",
      title: "Search Index Stale — product search returning outdated results",
      subtitle: "P2 • search-svc • Auto-remediated in 4m 12s",
      meta: "",
      status: "Resolved",
    },
  ];

  return (
    <main className="max-w-[1400px] mx-auto p-10 space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-white">Incidents</h1>
        <p className="text-slate-500 text-sm font-medium">
          Active, investigating & recently resolved incidents
        </p>
      </header>

      {/* Top KPI Cards */}
      <section className="grid grid-cols-4 gap-6">
        <StatCard
          label="P1 Active"
          value="3"
          subValue="+2 from yesterday"
          colorClass="text-rose-500"
        />
        <StatCard
          label="MTTR (7d)"
          value="24m"
          subValue="-8m improvement"
          colorClass="text-yellow-500"
        />
        <StatCard
          label="Resolved Today"
          value="11"
          subValue="2 auto-remediated"
          colorClass="text-green-500"
        />
        <StatCard
          label="Agents Running"
          value="4"
          subValue="2 RCA • 1 fix • 1 verify"
          colorClass="text-green-400"
        />
      </section>

      {/* Active Incidents List */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest opacity-60">
          Active Incidents
        </h2>
        <div className="space-y-2">
          {activeIncidents.map((incident) => (
            <IncidentRow key={incident.id} {...incident} />
          ))}
        </div>
      </section>

      {/* Recently Resolved List */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest opacity-60">
          Recently Resolved
        </h2>
        <div className="space-y-2">
          {resolvedIncidents.map((incident) => (
            <IncidentRow key={incident.id} {...incident} />
          ))}
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
  const statusStyles: Record<IncidentStatus, string> = {
    Active: "text-rose-500 border-rose-500/30 bg-rose-500/5",
    Investigating: "text-yellow-500 border-yellow-500/30 bg-yellow-500/5",
    Monitoring: "text-amber-500 border-amber-500/30 bg-amber-500/5",
    Resolved: "text-green-500 border-green-500/30 bg-green-500/5",
  };

  const dotColors: Record<IncidentStatus, string> = {
    Active: "bg-rose-500",
    Investigating: "bg-yellow-500",
    Monitoring: "bg-rose-500", // Matches your screenshot's color for monitoring
    Resolved: "bg-green-500",
  };

  return (
    <div className="group flex items-center justify-between p-4 bg-darkEzra border border-white/30 rounded-xl hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer">
      <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full ${dotColors[status]}`} />
        <div>
          <h3 className="text-sm font-bold text-white leading-relaxed">
            {title}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            <span className="uppercase">{id}</span> • {subtitle}
          </p>
        </div>
      </div>
      <div
        className={`px-4 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${statusStyles[status]}`}
      >
        {status}
      </div>
    </div>
  );
};
