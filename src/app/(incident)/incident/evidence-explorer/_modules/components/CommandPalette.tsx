"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { SUGGEST } from "./evidenceExplorer.data";

export interface Cmd { grp: string; label: string; sub: string; run: () => void }

const CommandPalette: React.FC<{ open: boolean; onClose: () => void; commands: Cmd[] }> = ({ open, onClose, commands }) => {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? commands.filter((c) => `${c.label} ${c.sub} ${c.grp}`.toLowerCase().includes(s)) : commands;
  }, [q, commands]);

  useEffect(() => setSel(0), [q]);

  if (!open) return null;
  const run = (c?: Cmd) => {
    if (c) { c.run(); onClose(); }
  };

  let lastGrp = "";
  return (
    <div
      className="fixed inset-0 bg-[rgba(20,20,30,0.34)] backdrop-blur-[2px] z-[300] flex items-start justify-center pt-[13vh] px-5"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[600px] bg-white rounded-[14px] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-[#F0EFEA]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} className="w-[17px] h-[17px] opacity-45 shrink-0">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" />
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search actions, sources, time ranges, or ask Ezra…"
            autoComplete="off"
            spellCheck={false}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(filtered.length - 1, s + 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
              else if (e.key === "Enter") { e.preventDefault(); run(filtered[sel]); }
              else if (e.key === "Escape") onClose();
            }}
            className="flex-1 outline-none text-[15px] bg-transparent"
          />
          <span className="text-[10.5px] font-mono text-[#8A8A93] border border-[#E7E6E0] rounded-[5px] px-1.5 py-0.5">esc</span>
        </div>
        <div className="max-h-[48vh] overflow-auto p-1.5">
          {filtered.length === 0 ? (
            <div className="p-7 text-center text-[#8A8A93] text-[13px]">No matching commands</div>
          ) : (
            filtered.map((c, i) => {
              const head = c.grp !== lastGrp ? c.grp : null;
              lastGrp = c.grp;
              return (
                <React.Fragment key={i}>
                  {head && <div className="text-[10px] tracking-wide uppercase text-[#B5B5BC] px-2.5 pt-2.5 pb-1">{head}</div>}
                  <div
                    onClick={() => run(c)}
                    onMouseEnter={() => setSel(i)}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] cursor-pointer ${i === sel ? "bg-[#EEF0FF]" : ""}`}
                  >
                    <span className="flex-1 min-w-0">
                      <b className="font-medium text-[13px] block truncate">{c.label}</b>
                      <span className="block text-[11px] text-[#8A8A93]">{c.sub}</span>
                    </span>
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export const buildAskCommands = (onAsk: (q: string, key: string) => void): Cmd[] =>
  SUGGEST.map(([q, key]) => ({ grp: "Ask Ezra", label: q, sub: "Ask the investigation agent", run: () => onAsk(q, key) }));

export default CommandPalette;
