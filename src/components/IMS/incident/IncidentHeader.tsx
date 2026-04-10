"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

interface TabItem {
  id: string;
  label: string;
  link: string;
}
const IncidentHeader = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeId = searchParams.get("id");
  const currentTab = searchParams.get("tab");
  const pathname = usePathname();

  const tabs: TabItem[] = [
    { id: "overview", label: "Overview", link: "?tab=overview" },
    {
      id: "signal-graph",
      label: "Signal graph",
      link: `signal-graph?id=${activeId}`,
    },
    {
      id: "code-engine",
      label: "Code Engine",
      link: `code-engine?id=${activeId}`,
    },
    {
      id: "delivery",
      label: "Incident Delivery",
      link: `delivery?id=${activeId}`,
    },
    {
      id: "playbook",
      label: "Playbook. RBK.17",
      link: `playbooks?id=${activeId}`,
    },
    {
      id: "context",
      label: "Context",
      link: `?tab=context`,
    },
  ];

  useEffect(() => {
    router.replace(`${pathname}?tab=overview`);
  }, []);

  return (
    <div className="w-full text-white p-6 flex flex-col gap-8 border-b border-white/5">
      {/* 1. Top Bar: Stats and Primary Action */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <StatBadge label="3 Active" color="orange" />
          <StatBadge label="2 Investigating" color="yellow" />
          <StatBadge label="2 resolved today" color="green" />
        </div>
        {/* <button className="bg-[#22d3ee] hover:bg-[#06b6d4] text-[#030712] px-4 py-1 text-sm rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]">
          Raise an Incident
        </button> */}
      </div>

      {/* 2. Main Incident Info */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">SI-0003070</h1>

            <div className="flex gap-2">
              <Badge variant="blue">Auto-detected · Kubernetes</Badge>
              <Badge variant="red">P1 · Critical</Badge>
              <Badge variant="orange">Investigating</Badge>

              <div className="flex flex-col items-center border border-orange-500/50 rounded px-3 py-0.5 bg-orange-500/5">
                <span className="text-xs text-orange-400 uppercase font-bold tracking-tighter">
                  Elapsed
                </span>
                <span className="text-sm font-mono font-bold text-orange-400">
                  19 : 35
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 ml-auto">
            <button className="px-3 text-sm py-2 rounded-lg border border-cyan-500/50 text-cyan-400 font-semibold hover:bg-cyan-500/5 transition-all">
              Add Context
            </button>
            <button className="px-3 text-sm py-2 rounded-lg border border-cyan-500/50 text-cyan-400 font-semibold hover:bg-cyan-500/5 transition-all">
              Declare War Room
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-100">
          auth-service pod CrashLoopBackOff — OOMKilled after 14 restarts in
          eu-west-1
        </h2>

        {/* 3. Metadata Tags */}
        <div className="flex flex-wrap gap-2">
          <MetaTag variant="blue">checkout-service</MetaTag>
          <MetaTag variant="orange">eu-west-1</MetaTag>
          <MetaTag variant="blue">18m elapsed</MetaTag>
          <MetaTag variant="blue">Pipeline #31</MetaTag>
          <MetaTag variant="orange">94% match confidence</MetaTag>
          <MetaTag variant="orange">EAL: Assisted</MetaTag>
          <MetaTag variant="orange">1 service affected</MetaTag>
        </div>
      </div>

      {/* 4. Navigation Tabs */}
      <nav className="flex gap-12 mt-4 relative border-b border-white/20">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.link}
            className="relative cursor-pointer group pb-2"
          >
            <span
              className={`text-sm font-medium transition-colors ${
                currentTab === tab.id
                  ? "text-cyan-400"
                  : "text-slate-400 group-hover:text-slate-200"
              }`}
            >
              {tab.label}
            </span>

            {currentTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
};

// --- Sub-components ---

const StatBadge = ({
  label,
  color,
}: {
  label: string;
  color: "orange" | "yellow" | "green";
}) => {
  const colors = {
    orange: "border-orange-900/50 text-orange-500 bg-orange-500/5",
    yellow: "border-yellow-900/50 text-yellow-600 bg-yellow-600/5",
    green: "border-emerald-900/50 text-emerald-500 bg-emerald-500/5",
  };
  return (
    <div
      className={`px-4 py-1.5 rounded-lg border text-xs font-medium ${colors[color]}`}
    >
      {label}
    </div>
  );
};

const Badge = ({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "blue" | "red" | "orange";
}) => {
  const styles = {
    blue: "border-cyan-500/30 text-cyan-400 bg-cyan-400/5",
    red: "border-red-500/30 text-red-500 bg-red-500/5",
    orange: "border-orange-500/30 text-orange-500 bg-orange-500/5",
  };
  return (
    <span
      className={`px-2 py-1.5 rounded border text-xs font-bold ${styles[variant]}`}
    >
      {children}
    </span>
  );
};

const MetaTag = ({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "blue" | "orange";
}) => {
  const styles = {
    blue: "border-cyan-500/30 text-cyan-400",
    orange: "border-orange-500/30 text-orange-400",
  };
  return (
    <span
      className={`px-3 py-1 rounded-md border text-xs font-medium bg-white/[0.02] ${styles[variant]}`}
    >
      {children}
    </span>
  );
};

const Tab = ({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) => (
  <div className="relative cursor-pointer group pb-2">
    <span
      className={`text-sm font-medium transition-colors ${
        active ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"
      }`}
    >
      {label}
    </span>
    {active && (
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
    )}
  </div>
);

export default IncidentHeader;
