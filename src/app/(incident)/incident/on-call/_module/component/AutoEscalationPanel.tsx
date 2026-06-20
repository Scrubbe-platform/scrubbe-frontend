// components/oncall/AutoEscalationPanel.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
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
import { SEVERITY_DISPLAY, DEFAULT_TIMEOUT_MATRIX } from "../constant/index";
import AutoEscalationRuleModal from "./AutoEscalationModal";
import { useRouter } from "next/navigation";
import {
  deleteAutoEscalationRule,
  fetchAutoEscalationRules,
  fetchOnCallConfig,
  updateAutoEscalationRule,
  updateOnCallConfig,
} from "@/lib/escalation/escalation.api";
import { AutoEscalationRuleRecord } from "../types/oncall-type";

const RULES_QUERY_KEY = ["auto-escalation-rules"];
const CONFIG_QUERY_KEY = ["oncall-config"];

const CONFIG_FIELDS: { key: keyof typeof DEFAULT_CONFIG_LABELS; label: string; desc: string }[] = [
  {
    key: "autoEscalateEnabled",
    label: "Auto-escalate on timeout",
    desc: "Move to next execution step if no acknowledgment received",
  },
  {
    key: "warRoomTriggerEnabled",
    label: "War room auto-trigger",
    desc: "Escalate critical unacknowledged issues to active incident bridges",
  },
  {
    key: "channelsAutoCreate",
    label: "Slack + Zoom auto-create",
    desc: "Instantly open dedicated secure rooms upon alert state triggers",
  },
  {
    key: "smsFallback",
    label: "SMS voice layer fallback",
    desc: "Execute telephone backup sequences if chat payloads remain unread",
  },
  {
    key: "offHoursStrict",
    label: "Off-hours strict parameters mode",
    desc: "Automatically halve timeout threshold metrics overnight between 22:00–06:00",
  },
];

const DEFAULT_CONFIG_LABELS = {
  autoEscalateEnabled: "",
  warRoomTriggerEnabled: "",
  channelsAutoCreate: "",
  smsFallback: "",
  offHoursStrict: "",
};

