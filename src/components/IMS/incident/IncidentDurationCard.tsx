"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { IncidentListItem } from "@/lib/incident/incident.types";

/**
 * IncidentListItem doesn't (yet) carry a few of the fields this card shows —
 * acknowledgedAt, SLA target, SLO attainment, and business-hours state.
 * Those are accepted as optional props with sane defaults below; swap the
 * defaults for real values from your API as soon as they exist.
 */
interface IncidentDurationCardProps {
  incident: IncidentListItem;
  /** ISO timestamp the incident was acknowledged. */
  acknowledgedAt?: string | null;
  /** Overrides the label derived from incident.lifecycleStep / status. */
  currentStageLabel?: string;
  /** SLA target in minutes. Defaults to a priority-based lookup below. */
  slaTargetMinutes?: number;
  /** Rolling SLO attainment, as a percentage. */
  sloPercentage?: number;
  /** Whether the org's business-hours clock is currently running. */
  businessHoursActive?: boolean;
}

// Placeholder SLA policy by priority — replace with the real thing once it's available.
const SLA_TARGET_MINUTES: Record<string, number> = {
  P0: 4 * 60,
  P1: 24 * 60,
  P2: 3 * 24 * 60,
  P3: 7 * 24 * 60,
};

function formatUTC(date: Date) {
  const day = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
  return `${day} • ${time} UTC`;
}

// Shows at most two significant units, dropping zero ones in between
// (22d 0h 37m -> "22d 37m", matching the reference design).
function formatDuration(ms: number) {
  const totalMinutes = Math.floor(Math.max(ms, 0) / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

  return parts.slice(0, 2).join(" ");
}

function formatRelative(ms: number) {
  const seconds = Math.floor(Math.max(ms, 0) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours === 1 ? "" : "s"} ago`;
}

function capitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export default function IncidentDurationCard({
  incident,
  acknowledgedAt = null,
  currentStageLabel,
  slaTargetMinutes,
  sloPercentage = 98.4,
  businessHoursActive = true,
}: IncidentDurationCardProps) {
  const [now, setNow] = useState(() => new Date());

  // Live clock — drives "Current Time", "Elapsed", and "Time in Current Stage".
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Resets to "just now" whenever a fresh `incident` object arrives from the
  // parent (e.g. a react-query refetch), rather than tracking incident.updatedAt
  // directly — that field only changes when the ticket itself changes, not on
  // every poll, so it wouldn't tick the way "Last Updated" does in the design.
  const [lastRefreshedAt, setLastRefreshedAt] = useState(() => new Date());
  useEffect(() => {
    setLastRefreshedAt(new Date());
  }, [incident]);

  const raisedAt = useMemo(
    () => new Date(incident.createdAt),
    [incident.createdAt],
  );
  const updatedAt = useMemo(
    () => new Date(incident.updatedAt),
    [incident.updatedAt],
  );

  const elapsedMs = now.getTime() - raisedAt.getTime();
  const timeToAcknowledgeMs = acknowledgedAt
    ? new Date(acknowledgedAt).getTime() - raisedAt.getTime()
    : null;
  // No dedicated "stage entered at" timestamp on IncidentListItem yet —
  // updatedAt is the closest proxy available today.
  const timeInStageMs = now.getTime() - updatedAt.getTime();
  const lastUpdatedMs = now.getTime() - lastRefreshedAt.getTime();

  const target =
    slaTargetMinutes ??
    SLA_TARGET_MINUTES[incident.priority] ??
    SLA_TARGET_MINUTES.P2;
  const withinTarget = elapsedMs / 60000 <= target;

  const stageLabel =
    currentStageLabel ??
    (incident.lifecycleStep
      ? String(incident.lifecycleStep).replace(/[_-]/g, " ")
      : incident.status);

  return (
    <div className="font-ibm text-zinc-800 divide-y divide-zinc-200">
      <div className="px-4 pt-4 pb-3">
        <h3 className="text-sm font-semibold text-zinc-900">
          Incident Duration
        </h3>
      </div>

      <div className="px-4 py-3.5 space-y-3.5">
        <Row label="Incident Raised" value={formatUTC(raisedAt)} />
        <Row label="Current Time" value={formatUTC(now)} />
        <Row label="Elapsed" value={formatDuration(elapsedMs)} />
      </div>

      <div className="px-4 py-3.5 space-y-3.5">
        {acknowledgedAt ? (
          <>
            <Row
              label="Acknowledged"
              value={formatUTC(new Date(acknowledgedAt))}
            />
            <Row
              label="Time to Acknowledge"
              value={formatDuration(timeToAcknowledgeMs!)}
            />
          </>
        ) : (
          <Row label="Acknowledged" value="Pending" muted />
        )}
      </div>

      <div className="px-4 py-3.5 space-y-3.5">
        <Row label="Current Stage" value={capitalize(stageLabel)} />
        <Row
          label="Time in Current Stage"
          value={formatDuration(timeInStageMs)}
        />
      </div>

      <div className="px-4 py-3.5 space-y-3.5">
        <Row
          label="SLA"
          value={
            <span className="inline-flex items-center gap-1.5">
              {withinTarget ? "Within Target" : "Breached"}
              <span
                className={withinTarget ? "text-[#22a156]" : "text-red-600"}
              >
                {withinTarget ? "✓" : "✗"}
              </span>
            </span>
          }
        />
        <Row label="SLO" value={`${sloPercentage.toFixed(1)}%`} />
      </div>

      <div className="px-4 py-3.5 space-y-3.5 rounded-b-xl">
        <Row
          label="Business Hours"
          value={businessHoursActive ? "Running" : "Paused"}
        />
        <Row label="Last Updated" value={formatRelative(lastUpdatedMs)} />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: ReactNode;
  muted?: boolean;
}) {
  return (
    <div>
      <div className="text-sm font-medium text-zinc-900">{label}</div>
      <div
        className={`text-sm mt-0.5 ${muted ? "text-zinc-400 italic" : "text-zinc-600"}`}
      >
        {value}
      </div>
    </div>
  );
}
