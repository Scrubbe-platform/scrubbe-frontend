// components/oncall/AutoEscalationRuleModal.tsx
"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, Code } from "lucide-react";
import Button from "@/components/ui/Button1";
import Modal from "@/components/ui/Modal";
import { RuleCondition, MatchStrategy } from "../types/oncall-type";

interface RuleBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Global engine dropdown configuration structures mapped cleanly outside the re-render cycles
const FIELD_DEFS: Record<
  string,
  {
    label: string;
    ops: string[];
    type: "select" | "number";
    options?: string[];
    unit?: string;
  }
> = {
  severity: {
    label: "Incident severity",
    ops: ["is", "is not", "is at least"],
    type: "select",
    options: ["P0", "P1", "P2", "P3"],
  },
  ack: {
    label: "Acknowledgement",
    ops: ["is"],
    type: "select",
    options: [
      "not received in this step",
      "not received in any step",
      "received",
    ],
  },
  step: {
    label: "Current step",
    ops: ["is", "is at least"],
    type: "select",
    options: ["Step 1", "Step 2", "Step 3", "Step 4", "Final step"],
  },
  age: { label: "Incident age", ops: ["≥", "≤"], type: "number", unit: "min" },
  window: {
    label: "Time window",
    ops: ["is", "is not"],
    type: "select",
    options: [
      "business hours (08:00–18:00)",
      "off-hours (18:00–08:00)",
      "overnight (22:00–06:00)",
      "weekend",
    ],
  },
  service: {
    label: "Affected service",
    ops: ["is", "is not"],
    type: "select",
    options: ["payments", "auth", "database", "platform", "frontend", "cdn"],
  },
};

const ACTION_DEFS: Record<
  string,
  {
    label: string;
    hasParams: boolean;
    paramType?: "number" | "select";
    paramLabel?: string;
    options?: string[];
  }
> = {
  advance: { label: "Advance to next escalation step", hasParams: false },
  override: {
    label: "Override timeout threshold",
    hasParams: true,
    paramType: "number",
    paramLabel: "Minutes",
  },
  escalate: {
    label: "Escalate directly to tier step",
    hasParams: true,
    paramType: "select",
    paramLabel: "Target Step",
    options: ["Step 1", "Step 2", "Step 3", "Step 4", "Final step"],
  },
  warroom: { label: "Create war room (Slack + Zoom)", hasParams: false },
  halve: { label: "Halve all timeout thresholds parameters", hasParams: false },
};

