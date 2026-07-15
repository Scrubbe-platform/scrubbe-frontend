"use client";

import React, { useMemo, useState } from "react";
import { Users } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button1";
import { IncidentListItem } from "@/lib/incident/incident.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { querykeys } from "@/lib/constant";
import toast from "react-hot-toast";
import useMember from "@/hooks/useMember";
import Select from "@/components/ui/select";

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: string[];
}

export default function AssignModal({
  isOpen,
  onClose,
  incidents,
}: AssignModalProps) {
  const [assignedTo, setAssignedTo] = useState("");
  const { data: members = [] } = useMember();
  const memberOptions = useMemo(
    () => [
      { value: "", label: "Select team member" },
      ...members.map((m) => {
        const fullName =
          `${m.firstname ?? ""} ${m.lastname ?? ""}`.trim() || m.email;
        return { value: fullName, label: `${fullName} (${m.email})` };
      }),
    ],
    [members],
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 space-y-5">
        {/* Header */}
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Users size={16} className="text-zinc-400" />
            Assign Engineer
          </h2>
        </div>

        {/* Select */}
        <Select
          label="Assigned Engineer Operator"
          options={memberOptions}
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          placeholder="Select an engineer…"
        />

        {/* Actions */}
        <div className="flex justify-end gap-2.5 pt-1">
          <Button variant="outline-dark" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" disabled={!assignedTo} onClick={() => {}}>
            {incidents?.length === 1
              ? "Assign"
              : `Assign ${incidents?.length} incidents`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
