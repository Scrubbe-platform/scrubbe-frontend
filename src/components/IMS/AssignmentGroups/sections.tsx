"use client";

import React from "react";
import { ShieldCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Availability, Group, Tone, availTone, readiness, riskTag } from "./data";

const toneText: Record<Tone, string> = {
  ok: "text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20",
  warn: "text-amber-700 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20",
  major: "text-rose-700 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20",
  accent: "text-sky-700 bg-sky-50 border-sky-100 dark:text-sky-400 dark:bg-sky-500/10 dark:border-sky-500/20",
  neutral: "border-zinc-200 text-black dark:border-zinc-700 dark:text-zinc-400",
};
const toneDot: Record<Tone, string> = { ok: "bg-emerald-500", warn: "bg-amber-500", major: "bg-rose-500", accent: "bg-sky-500", neutral: "bg-zinc-400" };

export function Tag({ label, tone, dot = true }: { label: string; tone: Tone; dot?: boolean }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1 text-[12.5px] font-semibold", toneText[tone])}>
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", toneDot[tone])} />}
      {label}
    </span>
  );
}

export function AvailabilityLabel({ availability }: { availability: Availability }) {
  const tone = availTone(availability);
  return (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] text-black dark:text-zinc-300">
      <span className={cn("h-1.5 w-1.5 rounded-full", toneDot[tone])} />
      {availability}
    </span>
  );
}

export function SectionCard({
  eyebrow,
  note,
  right,
  children,
}: {
  eyebrow: string;
  note?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-zinc-100 py-6 first:pt-0 last:border-b-0 last:pb-0 dark:border-zinc-800">
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">{eyebrow}</span>
        {note && <span className="text-[12px] text-black/40 dark:text-zinc-500">{note}</span>}
        <span className="ml-auto" />
        {right}
      </div>
      {children}
    </div>
  );
}

export function KVGrid({ rows }: { rows: [string, React.ReactNode, boolean?][] }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
      {rows.map(([k, v, wide], i) => (
        <div key={i} className={cn("border-b border-zinc-100 py-3.5 last:border-b-0 dark:border-zinc-800", wide && "sm:col-span-2")}>
          <div className="mb-0.5 text-[13.5px] text-black/55 dark:text-zinc-500">{k}</div>
          <div className="text-[15px] font-semibold text-black dark:text-zinc-200">{v}</div>
        </div>
      ))}
    </div>
  );
}

export function ChipRow({ items, onClick }: { items: string[]; onClick?: (item: string) => void }) {
  if (!items.length) return <p className="text-[12px] text-black dark:text-zinc-500">Not available yet.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <button
          key={it}
          onClick={() => onClick?.(it)}
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-[14px] font-medium text-black transition-colors hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200"
        >
          {it}
        </button>
      ))}
    </div>
  );
}

export function Stars({ n }: { n: number }) {
  return (
    <span className="tracking-[2px] text-emerald-600 dark:text-emerald-400">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i > n ? "text-zinc-200 dark:text-zinc-700" : ""}>
          ★
        </span>
      ))}
    </span>
  );
}

const riskText: Record<Tone, string> = { ok: "text-emerald-600 dark:text-emerald-400", warn: "text-amber-600 dark:text-amber-400", major: "text-rose-600 dark:text-rose-400", accent: "text-sky-600 dark:text-sky-400", neutral: "text-black/50 dark:text-zinc-500" };

