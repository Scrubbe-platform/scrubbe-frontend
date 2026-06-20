// app/handovers/ManageSchedulesModal.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button1";
import {
  fetchHandoverSchedules,
  createHandoverSchedule,
  updateHandoverSchedule,
  deleteHandoverSchedule,
  fetchHandoverAutomationRule,
  updateHandoverAutomationRule,
} from "@/lib/handover/handover.api";
import { HandoverAutomationRuleRecord, HandoverScheduleRecord } from "../types/index";

interface ManageSchedulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_RULE: HandoverAutomationRuleRecord = {
  onCommanderChange: true,
  onShiftEnd: true,
  on24hOpen: false,
  autoEzraBrief: true,
};

function ScheduleRow({
  schedule,
  onSaved,
  onDeleted,
}: {
  schedule: HandoverScheduleRecord;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [transferTime, setTransferTime] = useState(schedule.transferTime);
  const [fromLabel, setFromLabel] = useState(schedule.fromLabel);
  const [toLabel, setToLabel] = useState(schedule.toLabel);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateHandoverSchedule(schedule.id, { transferTime, fromLabel, toLabel });
      toast.success("Rotation updated");
      setEditing(false);
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update rotation");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteHandoverSchedule(schedule.id);
      toast.success("Rotation removed");
      onDeleted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove rotation");
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 border-b border-stone-100 py-3 last:border-b-0 dark:border-zinc-800">
        <input
          type="time"
          value={transferTime}
          onChange={(e) => setTransferTime(e.target.value)}
          className="w-[80px] rounded border border-stone-200 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />
        <input
          value={fromLabel}
          onChange={(e) => setFromLabel(e.target.value)}
          className="flex-1 rounded border border-stone-200 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          placeholder="From"
        />
        <span className="text-xs text-stone-400">→</span>
        <input
          value={toLabel}
          onChange={(e) => setToLabel(e.target.value)}
          className="flex-1 rounded border border-stone-200 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          placeholder="To"
        />
        <Button size="sm" onClick={handleSave} disabled={saving}>
          Save
        </Button>
        <button onClick={() => setEditing(false)} className="text-xs text-stone-400 hover:text-stone-600 px-2">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 border-b border-stone-100 py-3 last:border-b-0 dark:border-zinc-800">
      <span className="w-[60px] font-mono text-xs font-medium text-blue-600">{schedule.transferTime}</span>
      <div className="flex-1">
        <div className="text-[13px] font-medium text-stone-900 dark:text-white">
          {schedule.fromLabel} → {schedule.toLabel}
        </div>
        <div className="text-[11px] text-stone-500 dark:text-zinc-400">
          {schedule.scheduleType} · {schedule.isActive ? "Active" : "Inactive"}
        </div>
      </div>
      <Button variant="outline-dark" size="sm" className="h-7 px-2.5 text-xs" onClick={() => setEditing(true)}>
        Edit
      </Button>
      <button onClick={handleDelete} className="text-xs text-red-500 hover:text-red-600 px-1">
        Remove
      </button>
    </div>
  );
}

function AddScheduleRow({ onAdded }: { onAdded: () => void }) {
  const [transferTime, setTransferTime] = useState("06:00");
  const [fromLabel, setFromLabel] = useState("");
  const [toLabel, setToLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!fromLabel.trim() || !toLabel.trim()) {
      toast.error("From and To are required");
      return;
    }
    setSubmitting(true);
    try {
      await createHandoverSchedule({ transferTime, fromLabel: fromLabel.trim(), toLabel: toLabel.trim(), scheduleType: "FOLLOW_THE_SUN" });
      toast.success("Rotation added");
      setFromLabel("");
      setToLabel("");
      onAdded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add rotation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 pt-3">
      <input
        type="time"
        value={transferTime}
        onChange={(e) => setTransferTime(e.target.value)}
        className="w-[80px] rounded border border-stone-200 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
      />
      <input
        value={fromLabel}
        onChange={(e) => setFromLabel(e.target.value)}
        placeholder="From region/team"
        className="flex-1 rounded border border-stone-200 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
      />
      <span className="text-xs text-stone-400">→</span>
      <input
        value={toLabel}
        onChange={(e) => setToLabel(e.target.value)}
        placeholder="To region/team"
        className="flex-1 rounded border border-stone-200 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
      />
      <Button size="sm" onClick={handleAdd} disabled={submitting}>
        + Add
      </Button>
    </div>
  );
}

