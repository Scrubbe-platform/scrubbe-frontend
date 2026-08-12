"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, ExternalLink, Fingerprint, Loader2, Play, Sparkles } from "lucide-react";
import SideModal from "@/components/ui/SideModal";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import TextArea from "@/components/ui/text-area";
import { cn } from "@/lib/utils";
import { PersonAvatar, TypeTag } from "./WarRoomPrimitives";
import { BUCKET_LABEL, TYPE_LABEL, bucketOf, type FollowUp, type WarRoom } from "./warRoomLibrary.data";
import type { SummaryActionKind } from "./WarRoomDetail";

export type DrawerState = { mode: "cap"; id: string } | { mode: "action"; kind: SummaryActionKind } | null;

interface Props {
  room: WarRoom | null;
  drawer: DrawerState;
  onClose: () => void;
  onApprove: (id: string) => void;
  onRun: (id: string) => void;
  onMarkDone: (id: string) => void;
  onConfirmAction: (kind: SummaryActionKind) => void;
}

const ACTION_META: Record<SummaryActionKind, { title: string; dest: string; confirm: string }> = {
  ticket: { title: "Raise incident ticket", dest: "A new tracked incident ticket", confirm: "Raise ticket" },
  kb: { title: "Add to knowledge base", dest: "The engineering knowledge base", confirm: "Add to knowledge base" },
  problem: { title: "Add to problem record", dest: "The linked problem record", confirm: "Add to problem record" },
};

export default function WarRoomDrawer({ room, drawer, onClose, onApprove, onRun, onMarkDone, onConfirmAction }: Props) {
  const cap: FollowUp | null = drawer?.mode === "cap" && room ? room.caps.find((c) => c.id === drawer.id) ?? null : null;

  let title = "";
  let sub: string | undefined;
  let body: React.ReactNode = null;

  if (drawer?.mode === "cap" && cap) {
    title = cap.text;
    sub = `${cap.id} · captured by ${cap.by} at ${cap.at}`;
    body = <CapBody cap={cap} onApprove={onApprove} onRun={onRun} onMarkDone={onMarkDone} onClose={onClose} />;
  } else if (drawer?.mode === "action" && room) {
    const meta = ACTION_META[drawer.kind];
    title = meta.title;
    sub = `${room.wr} · ${room.inc}`;
    body = <ActionBody room={room} kind={drawer.kind} onConfirm={onConfirmAction} onClose={onClose} />;
  }

  return (
    <SideModal isOpen={!!drawer} onClose={onClose} title={title} subTitle={sub}>
      {body}
    </SideModal>
  );
}

function TargetChip({ k, n, onClick }: { k: string; n: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="mt-3 inline-flex h-[33px] items-center gap-2.5 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-grayscrubbe-900 px-3 text-[12px] font-semibold hover:border-zinc-300 dark:hover:border-white/20">
      <span className="font-mono text-[9.5px] font-bold uppercase tracking-wide text-zinc-400">{k}</span>{n}<ExternalLink size={13} className="text-zinc-400" />
    </button>
  );
}

function CapBody({ cap, onApprove, onRun, onMarkDone, onClose }: { cap: FollowUp; onApprove: (id: string) => void; onRun: (id: string) => void; onMarkDone: (id: string) => void; onClose: () => void }) {
  const [running, setRunning] = useState(false);
  const bk = bucketOf(cap.status);
  const needsApproval = !!cap.approval && cap.approval.state !== "approved";
  const runnable = !!cap.aiRunnable && cap.status !== "done" && (!cap.approval || cap.approval.state === "approved");

  function handleRun() {
    if (cap.approval && cap.approval.state !== "approved") { toast.warning(`Needs ${cap.approval.role} approval first`); return; }
    if (cap.status === "done") return;
    setRunning(true);
    onRun(cap.id);
  }
  useEffect(() => { if (cap.status === "done") setRunning(false); }, [cap.status]);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        <span className={cn("inline-flex h-[23px] items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold",
          bk === "needs" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/25" :
          bk === "motion" ? "bg-[#EDF1FF] text-[#1B4DFF] border-[#D3DEFF] dark:bg-[#1B4DFF]/10 dark:border-[#1B4DFF]/30" :
          "bg-IMSLightGreen/10 text-IMSLightGreen border-IMSLightGreen/25")}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />{BUCKET_LABEL[bk]}
        </span>
        <TypeTag>{TYPE_LABEL[cap.type]}</TypeTag>
        <span className="inline-flex h-[23px] items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-white/5 px-2.5 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300"><PersonAvatar name={cap.owner} size={16} />{cap.owner}</span>
      </div>

      <div className="mt-5">
        <div className="mb-2 font-mono text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">From the discussion</div>
        <div className="border-l-2 border-zinc-200 dark:border-white/15 pl-3.5 text-[13px] italic leading-relaxed text-zinc-600 dark:text-zinc-300">
          &ldquo;{cap.quote}&rdquo;
          <span className="mt-1.5 block font-sans text-[11px] font-semibold not-italic text-zinc-400">{cap.src}</span>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 font-mono text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">What Scrubbe did</div>
        <div className="rounded-lg border border-zinc-200 dark:border-white/10 bg-gradient-to-b from-zinc-50 to-white dark:from-white/[0.04] dark:to-transparent p-3.5">
          <div className="flex items-center gap-2 text-[12.5px] font-bold"><span className="flex h-[21px] w-[21px] items-center justify-center rounded-md bg-[#1B4DFF] text-white"><Sparkles size={12} /></span>Ezra turned it into an action</div>
          <p className="mt-2 text-[12.5px] leading-relaxed text-zinc-600 dark:text-zinc-300">{cap.did}</p>
          <TargetChip k={cap.target.k} n={cap.target.n} onClick={() => toast(`Opening ${cap.target.arg}`)} />
        </div>
      </div>

      {needsApproval && cap.approval && (
        <div className="mt-5">
          <div className="mb-2 font-mono text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">Approval</div>
          <div className="rounded-lg border border-amber-200 dark:border-amber-500/25 bg-amber-50 dark:bg-amber-500/10 p-3.5">
            <div className="text-[12px] font-semibold text-amber-800 dark:text-amber-300">This needs {cap.approval.role} sign-off before it reaches production.</div>
            <button type="button" onClick={() => onApprove(cap.id)} className="mt-2.5 inline-flex h-[33px] items-center gap-1.5 rounded-lg bg-black dark:bg-white px-3 text-[12px] font-bold text-white dark:text-black"><Check size={13} />Approve as {cap.approval.role}</button>
          </div>
        </div>
      )}

      <div className="mt-5">
        <div className="mb-2 font-mono text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">Follow-up</div>
        <div className="flex gap-2.5 text-[12.5px] leading-relaxed text-zinc-600 dark:text-zinc-300">
          <Fingerprint size={16} className="mt-0.5 shrink-0 text-[#1B4DFF]" /><span>{cap.plan}</span>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 border-t border-zinc-200 dark:border-white/10 pt-4">
        {runnable && (
          <button type="button" onClick={handleRun} disabled={running} className="inline-flex h-[34px] items-center gap-1.5 rounded-lg bg-black dark:bg-white px-3.5 text-[12.5px] font-bold text-white dark:text-black disabled:opacity-60">
            {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}{running ? "Applying…" : "Run now"}
          </button>
        )}
        {cap.status !== "done" && <button type="button" onClick={() => onMarkDone(cap.id)} className="inline-flex h-[34px] items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-white/15 px-3.5 text-[12.5px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5"><Check size={13} />Mark done</button>}
        <span className="flex-1" />
        <button type="button" onClick={() => toast(`Opening ${cap.target.arg}`)} className="inline-flex h-[34px] items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-white/15 px-3.5 text-[12.5px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5">Open in Scrubbe</button>
      </div>
    </div>
  );
}

