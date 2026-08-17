"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { IncidentListItem } from "@/lib/incident/incident.types";

interface IncidentDurationCardProps {
  incident: IncidentListItem;
  /** ISO timestamp the incident was acknowledged. */
  acknowledgedAt?: string | null;
  /** Overrides the label derived from incident.lifecycleStep / status. */
  currentStageLabel?: string;
  /** SLA target in minutes. Defaults to a priority-based lookup. */
  slaTargetMinutes?: number;
  /** Rolling SLO attainment percentage. */
  sloPercentage?: number;
  /** Whether the org's business-hours clock is currently running. */
  businessHoursActive?: boolean;
  /**
   * Server timestamp (ISO string) — used as the reference for "Current Time".
   * Pass this from your API response headers or a dedicated /time endpoint.
   * Falls back to the client clock if not provided.
   */
  serverTime?: string | null;
}

// Placeholder SLA policy by priority
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
  serverTime = null,
}: IncidentDurationCardProps) {
  // ── Server-synced clock ──
  // Compute the offset between the server clock and the client clock once,
  // then apply that offset on every tick so "Current Time" reflects the
  // server's notion of time even if the client clock is wrong.
  const serverOffset = useMemo(() => {
    if (!serverTime) return 0;
    return new Date(serverTime).getTime() - Date.now();
  }, [serverTime]);

  const [now, setNow] = useState(() => new Date(Date.now() + serverOffset));

  useEffect(() => {
    const id = setInterval(
      () => setNow(new Date(Date.now() + serverOffset)),
      1000,
    );
    return () => clearInterval(id);
  }, [serverOffset]);

  // "Last Updated" resets on every fresh incident prop reference
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
    <div className=" font-ibm text-zinc-800 dark:text-zinc-300 p-5 space-y-1.5">
      {/* ── Header ── */}
      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 pb-2">
        Incident Duration
      </h3>

      {/* ── Section 1: Raised / Current / Elapsed ── */}
      <Divider />
      <div className="grid grid-cols-2 gap-2.5 pt-1.5">
        <Cell label="Incident Raised" value={formatUTC(raisedAt)} />
        <Cell label="Current Time" value={formatUTC(now)} />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Cell label="Elapsed" value={formatDuration(elapsedMs)} />
      </div>

      {/* ── Section 2: Acknowledged ── */}
      <Divider />
      <div className="grid grid-cols-2 gap-2.5 pt-1.5">
        {acknowledgedAt ? (
          <>
            <Cell
              label="Acknowledged"
              value={formatUTC(new Date(acknowledgedAt))}
            />
            <Cell
              label="Time to Acknowledge"
              value={formatDuration(timeToAcknowledgeMs!)}
            />
          </>
        ) : (
          <>
            <Cell label="Acknowledged" value="Pending" muted />
            <Cell label="Time to Acknowledge" value="—" muted />
          </>
        )}
      </div>

      {/* ── Section 3: Stage ── */}
      <Divider />
      <div className="grid grid-cols-2 gap-2.5 pt-1.5">
        <Cell label="Current Stage" value={capitalize(stageLabel)} />
        <Cell
          label="Time in Current Stage"
          value={formatDuration(timeInStageMs)}
        />
      </div>

      {/* ── Section 4: SLA / SLO ── */}
      <Divider />
      <div className="grid grid-cols-2 gap-2.5 pt-1.5">
        <Cell
          label="SLA"
          value={
            <span className="inline-flex items-center gap-1.5">
              {withinTarget ? "Within Target" : "Breached"}
              <span
                className={
                  withinTarget
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-500 dark:text-red-400"
                }
              >
                {withinTarget ? "✓" : "✗"}
              </span>
            </span>
          }
        />
        <Cell label="SLO" value={`${sloPercentage.toFixed(1)}%`} />
      </div>

      {/* ── Section 5: Business Hours / Last Updated ── */}
      <Divider />
      <div className="grid grid-cols-2 gap-2.5 pt-1.5">
        <Cell
          label="Business Hours"
          value={businessHoursActive ? "Running" : "Paused"}
        />
        <Cell label="Last Updated" value={formatRelative(lastUpdatedMs)} />
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────

function Cell({
  label,
  value,
  muted,
}: {
  label: string;
  value: ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-base px-4 py-3">
      <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{label}</div>
      <div
        className={`text-sm mt-1 ${
          muted ? "text-zinc-400 dark:text-zinc-500 italic" : "text-zinc-500 dark:text-zinc-400"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Divider() {
  return <hr className="border-zinc-300/50 dark:border-zinc-700/50" />;
}
