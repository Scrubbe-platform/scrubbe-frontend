import React from "react";
import { CAT_ORDER, STEPS, modById, usedBy } from "../../../data";
import { Playbook, StepDef } from "../../../types";
import SectionShell from "../SectionShell";

interface CompositionFlowSectionProps {
  playbook: Playbook;
  onOpenModule: (id: string) => void;
  onOpenStep: (step: StepDef) => void;
}

export default function CompositionFlowSection({
  playbook,
  onOpenModule,
  onOpenStep,
}: CompositionFlowSectionProps): React.JSX.Element {
  return (
    <>
      <SectionShell
        id="composition"
        eyebrow="Modular architecture"
        title="Composition"
        sub="This playbook is assembled from governed, reusable modules. Select a module to see every playbook that shares it."
      >
        <div className="space-y-3">
          {CAT_ORDER.map((cat) => (
            <div key={cat} className="grid gap-3" style={{ gridTemplateColumns: "150px 1fr" }}>
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-500 pt-2 dark:text-zinc-400">
                {cat}
              </span>
              <div className="flex gap-2 flex-wrap">
                {(playbook.modules[cat] ?? []).map((id) => {
                  const m = modById(id);
                  if (!m) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => onOpenModule(id)}
                      className="flex items-center gap-2 border border-zinc-300 rounded-lg px-3 py-2 text-sm font-semibold hover:border-zinc-900 hover:shadow-sm transition-all dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-500"
                    >
                      {m.name}
                      <span className="font-mono text-[10.5px] text-zinc-400 dark:text-zinc-500">v{m.ver}</span>
                      <span className="text-[10.5px] text-zinc-400 dark:text-zinc-500">· shared by {usedBy(m.id).length}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 border-l-[3px] border-emerald-500 bg-emerald-50 rounded-r-lg px-3.5 py-2.5 text-xs text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          Update a module once and every dependent playbook inherits the change through the standard
          approval flow. Nothing propagates unreviewed.
        </div>
      </SectionShell>

      <SectionShell
        id="flow"
        eyebrow="Governed execution"
        title="Execution flow"
        sub="Fourteen governed steps. Diamond nodes are governance gates — execution pauses there until rules pass and approvers act."
      >
        <div className="pl-1.5">
          {STEPS.map((s, i) => (
            <div key={s.n} className="grid gap-3.5" style={{ gridTemplateColumns: "26px 1fr" }}>
              <div className="flex flex-col items-center">
                <span
                  className={`w-3.5 h-3.5 mt-1.5 shrink-0 z-10 ${
                    s.kind === "gate"
                      ? "bg-zinc-900 rotate-45 dark:bg-zinc-100"
                      : s.kind === "terminal"
                        ? "bg-emerald-500 rounded-full"
                        : "bg-white border-2 border-zinc-300 rounded-full dark:bg-zinc-900 dark:border-zinc-700"
                  }`}
                />
                {i < STEPS.length - 1 && <span className="w-px flex-1 min-h-[16px] bg-zinc-200 dark:bg-zinc-800" />}
              </div>
              <div className="pb-4 min-w-0">
                <button
                  onClick={() => onOpenStep(s)}
                  className={`w-full text-left border rounded-lg px-4 py-3 transition-all hover:shadow-sm ${
                    s.kind === "gate"
                      ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900/40"
                      : s.kind === "terminal"
                        ? "border-emerald-400 dark:border-emerald-500/50"
                        : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-[10.5px] text-zinc-400 dark:text-zinc-500">
                      {String(s.n).padStart(2, "0")}
                    </span>
                    <span className="font-semibold text-[13.5px] dark:text-zinc-100">{s.name}</span>
                    {s.kind === "gate" && (
                      <span className="font-mono text-[10px] uppercase tracking-wide bg-zinc-900 text-white rounded px-1.5 py-0.5 dark:bg-zinc-100 dark:text-zinc-900">
                        Governance gate
                      </span>
                    )}
                    {s.kind === "terminal" && (
                      <span className="font-mono text-[10px] uppercase tracking-wide bg-emerald-500 text-white rounded px-1.5 py-0.5">
                        Terminal
                      </span>
                    )}
                    <span className="ml-auto text-[11.5px] text-zinc-500 dark:text-zinc-400">{s.agent}</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 dark:text-zinc-400">{s.desc}</p>
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionShell>
    </>
  );
}
