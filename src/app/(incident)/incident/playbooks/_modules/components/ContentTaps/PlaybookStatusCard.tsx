import React from "react";
import { TriangleAlert, Copy, Play } from "lucide-react";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";

interface PlaybookStatusCardProps {
  incident: IncidentDetailRecord;
}

const getPlaybookTitle = (incident: IncidentDetailRecord) =>
  incident.title ||
  incident.reason ||
  incident.summary ||
  `${incident.service || "Service"} Incident`;

export default function PlaybookStatusCard({
  incident,
}: PlaybookStatusCardProps) {
  const playbookTitle = getPlaybookTitle(incident);
  const serviceName =
    incident.service || incident.affectedSystem || "unknown-service";
  const stageLabel =
    incident.lifecycleStep === "Resolved"
      ? "STAGE 6 · RESOLVED"
      : "STAGE 3 · ASSISTED EXECUTION";
  const versionLabel = incident.environment || "runtime";
  const severityLabel = `${incident.severity || incident.priority || "P3"} ${
    incident.status || "ACTIVE"
  }`;

  return (
    <div className="flex bg-dark rounded-lg items-center justify-center">
      <div className="w-full max-w-[1180px] p-2 shadow-2xl">
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-amber-500/30 bg-amber-500/10">
              <TriangleAlert className="h-3 w-3 text-amber-500" />
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight text-white">
                {playbookTitle}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <Tag variant="amber" border>
                  {stageLabel}
                </Tag>
                <Tag variant="ghost" border>
                  {versionLabel}
                </Tag>
                <Tag variant="amber" border>
                  {serviceName}
                </Tag>
                <Tag variant="red" border>
                  {severityLabel}
                </Tag>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button className="flex items-center gap-2.5 rounded-lg border border-slate-600 px-3 py-2 text-slate-200 transition-colors hover:border-slate-500 hover:bg-white/5">
              <Copy className="h-3 w-3 text-slate-400" />
              <span className="text-sm font-medium">Clone</span>
            </button>
            <button className="flex items-center gap-2.5 rounded-lg border border-slate-600 px-3 py-2 text-slate-200 transition-colors hover:border-slate-500 hover:bg-white/5">
              <Play className="h-3 w-3 text-slate-400" />
              <span className="text-sm font-medium">Dry Run</span>
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-black/10 p-5">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-base font-medium text-slate-100">
              Effective Automation Level · CP Enforced
            </h3>
            <div className="space-y-1.5">
              <div className="text-right text-sm font-medium text-white">
                Automation Stages
              </div>
              <div className="flex gap-1">
                <div className="h-1 w-12 rounded-full bg-emerald-500" />
                <div className="h-1 w-12 rounded-full bg-lime-500" />
                <div className="h-1 w-12 rounded-full bg-slate-700" />
                <div className="h-1 w-12 rounded-full bg-slate-700" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 font-mono text-sm tracking-tight text-slate-500">
            <span>min(</span>
            <span className="rounded-lg border border-amber-500/30 px-3 py-2 font-medium text-amber-500">
              playbook: 3
            </span>
            <span>,</span>
            <span className="rounded-lg border border-purple-500/30 px-3 py-2 font-medium text-purple-500">
              policy: 3
            </span>
            <span>,</span>
            <span className="rounded-lg border border-red-500/30 px-3 py-2 font-medium text-red-500">
              risk: 2
            </span>
            <span>) =</span>
            <span className="rounded-lg border border-emerald-500/30 px-3 py-2 font-medium text-emerald-400">
              2 · PROPOSE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TagProps {
  children: React.ReactNode;
  variant: "amber" | "red" | "ghost";
  border?: boolean;
}

function Tag({ children, variant, border = false }: TagProps) {
  const baseClasses =
    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors";

  const variantClasses = {
    amber: "bg-amber-500/5 text-amber-500 hover:bg-amber-500/10",
    red: "bg-red-500/5 text-red-500 hover:bg-red-500/10",
    ghost: "bg-slate-800/20 text-slate-200 hover:bg-slate-800/30",
  };

  const borderClasses = {
    amber: "border border-amber-500/20",
    red: "border border-red-500/20",
    ghost: "border border-slate-700/50",
  };

  const finalBorder = border ? borderClasses[variant] : "";

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${finalBorder}`}>
      {children}
    </div>
  );
}
