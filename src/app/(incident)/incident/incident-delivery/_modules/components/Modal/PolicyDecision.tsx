import React from "react";

interface PolicyDecisionProps {
  autoActivate: boolean;
  approvalGate: boolean;
  scope: string;
  reasons: string[];
}

const PolicyDecision = ({ autoActivate, approvalGate, scope, reasons }: PolicyDecisionProps) => {
  return (
    <div className="dark:text-white text-black space-y-4">
      <div className="border border-neutral-500 rounded-xl p-4 grid grid-cols-3 gap-3">
        <div className="border border-neutral-500 rounded-xl p-4">
          <p className="text-sm dark:text-gray-300">Auto-active</p>
          <p className="text-base font-semibold">{autoActivate ? "Yes" : "No"}</p>
        </div>
        <div className="border border-neutral-500 rounded-xl p-4">
          <p className="text-sm dark:text-gray-300">Approval gate</p>
          <p className="text-base font-semibold">{approvalGate ? "Required" : "Not required"}</p>
        </div>
        <div className="border border-neutral-500 rounded-xl p-4">
          <p className="text-sm dark:text-gray-300">Scope</p>
          <p className="text-base font-semibold">{scope}</p>
        </div>
      </div>

      <div className="border border-neutral-500 rounded-xl p-4">
        <p className="text-sm dark:text-gray-300 mb-2">Reasons</p>
        {reasons.length > 0 ? (
          <ul className="list-disc pl-4">
            {reasons.map((r, i) => (
              <li key={i} className="text-sm">
                {r}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-400">No guardrail reasons recorded.</p>
        )}
      </div>
    </div>
  );
};

export default PolicyDecision;
