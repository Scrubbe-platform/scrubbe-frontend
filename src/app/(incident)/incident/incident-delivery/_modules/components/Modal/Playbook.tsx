import React from "react";

interface PlaybookProps {
  name: string;
  description: string;
  scope: string;
  steps: string[];
}

const Playbook = ({ name, description, scope, steps }: PlaybookProps) => {
  return (
    <div className="dark:text-white text-black space-y-4">
      <div className="border border-neutral-500 rounded-xl p-4">
        <p className="text-base font-bold">{name}</p>
        <p className="text-sm">{description}</p>
        <p className="text-xs text-zinc-400 mt-1">Scope: {scope}</p>
      </div>
      <div className="border border-neutral-500 rounded-xl p-4">
        <p className="text-base">Steps</p>
        {steps.length > 0 ? (
          <ul className="list-decimal pl-3 text-base mt-2">
            {steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-400 mt-2">
            No investigation steps defined for this playbook.
          </p>
        )}
      </div>
    </div>
  );
};

export default Playbook;
