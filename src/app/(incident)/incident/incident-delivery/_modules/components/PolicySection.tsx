"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SideModal from "@/components/ui/SideModal";
import PolicyDecision from "./Modal/PolicyDecision";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";

const PolicySection: React.FC<{ incidentId?: string }> = ({ incidentId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { get } = useFetch();

  const { data: guardrail } = useQuery({
    queryKey: ["guardrails-incident", incidentId],
    queryFn: async () => {
      const res = await get(endpoint.guardrails.list);
      if (res.success) {
        const list = res.data?.data?.guardrails ?? res.data?.data ?? [];
        return (list[0] ?? null) as any;
      }
      return null;
    },
  });

  const autoActivate  = guardrail?.config?.autoActivate    ?? false;
  const approvalGate  = guardrail?.config?.requireApproval ?? true;
  const scope         = guardrail?.config?.scope            ?? "pr-only";
  const reasons: string[] = guardrail?.config?.reasons ?? [
    "Merge conflicts are correctness-sensitive → approval required.",
  ];

  const policyFields = [
    { title: "Auto-activate", value: autoActivate ? "Yes" : "No"                       },
    { title: "Approval gate", value: approvalGate ? "Required" : "Not required"        },
    { title: "Execution scope", value: scope                                            },
  ];

  return (
    <>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="space-y-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Policy
            </p>
            <p className="text-[14px] font-semibold text-zinc-800 dark:text-zinc-100">
              When and how execution is allowed
            </p>
            <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
              Auto-activation, gates, scope, and reasons.
            </p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 text-[12px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors shrink-0"
          >
            Details
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">

          {/* Policy fields */}
          <div className="grid grid-cols-3 gap-2.5">
            {policyFields.map(({ title, value }) => (
              <div
                key={title}
                className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3.5 flex flex-col gap-1.5"
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  {title}
                </p>
                <p className="text-[13px] font-medium text-zinc-700 dark:text-zinc-200">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Reasons */}
          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">
              Reasons
            </p>
            <ul className="space-y-2">
              {reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600 mt-1.5 shrink-0" />
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{r}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {isOpen && (
        <SideModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Policy decision"
          subTitle="Why actions are allowed or blocked"
        >
          <PolicyDecision />
        </SideModal>
      )}
    </>
  );
};

export default PolicySection;