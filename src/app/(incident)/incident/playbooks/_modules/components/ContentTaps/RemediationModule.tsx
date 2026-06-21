"use client";
import React from "react";
import { FileText, Check, Info, Bolt, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";
import {
  useActiveExecution,
  useExecutionDetail,
} from "../../hooks/usePlaybookExecution";

interface RemediationOption {
  actionId: string;
  title: string;
  isSelected?: boolean;
  confidence: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
  blast: string;
  tags: string[];
  sampleSize?: number;
}

const MetricBox = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="flex-1 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 p-3">
    <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
      {label}
    </p>
    <p className="text-[15px] font-semibold text-black dark:text-zinc-200">
      {value}
    </p>
  </div>
);

const OptionCard: React.FC<
  RemediationOption & { onSelect: () => void; selecting: boolean; selectable: boolean }
> = ({ title, isSelected, confidence, risk, blast, tags, sampleSize, onSelect, selecting, selectable }) => (
  <div className="flex flex-col gap-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors">
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2.5">
        <div className="rounded-md border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1.5">
          <Bolt size={14} className="text-zinc-400 dark:text-zinc-500" />
        </div>
        <h4 className="text-[12px] font-semibold text-black dark:text-zinc-200 leading-snug">
          {title}
        </h4>
      </div>
      {isSelected && (
        <span className="rounded border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
          Selected
        </span>
      )}
    </div>

    <div className="flex gap-2">
      <MetricBox label="Confidence" value={`${confidence}%`} />
      <MetricBox label="Risk" value={risk} />
      <MetricBox label="Blast" value={blast} />
    </div>

    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="rounded border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1 text-[10px] font-medium text-black dark:text-zinc-400"
        >
          {tag}
        </span>
      ))}
      {sampleSize !== undefined && sampleSize > 0 && (
        <span className="rounded border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1 text-[10px] font-medium text-black dark:text-zinc-400">
          sample: {sampleSize}
        </span>
      )}
    </div>

    {selectable && !isSelected && (
      <button
        onClick={onSelect}
        disabled={selecting}
        className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
      >
        {selecting ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
        Select for remediation
      </button>
    )}
  </div>
);

const RemediationModule: React.FC<{ incident: IncidentDetailRecord }> = ({
  incident,
}) => {
  const { post } = useFetch();
  const queryClient = useQueryClient();
  const { data: activeExecution } = useActiveExecution(incident.id);
  const { data: execution, isLoading } = useExecutionDetail(activeExecution?.id);

  const { data: suggestions = [] } = useQuery({
    queryKey: ["playbook-suggested-actions", incident.id],
    queryFn: async () => {
      const res = await post(endpoint.playbooks.suggest, {
        serviceNames: (incident.service || incident.affectedSystem)
          ? [incident.service || incident.affectedSystem]
          : undefined,
        signalTypes: incident.detection ? [incident.detection] : undefined,
      });
      return res.data?.data ?? [];
    },
    enabled: !!incident.id,
    staleTime: 30_000,
  });

  const selectAction = useMutation({
    mutationFn: async (actionId: string) => {
      if (!execution) throw new Error("No active execution");
      const res = await post(
        `${endpoint.playbooks.selectAction}/${execution.id}/action`,
        { actionId }
      );
      if (!res.success) throw new Error("Failed to select action");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Remediation action selected");
      queryClient.invalidateQueries({
        queryKey: ["playbook-execution-detail", execution?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["playbook-execution-active", incident.id],
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const actions = execution?.playbook?.remediationActions ?? [];
  const selectable = execution?.status === "REMEDIATING";

  const options: RemediationOption[] = actions.map((action) => {
    const suggestion = suggestions.find(
      (s: { actionId: string }) => s.actionId === action.actionId
    );
    return {
      actionId: action.actionId,
      title: action.name,
      isSelected: execution?.selectedActionId === action.actionId,
      confidence: suggestion?.successRate ?? action.confidenceScore ?? 0,
      risk: action.riskLevel,
      blast: action.blastRadiusEstimate
        ? `${action.blastRadiusEstimate} svc`
        : "unknown",
      tags: [action.type, action.system ?? "no system tag"].filter(Boolean),
      sampleSize: suggestion?.sampleSize,
    };
  });

  return (
    <div
      id="remediation "
      className="w-full rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 p-5"
    >
      <div className="mb-5 flex items-start justify-between">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 shrink-0">
            <FileText size={15} className="text-zinc-500 dark:text-zinc-400" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-black dark:text-zinc-100">
              Remediation Options
            </h2>
            <p className="mt-0.5 text-[12px] text-black dark:text-zinc-500">
              confidence · blast radius · risk level — from the matched
              playbook's remediation actions
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="flex items-center gap-1.5 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-[11px] font-medium text-black dark:text-zinc-400">
            <Check size={12} />{" "}
            {execution ? execution.status.replace("_", " ") : "Awaiting Investigation"}
          </span>
        </div>
      </div>

      <div className="mb-5 flex gap-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4">
        <Info
          size={15}
          className="mt-0.5 shrink-0 text-black dark:text-zinc-500"
        />
        <p className="text-[12px] leading-relaxed text-black dark:text-zinc-400">
          {selectable
            ? "All investigation steps are complete — select a remediation action to propose it through the decision engine."
            : "Complete all investigation steps to unlock remediation action selection."}
        </p>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-[12px] text-black dark:text-zinc-500">
          Loading remediation options…
        </p>
      ) : options.length === 0 ? (
        <p className="py-8 text-center text-[12px] text-black dark:text-zinc-500">
          No playbook execution triggered for this incident yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {options.map((o) => (
            <OptionCard
              key={o.actionId}
              {...o}
              selectable={!!selectable}
              selecting={selectAction.isPending}
              onSelect={() => selectAction.mutate(o.actionId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RemediationModule;
