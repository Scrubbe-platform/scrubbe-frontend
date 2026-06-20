// components/oncall/EditAssignmentModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { X, RefreshCw, UserMinus } from "lucide-react";
import Button from "@/components/ui/Button1";
import Modal from "@/components/ui/Modal";
import { Member } from "./RosterView";

interface EditAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null; // The active member context passed from the row click
  allMembers: Member[]; // List of all members used to populate reassign options
  onSave: (payload: any) => void;
  onRemove: (id: string) => void;
}

const OVERRIDE_REASONS = [
  "Vacation / PTO",
  "Sick leave",
  "Voluntary swap",
  "Emergency coverage",
  "Admin reassignment",
];

export default function EditAssignmentModal({
  isOpen,
  onClose,
  member,
  allMembers,
  onSave,
  onRemove,
}: EditAssignmentModalProps) {
  // Controlled form states
  const [currentMemberId, setCurrentMemberId] = useState("");
  const [reassignToId, setReassignToId] = useState("");
  const [overrideReason, setOverrideReason] = useState(OVERRIDE_REASONS[0]);
  const [notes, setNotes] = useState("");

  // Sync state hooks when member context changes dynamically
  useEffect(() => {
    if (member) {
      setCurrentMemberId(member.id);
      // Automatically default fallback assignment target to the next member in sequence
      const fallbackTarget = allMembers.find((m) => m.id !== member.id);
      setReassignToId(fallbackTarget ? fallbackTarget.id : "");
      setNotes("");
      setOverrideReason(OVERRIDE_REASONS[0]);
    }
  }, [member, allMembers]);

  if (!member) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      memberId: currentMemberId,
      reassignToId,
      reason: overrideReason,
      notes,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        className="w-full overflow-hidden bg-white dark:bg-zinc-950 rounded-lg"
      >
        {/* Modal Header & Title context */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
              Edit Assignment / Re-assign
            </h2>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              Modify or reassign this on-call rotation allocation slot
            </p>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="space-y-4 p-6 max-h-[70vh] overflow-y-auto">
          {/* Target Active Member selection list */}
          <div className="flex flex-col">
            <label className="mb-1.5 text-xs font-bold tracking-wide text-zinc-700 dark:text-zinc-400">
              Current Member
            </label>
            <select
              value={currentMemberId}
              onChange={(e) => setCurrentMemberId(e.target.value)}
              className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-[13px] text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            >
              {allMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.role})
                </option>
              ))}
            </select>
          </div>

          {/* Re-assign destination drop-down menu layer */}
          <div className="flex flex-col">
            <label className="mb-1.5 text-xs font-bold tracking-wide text-zinc-700 dark:text-zinc-400">
              Reassign to
            </label>
            <select
              value={reassignToId}
              onChange={(e) => setReassignToId(e.target.value)}
              className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-[13px] text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            >
              <option value="">Select fallback re-assignment member...</option>
              {allMembers
                .filter((m) => m.id !== currentMemberId)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.role})
                  </option>
                ))}
            </select>
          </div>

          {/* Shift Override Reason configuration dropdown options */}
          <div className="flex flex-col">
            <label className="mb-1.5 text-xs font-bold tracking-wide text-zinc-700 dark:text-zinc-400">
              Shift Override Reason
            </label>
            <select
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-[13px] text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            >
              {OVERRIDE_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          {/* Audit trail documentation area notes text box */}
          <div className="flex flex-col">
            <label className="mb-1.5 text-xs font-bold tracking-wide text-zinc-700 dark:text-zinc-400">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes for audit trail log parameters..."
              rows={3}
              className="w-full rounded-md border border-zinc-200 p-3 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white resize-none"
            />
          </div>
        </div>

        {/* Modal Action Footer Buttons split layout */}
        <div className="flex items-center justify-between border-t border-zinc-100 p-4 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
          {/* Destructive state remove profile operation */}
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  `Remove ${member.fullName} from rotation shift allocation filters?`,
                )
              ) {
                onRemove(member.id);
                onClose();
              }
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-[13px] font-semibold text-red-600 hover:bg-red-50/50 transition-colors dark:border-red-900/50 dark:bg-zinc-950 dark:text-red-400"
          >
            <UserMinus size={14} /> Remove
          </button>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline-dark" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              leftIcon={<RefreshCw size={13} className="mr-1" />}
            >
              Reassign
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
