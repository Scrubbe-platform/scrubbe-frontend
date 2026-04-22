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

const IncidentLifecycle: React.FC<IncidentLifecycleProps> = ({
  currentStep,
}) => {
  const steps: LifecycleStepLabel[] = [
    "Detected",
    "Enriched",
    "Analysed",
    "Proposed",
    "Approved",
    "Executed",
    "Resolved",
  ];

  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div className="w-full p-4 md:p-8 rounded-xl">
      <h2 className="text-white text-base font-semibold mb-8">
        Incident Lifecycle
      </h2>

      {/* Horizontal Scroll Container for Mobile:
         Uses -mx-4 and px-4 to allow the "line" to touch the edges while scrolling
      */}
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
        <div className="relative flex items-center justify-between min-w-[700px] md:min-w-full pb-12">
          {/* Background Connector Line */}
          <div className="absolute top-5 left-0 w-full h-[1px] bg-slate-800 z-0" />

          {steps.map((label, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div
                key={`${label}-${index}`}
                className="relative z-10 flex flex-col items-center"
              >
                {/* Circle Icon */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 bg-[#03050c]",
                    isCompleted &&
                      "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
                    isCurrent &&
                      "border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]",
                    !isCompleted && !isCurrent && "border-slate-700"
                  )}
                >
                  {isCompleted ? (
                    <Check
                      size={20}
                      className="text-emerald-500"
                      strokeWidth={3}
                    />
                  ) : (
                    <span
                      className={`text-sm font-bold ${
                        isCurrent ? "text-amber-400" : "text-slate-600"
                      }`}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Label below the circle */}
                <div className="absolute top-12 whitespace-nowrap">
                  <span
                    className={cn(
                      "text-[11px] md:text-sm font-medium transition-colors duration-500 uppercase tracking-tight md:tracking-normal",
                      isCompleted
                        ? "text-emerald-500"
                        : isCurrent
                        ? "text-amber-400"
                        : "text-slate-500"
                    )}
                  >
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default IncidentLifecycle;
