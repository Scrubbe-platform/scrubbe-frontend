"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader } from "./DetailPrimitives";
import { AUDIT_ENTRIES, VERSION_HISTORY } from "./incidentTemplates.data";

export default function VersionsAuditTab() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="Version History" />
        <div className="relative pl-5">
          <div className="absolute bottom-1 left-[3px] top-1 w-px bg-zinc-200 dark:bg-zinc-700" />
          {VERSION_HISTORY.map((v) => (
            <div key={v.version} className="relative pb-5 last:pb-0">
              <span
                className={cn(
                  "absolute -left-5 top-0.5 h-[9px] w-[9px] rounded-full border-2 bg-white dark:bg-zinc-900",
                  v.current ? "border-emerald-600" : "border-zinc-300 dark:border-zinc-600",
                )}
              />
              <div className="font-mono text-[13px] font-bold text-black dark:text-zinc-100">
                {v.version} {v.current && <span className="text-emerald-600 dark:text-emerald-400">· current</span>}
              </div>
              <ul className="mt-1.5 space-y-1">
                {v.changes.map((c) => (
                  <li key={c} className="text-[12.5px] text-black/60 dark:text-zinc-400">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Audit Log" />
        <div>
          {AUDIT_ENTRIES.map(([time, who, what], i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-3 py-2.5 text-[12.5px]",
                i !== AUDIT_ENTRIES.length - 1 && "border-b border-zinc-100 dark:border-zinc-800",
              )}
            >
              <span className="w-16 shrink-0 font-mono text-[11px] text-black/40 dark:text-zinc-500">
                {time}
              </span>
              <span className="shrink-0 font-semibold text-black dark:text-zinc-100">{who}</span>
              <span className="text-black/70 dark:text-zinc-400">{what}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
