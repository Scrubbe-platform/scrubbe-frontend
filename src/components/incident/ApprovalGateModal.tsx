"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  CheckCircle, XCircle, GitPullRequest, AlertTriangle,
  Bot, BookOpen, FileText, Layers, ChevronDown, ChevronUp,
} from "lucide-react";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import type { ResolutionRequest } from "@/hooks/useAgentPresence";

interface Props {
  resolution: ResolutionRequest;
  ticketId: string;
  onClose: () => void;
  onGranted?: () => void;
  onRejected?: () => void;
}

const AGENT_COLORS: Record<string, string> = {
  "agent:resolver": "bg-emerald-600",
  "agent:code-fix": "bg-blue-600",
};

const ApprovalGateModal = ({ resolution, ticketId, onClose, onGranted, onRejected }: Props) => {
  const { post } = useFetch();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [expanded, setExpanded] = useState(false);

  const agentColor = AGENT_COLORS[resolution.requestedBy] ?? "bg-purple-600";
  const agentInitials = resolution.agentName
    ? resolution.agentName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "AI";

  const grantMutation = useMutation({
    mutationFn: async () => {
      const res = await post(endpoint.incident_resolution.grant, {
        approvalId: resolution.approvalId,
        ticketId,
        reason: reason || "Approved by user",
      });
      if (!res.success) throw new Error((res.data as any)?.message ?? "Failed to grant approval");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Incident resolution approved. Pipeline running...");
      queryClient.invalidateQueries({ queryKey: ["incident", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["INCIDENTS"] });
      onGranted?.();
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      const res = await post(endpoint.incident_resolution.reject, {
        approvalId: resolution.approvalId,
        reason: reason || "Rejected by user",
      });
      if (!res.success) throw new Error((res.data as any)?.message ?? "Failed to reject");
      return res.data;
    },
    onSuccess: () => {
      toast("Resolution rejected.", { icon: "🚫" });
      onRejected?.();
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const isPending = grantMutation.isPending || rejectMutation.isPending;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        {/* Header */}
        <div className="bg-[#072929] p-5">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full ${agentColor} flex items-center justify-center text-white text-sm font-bold shrink-0 ring-2 ring-white/20`}>
              {agentInitials}
            </div>
            <div>
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Approval Gate</p>
              <p className="text-white font-semibold text-base">
                {resolution.agentName ?? "Scrubbe AI"} is requesting resolution
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Incident */}
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3 border border-zinc-200 dark:border-zinc-700">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-1">Incident</p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{resolution.ticketRef}</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">{resolution.summary}</p>
          </div>

          {/* Resolution summary */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} className="text-zinc-500" />
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Resolution Summary</p>
            </div>
            <p className="text-sm text-zinc-700 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
              {resolution.resolutionSummary}
            </p>
          </div>

          {/* Root cause */}
          {resolution.rootCause && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-amber-500" />
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Root Cause</p>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-200">{resolution.rootCause}</p>
            </div>
          )}

          {/* Code PR section */}
          {resolution.isCodeRelated && resolution.prUrl && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <GitPullRequest size={14} className="text-blue-600 dark:text-blue-400" />
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                  Code Fix — Pull Request {resolution.prNumber ? `#${resolution.prNumber}` : ""}
                </p>
              </div>
              <a
                href={resolution.prUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 underline break-all"
              >
                {resolution.prUrl}
              </a>
              {resolution.requestMerge && (
                <div className="mt-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-2">
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                    ⚠️ Agent is also requesting permission to merge this PR
                  </p>
                </div>
              )}
            </div>
          )}

          {/* What will happen on approval */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors w-full"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            What happens when you approve?
          </button>
          {expanded && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 space-y-2">
              {[
                { icon: CheckCircle, text: "Incident marked RESOLVED", color: "text-emerald-600" },
                { icon: FileText, text: "Postmortem auto-compiled (Draft)", color: "text-blue-600" },
                { icon: BookOpen, text: "Resolution added to Knowledge Base", color: "text-purple-600" },
                { icon: Layers, text: "Pattern added to Incident Library", color: "text-amber-600" },
                ...(resolution.isCodeRelated && resolution.prUrl ? [{ icon: GitPullRequest, text: resolution.requestMerge ? "PR merged into base branch" : "PR remains open for review", color: "text-blue-600" }] : []),
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <item.icon size={13} className={item.color} />
                  <p className="text-xs text-zinc-700 dark:text-zinc-300">{item.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Reason (optional) */}
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400 font-medium block mb-1">
              Reason (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Add a note about your decision..."
              rows={2}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 p-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#02DD86]/40"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex gap-3">
          <button
            onClick={() => rejectMutation.mutate()}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <XCircle size={16} />
            Reject
          </button>
          <button
            onClick={() => grantMutation.mutate()}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#02DD86] hover:bg-[#00c97a] text-[#072929] text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <CheckCircle size={16} />
            {resolution.requestMerge ? "Approve & Merge" : "Approve Resolution"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalGateModal;
