"use client";

import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import InviteModal from "./InviteModal";
import { useParams } from "next/navigation";

// types/collab.ts

export interface CollabViewer {
  initials: string;
  name: string;
  role: string;
  department: string;
  colorClass: string;
  isYou?: boolean;
}

const MOCK_VIEWERS: CollabViewer[] = [
  {
    initials: "PI",
    name: "Paschal I.",
    role: "Incident Commander",
    department: "Platform Eng",
    colorClass: "bg-zinc-900 text-white font-mono",
    isYou: true,
  },
  {
    initials: "AR",
    name: "Aisha R.",
    role: "Incoming Commander",
    department: "On-Call / SRE",
    colorClass: "bg-purple-600 text-white font-mono",
  },
  {
    initials: "DK",
    name: "Dev K.",
    role: "Senior SRE",
    department: "On-Call / SRE",
    colorClass: "bg-cyan-700 text-white font-mono",
  },
  {
    initials: "MF",
    name: "Mo F.",
    role: "Platform Engineer",
    department: "Platform Eng",
    colorClass: "bg-amber-700 text-white font-mono",
  },
  {
    initials: "SN",
    name: "Sara N.",
    role: "Engineering Manager",
    department: "Management",
    colorClass: "bg-pink-700 text-white font-mono",
  },
];

export default function LiveCollaborationSection() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const params = useParams<{ id: string }>();
  const handoverId = params?.id as string;

  return (
    <div className="w-full space-y-4">
      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        handoverId={handoverId}
      />

      {/* ── COLLAB BAR PANEL ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-4">
          {/* Overlapping Viewers Avatar Stack */}
          <div className="flex items-center -space-x-2 select-none">
            {MOCK_VIEWERS.slice(0, 4).map((viewer, idx) => (
              <div
                key={idx}
                className={`relative h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-2xs dark:border-zinc-950 cursor-pointer transition-transform hover:-translate-y-0.5 z-10 ${viewer.colorClass}`}
                title={`${viewer.name} — ${viewer.role}`}
              >
                {viewer.initials}
                {/* Real-time online pulse pinpoint anchor indicator */}
                {(viewer.isYou || idx === 1 || idx === 3) && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white bg-green-500 dark:border-zinc-950" />
                )}
              </div>
            ))}
            <div className="h-8 w-8 rounded-full border-2 border-white bg-stone-200 text-stone-600 flex items-center justify-center text-[10px] font-bold dark:border-zinc-950 dark:bg-zinc-800 dark:text-zinc-400">
              +2
            </div>
          </div>

          {/* Running Operational Context Status Subtext strings */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs font-semibold text-green-700 dark:text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              5 team members viewing live
            </div>
            <div className="text-[11px] text-stone-400 dark:text-zinc-500 mt-0.5">
              Aisha R. is editing handover notes…
            </div>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsInviteOpen(true)}
            className="flex-1 sm:flex-none inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
          >
            <UserPlus size={13} />
            Invite
          </button>
        </div>
      </div>
    </div>
  );
}
