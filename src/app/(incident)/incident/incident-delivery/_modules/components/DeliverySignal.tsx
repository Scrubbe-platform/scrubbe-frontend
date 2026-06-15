"use client";
import React from "react";
import {
  BeakerIcon,
  HammerIcon,
  GitPullRequestIcon,
  GitMergeIcon,
  RocketIcon,
  SearchIcon,
  RefreshCcw,
  ArrowRight,
  Check,
} from "lucide-react";

const signalVariant: Record<string, string> = {
  amber:
    "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/25 text-amber-700 dark:text-amber-400",
  red: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/25 text-red-600 dark:text-red-400",
  sky: "bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/25 text-sky-600 dark:text-sky-400",
  violet:
    "bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/25 text-violet-600 dark:text-violet-400",
};

const traceSteps = [
  { title: "Event received", sub: "Webhook / pipeline signal ingested" },
  { title: "Incident created/updated", sub: "Correlation + dedup applied" },
  { title: "Signals bound", sub: "Logs, jobs, PR, commit, artifacts" },
  { title: "Playbook selected", sub: "Delivery-incident playbook" },
  { title: "Policy decision", sub: "Auto-activate? Gate? Scope" },
  { title: "Remediation + verification", sub: "Suggest → verify → summarize" },
];

const DeliverySignal = () => (
  <div className="rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 p-6 space-y-6">
    {/* ── Header ── */}
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
          Delivery Signals
        </p>
        <h2 className="text-[16px] font-semibold text-black dark:text-white">
          Incoming delivery signals
        </h2>
        <p className="text-[13px] text-black dark:text-zinc-400 max-w-lg leading-relaxed">
          In production, integrations deliver these automatically. Buttons below
          drive the UI so devs can understand the analyst workflow.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button className="p-1.5 rounded-lg border border-zinc-500 dark:border-zinc-700 text-black hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
          <RefreshCcw size={14} />
        </button>
      </div>
    </div>

    {/* ── Trace ── */}
    <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-5">
      <div className="flex items-start justify-between mb-5 gap-3">
        <div className="space-y-0.5">
          <p className="text-[14px] font-semibold text-black dark:text-zinc-100">
            Trace
          </p>
          <p className="text-[12px] text-black dark:text-zinc-500">
            Stages update from decision log + incident state.
          </p>
        </div>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/8 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
          Incident raised <Check size={11} />
        </span>
      </div>

      {/* Steps */}
      <div className="flex flex-wrap items-center gap-2">
        {traceSteps.map((step, i) => (
          <React.Fragment key={step.title}>
            <TraceStep title={step.title} sub={step.sub} />
            {i < traceSteps.length - 1 && (
              <ArrowRight
                size={14}
                className="text-zinc-300 dark:text-zinc-600 shrink-0"
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  </div>
);

const TraceStep = ({ title, sub }: { title: string; sub: string }) => (
  <div className="w-[180px] rounded-lg border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/40 p-3 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors">
    <p className="text-[12px] font-semibold text-black dark:text-zinc-200 mb-0.5">
      {title}
    </p>
    <p className="text-[11px] text-black dark:text-zinc-500 leading-snug">
      {sub}
    </p>
  </div>
);

export default DeliverySignal;