export function ReadinessBlock({ group, allGroups }: { group: Group; allGroups: Group[] }) {
  const rd = readiness(group);
  const [rc, rl] = riskTag(rd.risk);
  const item = (label: string, val: string) => (
    <div key={label}>
      <div className="text-[13px] text-black/50 dark:text-zinc-500">{label}</div>
      <div className="mt-1 text-[15px] font-bold text-black dark:text-zinc-100">{val}</div>
    </div>
  );
  const ezOn = group.ezra?.enabled;
  const gaps: string[] = [];
  if (!rd.ic) gaps.push("no Incident Commander available");
  if (!rd.oncall) gaps.push("no on-call coverage");
  if (!rd.availOk) gaps.push(`only ${rd.available}/${rd.total} members available`);
  if (!rd.skills) gaps.push("expertise gaps");
  const alts = allGroups.filter((o) => o.id !== group.id && o.status === "Active" && readiness(o).risk === "low" && readiness(o).ic).map((o) => o.name).slice(0, 2);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-[20px] font-bold text-black dark:text-zinc-100">Operational readiness</h4>
        <span className={cn("flex items-center gap-2 text-[13px] font-semibold", riskText[rc])}>
          <span className={cn("h-2 w-2 rounded-full", toneDot[rc])} />
          {rl} risk
        </span>
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-3">
        {item("Members available", `${rd.available} / ${rd.total}`)}
        {item("Current on-call", rd.oncall ? "Covered" : "Gap")}
        {item("Required skills", rd.skills ? "Satisfied" : "Gaps")}
        {item("Incident Commander", rd.ic ? "Available" : "Unavailable")}
        {item("Major incident coverage", rd.majorReady ? "Ready" : "At risk")}
        {item("Deployment ownership", rd.deploy ? "Healthy" : "None")}
        {group.ezra && item("Ezra · service identity", ezOn ? `Assignable${group.ezra.assigned ? ` · ${group.ezra.assigned} assigned` : ""}` : "Paused")}
      </div>
      <div className="mt-6 flex items-start gap-3 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900/60">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-900 text-[13px] font-semibold text-white dark:bg-zinc-700">E</span>
        {rd.risk !== "low" ? (
          <p className="text-[13.5px] font-medium text-black/80 dark:text-zinc-200">
            <b className="font-bold">Ezra:</b> {group.name} has {gaps.join(", ")}.{" "}
            {alts.length ? (
              <>
                For a major incident right now, route to <b className="font-bold">{alts.join("</b> or <b>")}</b>.
              </>
            ) : (
              "Escalate to a manager to restore coverage."
            )}
          </p>
        ) : (
          <p className="text-[13.5px] font-medium text-black/80 dark:text-zinc-200">
            <b className="font-bold">Ezra:</b> {group.name} is ready to take a major incident — coverage, on-call and expertise all check out.
          </p>
        )}
      </div>
    </div>
  );
}

