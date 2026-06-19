"use client";

import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button1";
import Modal from "@/components/ui/Modal";
import { EscalationStep } from "../types/oncall-type";

interface CreateEscalationPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TARGET_OPTIONS = [
  "Primary on-call",
  "Secondary on-call",
  "Team lead",
  "Engineering Manager",
  "VP Engineering",
  "CTO",
  "CEO",
];
const CHANNEL_OPTIONS = [
  "Page + SMS",
  "Page only",
  "Email",
  "Slack + Page",
  "All channels",
];

export default function CreateEscalationPolicyModal({
  isOpen,
  onClose,
}: CreateEscalationPolicyModalProps) {
  // Main Controlled Configuration States
  const [policyName, setPolicyName] = useState("");
  const [severity, setSeverity] = useState("P1 & above");
  const [autoEscalate, setAutoEscalate] = useState(true);
  const [warRoom, setWarRoom] = useState(false);

  // Dynamic Array handling the sub-steps form elements
  const [steps, setSteps] = useState<EscalationStep[]>([
    { target: "Primary on-call", timeout: 5, channels: "Page + SMS" },
  ]);

  const handleAddStep = () => {
    setSteps([
      ...steps,
      { target: "Secondary on-call", timeout: 15, channels: "All channels" },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleStepChange = (
    index: number,
    field: keyof EscalationStep,
    value: any,
  ) => {
    setSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, [field]: value } : step)),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect compiled structure directly into orchestration API context layers
    console.log({ policyName, severity, steps, autoEscalate, warRoom });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        className="w-full overflow-hidden bg-white dark:bg-zinc-950 rounded-lg"
      >
        {/* Component Header & Integrated Title */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
              Create Escalation Policy
            </h2>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              Define escalation chain rules and timeouts
            </p>
          </div>
        </div>

        {/* Modal Scroll Body */}
        <div className="space-y-4 p-6 max-h-[70vh] overflow-y-auto">
          {/* Policy Name String Input */}
          <div className="flex flex-col">
            <label className="mb-1.5 text-xs font-bold tracking-wide text-zinc-700 dark:text-zinc-400">
              Policy Name
            </label>
            <input
              type="text"
              required
              value={policyName}
              onChange={(e) => setPolicyName(e.target.value)}
              placeholder="e.g., Critical Infrastructure P0"
              className="h-9 w-full rounded-md border border-zinc-200 px-3 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
          </div>

          {/* Severity Dropdown Trigger */}
          <div className="flex flex-col">
            <label className="mb-1.5 text-xs font-bold tracking-wide text-zinc-700 dark:text-zinc-400">
              Severity Trigger
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-[13px] text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            >
              <option value="P0 only">P0 — Critical</option>
              <option value="P1 only">P1 — High</option>
              <option value="P1 & above">P1 & above</option>
              <option value="All severities">All severities</option>
            </select>
          </div>

          <hr className="border-zinc-100 dark:border-zinc-900 my-2" />

          {/* Dynamic Steps Mapping Loop Elements block */}
          <div className="flex flex-col">
            <label className="mb-2 text-xs font-bold tracking-wide text-zinc-700 dark:text-zinc-400">
              Escalation Steps
            </label>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50/30 p-3.5 dark:border-zinc-900 dark:bg-zinc-900/10"
                >
                  {/* Step Index Number Shield */}
                  <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {index + 1}
                  </div>

                  {/* Form Element Select Grid Matrix row */}
                  <div className="flex-1 space-y-2">
                    <select
                      value={step.target}
                      onChange={(e) =>
                        handleStepChange(index, "target", e.target.value)
                      }
                      className="h-8 w-full rounded border border-zinc-200 bg-white px-2 text-[12px] text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                    >
                      {TARGET_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>

                    <div className="grid grid-cols-12 gap-2">
                      {/* Timeout Input */}
                      <div className="col-span-5 flex items-center gap-1.5">
                        <span className="text-[11px] text-zinc-400 whitespace-nowrap">
                          Timeout:
                        </span>
                        <div className="flex items-center rounded border border-zinc-200 bg-white px-2 dark:border-zinc-800 dark:bg-zinc-900">
                          <input
                            type="number"
                            min="1"
                            value={step.timeout}
                            onChange={(e) =>
                              handleStepChange(
                                index,
                                "timeout",
                                Number(e.target.value),
                              )
                            }
                            className="w-10 h-7 text-center text-xs font-mono text-zinc-900 bg-transparent outline-none dark:text-white"
                          />
                          <span className="text-[10px] text-zinc-400">min</span>
                        </div>
                      </div>

                      {/* Channel Override Select */}
                      <div className="col-span-7">
                        <select
                          value={step.channels}
                          onChange={(e) =>
                            handleStepChange(index, "channels", e.target.value)
                          }
                          className="h-8 w-full rounded border border-zinc-200 bg-white px-2 text-[11px] text-zinc-700 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                        >
                          {CHANNEL_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Delete step index element action button trigger */}
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(index)}
                      className="p-1 text-zinc-400 hover:text-red-500 transition-colors mt-0.5"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddStep}
              className="mt-3 w-fit text-left text-xs font-medium text-emerald-600 transition-colors hover:text-emerald-700 hover:underline dark:text-emerald-400"
            >
              + Add escalation step
            </button>
          </div>

          <hr className="border-zinc-100 dark:border-zinc-900 my-2" />

          {/* Toggle Rule Toggles Stack Options */}
          <div className="space-y-3 pt-1">
            {/* Auto-escalate Toggle Switch */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200">
                  Auto-escalate if no acknowledgement
                </div>
                <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Automatically move to next step on step timeout
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoEscalate}
                  onChange={() => setAutoEscalate(!autoEscalate)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* War room Trigger Toggle Switch */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200">
                  War room trigger
                </div>
                <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Create Slack + Zoom war room channels on execution timeouts
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={warRoom}
                  onChange={() => setWarRoom(!warRoom)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer row controls */}
        <div className="flex justify-end gap-2 border-t border-zinc-100 p-4 dark:border-zinc-800">
          <Button type="button" variant="outline-dark" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Policy</Button>
        </div>
      </form>
    </Modal>
  );
}
