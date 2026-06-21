"use client";
import React from "react";
import { Bolt, Info, Check, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";
import { cn } from "@/lib/utils";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";
import {
  PlaybookStepOutcome,
  useActiveExecution,
} from "../../hooks/usePlaybookExecution";

type StepStatus = "completed" | "in-progress" | "pending" | "skipped";

const StatusBadge = ({ status }: { status: StepStatus }) => {
  const styles: Record<StepStatus, string> = {
    completed:
      "border-emerald-200 dark:border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/8 text-emerald-600 dark:text-emerald-400",
    "in-progress":
      "border-sky-200 dark:border-sky-500/25 bg-sky-50 dark:bg-sky-500/8 text-sky-600 dark:text-sky-400",
    pending:
      "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-black dark:text-zinc-500",
    skipped:
      "border-amber-200 dark:border-amber-500/25 bg-amber-50 dark:bg-amber-500/8 text-amber-600 dark:text-amber-400",
  };
  return (
    <span
      className={`rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[status]}`}
    >
      {status.replace("-", " ")}
    </span>
  );
};

const StepTag = ({ text }: { text: string }) => (
  <span className="rounded-md border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-[10px] font-mono text-black dark:text-zinc-500">
    {text}
  </span>
);

const toStatus = (
  step: PlaybookStepOutcome,
  isCurrent: boolean
): StepStatus => {
  if (step.status === "COMPLETED") return "completed";
  if (step.status === "SKIPPED") return "skipped";
  return isCurrent ? "in-progress" : "pending";
};

const InvestigationTimeline: React.FC<{ incident: IncidentDetailRecord }> = ({
  incident,
}) => {
  const { data: execution, isLoading } = useActiveExecution(incident.id);
  const { post } = useFetch();
  const queryClient = useQueryClient();

  const completeStep = useMutation({
    mutationFn: async (stepIndex: number) => {
      if (!execution) throw new Error("No active execution");
      const res = await post(
        `${endpoint.playbooks.completeStep}/${execution.id}/steps/${stepIndex}/complete`,
        { result: "Completed via Investigation Timeline" }
      );
      if (!res.success) throw new Error("Failed to complete step");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Step marked complete");
      queryClient.invalidateQueries({
        queryKey: ["playbook-execution-active", incident.id],
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const skipStep = useMutation({
    mutationFn: async (stepIndex: number) => {
      if (!execution) throw new Error("No active execution");
      const reason = window.prompt("Reason for skipping this step:");
      if (!reason) throw new Error("Skip cancelled");
      const res = await post(
        `${endpoint.playbooks.skipStep}/${execution.id}/steps/${stepIndex}/skip`,
        { reason }
      );
      if (!res.success) throw new Error("Failed to skip step");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Step skipped");
      queryClient.invalidateQueries({
        queryKey: ["playbook-execution-active", incident.id],
      });
    },
    onError: (e: Error) => {
      if (e.message !== "Skip cancelled") toast.error(e.message);
    },
  });

  const steps = [...(execution?.stepOutcomes ?? [])].sort(
    (a, b) => a.stepIndex - b.stepIndex
  );
  const completedCount = steps.filter(
    (s) => s.status === "COMPLETED" || s.status === "SKIPPED"
  ).length;
  const currentIndex = execution?.currentStepIndex ?? 0;

  return (
    <div
      id="investigation"
      className="w-full rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 p-5"
    >
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 shrink-0">
            <Bolt size={16} className="text-zinc-500 dark:text-zinc-400" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-black dark:text-zinc-100">
              Investigation Steps
            </h2>
            <p className="mt-0.5 text-[12px] text-black dark:text-zinc-500">
              Live step outcomes from the active playbook execution
            </p>
          </div>
        </div>
        {steps.length > 0 && (
          <div className="flex gap-2">
            <span className="rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-[11px] font-semibold text-black dark:text-zinc-400">
              {completedCount} / {steps.length} done
            </span>
          </div>
        )}
      </div>

      {/* Info banner */}
      <div className="mb-6 flex gap-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4">
        <Info
          size={15}
          className="mt-0.5 shrink-0 text-black dark:text-zinc-500"
        />
        <p className="text-[12px] leading-relaxed text-black dark:text-zinc-400">
          Steps are persisted on the playbook execution record. Completing or
          skipping a step here writes back to the same record used by the
          audit trail.
        </p>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-[12px] text-black dark:text-zinc-500">
          Loading investigation steps…
        </p>
      ) : steps.length === 0 ? (
        <p className="py-8 text-center text-[12px] text-black dark:text-zinc-500">
          No playbook execution triggered for this incident yet. Run a Dry
          Run from the playbook card above to start an investigation.
        </p>
      ) : (
        <div className="relative ml-4 space-y-10 border-l border-zinc-100 dark:border-zinc-800 pb-4 pl-9">
          {steps.map((step, i) => {
            const isCurrent =
              step.status === "PENDING" && step.stepIndex === currentIndex;
            const status = toStatus(step, isCurrent);
            return (
              <div key={step.id} className="relative">
                <div
                  className={cn(
                    "absolute -left-[46px] top-0 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
                    status === "completed" &&
                      "border-emerald-400 bg-emerald-400",
                    status === "skipped" &&
                      "border-amber-400 bg-amber-400",
                    status === "in-progress" &&
                      "border-sky-400 bg-white dark:bg-zinc-950 text-sky-500",
                    status === "pending" &&
                      "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-600"
                  )}
                >
                  {status === "completed" || status === "skipped" ? (
                    <Check size={12} className="text-white" />
                  ) : (
                    <span className="text-[10px] font-bold">{i + 1}</span>
                  )}
                </div>

                <div className="mb-2 flex items-start justify-between gap-3">
                  <h3
                    className={cn(
                      "text-[13px] font-semibold leading-snug",
                      status === "pending"
                        ? "text-zinc-400 dark:text-zinc-500"
                        : "text-black dark:text-zinc-100"
                    )}
                  >
                    {step.stepName}
                  </h3>
                  <StatusBadge status={status} />
                </div>

                <div className="mb-3 flex flex-wrap gap-1.5">
                  <StepTag text={`performedBy: ${step.performedBy ?? "—"}`} />
                  {step.completedAt && (
                    <StepTag
                      text={`completed: ${new Date(step.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                    />
                  )}
                </div>

                {step.output && (
                  <div className="mb-3 rounded-xl border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 p-3.5 text-[11px] font-mono leading-relaxed text-emerald-700 dark:text-emerald-400">
                    {Object.entries(step.output)
                      .map(([k, v]) => `${k}: ${String(v)}`)
                      .join(" · ")}
                  </div>
                )}

                {status === "in-progress" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => completeStep.mutate(step.stepIndex)}
                      disabled={completeStep.isPending}
                      className="flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                    >
                      {completeStep.isPending ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Check size={12} />
                      )}
                      Complete step
                    </button>
                    <button
                      onClick={() => skipStep.mutate(step.stepIndex)}
                      disabled={skipStep.isPending}
                      className="rounded-lg border border-zinc-100 dark:border-zinc-800 px-3 py-1.5 text-[11px] font-medium text-black dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                    >
                      Skip step
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InvestigationTimeline;
