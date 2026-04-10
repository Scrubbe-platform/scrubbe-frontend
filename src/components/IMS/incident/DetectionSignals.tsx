import React from "react";
import { GitBranch, BarChart3, Zap, Workflow } from "lucide-react";

// --- Types ---

interface DetectionSignal {
  id: string;
  source: string;
  subSource: string;
  content: string;
  timestamp: string;
  icon: React.ReactNode;
  iconColor: string;
}

// --- Sub-Components ---

const SignalCard = ({ signal }: { signal: DetectionSignal }) => (
  <div className="bg-darkEzra border border-white/5 rounded-xl p-4 flex gap-4 items-start hover:border-white/10 transition-all group">
    {/* Icon Container */}
    <div
      className={`
      w-12 h-12 rounded-lg border flex items-center justify-center shrink-0
      bg-opacity-10 transition-transform group-hover:scale-105
      ${signal.iconColor.replace("text", "border")}/30
      ${signal.iconColor.replace("text", "bg")}/10
    `}
    >
      <div className={signal.iconColor}>{signal.icon}</div>
    </div>

    {/* Content Area */}
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start mb-1">
        <p className="text-[11px] font-medium text-slate-500">
          {signal.source} <span className="mx-1 opacity-50">·</span>{" "}
          {signal.subSource}
        </p>
        <span className="text-[11px] font-mono text-slate-600 tabular-nums">
          {signal.timestamp}
        </span>
      </div>
      <h4 className="text-[15px] font-semibold text-slate-100 leading-snug tracking-tight ">
        {signal.content}
      </h4>
    </div>
  </div>
);

// --- Main Component ---

const DetectionSignals: React.FC = () => {
  const signals: DetectionSignal[] = [
    {
      id: "1",
      source: "GitHub Actions",
      subSource: "Pipeline #311",
      content:
        "Integration tests failed — 12 failures · timeout on db-core (eu-west-1) · commit 4f3a91c on main",
      timestamp: "14:32:01",
      icon: <GitBranch size={20} />,
      iconColor: "text-emerald-500",
    },
    {
      id: "2",
      source: "Prometheus",
      subSource: "Alertmanager",
      content:
        "db_core_connections_in_use: 100% of pool (50/50) for 11 seconds · checkout-service → db-core eu-west-1",
      timestamp: "14:32:01",
      icon: <BarChart3 size={20} />,
      iconColor: "text-amber-500",
    },
    {
      id: "3",
      source: "DataDog",
      subSource: "Monitor #2841",
      content:
        "checkout-service error_rate_5xx: 0.4% → 7.8% · latency_p95: 220ms → 1,450ms · deployment correlation detected",
      timestamp: "14:32:01",
      icon: <Zap size={20} />,
      iconColor: "text-red-500",
    },
    {
      id: "4",
      source: "Scrubbe",
      subSource: "Pattern Match",
      content:
        "Signal signature matches SI-0002310 (97%) and SI-0001870 (93%) — DB pool exhaustion class · Playbook RBK-17 activated",
      timestamp: "14:32:01",
      icon: <Workflow size={20} />,
      iconColor: "text-blue-500",
    },
  ];

  return (
    <div className="p-6">
      <div className="w-full bg-transparent flex flex-col gap-3 p-4 rounded-xl border border-white/20">
        <h2 className="text-[13px] font-bold text-slate-600 uppercase tracking-[0.15em] mb-2 px-1">
          Detection Signals
        </h2>

        <div className="flex flex-col gap-3">
          {signals.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetectionSignals;
