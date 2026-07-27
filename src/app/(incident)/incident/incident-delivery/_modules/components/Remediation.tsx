"use client";
import React, { useState } from "react";
import { Code, PlayCircle, Zap, PlusSquare, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { REMEDIATION } from "./incidentDelivery.data";

const Remediation: React.FC<{ incidentId?: string }> = ({ incidentId }) => {
  const router = useRouter();
  const [executed, setExecuted] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [ezraStatus, setEzraStatus] = useState<"idle" | "running" | "done">("idle");

  const executeSafeAction = () => {
    setExecuting(true);
    setTimeout(() => {
      setExecuting(false);
      setExecuted(true);
      toast.success("Safe action executed", { description: "checkout-service restarted — verification green (simulated)" });
    }, 700);
  };

  const generateEzra = () => {
    setEzraStatus("running");
    setTimeout(() => {
      setEzraStatus("done");
      toast.success("Ezra analysis refreshed (simulated)");
      setTimeout(() => setEzraStatus("idle"), 2500);
    }, 700);
  };

  const actions = [
    { icon: <Code size={14} />, label: "Review in Code Engine", action: () => router.push(`/incident/code-engine?id=${incidentId}`) },
    {
      icon: executing ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} />,
      label: executing ? "Executing…" : "Execute safe action",
      action: executeSafeAction,
    },
    {
      icon: ezraStatus === "running" ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />,
      label: ezraStatus === "running" ? "Generating…" : ezraStatus === "done" ? "Generated ✓" : "Generate Ezra",
      action: generateEzra,
    },
    { icon: <PlusSquare size={14} />, label: "Create PR", action: () => toast.info("PR created", { description: REMEDIATION.previewId }) },
    { icon: <Zap size={14} />, label: "Merge suggested PR", action: () => toast.info("Merge requested", { description: "Awaiting required gates before merge" }) },
  ];

  const statusChips = [
    { label: "Confidence", value: `${REMEDIATION.confidence}%`, valueClass: "text-emerald-600" },
    { label: "Risk", value: REMEDIATION.risk, valueClass: "text-emerald-600" },
    { label: "Source", value: REMEDIATION.source, valueClass: "text-black font-mono" },
    { label: "Approval", value: REMEDIATION.approval, valueClass: "text-black" },
  ];

  const prNoteMatch = REMEDIATION.prChange.match(/(Aligns with.*)$/);
  const prChangeMain = prNoteMatch ? REMEDIATION.prChange.slice(0, prNoteMatch.index).trim() : REMEDIATION.prChange;
  const prChangeNote = prNoteMatch ? prNoteMatch[1] : null;

  const suggestionCards = [
    { title: "Suggested action", body: REMEDIATION.action, note: null as string | null },
    { title: "Suggested PR change", body: prChangeMain, note: prChangeNote },
    { title: "Suggested CI action", body: REMEDIATION.ciAction, note: null as string | null },
  ];

  const verifyStats = [
    { label: "CI rerun", value: executed ? "PASS" : REMEDIATION.verify.ciRerun, valueClass: "text-blue-600" },
    { label: "Flake rate", value: REMEDIATION.verify.flake, valueClass: "text-emerald-600" },
    { label: "Affected jobs", value: String(REMEDIATION.verify.jobs), valueClass: "text-black" },
  ];

  return (
    <div className="rounded-2xl border border-[#DDDDDD] bg-white dark:bg-zinc-900/40 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-black/40 dark:text-zinc-500 font-mono mb-0.5">
          Remediation
        </p>
        <p className="text-lg font-bold text-black dark:text-zinc-100">
          Suggest, verify, summarize
        </p>
        <p className="text-[13.5px] text-black/50 dark:text-zinc-500 mt-0.5">
          Default is PR-safe. Verification is shown after execution.
        </p>
      </div>

      <div className="px-6 pb-6 space-y-4">
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {actions.map(({ icon, label, action }) => (
            <button
              key={label}
              onClick={action}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#DDDDDD] dark:border-zinc-700 bg-white dark:bg-zinc-800/40 text-[13px] font-medium text-black dark:text-zinc-300 hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-colors"
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Automated remediation panel */}
        <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 p-5 space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-black/40 dark:text-zinc-500 font-mono mb-1">
              Automated remediation
            </p>
            <p className="text-[13.5px] text-black/60 dark:text-zinc-400 leading-relaxed">
              Based on the failure type, Scrubbe proposes the next best actions
              (code patch, PR, CI rerun) and tracks outcomes.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {statusChips.map(({ label, value, valueClass }) => (
              <span
                key={label}
                className="rounded-lg border border-[#DDDDDD] dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-[13px]"
              >
                <span className="text-black/50 dark:text-zinc-500">{label}: </span>
                <span className={`font-bold ${valueClass}`}>{value}</span>
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {suggestionCards.map(({ title, body, note }) => (
              <div
                key={title}
                className="rounded-xl border border-[#DDDDDD] dark:border-zinc-800 bg-white dark:bg-zinc-800/40 p-4 space-y-2"
              >
                <p className="text-[11px] font-semibold uppercase tracking-widest text-black/40 dark:text-zinc-500">
                  {title}
                </p>
                <p className="text-[13px] font-bold text-black dark:text-zinc-200 leading-snug">
                  {body}
                </p>
                {note && (
                  <p className="text-[12px] italic text-black/50 dark:text-zinc-500 leading-relaxed">
                    {note}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Suggestion preview + verification results */}
          <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-3">
            <div className="rounded-xl border border-[#DDDDDD] dark:border-zinc-800 bg-white dark:bg-zinc-800/40 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-black/40 dark:text-zinc-500">
                  Suggestion preview
                </p>
                <span
                  className="text-[10.5px] font-mono px-2 py-0.5 rounded border border-[#DDDDDD] dark:border-zinc-700 text-black/60 dark:text-zinc-400 max-w-[160px] truncate"
                  title={REMEDIATION.previewId}
                >
                  {REMEDIATION.previewId}
                </span>
              </div>
              <pre className="rounded-lg border border-[#DDDDDD] dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 p-3 text-[12px] font-mono text-black/70 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                {REMEDIATION.preview}
              </pre>
            </div>

            <div className="rounded-xl border border-[#DDDDDD] dark:border-zinc-800 bg-white dark:bg-zinc-800/40 p-4 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-black/40 dark:text-zinc-500">
                Verification results
              </p>
              <div className="grid grid-cols-3 gap-2">
                {verifyStats.map(({ label, value, valueClass }) => (
                  <div key={label} className="rounded-lg bg-zinc-50 dark:bg-zinc-900/60 p-2.5">
                    <p className="text-[9.5px] font-semibold uppercase tracking-wider text-black/40 dark:text-zinc-500 mb-1">
                      {label}
                    </p>
                    <p className={`text-[12px] font-bold ${valueClass}`}>{value}</p>
                  </div>
                ))}
              </div>
              <p className="text-[12.5px] text-black/60 dark:text-zinc-400">
                {executed ? "Safe action executed — verification completed green." : REMEDIATION.verifyNote}
              </p>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {[
                  { label: "Executive", value: executed ? REMEDIATION.executiveDone : REMEDIATION.executive },
                  { label: "Analyst", value: executed ? REMEDIATION.analystDone : REMEDIATION.analyst },
                ].map(({ label, value }) => (
                  <div key={label} className="py-2 first:pt-0 last:pb-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-black/40 dark:text-zinc-500 mb-0.5">
                      {label}
                    </p>
                    <p className="text-[12.5px] text-black dark:text-zinc-400">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Remediation;
