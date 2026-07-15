"use client";

import React, { useMemo, useState } from "react";
import { Users, UserCheck } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button1";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateIncident } from "@/lib/incident/incident.api";
import { querykeys } from "@/lib/constant";
import toast from "react-hot-toast";
import useMember from "@/hooks/useMember";
import Select from "@/components/ui/select";

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** UUIDs of incidents to assign */
  incidents: string[];
}

export default function AssignModal({ isOpen, onClose, incidents }: AssignModalProps) {
  const [selectedEmail, setSelectedEmail] = useState("");
  const { data: members = [] } = useMember();
  const queryClient = useQueryClient();

  const memberOptions = useMemo(
    () => [
      { value: "", label: "Select team member…" },
      ...members.map((m) => {
        const fullName = `${m.firstname ?? ""} ${m.lastname ?? ""}`.trim() || m.email;
        return {
          value: m.email,           // use email as the value sent to the API
          label: `${fullName} (${m.email})`,
        };
      }),
    ],
    [members],
  );

  // Find the display name for the selected email
  const selectedMember = useMemo(
    () => members.find((m) => m.email === selectedEmail),
    [members, selectedEmail],
  );
  const selectedLabel = selectedMember
    ? `${selectedMember.firstname ?? ""} ${selectedMember.lastname ?? ""}`.trim() ||
      selectedMember.email
    : "";

  const assignMutation = useMutation({
    mutationFn: async (email: string) => {
      await Promise.all(
        incidents.map((id) =>
          updateIncident(id, {
            assignedToEmail: email,
            assignedToName: selectedLabel,
            incidentCommander: selectedLabel,
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [querykeys.INCIDENT_TICKET] });
      toast.success(
        incidents.length === 1
          ? `Incident assigned to ${selectedLabel}`
          : `${incidents.length} incidents assigned to ${selectedLabel}`
      );
      setSelectedEmail("");
      onClose();
    },
    onError: () => toast.error("Failed to assign — please try again"),
  });

  const handleConfirm = () => {
    if (!selectedEmail) return;
    assignMutation.mutate(selectedEmail);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-5 space-y-5 min-w-[380px]">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
            <Users size={16} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900">Assign to Team Member</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {incidents.length === 1
                ? "Assign this incident to an engineer."
                : `Assign ${incidents.length} incidents to an engineer.`}
            </p>
          </div>
        </div>

        {/* Incident count badge */}
        {incidents.length > 1 && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
            <UserCheck size={13} className="text-zinc-400" />
            <span className="text-xs text-zinc-600">
              <span className="font-semibold text-zinc-800">{incidents.length}</span> incidents
              selected for assignment
            </span>
          </div>
        )}

        {/* Member select */}
        <Select
          label="Engineer / Team Member"
          options={memberOptions}
          value={selectedEmail}
          onChange={(e) => setSelectedEmail(e.target.value)}
          placeholder="Select an engineer…"
        />

        {/* Actions */}
        <div className="flex justify-end gap-2.5 pt-1">
          <Button
            variant="outline-dark"
            size="sm"
            onClick={() => {
              setSelectedEmail("");
              onClose();
            }}
            disabled={assignMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!selectedEmail || assignMutation.isPending}
            onClick={handleConfirm}
          >
            {assignMutation.isPending
              ? "Assigning…"
              : incidents.length === 1
                ? "Assign"
                : `Assign ${incidents.length} incidents`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
