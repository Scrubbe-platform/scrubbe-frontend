"use client";
import React, { useEffect, useState } from "react";
import { Bolt, Info, Check, Plus, TriangleAlert } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import AddConditionForm, { ConditionFormState } from "./AddConditionForm";

interface Condition {
  id: string;
  field: string;
  operator: ConditionFormState["operator"];
  value: string | number;
  weight: number;
  isMatched: boolean;
}

// ── Condition row ─────────────────────────────────────────────────

const ConditionRow: React.FC<Condition> = ({
  field,
  operator,
  value,
  weight,
  isMatched,
}) => (
  <div className="group flex items-center justify-between rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-4 transition-colors hover:border-zinc-200 dark:hover:border-zinc-700">
    <div className="flex flex-1 items-center gap-6">
      {/* Field — keep a subtle accent to distinguish it as a key */}
      <span className="w-32 text-[13px] font-medium text-sky-600 dark:text-sky-400 font-mono shrink-0">
        {field}
      </span>

      <div className="flex flex-1 items-center gap-3">
        <span className="rounded border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1 text-[11px] font-mono uppercase text-black dark:text-zinc-400">
          {operator}
        </span>
        {/* Value — amber kept, it reads as a code literal */}
        <span className="font-mono text-[13px] text-amber-600 dark:text-amber-400">
          {typeof value === "string" && !value.startsWith("[")
            ? `"${value}"`
            : value}
        </span>
      </div>
    </div>

    <div className="flex items-center gap-5">
      <div className="flex items-center gap-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
          Weight
        </span>
        <div className="flex h-1 w-20 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full bg-zinc-400 dark:bg-zinc-500 transition-all"
            style={{ width: `${weight * 100}%` }}
          />
        </div>
        <span className="w-8 font-mono text-[12px] text-zinc-600 dark:text-zinc-300">
          {weight.toFixed(2)}
        </span>
      </div>
      <Check
        size={14}
        className={
          isMatched
            ? "text-emerald-500 dark:text-emerald-400"
            : "text-zinc-200 dark:text-black"
        }
      />
    </div>
  </div>
);

// ── Data ──────────────────────────────────────────────────────────

const isDeploymentAware = (incident: IncidentDetailRecord) =>
  /deploy|pipeline|ci\/cd|rollback|release/i.test(
    `${incident.sourceType ?? ""} ${incident.detection ?? ""} ${incident.title ?? ""}`,
  );

const buildConditions = (incident: IncidentDetailRecord): Condition[] => [
  {
    id: "1",
    field: "signal_type",
    operator: "eq",
    value: incident.sourceType || incident.source || "manual_raise",
    weight: 0.5,
    isMatched: true,
  },
  {
    id: "2",
    field: "service",
    operator: "eq",
    value: incident.service || incident.affectedSystem || "unknown-service",
    weight: 0.5,
    isMatched: true,
  },
  {
    id: "3",
    field: "incident_status",
    operator: "eq",
    value: incident.status || "OPEN",
    weight: 0.5,
    isMatched: true,
  },
  {
    id: "4",
    field: "recent_deployment",
    operator: "eq",
    value: isDeploymentAware(incident) ? "true" : "unknown",
    weight: 0.5,
    isMatched: true,
  },
  {
    id: "5",
    field: "incident_severity",
    operator: "in",
    value: JSON.stringify([incident.severity || incident.priority || "P3"]),
    weight: 0.5,
    isMatched: true,
  },
];

// ── Component ─────────────────────────────────────────────────────

