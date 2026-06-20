"use client";

import React, { useState } from "react";
import {
  Search,
  UserPlus,
  CalendarPlus,
  Pencil,
  RefreshCw,
  UserMinus,
} from "lucide-react";
import { toast } from "sonner";
import EditAssignmentModal from "./EditAssignmentModal"; // Import missing modal block
import { removeOnCallAssignment, updateOnCallAssignment } from "@/lib/escalation/escalation.api";

export type Member = {
  id: string;
  initials: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
  handle: string;
  color: string;
  onCall: boolean;
  assignmentId?: string | null;
};

interface RosterViewProps {
  members: Member[];
  isLoading: boolean;
  onChanged?: () => void;
}

export default function RosterView({ members, isLoading, onChanged }: RosterViewProps) {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  // State handles to keep track of modal view frames
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const depts = [
    "All",
    ...Array.from(new Set(members.map((m) => m.department || "Engineering"))),
  ];

  const filtered = members.filter((m) => {
    const matchSearch =
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.handle.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "All" || m.department === deptFilter;
    return matchSearch && matchDept;
  });

  // Open helper tracking trigger
  const triggerModal = (member: Member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleSaveMutation = async (payload: {
    memberId: string;
    reassignToId: string;
    reason: string;
    notes: string;
  }) => {
    if (!selectedMember?.assignmentId) {
      toast.error("This person has no active on-call assignment to reassign.");
      return;
    }
    if (!payload.reassignToId || payload.reassignToId === payload.memberId) {
      return;
    }
    try {
      await updateOnCallAssignment(selectedMember.assignmentId, { userId: payload.reassignToId });
      toast.success("On-call assignment reassigned");
      onChanged?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reassign on-call shift");
    }
  };

  const handleRemoveMutation = async () => {
    if (!selectedMember?.assignmentId) {
      toast.error("This person has no active on-call assignment to remove.");
      return;
    }
    try {
      await removeOnCallAssignment(selectedMember.assignmentId);
      toast.success("Removed from on-call rotation");
      onChanged?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove from rotation");
    }
  };

  if (isLoading) return <div className="animate-pulse space-y-3">...</div>;

  return (
    <div className="w-full space-y-4">
      {/* Structural layout remains the same... */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
        {/* Filters Top Ribbon... */}

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 px-4 py-3.5 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
            >
              {/* Profile Descriptions items left */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black"
                  style={{ backgroundColor: m.color }}
                >
                  {m.initials}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-neutral-900 dark:text-white">
                    {m.fullName}{" "}
                    <span className="text-neutral-400">({m.role})</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    {m.email} ·{" "}
                    <span className="font-mono text-neutral-400">
                      {m.handle}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive buttons right side */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${m.onCall ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-neutral-200 text-neutral-500"}`}
                >
                  {m.onCall ? "On-call" : "Off"}
                </span>

                <div className="flex items-center gap-1">
                  {/* Both Edit and Re-assign actions wire into the single dynamic context modal */}
                  <button
                    onClick={() => triggerModal(m)}
                    className="inline-flex h-7 px-2.5 items-center gap-1 rounded-md border border-neutral-200 bg-white text-[11px] font-semibold text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    <Pencil size={11} /> Edit
                  </button>
                  <button
                    onClick={() => triggerModal(m)}
                    className="inline-flex h-7 px-2.5 items-center gap-1 rounded-md border border-neutral-200 bg-white text-[11px] font-semibold text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    <RefreshCw size={11} /> Re-assign
                  </button>
                  <button
                    onClick={() => triggerModal(m)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-red-100 bg-white text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:bg-neutral-800"
                  >
                    <UserMinus size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mount Modal Orchestration Component Context view tree */}
      <EditAssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        member={selectedMember}
        allMembers={members}
        onSave={handleSaveMutation}
        onRemove={handleRemoveMutation}
      />
    </div>
  );
}
