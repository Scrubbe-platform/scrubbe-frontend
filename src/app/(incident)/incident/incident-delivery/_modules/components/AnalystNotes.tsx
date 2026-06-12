"use client";
import React, { useState } from "react";
import SideModal from "@/components/ui/SideModal";
import AnalystNote from "./Modal/AnalystNote";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";

interface AnalystNoteItem {
  id: string;
  author: string;
  timestamp: string;
  content: string;
}

interface AnalystNotesProps {
  incident: IncidentDetailRecord;
  notes?: AnalystNoteItem[];
}

const AnalystNotes: React.FC<AnalystNotesProps> = ({ incident, notes = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="space-y-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
              Analyst Notes
            </p>
            <p className="text-[14px] font-semibold text-black dark:text-zinc-100">
              Notes & observations
            </p>
            <p className="text-[12px] text-black dark:text-zinc-500">
              Notes include author + timestamp and become part of the evidence pack.
            </p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 text-[12px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors shrink-0"
          >
            Add note
          </button>
        </div>

        {/* Notes list */}
        <div className="p-4">
          {notes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-500 dark:border-zinc-700 px-5 py-6 text-center">
              <p className="text-[13px] text-black dark:text-zinc-500">
                No analyst notes yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-black dark:text-zinc-400">
                      {note.author}
                    </span>
                    <span className="text-[11px] font-mono text-black dark:text-zinc-600 tabular-nums">
                      {note.timestamp}
                    </span>
                  </div>
                  <p className="text-[13px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <SideModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Analyst Note"
          subTitle="Add note (author + timestamp)"
        >
          <AnalystNote incident={incident} onClose={() => setIsOpen(false)} />
        </SideModal>
      )}
    </>
  );
};

export default AnalystNotes;