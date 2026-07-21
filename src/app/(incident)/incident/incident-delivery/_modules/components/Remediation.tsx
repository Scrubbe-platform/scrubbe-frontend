"use client";
import React, { useState } from "react";
import { Code, PlayCircle, Zap, PlusSquare, ArrowUpRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { REMEDIATION } from "./incidentDelivery.data";

const actionVariant: Record<string, string> = {
  amber: "border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 text-amber-700 dark:text-amber-400",
  red: "border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 text-red-600 dark:text-red-400",
  violet: "border-violet-200 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/5 text-violet-600 dark:text-violet-400",
  emerald: "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",
};

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
    { icon: <Code size={13} />, label: "Review in Code Engine", variant: "amber", action: () => router.push(`/incident/code-engine?id=${incidentId}`) },
    {
      icon: executing ? <Loader2 size={13} className="animate-spin" /> : <PlayCircle size={13} />,
      label: executing ? "Executing…" : "Execute safe action",
      variant: "red",
      action: executeSafeAction,
    },
    {
      icon: ezraStatus === "running" ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />,
      label: ezraStatus === "running" ? "Generating…" : ezraStatus === "done" ? "Generated ✓" : "Generate Ezra",
      variant: ezraStatus === "done" ? "emerald" : "red",
      action: generateEzra,
    },
    { icon: <PlusSquare size={13} />, label: "Create PR", variant: "violet", action: () => toast.info("PR created", { description: REMEDIATION.previewId }) },
    { icon: <Zap size={13} />, label: "Merge suggested PR", variant: "red", action: () => toast.info("Merge requested", { description: "Awaiting required gates before merge" }) },
    { icon: <ArrowUpRight size={13} />, label: "Open Ezra full view", variant: "emerald", action: () => router.push(`/incident/ezra`) },
  ];

  const statusChips = [
    { label: "Confidence", value: `${REMEDIATION.confidence}%` },
    { label: "Risk", value: REMEDIATION.risk },
    { label: "Source", value: REMEDIATION.source },
    { label: "Approval", value: REMEDIATION.approval },
  ];

  return (
    <div className="rounded-xl border border-[#DDDDDD] bg-white dark:bg-zinc-900/40 overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500 mb-0.5">
          Remediation
        </p>
        <p className="text-[14px] font-semibold text-black dark:text-zinc-100">
          Suggest, verify, summarize
        </p>
        <p className="text-[12px] text-black dark:text-zinc-500 mt-0.5">
          Default is PR-safe. Verification is shown after execution.
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* ── Action buttons ── */}
        <div className="flex flex-wrap gap-2">
          {actions.map(({ icon, label, variant, action }) => (
            <button
              key={label}
              onClick={action}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium hover:opacity-80 transition-opacity ${actionVariant[variant]}`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* ── Automated remediation ── */}
        <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500 mb-0.5">
              Automated remediation
            </p>
            <p className="text-[12px] text-black dark:text-zinc-500">
              Based on the failure type, Scrubbe proposes the next best actions
              (code patch, PR, CI rerun) and tracks outcomes.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {statusChips.map(({ label, value }) => (
              <span key={label} className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[11px] font-mono">
                <span className="text-zinc-400 dark:text-zinc-500">{label}:</span>
                <span className="text-black dark:text-zinc-300">{value}</span>
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {[
              { title: "Suggested action", main: REMEDIATION.action, note: 'Aligns with the "Diff provenance" review.' },
              { title: "Suggested PR change", main: REMEDIATION.prChange, note: "Files touched and risk should align with the review." },
              { title: "Suggested CI action", main: REMEDIATION.ciAction, note: "Verification results update automatically when actions run." },
            ].map(({ title, main, note }) => (
              <div key={title} className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 p-3.5 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">{title}</p>
                <p className="text-[12px] font-medium text-black dark:text-zinc-200 leading-snug">{main}</p>
                <p className="text-[11px] text-black dark:text-zinc-500 leading-relaxed">{note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Two-col: suggestion preview + verification ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
                Suggestion preview
              </p>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-zinc-500 dark:border-zinc-700 text-black dark:text-zinc-400 max-w-[170px] truncate" title={REMEDIATION.previewId}>
                {REMEDIATION.previewId}
              </span>
            </div>
            <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 p-3 h-32 overflow-auto">
              <pre className="text-[11px] font-mono text-black dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                {REMEDIATION.preview}
              </pre>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
              Verification results
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "CI rerun", value: executed ? "PASS" : REMEDIATION.verify.ciRerun },
                { label: "Flake rate", value: REMEDIATION.verify.flake },
                { label: "Affected jobs", value: String(REMEDIATION.verify.jobs) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 p-2.5">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-black dark:text-zinc-500 mb-1">{label}</p>
                  <p className="text-[12px] font-mono text-zinc-600 dark:text-zinc-300">{value}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-black dark:text-zinc-500">
              {executed ? "Safe action executed — verification completed green." : REMEDIATION.verifyNote}
            </p>
            <div className="space-y-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
                Ezra summaries
              </p>
              {[
                { label: "Executive", value: executed ? REMEDIATION.executiveDone : REMEDIATION.executive },
                { label: "Analyst", value: executed ? REMEDIATION.analystDone : REMEDIATION.analyst },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-black dark:text-zinc-500 mb-0.5">{label}</p>
                  <p className="text-[12px] text-black dark:text-zinc-400">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Remediation;
