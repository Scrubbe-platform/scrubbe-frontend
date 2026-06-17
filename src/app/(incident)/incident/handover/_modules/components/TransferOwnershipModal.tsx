// components/modals/TransferOwnershipModal.tsx
"use client";
import React, { useState } from "react";
import Button from "@/components/ui/Button1";
import Modal from "@/components/ui/Modal";

interface TransferOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TransferOwnershipModal({
  isOpen,
  onClose,
}: TransferOwnershipModalProps) {
  // Controlled Form States
  const [fromTeam, setFromTeam] = useState("London Platform Team");
  const [toTeam, setToTeam] = useState("US Platform Team");
  const [incomingCommander, setIncomingCommander] = useState("Sarah Wilson");
  const [transferTime, setTransferTime] = useState("18:00");
  const [transferNotes, setTransferNotes] = useState(
    "US team should verify deployment metrics for at least 15 minutes post rollback.",
  );

  // Controlled Checkbox Group State
  const [notifyVia, setNotifyVia] = useState({
    email: true,
    slack: true,
    pagerduty: false,
  });

  const handleCheckboxChange = (key: keyof typeof notifyVia) => {
    setNotifyVia((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Wire up to your backend API integration contract handler
    console.log({
      fromTeam,
      toTeam,
      incomingCommander,
      transferTime,
      notifyVia,
      transferNotes,
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
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-base font-semibold tracking-tight text-stone-900 dark:text-white">
            Transfer Ownership
          </h2>
        </div>

        {/* Modal Form Body Container */}
        <div className="space-y-4 p-6 max-h-[70vh] overflow-y-auto">
          {/* Grid: From Team & To Team Selection Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                From Team
              </label>
              <select
                value={fromTeam}
                onChange={(e) => setFromTeam(e.target.value)}
                className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-[13px] text-stone-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              >
                <option value="London Platform Team">
                  London Platform Team
                </option>
                <option value="US Platform Team">US Platform Team</option>
                <option value="Singapore Team">Singapore Team</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                To Team
              </label>
              <select
                value={toTeam}
                onChange={(e) => setToTeam(e.target.value)}
                className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-[13px] text-stone-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              >
                <option value="US Platform Team">US Platform Team</option>
                <option value="Singapore Team">Singapore Team</option>
                <option value="London Platform Team">
                  London Platform Team
                </option>
              </select>
            </div>
          </div>

          {/* Grid: Incoming Commander & Transfer Time Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                Incoming Commander
              </label>
              <input
                type="text"
                value={incomingCommander}
                onChange={(e) => setIncomingCommander(e.target.value)}
                placeholder="Commander Name"
                className="h-9 w-full rounded-md border border-stone-200 px-3 text-[13px] text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                Transfer Time (UTC)
              </label>
              <input
                type="time"
                value={transferTime}
                onChange={(e) => setTransferTime(e.target.value)}
                className="h-9 w-full rounded-md border border-stone-200 px-3 text-[13px] text-stone-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
            </div>
          </div>

          {/* Input Group: Notification Channels Multi-Select Checkboxes */}
          <div className="flex flex-col">
            <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Notify Via
            </label>
            <div className="flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-stone-800 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={notifyVia.email}
                  onChange={() => handleCheckboxChange("email")}
                  className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
                Email
              </label>

              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-stone-800 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={notifyVia.slack}
                  onChange={() => handleCheckboxChange("slack")}
                  className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
                Slack
              </label>

              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-stone-800 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={notifyVia.pagerduty}
                  onChange={() => handleCheckboxChange("pagerduty")}
                  className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
                PagerDuty
              </label>
            </div>
          </div>

          {/* Input: Context notes textarea field */}
          <div className="flex flex-col">
            <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Transfer Notes
            </label>
            <textarea
              value={transferNotes}
              onChange={(e) => setTransferNotes(e.target.value)}
              placeholder="Provide operation context handover parameters for next on-call window..."
              className="w-full min-h-[84px] rounded-md border border-stone-200 p-3 text-[13px] text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white resize-y"
            />
          </div>
        </div>

        {/* Modal Action Controls Footer */}
        <div className="flex justify-end gap-2 border-t border-stone-100 p-4 dark:border-zinc-800">
          <Button type="button" variant="outline-dark" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Transfer</Button>
        </div>
      </form>
    </Modal>
  );
}
