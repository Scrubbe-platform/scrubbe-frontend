// components/modals/CreateHandoverModal.tsx
"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Button from "@/components/ui/Button1";
import Modal from "@/components/ui/Modal";
import useMember from "@/hooks/useMember";
import { fetchIncidentList } from "@/lib/incident/incident.api";
import { createHandover } from "@/lib/handover/handover.api";

interface CreateHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

function combineDateAndTime(time: string): string {
  const now = new Date();
  const [hh, mm] = time.split(":").map((v) => parseInt(v, 10));
  const dt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hh, mm, 0));
  return dt.toISOString();
}

export default function CreateHandoverModal({ isOpen, onClose, onCreated }: CreateHandoverModalProps) {
  const [shiftType, setShiftType] = useState<"12HR" | "8HR" | "custom">("12HR");
  const [customHours, setCustomHours] = useState<number>(10);
  const [incidentIds, setIncidentIds] = useState<string[]>([]);
  const [currentOwnerLabel, setCurrentOwnerLabel] = useState("");
  const [nextOwnerLabel, setNextOwnerLabel] = useState("");
  const [nextCommanderId, setNextCommanderId] = useState("");
  const [transferTime, setTransferTime] = useState("18:00");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: members = [] } = useMember();
  const { data: incidentList } = useQuery({
    queryKey: ["incidents-picker"],
    queryFn: fetchIncidentList,
    enabled: isOpen,
  });
  const incidents = incidentList?.incidents ?? [];

  const toggleIncident = (id: string) =>
    setIncidentIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const resetForm = () => {
    setIncidentIds([]);
    setCurrentOwnerLabel("");
    setNextOwnerLabel("");
    setNextCommanderId("");
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOwnerLabel.trim() || !nextOwnerLabel.trim()) {
      toast.error("Current and next owner are required");
      return;
    }

    const shiftHours = shiftType === "12HR" ? 12 : shiftType === "8HR" ? 8 : customHours;
    const transferAt = combineDateAndTime(transferTime);
    const shiftWindowEnd = transferAt;
    const shiftWindowStart = new Date(new Date(transferAt).getTime() - shiftHours * 60 * 60_000).toISOString();

    setSubmitting(true);
    try {
      await createHandover({
        shiftType: shiftType === "custom" ? "CUSTOM" : shiftType,
        shiftWindowStart,
        shiftWindowEnd,
        transferAt,
        currentOwnerLabel: currentOwnerLabel.trim(),
        nextOwnerLabel: nextOwnerLabel.trim(),
        nextCommanderId: nextCommanderId || undefined,
        incidentIds,
        initialNotes: notes.trim() || undefined,
      });
      toast.success("Handover created");
      resetForm();
      onCreated?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create handover");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="w-full overflow-hidden bg-white dark:bg-zinc-950 rounded-lg">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-base font-semibold tracking-tight text-stone-900 dark:text-white">
            Create Handover
          </h2>
        </div>

        <div className="space-y-4 p-6 max-h-[70vh] overflow-y-auto">
          {/* Shift Type */}
          <div className="flex flex-col">
            <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Shift Type
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {(["12HR", "8HR", "custom"] as const).map((opt) => (
                <label
                  key={opt}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2 text-[13px] font-medium transition-colors ${
                    shiftType === opt
                      ? "border-blue-500 bg-blue-50/50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400"
                      : "border-stone-200 text-stone-800 hover:bg-stone-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="create-shift"
                    value={opt}
                    checked={shiftType === opt}
                    onChange={() => setShiftType(opt)}
                    className="h-4 w-4 border-stone-300 text-blue-600 focus:ring-blue-500"
                  />
                  {opt === "12HR" ? "12hr Shift" : opt === "8HR" ? "8hr Shift" : "Custom"}
                  {opt === "custom" && shiftType === "custom" && (
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
              ))}
            </div>
          </div>

          {/* Incidents picker */}
          <div className="flex flex-col">
            <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Linked Incidents{" "}
              <span className="text-[11px] font-normal normal-case text-stone-400 dark:text-zinc-500">
                (select all incidents occurring in this shift)
              </span>
            </label>
            {incidents.length === 0 ? (
              <p className="text-xs text-stone-400 dark:text-zinc-500 py-2">No incidents available.</p>
            ) : (
              <div className="max-h-40 overflow-y-auto rounded-md border border-stone-200 dark:border-zinc-700 divide-y divide-stone-100 dark:divide-zinc-800">
                {incidents.map((inc) => (
                  <label
                    key={inc.id}
                    className="flex items-center gap-2.5 px-3 py-2 text-[13px] cursor-pointer hover:bg-stone-50 dark:hover:bg-zinc-800/50"
                  >
                    <input
                      type="checkbox"
                      checked={incidentIds.includes(inc.id)}
                      onChange={() => toggleIncident(inc.id)}
                      className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-mono text-[11px] text-blue-600">{inc.ticketId}</span>
                    <span className="truncate text-stone-700 dark:text-zinc-300">{inc.summary}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Owners */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                Current Owner
              </label>
              <input
                value={currentOwnerLabel}
                onChange={(e) => setCurrentOwnerLabel(e.target.value)}
                placeholder="e.g. London Platform Team"
                className="h-9 w-full rounded-md border border-stone-200 px-3 text-[13px] text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                Next Owner
              </label>
              <input
                value={nextOwnerLabel}
                onChange={(e) => setNextOwnerLabel(e.target.value)}
                placeholder="e.g. US Platform Team"
                className="h-9 w-full rounded-md border border-stone-200 px-3 text-[13px] text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
            </div>
          </div>

          {/* Next Commander & Transfer Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                Next Commander
              </label>
              <select
                value={nextCommanderId}
                onChange={(e) => setNextCommanderId(e.target.value)}
                className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-[13px] text-stone-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.firstname} {m.lastname}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                Transfer Time (UTC)
              </label>
              <input
                className="h-9 w-full rounded-md border border-stone-200 px-3 text-[13px] text-stone-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                type="time"
                value={transferTime}
                onChange={(e) => setTransferTime(e.target.value)}
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

        <div className="flex justify-end gap-2 border-t border-stone-100 p-4 dark:border-zinc-800">
          <Button type="button" variant="outline-dark" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create Handover"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
