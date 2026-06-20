// components/modals/AddNoteModal.tsx
"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button1";
import Modal from "@/components/ui/Modal";
import { addHandoverNote } from "@/lib/handover/handover.api";

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  handoverId?: string;
  onAdded?: () => void;
}

export default function AddNoteModal({ isOpen, onClose, handoverId, onAdded }: AddNoteModalProps) {
  const [noteText, setNoteText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverId || !noteText.trim()) return;

    setSubmitting(true);
    try {
      await addHandoverNote(handoverId, { body: noteText.trim() });
      setNoteText("");
      onAdded?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add note");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="w-full overflow-hidden bg-white dark:bg-zinc-950 rounded-lg">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-base font-semibold tracking-tight text-stone-900 dark:text-white">
            Add Handover Note
          </h2>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col">
            <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Note
            </label>
            <textarea
              required
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add operation context, dependencies, or outstanding tasks for the incoming team…"
              className="w-full min-h-[120px] rounded-md border border-stone-200 p-3 text-[13px] text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white resize-y"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-stone-100 p-4 dark:border-zinc-800">
          <Button type="button" variant="outline-dark" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || !noteText.trim()}>
            {submitting ? "Adding…" : "Add Note"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
