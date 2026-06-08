"use client";
import React from "react";

// ── Pulse shimmer ─────────────────────────────────────────────────

const Shimmer = ({
  className,
  style,
}: {
  className: string;
  style?: React.CSSProperties;
}) => (
  <div
    style={style}
    className={`animate-pulse bg-zinc-200 dark:bg-zinc-700/60 rounded ${className}`}
  />
);

// ── Skeleton ──────────────────────────────────────────────────────

const IncidentDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 px-6 py-5">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Shimmer className="h-5 w-28 rounded-md" />
          <Shimmer className="h-6 w-24 rounded-full" />
          <Shimmer className="h-6 w-24 rounded-full" />
          <Shimmer className="h-6 w-28 rounded-full" />
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Shimmer className="h-9 w-28 rounded-xl" />
          <Shimmer className="h-9 w-24 rounded-xl" />
        </div>
      </div>

      {/* ── Title ── */}
      <Shimmer className="h-8 w-[380px] max-w-full rounded-lg mb-5" />

      {/* ── Tag chips ── */}
      <div className="flex items-center gap-2 flex-wrap mb-7">
        {[88, 120, 76, 120].map((w, i) => (
          <Shimmer key={i} className="h-7 rounded-lg" style={{ width: w }} />
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-7 border-b border-zinc-100 dark:border-zinc-800 mb-8 pb-0">
        {[72, 100, 105, 130, 120].map((w, i) => (
          <div key={i} className="pb-3 relative">
            <Shimmer className="h-3.5 rounded" style={{ width: w }} />
            {i === 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-300 dark:bg-zinc-600 animate-pulse rounded-full" />
            )}
          </div>
        ))}
      </div>

      {/* ── Incident Lifecycle ── */}
      <div className="mb-10">
        <Shimmer className="h-3 w-36 rounded mb-7" />

        {/* Circles + connectors */}
        <div className="flex items-center mb-3">
          {[1,2,3,4,5,6,7].map((_, i) => (
            <React.Fragment key={i}>
              <Shimmer className="w-12 h-12 rounded-full shrink-0" />
              {i < 6 && (
                <div className="flex-1 h-[2px] bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Labels */}
        <div className="flex items-start justify-between mt-2">
          {[60, 58, 64, 60, 62, 60, 62].map((w, i) => (
            <div key={i} className="flex justify-center" style={{ width: 48 }}>
              <Shimmer className="h-2.5 rounded" style={{ width: w - 12 }} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Detection Signals ── */}
      <div className="mb-10">
        <Shimmer className="h-3 w-40 rounded mb-5" />
        <div className="space-y-3">
          {[
            { label1: 88, label2: 60, title: 160 },
            { label1: 64, label2: 72, title: 200 },
            { label1: 110, label2: 72, title: 176 },
          ].map((row, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border border-zinc-100 dark:border-zinc-800 rounded-xl px-5 py-4"
            >
              {/* Icon box */}
              <Shimmer className="w-10 h-10 rounded-xl shrink-0" />
              {/* Content */}
              <div className="flex-1 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Shimmer className="h-3 rounded" style={{ width: row.label1 }} />
                  <Shimmer className="h-2 w-2 rounded-full" />
                  <Shimmer className="h-3 rounded" style={{ width: row.label2 }} />
                </div>
                <Shimmer className="h-4 rounded" style={{ width: row.title }} />
              </div>
              {/* Timestamp */}
              <Shimmer className="h-3 w-14 rounded shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Scrubbe Intelligence ── */}
      <div>
        <Shimmer className="h-3 w-44 rounded mb-5" />
        <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 px-5 py-5 space-y-3.5">
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-1">
            <Shimmer className="w-4 h-4 rounded" />
            <Shimmer className="h-4 w-52 rounded" />
          </div>
          {/* Content lines */}
          {[280, 240, 300, 260].map((w, i) => (
            <Shimmer key={i} className="h-3 rounded" style={{ width: w }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default IncidentDetailSkeleton;