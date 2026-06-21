import React, { useState } from "react";
import { Plus, ArrowRight, Trash2 } from "lucide-react";
import SideModal from "@/components/ui/SideModal";
import QuietRuleForm from "./QuietRuleForm";

export type QuietRule = {
  id?: string;
  name: string;
  startTime: string;
  endTime: string;
  timezone: string;
  daysOfWeek: number[];
  teamScope?: string;
  isActive: boolean;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatDays = (days: number[]) => {
  if (!days || days.length === 0) return "No days set";
  if (days.length === 7) return "Every day";
  const sorted = [...days].sort();
  if (sorted.join(",") === "1,2,3,4,5") return "Weekdays";
  if (sorted.join(",") === "0,6") return "Weekends";
  return sorted.map((d) => DAY_LABELS[d]).join(", ");
};

const QuietRules = ({
  rules,
  isLoading,
  onRuleAdded,
  onRuleRemoved,
}: {
  rules: QuietRule[];
  isLoading?: boolean;
  onRuleAdded?: (rule: QuietRule) => void;
  onRuleRemoved?: (index: number) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-slate-950/80 dark:bg-grayscrubbe-950 p-8 text-slate-300 antialiased border border-green-400/40 rounded-lg">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* HEADER SECTION */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-white tracking-tight">
              Team-specific quiet rules
            </h1>
            <p className="text-sm text-slate-400">
              Custom quiet & suppression per team
            </p>
            <p className="text-sm text-slate-400">
              Override global/rotation rules for individual teams or services
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-base rounded-lg border border-green-500/50 bg-green-500/5 text-green-400 font-semibold hover:bg-green-500/10 transition-colors"
          >
            <Plus size={18} />
            <span>Add Team Rule</span>
          </button>
        </div>

        {/* MAIN CONTAINER */}
        <div className="rounded-2xl border border-white/40 p-6 space-y-4">
          {/* GROUP HEADER */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-semibold text-white">
              Quiet rules
            </h2>
            <ArrowRight size={16} className="text-slate-500" />
          </div>

          {isLoading ? (
            <p className="text-center text-sm text-slate-500 py-6">
              Loading quiet rules…
            </p>
          ) : rules.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-6">
              No quiet rules configured yet. Add a team rule to get started.
            </p>
          ) : (
            rules.map((rule, idx) => (
              <RuleCard
                key={rule.id ?? `pending-${idx}`}
                rule={rule}
                onRemove={() => onRuleRemoved?.(idx)}
              />
            ))
          )}

          {/* FOOTER NOTE */}
          <p className="text-center text-xs text-slate-500 pt-4">
            Team-specific rules override global and rotation defaults when
            conflicts occur.
          </p>
        </div>
      </div>

      {open && (
        <SideModal
          title="Add Team-Specific Quiet Rule"
          isOpen={open}
          onClose={() => setOpen(false)}
        >
          <QuietRuleForm
            onClose={() => setOpen(false)}
            onSave={(rule: QuietRule) => {
              onRuleAdded?.(rule);
              setOpen(false);
            }}
          />
        </SideModal>
      )}
    </div>
  );
};

const RuleCard = ({
  rule,
  onRemove,
}: {
  rule: QuietRule;
  onRemove: () => void;
}) => {
  return (
    <div className="rounded-xl border border-white/40 p-5 hover:border-white/20 transition-all">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold text-slate-200">
          {rule.name || rule.teamScope || "Untitled rule"}
        </h3>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-0.5 rounded-full border text-xs font-medium ${
              rule.isActive
                ? "text-green-400 border-green-400/30 bg-green-400/5"
                : "text-slate-400 border-slate-400/30 bg-slate-400/5"
            }`}
          >
            {rule.isActive ? "Active" : "Inactive"}
          </span>
          <button
            onClick={onRemove}
            className="text-slate-500 hover:text-rose-400 transition-colors"
            aria-label="Remove rule"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="grid grid-cols-3 text-[13px]">
          <span className="text-slate-500">Quiet window</span>
          <span className="text-slate-400 text-center">
            {rule.startTime} - {rule.endTime}
          </span>
          <span className="text-slate-400 text-right">{rule.timezone}</span>
        </div>
        <div className="grid grid-cols-3 text-[13px]">
          <span className="text-slate-500">Days</span>
          <span className="text-slate-400 text-center">
            {formatDays(rule.daysOfWeek)}
          </span>
          <span className="text-slate-400 text-right">
            {rule.teamScope || "Global"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuietRules;
