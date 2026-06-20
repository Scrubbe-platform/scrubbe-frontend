// components/modals/TransferOwnershipModal.tsx
"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button1";
import Modal from "@/components/ui/Modal";
import useMember from "@/hooks/useMember";
import { transferHandover, updateHandover, TransferBlockedError } from "@/lib/handover/handover.api";
import { HandoverRecord } from "../types/index";

interface TransferOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  handover?: HandoverRecord;
  onTransferred?: () => void;
}

export default function TransferOwnershipModal({ isOpen, onClose, handover, onTransferred }: TransferOwnershipModalProps) {
  const [nextCommanderId, setNextCommanderId] = useState("");
  const [confirmationNote, setConfirmationNote] = useState("");
  const [force, setForce] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { data: members = [] } = useMember();

  useEffect(() => {
    if (handover) setNextCommanderId(handover.nextCommanderId ?? "");
  }, [handover]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handover) return;

    setSubmitting(true);
    try {
      if (nextCommanderId !== (handover.nextCommanderId ?? "")) {
        await updateHandover(handover.id, { nextCommanderId: nextCommanderId || null });
      }
      await transferHandover(handover.id, { confirmationNote: confirmationNote.trim() || undefined, force });
      toast.success("Handover transferred");
      setConfirmationNote("");
      setForce(false);
      onTransferred?.();
      onClose();
    } catch (err) {
      if (err instanceof TransferBlockedError) {
        toast.error(`${err.message}: ${err.blockingTasks.map((t) => t.title).join(", ")}`);
      } else {
        toast.error(err instanceof Error ? err.message : "Failed to transfer handover");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="w-full overflow-hidden bg-white dark:bg-zinc-950 rounded-lg">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-base font-semibold tracking-tight text-stone-900 dark:text-white">
            Transfer Ownership
          </h2>
        </div>

        <div className="space-y-4 p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                From Owner
              </label>
              <div className="h-9 flex items-center rounded-md border border-stone-200 px-3 text-[13px] text-stone-700 bg-stone-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                {handover?.currentOwnerLabel ?? "—"}
              </div>
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                To Owner
              </label>
              <div className="h-9 flex items-center rounded-md border border-stone-200 px-3 text-[13px] text-stone-700 bg-stone-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                {handover?.nextOwnerLabel ?? "—"}
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Incoming Commander
            </label>
            <select
              value={nextCommanderId}
              onChange={(e) => setNextCommanderId(e.target.value)}
              className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-[13px] text-stone-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstname} {m.lastname}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Transfer Notes
            </label>
            <textarea
              value={confirmationNote}
              onChange={(e) => setConfirmationNote(e.target.value)}
              placeholder="Add a confirmation note for the audit trail…"
              className="w-full min-h-[84px] rounded-md border border-stone-200 p-3 text-[13px] text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white resize-y"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-stone-800 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={force}
              onChange={(e) => setForce(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
            />
            Transfer anyway even if non-critical tasks are still pending
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-stone-100 p-4 dark:border-zinc-800">
          <Button type="button" variant="outline-dark" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || !handover}>
            {submitting ? "Transferring…" : "Save Transfer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
