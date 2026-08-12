"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft, BookOpen, ChevronRight, CircleAlert, Copy, FileText,
  Sparkles, Check, Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AvatarStack, PersonAvatar, SeverityPill, StatusBadge, TypeTag } from "./WarRoomPrimitives";
import {
  BUCKET_LABEL, CURRENT_USER, TYPE_LABEL, bucketOf, colorOf, initOf, roleOf, tally,
  type Bucket, type FollowUpType, type WarRoom,
} from "./warRoomLibrary.data";

const BUCKET_DOT: Record<Bucket, string> = { needs: "#B7791F", motion: "#1B4DFF", done: "#28A745" };

export type SummaryActionKind = "ticket" | "kb" | "problem";

interface Props {
  room: WarRoom;
  onBack: () => void;
  onOpenCap: (id: string) => void;
  onSummaryAction: (kind: SummaryActionKind) => void;
  onCapture: (text: string) => { id: string; type: FollowUpType } | null;
}

export default function WarRoomDetail({ room, onBack, onOpenCap, onSummaryAction, onCapture }: Props) {
  const [draft, setDraft] = useState("");
  const [erInline, setErInline] = useState<{ id: string; type: FollowUpType } | null>(null);
  const t = tally(room);
  const m = room.meeting;
  const roster = [...room.team, ...room.teamAI];

  function submitCapture() {
    const text = draft.trim();
    if (!text) { toast.warning("Write a follow-up first"); return; }
    const created = onCapture(text);
    if (!created) return;
    setDraft("");
    setErInline(created);
    toast.success(`Ezra captured ${created.id} · ${TYPE_LABEL[created.type]}`);
  }

  function copySummary() {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(m.exec).then(() => toast.success("Summary copied to clipboard")).catch(() => toast.error("Couldn't copy — copy it manually"));
    } else {
      toast.success("Summary copied to clipboard");
    }
  }

  const buckets: Bucket[] = ["needs", "motion", "done"];

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-7">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-zinc-500 hover:text-black dark:hover:text-white">
        <ArrowLeft size={15} /> War rooms
      </button>

      <div className="mt-4 flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[11.5px] text-zinc-400">{room.wr} · incident {room.inc}</div>
          <h1 className="mt-0.5 font-ibm text-[22px] font-bold leading-tight tracking-tight">{room.title}</h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <SeverityPill sev={room.sev} />
            <StatusBadge status={room.status} />
            <span className="text-[12px] text-zinc-400">Problem record <span className="cursor-pointer font-mono text-zinc-500 hover:text-black dark:hover:text-white" onClick={() => toast(`Opening problem record ${room.problem}`)}>{room.problem}</span></span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap overflow-hidden rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-grayscrubbe-900 shadow-sm">
        {[
          { k: "When", v: room.date },
          { k: "Duration", v: room.duration },
          { k: "Service", v: room.service },
          { k: "Incident commander", v: <span className="flex items-center gap-1.5"><PersonAvatar name={room.ic} size={19} />{room.ic}</span> },
          { k: "In the room", v: <span className="flex items-center gap-2"><AvatarStack names={roster} size={19} /><span className="text-[11.5px] font-semibold text-zinc-400">{room.humans} · {room.agents} agents</span></span> },
        ].map((f, i) => (
          <div key={f.k} className={cn("min-w-[150px] flex-1 px-4 py-3", i !== 0 && "border-l border-zinc-100 dark:border-white/5")}>
            <div className="font-mono text-[10px] font-bold uppercase tracking-wide text-zinc-400">{f.k}</div>
            <div className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold">{f.v}</div>
          </div>
        ))}
      </div>

      <div className="mt-7 flex items-center gap-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-black dark:bg-white text-white dark:text-black"><FileText size={13} /></span>
        <h2 className="font-ibm text-[15px] font-bold tracking-tight">Meeting summary</h2>
        <span className="rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 px-2.5 py-0.5 font-mono text-[10.5px] font-semibold text-zinc-400">Captured by Ezra</span>
      </div>
      <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-grayscrubbe-900 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] px-4 py-2.5">
          <span className="mr-0.5 font-mono text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">Turn this into</span>
          <ActionChip icon={<FileText size={13} />} label="Raise incident ticket" onClick={() => onSummaryAction("ticket")} />
          <ActionChip icon={<BookOpen size={13} />} label="Add to knowledge base" onClick={() => onSummaryAction("kb")} />
          <ActionChip icon={<CircleAlert size={13} />} label="Add to problem record" onClick={() => onSummaryAction("problem")} />
          <span className="flex-1" />
          <ActionChip icon={<Copy size={13} />} label="Copy" onClick={copySummary} />
        </div>
        <div className="border-t border-zinc-100 dark:border-white/5 px-[18px] py-4">
          <div className="mb-2 font-mono text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">Executive summary</div>
          <p className="text-[14.5px] leading-relaxed text-zinc-700 dark:text-zinc-200">{m.exec}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="border-t border-zinc-100 dark:border-white/5 px-[18px] py-4">
            <div className="mb-2 font-mono text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">Impact</div>
            <ul className="flex flex-col gap-1.5">
              {m.impact.map((x, i) => (
                <li key={i} className="flex gap-2.5 text-[13px] leading-snug text-zinc-600 dark:text-zinc-300"><Circle size={7} className="mt-1.5 shrink-0 fill-current text-zinc-400" /><span>{x}</span></li>
              ))}
            </ul>
          </div>
          <div className="border-t border-l border-zinc-100 dark:border-white/5 px-[18px] py-4 sm:border-l">
            <div className="mb-2 flex items-center gap-2 font-mono text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">
              Root cause
              <button type="button" onClick={() => onSummaryAction("problem")} className="ml-auto rounded-full border border-zinc-200 dark:border-white/10 px-2 py-0.5 font-sans text-[10.5px] font-semibold normal-case tracking-normal text-zinc-500 hover:border-IMSLightGreen hover:text-IMSLightGreen">Add to problem record</button>
            </div>
            <p className="text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-300">{m.rootCause}</p>
          </div>
          <div className="border-t border-zinc-100 dark:border-white/5 px-[18px] py-4">
            <div className="mb-2 font-mono text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">Timeline</div>
            <ul className="flex flex-col">
              {m.timeline.map((x, i) => (
                <li key={i} className="flex gap-3 py-1 text-[13px] text-zinc-600 dark:text-zinc-300"><span className="w-[42px] shrink-0 pt-0.5 font-mono text-[11px] text-zinc-400">{x.at}</span><span>{x.text}</span></li>
              ))}
            </ul>
          </div>
          <div className="border-t border-l border-zinc-100 dark:border-white/5 px-[18px] py-4 sm:border-l">
            <div className="mb-2 flex items-center gap-2 font-mono text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">
              Decisions
              <button type="button" onClick={() => onSummaryAction("kb")} className="ml-auto rounded-full border border-zinc-200 dark:border-white/10 px-2 py-0.5 font-sans text-[10.5px] font-semibold normal-case tracking-normal text-zinc-500 hover:border-IMSLightGreen hover:text-IMSLightGreen">Add to knowledge base</button>
            </div>
            <ul className="flex flex-col gap-1.5">
              {m.decisions.map((x, i) => (
                <li key={i} className="flex gap-2.5 text-[13px] leading-snug text-zinc-600 dark:text-zinc-300"><Check size={14} className="mt-0.5 shrink-0 text-IMSLightGreen" /><span>{x}</span></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-zinc-100 dark:border-white/5 px-[18px] py-4">
          <div className="mb-2 font-mono text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">Resolution &amp; current state</div>
          <p className="text-[13.5px] leading-relaxed text-zinc-600 dark:text-zinc-300">{m.resolution}</p>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1B4DFF] text-white"><Sparkles size={13} /></span>
        <h2 className="font-ibm text-[15px] font-bold tracking-tight">Follow-ups</h2>
        <span className="rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 px-2.5 py-0.5 font-mono text-[10.5px] font-semibold text-zinc-400">{t.total} captured</span>
      </div>
      <p className="mt-2 max-w-[78ch] text-[13px] leading-relaxed text-zinc-500">As the room talked, Scrubbe&apos;s agents captured the actions, changes, metrics, dates and decisions and turned each into a real action across the platform. They&apos;re tracked here until they&apos;re done.</p>
      <p className="mt-3.5 text-[13px] font-medium text-zinc-600 dark:text-zinc-300">
        Scrubbe captured <b className="text-black dark:text-white font-bold">{t.total} follow-ups</b> · {t.motion} in motion · {t.done} done.
      </p>

      <div className="mt-4 flex flex-col gap-5">
        {buckets.map((bk) => {
          const items = room.caps.filter((c) => bucketOf(c.status) === bk);
          if (!items.length) return null;
          return (
            <div key={bk}>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: BUCKET_DOT[bk] }} />
                <h3 className="text-[12.5px] font-bold">{BUCKET_LABEL[bk]}</h3>
                <span className="font-mono text-[11px] font-bold text-zinc-400">{items.length}</span>
              </div>
              <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-grayscrubbe-900 shadow-sm">
                {items.map((c, i) => {
                  const short = c.did.replace(/\.$/, "");
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onOpenCap(c.id)}
                      className={cn("flex w-full items-start gap-3.5 px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-white/[0.03]", i !== 0 && "border-t border-zinc-100 dark:border-white/5")}
                    >
                      <TypeTag>{TYPE_LABEL[c.type]}</TypeTag>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-semibold text-black dark:text-white">{c.text}</span>
                        <span className="mt-1 block text-[12px] leading-snug text-zinc-500 dark:text-zinc-400"><span className="font-semibold text-zinc-600 dark:text-zinc-300">{c.by}</span> captured this · <span className="font-bold text-[#1B4DFF]">→</span> {short}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400"><PersonAvatar name={c.owner} size={18} />{c.owner}</span>
                        <ChevronRight size={15} className="text-zinc-400" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-7 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-grayscrubbe-900 p-5 shadow-sm">
        <h3 className="font-ibm text-[14px] font-bold">Add something the agents missed</h3>
        <p className="mt-1 max-w-[76ch] text-[12px] leading-relaxed text-zinc-500">Capture a follow-up in plain language. Ezra files it under the right kind, turns it into an action across Scrubbe, and tracks it — just like the ones captured from the discussion.</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-zinc-400">Writing as</span>
          <span className="inline-flex h-[30px] items-center gap-2 rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 py-0 pl-[5px] pr-2.5 text-[12.5px] font-semibold">
            <span className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: colorOf(CURRENT_USER) }}>{initOf(CURRENT_USER)}</span>
            {CURRENT_USER}
            <span className="font-medium text-zinc-400">· {roleOf(CURRENT_USER)}</span>
          </span>
        </div>
        <div className="mt-2.5 overflow-hidden rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03]">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submitCapture(); }}
            placeholder={'e.g. "Add an alert before the pool crosses 80%", or "Revert the rate-limit change once traffic settles"…'}
            className="min-h-[64px] w-full resize-none bg-transparent p-3.5 text-[13.5px] leading-relaxed outline-none placeholder:text-zinc-400"
          />
          <div className="flex items-center gap-2.5 border-t border-zinc-200 dark:border-white/10 bg-white dark:bg-grayscrubbe-900 px-3 py-2.5">
            <span className="inline-flex items-center gap-1.5 text-[11.5px] text-zinc-400"><Sparkles size={13} className="text-[#1B4DFF]" />Ezra files it, acts on it, and follows up</span>
            <span className="flex-1" />
            <button type="button" onClick={submitCapture} className="inline-flex h-[31px] items-center gap-1.5 rounded-lg bg-black dark:bg-white px-3 text-[12px] font-bold text-white dark:text-black">
              <ChevronRight size={13} /> Hand to Ezra
            </button>
          </div>
        </div>
        {erInline && (
          <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-[#D3DEFF] dark:border-[#1B4DFF]/30 bg-[#EDF1FF] dark:bg-[#1B4DFF]/10 px-3.5 py-2.5">
            <span className="flex h-[25px] w-[25px] shrink-0 items-center justify-center rounded-md bg-[#1B4DFF] text-white"><Sparkles size={13} /></span>
            <span className="flex-1 text-[12.5px] leading-snug text-zinc-700 dark:text-zinc-200">
              <b className="text-black dark:text-white">Ezra captured this as a {TYPE_LABEL[erInline.type].toLowerCase()}</b> <span className="font-mono text-[10.5px] text-[#1B4DFF]">{erInline.id}</span>
            </span>
            <button type="button" onClick={() => onOpenCap(erInline.id)} className="shrink-0 rounded-md border border-zinc-200 dark:border-white/15 bg-white dark:bg-grayscrubbe-900 px-2.5 py-1 text-[11.5px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5">Open</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionChip({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex h-[30px] items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-grayscrubbe-900 px-2.5 text-[12px] font-semibold text-zinc-600 dark:text-zinc-300 hover:border-[#1B4DFF] hover:text-[#1B4DFF]">
      {icon}{label}
    </button>
  );
}