export function MembersTable({
  group,
  isManager,
  onUserClick,
  onEzraClick,
  onRemove,
}: {
  group: Group;
  isManager: boolean;
  onUserClick: (idx: number) => void;
  onEzraClick: () => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-700">
            {["Name", "Role", "Availability", "On-call", "Incidents", ""].map((h) => (
              <th key={h} className="px-0 pb-2 pr-3 text-left text-[10px] font-semibold uppercase tracking-wide text-black dark:text-zinc-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {group.members.map((m, i) => (
            <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-2.5 pr-3">
                <button onClick={() => onUserClick(i)} className="text-left font-medium text-black hover:text-emerald-600 hover:underline dark:text-zinc-100 dark:hover:text-emerald-400">
                  {m.name}
                </button>
              </td>
              <td className="py-2.5 pr-3 text-black dark:text-zinc-300">{m.role}</td>
              <td className="py-2.5 pr-3">
                <AvailabilityLabel availability={m.availability} />
              </td>
              <td className={cn("py-2.5 pr-3", m.oncall ? "font-medium text-emerald-600 dark:text-emerald-400" : "text-black dark:text-zinc-500")}>{m.oncall ? "On-call" : "---"}</td>
              <td className="py-2.5 pr-3 text-black dark:text-zinc-300">{m.incidents}</td>
              <td className="py-2.5 text-right">
                {isManager && (
                  <button onClick={() => onRemove(i)} title="Remove member" className="rounded-md px-1.5 py-0.5 text-black hover:bg-rose-50 hover:text-rose-600 dark:text-zinc-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400">
                    <X size={14} />
                  </button>
                )}
              </td>
            </tr>
          ))}
          {group.ezra?.enabled && (
            <tr className="border-b border-zinc-100 bg-emerald-50/60 dark:border-zinc-800 dark:bg-emerald-500/5">
              <td className="border-l-2 border-l-emerald-500 py-2.5 pl-2 pr-3">
                <span className="inline-flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-[11px] font-semibold text-white">E</span>
                  <button onClick={onEzraClick} className="font-medium text-black hover:text-emerald-600 hover:underline dark:text-zinc-100 dark:hover:text-emerald-400">
                    Ezra
                  </button>
                  <span className="whitespace-nowrap rounded-md border border-emerald-200 px-1.5 py-0.5 font-mono text-[9px] uppercase text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-400">AI · Service identity</span>
                </span>
              </td>
              <td className="py-2.5 pr-3 text-black dark:text-zinc-300">Governed response agent</td>
              <td className="py-2.5 pr-3">
                <span className="inline-flex items-center gap-1.5 text-[12.5px] text-black dark:text-zinc-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500" /> Available 24/7
                </span>
              </td>
              <td className="py-2.5 pr-3 text-black dark:text-zinc-500">---</td>
              <td className="py-2.5 pr-3 text-black dark:text-zinc-300">{group.ezra.assigned}</td>
              <td className="py-2.5 text-right">
                {isManager && (
                  <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-zinc-200 px-1.5 py-0.5 font-mono text-[9px] uppercase text-black dark:border-zinc-700 dark:text-zinc-500">
                    <ShieldCheck size={9} /> Governed
                  </span>
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function EscalationLadder({ levels }: { levels: string[] }) {
  return (
    <div className="flex flex-col">
      {levels.map((lv, i) => (
        <React.Fragment key={i}>
          <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3.5 dark:border-zinc-700 dark:bg-zinc-900/60">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">Level {i + 1}</div>
            <div className="mt-0.5 text-[15px] font-semibold text-black dark:text-zinc-200">{lv}</div>
          </div>
          {i < levels.length - 1 && <div className="flex h-6 items-center justify-center text-black/30 dark:text-zinc-500">↓</div>}
        </React.Fragment>
      ))}
    </div>
  );
}

export function OnCallCard({ oncall, action }: { oncall: { name: string | null; ends: string | null }; action?: React.ReactNode }) {
  if (!oncall.name) {
    return (
      <div className="flex max-w-md items-center justify-between gap-4 rounded-lg border border-rose-200 bg-rose-50 p-4 dark:border-rose-500/30 dark:bg-rose-500/5">
        <p className="text-[13px] font-medium text-rose-600 dark:text-rose-400">No one currently on call — coverage gap.</p>
        {action}
      </div>
    );
  }
  return (
    <div className="flex max-w-md items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900/60">
      <div>
        <div className="text-[18px] font-semibold text-black dark:text-zinc-100">{oncall.name}</div>
        <div className="mt-0.5 text-[12px] text-black/50 dark:text-zinc-500">Ends {oncall.ends}</div>
      </div>
      {action}
    </div>
  );
}

export function GroupListRow({ group, active, onClick }: { group: Group; active: boolean; onClick: () => void }) {
  const rd = readiness(group);
  const [rc, rl] = riskTag(rd.risk);
  const dotTone = rc === "ok" ? "bg-emerald-500" : rc === "warn" ? "bg-amber-500" : "bg-rose-500";
  const textTone = rc === "ok" ? "text-emerald-600 dark:text-emerald-400" : rc === "warn" ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400";
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-1 border-b border-zinc-100 px-4 py-4 text-left transition-colors last:border-b-0 dark:border-zinc-800",
        active ? "bg-zinc-100 dark:bg-zinc-800/60" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40",
        group.status === "Archived" && "opacity-60",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-[15px] font-bold text-black dark:text-zinc-100">{group.name}</span>
        <span className={cn("flex shrink-0 items-center gap-1.5 text-[13px] font-medium", textTone)}>
          <span className={cn("h-2 w-2 rounded-full", dotTone)} />
          {rl} risk
        </span>
      </div>
      <div className="truncate text-[13px] text-black/50 dark:text-zinc-500">
        {group.members.length} members · {group.manager}
      </div>
    </button>
  );
}
