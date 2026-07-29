"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Switch from "@/components/ui/Switch";
import { Card, CardHeader, KVRows } from "./DetailPrimitives";
import { AGENT_SEQUENCE, BASE_TRIGGERS, OPERATIONAL_RULES } from "./incidentTemplates.data";

export default function TriggersAgentsTab() {
  const [triggers, setTriggers] = useState(
    BASE_TRIGGERS.map(([label, on]) => ({ label, on })),
  );

  function toggle(i: number) {
    setTriggers((prev) => {
      const next = prev.map((t, idx) => (idx === i ? { ...t, on: !t.on } : t));
      toast.info(`"${next[i].label}" ${next[i].on ? "enabled" : "disabled"}`);
      return next;
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <Card>
          <CardHeader title="Trigger Conditions" hint={`${triggers.length} configured`} />
          <div className="flex flex-wrap gap-2">
            {triggers.map((t, i) => (
              <button
                key={t.label}
                onClick={() => toggle(i)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] font-medium",
                  t.on
                    ? "border-zinc-200 bg-white text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                    : "border-zinc-100 bg-zinc-50 text-black/40 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-600",
                )}
              >
                <Switch checked={t.on} onChange={() => toggle(i)} />
                {t.label}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Agent Orchestration" hint="Parallel · Critical priority" />
          <div className="flex flex-wrap items-center gap-1">
            {AGENT_SEQUENCE.map((a, i) => (
              <React.Fragment key={a}>
                <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[12.5px] font-medium text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-50 font-mono text-[10.5px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {a}
                </div>
                {i < AGENT_SEQUENCE.length - 1 && (
                  <ChevronRight size={14} className="shrink-0 text-black/25 dark:text-zinc-600" />
                )}
              </React.Fragment>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Operational Rules" />
        <KVRows
          rows={OPERATIONAL_RULES.map(([k, v]) => {
            const label = v === "yes" ? "Yes" : v === "no" ? "No" : v === "forbidden" ? "Forbidden" : v;
            const tone = v === "yes" ? "yes" : v === "no" ? "no" : v === "forbidden" ? "danger" : undefined;
            return [k, label, tone] as [string, string, "yes" | "no" | "danger" | undefined];
          })}
        />
      </Card>
    </div>
  );
}
