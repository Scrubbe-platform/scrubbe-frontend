"use client";
import React from "react";
import { Lock, Users, TriangleAlert, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";

type ModeStatus = "default" | "active" | "locked";

interface ExecutionModeCard {
  title: string;
  description: string;
  stage: string;
  status: ModeStatus;
}

const ModeCard = ({ title, description, stage, status }: ExecutionModeCard) => {
  const styles = {
    default: "border-white/5 bg-white/[0.02] opacity-60",
    active: "border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/20",
    locked: "border-white/5 bg-white/[0.02] opacity-40",
  };
  const textStyles = { default: "text-slate-400", active: "text-emerald-400", locked: "text-slate-600" };

  return (
    <div className={`flex-1 flex flex-col items-center text-center p-8 rounded-2xl border transition-all ${styles[status]}`}>
      <div className={`p-3 rounded-lg mb-4 border border-white/10 ${status === "active" ? "bg-emerald-500/10" : "bg-white/5"}`}>
        <Users size={24} className={status === "active" ? "text-emerald-500" : "text-slate-500"} />
      </div>
      <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed mb-4 max-w-[200px]">{description}</p>
      <span className={`text-[11px] font-bold uppercase tracking-wider ${textStyles[status]}`}>{stage}</span>
    </div>
  );
};

const DEFAULT_MODES: ExecutionModeCard[] = [
  { title: "Manual", description: "Engineer runs action directly. No assistance.", stage: "Stage 1", status: "default" },
  { title: "Assisted", description: "Scrubbe prepares. Engineer confirms.", stage: "Stage 2 · ACTIVE", status: "active" },
  { title: "Automated", description: "Scrubbe executes when risk is low.", stage: "Stage 4 · LOCKED", status: "locked" },
];

const ExecutionGate: React.FC<{ incidentId?: string }> = ({ incidentId }) => {
  const { get, post } = useFetch();
  const queryClient = useQueryClient();

  const { data: pendingDecision } = useQuery({
    queryKey: ["execution-decisions", incidentId],
    queryFn: async () => {
      if (!incidentId) return null;
      const res = await get(`${endpoint.decisions.log}?incidentId=${incidentId}`);
      if (res.success) {
        const decisions: any[] = res.data?.data?.decisions ?? res.data?.data ?? [];
        return decisions.find((d: any) => d.status === "PENDING" || d.requiresApproval) ?? null;
      }
      return null;
    },
    enabled: !!incidentId,
  });

  const { mutateAsync: proposeRollback, isPending: proposing } = useMutation({
    mutationFn: async () => {
      if (!incidentId) throw new Error("No incident selected");
      const res = await post(endpoint.decisions.propose, {
        incidentId,
        type: "ROLLBACK",
        title: "Prepare Rollback for engineer approval",
        description: "Rollback proposed via Playbook Execution Gate.",
        riskLevel: "MEDIUM",
        requiresApproval: true,
      });
      if (!res.success) throw new Error(res.data ?? "Failed to propose decision");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Rollback decision proposed — awaiting approval");
      queryClient.invalidateQueries({ queryKey: ["execution-decisions", incidentId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusLabel = pendingDecision
    ? `AWAITING APPROVAL · ${pendingDecision.title ?? "Rollback"}`
    : "AWAITING APPROVAL";

  const ealLevel = pendingDecision?.ealScore ?? 2;

  return (
    <div className="w-full max-w-6xl bg-dark border border-white/5 rounded-3xl p-3 flex flex-col gap-8">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center">
            <Lock size={20} className="text-amber-500" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg leading-tight">Execution Gate</h2>
            <p className="text-slate-500 text-xs mt-1 font-mono">
              CP enforced · effectiveAutomationLevel = min(playbook, policy, risk) · block on uncertainty
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 border border-amber-500/40 bg-amber-500/5 rounded text-amber-500 text-xs font-bold tracking-widest truncate max-w-[260px]">
            {statusLabel}
          </div>
          <button className="p-2 border border-slate-700 rounded text-slate-400 hover:bg-white/5 transition-colors">
            <TriangleAlert size={18} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-600/10 border border-blue-600/30 rounded-lg">
            <Lock size={18} className="text-blue-500" />
          </div>
          <span className="text-sm font-semibold text-white">Execution Mode</span>
          <span className="px-3 py-1 bg-blue-600/20 border border-blue-600/40 text-blue-400 text-[10px] font-bold rounded uppercase tracking-widest">
            CP ZONE
          </span>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-xs font-mono text-slate-500">
            effectiveAutomationLevel{" "}
            <span className="text-purple-400 font-bold ml-2">{ealLevel} · PROPOSE</span>
          </p>
          <button className="p-1.5 border border-slate-700 rounded text-slate-400">
            <TriangleAlert size={14} />
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {DEFAULT_MODES.map((mode) => (
          <ModeCard key={mode.title} {...mode} />
        ))}
      </div>

      <button
        onClick={() => proposeRollback()}
        disabled={proposing}
        className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-500/5 border border-emerald-500/30 rounded-xl text-emerald-500 hover:bg-emerald-500/10 transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
        <span className="text-sm font-semibold tracking-wide">
          {proposing ? "Proposing…" : "Prepare Rollback for engineer approval"}
        </span>
      </button>

      <div className="p-5 bg-red-950/20 border border-red-500/20 rounded-xl flex gap-4">
        <Lock size={18} className="text-red-500 shrink-0 mt-0.5" />
        <p className="text-sm text-red-400 leading-relaxed font-medium">
          CP Enforcement: if policy verification is unavailable during network partition, execution is blocked. Outcome will be recorded as:{" "}
          <span className="font-mono text-[13px] bg-red-500/10 px-1 rounded">awaiting_verification</span>.
        </p>
      </div>
    </div>
  );
};

export default ExecutionGate;
