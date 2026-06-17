// components/modals/AddIncidentModal.tsx
"use client";
import React, { useState } from "react";
import Button from "@/components/ui/Button1";
import Modal from "@/components/ui/Modal";

interface AvailableIncident {
  id: string;
  title: string;
}

interface AddIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Senior Frontend Practice: Treat static mock options as clear data-contract objects outside the component loop
const MOCK_AVAILABLE_INCIDENTS: AvailableIncident[] = [
  { id: "SI-001984", title: "Search Indexing Failure" },
  { id: "SI-001985", title: "Notification Service Backlog" },
  { id: "SI-001986", title: "Media Upload Timeout" },
];

export default function AddIncidentModal({
  isOpen,
  onClose,
}: AddIncidentModalProps) {
  // Controlled Component States
  const [selectedIncident, setSelectedIncident] = useState(
    MOCK_AVAILABLE_INCIDENTS[0].id,
  );
  const [contextNotes, setContextNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect this contract payload to your backend orchestration API layer
    console.log({
      incidentId: selectedIncident,
      notes: contextNotes,
    });

    // Clear state on successful submission
    setContextNotes("");
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
            Add Incident to Handover
          </h2>
        </div>

        {/* Modal Form Content */}
        <div className="space-y-4 p-6 max-h-[70vh] overflow-y-auto">
          {/* Input: Select Incident Dropdown */}
          <div className="flex flex-col">
            <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Select Incident
            </label>
            <select
              value={selectedIncident}
              onChange={(e) => setSelectedIncident(e.target.value)}
              className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-[13px] text-stone-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            >
              {MOCK_AVAILABLE_INCIDENTS.map((incident) => (
                <option key={incident.id} value={incident.id}>
                  {incident.id} — {incident.title}
                </option>
              ))}
            </select>
          </div>

          {/* Input: Context Notes Textarea Block */}
          <div className="flex flex-col">
            <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Context Notes
            </label>
            <textarea
              value={contextNotes}
              onChange={(e) => setContextNotes(e.target.value)}
              placeholder="Brief context for the incoming team about this incident…"
              className="w-full min-h-[80px] rounded-md border border-stone-200 p-3 text-[13px] text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white resize-y"
            />
          </div>
        </div>

        {/* Form Action Buttons Footer */}
        <div className="flex justify-end gap-2 border-t border-stone-100 p-4 dark:border-zinc-800">
          <Button type="button" variant="outline-dark" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add to Handover</Button>
        </div>
      </form>
    </Modal>
  );
}