export default function ManageSchedulesModal({ isOpen, onClose }: ManageSchedulesModalProps) {
  const queryClient = useQueryClient();
  const [rule, setRule] = useState<HandoverAutomationRuleRecord>(DEFAULT_RULE);

  const { data: schedules = [], refetch: refetchSchedules } = useQuery({
    queryKey: ["handover-schedules"],
    queryFn: fetchHandoverSchedules,
    enabled: isOpen,
  });

  const { data: ruleData } = useQuery({
    queryKey: ["handover-automation"],
    queryFn: fetchHandoverAutomationRule,
    enabled: isOpen,
  });

  useEffect(() => {
    if (ruleData) setRule(ruleData);
  }, [ruleData]);

  const toggleRule = async (key: keyof HandoverAutomationRuleRecord) => {
    const next = { ...rule, [key]: !rule[key] };
    setRule(next);
    try {
      await updateHandoverAutomationRule({ [key]: next[key] });
      queryClient.invalidateQueries({ queryKey: ["handover-automation"] });
    } catch (err) {
      setRule(rule);
      toast.error(err instanceof Error ? err.message : "Failed to update automation rule");
    }
  };

  const refreshSchedules = () => {
    refetchSchedules();
    queryClient.invalidateQueries({ queryKey: ["handovers"] });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6 py-4">
        <div className="flex items-center justify-between px-6 pt-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-white">Manage Schedules</h2>
        </div>

        <div className="px-4">
          <h3 className="mb-3 text-[13px] font-semibold text-stone-900 dark:text-white">Automated Handover Rules</h3>
          <div className="flex flex-col gap-2">
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-stone-200 p-3.5 text-[13px] text-stone-800 transition-colors hover:bg-stone-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/50">
              <input
                type="checkbox"
                checked={rule.onCommanderChange}
                onChange={() => toggleRule("onCommanderChange")}
                className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
              />
              Generate handover when Incident Commander changes
            </label>

            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-stone-200 p-3.5 text-[13px] text-stone-800 transition-colors hover:bg-stone-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/50">
              <input
                type="checkbox"
                checked={rule.onShiftEnd}
                onChange={() => toggleRule("onShiftEnd")}
                className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
              />
              Generate handover at shift end
            </label>

            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-stone-200 p-3.5 text-[13px] text-stone-800 transition-colors hover:bg-stone-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/50">
              <input
                type="checkbox"
                checked={rule.on24hOpen}
                onChange={() => toggleRule("on24hOpen")}
                className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
              />
              Generate handover after 24 hours open
            </label>

            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-stone-200 p-3.5 text-[13px] text-stone-800 transition-colors hover:bg-stone-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/50">
              <input
                type="checkbox"
                checked={rule.autoEzraBrief}
                onChange={() => toggleRule("autoEzraBrief")}
                className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
              />
              Auto-generate Ezra brief on transfer
            </label>
          </div>
        </div>

        <div className="px-4">
          <h3 className="mb-3 text-[13px] font-semibold text-stone-900 dark:text-white">Follow-the-Sun Rotations</h3>
          <div className="overflow-hidden rounded-lg border border-stone-200 bg-white px-4 dark:border-zinc-700 dark:bg-zinc-900">
            {schedules.length === 0 ? (
              <p className="py-4 text-center text-xs text-stone-400 dark:text-zinc-500">No rotations configured.</p>
            ) : (
              schedules.map((schedule) => (
                <ScheduleRow key={schedule.id} schedule={schedule} onSaved={refreshSchedules} onDeleted={refreshSchedules} />
              ))
            )}
            <AddScheduleRow onAdded={refreshSchedules} />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-stone-100 pt-4 dark:border-zinc-800">
        <Button onClick={onClose}>Done</Button>
      </div>
    </Modal>
  );
}
