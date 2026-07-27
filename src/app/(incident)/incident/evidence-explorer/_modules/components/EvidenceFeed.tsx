"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import { EVIDENCE, SourceKey, minsAgo, t } from "./evidenceExplorer.data";
import { TAG_CLASS } from "./colors";
import { monoFont } from "./fonts";
import { FilterChip } from "./FilterBar";

const metaVal = (raw: string, live: Record<string, number>) => {
  if (raw === "__errRate__") return `${live.errRate.toLocaleString("en-US")}/min`;
  if (raw === "__latency__") return `${live.latency}ms`;
  if (raw === "__affected__") return live.affected.toLocaleString("en-US");
  if (raw === "__pgConn__") return live.pgConn.toLocaleString("en-US");
  return raw;
};

const EvidenceFeed: React.FC<{
  activeSource: SourceKey;
  windowMinutes: number;
  live: Record<string, number>;
  filters: FilterChip[];
  scopeMinute: number | null;
}> = ({ activeSource, windowMinutes, live, filters, scopeMinute }) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const passesFilters = (e: (typeof EVIDENCE)[number]) => {
    if (scopeMinute != null && Math.floor(t(e.ts) / 60) !== scopeMinute) return false;
    return filters.every((f) => {
      if (f.type === "service") return e.services.includes(f.value);
      if (f.type === "env") return e.env === f.value;
      if (f.type === "region") return e.region === f.value;
      if (f.type === "phase") return e.phase === f.value;
      if (f.type === "severity") return e.sev === f.value;
      return true;
    });
  };
  const items = EVIDENCE.filter(
    (e) => (activeSource === "all" || e.source === activeSource) && minsAgo(e.ts) <= windowMinutes && passesFilters(e),
  ).sort((a, b) => minsAgo(b.ts) - minsAgo(a.ts));

  if (!items.length) {
    return (
      <div className="rounded-[10px] border border-dashed border-[#cfceC6] px-5 py-10 text-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-[34px] h-[34px] mx-auto mb-2.5 text-[#8A8A93] opacity-40">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4-4" />
        </svg>
        <h3 className={`${monoFont.className} text-[14px] text-[#52525B] mb-1`}>No evidence matches these filters</h3>
        <div className="text-[12.5px] text-[#8A8A93]">Widen the time range or remove a filter to see more signals.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((e) => {
        const open = openId === e.id;
        return (
          <article key={e.id} className="rounded-xl border border-[#E5E5E7] bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : e.id)}
              className="flex items-center gap-3 w-full px-5 pt-4 pb-1 text-left"
            >
              <span className="text-[13px] text-[#8A8A93] shrink-0">{e.ts}</span>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-[6px] shrink-0 ${TAG_CLASS["t-neu"]}`}>{e.kind}</span>
              <span className="flex-1" />
              <svg
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                className={`w-[15px] h-[15px] shrink-0 transition-transform text-[#B5B5BC] ${open ? "rotate-90 !text-[#52525B]" : ""}`}
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>

            {/* meta row */}
            <div className="grid gap-y-3 gap-x-4 px-5 pt-3 pb-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}>
              {e.meta.map(([label, value, mono, dir]) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold tracking-wide uppercase text-[#8A8A93]">{label}</span>
                  <span
                    className={`text-[15px] font-bold ${mono ? monoFont.className : ""} ${
                      dir === "up" ? "text-[#B42A30]" : dir === "dn" ? "text-[#0a7a5e]" : "text-[#15151A]"
                    }`}
                  >
                    {metaVal(value, live)}
                  </span>
                </div>
              ))}
            </div>

            {open && (
              <div className="border-t border-[#F0EFEA] bg-[#F6F6F3] px-4 py-[13px] space-y-3">
                <div>
                  <h4 className="text-[10px] tracking-wider uppercase text-[#8A8A93] font-semibold mb-1.5">Raw evidence</h4>
                  <pre className={`${monoFont.className} text-[11px] leading-[1.65] bg-[#15151A] text-[#dfe2ea] rounded-[7px] px-3 py-2.5 whitespace-pre-wrap overflow-auto max-h-[170px]`}>
                    {e.raw}
                  </pre>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <h4 className="text-[10px] tracking-wider uppercase text-[#8A8A93] font-semibold mb-1.5">Supporting signals</h4>
                    <ul className="flex flex-col gap-[5px]">
                      {e.signals.map((s, i) => (
                        <li key={i} className="flex gap-2 text-[12px] items-baseline text-[#15151A]">
                          <span className="w-[5px] h-[5px] rounded-full bg-[#2540F2] mt-1.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[10px] tracking-wider uppercase text-[#8A8A93] font-semibold mb-1.5">Related findings</h4>
                    <ul className="flex flex-col gap-[5px]">
                      {e.findings.map((f, i) => (
                        <li key={i} className="flex gap-2 text-[12px] items-baseline text-[#15151A]">
                          <span className="w-[5px] h-[5px] rounded-full bg-[#E0890B] mt-1.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] tracking-wider uppercase text-[#8A8A93] font-semibold mb-1.5">Related systems</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {e.systems.map((sys) => (
                      <span key={sys} className={`${monoFont.className} text-[11px] bg-white border border-[#E7E6E0] rounded-[6px] px-2 py-[3px]`}>
                        {sys}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-[7px] pt-3 mt-1 border-t border-[#F0EFEA]">
                  <button
                    onClick={() => toast.info("Opening linked case", { description: "CASE-2291 · SI-7A42K91" })}
                    className="flex items-center gap-1.5 h-[29px] px-[11px] rounded-[7px] border border-[#E7E6E0] bg-white text-[11.5px] font-medium text-[#52525B] hover:border-[#2540F2] hover:bg-[#EEF0FF] hover:text-[#1B30C4] transition-colors"
                  >
                    Open in Cases
                  </button>
                  <button
                    onClick={() => toast.success("Detection drafted", { description: "New rule seeded from this evidence" })}
                    className="flex items-center gap-1.5 h-[29px] px-[11px] rounded-[7px] border border-[#E7E6E0] bg-white text-[11.5px] font-medium text-[#52525B] hover:border-[#2540F2] hover:bg-[#EEF0FF] hover:text-[#1B30C4] transition-colors"
                  >
                    Create detection
                  </button>
                  <button
                    onClick={() => toast.info("Playbook staged", { description: "Rollback held at approval gate" })}
                    className="flex items-center gap-1.5 h-[29px] px-[11px] rounded-[7px] border border-[#E7E6E0] bg-white text-[11.5px] font-medium text-[#52525B] hover:border-[#E5484D] hover:bg-[#FDECEC] hover:text-[#B42A30] transition-colors"
                  >
                    Run rollback playbook
                  </button>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};

export default EvidenceFeed;
