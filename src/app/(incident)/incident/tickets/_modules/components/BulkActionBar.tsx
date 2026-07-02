// app/incidents/library/components/BulkActionBar.tsx
import React from "react";
import { Files, FileCode, Layers2, Trash2, X, GitCompare } from "lucide-react";

interface BulkActionBarProps {
  selectedIds: Set<string>;
  onClear: () => void;
  onTriggerDoc: (kind: "rca" | "report" | "exec") => void;
  onTriggerCompare: () => void;
  handleExportSelected: () => void;
  handleAssign?: () => void;
  handleMerge?: () => void;
  handleArchive?: () => void;
}

export default function BulkActionBar({
  selectedIds,
  onClear,
  onTriggerDoc,
  onTriggerCompare,
  handleExportSelected,
  handleAssign,
  handleMerge,
  handleArchive,
}: BulkActionBarProps) {
  const count = selectedIds.size;
  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#161616] text-white rounded-2xl shadow-xl border border-zinc-800 px-4 py-3 flex items-center gap-4 animate-fadeIn">
      <div className="text-xs whitespace-nowrap">
        <p className=" text-white font-medium">{count}</p>
        <p className="text-zinc-400">Selected</p>
      </div>

      <div className="h-4 w-px bg-zinc-800" />

      <div className="flex items-center gap-1">
        <button
          disabled={count !== 2}
          onClick={onTriggerCompare}
          className="h-8 px-3 rounded-lg text-xs font-medium hover:bg-zinc-900 text-zinc-200 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 transition-colors"
        >
          <GitCompare size={13} /> Compare
        </button>
        <button
          onClick={() => onTriggerDoc("rca")}
          className="h-8 px-3 rounded-lg text-xs font-medium hover:bg-zinc-900 text-zinc-200 flex items-center gap-1.5 transition-colors"
        >
          RCA
        </button>
        <button
          onClick={() => onTriggerDoc("report")}
          className="h-8 px-3 rounded-lg text-xs font-medium hover:bg-zinc-900 text-zinc-200 flex items-center gap-1.5 transition-colors"
        >
          Report
        </button>
        <button
          onClick={() => onTriggerDoc("exec")}
          className="h-8 px-3 rounded-lg text-xs font-medium text-zinc-200 hover:bg-zinc-900 flex items-center gap-1.5 transition-colors"
        >
          Exec Summary
        </button>
        <button
          onClick={handleAssign}
          className="h-8 px-3 rounded-lg text-xs font-medium text-zinc-200 hover:bg-zinc-900 flex items-center gap-1.5 transition-colors"
        >
          Assign
        </button>
        <button
          onClick={handleExportSelected}
          className="h-8 px-3 rounded-lg text-xs font-medium text-zinc-200 hover:bg-zinc-900 flex items-center gap-1.5 transition-colors"
        >
          Export
        </button>
        <button
          onClick={handleMerge}
          className="h-8 px-3 rounded-lg text-xs font-medium text-zinc-200 hover:bg-zinc-900 flex items-center gap-1.5 transition-colors"
        >
          Merge
        </button>
        <button
          onClick={handleArchive}
          className="h-8 px-3 rounded-lg text-xs font-medium text-zinc-200 hover:bg-zinc-900 flex items-center gap-1.5 transition-colors"
        >
          Archive
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