function ActionBody({ room, kind, onConfirm, onClose }: { room: WarRoom; kind: SummaryActionKind; onConfirm: (kind: SummaryActionKind) => void; onClose: () => void }) {
  const m = room.meeting;
  const [title, setTitle] = useState("");
  const [sev, setSev] = useState(`${room.sev} (inherited)`);
  const [body, setBody] = useState("");
  const [collection, setCollection] = useState("Postmortems");
  const [relation, setRelation] = useState("Contributing incident");

  useEffect(() => {
    if (kind === "ticket") { setTitle(`${room.title} — remediation`); setBody(m.exec); }
    else if (kind === "kb") { setTitle(`${room.title} — incident learnings`); setBody(`${m.exec}\n\nRoot cause: ${m.rootCause}\n\nResolution: ${m.resolution}`); }
    else { setBody(m.rootCause); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.wr, kind]);

  const meta = ACTION_META[kind];

  return (
    <div>
      <div className="flex items-center gap-2.5 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] px-3.5 py-2.5 text-[12.5px] text-zinc-600 dark:text-zinc-300">
        Destination: <b className="text-black dark:text-white">{meta.dest}</b>
      </div>

      {kind === "problem" && (
        <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] px-3.5 py-2.5 text-[12.5px] text-zinc-600 dark:text-zinc-300">
          Linking to existing problem record <b className="text-black dark:text-white">{room.problem}</b> for {room.service}.
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3.5">
        {kind === "ticket" && (
          <>
            <Input label="Ticket title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Select label="Severity" value={sev} options={[`${room.sev} (inherited)`, "P0", "P1", "P2", "P3"].map((s) => ({ value: s, label: s }))} onChange={(e) => setSev(String(e.target.value))} />
            <div>
              <TextArea label="Description" value={body} onChange={(e) => setBody(e.target.value)} rows={5} />
              <p className="-mt-2.5 text-[11px] text-zinc-400">Pre-filled from the meeting summary. Links back to {room.wr} and {room.inc}.</p>
            </div>
          </>
        )}
        {kind === "kb" && (
          <>
            <Input label="Article title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Select label="Collection" value={collection} options={["Postmortems", "Runbooks", "Service guides", "Known issues"].map((s) => ({ value: s, label: s }))} onChange={(e) => setCollection(String(e.target.value))} />
            <div>
              <TextArea label="Contents" value={body} onChange={(e) => setBody(e.target.value)} rows={8} />
              <p className="-mt-2.5 text-[11px] text-zinc-400">Drawn from the summary, root cause and resolution. Editable before publishing.</p>
            </div>
          </>
        )}
        {kind === "problem" && (
          <>
            <TextArea label="Problem statement" value={body} onChange={(e) => setBody(e.target.value)} rows={5} />
            <Select label="Add as" value={relation} options={["Contributing incident", "Root-cause update", "Recurrence"].map((s) => ({ value: s, label: s }))} onChange={(e) => setRelation(String(e.target.value))} />
          </>
        )}
      </div>

      <div className="mt-6 flex items-center gap-2 border-t border-zinc-200 dark:border-white/10 pt-4">
        <button type="button" onClick={() => onConfirm(kind)} className="inline-flex h-[34px] items-center gap-1.5 rounded-lg bg-black dark:bg-white px-3.5 text-[12.5px] font-bold text-white dark:text-black"><Check size={13} />{meta.confirm}</button>
        <span className="flex-1" />
        <button type="button" onClick={onClose} className="inline-flex h-[34px] items-center rounded-lg border border-zinc-200 dark:border-white/15 px-3.5 text-[12.5px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5">Cancel</button>
      </div>
    </div>
  );
}
