import React from "react";
import { FileText, Save } from "lucide-react";

// --- Types ---

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

// --- Sub-Components ---

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  variant,
  dot,
}) => {
  const variants = {
    blue: "border-blue-500/50 text-blue-400 bg-blue-500/5",
    teal: "border-teal-500/50 text-teal-400 bg-teal-500/5",
    outline: "border-slate-700 text-slate-300 hover:bg-white/5",
    ghost: "border-blue-500/30 text-blue-400 bg-transparent",
    success: "border-green/50 text-green bg-green/5 hover:bg-green/10",
  };

  return (
    <button
      className={`flex items-center gap-2 px-3 py-1.5 border rounded-md text-xs font-medium transition-colors ${variants[variant]}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {icon && <span className="opacity-80">{icon}</span>}
      {label}
    </button>
  );
};

// --- Main Component ---

const PlaybookHeader: React.FC = () => {
  const breadcrumbs: Breadcrumb[] = [
    { label: "Governance" },
    { label: "Playbook Intelligence" },
    { label: "High API Error Rate", isCurrent: true },
  ];

  return (
    <header className="w-full  border-b border-white/5 px-6 py-4 flex items-center justify-between">
      {/* Left Section: Title & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          Playbooks
        </h1>

        <nav className="flex items-center text-sm font-medium">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.label}>
              <span
                className={
                  crumb.isCurrent ? "text-green-400" : "text-slate-500"
                }
              >
                {crumb.label}
              </span>
              {idx < breadcrumbs.length - 1 && (
                <span className="mx-1 text-slate-600">/</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right Section: Action Controls */}
      <div className="flex items-center gap-2">
        <ActionButton variant="blue" label="CP • Execution Gate" dot />
        <ActionButton variant="teal" label="AP • Telemetry" dot />
        <div className="w-px h-6 bg-white/10 mx-1" />
        <ActionButton
          variant="outline"
          label="Audit Log"
          icon={<FileText size={14} />}
        />
        <ActionButton
          variant="ghost"
          label="v2.31"
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
