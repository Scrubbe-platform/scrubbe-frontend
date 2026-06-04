"use client";
import React from "react";
import { Lock, Users, TriangleAlert, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ModeStatus = "default" | "active" | "locked";
interface ExecutionModeCard { title: string; description: string; stage: string; status: ModeStatus }

const ModeCard = ({ title, description, stage, status }: ExecutionModeCard) => (
  <div className={cn(
    "flex-1 flex flex-col items-center text-center p-6 rounded-xl border transition-colors",
    status === "active"  && "border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/60",
    status === "default" && "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 opacity-60",
    status === "locked"  && "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 opacity-40",
  )}>
    <div className={cn(
      "p-3 rounded-lg mb-3 border",
      status === "active"
        ? "border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-700"
        : "border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900"
    )}>
      <Users size={20} className="text-zinc-500 dark:text-zinc-400" />
    </div>
    <h4 className="text-[13px] font-semibold text-black dark:text-zinc-100 mb-1.5">{title}</h4>
    <p className="text-[11px] text-black dark:text-zinc-500 leading-relaxed mb-3 max-w-[180px]">{description}</p>
    <span className="text-[10px] font-semibold uppercase tracking-wider text-black dark:text-zinc-400">{stage}</span>
  </div>
);

const DEFAULT_MODES: ExecutionModeCard[] = [
  { title: "Manual",    description: "Engineer runs action directly. No assistance.", stage: "Stage 1",          status: "default" },
  { title: "Assisted",  description: "Scrubbe prepares. Engineer confirms.",          stage: "Stage 2 · Active", status: "active"  },
  { title: "Automated", description: "Scrubbe executes when risk is low.",           stage: "Stage 4 · Locked", status: "locked"  },
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
      const res = await post(endpoint.decisions.propose, { incidentId, type: "ROLLBACK", title: "Prepare Rollback for engineer approval", description: "Rollback proposed via Playbook Execution Gate.", riskLevel: "MEDIUM", requiresApproval: true });
      if (!res.success) throw new Error(res.data ?? "Failed to propose decision");
      return res.data;
    },
    onSuccess: () => { toast.success("Rollback decision proposed — awaiting approval"); queryClient.invalidateQueries({ queryKey: ["execution-decisions", incidentId] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusLabel = pendingDecision ? `Awaiting approval · ${pendingDecision.title ?? "Rollback"}` : "Awaiting approval";
  const ealLevel = pendingDecision?.ealScore ?? 2;

  return (
    <div className="w-full rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 p-5 flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 shrink-0">
            <Lock size={15} className="text-zinc-500 dark:text-zinc-400" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-black dark:text-zinc-100">Execution Gate</h2>
            <p className="text-[12px] text-black dark:text-zinc-500 mt-0.5 font-mono">
              CP enforced · effectiveAutomationLevel = min(playbook, policy, risk)
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1.5 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[11px] font-medium text-black dark:text-zinc-400 truncate max-w-[220px]">
            {statusLabel}
          </span>
          <button className="p-1.5 rounded-lg border border-zinc-500 dark:border-zinc-700 text-black hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <TriangleAlert size={14} />
          </button>
        </div>
      </div>

      {/* EAL row */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-1.5 border border-zinc-500 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800">
            <Lock size={14} className="text-zinc-500 dark:text-zinc-400" />
          </div>
          <span className="text-[12px] font-semibold text-black dark:text-zinc-200">Execution Mode</span>
          <span className="px-2 py-0.5 border border-zinc-500 dark:border-zinc-700 rounded text-[10px] font-semibold text-black dark:text-zinc-400 uppercase tracking-wider">
            CP Zone
          </span>
        </div>
        <p className="text-[11px] font-mono text-black dark:text-zinc-500">
          effectiveAutomationLevel <span className="font-semibold text-zinc-600 dark:text-zinc-300 ml-1">{ealLevel} · PROPOSE</span>
        </p>
      </div>

      {/* Mode cards */}
      <div className="flex gap-3">
        {DEFAULT_MODES.map((mode) => <ModeCard key={mode.title} {...mode} />)}
      </div>

      {/* Propose button */}
      <button
        onClick={() => proposeRollback()}
        disabled={proposing}
        className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 text-[13px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CheckCircle2 size={16} className="text-zinc-400 dark:text-zinc-500" />
        {proposing ? "Proposing…" : "Prepare Rollback for engineer approval"}
      </button>

      {/* CP warning — keep red, it's a real enforcement warning */}
      <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-500/20 rounded-xl flex gap-3">
        <Lock size={14} className="text-red-400 dark:text-red-500 shrink-0 mt-0.5" />
        <p className="text-[12px] text-red-600 dark:text-red-400 leading-relaxed">
          CP Enforcement: if policy verification is unavailable during network partition, execution is blocked. Outcome will be recorded as:{" "}
          <span className="font-mono bg-red-100 dark:bg-red-500/10 px-1 rounded text-[11px]">awaiting_verification</span>.
        </p>
      </div>
    </div>
  );
};

export default ExecutionGate;