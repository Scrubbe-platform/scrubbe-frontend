"use client";
import React, { useState } from "react";
import { PLAYBOOK } from "./incidentDelivery.data";

const PlaybookSection = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-[#DDDDDD] bg-white dark:bg-zinc-900/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
        <div className="space-y-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-black/40 dark:text-zinc-500 font-mono">
            Playbook
          </p>
          <p className="text-lg font-bold text-black dark:text-zinc-100">
            Matched delivery playbook
          </p>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="px-3.5 py-1.5 rounded-lg border border-[#DDDDDD] dark:border-zinc-700 bg-white dark:bg-zinc-800/40 text-[13px] font-medium text-black dark:text-zinc-300 hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-colors shrink-0"
        >
          {open ? "Hide" : "Open"}
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        <div className="space-y-2">
          <p className="text-[15.5px] font-bold text-black dark:text-zinc-100">
            {PLAYBOOK.name}
          </p>
          <p className="text-[13.5px] text-black/60 dark:text-zinc-400 leading-relaxed">
            {PLAYBOOK.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <Chip label="Steps" value={String(PLAYBOOK.steps.length)} />
            <Chip label="Scope" value={PLAYBOOK.scope} mono />
          </div>
        </div>

        {/* Inline reveal — numbered step list */}
        {open && (
          <div className="mt-4 flex flex-col gap-2">
            {PLAYBOOK.steps.map((step, i) => (
              <div
                key={step.title}
                className="flex items-start gap-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 px-3 py-2.5 hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-colors"
              >
                <span className="w-[22px] h-[22px] rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-mono text-[11px] font-semibold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-black dark:text-zinc-100">
                    {step.title}
                  </p>
                  <p className="text-[11.5px] text-black/50 dark:text-zinc-500 mt-0.5 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Chip = ({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">
    {label}:
    <span
      className={`rounded-md border border-[#DDDDDD] dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1 text-[13px] font-semibold normal-case tracking-normal text-black dark:text-zinc-200 ${
        mono ? "font-mono" : ""
      }`}
    >
      {value}
    </span>
  </span>
);

export default PlaybookSection;
