"use client";
import React, { useState } from "react";
import SideModal from "@/components/ui/SideModal";
import AnalystNote from "./Modal/AnalystNote";
import { NOTES } from "./incidentDelivery.data";
import { customAxios } from "@/lib/api/axios";
import { endpoint } from "@/lib/api/endpoint";

interface Note {
  author: string;
  timestamp: string;
  content: string;
}

const AnalystNotes = ({ incidentId }: { incidentId?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>(NOTES);

  const addNote = async (content: string) => {
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} · today`;
    setNotes((prev) => [...prev, { author: "You", timestamp, content }]);
    if (incidentId) {
      customAxios
        .post(endpoint.incident_ticket.send_comment, {
          ticketId: incidentId,
          content,
          type: "NOTE",
        })
        .catch(() => {});
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-[#DDDDDD] bg-white dark:bg-zinc-900/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="space-y-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-black/40 dark:text-zinc-500 font-mono">
              Analyst Notes
            </p>
            <p className="text-lg font-bold text-black dark:text-zinc-100">
              Notes &amp; observations
            </p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="px-3.5 py-1.5 rounded-lg border border-[#DDDDDD] dark:border-zinc-700 bg-white dark:bg-zinc-800/40 text-[13px] font-medium text-black dark:text-zinc-300 hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-colors shrink-0"
          >
            + Add note
          </button>
        </div>

        {/* Notes list */}
        <div className="px-6 py-5">
          {notes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 px-5 py-6 text-center">
              <p className="text-[13.5px] text-black/50 dark:text-zinc-500">
                No analyst notes yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notes.map((note, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-zinc-50 dark:bg-zinc-900/60 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] font-bold text-black dark:text-zinc-100">
                      {note.author}
                    </span>
                    <span className="text-[12.5px] text-black/40 dark:text-zinc-600 tabular-nums">
                      {note.timestamp}
                    </span>
                  </div>
                  <p className="text-[13.5px] text-black/60 dark:text-zinc-300 leading-relaxed">
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
          <AnalystNote onSave={addNote} onClose={() => setIsOpen(false)} />
        </SideModal>
      )}
    </>
  );
};

export default AnalystNotes;
