// app/incidents/library/components/BulkActionBar.tsx
import React from "react";
import { Files, FileCode, Layers2, Trash2, X } from "lucide-react";

interface BulkActionBarProps {
  selectedIds: Set<string>;
  onClear: () => void;
  onTriggerDoc: (kind: "rca" | "report" | "exec") => void;
  onTriggerCompare: () => void;
}

export default function BulkActionBar({
  selectedIds,
  onClear,
  onTriggerDoc,
  onTriggerCompare,
}: BulkActionBarProps) {
  const count = selectedIds.size;
  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-950 text-white rounded-2xl shadow-xl border border-zinc-800 px-4 py-3 flex items-center gap-4 animate-fadeIn">
      <div className="text-xs font-bold whitespace-nowrap">
        <span className="font-mono bg-zinc-800 px-2 py-0.5 rounded text-indigo-400 font-bold mr-1.5">
          {count}
        </span>
        Selected Items
      </div>

      <div className="h-4 w-px bg-zinc-800" />

      <div className="flex items-center gap-1">
        <button
          disabled={count !== 2}
          onClick={onTriggerCompare}
          className="h-8 px-3 rounded-lg text-xs font-semibold hover:bg-zinc-900 text-zinc-200 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 transition-colors"
        >
          <Layers2 size={13} /> Compare Side-by-Side
        </button>
        <button
          onClick={() => onTriggerDoc("rca")}
          className="h-8 px-3 rounded-lg text-xs font-semibold hover:bg-zinc-900 text-zinc-200 flex items-center gap-1.5 transition-colors"
        >
          <FileCode size={13} /> Compile RCA
        </button>
        <button
          onClick={() => onTriggerDoc("report")}
          className="h-8 px-3 rounded-lg text-xs font-semibold hover:bg-zinc-900 text-zinc-200 flex items-center gap-1.5 transition-colors"
        >
          <Files size={13} /> Incident Report
        </button>
        <button
          onClick={() => alert("Items merged into master mother node.")}
          className="h-8 px-3 rounded-lg text-xs font-semibold text-amber-400 hover:bg-zinc-900 flex items-center gap-1.5 transition-colors"
        >
          Merge Group
        </button>
        <button
          onClick={() => alert("Batch item deletion trace finalized.")}
          className="h-8 px-3 rounded-lg text-xs font-semibold text-red-400 hover:bg-zinc-900 flex items-center gap-1.5 transition-colors"
        >
          <Trash2 size={13} /> Archive Batch
        </button>
      </div>

      <div className="h-4 w-px bg-zinc-800" />

      <button
        onClick={onClear}
        className="p-1 text-zinc-500 hover:text-zinc-200 transition-colors"
      >
        <X size={15} />
      </button>
    </div>
  );
}
