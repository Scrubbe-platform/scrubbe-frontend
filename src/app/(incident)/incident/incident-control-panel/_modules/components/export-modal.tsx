// components/ICP/ExportModal.tsx
"use client";

import React from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button1";

const SECTIONS = [
  "Learning Overview Dashboard",
  "Incident Memory & Clustering",
  "Remediation Intelligence",
  "Governance & Compliance",
  "EAL Distribution & Autonomy",
  "Cost & Engineering Hours Saved",
  "Agent Intelligence Detail",
];

export default function ExportModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 space-y-5">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          Export Intelligence Report
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: "PDF Report", sub: "Board-ready format", emoji: "📄" },
            { label: "CSV Data", sub: "Raw metrics export", emoji: "📊" },
            { label: "JSON / API", sub: "Programmatic access", emoji: "🔗" },
          ].map((fmt) => (
            <button
              key={fmt.label}
              type="button"
              className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-center hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-500/10 transition-colors"
            >
              <div className="text-2xl mb-1">{fmt.emoji}</div>
              <div className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{fmt.label}</div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{fmt.sub}</div>
            </button>
          ))}
        </div>
        <div>
          <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-2">
            Include Sections
          </div>
          {SECTIONS.map((s) => (
            <label
              key={s}
              className="flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-300 cursor-pointer py-1"
            >
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-zinc-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500"
              />
              {s}
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2.5">
          <Button variant="outline-dark" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={onClose}>
            Generate Report
          </Button>
        </div>
      </div>
    </Modal>
  );
}
