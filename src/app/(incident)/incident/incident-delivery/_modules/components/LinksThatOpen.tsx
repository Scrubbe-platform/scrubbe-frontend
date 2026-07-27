"use client";
import React from "react";
import { Link2 } from "lucide-react";
import { SIGNALS } from "./incidentDelivery.data";

const capitalize = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

const LinksThatOpen = () => (
  <div className="rounded-2xl border border-[#DDDDDD] bg-white dark:bg-zinc-900/40 overflow-hidden">
    {/* Header */}
    <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-black/40 dark:text-zinc-500 font-mono mb-0.5">
        Signals &amp; Artifacts
      </p>
      <p className="text-lg font-bold text-black dark:text-zinc-100">
        Links that open
      </p>
      <p className="text-[13.5px] text-black/50 dark:text-zinc-500 mt-0.5">
        URLs are clickable for faster investigation.
      </p>
    </div>

    <div className="px-6">
      {/* Artifacts */}
      <div className="py-5 border-b border-zinc-100 dark:border-zinc-800">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-black/40 dark:text-zinc-500 font-mono mb-2">
          Artifacts
        </p>
        <p className="text-[13.5px] text-black/60 dark:text-zinc-400 mb-3 leading-relaxed">
          {SIGNALS.artifactsNote}
        </p>
        <div className="flex flex-col gap-2">
          {SIGNALS.links.map((l) => (
            <ArtifactLink key={l.label} label={l.label} href={l.href} />
          ))}
        </div>
      </div>

      {/* Failing units */}
      <div className="py-5 border-b border-zinc-100 dark:border-zinc-800">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-black/40 dark:text-zinc-500 font-mono mb-3">
          Failing Units
        </p>
        <div className="flex flex-wrap gap-2">
          {SIGNALS.units.map((unit) => (
            <span
              key={unit}
              className="rounded-lg bg-rose-50 dark:bg-rose-500/10 px-3.5 py-2 text-sm font-medium text-rose-600 dark:text-rose-400"
            >
              {capitalize(unit)}
            </span>
          ))}
        </div>
      </div>

      {/* Signal list */}
      <div className="py-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-black/40 dark:text-zinc-500 font-mono mb-3">
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
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors w-fit"
    >
      <Link2 size={14} />
      {label}
    </a>
  );
};

const SignalPill = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-[13px]">
    <span className="text-black/40 dark:text-zinc-500">{label}:</span>
    <span className="font-mono font-bold text-black dark:text-zinc-200">
      {value}
    </span>
  </div>
);

export default LinksThatOpen;
