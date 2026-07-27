"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChildIncident, RelationshipRecord } from "./data";
import { Pill } from "./sections";
import { statusTone } from "./data";

function ModalTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div>
      <h3 className="text-[16px] font-semibold text-black dark:text-zinc-100">{children}</h3>
      {sub && <p className="mt-0.5 font-mono text-[11px] text-black/40 dark:text-zinc-500">{sub}</p>}
    </div>
  );
}

function Rows({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <div className="mt-4">
      {rows.map(([k, v], i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 border-b border-zinc-100 py-3 text-[13px] last:border-b-0 dark:border-zinc-800"
        >
          <span className="shrink-0 text-black/50 dark:text-zinc-500">{k}</span>
          <span className="text-right font-medium text-black dark:text-zinc-200">{v}</span>
        </div>
      ))}
    </div>
  );
}

export function ChildIncidentModal({
  child,
  parent,
}: {
  child: ChildIncident;
  parent: RelationshipRecord;
}) {
  return (
    <div className="p-4">
      <ModalTitle sub={`${child.id} · child of ${parent.id}`}>{child.title}</ModalTitle>
      <Rows
        rows={[
          [
            "Relationship",
            <span
              key="r"
              className={cn(
                "rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide",
                child.merged
                  ? "border-dashed border-zinc-300 text-black/40 dark:border-zinc-600 dark:text-zinc-500"
                  : "border-zinc-200 text-black/50 dark:border-zinc-700 dark:text-zinc-500",
              )}
            >
              {child.merged ? "merged" : "child"}
            </span>,
          ],
          ["Status", <Pill key="s" label={child.status} tone={statusTone(child.status)} />],
          ["Resolved in", <span key="ri" className="font-mono">{child.resolvedIn}</span>],
          ["Assignment group", child.group],
          [
            "Added to problem",
            child.addedToProblem ? `Yes · ${parent.problemRecord ?? ""}` : "No",
          ],
          ["Knowledge article", child.kb ? child.kb : "None"],
          ["Parent incident", <span key="p" className="font-mono">{parent.id} — {parent.title}</span>],
        ]}
      />
    </div>
  );
}
