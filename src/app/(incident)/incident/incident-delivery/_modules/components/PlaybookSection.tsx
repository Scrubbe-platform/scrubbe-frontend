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
  const [isPlaybook, setIsPlaybook] = useState(false);
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

  const name = matched?.name ?? "Merge Conflict Remediation";
  const description = matched?.description ?? "Resolve conflicts safely; propose resolution patch as PR.";
  const stepCount = matched?.steps?.length ?? matched?.stepCount ?? 5;
  const scope = matched?.config?.scope ?? matched?.scope ?? "pr-only";

  return (
    <div className=" p-5 text-white border border-IMSCyan/40 rounded-xl w-full bg-gradient-to-b from-[#0074834D] to-[#004B571A] flex items-start justify-center">
      <div className="w-full">
        {/* Header Area */}
        <div className="flex justify-between items-start mb-6 ">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Playbook
            </h2>
            <div className="space-y-2">
              <p className="text-lg text-slate-300 font-medium">
                Matched delivery playbook
              </p>
              <p className=" text-slate-400 font-medium">
                Defines safe steps and verification patterns.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPlaybook(true)}
            className="flex items-center gap-2 px-3 py-2 border border-green-400 text-green-400 rounded-xl text-base font-bold hover:bg-green-400/10 transition-all duration-200"
          >
            Open
          </button>
        </div>

        {/* Content Card */}
        <div className="bg-black border border-slate-800 rounded-2xl p-6 mt-8 shadow-inner">
          {isLoading ? (
            <p className="text-xs text-slate-500 animate-pulse">Matching playbook…</p>
          ) : (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-slate-100">{name}</h3>
              <p className="text-base text-slate-400 font-medium">{description}</p>

              {/* Badges */}
              <div className="flex gap-3 pt-2">
                <div className="px-4 py-1.5 rounded-full border border-slate-700 text-sm font-bold text-slate-300 flex items-center">
                  Steps : {stepCount}
                </div>
                <div className="px-4 py-1.5 rounded-full border border-slate-700 text-sm font-bold text-slate-300 flex items-center">
                  default steps : {scope}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isPlaybook && (
        <SideModal
          isOpen={isPlaybook}
          onClose={() => setIsPlaybook(false)}
          title={"Playbook"}
          subTitle="Active playbook"
        >
          <Playbook />
        </SideModal>
      )}
    </div>
  );
};

export default PlaybookSection;
