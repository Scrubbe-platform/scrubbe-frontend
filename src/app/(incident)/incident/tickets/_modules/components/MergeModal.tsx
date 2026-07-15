"use client";

import React, { useState } from "react";
import { GitMerge, AlertTriangle, Check } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button1";
import { IncidentListItem } from "@/lib/incident/incident.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteIncident } from "@/lib/incident/incident.api";
import { querykeys } from "@/lib/constant";
import toast from "react-hot-toast";
import { priColors } from "./IncidentLibrary";

interface MergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidentIds: string[];
  allData: IncidentListItem[];
}

export default function MergeModal({
  isOpen,
  onClose,
  incidentIds,
  allData,
}: MergeModalProps) {
  const incidents = allData.filter((i) => incidentIds.includes(i.id));
  const [primaryId, setPrimaryId] = useState<string>(incidents[0]?.id ?? "");

  const queryClient = useQueryClient();

  const archiveMutation = useMutation({
    mutationFn: (id: string) => deleteIncident(id),
  });

  const primaryIncident = incidents.find((i) => i.id === primaryId);
  const secondaryIncidents = incidents.filter((i) => i.id !== primaryId);

  const handleMerge = async () => {
    if (!primaryId || secondaryIncidents.length === 0) return;

    try {
      await Promise.all(secondaryIncidents.map((i) => archiveMutation.mutateAsync(i.id)));
      queryClient.invalidateQueries({ queryKey: [querykeys.INCIDENT_TICKET] });
      toast.success(
        `Merged — ${secondaryIncidents.length} incident(s) archived into ${primaryIncident?.ticketId ?? primaryId}`
      );
      onClose();
    } catch {
      toast.error("Merge failed — some incidents could not be archived");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-5 space-y-5 min-w-[480px] max-w-lg">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
            <GitMerge size={16} className="text-amber-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900">Merge Incidents</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Select the primary incident to keep. All others will be archived.
            </p>
          </div>
        </div>

        {/* Incident list */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            Select primary incident
          </p>
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {incidents.map((i) => {
              const isPrimary = i.id === primaryId;
              return (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => setPrimaryId(i.id)}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    isPrimary
                      ? "border-indigo-400 bg-indigo-50/60"
                      : "border-zinc-100 bg-white hover:border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isPrimary ? "border-indigo-600 bg-indigo-600" : "border-zinc-300"
                    }`}
                  >
                    {isPrimary && <Check size={9} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-zinc-700">
                        {i.ticketId}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${priColors[i.severity] ?? "text-zinc-500 bg-zinc-50 border-zinc-100"}`}
                      >
                        {i.severity}
                      </span>
                      {isPrimary && (
                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-600 truncate mt-0.5">{i.title}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Warning */}
        {secondaryIncidents.length > 0 && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-100">
            <AlertTriangle size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-snug">
              <span className="font-semibold">
                {secondaryIncidents.map((i) => i.ticketId).join(", ")}
              </span>{" "}
              will be archived. This action cannot be undone.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline-dark" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleMerge}
            disabled={!primaryId || secondaryIncidents.length === 0 || archiveMutation.isPending}
            className="bg-amber-600 hover:bg-amber-700 border-amber-700"
          >
            {archiveMutation.isPending
              ? "Merging…"
              : `Merge & Archive ${secondaryIncidents.length} incident(s)`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
