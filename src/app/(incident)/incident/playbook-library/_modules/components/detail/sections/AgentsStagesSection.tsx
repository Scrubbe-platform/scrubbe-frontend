import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AGENTS, STAGE_DATA, modById } from "../../../data";
import { AgentDef } from "../../../types";
import SectionShell from "../SectionShell";

interface AgentsStagesSectionProps {
  onOpenAgent: (agent: AgentDef) => void;
}

export default function AgentsStagesSection({
  onOpenAgent,
}: AgentsStagesSectionProps): React.JSX.Element {
  const [openStage, setOpenStage] = useState<number>(1);

  return (
    <>
      <SectionShell
        id="agents"
        eyebrow="Coordinated by the orchestrator"
        title="AI agents"
        sub="Specialist agents this playbook deploys. Every conclusion they reach is attributed in the audit trail."
      >
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))" }}>
          {AGENTS.map((a) => (
            <button
              key={a.name}
              onClick={() => onOpenAgent(a)}
              className="text-left shadow-sm shadow-light rounded-xl px-4 py-3.5 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {a.status}
                </span>
                <span className="font-semibold text-[13.5px]">{a.name}</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed mb-2.5">{a.purpose}</p>
              <div className="flex gap-3.5 text-[11.5px] text-zinc-400">
                <span>
                  Avg runtime <b className="text-zinc-800 font-semibold">{a.runtime}</b>
                </span>
                <span>
                  Confidence <b className="text-zinc-800 font-semibold">{a.conf}</b>
                </span>
              </div>
            </button>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="stages"
        eyebrow="Investigation"
        title="Investigation stages"
        sub="Six stages, each backed by a governed module."
      >
        <div className="border border-zinc-200 rounded-lg overflow-hidden">
          {STAGE_DATA.map((s) => {
            const m = modById(s.mod);
            const open = openStage === s.n;
            return (
              <div key={s.n} className="border-b border-zinc-200 last:border-0">
                <button
                  onClick={() => setOpenStage(open ? -1 : s.n)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 transition-colors"
                >
                  <span className="font-mono text-[10.5px] text-zinc-400 w-14 shrink-0">
                    Stage {s.n}
                  </span>
                  <span className="font-semibold text-[13.5px]">{s.name}</span>
                  {m && (
                    <span className="ml-auto text-[11px] text-zinc-500 bg-zinc-100 rounded-md px-2 py-1">
                      {m.name} · v{m.ver}
                    </span>
                  )}
                  <ChevronDown
                    size={14}
                    className={`text-zinc-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {open && (
                  <div className="px-4 pb-4 pl-[72px] text-sm text-zinc-500">
                    {s.body}
                    <div className="flex gap-1.5 flex-wrap mt-2">
                      {s.chips.map((c) => (
                        <span key={c} className="border border-zinc-200 bg-zinc-50 rounded-full px-2.5 py-1 text-xs text-zinc-700">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionShell>
    </>
  );
}
