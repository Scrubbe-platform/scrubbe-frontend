"use client";

import React from "react";
import { Check, ChevronDown, Sparkles, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AuditEntry,
  ChildIncident,
  Evidence,
  HistoryEvent,
  Outcome,
  Proposal,
  RelationshipRecord,
  SimilarIncident,
  Tone,
  confidenceTone,
} from "./data";
import Link from "next/link";

const toneText: Record<Tone, string> = {
  ok: "text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20",
  warn: "text-amber-700 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20",
  major:
    "text-rose-700 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20",
  accent:
    "text-sky-700 bg-sky-50 border-sky-100 dark:text-sky-400 dark:bg-sky-500/10 dark:border-sky-500/20",
  info: "text-indigo-700 bg-indigo-50 border-indigo-100 dark:text-indigo-400 dark:bg-indigo-500/10 dark:border-indigo-500/20",
  neutral:
    "text-black/60 bg-zinc-50 border-zinc-200 dark:text-zinc-400 dark:bg-zinc-800 dark:border-zinc-700",
};
const toneDot: Record<Tone, string> = {
  ok: "bg-emerald-500",
  warn: "bg-amber-500",
  major: "bg-rose-500",
  accent: "bg-sky-500",
  info: "bg-indigo-500",
  neutral: "bg-zinc-400",
};
const toneSolidText: Record<Tone, string> = {
  ok: "text-emerald-600 dark:text-emerald-400",
  warn: "text-amber-600 dark:text-amber-400",
  major: "text-rose-600 dark:text-rose-400",
  accent: "text-sky-600 dark:text-sky-400",
  info: "text-indigo-600 dark:text-indigo-400",
  neutral: "text-black/50 dark:text-zinc-500",
};

export function Pill({
  label,
  tone,
  dot = true,
}: {
  label: string;
  tone: Tone;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-wide",
        toneText[tone],
      )}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", toneDot[tone])} />
      )}
      {label}
    </span>
  );
}

export function KindTag({ kind }: { kind: "join" | "recurrence" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide",
        kind === "recurrence"
          ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400"
          : "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-400",
      )}
    >
      {kind === "recurrence" ? "Possible recurrence" : "Suggested link"}
    </span>
  );
}

export function ChildRow({
  child,
  onClick,
}: {
  child: ChildIncident;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full flex-col gap-2 border-b border-zinc-100 py-3 text-left last:border-b-0 dark:border-zinc-800 sm:flex-row sm:items-center sm:gap-4"
    >
      <span className="w-24 shrink-0 font-mono text-[11px] text-black/40 dark:text-zinc-500">
        {child.id}
      </span>
      <span className="flex min-w-0 flex-1 items-center gap-2 text-[13.5px] font-medium text-black dark:text-zinc-200">
        <span className="truncate">{child.title}</span>
        <span
          className={cn(
            "shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide",
            child.merged
              ? "border-dashed border-zinc-300 text-black/40 dark:border-zinc-600 dark:text-zinc-500"
              : "border-zinc-200 text-black/50 dark:border-zinc-700 dark:text-zinc-500",
          )}
        >
          {child.merged ? "merged" : "child"}
        </span>
      </span>
      <span className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[11px] text-black/60 dark:text-zinc-400 sm:shrink-0">
        <span className="min-w-[70px]">
          <span className="block font-sans text-[9px] uppercase tracking-wide text-black/35 dark:text-zinc-600">
            Status
          </span>
          {child.status}
        </span>
        <span className="min-w-[60px]">
          <span className="block font-sans text-[9px] uppercase tracking-wide text-black/35 dark:text-zinc-600">
            Resolved in
          </span>
          {child.resolvedIn}
        </span>
        <span className="min-w-[110px]">
          <span className="block font-sans text-[9px] uppercase tracking-wide text-black/35 dark:text-zinc-600">
            Group
          </span>
          {child.group}
        </span>
        <span className="min-w-[70px]">
          <span className="block font-sans text-[9px] uppercase tracking-wide text-black/35 dark:text-zinc-600">
            In problem
          </span>
          {child.addedToProblem ? (
            <Check
              size={13}
              className="text-emerald-600 dark:text-emerald-400"
            />
          ) : (
            <span className="text-black/30 dark:text-zinc-600">---</span>
          )}
        </span>
        <span className="min-w-[50px]">
          <span className="block font-sans text-[9px] uppercase tracking-wide text-black/35 dark:text-zinc-600">
            KB
          </span>
          {child.kb ? (
            child.kb
          ) : (
            <span className="text-black/30 dark:text-zinc-600">No</span>
          )}
        </span>
      </span>
    </button>
  );
}

