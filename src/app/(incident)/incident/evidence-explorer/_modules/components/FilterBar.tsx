"use client";
import React, { useState } from "react";

export interface FilterChip { id: string; type: "service" | "env" | "region" | "phase" | "severity"; label: string; value: string }

const ADD_OPTIONS: { val: string; label: string; def: Omit<FilterChip, "id"> }[] = [
  { val: "sev-crit", label: "Severity: Critical", def: { type: "severity", label: "Severity", value: "critical" } },
  { val: "sev-warn", label: "Severity: Warning", def: { type: "severity", label: "Severity", value: "warn" } },
  { val: "env-staging", label: "Environment: staging", def: { type: "env", label: "Environment", value: "staging" } },
  { val: "reg-us", label: "Region: us-east-1", def: { type: "region", label: "Region", value: "us-east-1" } },
  { val: "svc-checkout", label: "Service: checkout-service", def: { type: "service", label: "Service", value: "checkout-service" } },
];

const FilterBar: React.FC<{ filters: FilterChip[]; onChange: (filters: FilterChip[]) => void }> = ({ filters, onChange }) => {
  const [open, setOpen] = useState(false);
  let seq = 0;

  const remove = (id: string) => onChange(filters.filter((f) => f.id !== id));
  const add = (opt: (typeof ADD_OPTIONS)[number]) => {
    const next = filters.filter((f) => f.type !== opt.def.type || opt.def.type === "service");
    onChange([...next, { id: `f-add-${seq++}-${Date.now()}`, ...opt.def }]);
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-2.5 px-5 py-2.5 bg-[#F6F6F3] border-b border-[#E7E6E0] flex-wrap">
      <span className="text-[10.5px] tracking-[.1em] uppercase text-[#8A8A93] font-semibold mr-0.5">Filters</span>
      {filters.map((f) => (
        <span key={f.id} className="inline-flex items-center gap-2 h-7 pl-[11px] pr-1.5 bg-white border border-[#E7E6E0] rounded-full text-[12px]">
          <span className="text-[10.5px] text-[#8A8A93]">{f.label}</span>
          <span className="font-mono font-medium text-[#15151A]">{f.value}</span>
          <button onClick={() => remove(f.id)} className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[#8A8A93] hover:bg-[#F1F0EB] hover:text-[#15151A]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-[11px] h-[11px]"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </span>
      ))}
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 h-7 px-[11px] rounded-full border border-dashed border-[#cfceC6] text-[12px] text-[#52525B] hover:border-[#2540F2] hover:text-[#1B30C4] hover:bg-[#EEF0FF] transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 5v14M5 12h14" /></svg>
          Add Filter
        </button>
        {open && (
          <div className="absolute z-20 top-[calc(100%+6px)] left-0 min-w-[210px] bg-white border border-[#E7E6E0] rounded-[10px] shadow-lg p-[5px]">
            <div className="text-[10px] tracking-wide uppercase text-[#B5B5BC] px-[9px] pt-1.5 pb-1">Add a filter</div>
            {ADD_OPTIONS.map((opt) => (
              <button key={opt.val} onClick={() => add(opt)} className="w-full text-left px-[9px] py-[7px] text-[12.5px] rounded-[6px] hover:bg-[#F6F6F3]">
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
