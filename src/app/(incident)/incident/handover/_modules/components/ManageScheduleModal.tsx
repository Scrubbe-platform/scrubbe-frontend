// app/handovers/ManageSchedulesModal.tsx
"use client";
import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button1";

interface ManageSchedulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ManageSchedulesModal({
  isOpen,
  onClose,
}: ManageSchedulesModalProps) {
  // Controlled state for automated rules checkboxes
  const [automatedRules, setAutomatedRules] = useState({
    icChange: true,
    shiftEnd: true,
    twentyFourHours: false,
    ezraBrief: true,
  });

  const handleCheckboxChange = (key: keyof typeof automatedRules) => {
    setAutomatedRules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Mock schedule rows for illustration (can easily be made dynamic later)
  const rotations = [
    { time: "06:00", from: "Singapore", to: "London", text: "Daily · Active" },
    { time: "14:00", from: "London", to: "US East", text: "Daily · Active" },
    { time: "22:00", from: "US East", to: "Singapore", text: "Daily · Active" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6 py-4">
        {/* Section 1: Automated Handover Rules */}
        <div className="flex items-center justify-between px-6 pt-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-white">
            Manage Schedules
          </h2>
        </div>

        <div className="px-4">
          <h3 className="mb-3 text-[13px] font-semibold text-stone-900 dark:text-white">
            Automated Handover Rules
          </h3>
          <div className="flex flex-col gap-2">
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-stone-200 p-3.5 text-[13px] text-stone-800 transition-colors hover:bg-stone-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/50">
              <input
                type="checkbox"
                checked={automatedRules.icChange}
                onChange={() => handleCheckboxChange("icChange")}
                className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
              />
              Generate handover when Incident Commander changes
            </label>

            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-stone-200 p-3.5 text-[13px] text-stone-800 transition-colors hover:bg-stone-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/50">
              <input
                type="checkbox"
                checked={automatedRules.shiftEnd}
                onChange={() => handleCheckboxChange("shiftEnd")}
                className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
              />
              Generate handover at shift end
            </label>

            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-stone-200 p-3.5 text-[13px] text-stone-800 transition-colors hover:bg-stone-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/50">
              <input
                type="checkbox"
                checked={automatedRules.twentyFourHours}
                onChange={() => handleCheckboxChange("twentyFourHours")}
                className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
              />
              Generate handover after 24 hours open
            </label>

            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-stone-200 p-3.5 text-[13px] text-stone-800 transition-colors hover:bg-stone-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/50">
              <input
                type="checkbox"
                checked={automatedRules.ezraBrief}
                onChange={() => handleCheckboxChange("ezraBrief")}
                className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
              />
              Auto-generate Ezra brief on transfer
            </label>
          </div>
        </div>

        {/* Section 2: Follow-the-Sun Rotations */}
        <div className="px-4">
          <h3 className="mb-3 text-[13px] font-semibold text-stone-900 dark:text-white">
            Follow-the-Sun Rotations
          </h3>
          <div className="overflow-hidden rounded-lg border border-stone-200 bg-white px-4 dark:border-zinc-700 dark:bg-zinc-900">
            {rotations.map((rotation, i) => (
              <div
                key={i}
                className="flex items-center gap-3 border-b border-stone-100 py-3 last:border-b-0 dark:border-zinc-800"
              >
                <span className="w-[60px] font-mono text-xs font-medium text-blue-600">
                  {rotation.time}
                </span>

                <div className="flex-1">
                  <div className="text-[13px] font-medium text-stone-900 dark:text-white">
                    {rotation.from} → {rotation.to}
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-zinc-400">
                    {rotation.text}
                  </div>
                </div>

                <Button
                  variant="outline-dark"
                  size="sm"
                  className="h-7 px-2.5 text-xs"
                >
                  Edit
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex justify-end gap-2 border-t border-stone-100 pt-4 dark:border-zinc-800">
        <Button variant="outline-dark" onClick={onClose}>
          Close
        </Button>
        <Button onClick={onClose}>Save Changes</Button>
      </div>
    </Modal>
  );
}
