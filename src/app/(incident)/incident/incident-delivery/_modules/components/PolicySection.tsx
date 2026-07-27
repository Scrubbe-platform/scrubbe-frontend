"use client";
import React, { useState } from "react";
import { POLICY } from "./incidentDelivery.data";

const PolicySection = () => {
  const [open, setOpen] = useState(false);

  const policyFields = [
    { title: "Auto-activate", value: POLICY.auto },
    { title: "Approval gate", value: POLICY.gate },
    { title: "Execution scope", value: POLICY.scope, full: true },
  ];

  return (
    <div className="rounded-2xl border border-[#DDDDDD] bg-white dark:bg-zinc-900/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
        <div className="space-y-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-black/40 dark:text-zinc-500 font-mono">
            Policy
          </p>
          <p className="text-lg font-bold text-black dark:text-zinc-100">
            When and how execution is allowed
          </p>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="px-3.5 py-1.5 rounded-lg border border-[#DDDDDD] dark:border-zinc-700 bg-white dark:bg-zinc-800/40 text-[13px] font-medium text-black dark:text-zinc-300 hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-colors shrink-0"
        >
          {open ? "Hide" : "Details"}
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-4">
        {/* Policy fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {policyFields.map(({ title, value, full }) => (
            <div
              key={title}
              className={`rounded-xl bg-zinc-50 dark:bg-zinc-900/60 p-4 ${full ? "sm:col-span-2" : ""}`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest text-black/40 dark:text-zinc-500 mb-1.5">
                {title}
              </p>
              <p className="text-base font-bold text-black dark:text-zinc-200">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Reasons */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-black/40 dark:text-zinc-500 mb-2">
            Reasons
          </p>
          <p className="text-[13.5px] text-black/60 dark:text-zinc-400 leading-relaxed">
            {POLICY.reasons.join(" ")}
          </p>
        </div>

        {/* Inline reveal — policy details */}
        {open && (
          <div className="flex flex-col gap-2">
            {POLICY.details.map((d) => (
              <div
                key={d.label}
                className="flex gap-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 px-3 py-2.5"
              >
                <span className="w-[130px] shrink-0 text-[11px] font-semibold uppercase tracking-widest text-black/40 dark:text-zinc-500 pt-px">
                  {d.label}
                </span>
                <span className="text-[12.5px] font-medium text-black dark:text-zinc-200">
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicySection;
