import React from "react";
import toast from "react-hot-toast";
import { Check, FileText } from "lucide-react";
import { KNOWLEDGE_OUT, RECOVERY } from "../../../data";
import SectionShell from "../SectionShell";

interface RecoveryKnowledgeSectionProps {
  validated: boolean;
  onRunValidation: () => void;
}

export default function RecoveryKnowledgeSection({
  validated,
  onRunValidation,
}: RecoveryKnowledgeSectionProps): React.JSX.Element {
  return (
    <>
      <SectionShell
        id="recovery"
        eyebrow="Progression gate"
        title="Recovery validation"
        sub="This checklist decides whether the incident may progress automatically. Run it to preview the current signals."
      >
        <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))" }}>
          {RECOVERY.map((c) => (
            <div key={c.name} className="flex items-center gap-3 border border-zinc-200 rounded-lg px-3.5 py-3 dark:border-zinc-800">
              <span className="font-semibold text-[13px] text-zinc-900 dark:text-zinc-100">{c.name}</span>
              {validated ? (
                <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Check size={11} /> {c.state}
                </span>
              ) : (
                <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  Awaiting run
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-3.5 mt-4" style={{ gridTemplateColumns: "1fr auto 1fr" }}>
          <div className={`border rounded-lg px-4 py-3.5 ${validated ? "border-emerald-400 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10" : "border-zinc-200 dark:border-zinc-800"}`}>
            <h5 className="font-bold text-[13px] text-zinc-900 dark:text-zinc-100">All checks pass</h5>
            <p className={`text-xs mt-1 ${validated ? "text-emerald-700 dark:text-emerald-400" : "text-zinc-500 dark:text-zinc-400"}`}>
              Incident moves to Monitoring automatically.
            </p>
          </div>
          <span className="self-center font-mono text-[11px] text-zinc-400 dark:text-zinc-500">OTHERWISE</span>
          <div className="border border-zinc-200 rounded-lg px-4 py-3.5 dark:border-zinc-800">
            <h5 className="font-bold text-[13px] text-zinc-900 dark:text-zinc-100">Any check fails</h5>
            <p className="text-xs text-zinc-500 mt-1 dark:text-zinc-400">Automation pauses and the incident continues investigation.</p>
          </div>
        </div>

        <button
          onClick={() => {
            onRunValidation();
            toast.success("Recovery validation passed — incident would move to Monitoring");
          }}
          className="mt-4 px-4 py-2 text-sm font-semibold border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {validated ? "Re-run validation" : "Run validation"}
        </button>
      </SectionShell>

      <SectionShell
        id="knowledge"
        eyebrow="After execution"
        title="Knowledge generation"
        sub="Generated automatically after every execution and written back to the platform."
      >
        <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(215px,1fr))" }}>
          {KNOWLEDGE_OUT.map((k) => (
            <button
              key={k}
              onClick={() => toast(`${k} preview opens in the knowledge console`)}
              className="flex items-center gap-2.5 border border-zinc-200 rounded-lg px-3.5 py-3 text-sm font-semibold hover:border-zinc-900 transition-colors text-left text-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:hover:border-zinc-500"
            >
              <FileText size={14} className="text-zinc-400 shrink-0 dark:text-zinc-500" />
              {k}
            </button>
          ))}
        </div>
      </SectionShell>
    </>
  );
}
