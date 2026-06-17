// components/modals/AttachHandoverModal.tsx
"use client";
import React, { useState } from "react";
import Button from "@/components/ui/Button1";
import Modal from "@/components/ui/Modal";

interface IncidentPreview {
  id: string;
  title: string;
}

interface TargetHandoverOption {
  id: string;
  service: string;
  team: string;
}

interface AttachHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHandoverId?: string;
  // Dynamic preview allows the backend developer to easily pass down currently active shift incidents
  currentIncidents?: IncidentPreview[];
}

// Dummy data structure reflecting the selection target options contract
const MOCK_TARGET_HANDOVERS: TargetHandoverOption[] = [
  { id: "HO-001284", service: "Payments Service", team: "US Platform Team" },
  { id: "HO-001285", service: "Search Service", team: "Singapore Team" },
];

const DEFAULT_INCIDENTS: IncidentPreview[] = [
  { id: "SI-001983", title: "Checkout API Production Failure" },
  { id: "SI-001977", title: "Payments Service Degradation" },
];

export default function AttachHandoverModal({
  isOpen,
  onClose,
  currentHandoverId = "HO-001283",
  currentIncidents = DEFAULT_INCIDENTS,
}: AttachHandoverModalProps) {
  // Form State Definitions
  const [targetHandover, setTargetHandover] = useState(
    MOCK_TARGET_HANDOVERS[0].id,
  );
  const [primarySelection, setPrimarySelection] = useState<
    "target" | "current"
  >("target");
  const [mergeNote, setMergeNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to backend API action handler
    console.log({
      sourceHandoverId: currentHandoverId,
      targetHandoverId: targetHandover,
      primaryStrategy: primarySelection,
      note: mergeNote,
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
            Attach to Existing Handover
          </h2>
        </div>

        {/* Modal Form Body Container */}
        <div className="space-y-4 p-6 max-h-[70vh] overflow-y-auto">
          {/* Informational Context Callout */}
          <p className="text-xs leading-relaxed text-stone-500 dark:text-zinc-400">
            Merge this handover into another open handover from the same shift.
            All incidents tracked here will be carried over so the incoming team
            works from a single consolidated record.
          </p>

          {/* Input: Select Target Handover dropdown */}
          <div className="flex flex-col">
            <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Attach Into
            </label>
            <select
              value={targetHandover}
              onChange={(e) => setTargetHandover(e.target.value)}
              className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-[13px] text-stone-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            >
              {MOCK_TARGET_HANDOVERS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.id} — {option.service} · {option.team}
                </option>
              ))}
            </select>
          </div>

          {/* Input Group: Selection strategy radio inputs */}
          <div className="flex flex-col">
            <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Primary Handover After Merge
            </label>
            <div className="flex flex-col gap-2">
              <label
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-3.5 text-[13px] font-medium transition-colors ${
                  primarySelection === "target"
                    ? "border-blue-500 bg-blue-50/50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400"
                    : "border-stone-200 text-stone-800 hover:bg-stone-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
                }`}
              >
                <input
                  type="radio"
                  name="attach-primary"
                  value="target"
                  checked={primarySelection === "target"}
                  onChange={() => setPrimarySelection("target")}
                  className="h-4 w-4 border-stone-300 text-blue-600 focus:ring-blue-500"
                />
                Keep target handover as primary
              </label>

              <label
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-3.5 text-[13px] font-medium transition-colors ${
                  primarySelection === "current"
                    ? "border-blue-500 bg-blue-50/50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400"
                    : "border-stone-200 text-stone-800 hover:bg-stone-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
                }`}
              >
                <input
                  type="radio"
                  name="attach-primary"
                  value="current"
                  checked={primarySelection === "current"}
                  onChange={() => setPrimarySelection("current")}
                  className="h-4 w-4 border-stone-300 text-blue-600 focus:ring-blue-500"
                />
                Make this handover ({currentHandoverId}) primary
              </label>
            </div>
          </div>

          {/* Dynamic Preview Container Section */}
          <div className="flex flex-col">
            <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Incidents That Will Be Carried Over
            </label>
            <div className="space-y-1.5 rounded-lg border border-stone-200 bg-stone-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/50">
              {currentIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="flex items-center gap-2 text-xs"
                >
                  <span className="font-mono font-medium text-blue-600 dark:text-blue-400 shrink-0">
                    {incident.id}
                  </span>
                  <span className="text-stone-700 dark:text-zinc-300 truncate">
                    {incident.title}
                  </span>
                </div>
              ))}
              {currentIncidents.length === 0 && (
                <div className="text-xs text-stone-400 dark:text-zinc-500 italic">
                  No tracking incidents currently linked.
                </div>
              )}
            </div>
          </div>

          {/* Input: Textarea notes input block */}
          <div className="flex flex-col">
            <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Merge Note For Incoming Team{" "}
              <span className="text-[11px] font-normal normal-case text-stone-400 dark:text-zinc-500">
                (optional)
              </span>
            </label>
            <textarea
              value={mergeNote}
              onChange={(e) => setMergeNote(e.target.value)}
              placeholder="e.g. Consolidating Checkout + Payments incidents from the London shift into one record…"
              className="w-full min-h-[72px] rounded-md border border-stone-200 p-3 text-[13px] text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white resize-y"
            />
          </div>
        </div>

        {/* Modal Action Controls Footer */}
        <div className="flex justify-end gap-2 border-t border-stone-100 p-4 dark:border-zinc-800">
          <Button type="button" variant="outline-dark" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Attach Handover</Button>
        </div>
      </form>
    </Modal>
  );
}
