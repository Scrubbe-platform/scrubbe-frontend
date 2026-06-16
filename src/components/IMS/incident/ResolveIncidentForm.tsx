// components/ResolveIncidentForm.tsx
"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Select from "@/components/ui/select";
import TextArea from "@/components/ui/text-area";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";

// types/resolution.ts

export interface ResolutionCriteriaItem {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
}

export type ResolutionCategoryOption =
  | "Permanent fix deployed"
  | "Rollback to previous version"
  | "Configuration change"
  | "Workaround applied"
  | "Self-recovered"
  | "Could not reproduce"
  | "Duplicate incident";

export interface ResolutionFormState {
  criteria: Record<string, boolean>;
  category: ResolutionCategoryOption;
  rootCause: string;
  summary: string;
  followUpActions: string;
}

const INITIAL_CRITERIA: ResolutionCriteriaItem[] = [
  {
    id: "root-cause",
    title: "Root cause identified and documented",
    description: "The underlying cause is confirmed – not just the symptom.",
    isRequired: false,
  },
  {
    id: "remediation",
    title: "Remediation applied and verified",
    description: "The fix or mitigation is in place and confirmed effective.",
    isRequired: false,
  },
  {
    id: "metrics",
    title: "Service metrics returned to baseline",
    description:
      "Error rate, latency and saturation are back within normal range.",
    isRequired: false,
  },
  {
    id: "stability",
    title: "Stability confirmed by monitoring",
    description:
      "Metrics have held steady through the required observation window.",
    isRequired: false,
  },
  {
    id: "customer-impact",
    title: "No active customer impact",
    description: "Customer-facing impact has fully cleared.",
    isRequired: false,
  },
  {
    id: "stakeholders",
    title: "Stakeholders notified",
    description:
      "On-call, the incident channel and affected owners are informed.",
    isRequired: false,
  },
  {
    id: "follow-up",
    title: "Follow-up actions captured",
    description: "Action items and post-incident tasks are recorded.",
    isRequired: false,
  },
];

const CATEGORY_OPTIONS: { value: ResolutionCategoryOption; label: string }[] = [
  { value: "Permanent fix deployed", label: "Permanent fix deployed" },
  {
    value: "Rollback to previous version",
    label: "Rollback to previous version",
  },
  { value: "Configuration change", label: "Configuration change" },
  { value: "Workaround applied", label: "Workaround applied" },
  { value: "Self-recovered", label: "Self-recovered" },
  { value: "Could not reproduce", label: "Could not reproduce" },
  { value: "Duplicate incident", label: "Duplicate incident" },
];

