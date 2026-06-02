"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SideModal from "@/components/ui/SideModal";
import Playbook from "./Modal/Playbook";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";

const PlaybookSection: React.FC<{ incidentId?: string; category?: string }> = ({
  incidentId,
  category,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { post } = useFetch();

  const { data: matched, isLoading } = useQuery({
    queryKey: ["playbook-match", incidentId, category],
    queryFn: async () => {
      const res = await post(endpoint.playbooks.match, {
        incidentId,
        category,
        context: { incidentId, category },
      });
      if (res.success) {
        const d = res.data?.data;
        return (d?.playbook ?? d?.playbooks?.[0] ?? null) as any;
      }
      return null;
    },
    enabled: !!(incidentId || category),
  });

  const name       = matched?.name                                ?? "Merge Conflict Remediation";
  const description = matched?.description                        ?? "Resolve conflicts safely; propose resolution patch as PR.";
  const stepCount  = matched?.steps?.length ?? matched?.stepCount ?? 5;
  const scope      = matched?.config?.scope ?? matched?.scope     ?? "pr-only";

  return (
    <>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="space-y-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Playbook
            </p>
            <p className="text-[14px] font-semibold text-zinc-800 dark:text-zinc-100">
              Matched delivery playbook
            </p>
            <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
              Defines safe steps and verification patterns.
            </p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 text-[12px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors shrink-0"
          >
            Open
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {isLoading ? (
            <p className="text-[12px] text-zinc-400 dark:text-zinc-500 animate-pulse px-1">
              Matching playbook…
            </p>
          ) : (
            <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-3">
              <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-100">
                {name}
              </p>
              <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {description}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Chip label="Steps" value={String(stepCount)} />
                <Chip label="Scope"  value={scope}             />
              </div>
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <SideModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Playbook"
          subTitle="Active playbook"
        >
          <Playbook />
        </SideModal>
      )}
    </>
  );
};

const Chip = ({ label, value }: { label: string; value: string }) => (
  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[11px] font-mono">
    <span className="text-zinc-400 dark:text-zinc-500">{label}:</span>
    <span className="text-zinc-700 dark:text-zinc-300">{value}</span>
  </span>
);

export default PlaybookSection;