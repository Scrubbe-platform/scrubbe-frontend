// components/modals/AddNoteModal.tsx
"use client";
import React, { useState } from "react";
import Button from "@/components/ui/Button1";
import Modal from "@/components/ui/Modal";

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddNoteModal({ isOpen, onClose }: AddNoteModalProps) {
  // Controlled form state for the markdown context input box
  const [noteText, setNoteText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Senior Practice: Log out clear contract payloads for your backend team to wire up APIs easily
    console.log({
      action: "ADD_HANDOVER_NOTE",
      payload: {
        text: noteText,
        timestamp: new Date().toISOString(),
      },
    });

    // Clear state inputs on successful submit cycle execution
    setNoteText("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        className="w-full overflow-hidden bg-white dark:bg-zinc-950 rounded-lg"
      >
        {/* Component-Level Header & Title */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-base font-semibold tracking-tight text-stone-900 dark:text-white">
            Add Handover Note
          </h2>
        </div>

        {/* Modal Content Body Container */}
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

        {/* Form Action Controls Footer */}
        <div className="flex justify-end gap-2 border-t border-stone-100 p-4 dark:border-zinc-800">
          <Button type="button" variant="outline-dark" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!noteText.trim()}>
            Add Note
          </Button>
        </div>
      </form>
    </Modal>
  );
}