export function RecordCard({
  record,
  expanded,
  onToggle,
  onOpenChild,
  onOpenRecord,
}: {
  record: RelationshipRecord;
  expanded: boolean;
  onToggle: () => void;
  onOpenChild: (childId: string) => void;
  onOpenRecord: () => void;
}) {
  return (
    <div className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm shadow-light dark:bg-zinc-900/40">
      <button
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 px-7 pt-7 pb-1 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            <span className="text-[12px] text-black/40 dark:text-zinc-500">
              {record.id}
            </span>
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[12px] font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              Parent
            </span>
          </div>
          <h3 className="text-lg font-bold leading-tight text-black dark:text-zinc-100">
            {record.title}
          </h3>
        </div>
        <ChevronDown
          size={18}
          className={cn(
            "mt-1 shrink-0 text-black/40 transition-transform dark:text-zinc-500",
            expanded && "rotate-180",
          )}
        />
      </button>

      <div className="grid grid-cols-2 gap-x-6 gap-y-5 px-7 pb-7 pt-4 sm:grid-cols-5">
        <RecordStat label="Occurred" value={record.occurred} />
        <RecordStat label="Child incidents" value={record.children.length} />
        <RecordStat
          label="Problem record"
          route={
            record.problemRecord
              ? `/incident/problems?id=${record.problemRecord}`
              : undefined
          }
          value={
            record.problemRecord ? (
              <span className="text-blue-600 underline dark:text-blue-400">
                {record.problemRecord}
              </span>
            ) : (
              <span className="text-black/30 dark:text-zinc-600">---</span>
            )
          }
        />
        <RecordStat
          label="Knowledge article"
          value={
            record.knowledgeArticle ? (
              <span className="text-blue-600 underline dark:text-blue-400">
                {record.knowledgeArticle}
              </span>
            ) : (
              <span className="text-black/30 dark:text-zinc-600">---</span>
            )
          }
        />
        <div className="col-span-2 sm:col-span-1">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">
            Root cause
          </div>
          <div className="mt-1.5 text-[13.5px] leading-relaxed text-black dark:text-zinc-300">
            {record.rootCause}
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-100 px-7 py-5 dark:border-zinc-800">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">
          Resolution
        </div>
        <div className="mt-1.5 text-[13.5px] leading-relaxed text-black dark:text-zinc-300">
          {record.resolution}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-zinc-100 bg-zinc-50/60 px-7 py-5 dark:border-zinc-800 dark:bg-zinc-900/30">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">
            Child incidents · {record.children.length}
          </div>
          {record.children.map((c) => (
            <ChildRow key={c.id} child={c} onClick={() => onOpenChild(c.id)} />
          ))}
          <button
            onClick={onOpenRecord}
            className="mt-4 flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-emerald-700"
          >
            Open full operational record
          </button>
        </div>
      )}
    </div>
  );
}

function RecordStat({
  label,
  value,
  route,
}: {
  label: string;
  value: React.ReactNode;
  route?: string;
}) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">
        {label}
      </div>

      <Link
        href={route || ""}
        className={`mt-1.5 text-[15px] font-bold text-black dark:text-zinc-100 ${route ? "cursor-pointer" : "cursor-none"}`}
      >
        {value}
      </Link>
    </div>
  );
}

export function ConfidenceBadge({ value }: { value: number }) {
  const tone = confidenceTone(value);
  return (
    <div className="shrink-0 text-right">
      <div
        className={cn(
          "text-[22px] font-bold leading-none",
          toneSolidText[tone],
        )}
      >
        {value}%
      </div>
      <div className="mt-1 font-mono text-[9.5px] uppercase tracking-wide text-black/40 dark:text-zinc-500">
        Confidence
      </div>
    </div>
  );
}

