"use client";
import React from "react";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { TRACE_STATUS, TRACE_STEPS } from "./incidentDelivery.data";

const DeliverySignal = () => (
  <div className="rounded-xl border border-[#DDDDDD] bg-white dark:bg-zinc-900/40 p-6 space-y-5">
    {/* ── Header ── */}
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
          Delivery Signals
        </p>
        <h2 className="text-[16px] font-semibold text-black dark:text-white">
          Incoming delivery signals
        </h2>
        <p className="text-[13px] text-black dark:text-zinc-400 max-w-lg leading-relaxed">
          In production, integrations deliver these automatically. Each stage
          below reflects the incident's real state.
        </p>
      </div>

      <span className="shrink-0 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-[12px] font-medium text-emerald-700 dark:text-emerald-400">
        {TRACE_STATUS}
      </span>
    </div>

    {/* ── Steps ── */}
    <div className="w-fit max-w-full flex flex-wrap items-center gap-2">
      {TRACE_STEPS.map((step, i) => {
        const isLast = i === TRACE_STEPS.length - 1;
        return (
          <React.Fragment key={step.title}>
            <button
              type="button"
              onClick={() => toast(step.title, { description: step.sub })}
              className={`min-w-[180px text-left rounded-lg border p-3 transition-colors hover:border-emerald-300 ${
                isLast ? "border-emerald-400" : "border-[#DDDDDD]"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                  <Check size={9} className="text-white" strokeWidth={3} />
                </span>
                <p className="text-[12px] font-semibold text-black dark:text-zinc-200">
                  {step.title}
                </p>
              </div>
              <p className="text-[11px] text-black dark:text-zinc-500 leading-snug pl-5">
                {step.sub}
              </p>
            </button>
            {!isLast && (
              <ArrowRight
                size={14}
                className="text-zinc-300 dark:text-zinc-600 shrink-0"
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  </div>
);

export default DeliverySignal;
