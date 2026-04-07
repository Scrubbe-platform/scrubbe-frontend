"use client";
import React from "react";
import {
  Lock,
  Info,
  ShieldCheck,
  RotateCcw,
  Maximize,
  CheckCircle2,
  Bolt,
  TriangleAlert,
} from "lucide-react";

// --- Types ---

type GuardrailStatus =
  | "APPROVAL REQUIRED"
  | "AUTO-EXECUTE"
  | "BLOCK AUTO"
  | "PASS";

interface PolicyRow {
  id: string;
  title: string;
  description: string;
  status: GuardrailStatus;
  icon: React.ReactNode;
}

// --- Sub-Components ---

const StatusBadge = ({ status }: { status: GuardrailStatus }) => {
  const styles: Record<GuardrailStatus, string> = {
    "APPROVAL REQUIRED": "border-amber-500/40 text-amber-500 bg-amber-500/5",
    "AUTO-EXECUTE": "border-red-500/40 text-red-400 bg-red-500/5", // Matching image's specific red tint
    "BLOCK AUTO": "border-red-600/40 text-red-500 bg-red-600/5",
    PASS: "border-red-900/40 text-red-800 bg-red-900/5", // Image shows a very dark/muted red-brown for "PASS"
  };

  // Note: Adjusting "PASS" and "AUTO-EXECUTE" to match the specific unique color palette in the reference image
  const customStyles = {
    "APPROVAL REQUIRED": "border-amber-500/30 text-amber-500",
    "AUTO-EXECUTE": "border-rose-900/50 text-rose-500",
    "BLOCK AUTO": "border-rose-900/50 text-rose-500",
    PASS: "border-orange-900/30 text-orange-800",
  };

  return (
    <span
      className={`text-[10px] font-bold px-3 py-1.5 rounded border uppercase tracking-wider ${styles[status]}`}
    >
      {status}
    </span>
  );
};

// --- Main Component ---

const GuardrailModule: React.FC = () => {
  const policies: PolicyRow[] = [
    {
      id: "1",
      title: "Production Rollback Approval",
      description:
        "policy: prod.rollback.requires_approval = true · Applies to all P1/P2 incidents",
      status: "APPROVAL REQUIRED",
      icon: <ShieldCheck size={18} className="text-amber-500" />,
    },
    {
      id: "2",
      title: "Pod Restart Auto-Allowed",
      description:
        "policy: pod.restart.auto = true · reversible = true · blast_radius ≤ 1 service",
      status: "AUTO-EXECUTE",
      icon: <RotateCcw size={18} className="text-amber-500" />,
    },
    {
      id: "3",
      title: "Blast Radius Automation Limit",
      description:
        "policy: no automation if blast_radius > 3 services · Current: 3 — threshold met",
      status: "BLOCK AUTO",
      icon: <Maximize size={18} className="text-amber-500" />,
    },
    {
      id: "4",
      title: "Reversibility Check",
      description:
        "policy: prefer reversible actions · Rollback: reversible ✓ · rollbackPlaybookId linked",
      status: "PASS",
      icon: <CheckCircle2 size={18} className="text-amber-500" />,
    },
    {
      id: "5",
      title: "Business Hours Escalation",
      description:
        "policy: P1 outside 09:00–18:00 UTC requires on-call approval · Current: 00:15 UTC",
      status: "APPROVAL REQUIRED",
      icon: <Bolt size={18} className="text-amber-500" />,
    },
  ];

  return (
    <div className="w-full max-w-6xl bg-dark border border-white/5 rounded-3xl p-3 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center">
            <Lock size={20} className="text-amber-500" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg leading-tight">
              Guardrail Check
            </h2>
            <p className="text-slate-500 text-xs mt-1 font-medium">
              Policy engine — PolicyRef[] · determines whether automation is
              permitted · CP enforced
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-1.5 border border-amber-500/40 bg-amber-500/5 rounded text-amber-500 text-xs font-bold uppercase tracking-widest">
            1 APPROVAL REQUIRED
          </div>
          <button className="p-1.5 border border-slate-700 rounded text-slate-400 hover:bg-white/5">
            <TriangleAlert size={16} />
          </button>
        </div>
      </div>

      {/* CP Zone Info */}
      <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-4">
        <Info size={20} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-200/70 leading-relaxed">
          <span className="font-bold text-amber-500">CP Zone</span> — policies
          are strongly consistent. On partition or uncertainty, execution is
          blocked. Policies never conflict
        </p>
      </div>

      {/* Policy List */}
      <div className="flex flex-col gap-2">
        {policies.map((policy) => (
          <div
            key={policy.id}
            className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-white/10 transition-all"
          >
            <div className="flex items-center gap-5">
              <div className="p-2 border border-amber-500/20 rounded-lg bg-amber-500/5">
                {policy.icon}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-slate-200">
                  {policy.title}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {policy.description}
                </span>
              </div>
            </div>
            <StatusBadge status={policy.status} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuardrailModule;
