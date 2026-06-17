// components/modals/RollbackProductionModal.tsx
"use client";
import React, { useState } from "react";
import Button from "@/components/ui/Button1";
import Modal from "@/components/ui/Modal";

interface RollbackProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RollbackProductionModal({
  isOpen,
  onClose,
}: RollbackProductionModalProps) {
  // Controlled Component States
  const [authNote, setAuthNote] = useState(
    "Approving rollback based on RCA confidence 91% and confirmed image tag mismatch across 3 signals.",
  );
  const [confirmationName, setConfirmationName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect this authorization contract to your backend orchestration engine
    console.log({
      action: "APPROVE_AND_EXECUTE",
      authNote,
      confirmedBy: confirmationName,
      timestamp: new Date().toISOString(),
    });

    // Clear validation states on execution route exit
    setConfirmationName("");
    onClose();
  };

  const handleReject = () => {
    // TODO: Connect to backend escalation route handlers
    console.log({
      action: "REJECT_ROLLBACK",
      authNote,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        className="w-full overflow-hidden bg-white dark:bg-zinc-950 rounded-lg"
      >
        {/* Component-Level Header & Integrated Title */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
            Approve — Rollback Production
          </h2>
        </div>

        {/* Modal Form Body Block */}
        <div className="space-y-4 p-6 max-h-[70vh] overflow-y-auto">
          {/* Governed Execution Warning Box Callout */}
          <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3.5 text-[13px] leading-relaxed text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400">
            <div className="font-semibold mb-1">
              ⚠ Governed Execution — EAL-3
            </div>
            This action will execute a production rollback. Risk Agent
            clearance: <strong className="font-semibold">Passed</strong>. Blast
            radius: Checkout API + adjacent Payments service.
          </div>

          {/* Read-Only Action Parameters Context Box */}
          <div className="flex flex-col">
            <label className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Action
            </label>
            <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3.5 py-3 text-[13px] text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100">
              <strong className="font-semibold text-zinc-900 dark:text-white">
                Rollback
              </strong>{" "}
              — Checkout API image tag from{" "}
              <code className="rounded bg-zinc-200/60 px-1 py-0.5 font-mono text-[11px] text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                v2.4.1-rc3
              </code>{" "}
              →{" "}
              <code className="rounded bg-zinc-200/60 px-1 py-0.5 font-mono text-[11px] text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                v2.4.0-stable
              </code>
            </div>
          </div>

          {/* Input: Textarea Authorisation Note */}
          <div className="flex flex-col">
            <label className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Authorisation Note
            </label>
            <textarea
              required
              value={authNote}
              onChange={(e) => setAuthNote(e.target.value)}
              placeholder="State your reason for production modification approval…"
              className="w-full min-h-[84px] rounded-md border border-zinc-200 p-3 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white resize-y"
            />
          </div>

          {/* Input: Secure Text Signature Input field */}
          <div className="flex flex-col">
            <label className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Your Name (confirmation)
            </label>
            <input
              type="text"
              required
              value={confirmationName}
              onChange={(e) => setConfirmationName(e.target.value)}
              placeholder="Type your full name to authorize execution"
              className="h-9 w-full rounded-md border border-zinc-200 px-3 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
            <span className="mt-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
              Required signing roles: Incident Commander · Risk Agent cleared
            </span>
          </div>
        </div>

        {/* Form Action Controls Triple-Split Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-zinc-100 p-4 dark:border-zinc-800">
          <Button type="button" variant="outline-dark" onClick={onClose}>
            Cancel
          </Button>

          <button
            type="button"
            onClick={handleReject}
            className="inline-flex h-9 items-center justify-center rounded-md border border-red-200 bg-white px-4 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none dark:border-red-900/50 dark:bg-zinc-950 dark:text-red-400 dark:hover:bg-red-950/20"
          >
            Reject
          </button>

          <Button
            type="submit"
            disabled={!confirmationName.trim()}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Approve & Execute
          </Button>
        </div>
      </form>
    </Modal>
  );
}
