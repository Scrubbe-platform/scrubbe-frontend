"use client";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react";
import CButton from "@/components/ui/Cbutton";
import TextArea from "@/components/ui/text-area";
import { customAxios } from "@/lib/api/axios";
import { endpoint } from "@/lib/api/endpoint";
import { querykeys } from "@/lib/constant";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";

interface AnalystNoteProps {
  incident: IncidentDetailRecord;
  onClose?: () => void;
}

const AnalystNote: React.FC<AnalystNoteProps> = ({ incident, onClose }) => {
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await customAxios.post(endpoint.incident_ticket.send_comment, {
        ticketId: incident.ticketId,
        content,
        isInternal: true,
      });
      return res.data;
    },
    onSuccess: () => {
      setSaved(true);
      setNote("");
      queryClient.invalidateQueries({ queryKey: [querykeys.COMMENTS, incident.id] });
      queryClient.invalidateQueries({ queryKey: [querykeys.INCIDENT_DETAIL, incident.id] });
      setTimeout(() => {
        setSaved(false);
        onClose?.();
      }, 1500);
    },
  });

  return (
    <div className="text-white space-y-4">
      <div className="border border-neutral-500 rounded-xl p-4 space-y-3">
        <TextArea
          label="Note"
          placeholder="Write what you observed, what you tried and what you will recommend"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={5}
        />
        <p className="text-sm text-zinc-400">Timestamp is added automatically.</p>

        {mutation.isError && (
          <p className="text-[12px] text-red-400">Failed to save note. Please try again.</p>
        )}

        {saved ? (
          <div className="flex items-center gap-2 text-emerald-400 text-[13px] font-medium">
            <CheckCircle size={15} />
            Note saved to Decision Log
          </div>
        ) : (
          <div className="flex justify-end">
            <CButton
              className="w-fit"
              onClick={() => { if (note.trim()) mutation.mutate(note.trim()); }}
              disabled={!note.trim() || mutation.isPending}
            >
              {mutation.isPending ? "Saving…" : "Save Note"}
            </CButton>
          </div>
        )}
      </div>

      <div className="border border-neutral-500 rounded-xl p-4">
        <p className="font-medium mb-2">What happens when you save</p>
        <ul className="list-disc pl-4 text-sm space-y-1 text-zinc-300">
          <li>Note becomes an immutable human entry in the Decision Log.</li>
          <li>It appears under "Analyst notes".</li>
          <li>It's included in the incident evidence pack export.</li>
        </ul>
      </div>
    </div>
  );
};

export default AnalystNote;
