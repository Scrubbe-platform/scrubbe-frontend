"use client";
import React from "react";
import { FileText, Save } from "lucide-react";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";

const PlaybookHeader: React.FC<{ incident: IncidentDetailRecord }> = ({ incident }) => {
  const breadcrumbs = [
    { label: "Governance",             isCurrent: false },
    { label: "Playbook Intelligence",  isCurrent: false },
    
  ];

  const actions: { label: string; icon?: React.ReactNode; dot?: boolean; style: string }[] = [
    { label: "CP · Execution Gate", dot: true, style: "border-sky-200 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/5 text-sky-700 dark:text-sky-400"     },
    { label: "AP · Telemetry",      dot: true, style: "border-teal-200 dark:border-teal-500/30 bg-teal-50 dark:bg-teal-500/5 text-teal-700 dark:text-teal-400" },
    { label: "Audit Log",           icon: <FileText size={13} />, style: "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800" },
    { label: incident.environment || "runtime", icon: <FileText size={13} />, style: "border-zinc-200 dark:border-zinc-700 text-black dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800" },
    { label: "Save Playbook",       icon: <Save size={13} />, style: "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800" },
  ];

  return (
    <header className="flex w-full flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 px-5 md:px-8 py-4 bg-white dark:bg-transparent">

      {/* Left — title + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-[16px] font-semibold text-black dark:text-white shrink-0">
          Playbooks
        </h1>
      
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
        {actions.map(({ label, icon, dot, style }, i) => (
          <React.Fragment key={label}>
            {/* divider before "Audit Log" */}
            {i === 2 && <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />}
            <button className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${style}`}>
              {dot && <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />}
              {icon && <span className="opacity-70">{icon}</span>}
              {label}
            </button>
          </React.Fragment>
        ))}
      </div>
    </header>
  );
};

export default PlaybookHeader;