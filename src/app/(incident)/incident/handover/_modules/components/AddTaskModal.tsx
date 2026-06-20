// components/modals/AddTaskModal.tsx
"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button1";
import Modal from "@/components/ui/Modal";
import { addHandoverTask } from "@/lib/handover/handover.api";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  handoverId?: string;
  onAdded?: () => void;
}

const PRIORITY_OPTIONS = ["CRITICAL", "HIGH", "NORMAL"] as const;

export default function AddTaskModal({ isOpen, onClose, handoverId, onAdded }: AddTaskModalProps) {
  const [taskTitle, setTaskTitle] = useState("");
  const [assigneeLabel, setAssigneeLabel] = useState("");
  const [priority, setPriority] = useState<typeof PRIORITY_OPTIONS[number]>("HIGH");
  const [dueAt, setDueAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverId || !taskTitle.trim()) return;

    setSubmitting(true);
    try {
      await addHandoverTask(handoverId, {
        title: taskTitle.trim(),
        assigneeLabel: assigneeLabel.trim() || undefined,
        priority,
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      });
      toast.success("Task added");
      setTaskTitle("");
      setAssigneeLabel("");
      setDueAt("");
      onAdded?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="w-full overflow-hidden bg-white dark:bg-zinc-950 rounded-lg">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-base font-semibold tracking-tight text-stone-900 dark:text-white">Add Task</h2>
        </div>

        <div className="space-y-4 p-6 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col">
            <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Task Title
            </label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Describe the task required for this handoff window…"
              className="h-9 w-full rounded-md border border-stone-200 px-3 text-[13px] text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                Assigned To
              </label>
              <input
                type="text"
                value={assigneeLabel}
                onChange={(e) => setAssigneeLabel(e.target.value)}
                placeholder="e.g. US Platform Team"
                className="h-9 w-full rounded-md border border-stone-200 px-3 text-[13px] text-stone-900 placeholder:text-stone-400 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as typeof priority)}
                className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-[13px] text-stone-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              >
                {PRIORITY_OPTIONS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Due (UTC)
            </label>
            <input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="h-9 w-full rounded-md border border-stone-200 px-3 text-[13px] text-stone-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-stone-100 p-4 dark:border-zinc-800">
          <Button type="button" variant="outline-dark" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || !taskTitle.trim()}>
            {submitting ? "Adding…" : "Add Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
