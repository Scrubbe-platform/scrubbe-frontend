"use client";
import React, { useState } from "react";
import { PLAYBOOK } from "./incidentDelivery.data";

const PlaybookSection = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-[#DDDDDD] bg-white dark:bg-zinc-900/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="space-y-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
            Playbook
          </p>
          <p className="text-[14px] font-semibold text-black dark:text-zinc-100">
            Matched delivery playbook
          </p>
          <p className="text-[12px] text-black dark:text-zinc-500">
            Defines safe steps and verification patterns.
          </p>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="px-3 py-1.5 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 text-[12px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors shrink-0"
        >
          {open ? "Hide" : "Open"}
        </button>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-3">
          <p className="text-[13px] font-semibold text-black dark:text-zinc-100">
            {PLAYBOOK.name}
          </p>
          <p className="text-[12px] text-black dark:text-zinc-400 leading-relaxed">
            {PLAYBOOK.description}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Chip label="Steps" value={String(PLAYBOOK.steps.length)} />
            <Chip label="Scope" value={PLAYBOOK.scope} />
          </div>
        </div>

        {/* Inline reveal — numbered step list */}
        {open && (
          <div className="mt-2.5 flex flex-col gap-2">
            {PLAYBOOK.steps.map((step, i) => (
              <div
                key={step.title}
                className="flex items-start gap-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 px-3 py-2.5 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
              >
                <span className="w-[22px] h-[22px] rounded-md bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-mono text-[11px] font-semibold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-black dark:text-zinc-100">{step.title}</p>
                  <p className="text-[11.5px] text-black dark:text-zinc-500 mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Chip = ({ label, value }: { label: string; value: string }) => (
  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[11px] font-mono">
    <span className="text-zinc-400 dark:text-zinc-500">{label}:</span>
    <span className="text-black dark:text-zinc-300">{value}</span>
  </span>
);

export default PlaybookSection;
