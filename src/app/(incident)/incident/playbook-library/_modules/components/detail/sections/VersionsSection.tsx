import React from "react";
import { VERSIONS } from "../../../data";
import SectionShell from "../SectionShell";

interface VersionsSectionProps {
  onRestore: (v: string) => void;
  onCompare: (v: string) => void;
}

export default function VersionsSection({
  onRestore,
  onCompare,
}: VersionsSectionProps): React.JSX.Element {
  return (
    <SectionShell
      id="versions"
      eyebrow="Immutable history"
      title="Version history"
      sub="Every version is preserved. Restoring creates a new version — history is never rewritten."
    >
      <div className="space-y-0">
        {VERSIONS.map((v, i) => (
          <div key={v.v} className="grid gap-3.5" style={{ gridTemplateColumns: "22px 1fr" }}>
            <div className="flex flex-col items-center">
              <span
                className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                  i === 0 ? "bg-zinc-900" : "bg-white border-2 border-zinc-300"
                }`}
              />
              {i < VERSIONS.length - 1 && <span className="w-px flex-1 min-h-[12px] bg-zinc-200" />}
            </div>
            <div className="pb-4 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono font-semibold text-[13.5px]">{v.v}</span>
                <span className="text-sm text-zinc-700">{v.note}</span>
                <span className="ml-auto flex gap-1.5">
                  {i > 0 ? (
                    <button
                      onClick={() => onRestore(v.v)}
                      className="px-3 py-1.5 text-xs font-semibold border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
                    >
                      Restore
                    </button>
                  ) : (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600">
                      Current
                    </span>
                  )}
                  <button
                    onClick={() => onCompare(v.v)}
                    className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    Compare
                  </button>
                </span>
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">
                {v.by} · {v.when}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