export function ProposalCard({
  proposal,
  targetTitle,
  onConfirm,
  onReject,
  onOpenRecord,
}: {
  proposal: Proposal;
  targetTitle?: string;
  onConfirm: () => void;
  onReject: () => void;
  onOpenRecord: () => void;
}) {
  const line =
    proposal.kind === "recurrence" ? (
      <>
        <b className="font-semibold text-black dark:text-zinc-100">
          {proposal.incident.id}
        </b>{" "}
        looks like a recurrence of{" "}
        <b className="font-semibold text-black dark:text-zinc-100">
          {targetTitle ?? proposal.target}
        </b>{" "}
        <span className="font-mono text-[12px] text-black/40 dark:text-zinc-500">
          ({proposal.target} · known error)
        </span>
      </>
    ) : (
      <>
        Link{" "}
        <b className="font-semibold text-black dark:text-zinc-100">
          {proposal.incident.id}
        </b>{" "}
        as a child of{" "}
        <b className="font-semibold text-black dark:text-zinc-100">
          {targetTitle ?? proposal.target}
        </b>{" "}
        <span className="font-mono text-[12px] text-black/40 dark:text-zinc-500">
          ({proposal.target})
        </span>
      </>
    );

  return (
    <div className="mb-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <KindTag kind={proposal.kind} />
          <h3 className="mt-2 text-[17px] font-bold leading-tight text-black dark:text-zinc-100">
            {proposal.incident.title}
          </h3>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-black/70 dark:text-zinc-400">
            {line}
          </p>
          <p className="mt-1.5 font-mono text-[12px] text-black/40 dark:text-zinc-500">
            {proposal.incident.service} · {proposal.incident.priority} ·{" "}
            {proposal.incident.when}
          </p>
        </div>
        <ConfidenceBadge value={proposal.confidence} />
      </div>

      <div className="mt-3.5 flex flex-wrap gap-2">
        {proposal.signals.map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-2.5 py-1 text-[11.5px] text-black/70 dark:border-zinc-700 dark:text-zinc-400"
          >
            {s}
          </span>
        ))}
      </div>

      <p className="mt-3.5 flex items-center gap-1.5 font-mono text-[11px] text-black/40 dark:text-zinc-500">
        Proposed by {proposal.by} · a human decision is required
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-3.5 dark:border-zinc-800">
        <button
          onClick={onConfirm}
          className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-emerald-700"
        >
          Confirm link
        </button>
        <button
          onClick={onReject}
          className="rounded-md px-3 py-2 text-[13px] font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
        >
          Reject
        </button>
        <button
          onClick={onOpenRecord}
          className="rounded-md px-3 py-2 text-[13px] font-medium text-black/60 hover:text-emerald-600 dark:text-zinc-400"
        >
          Open {proposal.target}
        </button>
      </div>
    </div>
  );
}

