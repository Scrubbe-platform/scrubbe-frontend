// components/modals/AddTaskModal.tsx
"use client";
import React, { useState } from "react";
import Button from "@/components/ui/Button1";
import Modal from "@/components/ui/Modal";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Senior Frontend Practice: Move static dropdown select contract options outside the component re-render lifecycle
const ASSIGNEE_OPTIONS = [
  "US Platform Team",
  "London Platform Team",
  "Incident Commander",
  "Singapore Team",
];

const PRIORITY_OPTIONS = ["Critical", "High", "Medium", "Low"];

export default function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
  // Controlled Component States
  const [taskTitle, setTaskTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState(ASSIGNEE_OPTIONS[0]);
  const [priority, setPriority] = useState(PRIORITY_OPTIONS[1]); // Defaults to 'High'
  const [dueTime, setDueTime] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect this cleanly typed payload to your backend data sync endpoints
    console.log({
      title: taskTitle,
      assignee: assignedTo,
      priority,
      dueTime: dueTime || null,
    });

    // Reset local states upon successful validation/dispatch execution
    setTaskTitle("");
    setDueTime("");
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
            Add Task
          </h2>
        </div>

        {/* Modal Form Body Block */}
        <div className="space-y-4 p-6 max-h-[70vh] overflow-y-auto">
          {/* Input: Task Title Text string */}
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

          {/* Grid Layout: Assigned Team & Severity Priority Split */}
          <div className="grid grid-cols-2 gap-4">
            {/* Assignee Selection Field */}
            <div className="flex flex-col">
              <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                Assigned To
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-[13px] text-stone-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              >
                {ASSIGNEE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Level Dropdown field */}
            <div className="flex flex-col">
              <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
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

          {/* Input: Due Time String Selector Picker */}
          <div className="flex flex-col">
            <label className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Due Time (UTC)
            </label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="h-9 w-full rounded-md border border-stone-200 px-3 text-[13px] text-stone-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>
        </div>

        {/* Form Operations Interaction Controls Footer */}
        <div className="flex justify-end gap-2 border-t border-stone-100 p-4 dark:border-zinc-800">
          <Button type="button" variant="outline-dark" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add Task</Button>
        </div>
      </form>
    </Modal>
  );
}
