"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button1";
import Modal from "@/components/ui/Modal";
import useMember from "@/hooks/useMember";
import {
  EscalationChannel,
  EscalationPolicyRecord,
  EscalationStepRecord,
} from "../types/oncall-type";
import { createEscalationPolicy, updateEscalationPolicy } from "@/lib/escalation/escalation.api";

interface CreateEscalationPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  policy?: EscalationPolicyRecord | null;
}

const SEVERITY_OPTIONS = ["P0", "P1", "P2", "P3", "P4"];
const CHANNEL_OPTIONS: { value: EscalationChannel; label: string }[] = [
  { value: "EMAIL", label: "Email" },
  { value: "SMS", label: "SMS" },
  { value: "SLACK", label: "Slack" },
  { value: "CALL", label: "Phone call" },
];

const blankStep = (order: number): EscalationStepRecord => ({
  order,
  targetType: "USER",
  targetUserId: null,
  targetLabel: "",
  channel: "EMAIL",
  timeoutMinutes: 15,
});

export default function CreateEscalationPolicyModal({
  isOpen,
  onClose,
  onSaved,
  policy,
}: CreateEscalationPolicyModalProps) {
  const { data: members = [] } = useMember();
  const isEditing = Boolean(policy);

  const [policyName, setPolicyName] = useState("");
  const [severities, setSeverities] = useState<string[]>(["P1"]);
  const [autoEscalate, setAutoEscalate] = useState(true);
  const [warRoom, setWarRoom] = useState(false);
  const [steps, setSteps] = useState<EscalationStepRecord[]>([blankStep(0)]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (policy) {
      setPolicyName(policy.name);
      setSeverities(policy.severities.length ? policy.severities : ["P1"]);
      setAutoEscalate(policy.autoEscalate);
      setWarRoom(policy.warRoomOnFinalStep);
      setSteps(
        policy.steps.length
          ? policy.steps.map((s, i) => ({ ...s, order: i }))
          : [blankStep(0)]
      );
    } else {
      setPolicyName("");
      setSeverities(["P1"]);
      setAutoEscalate(true);
      setWarRoom(false);
      setSteps([blankStep(0)]);
    }
  }, [isOpen, policy]);

  const memberOptions = useMemo(
    () => [
      { value: "", label: "Unassigned (role placeholder only)" },
      ...members.map((m) => {
        const name = `${m.firstname ?? ""} ${m.lastname ?? ""}`.trim() || m.email;
        return { value: m.id, label: `${name} (${m.email})` };
      }),
    ],
    [members]
  );

  const toggleSeverity = (sev: string) => {
    setSeverities((prev) => (prev.includes(sev) ? prev.filter((s) => s !== sev) : [...prev, sev]));
  };

  const handleAddStep = () => setSteps((prev) => [...prev, blankStep(prev.length)]);
  const handleRemoveStep = (index: number) =>
    setSteps((prev) => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i })));

  const handleStepChange = (index: number, field: keyof EscalationStepRecord, value: any) => {
    setSteps((prev) => prev.map((step, i) => (i === index ? { ...step, [field]: value } : step)));
  };

  const handleTargetUserChange = (index: number, userId: string) => {
    const member = members.find((m) => m.id === userId);
    const label = member
      ? `${member.firstname ?? ""} ${member.lastname ?? ""}`.trim() || member.email
      : "";
    setSteps((prev) =>
      prev.map((step, i) =>
        i === index ? { ...step, targetUserId: userId || null, targetLabel: label } : step
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyName.trim()) {
      toast.error("Policy name is required");
      return;
    }
    if (severities.length === 0) {
      toast.error("Select at least one severity");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: policyName.trim(),
        severities,
        autoEscalate,
        warRoomOnFinalStep: warRoom,
        steps,
      };
      if (isEditing && policy) {
        await updateEscalationPolicy(policy.id, payload);
        toast.success("Escalation policy updated");
      } else {
        await createEscalationPolicy(payload);
        toast.success("Escalation policy created");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save escalation policy");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        className="w-full overflow-hidden bg-white dark:bg-zinc-950 rounded-lg"
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
              {isEditing ? "Edit Escalation Policy" : "Create Escalation Policy"}
            </h2>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              Define escalation chain rules and timeouts
            </p>
          </div>
        </div>

        <div className="space-y-4 p-6 max-h-[70vh] overflow-y-auto">
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

          <div className="flex flex-col">
            <label className="mb-1.5 text-xs font-bold tracking-wide text-zinc-700 dark:text-zinc-400">
              Severity Trigger
            </label>
            <div className="flex flex-wrap gap-2">
              {SEVERITY_OPTIONS.map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => toggleSeverity(sev)}
                  className={`rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors ${
                    severities.includes(sev)
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-zinc-100 dark:border-zinc-900 my-2" />

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
                  <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {index + 1}
                  </div>

                  <div className="flex-1 space-y-2">
                    <select
                      value={step.targetUserId ?? ""}
                      onChange={(e) => handleTargetUserChange(index, e.target.value)}
                      className="h-8 w-full rounded border border-zinc-200 bg-white px-2 text-[12px] text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                    >
                      {memberOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {!step.targetUserId && (
                      <input
                        type="text"
                        value={step.targetLabel ?? ""}
                        onChange={(e) => handleStepChange(index, "targetLabel", e.target.value)}
                        placeholder="Role label, e.g. VP Engineering (no real recipient until a member is assigned)"
                        className="h-7 w-full rounded border border-zinc-200 bg-white px-2 text-[11px] text-zinc-700 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                      />
                    )}

                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-5 flex items-center gap-1.5">
                        <span className="text-[11px] text-zinc-400 whitespace-nowrap">
                          Timeout:
                        </span>
                        <div className="flex items-center rounded border border-zinc-200 bg-white px-2 dark:border-zinc-800 dark:bg-zinc-900">
                          <input
                            type="number"
                            min="1"
                            value={step.timeoutMinutes}
                            onChange={(e) =>
                              handleStepChange(index, "timeoutMinutes", Number(e.target.value))
                            }
                            className="w-10 h-7 text-center text-xs font-mono text-zinc-900 bg-transparent outline-none dark:text-white"
                          />
                          <span className="text-[10px] text-zinc-400">min</span>
                        </div>
                      </div>

                      <div className="col-span-7">
                        <select
                          value={step.channel}
                          onChange={(e) =>
                            handleStepChange(index, "channel", e.target.value as EscalationChannel)
                          }
                          className="h-8 w-full rounded border border-zinc-200 bg-white px-2 text-[11px] text-zinc-700 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                        >
                          {CHANNEL_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

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

          <div className="space-y-3 pt-1">
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

            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200">
                  War room trigger
                </div>
                <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Auto-create a war room if the final step is exhausted with no acknowledgement
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

        <div className="flex justify-end gap-2 border-t border-zinc-100 p-4 dark:border-zinc-800">
          <Button type="button" variant="outline-dark" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save Policy"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
