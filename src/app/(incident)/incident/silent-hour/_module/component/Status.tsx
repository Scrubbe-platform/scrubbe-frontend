import React from "react";
import { QuietRule } from "./QuietRules";

const isWithinWindow = (now: Date, startTime: string, endTime: string) => {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return false;
  const minutesNow = now.getUTCHours() * 60 + now.getUTCMinutes();
  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  if (start === end) return false;
  if (start < end) return minutesNow >= start && minutesNow < end;
  // overnight window, e.g. 21:00 - 08:00
  return minutesNow >= start || minutesNow < end;
};

const minutesUntil = (now: Date, startTime: string) => {
  const [sh, sm] = startTime.split(":").map(Number);
  if ([sh, sm].some((n) => Number.isNaN(n))) return null;
  const minutesNow = now.getUTCHours() * 60 + now.getUTCMinutes();
  const start = sh * 60 + sm;
  return start >= minutesNow ? start - minutesNow : start + 24 * 60 - minutesNow;
};

const formatMinutes = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

const Status = ({ rules }: { rules: QuietRule[] }) => {
  const now = new Date();
  const activeRules = rules.filter((r) => r.isActive);
  const quietRule = activeRules.find((r) =>
    isWithinWindow(now, r.startTime, r.endTime)
  );

  let nextStart: number | null = null;
  for (const rule of activeRules) {
    const mins = minutesUntil(now, rule.startTime);
    if (mins !== null && (nextStart === null || mins < nextStart)) {
      nextStart = mins;
    }
  }

  return (
    <div className="bg-slate-950/80 dark:bg-grayscrubbe-950 p-5 text-slate-300 antialiased border-green-400/40 rounded-lg text-base">
      <p>Status</p>
      <p>{quietRule ? `Quiet active — ${quietRule.name}` : "Quiet inactive"}</p>
      <p className="text-sm">
        {quietRule
          ? `Window: ${quietRule.startTime} - ${quietRule.endTime} (${quietRule.timezone})`
          : nextStart !== null
          ? `Next quiet period starts in ${formatMinutes(nextStart)}`
          : "Next quiet period starts in —"}
      </p>

      <div className="mt-5 space-y-1">
        <p className="font-medium">Summary</p>
        <div className="flex justify-between items-center text-sm">
          <span>Active rules</span>
          <span className="text-IMSCyan">{activeRules.length}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span>Inactive rules</span>
          <span>{rules.length - activeRules.length}</span>
        </div>
      </div>
    </div>
  );
};

export default Status;
