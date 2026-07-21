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
        <div className="px-4 pt-4 pb-1">
          {/* title + confidence */}
          <div className="flex items-center justify-between gap-2.5 mb-3">
            <span className="font-bold text-[14px] text-[#1E293B]">{s.label}</span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                s.conf === "high" ? "bg-[#FDEEE0] text-[#C2601A]" : "bg-[#FBF1DF] text-[#9a6206]"
              }`}
            >
              {s.conf === "high" ? "High" : "Medium"}
            </span>
          </div>

          {/* signals */}
          <div className="space-y-1 mb-2.5">
            {s.signals.map((sig) => (
              <div key={sig.id} className="flex items-center justify-between text-[11.5px]">
                <span className="text-[#64748B]">{sig.label}</span>
                <span className="font-semibold text-[#1E293B]">
                  {s.findings ? `${sig.value} Findings` : (live[sig.id] ?? sig.value).toLocaleString("en-US")}
                </span>
              </div>
            ))}
          </div>

          {!s.findings && (
            <>
              <div className="flex items-center gap-1 h-[6px] mb-2">
                {s.spark.map((_, i) => (
                  <span key={i} className={`flex-1 h-full rounded-full ${i === s.hot ? "bg-[#E5484D]" : "bg-[#E9E9E9]"}`} />
                ))}
              </div>
              <div className="text-[10.5px] text-[#94A3B8] mb-1">Signal trend · last 15m</div>
            </>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#EDEDED] mt-2.5">
          <span className="text-[11px] text-[#94A3B8]">
            {s.findings ? "3 agents reporting" : `Source confidence: ${s.conf === "high" ? "High" : "Medium"}`}
          </span>
          <button
            type="button"
            onClick={() => onSelect(s.key)}
            className="flex items-center gap-1 text-[11.5px] font-bold text-[#2540F2] hover:text-[#1B30C4] transition-colors"
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
