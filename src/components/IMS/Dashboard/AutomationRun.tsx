// AutomationRuns.tsx

import React from "react";

// Define the shape of a single automation run item
interface AutomationRun {
  workflowId: string;
  status: string;
  timestamp: string;
}

// Define the props for the component
interface Props {
  runs: AutomationRun[];
}

const statusClasses: { [key: string]: string } = {
  Success: "bg-emerald-100 text-emerald-700",
  Failure: "bg-red-100 text-red-700",
};

const AutomationRuns = ({ runs }: Props) => {
  return (
    <div className="bg-white p-6 rounded-lg ">
      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Automation Runs
      </h2>

      {/* Automation Runs List */}
      <div className="space-y-4">
        {runs.map((run, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
          >
            <div className="flex items-center space-x-2 text-gray-700 text-base">
              <span>{run.workflowId}:</span>
            </div>

            <div className="flex-1 text-center">
              <span
                className={`font-medium px-3 py-1 rounded-full text-sm ${
                  statusClasses[run.status]
                }`}
              >
                {run.status}
              </span>
            </div>

            <span className="text-gray-500 font-medium text-sm">
              ({run.timestamp})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutomationRuns;
