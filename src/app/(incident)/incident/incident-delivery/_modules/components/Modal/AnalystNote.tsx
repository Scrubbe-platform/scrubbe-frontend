"use client";
import React, { useState } from "react";
import { CheckCircle } from "lucide-react";
import CButton from "@/components/ui/Cbutton";
import TextArea from "@/components/ui/text-area";

interface AnalystNoteProps {
  onSave: (content: string) => void;
  onClose?: () => void;
}

const AnalystNote: React.FC<AnalystNoteProps> = ({ onSave, onClose }) => {
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  const submit = () => {
    const value = note.trim();
    if (!value) return;
    onSave(value);
    setSaved(true);
    setNote("");
    setTimeout(() => {
      setSaved(false);
      onClose?.();
    }, 1200);
  };

  return (
    <div className="dark:text-white text-black space-y-4">
      <div className="border border-neutral-500 rounded-xl p-4 space-y-3">
        <TextArea
          label="Note"
          placeholder="Write what you observed, what you tried and what you will recommend"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={5}
        />
        <p className="text-sm text-zinc-400">Timestamp is added automatically.</p>

        {saved ? (
          <div className="flex items-center gap-2 text-emerald-400 text-[13px] font-medium">
            <CheckCircle size={15} />
            Note saved to Decision Log
          </div>
        ) : (
          <div className="flex justify-end">
            <CButton className="w-fit" onClick={submit} disabled={!note.trim()}>
              Save Note
            </CButton>
          </div>
        )}
      </div>

      <div className="border border-neutral-500 rounded-xl p-4">
        <p className="font-medium mb-2">What happens when you save</p>
        <ul className="list-disc pl-4 text-sm space-y-1">
          <li>Note becomes an immutable human entry in the Decision Log.</li>
          <li>It appears under "Analyst notes".</li>
          <li>It's included in the incident evidence pack export.</li>
        </ul>
      </div>
    </div>
  );
};

export default AnalystNote;
