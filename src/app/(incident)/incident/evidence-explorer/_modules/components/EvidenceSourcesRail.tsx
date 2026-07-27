"use client";
import React from "react";
import { SOURCES, SourceKey } from "./evidenceExplorer.data";

const EvidenceSourcesRail: React.FC<{
  active: SourceKey;
  onSelect: (key: SourceKey) => void;
  live: Record<string, number>;
}> = ({ active, onSelect, live }) => (
  <div className="flex flex-col gap-4">
    {SOURCES.map((s) => (
      <div
        key={s.key}
        className={`rounded-2xl bg-white overflow-hidden border ${active === s.key ? "border-[#2540F2]" : "border-[#E5E5E5]"}`}
      >
        <div className="px-5 pt-5 pb-1">
          {/* title */}
          <div className="mb-4">
            <span className="font-bold text-[16px] text-[#0F172A]">{s.label}</span>
          </div>

          {/* signals */}
          <div className="space-y-2 mb-3">
            {s.signals.map((sig) => (
              <div key={sig.id} className="flex items-center justify-between text-[13.5px]">
                <span className="text-[#64748B]">{sig.label}</span>
                <span className="font-bold text-[#0F172A]">
                  {s.findings ? `${sig.value} Findings` : (live[sig.id] ?? sig.value).toLocaleString("en-US")}
                </span>
              </div>
            ))}
          </div>

          {!s.findings && (
            <>
              <div className="flex items-center gap-1.5 h-[6px] mb-2.5">
                {s.spark.map((_, i) => (
                  <span key={i} className={`flex-1 h-full rounded-full ${i === s.hot ? "bg-[#E5484D]" : "bg-[#E9E9E9]"}`} />
                ))}
              </div>
              <div className="text-[12.5px] text-[#94A3B8] mb-1">Signal trend · last 15m</div>
            </>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#EDEDED] mt-2.5">
          <span className="text-[12.5px] text-[#94A3B8]">
            {s.findings ? "3 agents reporting" : `Source confidence: ${s.conf === "high" ? "High" : "Medium"}`}
          </span>
          <button
            type="button"
            onClick={() => onSelect(s.key)}
            className="flex items-center gap-1 text-[13px] font-bold text-[#16A34A] hover:text-[#128A3E] transition-colors"
          >
            {s.findings ? "View findings" : "View evidence"}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-3.5 h-3.5">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    ))}
  </div>
);

export default EvidenceSourcesRail;
