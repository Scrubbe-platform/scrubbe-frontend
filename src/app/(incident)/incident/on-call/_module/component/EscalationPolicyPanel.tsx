"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Bot,
  Building2,
  ArrowDown,
  ChevronLeft,
} from "lucide-react";
import Button from "@/components/ui/Button1";
import CreateEscalationPolicyModal from "./CreateEscalationPolicyModal";
import { useRouter } from "next/navigation";
import {
  deleteEscalationPolicy,
  fetchEscalationPolicies,
} from "@/lib/escalation/escalation.api";
import { EscalationPolicyRecord } from "../types/oncall-type";

const ESCALATION_POLICIES_QUERY_KEY = ["escalation-policies"];

export default function EscalationPoliciesPanel() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] =
    useState<EscalationPolicyRecord | null>(null);

  const { data: policies = [], isLoading } = useQuery({
    queryKey: ESCALATION_POLICIES_QUERY_KEY,
    queryFn: fetchEscalationPolicies,
  });

  const refetchPolicies = () =>
    queryClient.invalidateQueries({ queryKey: ESCALATION_POLICIES_QUERY_KEY });

  const handleEditPolicy = (policy: EscalationPolicyRecord) => {
    setEditingPolicy(policy);
    setIsModalOpen(true);
  };

  const handleNewPolicy = () => {
    setEditingPolicy(null);
    setIsModalOpen(true);
  };

  const handleDeletePolicy = async (id: string) => {
    if (!confirm("Are you sure you want to delete this policy?")) return;
    try {
      await deleteEscalationPolicy(id);
      toast.success("Escalation policy deleted");
      refetchPolicies();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete policy",
      );
    }
  };

  return (
    <div className="w-full p-6">
      <div className="mb-4">
        <Button
          leftIcon={<ChevronLeft size={16} />}
          size="sm"
          variant="outline-dark"
          onClick={() => router.back()}
        >
          Back
        </Button>
      </div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Escalation Policies
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Define escalation chains for each incident severity
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleNewPolicy}
          leftIcon={<Plus size={14} className="mr-1" />}
        >
          New Policy
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading && (
          <div className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            Loading escalation policies...
          </div>
        )}

        {!isLoading && policies.length === 0 && (
          <div className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            No escalation policies yet. Create one to start auto-escalating
            unacknowledged incidents.
          </div>
        )}

        {policies.map((policy) => (
          <div
            key={policy.id}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-start justify-between border-b border-zinc-100 pb-3 mb-4 dark:border-zinc-900">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-bold text-zinc-900 dark:text-white">
                    {policy.name}
                  </h3>

                  {policy.warRoomOnFinalStep && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
                      <Building2 size={11} /> War Room
                    </span>
                  )}
                  {policy.autoEscalate && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400">
                      <Bot size={11} /> Auto-esc
                    </span>
                  )}
                </div>
                <div className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Trigger:{" "}
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {policy.severities.join(", ") || "Unset"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEditPolicy(policy)}
                  className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-300 transition-colors"
                  title="Edit Policy"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDeletePolicy(policy.id)}
                  className="rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-colors"
                  title="Delete Policy"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {policy.steps.map((step, index) => (
                <React.Fragment key={step.id ?? index}>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 shrink-0 rounded-full border flex items-center justify-center font-mono text-[11px] font-bold dark:bg-zinc-100 dark:text-zinc-950">
                      {index + 1}
                    </div>

                    <div className="flex flex-1 items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/50 px-3.5 py-2 text-xs font-semibold text-zinc-800 dark:border-zinc-900 dark:bg-zinc-900/30 dark:text-zinc-200">
                      <span>{step.targetLabel || "Unassigned"}</span>
                      <span className="font-mono text-zinc-400 dark:text-zinc-500">
                        {step.timeoutMinutes}min · {step.channel}
                      </span>
                    </div>
                  </div>

                  {index < policy.steps.length - 1 && (
                    <div className="pl-2.5 my-[1px] text-zinc-300 dark:text-zinc-700">
                      <ArrowDown size={12} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>

      <CreateEscalationPolicyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={refetchPolicies}
        policy={editingPolicy}
      />
    </div>
  );
}
