"use client";

import React, { useState } from "react";
import { Check, Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardHeader } from "./DetailPrimitives";
import { PLAYBOOK_LIST } from "./incidentTemplates.data";

type RunState = "idle" | "running" | "done";

export default function PlaybooksRulesTab() {
  const [status, setStatus] = useState<Record<string, RunState>>({});

  function run(name: string) {
    if (status[name] === "running") return;
    setStatus((s) => ({ ...s, [name]: "running" }));
    setTimeout(() => {
      setStatus((s) => ({ ...s, [name]: "done" }));
      toast.success(`Playbook "${name}" completed in simulation mode — 0 policy violations`);
      setTimeout(() => setStatus((s) => ({ ...s, [name]: "idle" })), 1800);
    }, 900);
  }

  return (
    <Card>
      <CardHeader title="Available Playbooks" hint="10 attached · fallback enabled" />
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {PLAYBOOK_LIST.map((p) => {
          const state = status[p] ?? "idle";
          return (
            <div
              key={p}
              className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3.5 py-3 dark:border-zinc-700"
            >
              <span className="text-[12.5px] font-semibold text-black dark:text-zinc-200">{p}</span>
              <button
                onClick={() => run(p)}
                title="Run"
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-200 text-black/50 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400",
                  state === "done" && "border-emerald-200 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400",
                )}
              >
                {state === "running" ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : state === "done" ? (
                  <Check size={13} />
                ) : (
                  <Play size={12} />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
