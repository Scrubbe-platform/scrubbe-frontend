// components/AddConditionForm.tsx
"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";

// types/condition.ts

export type OperatorOption =
  | "eq"
  | "ne"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "contains"
  | "regex";

export interface ConditionFormState {
  field: string;
  operator: OperatorOption;
  value: string;
  weight: number;
}

interface AddConditionFormProps {
  onAdd?: (condition: ConditionFormState) => void;
  onCancel?: () => void;
}

const OPERATOR_OPTIONS: { value: OperatorOption; label: string }[] = [
  { value: "eq", label: "eq" },
  { value: "ne", label: "ne" },
  { value: "gt", label: "gt" },
  { value: "gte", label: "gte" },
  { value: "lt", label: "lt" },
  { value: "lte", label: "lte" },
  { value: "in", label: "in" },
  { value: "contains", label: "contains" },
  { value: "regex", label: "regex" },
];

export default function AddConditionForm({
  onAdd,
  onCancel,
}: AddConditionFormProps) {
  const [form, setForm] = useState<ConditionFormState>({
    field: "",
    operator: "eq",
    value: "",
    weight: 0.45,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAdd) onAdd(form);
  };

  return (
    <div className="w-full space-y-4 mb-3">
      {/* OUTER CARD CONTAINER */}
      <form
        onSubmit={handleSubmit}
        className="w-full bg-[#f0f4fa]/60 border border-[#d6e2f0] rounded-xl p-5 md:p-6 space-y-6 shadow-sm font-sans"
      >
        {/* FIELDS GRID ROW */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          {/* FIELD WRAPPER */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="block text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase">
              Field
            </label>
            {/* SWAPPED FOR YOUR COMPONENT */}
            <Input
              type="text"
              value={form.field}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setForm((prev: any) => ({ ...prev, field: e.target.value }))
              }
              placeholder="e.g. cpu_usage"
              className="w-full h-[46px] rounded-xl bg-white text-[14px]"
            />
          </div>

          {/* OPERATOR WRAPPER */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase">
              Operator
            </label>
            {/* SWAPPED FOR YOUR COMPONENT */}
            <Select
              value={form.operator}
              options={OPERATOR_OPTIONS}
              onChange={(value) =>
                setForm((prev: any) => ({
                  ...prev,
                  operator: value.target.value,
                }))
              }
              className="w-full h-[46px] rounded-xl bg-white font-mono text-[14px]"
            />
          </div>

          {/* VALUE WRAPPER */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase">
              Value
            </label>
            {/* SWAPPED FOR YOUR COMPONENT */}
            <Input
              type="text"
              value={form.value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setForm((prev: any) => ({ ...prev, value: e.target.value }))
              }
              placeholder='e.g. 80, true, "prod"'
              className="w-full h-[46px] rounded-xl bg-white text-[14px]"
            />
          </div>
        </div>

        {/* INTERACTIVE TRACK SLIDER SECTION */}
        <div className="space-y-3 pt-1">
          <label className="block text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase">
            Weight <span className="text-slate-300/80 px-1">•</span>{" "}
            Contribution To Matchconfidence
          </label>

          <div className="flex items-center gap-6 group">
            <div className="flex-1 relative flex items-center h-4">
              {/* Custom Track Background Coloring */}
              <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-[5px] bg-[#334155] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00cc99]"
                  style={{ width: `${form.weight * 100}%` }}
                />
              </div>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={form.weight}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    weight: parseFloat(e.target.value),
                  }))
                }
                className="w-full h-full appearance-none bg-transparent relative z-10 cursor-pointer focus:outline-none
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00cc99] [&::-webkit-slider-thumb]:shadow-md
                  [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full 
                  [&::-moz-range-thumb]:bg-[#00cc99] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md"
              />
            </div>

            <span className="font-mono text-[14px] font-bold text-[#b45309] tabular-nums min-w-[34px] text-right select-none">
              {form.weight.toFixed(2)}
            </span>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-[38px] px-5 border border-slate-200/80 bg-white text-slate-600 font-medium text-xs rounded-lg hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="h-[38px] px-5 bg-[#00cc99] hover:bg-[#00b386] text-white font-bold text-xs rounded-lg transition-all active:scale-95 shadow-sm flex items-center gap-1.5"
          >
            <Plus size={14} strokeWidth={3} />
            <span>Add condition</span>
          </button>
        </div>
      </form>
    </div>
  );
}