export default function AutoEscalationPanel() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isMatrixEditing, setIsMatrixEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoEscalationRuleRecord | null>(null);

  const { data: rules = [] } = useQuery({ queryKey: RULES_QUERY_KEY, queryFn: fetchAutoEscalationRules });
  const { data: config } = useQuery({ queryKey: CONFIG_QUERY_KEY, queryFn: fetchOnCallConfig });

  const [matrixDraft, setMatrixDraft] = useState<Record<string, number[]>>(DEFAULT_TIMEOUT_MATRIX);

  useEffect(() => {
    if (config?.timeoutMatrix && Object.keys(config.timeoutMatrix).length > 0) {
      setMatrixDraft(config.timeoutMatrix);
    }
  }, [config]);

  const refetchRules = () => queryClient.invalidateQueries({ queryKey: RULES_QUERY_KEY });
  const refetchConfig = () => queryClient.invalidateQueries({ queryKey: CONFIG_QUERY_KEY });

  const toggleConfig = async (key: keyof typeof DEFAULT_CONFIG_LABELS) => {
    if (!config) return;
    try {
      await updateOnCallConfig({ [key]: !config[key] });
      refetchConfig();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update config");
    }
  };

  const handleNewRule = () => {
    setEditingRule(null);
    setIsModalOpen(true);
  };

  const handleEditRule = (rule: AutoEscalationRuleRecord) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const toggleRuleActive = async (rule: AutoEscalationRuleRecord) => {
    try {
      await updateAutoEscalationRule(rule.id, { enabled: !rule.enabled });
      refetchRules();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update rule");
    }
  };

  const deleteRule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this escalation rule?")) return;
    try {
      await deleteAutoEscalationRule(id);
      toast.success("Rule deleted");
      refetchRules();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete rule");
    }
  };

  const moveRule = async (index: number, direction: number) => {
    const nextIdx = index + direction;
    if (nextIdx < 0 || nextIdx >= rules.length) return;
    const reordered = [...rules];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(nextIdx, 0, moved);
    try {
      await Promise.all(reordered.map((r, i) => updateAutoEscalationRule(r.id, { order: i })));
      refetchRules();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reorder rules");
    }
  };

  const handleMatrixCellChange = (sev: string, stepIdx: number, value: string) => {
    const minutes = Number(value);
    setMatrixDraft((prev) => ({
      ...prev,
      [sev]: (prev[sev] ?? []).map((cell, i) => (i === stepIdx ? minutes : cell)),
    }));
  };

  const handleSaveMatrix = async () => {
    try {
      await updateOnCallConfig({ timeoutMatrix: matrixDraft });
      toast.success("Timeout matrix saved");
      setIsMatrixEditing(false);
      refetchConfig();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save timeout matrix");
    }
  };

  const maxSteps = Math.max(1, ...Object.values(matrixDraft).map((cells) => cells.length));

  return (
    <div className="w-full p-6 space-y-6">
      <div className="">
        <Button leftIcon={<ChevronLeft size={16} />} size="sm" variant="outline-dark" onClick={() => router.back()}>
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
          {config?.autoEscalateEnabled ? "Engine Active" : "Engine Paused"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
            <Settings size={15} className="text-zinc-400" /> Global Auto-Escalation
          </h3>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 mb-5">
            Controls for the Scrubbe auto-escalation background runtime worker
          </p>

          <div className="space-y-4">
            {config &&
              CONFIG_FIELDS.map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200">{label}</div>
                    <div className="text-[11px] text-zinc-400 dark:text-zinc-500">{desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(config[key])}
                      onChange={() => toggleConfig(key)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full dark:bg-zinc-800 peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
              ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Timeout Matrix</h3>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 mb-4">
              Per-severity timeout (minutes) before advancing to the next step
            </p>

            <div className="overflow-x-auto rounded-lg border border-zinc-100 dark:border-zinc-900">
              <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-400">
                <thead className="bg-zinc-50 font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800">
                  <tr>
                    <th className="px-3 py-2.5">Severity</th>
                    {Array.from({ length: maxSteps }).map((_, i) => (
                      <th key={i} className="px-3 py-2.5">
                        Step {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {Object.entries(matrixDraft).map(([sev, cells]) => (
                    <tr key={sev} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                      <td className="px-3 py-3 font-medium whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                            SEVERITY_DISPLAY[sev]?.badgeStyle ?? SEVERITY_DISPLAY.P3.badgeStyle
                          }`}
                        >
                          {sev}
                        </span>
                      </td>
                      {Array.from({ length: maxSteps }).map((_, cIdx) => (
                        <td key={cIdx} className="px-3 py-2">
                          {cells[cIdx] === undefined ? (
                            <span className="text-zinc-300 dark:text-zinc-700">—</span>
                          ) : isMatrixEditing ? (
                            <input
                              type="number"
                              min={1}
                              value={cells[cIdx]}
                              onChange={(e) => handleMatrixCellChange(sev, cIdx, e.target.value)}
                              className="w-16 h-7 rounded border border-zinc-200 bg-white px-2 text-center font-mono text-[11px] font-semibold outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                            />
                          ) : (
                            <span className="font-mono text-[11px] font-medium text-zinc-800 dark:text-zinc-200">
                              {cells[cIdx]} min
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
            onClick={() => (isMatrixEditing ? handleSaveMatrix() : setIsMatrixEditing(true))}
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

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Auto-Escalation Conditional Rules
            </h3>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              Layered criteria evaluated linearly on top of the base timeout matrix
            </p>
          </div>
          <Button size="sm" onClick={handleNewRule} leftIcon={<Plus size={13} className="mr-1" />}>
            Add rule
          </Button>
        </div>

        <div className="space-y-2.5">
          {rules.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No auto-escalation rules yet.</p>
          )}
          {rules.map((rule, idx) => (
            <div
              key={rule.id}
              className={`flex items-center gap-4 rounded-xl border p-4 shadow-2xs transition-all ${
                rule.enabled
                  ? "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
                  : "border-zinc-100 bg-zinc-50/50 dark:border-zinc-900 dark:bg-zinc-900/10 opacity-60"
              }`}
            >
              <div className="h-6 w-6 shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-mono text-[11px] font-bold">
                {idx + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed truncate">
                  IF <span className="text-zinc-900 font-bold dark:text-white">{rule.name}</span> context
                  criteria match ({rule.matchType})
                </div>
                <div className="mt-1 text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">
                  THEN{" "}
                  <span className="text-emerald-600 font-bold dark:text-emerald-400">
                    {rule.action.type.toUpperCase()}
                  </span>{" "}
                  execution parameters applied
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => toggleRuleActive(rule)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-zinc-200 rounded-full dark:bg-zinc-800 peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:after:translate-x-full" />
                </label>

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

                <div className="flex gap-0.5">
                  <button
                    onClick={() => handleEditRule(rule)}
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

      <AutoEscalationRuleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={refetchRules}
        rule={editingRule}
      />
    </div>
  );
}
