// components/modals/CreateHandoverModal.tsx
"use client";
import React, { useState } from "react";
import Button from "@/components/ui/Button1";
import Modal from "@/components/ui/Modal";

interface CreateHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateHandoverModal({
  isOpen,
  onClose,
}: CreateHandoverModalProps) {
  const [shiftType, setShiftType] = useState<"12" | "8" | "custom">("12");
  const [customHours, setCustomHours] = useState<number>(10);
  const [incidents, setIncidents] = useState<string[]>([""]);
  const [notes, setNotes] = useState("");

  const handleAddIncident = () => setIncidents([...incidents, ""]);
  const handleRemoveIncident = (index: number) => {
    setIncidents(incidents.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to backend API
    console.log({ shiftType, customHours, incidents, notes });
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
            Create Handover
          </h2>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 p-6 max-h-[70vh] overflow-y-auto">
          {/* Shift Type (Radio + Conditional Input) */}
          <div className="flex flex-col">
            <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Shift Type
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <label
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2 text-[13px] font-medium transition-colors ${
                  shiftType === "12"
                    ? "border-blue-500 bg-blue-50/50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400"
                    : "border-stone-200 text-stone-800 hover:bg-stone-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
                }`}
              >
                <input
                  type="radio"
                  name="create-shift"
                  value="12"
                  checked={shiftType === "12"}
                  onChange={() => setShiftType("12")}
                  className="h-4 w-4 border-stone-300 text-blue-600 focus:ring-blue-500"
                />
                12hr Shift
              </label>

              <label
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2 text-[13px] font-medium transition-colors ${
                  shiftType === "8"
                    ? "border-blue-500 bg-blue-50/50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400"
                    : "border-stone-200 text-stone-800 hover:bg-stone-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
                }`}
              >
                <input
                  type="radio"
                  name="create-shift"
                  value="8"
                  checked={shiftType === "8"}
                  onChange={() => setShiftType("8")}
                  className="h-4 w-4 border-stone-300 text-blue-600 focus:ring-blue-500"
                />
                8hr Shift
              </label>

              <label
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2 text-[13px] font-medium transition-colors ${
                  shiftType === "custom"
                    ? "border-blue-500 bg-blue-50/50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400"
                    : "border-stone-200 text-stone-800 hover:bg-stone-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
                }`}
              >
                <input
                  type="radio"
                  name="create-shift"
                  value="custom"
                  checked={shiftType === "custom"}
                  onChange={() => setShiftType("custom")}
                  className="h-4 w-4 border-stone-300 text-blue-600 focus:ring-blue-500"
                />
                Custom
                {shiftType === "custom" && (
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={customHours}
                    onChange={(e) => setCustomHours(Number(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                    className="ml-2 w-14 rounded border border-stone-200 bg-white px-1.5 py-0.5 font-mono text-xs font-semibold text-stone-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    placeholder="hrs"
                  />
                )}
              </label>
            </div>
          </div>

          {/* Dynamic Incidents List */}
          <div className="flex flex-col">
            <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Linked Incidents{" "}
              <span className="text-[11px] font-normal normal-case text-stone-400 dark:text-zinc-500">
                (add all incidents occurring in this shift)
              </span>
            </label>
            <div className="mb-2 flex flex-col gap-2">
              {incidents.map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select className="h-9 flex-1 rounded-md border border-stone-200 bg-white px-3 text-[13px] text-stone-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
                    <option>SI-001983 — Checkout API Production Failure</option>
                    <option>SI-001977 — Payments Service Degradation</option>
                    <option>SI-001969 — Search Service Latency</option>
                  </select>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveIncident(index)}
                      className="p-1 text-lg leading-none text-stone-400 transition-colors hover:text-stone-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddIncident}
              className="w-fit text-left text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline dark:text-blue-400"
            >
              + Add another incident
            </button>
          </div>

          {/* Current Owner Team */}
          <div className="flex flex-col">
            <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Current Owner Team
            </label>
            <select className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-[13px] text-stone-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
              <option>London Platform Team</option>
              <option>US Platform Team</option>
              <option>Singapore Team</option>
            </select>
          </div>

          {/* Next Owner Team */}
          <div className="flex flex-col">
            <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Next Owner Team
            </label>
            <select className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-[13px] text-stone-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
              <option>US Platform Team</option>
              <option>Singapore Team</option>
              <option>London Platform Team</option>
            </select>
          </div>

          {/* Next Commander & Transfer Time Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                Next Commander
              </label>
              <input
                className="h-9 w-full rounded-md border border-stone-200 px-3 text-[13px] text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                type="text"
                placeholder="Name"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                Transfer Time (UTC)
              </label>
              <input
                className="h-9 w-full rounded-md border border-stone-200 px-3 text-[13px] text-stone-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                type="time"
                defaultValue="18:00"
              />
            </div>
          </div>

          {/* Initial Notes */}
          <div className="flex flex-col">
            <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Initial Notes
            </label>
            <textarea
              className="w-full min-h-[80px] rounded-md border border-stone-200 p-3 text-[13px] text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white resize-y"
              placeholder="Add context for the incoming team…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-2 border-t border-stone-100 p-4 dark:border-zinc-800">
          <Button type="button" variant="outline-dark" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create Handover</Button>
        </div>
      </form>
    </Modal>
  );
}
