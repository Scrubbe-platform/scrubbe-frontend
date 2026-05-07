import React from "react";
import { FileText, Save } from "lucide-react";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";

interface Breadcrumb {
  label: string;
  isCurrent?: boolean;
}

interface ActionButtonProps {
  icon?: React.ReactNode;
  label: string;
  variant: "blue" | "teal" | "outline" | "ghost" | "success";
  dot?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  variant,
  dot,
}) => {
  const variants = {
    blue: "border-blue-500/50 bg-blue-500/5 text-blue-400",
    teal: "border-teal-500/50 bg-teal-500/5 text-teal-400",
    outline: "border-slate-700 text-slate-300 hover:bg-white/5",
    ghost: "border-blue-500/30 bg-transparent text-blue-400",
    success: "border-green/50 bg-green/5 text-green hover:bg-green/10",
  };

  return (
    <button
      className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${variants[variant]}`}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {icon ? <span className="opacity-80">{icon}</span> : null}
      {label}
    </button>
  );
};

const PlaybookHeader: React.FC<{ incident: IncidentDetailRecord }> = ({
  incident,
}) => {
  const breadcrumbs: Breadcrumb[] = [
    { label: "Governance" },
    { label: "Playbook Intelligence" },
    {
      label:
        incident.title ||
        incident.reason ||
        incident.summary ||
        incident.ticketId,
      isCurrent: true,
    },
  ];

  return (
    <header className="flex w-full items-center justify-between border-b border-white/5 px-6 py-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Playbooks
        </h1>

        <nav className="flex items-center text-sm font-medium">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.label}>
              <span className={crumb.isCurrent ? "text-green-400" : "text-slate-500"}>
                {crumb.label}
              </span>
              {idx < breadcrumbs.length - 1 ? (
                <span className="mx-1 text-slate-600">/</span>
              ) : null}
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <ActionButton variant="blue" label="CP · Execution Gate" dot />
        <ActionButton variant="teal" label="AP · Telemetry" dot />
        <div className="mx-1 h-6 w-px bg-white/10" />
        <ActionButton
          variant="outline"
          label="Audit Log"
          icon={<FileText size={14} />}
        />
        <ActionButton
          variant="ghost"
          label={incident.environment || "runtime"}
          icon={<FileText size={14} />}
        />
        <ActionButton
          variant="success"
          label="Save Playbook"
          icon={<Save size={14} />}
        />
      </div>
    </header>
  );
};

export default PlaybookHeader;