export default function AutoEscalationRuleModal({
  isOpen,
  onClose,
}: RuleBuilderModalProps) {
  const [ruleName, setRuleName] = useState("");
  const [matchStrategy, setMatchStrategy] = useState<MatchStrategy>("all");
  const [actionType, setActionType] = useState("advance");
  const [actionParam, setActionParam] = useState<string | number>("");
  const [enabled, setEnabled] = useState(true);

  // Controlled condition rows array state
  const [conditions, setConditions] = useState<RuleCondition[]>([
    { field: "severity", op: "is", value: "P0" },
  ]);

  const addConditionRow = () => {
    setConditions([
      ...conditions,
      { field: "severity", op: "is", value: "P0" },
    ]);
  };

  const removeConditionRow = (idx: number) => {
    setConditions(conditions.filter((_, i) => i !== idx));
  };

  const handleFieldChange = (idx: number, fieldKey: string) => {
    const def = FIELD_DEFS[fieldKey];
    setConditions((prev) =>
      prev.map((c, i) =>
        i === idx
          ? {
              field: fieldKey,
              op: def.ops[0],
              value: def.type === "number" ? 15 : def.options![0],
            }
          : c,
      ),
    );
  };

  const updateConditionValue = (
    idx: number,
    key: keyof RuleCondition,
    value: any,
  ) => {
    setConditions((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [key]: value } : c)),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Connect clean output contract to your backend execution worker sync endpoints
    console.log({
      name: ruleName,
      enabled,
      match: matchStrategy,
      conditions,
      action: { type: actionType, params: { value: actionParam } },
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl overflow-hidden bg-white dark:bg-zinc-950 rounded-lg"
      >
        {/* Component Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Code size={16} className="text-zinc-400" /> New Auto-Escalation
              Rule
            </h2>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              Build an IF / THEN conditional rule, evaluated on top of the
              timeout matrix
            </p>
          </div>
        </div>

        {/* Modal Form Scroll Body */}
        <div className="space-y-4 p-6 max-h-[70vh] overflow-y-auto">
          {/* Rule Identifier Name Input */}
          <div className="flex flex-col">
            <label className="mb-1.5 text-xs font-bold tracking-wide text-zinc-700 dark:text-zinc-400">
              Rule Name
            </label>
            <input
              type="text"
              required
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder="e.g., P0 fast-track priority escalation"
              className="h-9 w-full rounded-md border border-zinc-200 px-3 text-[13px] text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
          </div>

          {/* Condition Strategy Selector Headers */}
          <div className="flex items-center justify-between bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 dark:bg-zinc-900/40 dark:border-zinc-900">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-400">
              Conditions Logic Strategy
            </span>
            <div className="flex gap-[1px] rounded bg-zinc-200/60 p-[2px] dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => setMatchStrategy("all")}
                className={`rounded-[3px] px-3 py-1 font-sans text-[11px] font-semibold transition-all ${
                  matchStrategy === "all"
                    ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white"
                    : "text-zinc-500"
                }`}
              >
                Match ALL
              </button>
              <button
                type="button"
                onClick={() => setMatchStrategy("any")}
                className={`rounded-[3px] px-3 py-1 font-sans text-[11px] font-semibold transition-all ${
                  matchStrategy === "any"
                    ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white"
                    : "text-zinc-500"
                }`}
              >
                Match ANY
              </button>
            </div>
          </div>

          {/* Conditions Generator Flow Matrix Array Stack */}
          <div className="space-y-2">
            {conditions.map((cond, idx) => {
              const currentDef = FIELD_DEFS[cond.field];
              const joinerLabel =
                idx === 0 ? "IF" : matchStrategy === "all" ? "AND" : "OR";

              return (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  {/* Logic Connector Flag */}
                  <div
                    className={`col-span-1 text-center text-[11px] font-extrabold tracking-wider ${
                      idx === 0
                        ? "text-zinc-400"
                        : matchStrategy === "all"
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-purple-600 dark:text-purple-400"
                    }`}
                  >
                    {joinerLabel}
                  </div>

                  {/* Criteria Parameter Field drop-down */}
                  <div className="col-span-4">
                    <select
                      value={cond.field}
                      onChange={(e) => handleFieldChange(idx, e.target.value)}
                      className="h-9 w-full rounded-md border border-zinc-200 bg-white px-2 text-xs text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                    >
                      {Object.entries(FIELD_DEFS).map(([k, d]) => (
                        <option key={k} value={k}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Relational Evaluation Operator drop-down */}
                  <div className="col-span-3">
                    <select
                      value={cond.op}
                      onChange={(e) =>
                        updateConditionValue(idx, "op", e.target.value)
                      }
                      className="h-9 w-full rounded-md border border-zinc-200 bg-white px-2 text-xs text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                    >
                      {currentDef.ops.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Value Dynamic Target Type assignment Input or Select box switch */}
                  <div className="col-span-3 flex items-center gap-1">
                    {currentDef.type === "number" ? (
                      <div className="flex h-9 w-full items-center rounded-md border border-zinc-200 bg-white px-2 dark:border-zinc-800 dark:bg-zinc-900">
                        <input
                          type="number"
                          value={cond.value}
                          onChange={(e) =>
                            updateConditionValue(
                              idx,
                              "value",
                              Number(e.target.value),
                            )
                          }
                          className="w-full text-xs font-mono bg-transparent outline-none dark:text-white"
                        />
                        <span className="text-[10px] text-zinc-400 ml-1">
                          {currentDef.unit}
                        </span>
                      </div>
                    ) : (
                      <select
                        value={cond.value}
                        onChange={(e) =>
                          updateConditionValue(idx, "value", e.target.value)
                        }
                        className="h-9 w-full rounded-md border border-zinc-200 bg-white px-2 text-xs text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                      >
                        {currentDef.options?.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Remove target criteria point block row */}
                  <div className="col-span-1 text-right">
                    {conditions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeConditionRow(idx)}
                        className="p-1.5 border border-zinc-200 rounded-md text-zinc-400 hover:text-red-500 dark:border-zinc-800 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addConditionRow}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline dark:text-emerald-400"
          >
            + Add another criteria clause condition
          </button>

          {/* THEN Execution Parameters Canvas Frame Blocks */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/20 p-4 dark:border-emerald-950/30 dark:bg-emerald-950/5">
            <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 tracking-wider mb-3 uppercase">
              THEN Execution Parameters
            </div>
            <div className="grid grid-cols-2 gap-3 items-end">
              <div className="flex flex-col">
                <label className="mb-1.5 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                  Pipeline Core Action
                </label>
                <select
                  value={actionType}
                  onChange={(e) => {
                    setActionType(e.target.value);
                    setActionParam(""); // Reset sub-parameters upon switch
                  }}
                  className="h-9 w-full rounded-md border border-zinc-200 bg-white px-2 text-xs text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                >
                  {Object.entries(ACTION_DEFS).map(([k, d]) => (
                    <option key={k} value={k}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Conditional sub-parameters render tracking action profiles */}
              <div className="flex flex-col">
                {ACTION_DEFS[actionType].hasParams ? (
                  <>
                    <label className="mb-1.5 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                      {ACTION_DEFS[actionType].paramLabel}
                    </label>
                    {ACTION_DEFS[actionType].paramType === "number" ? (
                      <input
                        type="number"
                        required
                        value={actionParam}
                        onChange={(e) => setActionParam(Number(e.target.value))}
                        className="h-9 w-full rounded-md border border-zinc-200 px-3 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                      />
                    ) : (
                      <select
                        value={actionParam}
                        onChange={(e) => setActionParam(e.target.value)}
                        className="h-9 w-full rounded-md border border-zinc-200 bg-white px-2 text-xs text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                      >
                        <option value="">Select option…</option>
                        {ACTION_DEFS[actionType].options?.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    )}
                  </>
                ) : (
                  <span className="text-[11px] text-zinc-400 italic mb-2.5">
                    No parameters needed for this step sequence
                  </span>
                )}
              </div>
            </div>
          </div>

          <hr className="border-zinc-100 dark:border-zinc-900 my-1" />

          {/* Master Rule Active Switch toggle block */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200">
                Rule Active Deployment State
              </div>
              <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
                Uncheck to park this engine instruction as a baseline draft
                blueprint
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => setEnabled(!enabled)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full dark:bg-zinc-800 peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
        </div>

        {/* Modal Action Footer controls */}
        <div className="flex justify-end gap-2 border-t border-zinc-100 p-4 dark:border-zinc-800">
          <Button type="button" variant="outline-dark" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Escalation Rule</Button>
        </div>
      </form>
    </Modal>
  );
}
