// components/modals/InviteModal.tsx
"use client";

import React, { useState } from "react";
import { X, Link2, Check, UserPlus } from "lucide-react";
import Button from "@/components/ui/Button1";
import Modal from "@/components/ui/Modal";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  handoverId?: string;
  onInviteSent?: (payload: { emailOrName: string; permission: string }) => void;
}

export default function InviteModal({
  isOpen,
  onClose,
  handoverId = "HO-001283",
  onInviteSent,
}: InviteModalProps) {
  // 1. Controlled Component States
  const [searchQuery, setSearchQuery] = useState("");
  const [permission, setPermission] = useState("Can view and comment");
  const [copied, setCopied] = useState(false);

  const shareUrl = `https://app.scrubbe.io/handovers/${handoverId}`;

  // 2. Clipboard API Handler with visual feedback
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

  // 3. Form Dispatch Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Trigger explicit callback hook contract if available
    if (onInviteSent) {
      onInviteSent({ emailOrName: searchQuery, permission });
    } else {
      console.log("INVITE_SUBMIT_PAYLOAD:", { searchQuery, permission });
    }

    // Reset local field criteria parameters on successful dispatch exit
    setSearchQuery("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        className="w-full overflow-hidden bg-white dark:bg-zinc-950 rounded-lg"
      >
        {/* Component-Level Header & Integrated Title */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-stone-900 dark:text-white">
              Invite Team Members
            </h2>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="space-y-5 p-6 max-h-[70vh] overflow-y-auto">
          {/* Input Group: Search / Name Identity criteria lookup */}
          <div className="flex flex-col">
            <label className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Team Members
            </label>
            <input
              type="text"
              required
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email…"
              className="h-9 w-full rounded-md border border-stone-200 px-3 text-[13px] text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-zinc-700 transition-all"
            />
            <span className="mt-1.5 text-[11px] leading-normal text-stone-400 dark:text-zinc-500">
              They'll receive a link to view and collaborate on this handover in
              real-time.
            </span>
          </div>

          {/* Input Group: Permissions level selectors */}
          <div className="flex flex-col">
            <label className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Permission
            </label>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-[13px] text-stone-900 outline-none focus:border-stone-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-zinc-700 cursor-pointer"
            >
              <option value="Can view and comment">Can view and comment</option>
              <option value="Can edit">Can edit</option>
              <option value="View only">View only</option>
            </select>
          </div>

          {/* Input Group: Clipboard URL copy segment */}
          <div className="flex flex-col">
            <label className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Share Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="h-9 flex-1 rounded-md border border-stone-100 bg-stone-50/50 px-3 font-mono text-[11px] text-stone-500 outline-none select-all dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3.5 text-xs font-semibold shrink-0 transition-all ${
                  copied
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-400"
                    : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {copied ? (
                  <>
                    <Check
                      size={13}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                    Copied!
                  </>
                ) : (
                  <>
                    <Link2 size={13} />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Operations Interaction Controls Footer */}
        <div className="flex justify-end gap-2 border-t border-stone-100 p-4 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <Button type="button" variant="outline-dark" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!searchQuery.trim()}>
            <UserPlus size={13} className="mr-1" />
            Send Invite
          </Button>
        </div>
      </form>
    </Modal>
  );
}
