"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, CheckCircle2, Link } from "lucide-react";
import { toast } from "sonner";
import { HYPOTHESES } from "./incidentDelivery.data";

const riskClass: Record<string, string> = {
  low: "text-emerald-600 dark:text-emerald-400",
  medium: "text-amber-600 dark:text-amber-400",
  high: "text-red-600 dark:text-red-400",
};

const HypothesisLedger: React.FC<{ incidentId?: string }> = ({ incidentId }) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-[#DDDDDD] bg-white dark:bg-zinc-900/40 overflow-hidden">
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="space-y-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
            Root-cause Hypothesis Panel
          </p>
          <p className="text-[14px] font-semibold text-black dark:text-zinc-100">
            Ranked by confidence
          </p>
          <p className="text-[12px] text-black dark:text-zinc-500">
            Highest-confidence hypothesis leads. Each carries its evidence and a recommended action.
          </p>
        </div>
        <button
          onClick={() => setExpanded((x) => !x)}
          className="px-3 py-1.5 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 text-[12px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors shrink-0"
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>

      <div className="p-4 space-y-2.5">
        {HYPOTHESES.map((hyp, i) => {
          const showEvidence = expanded || hyp.top;
          return (
            <div
              key={hyp.id}
              className={`relative rounded-xl border p-3.5 pl-4 transition-colors ${
                hyp.top
                  ? "border-emerald-200 dark:border-emerald-500/25 bg-emerald-50/40 dark:bg-emerald-500/5"
                  : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 hover:border-zinc-200 dark:hover:border-zinc-700"
              }`}
            >
              {hyp.top && <span className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl bg-emerald-500" />}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-black dark:text-zinc-600 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {hyp.top && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[9.5px] font-bold uppercase tracking-wider">
                        <BadgeCheck size={10} /> Lead
                      </span>
                    )}
                    <p className="text-[13px] font-semibold text-black dark:text-zinc-100 leading-snug">{hyp.title}</p>
                  </div>
                  {hyp.why && (
                    <p className="text-[11.5px] text-black dark:text-zinc-400 mt-1">
                      <span className="font-medium text-black dark:text-zinc-300">Why:</span> {hyp.why}
                    </p>
                  )}

                  {showEvidence && hyp.evidence.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
                        Evidence
                      </p>
                      <ul className="space-y-0.5">
                        {hyp.evidence.map((e, ei) => (
                          <li key={ei} className="flex items-start gap-1.5 text-[11.5px] text-black dark:text-zinc-400">
                            <CheckCircle2 size={11} className="text-emerald-500 mt-0.5 shrink-0" />
                            {e}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex-wrap">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
                        Confidence
                      </span>
                      <span className="text-[13px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {hyp.confidence}%
                      </span>
                    </div>
                    {hyp.risk && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
                          Risk
                        </span>
                        <span className={`text-[13px] font-mono font-semibold ${riskClass[hyp.risk.toLowerCase()] ?? "text-black dark:text-zinc-300"}`}>
                          {hyp.risk}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-1.5 ml-auto">
                      <a href={hyp.runUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 rounded-lg border border-zinc-500 dark:border-zinc-700 text-[10px] font-mono text-sky-600 dark:text-sky-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        <Link size={9} /> runUrl
                      </a>
                      <a href={hyp.diffUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 rounded-lg border border-zinc-500 dark:border-zinc-700 text-[10px] font-mono text-sky-600 dark:text-sky-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        <Link size={9} /> diffUrl
                      </a>
                    </div>
                  </div>

                  {hyp.top && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => toast.success("Rollback started (simulated)", { description: "Reverting to last-known-good release" })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-[11.5px] font-medium hover:opacity-85 transition-opacity"
                      >
                        <CheckCircle2 size={13} /> Apply remediation
                      </button>
                      <button
                        onClick={() => router.push(`/incident/evidence-explorer?id=${incidentId}`)}
                        className="px-3 py-1.5 rounded-lg border border-zinc-500 dark:border-zinc-700 text-[11.5px] font-medium text-black dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        Investigate in Explorer
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-mono px-2 py-1 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-zinc-400 shrink-0">
                  {hyp.id}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HypothesisLedger;
