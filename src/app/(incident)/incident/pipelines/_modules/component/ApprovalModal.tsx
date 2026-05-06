"use client";
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useFetch } from '@/hooks/useFetch';
import { endpoint } from '@/lib/api/endpoint';
import { toast } from 'sonner';

const ApprovalModal = ({ runId, action = "MERGE", onClose }: { runId: string; action?: string; onClose: () => void }) => {
  const [outcome, setOutcome] = useState<"Approved" | "Reject" | "">("");
  const [note, setNote] = useState("");
  const { post } = useFetch();

  const { mutateAsync: submit, isPending } = useMutation({
    mutationFn: async () => {
      if (!outcome) throw new Error("Select an outcome before saving");
      const res = await post(endpoint.decisions.propose, {
        type: action,
        title: `${outcome === "Approved" ? "Approve" : "Reject"} ${action} — Run ${runId}`,
        description: note || `${action} decision for pipeline run ${runId}`,
        riskLevel: "MEDIUM",
        requiresApproval: outcome === "Approved",
        status: outcome === "Approved" ? "APPROVED" : "BLOCKED",
        context: { runId, action, note },
      });
      if (!res.success) throw new Error(res.data ?? "Failed to record decision");
      return res.data;
    },
    onSuccess: () => {
      toast.success(outcome === "Approved" ? "Approval recorded" : "Rejection recorded");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="backdrop-blur-sm flex items-center justify-center font-sans">
      <div className="w-full overflow-hidden relative flex flex-col">
        {/* HEADER */}
        <div className="pb-6">
          <h2 className="text-white text-2xl font-bold tracking-tight mb-2">Approval required</h2>
          <p className="text-white font-black text-sm uppercase tracking-[0.1em]">
            Action: {action} • Run {runId}
          </p>
        </div>

        <div className="space-y-6">
          {/* APPROVAL NOTE */}
          <div className="bg-transparent border border-neutral-400 rounded-lg p-6 space-y-3">
            <h4 className="text-white font-bold text-[15px]">Approval note</h4>
            <p className="text-[#94A3B8] text-xs">Recorded to decision log for audit.</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why is this safe? What did you validate"
              className="w-full bg-[#0B1224] border border-neutral-400 rounded-xl p-4 text-sm text-[#D1D5DB] placeholder-[#475569] focus:outline-none focus:border-[#00CAD8]/50 min-h-[120px] resize-none transition-all"
            />
          </div>

          {/* APPROVERS */}
          <div className="bg-transparent border border-neutral-400 rounded-lg p-6 space-y-4">
            <h4 className="text-white font-bold text-[15px]">Approvers</h4>
            <p className="text-[#94A3B8] text-xs leading-relaxed">
              Scrubbe auto-detects your identity via SSO/session. Choose an approval outcome:
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setOutcome('Approved')}
                className={`px-3 py-3 rounded-xl font-bold text-sm border transition-all w-fit ${
                  outcome === 'Approved'
                    ? 'border-[#00CAD8] bg-[#00CAD8]/10 text-[#00CAD8]'
                    : 'border-[#00CAD8] text-[#00CAD8] hover:bg-[#00CAD8]/5'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setOutcome('Reject')}
                className={`px-3 py-3 rounded-xl font-bold text-sm border transition-all w-fit ${
                  outcome === 'Reject'
                    ? 'border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444]'
                    : 'border-[#94A3B8] text-[#94A3B8] hover:bg-[#EF4444]/5'
                }`}
              >
                Reject
              </button>
            </div>
          </div>

          {/* POLICY GATE */}
          <div className="bg-transparent border border-neutral-400 rounded-lg p-6 space-y-2">
            <h4 className="text-white font-bold text-[15px]">Policy gate</h4>
            <p className="text-[#94A3B8] text-xs leading-relaxed">
              {action} remediation requires owning-team approval before execution.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-10 py-3 rounded-xl border border-IMSCyan text-IMSCyan font-bold text-sm disabled:opacity-50"
          >
            Close
          </button>
          <button
            onClick={() => submit()}
            disabled={isPending || !outcome}
            className="px-10 py-3 rounded-xl bg-IMSCyan text-black font-black text-sm hover:brightness-110 shadow-[0_0_20px_rgba(62,233,255,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;