const TriggerConditions: React.FC<{ incident: IncidentDetailRecord }> = ({
  incident,
}) => {
  const [conditions, setConditions] = useState<Condition[]>(() => buildConditions(incident));
  const [toggleConditionForm, setToggleConditionForm] = useState(false);
  const { post, put } = useFetch();
  const queryClient = useQueryClient();

  useEffect(() => {
    setConditions(buildConditions(incident));
  }, [incident.id]);

  // Shares its cache key with PlaybookStatusCard's match query so the
  // condition we persist below always targets the playbook actually shown
  // as matched on this page.
  const { data: matchedPlaybook } = useQuery({
    queryKey: ["playbook-matched-id", incident.id],
    queryFn: async () => {
      const res = await post(endpoint.playbooks.match, {
        serviceNames: (incident.service || incident.affectedSystem)
          ? [incident.service || incident.affectedSystem]
          : undefined,
        incidentType: incident.category || incident.sourceType,
        signalTypes: incident.detection ? [incident.detection] : undefined,
      });
      const matches: any[] = res.data?.data?.matches ?? res.data?.data ?? [];
      return (matches[0]?.playbook ?? matches[0]) ?? null;
    },
    enabled: !!incident.id,
    staleTime: 30_000,
  });

  const customConditions: Condition[] = Object.entries(
    matchedPlaybook?.triggerConditions?.context ?? {}
  ).map(([field, value]) => ({
    id: `custom-${field}`,
    field,
    operator: "eq",
    value: String(value),
    weight: 0.5,
    isMatched: true,
  }));

  const addCondition = useMutation({
    mutationFn: async (form: ConditionFormState) => {
      if (!matchedPlaybook?.id) throw new Error("No matched playbook to attach this condition to");
      const nextContext = {
        ...(matchedPlaybook.triggerConditions?.context ?? {}),
        [form.field]: form.value,
      };
      const res = await put(`${endpoint.playbooks.update}/${matchedPlaybook.id}`, {
        triggerConditions: {
          ...matchedPlaybook.triggerConditions,
          context: nextContext,
        },
      });
      if (!res.success) throw new Error("Failed to save condition");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Condition saved to playbook");
      queryClient.invalidateQueries({ queryKey: ["playbook-matched-id", incident.id] });
      setToggleConditionForm(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleAddCondition = (form: ConditionFormState) => {
    addCondition.mutate(form);
  };
  return (
    <div
      id="trigger"
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
              Trigger Conditions
            </h2>
            <p className="mt-0.5 text-[12px] text-black dark:text-zinc-500">
              Pattern match — MatchCondition[] with weighted confidence scoring
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <span className="flex items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/8 px-3 py-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <Check size={12} /> Matched
          </span>
        </div>
      </div>

      {/* Info banner */}
      <div className="mb-5 flex gap-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4">
        <Info
          size={16}
          className="shrink-0 text-black dark:text-zinc-500 mt-0.5"
        />
        <p className="text-[12px] leading-relaxed text-black dark:text-zinc-400">
          All conditions are evaluated against the selected incident context.
          Weighted scores are summed to produce match confidence on the
          proposal, while alternatives stay visible for operator review.
        </p>
      </div>

      {/* Rows */}
      <div className="mb-5 space-y-1.5">
        {conditions.map((c) => (
          <ConditionRow key={c.id} {...c} />
        ))}
        {customConditions.map((c) => (
          <ConditionRow key={c.id} {...c} />
        ))}
      </div>

      {!matchedPlaybook && (
        <p className="mb-3 text-[12px] text-black dark:text-zinc-500">
          No playbook matched this incident — custom conditions can't be saved until one matches.
        </p>
      )}

      {/* Add */}
      {toggleConditionForm && (
        <AddConditionForm
          onAdd={handleAddCondition}
          onCancel={() => setToggleConditionForm(false)}
        />
      )}
      <button
        onClick={() => setToggleConditionForm((prev) => !prev)}
        disabled={!matchedPlaybook || addCondition.isPending}
        className="flex items-center gap-2 rounded-lg border border-zinc-500 dark:border-zinc-700 px-4 py-2 text-[12px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40"
      >
        <Plus size={14} /> Add Condition
      </button>
    </div>
  );
};

export default TriggerConditions;
