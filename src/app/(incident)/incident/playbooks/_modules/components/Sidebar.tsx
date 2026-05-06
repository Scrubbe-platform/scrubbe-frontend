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
import { IncidentDetailRecord } from "@/lib/incident/incident.types";

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
      className={`cursor-pointer rounded-xl border p-4 transition-all hover:brightness-110 ${statusStyles[status]}`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex items-center justify-center rounded-lg border p-2 ${badgeStyles[status]}`}
        >
          {icon}
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          <div className="flex items-center gap-3">
            <span
              className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeStyles[status]}`}
            >
              Stage {stage}
            </span>
            <span className="text-xs font-medium text-slate-400">{service}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const buildPlaybooks = (incident: IncidentDetailRecord): PlaybookItem[] => {
  const serviceName =
    incident.service || incident.affectedSystem || "unknown-service";
  const title =
    incident.title || incident.reason || incident.summary || incident.ticketId;

  return [
    {
      id: "1",
      title,
      stage: 3,
      service: serviceName,
      icon: <AlertTriangle size={18} />,
      status: "warning",
    },
    {
      id: "2",
      title: "Deployment Rollback",
      stage: 3,
      service: incident.environment || "all-services",
      icon: <RefreshCw size={18} />,
      status: "info",
    },
    {
      id: "3",
      title: "Dependency Health Check",
      stage: 3,
      service: incident.region || "shared-infra",
      icon: <Database size={18} />,
      status: "success",
    },
    {
      id: "4",
      title: "Pod Recovery",
      stage: 3,
      service: serviceName,
      icon: <Plus size={18} />,
      status: "warning",
    },
    {
      id: "5",
      title: "Traffic Stabilization",
      stage: 3,
      service: incident.blastRadius || "impacted services",
      icon: <Activity size={18} />,
      status: "success",
    },
    {
      id: "6",
      title: "Auth / Access Check",
      stage: 2,
      service:
        incident.assignedToName ||
        incident.assignedToEmail ||
        incident.incidentCommander ||
        "response-owner",
      icon: <Shield size={18} />,
      status: "danger",
    },
  ];
};

const PlaybookSidebar: React.FC<{ incident: IncidentDetailRecord }> = ({
  incident,
}) => {
  const playbooks = buildPlaybooks(incident);

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
    <div className="flex h-full w-80 flex-col gap-6 overflow-y-auto border-r border-white/5 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-white">
          Playbooks
        </h2>
        <div className="flex h-8 w-8 items-center justify-center rounded border border-white/20 text-xs font-bold text-white">
          3
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {playbooks.map((playbook) => (
          <StatusCard key={playbook.id} {...playbook} />
        ))}
      </div>

      <hr className="my-2 border-white/5" />

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-slate-200">Legend</h3>
        <div className="flex flex-col gap-3">
          {legends.map((item) => (
            <div
              key={item.id}
              className="group flex cursor-default items-center justify-between"
            >
              <span className="text-xs text-slate-400 transition-colors group-hover:text-slate-200">
                {item.id}. {item.label}
              </span>
              {item.status === "completed" ? (
                <CheckCircle2 size={16} className="text-emerald-500" />
              ) : item.status === "active" ? (
                <div className="relative flex items-center justify-center">
                  <Circle size={16} className="text-green-400" />
                  <div className="absolute h-1.5 w-1.5 rounded-full bg-green-400" />
                </div>
              ) : (
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