export function GovernanceActivity({ entries }: { entries: AuditEntry[] }) {
  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div className="border-b border-zinc-100 bg-zinc-50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
        <h3 className="font-mono text-[11px] font-semibold uppercase tracking-wide text-black/50 dark:text-zinc-500">
          Governance activity
        </h3>
      </div>
      <ul className="px-5">
        {entries
          .slice()
          .reverse()
          .map((a, i) => (
            <li
              key={i}
              className="flex gap-4 border-b border-dashed border-zinc-200 py-2.5 text-[12.5px] text-black/70 last:border-b-0 dark:border-zinc-800 dark:text-zinc-400"
            >
              <span className="w-14 shrink-0 font-mono text-[10.5px] text-black/40 dark:text-zinc-500">
                {a.when}
              </span>
              <span>
                <b className="font-semibold text-black dark:text-zinc-100">
                  {a.actor}
                </b>{" "}
                {a.text}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}

/* ───────────────────── full operational record ───────────────────── */

export function DetailSection({
  eyebrow,
  note,
  children,
}: {
  eyebrow: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-2.5 border-b border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-black/60 dark:text-zinc-400">
          {eyebrow}
        </span>
        {note && (
          <span className="ml-auto text-[11.5px] text-black/40 dark:text-zinc-500">
            {note}
          </span>
        )}
      </div>
      <div className="bg-white p-4 dark:bg-zinc-900/60">{children}</div>
    </div>
  );
}

export function HistoryTimeline({ history }: { history: HistoryEvent[] }) {
  return (
    <div className="relative pl-6">
      <div className="absolute bottom-1 left-[5px] top-1 w-px bg-zinc-200 dark:bg-zinc-700" />
      {history.map((h, i) => (
        <div key={i} className="relative pb-5 last:pb-0">
          <span
            className={cn(
              "absolute -left-6 top-0.5 h-[11px] w-[11px] rounded-full border-2 bg-white dark:bg-zinc-900",
              h.done
                ? "border-emerald-600"
                : "border-zinc-300 dark:border-zinc-600",
            )}
          />
          <div className="font-mono text-[10.5px] text-black/40 dark:text-zinc-500">
            {h.date}
          </div>
          <div className="mt-0.5 text-[13.5px] font-medium text-black dark:text-zinc-200">
            {h.event}
            {h.who && (
              <span className="ml-1.5 font-mono text-[11px] text-black/40 dark:text-zinc-500">
                {h.who}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SimilarRow({
  s,
  onClick,
}: {
  s: SimilarIncident;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 border-b border-zinc-100 py-3 text-left last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/40"
    >
      <div className="w-12 shrink-0 text-center">
        <div className="text-[18px] font-bold text-black dark:text-zinc-100">
          {s.score}
        </div>
        <div className="font-mono text-[8.5px] uppercase tracking-wide text-black/35 dark:text-zinc-600">
          match
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10.5px] text-black/40 dark:text-zinc-500">
          {s.id}
        </div>
        <div className="text-[13.5px] font-medium text-black dark:text-zinc-200">
          {s.title}
        </div>
        <div className="mt-0.5 text-[12px] text-black/50 dark:text-zinc-500">
          Resolution — {s.resolution}
        </div>
      </div>
      <div className="shrink-0 text-right font-mono text-[11px] text-black/50 dark:text-zinc-500">
        {s.status}
        <br />
        {s.pr}
      </div>
    </button>
  );
}

export function ConfidenceBar({ evidence }: { evidence: Evidence }) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {evidence.signals.map((s) => (
          <div
            key={s}
            className="flex items-center gap-2.5 text-[13px] text-black dark:text-zinc-200"
          >
            <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <Check
                size={11}
                className="text-emerald-600 dark:text-emerald-400"
              />
            </span>
            {s}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <span className="font-mono text-[10px] uppercase tracking-wide text-black/40 dark:text-zinc-500">
          Confidence
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100"
            style={{ width: `${evidence.confidence}%` }}
          />
        </div>
        <span className="font-mono text-[15px] font-bold text-black dark:text-zinc-100">
          {evidence.confidence}%
        </span>
      </div>
    </div>
  );
}

export function OutcomeChecklist({ outcome }: { outcome: Outcome }) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {outcome.items.map(([label, done]) => (
          <div
            key={label}
            className={cn(
              "flex items-center gap-2.5 text-[13px]",
              done
                ? "text-black dark:text-zinc-200"
                : "text-black/40 dark:text-zinc-500",
            )}
          >
            <span
              className={cn(
                "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border",
                done
                  ? "border-emerald-100 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10"
                  : "border-dashed border-zinc-300 dark:border-zinc-600",
              )}
            >
              {done && (
                <Check
                  size={11}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              )}
            </span>
            {label}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[13px] font-semibold text-white dark:bg-zinc-700">
          {outcome.reviewedBy.name
            .split(/\s+/)
            .map((w) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </span>
        <div>
          <div className="font-mono text-[9.5px] uppercase tracking-wide text-black/40 dark:text-zinc-500">
            Last reviewed by
          </div>
          <div className="text-[13.5px] font-semibold text-black dark:text-zinc-200">
            {outcome.reviewedBy.name}
          </div>
          <div className="text-[12px] text-black/50 dark:text-zinc-500">
            {outcome.reviewedBy.team}
          </div>
        </div>
      </div>
    </div>
  );
}
