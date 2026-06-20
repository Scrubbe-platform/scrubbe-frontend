"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogIn, UserCheck } from "lucide-react";
import { fetchActiveEscalations } from "@/lib/escalation/escalation.api";
import { acknowledgeIncident } from "@/lib/incident/incident.api";
import { useWarRooms } from "@/hooks/useWarRoom";
import { EscalationEventType } from "../types/oncall-type";

const ACTIVE_ESCALATIONS_QUERY_KEY = ["active-escalations"];

const formatTimer = (totalSecs: number) => {
  const clamped = Math.max(0, totalSecs);
  const m = String(Math.floor(clamped / 60)).padStart(2, "0");
  const s = String(clamped % 60).padStart(2, "0");
  return `${m}:${s}`;
};

const getDotColor = (type: EscalationEventType) => {
  switch (type) {
    case "STARTED":
      return "bg-emerald-500";
    case "ESCALATED":
      return "bg-amber-500";
    case "WAR_ROOM_TRIGGERED":
      return "bg-red-500";
    case "ACKNOWLEDGED":
      return "bg-blue-500";
    case "EXHAUSTED":
    case "CANCELLED":
      return "bg-zinc-400";
    default:
      return "bg-zinc-400";
  }
};

export default function ActiveEscalationCard() {
  const { data: escalations = [], refetch } = useQuery({
    queryKey: ACTIVE_ESCALATIONS_QUERY_KEY,
    queryFn: fetchActiveEscalations,
    refetchInterval: 15_000,
  });

  const mostUrgent = useMemo(() => {
    if (escalations.length === 0) return null;
    return [...escalations].sort((a, b) => {
      const stepA = a.policy.steps[a.currentStepIndex];
      const stepB = b.policy.steps[b.currentStepIndex];
      const deadlineA = new Date(a.stepStartedAt).getTime() + (stepA?.timeoutMinutes ?? 0) * 60_000;
      const deadlineB = new Date(b.stepStartedAt).getTime() + (stepB?.timeoutMinutes ?? 0) * 60_000;
      return deadlineA - deadlineB;
    })[0];
  }, [escalations]);

  const currentStep = mostUrgent?.policy.steps[mostUrgent.currentStepIndex];
  const deadline = mostUrgent && currentStep
    ? new Date(mostUrgent.stepStartedAt).getTime() + currentStep.timeoutMinutes * 60_000
    : null;

  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!deadline) return;
    const update = () => setSecondsLeft(Math.round((deadline - Date.now()) / 1000));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const { data: warRooms } = useWarRooms(mostUrgent?.ticketId);
  const readyWarRoom = warRooms?.find((w) => w.state === "READY" && w.meetingUrl);

  const [acknowledging, setAcknowledging] = useState(false);

  const handleAcknowledge = async () => {
    if (!mostUrgent) return;
    setAcknowledging(true);
    try {
      await acknowledgeIncident(mostUrgent.ticketId);
      toast.success("Incident acknowledged — escalation stopped");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to acknowledge incident");
    } finally {
      setAcknowledging(false);
    }
  };

  if (!mostUrgent) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        No active escalations right now.
      </div>
    );
  }

  const { ticket } = mostUrgent;
  const durationUnacknowledged = formatTimer(
    Math.round((Date.now() - new Date(mostUrgent.stepStartedAt).getTime()) / 1000)
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Active Escalation — {ticket.ticketId}
            {escalations.length > 1 && (
              <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500">
                +{escalations.length - 1} more active
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            {ticket.summary} · {ticket.severity ?? ticket.priority} · {durationUnacknowledged} unacknowledged
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAcknowledge}
            disabled={acknowledging}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/50 px-3 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors disabled:opacity-50"
          >
            <UserCheck size={14} /> {acknowledging ? "Acknowledging..." : "Acknowledge"}
          </button>
          {readyWarRoom ? (
            <a
              href={readyWarRoom.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-500 px-3 text-xs font-semibold text-white shadow-xs hover:bg-emerald-600 transition-all"
            >
              <LogIn size={14} /> Join War Room
            </a>
          ) : (
            <span
              title="No war room has been triggered for this incident yet"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500"
            >
              <LogIn size={14} /> No War Room
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1 w-full relative pl-6 before:absolute before:left-[7px] before:top-1.5 before:bottom-1.5 before:w-[2px] before:bg-slate-200 dark:before:bg-zinc-800">
          <div className="space-y-4">
            {mostUrgent.events.length === 0 && (
              <p className="text-xs text-slate-400 dark:text-zinc-500">No events recorded yet.</p>
            )}
            {mostUrgent.events.map((event) => (
              <div key={event.id} className="relative group">
                <div
                  className={`absolute -left-[24px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-950 shadow-xs ${getDotColor(event.type)}`}
                />

                <div className="text-xs">
                  <div className="font-semibold text-slate-900 dark:text-zinc-100">{event.message}</div>
                  <div className="mt-0.5 font-mono text-[10px] text-slate-400 dark:text-zinc-500">
                    {new Date(event.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full md:w-[190px] shrink-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
            Auto-Esc Status
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50/50 p-3.5 dark:border-red-950/40 dark:bg-red-950/10">
            <div className="text-[11px] font-bold text-red-800 dark:text-red-400 mb-1.5 uppercase">
              STEP {mostUrgent.currentStepIndex + 1} ACTIVE
            </div>

            <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
              Next escalation
            </div>

            <div className="font-mono text-2xl font-black text-red-600 dark:text-red-500 leading-none my-1 tracking-tight">
              {formatTimer(secondsLeft)}
            </div>

            <div className="text-[11px] font-medium text-slate-600 dark:text-zinc-300 truncate">
              → {mostUrgent.policy.steps[mostUrgent.currentStepIndex + 1]?.targetLabel || "Final step"}
            </div>

            <div className="relative mt-2.5 h-1.5 w-full rounded-full bg-gradient-to-r from-emerald-100 via-emerald-300 via-amber-200 to-red-400 dark:from-emerald-950/40 dark:via-amber-900/40 dark:to-red-900/60">
              <div
                className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border-2 border-white bg-amber-500 shadow-md dark:border-zinc-950"
                style={{
                  left: `${Math.min(
                    100,
                    Math.max(
                      0,
                      currentStep ? 100 - (secondsLeft / (currentStep.timeoutMinutes * 60)) * 100 : 0
                    )
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