export default function ResolveIncidentForm({
  onClose,
  incident,
}: {
  onClose: () => void;
  incident: IncidentDetailRecord;
}) {
  const [form, setForm] = useState<ResolutionFormState>({
    criteria: {
      "root-cause": false,
      remediation: false,
      metrics: false,
      stability: false,
      "customer-impact": false,
      stakeholders: false,
      "follow-up": false,
    },
    category: "Permanent fix deployed",
    rootCause: "",
    summary: "",
    followUpActions: "",
  });

  const totalCriteria = INITIAL_CRITERIA.length;
  const completedCriteriaCount = Object.values(form.criteria).filter(
    Boolean,
  ).length;
  const allCriteriaMet = completedCriteriaCount === totalCriteria;

  // Track field requirements for bottom notification string dynamically
  const isRootCauseFilled = form.rootCause.trim().length > 0;
  const isSummaryFilled = form.summary.trim().length > 0;
  const canSubmit = isRootCauseFilled && isSummaryFilled;

  const toggleCriteria = (id: string) => {
    setForm((prev) => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        [id]: !prev.criteria[id],
      },
    }));
  };

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    console.log("Resolving incident payload:", form);
  };

  return (
    <div className="w-full bg-white dark:bg-[#070c19] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* 1. COMPONENT HEADER STRIP */}
      <div className="p-6 border-b border-slate-200 dark:border-white/[0.06] bg-slate-50/70 dark:bg-[#091124]/40">
        <div className="flex items-center gap-2 text-[#00aa7f] dark:text-[#00cc99] text-xs font-mono font-bold tracking-widest uppercase mb-3">
          <Check size={14} strokeWidth={3} />
          <span>Resolve Incident</span>
        </div>
        <h2 className="text-[20px] md:text-[24px] font-bold text-slate-900 dark:text-white tracking-tight mb-2 font-sans">
          Resolve {incident?.ticketId} · {incident?.service}
        </h2>
        <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-[720px]">
          Confirm the resolution criteria and record how this incident was
          resolved. All required criteria must be met before the incident can
          move to Resolved.
        </p>
      </div>

      <form
        onSubmit={handleResolve}
        className="divide-y divide-slate-200 dark:divide-white/[0.06]"
      >
        {/* 2. SECTION: RESOLUTION CRITERIA */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-[11px] font-mono font-bold tracking-[0.15em] text-slate-500 dark:text-slate-400 uppercase">
              Resolution Criteria
            </h3>
            <span className="text-[11px] font-mono font-bold tracking-wider text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#111c35] border border-slate-200 dark:border-white/[0.08] px-2.5 py-1 rounded-full select-none">
              {completedCriteriaCount} of {totalCriteria} met
            </span>
          </div>

          <div className="space-y-3">
            {INITIAL_CRITERIA.map((item) => {
              const isChecked = form.criteria[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleCriteria(item.id)}
                  className={cn(
                    "w-full border rounded-xl p-4 flex items-start gap-4 transition-all cursor-pointer select-none",
                    isChecked
                      ? "bg-emerald-50/40 dark:bg-[#0b162e]/40 border-emerald-500/30 dark:border-[#00cc99]/30 shadow-sm"
                      : "bg-white dark:bg-[#091124]/40 border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/10",
                  )}
                >
                  {/* High Fidelity Custom Checkbox */}
                  <div
                    className={cn(
                      "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all",
                      isChecked
                        ? "bg-[#00aa7f] dark:bg-[#00cc99] border-[#00aa7f] dark:border-[#00cc99] text-white dark:text-black"
                        : "border-slate-400 dark:border-slate-500 bg-transparent hover:border-slate-600 dark:hover:border-slate-400",
                    )}
                  >
                    {isChecked && <Check size={12} strokeWidth={3} />}
                  </div>

                  {/* Context Text Details */}
                  <div className="space-y-1 text-left min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 leading-normal">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. SECTION: RESOLUTION DETAILS */}
        <div className="p-6 md:p-8 space-y-6 bg-slate-50/40 dark:bg-[#081022]/20">
          <h3 className="text-[11px] font-mono font-bold tracking-[0.15em] text-slate-500 dark:text-slate-400 uppercase block">
            Resolution Detail
          </h3>

          {/* Category Select Control Field */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                Resolution Category
              </label>
              <span className="text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded border border-amber-500/20 uppercase">
                Required
              </span>
            </div>
            <Select
              value={form.category}
              options={CATEGORY_OPTIONS}
              onChange={(val) =>
                setForm((p) => ({ ...p, category: val.target.value as any }))
              }
              className="w-full h-[46px] rounded-xl bg-white dark:bg-[#091124] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-200"
            />
          </div>

          {/* Root Cause Input Area */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                Root Cause
              </label>
              <span className="text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded border border-amber-500/20 uppercase">
                Required
              </span>
            </div>
            <TextArea
              value={form.rootCause}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setForm((p) => ({ ...p, rootCause: e.target.value }))
              }
              placeholder="What was the underlying cause of this incident?"
              className="w-full min-h-[90px] rounded-xl bg-white dark:bg-[#091124] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 p-4 text-[14px]"
            />
          </div>

          {/* Resolution Summary Area */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                Resolution Summary
              </label>
              <span className="text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded border border-amber-500/20 uppercase">
                Required
              </span>
            </div>
            <TextArea
              value={form.summary}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setForm((p) => ({ ...p, summary: e.target.value }))
              }
              placeholder="What action resolved the incident, and how was it verified?"
              className="w-full min-h-[90px] rounded-xl bg-white dark:bg-[#091124] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 p-4 text-[14px]"
            />
          </div>

          {/* Follow Up Actions Optional Area */}
          <div className="space-y-2">
            <label className="block text-[11px] font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Follow-Up Actions{" "}
              <span className="text-slate-400 dark:text-slate-500 font-medium lowercase">
                (optional)
              </span>
            </label>
            <TextArea
              value={form.followUpActions}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setForm((p) => ({ ...p, followUpActions: e.target.value }))
              }
              placeholder="Post-incident action items, owners and due dates..."
              className="w-full min-h-[90px] rounded-xl bg-white dark:bg-[#091124] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 p-4 text-[14px]"
            />
          </div>
        </div>

        {/* 4. MODAL STICKY FOOTER ACTION ROW */}
        <div className="p-5 bg-slate-100 dark:bg-[#050914] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Dynamic Helper String Warnings Tracker */}

          {/* Action CTAs */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="h-[38px] px-5 border border-slate-300 dark:border-white/[0.06] bg-white hover:bg-slate-50 dark:bg-transparent text-slate-600 dark:text-slate-300 font-semibold text-xs rounded-lg transition-all active:scale-95 shadow-sm dark:shadow-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "h-[38px] px-5 font-bold text-xs rounded-lg transition-all shadow-sm active:scale-95 border",
                canSubmit
                  ? "bg-[#00aa7f] dark:bg-[#00cc99] border-[#00aa7f] dark:border-[#00cc99] text-white dark:text-black hover:bg-[#008f6a] dark:hover:bg-[#00b386]"
                  : "bg-slate-200/60 dark:bg-white/[0.04] border-slate-200/10 dark:border-white/[0.04] text-slate-400 dark:text-slate-500 cursor-not-allowed",
              )}
            >
              Resolve incident
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
