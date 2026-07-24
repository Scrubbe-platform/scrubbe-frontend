"use client";

import React from "react";
import { ChevronRight, ShieldCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Availability, Group, Member, Tone, availTone, readiness, riskTag } from "./data";

const toneText: Record<Tone, string> = {
  ok: "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
  warn: "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
  major: "text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30",
  accent: "text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-500/30",
  neutral: "border-zinc-300 text-black dark:border-zinc-700 dark:text-zinc-400",
};
const toneDot: Record<Tone, string> = { ok: "bg-emerald-500", warn: "bg-amber-500", major: "bg-rose-500", accent: "bg-sky-500", neutral: "bg-zinc-400" };
const toneBorderL: Record<Tone, string> = { ok: "border-l-emerald-500", warn: "border-l-amber-500", major: "border-l-rose-500", accent: "border-l-sky-500", neutral: "border-l-zinc-400" };

export function Tag({ label, tone, dot = true }: { label: string; tone: Tone; dot?: boolean }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide", toneText[tone])}>
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

export function SectionBlock({ title, headAction, children }: { title: string; headAction?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border-b border-zinc-100 py-6 last:border-b-0 dark:border-zinc-800">
      <h3 className="mb-4 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
        {title}
        <span className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
        {headAction && <span className="ml-auto flex gap-1.5">{headAction}</span>}
      </h3>
      {children}
    </div>
  );
}

export function KVGrid({ rows }: { rows: [string, React.ReactNode, boolean?][] }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-0.5 sm:grid-cols-2">
      {rows.map(([k, v, wide], i) => (
        <div key={i} className={cn("border-b border-zinc-100 py-2.5 dark:border-zinc-800", wide && "sm:col-span-2")}>
          <div className="mb-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-black dark:text-zinc-500">{k}</div>
          <div className="text-[13.5px] text-black dark:text-zinc-200">{v}</div>
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
          className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[12.5px] text-black transition-colors hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200"
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

export function ReadinessBlock({ group, allGroups }: { group: Group; allGroups: Group[] }) {
  const rd = readiness(group);
  const [rc, rl] = riskTag(rd.risk);
  const item = (state: Tone, label: string, val: string) => (
    <div key={label} className="flex items-center gap-2.5 border-b border-zinc-100 py-2 dark:border-zinc-800">
      <span className={cn("flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px]", toneText[state])}>
        {state === "ok" ? "✓" : state === "major" ? "✕" : "!"}
      </span>
      <span className="flex-1 text-[13px] text-black dark:text-zinc-400">{label}</span>
      <span className="text-[13px] font-medium text-black dark:text-zinc-200">{val}</span>
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
    <div className={cn("mb-5 rounded-xl border-l-4 bg-gradient-to-b from-white to-zinc-50 p-5 shadow-sm shadow-light dark:from-zinc-900/40 dark:to-zinc-900/60", toneBorderL[rc])}>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <h4 className="text-[19px] font-semibold text-black dark:text-zinc-100">Operational readiness</h4>
        <Tag label={`${rl} risk`} tone={rc} />
      </div>
      <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
        {item(rd.availOk ? "ok" : rd.available > 0 ? "warn" : "major", "Members available", `${rd.available} / ${rd.total}`)}
        {item(rd.oncall ? "ok" : "major", "Current on-call", rd.oncall ? "Covered" : "Gap")}
        {item(rd.skills ? "ok" : "warn", "Required skills", rd.skills ? "Satisfied" : "Gaps")}
        {item(rd.ic ? "ok" : "major", "Incident Commander", rd.ic ? "Available" : "Unavailable")}
        {item(rd.majorReady ? "ok" : rd.availOk ? "warn" : "major", "Major incident coverage", rd.majorReady ? "Ready" : "At risk")}
        {item(rd.deploy ? "ok" : "warn", "Deployment ownership", rd.deploy ? "Healthy" : "None")}
        {group.ezra && item("accent", "Ezra · service identity", ezOn ? `Assignable${group.ezra.assigned ? ` · ${group.ezra.assigned} assigned` : ""}` : "Paused")}
      </div>
      <div className="mt-4 flex gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-[13px] font-semibold text-white">E</span>
        {rd.risk !== "low" ? (
          <p className="text-[13.5px] text-black dark:text-zinc-200">
            <b className="font-semibold">Ezra:</b> {group.name} has {gaps.join(", ")}.{" "}
            {alts.length ? (
              <>
                For a major incident right now, route to <b className="font-semibold">{alts.join("</b> or <b>")}</b>.
              </>
            ) : (
              "Escalate to a manager to restore coverage."
            )}
          </p>
        ) : (
          <p className="text-[13.5px] text-black dark:text-zinc-200">
            <b className="font-semibold">Ezra:</b> {group.name} is ready to take a major incident — coverage, on-call and expertise all check out.
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
              <td className={cn("py-2.5 pr-3", m.oncall ? "font-medium text-emerald-600 dark:text-emerald-400" : "text-black dark:text-zinc-500")}>{m.oncall ? "On-call" : "—"}</td>
              <td className="py-2.5 pr-3 text-black dark:text-zinc-300">{m.incidents}</td>
              <td className="py-2.5 text-right">
                {isManager && (
                  <button onClick={() => onRemove(i)} title="Remove member" className="rounded px-1.5 py-0.5 text-black hover:bg-rose-50 hover:text-rose-600 dark:text-zinc-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400">
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
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-600 text-[11px] font-semibold text-white">E</span>
                  <button onClick={onEzraClick} className="font-medium text-black hover:text-emerald-600 hover:underline dark:text-zinc-100 dark:hover:text-emerald-400">
                    Ezra
                  </button>
                  <span className="whitespace-nowrap rounded-full border border-emerald-200 px-1.5 py-0.5 font-mono text-[9px] uppercase text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-400">AI · Service identity</span>
                </span>
              </td>
              <td className="py-2.5 pr-3 text-black dark:text-zinc-300">Governed response agent</td>
              <td className="py-2.5 pr-3">
                <span className="inline-flex items-center gap-1.5 text-[12.5px] text-black dark:text-zinc-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500" /> Available 24/7
                </span>
              </td>
              <td className="py-2.5 pr-3 text-black dark:text-zinc-500">—</td>
              <td className="py-2.5 pr-3 text-black dark:text-zinc-300">{group.ezra.assigned}</td>
              <td className="py-2.5 text-right">
                {isManager && (
                  <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-zinc-200 px-1.5 py-0.5 font-mono text-[9px] uppercase text-black dark:border-zinc-700 dark:text-zinc-500">
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
    <div className="flex max-w-sm flex-col">
      {levels.map((lv, i) => (
        <React.Fragment key={i}>
          <div className="rounded-lg bg-zinc-50 px-3.5 py-2.5 dark:bg-zinc-900/60">
            <div className="font-mono text-[10.5px] uppercase tracking-wide text-black dark:text-zinc-500">Level {i + 1}</div>
            <div className="text-[14px] font-medium text-black dark:text-zinc-200">{lv}</div>
          </div>
          {i < levels.length - 1 && <div className="flex h-[18px] items-center justify-center text-black dark:text-zinc-500">↓</div>}
        </React.Fragment>
      ))}
    </div>
  );
}

export function OnCallCard({ oncall, action }: { oncall: { name: string | null; ends: string | null }; action?: React.ReactNode }) {
  if (!oncall.name) {
    return (
      <div className="flex max-w-sm items-center justify-between gap-4 rounded-xl bg-rose-50 p-4 shadow-sm shadow-light dark:bg-rose-500/5">
        <p className="text-[13px] font-medium text-rose-600 dark:text-rose-400">No one currently on call — coverage gap.</p>
        {action}
      </div>
    );
  }
  return (
    <div className="flex max-w-sm items-center justify-between gap-4 rounded-xl bg-zinc-50 p-4 shadow-sm shadow-light dark:bg-zinc-900/60">
      <div>
        <div className="text-[18px] font-semibold text-black dark:text-zinc-100">{oncall.name}</div>
        <div className="mt-0.5 font-mono text-[11px] text-black dark:text-zinc-500">Ends {oncall.ends}</div>
      </div>
      {action}
    </div>
  );
}

export function IncidentList({ items, kind }: { items: [string, string][] | [string, string, string][]; kind: "active" | "history" }) {
  if (!items.length) return <p className="text-[12px] text-black dark:text-zinc-500">None right now.</p>;
  return (
    <div className="border-t border-zinc-100 dark:border-zinc-800">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-3.5 border-b border-zinc-100 py-2.5 dark:border-zinc-800">
          <span className="min-w-[88px] font-mono text-[12.5px] text-black dark:text-zinc-400">{it[0]}</span>
          <span className="flex-1 text-[13.5px] text-black dark:text-zinc-200">{it[1]}</span>
          {kind === "active" && it[2] && <Tag label={it[2]} tone={it[2] === "P0" ? "major" : it[2] === "P1" ? "warn" : "accent"} dot={false} />}
          <ChevronRight size={14} className="text-black dark:text-zinc-500" />
        </div>
      ))}
    </div>
  );
}

export function GroupListCard({ group, active, onClick }: { group: Group; active: boolean; onClick: () => void }) {
  const rd = readiness(group);
  const [rc, rl] = riskTag(rd.risk);
  return (
    <button
      onClick={onClick}
      className={cn(
        "mb-2.5 w-full rounded-xl bg-white p-3.5 text-left shadow-sm shadow-light transition-shadow dark:bg-zinc-900/40",
        active ? "ring-2 ring-emerald-400 dark:ring-emerald-500/60" : "hover:shadow-md",
        group.status === "Archived" && "opacity-60",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[15.5px] font-semibold text-black dark:text-zinc-100">{group.name}</h3>
        <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap font-mono text-[10px] uppercase tracking-wide text-black dark:text-zinc-500">
          <span className={cn("h-1.5 w-1.5 rounded-full", rc === "ok" ? "bg-emerald-500" : rc === "warn" ? "bg-amber-500" : "bg-rose-500")} />
          {rl} risk
        </span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-3.5 gap-y-1 text-[12px] text-black dark:text-zinc-400">
        <span>
          <b className="font-medium text-black dark:text-zinc-200">{group.members.length}</b> members
        </span>
        <span>
          Mgr <b className="font-medium text-black dark:text-zinc-200">{group.manager}</b>
        </span>
        <span>{group.primaryService}</span>
      </div>
    </button>
  );
}
