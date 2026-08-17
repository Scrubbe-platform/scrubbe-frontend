import React from "react";
import { Box } from "lucide-react";
import { CAT_DESC, CAT_ORDER, MODULES, usedBy } from "../data";
import { ModuleDef } from "../types";

interface ModuleLibraryProps {
  onOpenModule: (m: ModuleDef) => void;
}

export default function ModuleLibrary({ onOpenModule }: ModuleLibraryProps): React.JSX.Element {
  return (
    <div>
      <p className="text-sm text-zinc-500 max-w-3xl mb-6 dark:text-zinc-400">
        Playbooks in Scrubbe are composed from governed, reusable modules rather than
        maintained as monolithic documents. Update a module once and every playbook that
        depends on it inherits the change through the standard approval flow.
      </p>
      {CAT_ORDER.map((cat) => (
        <div key={cat} className="mb-7">
          <div className="flex items-baseline gap-3 mb-3">
            <h3 className="font-bold text-[16px] text-zinc-900 dark:text-zinc-100">{cat} modules</h3>
            <span className="text-xs text-zinc-400 dark:text-zinc-600">{CAT_DESC[cat]}</span>
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}>
            {MODULES.filter((m) => m.cat === cat).map((m) => (
              <button
                key={m.id}
                onClick={() => onOpenModule(m)}
                className="text-left shadow-sm shadow-light rounded-xl px-4 py-3.5 bg-white hover:shadow-md transition-shadow dark:bg-zinc-900/40 dark:hover:shadow-none"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Box size={14} className="text-zinc-700 shrink-0 dark:text-zinc-400" />
                  <span className="font-semibold text-[13.5px] text-zinc-900 dark:text-zinc-100">{m.name}</span>
                  <span className="ml-auto font-mono text-[11px] text-zinc-400 dark:text-zinc-600">v{m.ver}</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed mb-2.5 dark:text-zinc-400">{m.desc}</p>
                <div className="flex gap-3 text-[11.5px] text-zinc-400 dark:text-zinc-600">
                  <span>
                    Used by <b className="text-zinc-800 font-semibold dark:text-zinc-200">{usedBy(m.id).length}</b> playbooks
                  </span>
                  <span>
                    Owner <b className="text-zinc-800 font-semibold dark:text-zinc-200">{m.owner}</b>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
