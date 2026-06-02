"use client";
import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type LifecycleStepLabel =
  | "Detected"
  | "Enriched"
  | "Analysed"
  | "Proposed"
  | "Approved"
  | "Executed"
  | "Resolved";

interface IncidentLifecycleProps {
  currentStep: LifecycleStepLabel;
}

const steps: LifecycleStepLabel[] = [
  "Detected", "Enriched", "Analysed", "Proposed", "Approved", "Executed", "Resolved",
];

const IncidentLifecycle: React.FC<IncidentLifecycleProps> = ({ currentStep }) => {
  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div className="w-full px-5 md:px-8 py-6 border-b border-zinc-100 dark:border-white/[0.06]">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-6">
        Incident Lifecycle
      </p>

      {/* scrollable on mobile */}
      <div className="overflow-x-auto no-scrollbar">
        <div className="relative flex items-start justify-between min-w-[600px] md:min-w-full pb-8">

          {/* connector track */}
          <div className="absolute top-[18px] left-5 right-5 h-px bg-zinc-100 dark:bg-zinc-800 z-0" />

          {/* progress fill */}
          {currentStepIndex > 0 && (
            <div
              className="absolute top-[18px] left-5 h-px bg-emerald-400 dark:bg-emerald-500 z-0 transition-all duration-700"
              style={{ width: `calc(${(currentStepIndex / (steps.length - 1)) * 100}% - 2.5rem)` }}
            />
          )}

          {steps.map((label, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isPending = index > currentStepIndex;

            return (
              <div key={label} className="relative z-10 flex flex-col items-center gap-3">
                {/* Step dot */}
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    isCompleted && "border-emerald-400 dark:border-emerald-500 bg-emerald-400 dark:bg-emerald-500",
                    isCurrent  && "border-amber-400 dark:border-amber-400 bg-white dark:bg-zinc-900",
                    isPending  && "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  )}
                >
                  {isCompleted ? (
                    <Check size={14} className="text-white" strokeWidth={3} />
                  ) : (
                    <span className={cn(
                      "text-[11px] font-bold",
                      isCurrent ? "text-amber-500 dark:text-amber-400" : "text-zinc-300 dark:text-zinc-600"
                    )}>
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span className={cn(
                  "text-[11px] font-medium whitespace-nowrap uppercase tracking-wide transition-colors",
                  isCompleted && "text-emerald-500 dark:text-emerald-400",
                  isCurrent  && "text-amber-500 dark:text-amber-400",
                  isPending  && "text-zinc-300 dark:text-zinc-600"
                )}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default IncidentLifecycle;