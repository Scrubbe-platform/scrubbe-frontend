import React from "react";
import { Check } from "lucide-react";

// --- Types ---

// Define the exact strings allowed based on your UI
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
  // Define the ordered sequence of the lifecycle
  // Note: Your image shows "Enriched" twice; if that's intentional for
  // different sub-stages, we handle the first match.
  const steps: LifecycleStepLabel[] = [
    "Detected",
    "Enriched",
    "Enriched",
    "Analysed",
    "Proposed",
    "Approved",
    "Executed",
    "Resolved",
  ];

  // Find the index of the step passed via props
  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div className="w-full p-8 rounded-xl">
      <h2 className="text-white text-base font-semibold mb-6">
        Incident Lifecycle
      </h2>

      <div className="relative flex items-center justify-between">
        {/* Background Connector Line */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-800 -translate-y-1/2 z-0" />

        {steps.map((label, index) => {
          // Logic:
          // 1. If index < currentStepIndex -> It's in the past (Completed)
          // 2. If index === currentStepIndex -> It's the one we are on (Current)
          // 3. Otherwise -> It's in the future (Pending)
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div
              key={`${label}-${index}`}
              className="relative z-10 flex flex-col items-center"
            >
              {/* Circle Icon */}
              <div
                className={`
                w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 bg-dark
                ${
                  isCompleted
                    ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    : ""
                }
                ${
                  isCurrent
                    ? "border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                    : ""
                }
                ${!isCompleted && !isCurrent ? "border-slate-700" : ""}
              `}
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
                  className={`text-sm font-medium transition-colors duration-500 ${
                    isCompleted
                      ? "text-emerald-500"
                      : isCurrent
                      ? "text-amber-400"
                      : "text-slate-500"
                  }`}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IncidentLifecycle;
