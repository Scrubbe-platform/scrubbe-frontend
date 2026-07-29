"use client";
import React from "react";
import { ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import { TRACE_STEPS } from "./incidentDelivery.data";

const DeliverySignal = () => (
  <div className="rounded-2xl border border-[#DDDDDD] bg-white dark:bg-zinc-900/40 p-6 space-y-5">
    {/* ── Header ── */}
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
        Delivery Signals
      </p>

      <p className="text-[13.5px] text-black/60 dark:text-zinc-400 max-w-2xl leading-relaxed">
        In production these arrive automatically. Each stage updates from the
        decision log and incident state — select one to inspect it.
      </p>
    </div>

    {/* ── Steps ── */}
    <div className="w-fit max-w-full flex flex-wrap items-center gap-2.5">
      {TRACE_STEPS.map((step, i) => {
        const isLast = i === TRACE_STEPS.length - 1;
        return (
          <React.Fragment key={step.title}>
            <button
              type="button"
              onClick={() => toast(step.title, { description: step.sub })}
              className="min-w-[220px] flex gap-2 items-center rounded-xl shadow-md shadow-light p-4 transition-colors hover:border-emerald-300"
            >
              <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                <Check size={12} className="text-white" strokeWidth={3} />
              </span>
              <div className="flex flex-col">
                <p className="text-sm font-bold text-left text-black dark:text-zinc-200">
                  {step.title}
                </p>
                <p className="text-sm text-black/50 dark:text-zinc-500 leading-snug">
                  {step.sub}
                </p>
              </div>
            </button>
            {!isLast && (
              <ChevronRight
                size={16}
                className="text-black/30 dark:text-zinc-600 shrink-0"
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  </div>
);

export default DeliverySignal;
