"use client";
import React, { useState } from "react";
import CButton from "../ui/Cbutton";
import { useCreateWarRoom } from "@/hooks/useWarRoom";

interface CreateWarRoomProps {
  onClose: () => void;
  incidentId?: string;
  priority?: string;
  onSuccess?: (warRoomId: string) => void;
}

const CreateWarRoom = ({ onClose, incidentId, priority, onSuccess }: CreateWarRoomProps) => {
  const [platform, setPlatform] = useState("slack");
  const { createWarRoom, loading, error, data } = useCreateWarRoom();

  const handleCreate = async () => {
    try {
      const result = await createWarRoom({
        incidentId,
        provider: platform === "google-meet" ? "google" : platform,
        priority,
        reason: incidentId ? `War room for incident ${incidentId}` : undefined,
      });
      onSuccess?.(result.warRoomId);
      onClose();
    } catch {
      // error is already captured in the hook state
    }
  };

  if (data) {
    return (
      <div className="space-y-4">
        <p className="font-semibold text-green-400">War Room Created</p>
        <p className="text-base text-slate-300">
          Your war room has been created successfully (ID: {data.warRoomId}).
          State: <span className="font-mono text-green-300">{data.state}</span>
        </p>
        <div className="flex justify-end">
          <CButton onClick={onClose} className="w-fit">Close</CButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="font-semibold">Create a War Room?</p>
      <p className="text-base">
        You&apos;ve marked this incident as Critical. Would you like Scrubbe to
        automatically create a war room for faster coordination?
      </p>
      <p className="text-base">
        Choose where you will want the war room to be created
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        {(["slack", "google-meet", "teams", "zoom"] as const).map((p) => (
          <label key={p} htmlFor={p} className="flex items-center gap-2">
            <input
              id={p}
              checked={platform === p}
              onChange={() => setPlatform(p)}
              type="radio"
            />
            <p className="text-base capitalize">
              {p === "google-meet" ? "Google Meet" : p === "teams" ? "Microsoft Teams" : p.charAt(0).toUpperCase() + p.slice(1)}
            </p>
          </label>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3 justify-end items-center">
        <CButton
          onClick={onClose}
          disabled={loading}
          className="border border-IMSLightGreen bg-transparent text-IMSLightGreen hover:text-white w-fit"
        >
          No, Later
        </CButton>
        <CButton
          onClick={handleCreate}
          disabled={loading}
          className="w-fit"
        >
          {loading ? "Creating…" : "Create War Room"}
        </CButton>
      </div>
    </div>
  );
};

export default CreateWarRoom;
