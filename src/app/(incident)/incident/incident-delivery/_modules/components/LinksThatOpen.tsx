"use client";
import React from "react";
import { Link2, XCircle } from "lucide-react";
import { SIGNALS } from "./incidentDelivery.data";

const LinksThatOpen = () => (
  <div className="rounded-xl border border-[#DDDDDD] bg-white dark:bg-zinc-900/40 overflow-hidden">
    {/* Header */}
    <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500 mb-0.5">
        Signals & Artifacts
      </p>
      <p className="text-[14px] font-semibold text-black dark:text-zinc-100">
        Links that open
      </p>
      <p className="text-[12px] text-black dark:text-zinc-500 mt-0.5">
        URLs are clickable for faster investigation.
      </p>
    </div>

    <div className="p-4 space-y-3">
      {/* Artifacts */}
      <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500 mb-1">
          Artifacts
        </p>
        <p className="text-[11px] text-black dark:text-zinc-500 mb-3">{SIGNALS.artifactsNote}</p>
        <div className="space-y-3">
          {SIGNALS.links.map((l) => (
            <ArtifactLink key={l.label} label={l.label} href={l.href} />
          ))}
        </div>
      </div>

      {/* Failing units */}
      <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500 mb-3">
          Failing Units
        </p>
        <div className="flex flex-col gap-2">
          {SIGNALS.units.map((unit) => (
            <div
              key={unit}
              className="flex items-center gap-2.5 rounded-lg border border-amber-100 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 px-3 py-2 text-[11px] font-mono text-amber-700 dark:text-amber-400 cursor-default"
            >
              <XCircle size={12} className="shrink-0 text-amber-500 dark:text-amber-400" />
              {unit}
            </div>
          ))}
        </div>
      </div>

      {/* Signal list */}
      <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500 mb-3">
          Signal list
        </p>
        <div className="flex flex-wrap gap-2">
          {SIGNALS.kv.map(({ label, value }) => (
            <SignalPill key={label} label={label} value={value} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ── Sub-components ────────────────────────────────────────────────

const ArtifactLink = ({ label, href }: { label: string; href?: string }) => {
  if (!href) return null;
  return (
    <div className="space-y-1">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
      >
        <Link2 size={12} />
        {label}
      </a>
      <p className="font-mono text-[11px] text-black dark:text-zinc-500 truncate">{href}</p>
    </div>
  );
};

const SignalPill = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center gap-1.5 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-[11px] font-mono">
    <span className="text-zinc-400 dark:text-zinc-500">{label}:</span>
    <span className="text-black dark:text-zinc-300">{value}</span>
  </div>
);

export default LinksThatOpen;
