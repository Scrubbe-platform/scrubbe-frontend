// components/oncall/AutoEscalationPanel.tsx
"use client";

import React, { useState } from "react";
import {
  Bot,
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Check,
  Settings,
  ChevronLeft,
} from "lucide-react";
import Button from "@/components/ui/Button1";
import { mockTimeoutMatrix, mockAutoEscRules } from "../constant/index";
import AutoEscalationRuleModal from "./AutoEscalationModal";
import { useRouter } from "next/navigation";

export default function AutoEscalationPanel() {
  const [rules, setPolicies] = useState(mockAutoEscRules);
  const [matrix, setMatrix] = useState(mockTimeoutMatrix);
  const [isMatrixEditing, setIsMatrixEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  // Global Engine Context Switch Checkboxes State
  const [config, setConfig] = useState({
    autoEscalate: true,
    warRoomTrigger: true,
    channelsAutoCreate: true,
    smsFallback: true,
    offHoursStrict: false,
  });

  const toggleConfig = (key: keyof typeof config) => {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleRuleActive = (id: number) => {
    setPolicies((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    );
  };

  const deleteRule = (id: number) => {
    if (confirm("Are you sure you want to delete this escalation rule?")) {
      setPolicies((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const moveRule = (index: number, direction: number) => {
    const nextIdx = index + direction;
    if (nextIdx < 0 || nextIdx >= rules.length) return;
    const reordered = [...rules];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(nextIdx, 0, moved);
    setPolicies(reordered);
  };

  return (
    <div className="w-full p-6 space-y-6">
      {/* View Header */}
      <div className="">
        <Button
          leftIcon={<ChevronLeft size={16} />}
          size="sm"
          variant="outline-dark"
          onClick={() => router.back()}
        >
          Back
        </Button>
      </div>
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-900">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Auto-Escalation Engine
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Intelligent, time-based automatic escalation rules layer
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Engine Active
        </span>
      </div>

      {/* Grid: Global Toggles Left & Timeout Matrix Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card: Global Runtime Parameters Checklists */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
            <Settings size={15} className="text-zinc-400" /> Global
            Auto-Escalation
          </h3>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 mb-5">
            Controls for the Scrubbe auto-escalation background runtime worker
          </p>

          <div className="space-y-4">
            {Object.entries({
              autoEscalate: [
                "Auto-escalate on timeout",
                "Move to next execution step if no acknowledgment received",
              ],
              warRoomTrigger: [
                "War room auto-trigger",
                "Escalate critical unacknowledged issues to active incident bridges",
              ],
              channelsAutoCreate: [
                "Slack + Zoom auto-create",
                "Instantly open dedicated secure rooms upon alert state triggers",
              ],
              smsFallback: [
                "SMS voice layer fallback",
                "Execute telephone backup sequences if chat payloads remain unread",
              ],
              offHoursStrict: [
                "Off-hours strict parameters mode",
                "Automatically halve timeout threshold metrics overnight between 22:00–06:00",
              ],
            }).map(([key, [label, desc]]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200">
                    {label}
                  </div>
                  <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
                    {desc}
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config[key as keyof typeof config]}
                    onChange={() => toggleConfig(key as keyof typeof config)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full dark:bg-zinc-800 peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Card: Inline Editable Timeout Matrix Table */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Timeout Matrix
            </h3>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 mb-4">
              Unacknowledged matrix threshold tracking vectors
            </p>

            <div className="overflow-x-auto rounded-lg border border-zinc-100 dark:border-zinc-900">
              <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-400">
                <thead className="bg-zinc-50 font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800">
                  <tr>
                    <th className="px-3 py-2.5">Severity</th>
                    <th className="px-3 py-2.5">Step 1</th>
                    <th className="px-3 py-2.5">Step 2</th>
                    <th className="px-3 py-2.5">War Room</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {matrix.map((row, rIdx) => (
                    <tr
                      key={row.sev}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30"
                    >
                      <td className="px-3 py-3 font-medium whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${row.badgeStyle}`}
                        >
                          {row.sev}
                        </span>
                      </td>
                      {row.cells.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2">
                          {isMatrixEditing ? (
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMatrix((prev) =>
                                  prev.map((r, idx) =>
                                    idx === rIdx
                                      ? {
                                          ...r,
                                          cells: r.cells.map((c, i) =>
                                            i === cIdx ? val : c,
                                          ),
                                        }
                                      : r,
                                  ),
                                );
                              }}
                              className="w-16 h-7 rounded border border-zinc-200 bg-white px-2 text-center font-mono text-[11px] font-semibold outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                            />
                          ) : (
                            <span className="font-mono text-[11px] font-medium text-zinc-800 dark:text-zinc-200">
                              {cell}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMatrixEditing(!isMatrixEditing)}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50/50 h-9 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all"
          >
            {isMatrixEditing ? (
              <>
                <Check size={14} /> Save matrix
              </>
            ) : (
              <>
                <Pencil size={13} /> Edit matrix
              </>
            )}
          </button>
        </div>
      </div>

      {/* Segment: Rule Execution Flow Loop Wrapper */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Auto-Escalation Conditional Rules
            </h3>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              Layered criteria evaluated linearly on top of the base timeout
              matrix
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus size={13} className="mr-1" />}
          >
            Add rule
          </Button>
        </div>

        {/* Rules Cards List Loop */}
        <div className="space-y-2.5">
          {rules.map((rule, idx) => (
            <div
              key={rule.id}
              className={`flex items-center gap-4 rounded-xl border p-4 shadow-2xs transition-all ${
                rule.enabled
                  ? "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
                  : "border-zinc-100 bg-zinc-50/50 dark:border-zinc-900 dark:bg-zinc-900/10 opacity-60"
              }`}
            >
              {/* Sequence Order Counter Avatar */}
              <div className="h-6 w-6 shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-mono text-[11px] font-bold">
                {idx + 1}
              </div>

              {/* Parsed Conditional Read-Only Output String */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed truncate">
                  IF{" "}
                  <span className="text-zinc-900 font-bold dark:text-white">
                    {rule.name}
                  </span>{" "}
                  context criteria match ({rule.match.toUpperCase()})
                </div>
                <div className="mt-1 text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">
                  THEN{" "}
                  <span className="text-emerald-600 font-bold dark:text-emerald-400">
                    {rule.action.type.toUpperCase()}
                  </span>{" "}
                  execution parameters applied
                </div>
              </div>

              {/* Action Toolbar Column */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Active Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => toggleRuleActive(rule.id)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-zinc-200 rounded-full dark:bg-zinc-800 peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:after:translate-x-full" />
                </label>

                {/* Positional Re-order Array controls */}
                <div className="flex gap-0.5">
                  <button
                    onClick={() => moveRule(idx, -1)}
                    disabled={idx === 0}
                    className="p-1 border border-zinc-200 rounded text-zinc-400 hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-800 dark:hover:bg-zinc-900"
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    onClick={() => moveRule(idx, 1)}
                    disabled={idx === rules.length - 1}
                    className="p-1 border border-zinc-200 rounded text-zinc-400 hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-800 dark:hover:bg-zinc-900"
                  >
                    <ChevronDown size={13} />
                  </button>
                </div>

                {/* Operations */}
                <div className="flex gap-0.5">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-1.5 border border-zinc-200 rounded text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-1.5 border border-red-100 rounded text-red-500 hover:bg-red-50/50 dark:border-red-950 dark:hover:bg-red-950/30"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Rule Builder Modal Frame Component */}
      <AutoEscalationRuleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
