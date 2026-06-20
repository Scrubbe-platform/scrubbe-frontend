// components/modals/RollbackProductionModal.tsx
"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button1";
import Modal from "@/components/ui/Modal";
import { updateHandoverTask } from "@/lib/handover/handover.api";
import { HandoverTaskRecord } from "../types/index";

interface RollbackProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  handoverId?: string;
  task?: HandoverTaskRecord | null;
  onResolved?: () => void;
}

export default function RollbackProductionModal({
  isOpen,
  onClose,
  handoverId,
  task,
  onResolved,
}: RollbackProductionModalProps) {
  const [authNote, setAuthNote] = useState("");
  const [confirmationName, setConfirmationName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resolveTask = async (status: "COMPLETED" | "WAIVED") => {
    if (!handoverId || !task) return;
    setSubmitting(true);
    try {
      await updateHandoverTask(handoverId, task.id, { status });
      toast.success(status === "COMPLETED" ? "Task approved and completed" : "Task waived");
      setConfirmationName("");
      setAuthNote("");
      onResolved?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void resolveTask("COMPLETED");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="w-full overflow-hidden bg-white dark:bg-zinc-950 rounded-lg">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
            Resolve Critical Task
          </h2>
        </div>

        <div className="space-y-4 p-6 max-h-[70vh] overflow-y-auto">
          <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3.5 text-[13px] leading-relaxed text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400">
            <div className="font-semibold mb-1">⚠ Critical task — blocks transfer</div>
            This task is marked CRITICAL and must be completed or waived before the handover can transfer.
          </div>

          <div className="flex flex-col">
            <label className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Task
            </label>
            <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3.5 py-3 text-[13px] text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100">
              <strong className="font-semibold text-zinc-900 dark:text-white">{task?.title ?? "—"}</strong>
              {task?.assigneeLabel && <span className="text-zinc-500 dark:text-zinc-400"> · {task.assigneeLabel}</span>}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Note
            </label>
            <textarea
              value={authNote}
              onChange={(e) => setAuthNote(e.target.value)}
              placeholder="State your reason for completing or waiving this task…"
              className="w-full min-h-[84px] rounded-md border border-zinc-200 p-3 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white resize-y"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Your Name (confirmation)
            </label>
            <input
              type="text"
              required
              value={confirmationName}
              onChange={(e) => setConfirmationName(e.target.value)}
              placeholder="Type your full name to confirm"
              className="h-9 w-full rounded-md border border-zinc-200 px-3 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-zinc-100 p-4 dark:border-zinc-800">
          <Button type="button" variant="outline-dark" onClick={onClose}>
            Cancel
          </Button>

          <button
            type="button"
            onClick={() => resolveTask("WAIVED")}
            disabled={submitting || !confirmationName.trim()}
            className="inline-flex h-9 items-center justify-center rounded-md border border-red-200 bg-white px-4 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none disabled:opacity-50 dark:border-red-900/50 dark:bg-zinc-950 dark:text-red-400 dark:hover:bg-red-950/20"
          >
            Waive
          </button>

          <Button type="submit" disabled={submitting || !confirmationName.trim()} className="disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? "Submitting…" : "Approve & Complete"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
