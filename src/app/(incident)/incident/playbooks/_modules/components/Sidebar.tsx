import React from "react";
import {
  AlertTriangle,
  RefreshCw,
  Database,
  Plus,
  Activity,
  Shield,
  CheckCircle2,
  Circle,
} from "lucide-react";

// --- Types ---

type PlaybookStatus = "warning" | "info" | "success" | "danger" | "default";

interface PlaybookItem {
  id: string;
  title: string;
  stage: number;
  service: string;
  icon: React.ReactNode;
  status: PlaybookStatus;
}

interface LegendItem {
  id: number;
  label: string;
  status: "completed" | "active" | "pending";
}

// --- Sub-Components ---

const StatusCard: React.FC<PlaybookItem> = ({
  title,
  stage,
  service,
  icon,
  status,
}) => {
  const statusStyles: Record<PlaybookStatus, string> = {
    warning: "border-amber-500/50 bg-amber-500/5",
    danger: "border-purple-500/30 bg-purple-500/5",
    success: "border-emerald-500/50 bg-emerald-500/5",
    info: "border-blue-500/30 bg-blue-500/5",
    default: "border-slate-700/50 bg-slate-800/20",
  };

  const badgeStyles: Record<PlaybookStatus, string> = {
    warning: "border-amber-500/40 text-amber-500",
    danger: "border-purple-500/40 text-purple-400",
    success: "border-emerald-500/40 text-emerald-500",
    info: "border-blue-500/40 text-blue-400",
    default: "border-slate-600 text-slate-400",
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:brightness-110 cursor-pointer ${statusStyles[status]}`}
    >
      <div
        className={`p-2 rounded-lg border flex items-center justify-center ${badgeStyles[status]}`}
      >
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        <div className="flex items-center gap-3">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${badgeStyles[status]}`}
          >
            Stage {stage}
          </span>
          <span className="text-xs text-slate-400 font-medium">{service}</span>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

const PlaybookSidebar: React.FC = () => {
  const playbooks: PlaybookItem[] = [
    {
      id: "1",
      title: "High API Error Rate",
      stage: 3,
      service: "payments-api",
      icon: <AlertTriangle size={18} />,
      status: "warning",
    },
    {
      id: "2",
      title: "Deployment Rollback",
      stage: 3,
      service: "all-services",
      icon: <RefreshCw size={18} />,
      status: "info",
    },
    {
      id: "3",
      title: "DB Connection Exhaustion",
      stage: 3,
      service: "postgres-primary",
      icon: <Database size={18} />,
      status: "success",
    },
    {
      id: "4",
      title: "Pod CrashLoop Recovery",
      stage: 3,
      service: "k8s-prod",
      icon: <Plus size={18} />,
      status: "warning",
    },
    {
      id: "5",
      title: "Cache Eviction Storm",
      stage: 3,
      service: "redis-cluster",
      icon: <Activity size={18} />,
      status: "success",
    },
    {
      id: "6",
      title: "Auth JWT Regression",
      stage: 2,
      service: "auth-service",
      icon: <Shield size={18} />,
      status: "danger",
    },
  ];

  const legends: LegendItem[] = [
    { id: 1, label: "Lifecycle Stages", status: "completed" },
    { id: 2, label: "Investigation Steps", status: "active" },
    { id: 3, label: "Remediation Options", status: "pending" },
    { id: 4, label: "Blast Radius Eval", status: "pending" },
    { id: 5, label: "Guardrail Check", status: "pending" },
    { id: 6, label: "Execution Gate", status: "pending" },
    { id: 7, label: "Audit Trail", status: "pending" },
  ];

  return (
    <div className="w-80 h-full flex flex-col p-6 gap-6 overflow-y-auto border-r border-white/5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Playbooks
        </h2>
        <div className="w-8 h-8 rounded border border-white/20 flex items-center justify-center text-xs font-bold text-white">
          3
        </div>
      </div>

      {/* Playbook List */}
      <div className="flex flex-col gap-3">
        {playbooks.map((pb) => (
          <StatusCard key={pb.id} {...pb} />
        ))}
      </div>

      <hr className="border-white/5 my-2" />

      {/* Legend Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-slate-200">Legend</h3>
        <div className="flex flex-col gap-3">
          {legends.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between group cursor-default"
            >
              <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
                {item.id}. {item.label}
              </span>
              {item.status === "completed" && (
                <CheckCircle2 size={16} className="text-emerald-500" />
              )}
              {item.status === "active" && (
                <div className="relative flex items-center justify-center">
                  <Circle size={16} className="text-green-400" />
                  <div className="absolute w-1.5 h-1.5 rounded-full bg-green-400" />
                </div>
              )}
              {item.status === "pending" && (
                <Circle size={16} className="text-slate-700" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlaybookSidebar;
