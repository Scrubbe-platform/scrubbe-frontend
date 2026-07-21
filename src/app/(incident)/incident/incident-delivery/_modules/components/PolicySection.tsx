"use client";
import React, { useState } from "react";
import { POLICY } from "./incidentDelivery.data";

const PolicySection = () => {
  const [open, setOpen] = useState(false);

  const policyFields = [
    { title: "Auto-activate", value: POLICY.auto },
    { title: "Approval gate", value: POLICY.gate },
    { title: "Execution scope", value: POLICY.scope },
  ];

  return (
    <div className="rounded-xl border border-[#DDDDDD] bg-white dark:bg-zinc-900/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="space-y-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
            Policy
          </p>
          <p className="text-[14px] font-semibold text-black dark:text-zinc-100">
            When and how execution is allowed
          </p>
          <p className="text-[12px] text-black dark:text-zinc-500">
            Auto-activation, gates, scope, and reasons.
          </p>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="px-3 py-1.5 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 text-[12px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors shrink-0"
        >
          {open ? "Hide" : "Details"}
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Policy fields */}
        <div className="grid grid-cols-3 gap-2.5">
          {policyFields.map(({ title, value }) => (
            <div
              key={title}
              className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3.5 flex flex-col gap-1.5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
                {title}
              </p>
              <p className="text-[13px] font-medium text-black dark:text-zinc-200">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Reasons */}
        <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500 mb-3">
            Reasons
          </p>
          <ul className="space-y-2">
            {POLICY.reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600 mt-1.5 shrink-0" />
                <p className="text-[12px] text-black dark:text-zinc-400 leading-relaxed">{r}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Inline reveal — policy details */}
        {open && (
          <div className="flex flex-col gap-2">
            {POLICY.details.map((d) => (
              <div key={d.label} className="flex gap-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 px-3 py-2.5">
                <span className="w-[130px] shrink-0 text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500 pt-px">
                  {d.label}
                </span>
                <span className="text-[12.5px] font-medium text-black dark:text-zinc-200">{d.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicySection;
