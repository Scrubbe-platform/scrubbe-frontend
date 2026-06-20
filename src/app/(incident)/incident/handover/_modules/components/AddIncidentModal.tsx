// components/modals/AddIncidentModal.tsx
"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Button from "@/components/ui/Button1";
import Modal from "@/components/ui/Modal";
import { fetchIncidentList } from "@/lib/incident/incident.api";
import { addHandoverIncident } from "@/lib/handover/handover.api";

interface AddIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  handoverId?: string;
  excludeIncidentIds?: string[];
  onAdded?: () => void;
}

export default function AddIncidentModal({
  isOpen,
  onClose,
  handoverId,
  excludeIncidentIds = [],
  onAdded,
}: AddIncidentModalProps) {
  const [selectedIncident, setSelectedIncident] = useState("");
  const [contextNotes, setContextNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: incidentList } = useQuery({
    queryKey: ["incidents-picker"],
    queryFn: fetchIncidentList,
    enabled: isOpen,
  });
  const incidents = (incidentList?.incidents ?? []).filter((inc) => !excludeIncidentIds.includes(inc.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverId || !selectedIncident) return;

    setSubmitting(true);
    try {
      await addHandoverIncident(handoverId, { incidentId: selectedIncident, contextNotes: contextNotes.trim() || undefined });
      toast.success("Incident added to handover");
      setContextNotes("");
      setSelectedIncident("");
      onAdded?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add incident");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="w-full overflow-hidden bg-white dark:bg-zinc-950 rounded-lg">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-base font-semibold tracking-tight text-stone-900 dark:text-white">
            Add Incident to Handover
          </h2>
        </div>

        <div className="space-y-4 p-6 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col">
            <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Select Incident
            </label>
            <select
              required
              value={selectedIncident}
              onChange={(e) => setSelectedIncident(e.target.value)}
              className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-[13px] text-stone-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            >
              <option value="" disabled>
                Choose an incident…
              </option>
              {incidents.map((incident) => (
                <option key={incident.id} value={incident.id}>
                  {incident.ticketId} — {incident.summary}
                </option>
              ))}
            </select>
          </div>

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

        <div className="flex justify-end gap-2 border-t border-stone-100 p-4 dark:border-zinc-800">
          <Button type="button" variant="outline-dark" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || !selectedIncident}>
            {submitting ? "Adding…" : "Add to Handover"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
