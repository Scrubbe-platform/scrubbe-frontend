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
    { id: "context", label: "Context", link: `?tab=context` },
  ];

  // useEffect(() => {
  //   // Only auto-redirect if there is no tab currently set
  //   if (!currentTab) {
  //     router.replace(`${pathname}?tab=overview`);
  //   }
  // }, [currentTab, pathname, router]);

  return (
    <div className="w-full text-white p-4 md:p-6 flex flex-col gap-6 md:gap-8 border-b border-white/5">
      {/* 1. Top Bar: Stats - Scrollable on mobile */}
      <div className="flex overflow-x-auto no-scrollbar pb-2 md:pb-0 gap-2 items-center justify-between">
        <div className="flex gap-2 shrink-0">
          <StatBadge label="3 Active" color="orange" />
          <StatBadge label="2 Investigating" color="yellow" />
          <StatBadge label="2 resolved" color="green" />
        </div>
      </div>

      {/* 2. Main Incident Info */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight shrink-0">
                SI-0003070
              </h1>

              {/* Badges Container */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="blue">Kubernetes</Badge>
                <Badge variant="red">P1 · Critical</Badge>
                <div className="flex items-center border border-orange-500/50 rounded px-2 py-0.5 bg-orange-500/5">
                  <span className="text-[10px] text-orange-400 uppercase font-black mr-2">
                    Elapsed
                  </span>
                  <span className="text-xs font-mono font-bold text-orange-400">
                    19 : 35
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Stacked on mobile, side-by-side on desktop */}
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-4 text-xs py-2.5 rounded-lg border border-green-500/50 text-green-400 font-bold hover:bg-green-500/5 transition-all">
              Add Context
            </button>
            <button className="flex-1 md:flex-none px-4 text-xs py-2.5 rounded-lg border border-green-500/50 text-green-400 font-bold hover:bg-green-500/5 transition-all">
              War Room
            </button>
          </div>
        </div>

        {/* Title - Smaller text on mobile */}
        <h2 className="text-lg md:text-2xl font-bold text-slate-100 leading-tight">
          auth-service pod CrashLoopBackOff — OOMKilled after 14 restarts in
          eu-west-1
        </h2>

        {/* 3. Metadata Tags - flex-wrap ensures they wrap correctly */}
        <div className="flex flex-wrap gap-2">
          <MetaTag variant="blue">checkout-service</MetaTag>
          <MetaTag variant="orange">eu-west-1</MetaTag>
          <MetaTag variant="blue">Pipeline #31</MetaTag>
          <MetaTag variant="orange">94% match</MetaTag>
        </div>
      </div>

      {/* 4. Navigation Tabs - Horizontal Scroll with no scrollbar */}
      <nav className="flex overflow-x-auto no-scrollbar gap-8 md:gap-12 relative border-b border-white/20 -mx-4 px-4 md:mx-0 md:px-0">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.link}
            className="relative cursor-pointer group pb-3 shrink-0"
          >
            <span
              className={`text-sm font-medium transition-colors whitespace-nowrap ${
                currentTab === tab.id
                  ? "text-green-400"
                  : "text-slate-500 group-hover:text-slate-200"
              }`}
            >
              {tab.label}
            </span>

            {currentTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
};

// --- Sub-components (Updated for better mobile sizing) ---

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
      className={`px-3 py-1 rounded-md border text-[10px] md:text-xs font-bold whitespace-nowrap ${colors[color]}`}
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
    blue: "border-green-500/30 text-green-400 bg-green-400/5",
    red: "border-red-500/30 text-red-500 bg-red-500/5",
    orange: "border-orange-500/30 text-orange-500 bg-orange-500/5",
  };
  return (
    <span
      className={`px-2 py-1 rounded border text-[10px] font-bold whitespace-nowrap ${styles[variant]}`}
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
    blue: "border-green-500/30 text-green-400",
    orange: "border-orange-500/30 text-orange-400",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded border text-[10px] font-medium bg-white/[0.02] whitespace-nowrap ${styles[variant]}`}
    >
      {children}
    </span>
  );
};

export default IncidentHeader;
