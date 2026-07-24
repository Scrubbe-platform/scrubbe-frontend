/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Incident,
  Service,
  AuditEntry,
  INCIDENTS,
  SERVICES,
  openIncidentIds,
  priorityTone,
  riskTone,
  confidenceWord,
} from "./data";

// ── shared handler contracts ─────────────────────────────────────────

export interface CardHandlers {
  onSend: (text: string) => void;
  onAck: (text: string, audit?: { action: string; result: string }) => void;
  onToast: (msg: string, audit?: { action: string; result: string }) => void;
  onOpenAudit: () => void;
}

type Tone = "ok" | "major" | "warn" | "accent";

const toneText: Record<Tone, string> = {
  ok: "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
  major: "text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30",
  warn: "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
  accent: "text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-500/30",
};
const toneDot: Record<Tone, string> = { ok: "bg-emerald-500", major: "bg-rose-500", warn: "bg-amber-500", accent: "bg-sky-500" };

export function StatusTag({ label, tone }: { label: string; tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
        tone ? toneText[tone] : "border-zinc-300 text-black dark:border-zinc-700 dark:text-zinc-400",
      )}
    >
      {tone && <span className={cn("h-1.5 w-1.5 rounded-full", toneDot[tone])} />}
      {label}
    </span>
  );
}

// ── card building blocks ──────────────────────────────────────────────

function CardFrame({ eyebrow, tag, deny, children }: { eyebrow?: string; tag?: React.ReactNode; deny?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "my-3 max-w-md overflow-hidden rounded-xl bg-white shadow-sm shadow-light dark:bg-zinc-900/40",
        deny && "border-l-4 border-l-rose-500",
      )}
    >
      {(eyebrow || tag) && (
        <div className="flex items-center justify-between gap-3 px-4 pt-3">
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-black dark:text-zinc-500">{eyebrow}</span>
          {tag}
        </div>
      )}
      {children}
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <div className="px-4 pb-1 pt-2 text-[15px] font-semibold text-black dark:text-zinc-100">{children}</div>;
}

function BigStat({ value, unit, note }: { value: number | string; unit?: string; note?: string }) {
  return (
    <div className="px-4 pt-2">
      <div className="text-[34px] font-semibold leading-none text-black dark:text-zinc-100">
        {value}
        {unit && <span className="ml-1 text-[14px] font-normal text-black dark:text-zinc-500">{unit}</span>}
      </div>
      {note && <p className="mt-1.5 text-[12px] text-black dark:text-zinc-400">{note}</p>}
    </div>
  );
}

function KVRows({ rows }: { rows: [string, string | number, boolean?][] }) {
  return (
    <div className="px-4 pt-2">
      {rows.map(([k, v, mono], i) => (
        <div key={i} className="flex justify-between gap-4 border-b border-zinc-100 py-1.5 text-[12.5px] last:border-b-0 dark:border-zinc-800">
          <span className="text-black dark:text-zinc-500">{k}</span>
          <span className={cn("text-right font-medium text-black dark:text-zinc-200", mono && "font-mono text-[12px]")}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-none px-4 pb-1 pt-1">
      {items.map((it, i) => (
        <li key={i} className="relative border-b border-zinc-100 py-1.5 pl-4 text-[13px] text-black last:border-b-0 dark:border-zinc-800 dark:text-zinc-200">
          <span className="absolute left-0 top-1/2 h-px w-2 -translate-y-1/2 bg-zinc-300 dark:bg-zinc-700" />
          {it}
        </li>
      ))}
    </ul>
  );
}

function CardNote({ children }: { children: React.ReactNode }) {
  return <p className="px-4 pb-3 pt-1 text-[12px] text-black dark:text-zinc-400">{children}</p>;
}

function CardActions({ children }: { children: React.ReactNode }) {
  return <div className="mt-2 flex flex-wrap gap-2 border-t border-zinc-100 bg-zinc-50/60 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">{children}</div>;
}

type CardBtnKind = "primary" | "ghost" | "danger";

export function CardButton({ children, onClick, kind = "primary", disabled }: { children: React.ReactNode; onClick?: () => void; kind?: CardBtnKind; disabled?: boolean }) {
  const cls =
    kind === "primary"
      ? "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700"
      : kind === "danger"
        ? "bg-white dark:bg-transparent border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
        : "bg-white dark:bg-transparent border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-200 hover:border-emerald-400 dark:hover:border-emerald-500/50";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn("inline-flex items-center rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors disabled:opacity-50", cls)}
    >
      {children}
    </button>
  );
}

// ── per-intent cards ──────────────────────────────────────────────────

export function ConfidenceCard({ i, h }: { i: Incident; h: CardHandlers }) {
  return (
    <CardFrame eyebrow={`Root cause confidence · ${i.id}`}>
      <BigStat value={i.confidence} unit="%" note={`${confidenceWord(i.confidence)} — ${i.rootCause} on ${i.service}.`} />
      <BulletList items={i.confReasons} />
      <CardActions>
        <CardButton kind="ghost" onClick={() => h.onToast(`Opening Causal Reconstruction · ${i.id}`)}>View analysis →</CardButton>
      </CardActions>
    </CardFrame>
  );
}

export function HandlerCard({ i, h }: { i: Incident; h: CardHandlers }) {
  return (
    <CardFrame eyebrow={`Incident ${i.id}`} tag={<StatusTag label={`${i.priority} · ${i.env}`} tone={priorityTone(i.priority) as Tone} />}>
      <CardTitle>{i.title}</CardTitle>
      <KVRows
        rows={[
          ["Incident Commander", i.commander],
          ["Technical Lead", i.techLead],
          ["Communications", i.comms],
          ["War room", i.warActive ? `${i.warParticipants} participants` : "Not opened"],
          ["Current stage", i.stage],
        ]}
      />
      <CardActions>
        <CardButton kind="ghost" onClick={() => h.onToast(`Opening Incident Library · ${i.id}`)}>Open incident →</CardButton>
      </CardActions>
    </CardFrame>
  );
}

export function QualityCard({ i, h }: { i: Incident; h: CardHandlers }) {
  const missing = i.qMissing;
  return (
    <CardFrame eyebrow={`Incident quality · ${i.id}`}>
      <BigStat value={i.qScore} unit="%" note={missing.length ? `Missing ${missing.length} field${missing.length > 1 ? "s" : ""} before it's report-ready.` : "Report-ready — no missing fields."} />
      {missing.length > 0 && <KVRows rows={missing.map((x): [string, string] => [`Missing — ${x}`, "Empty"])} />}
      {missing.length > 0 && <CardNote>I can draft these from the Signal Graph and Operational Memory for your review.</CardNote>}
      <CardActions>
        {missing.length ? (
          <>
            <CardButton
              onClick={() =>
                h.onAck(`Drafted ${missing.join(", ")} for ${i.id} from Signal Graph and Operational Memory. Review before saving.`, {
                  action: `Auto-filled quality fields · ${i.id}`,
                  result: "Allowed",
                })
              }
            >
              Fix automatically
            </CardButton>
            <CardButton kind="ghost" onClick={() => h.onToast(`Opening Incident Quality · ${i.id}`)}>Review manually</CardButton>
          </>
        ) : (
          <CardButton kind="ghost" onClick={() => h.onToast(`Opening Incident Quality · ${i.id}`)}>Open incident quality →</CardButton>
        )}
      </CardActions>
    </CardFrame>
  );
}

export function SimilarCard({ i, h }: { i: Incident; h: CardHandlers }) {
  const s = i.similar[0];
  return (
    <CardFrame eyebrow={`Most relevant match for ${i.id}`} tag={<StatusTag label={`${s.score}% similar`} tone="accent" />}>
      <CardTitle>{s.id} · {s.title}</CardTitle>
      <KVRows rows={[["Similarity", `${s.score}%`, true], ["When", s.ago]]} />
      <BulletList items={s.resolution.map((r) => `Resolution — ${r}`)} />
      <CardActions>
        <CardButton kind="ghost" onClick={() => h.onToast(`Opening Incident Relationships · ${s.id} → ${i.id}`)}>Compare with current →</CardButton>
        <CardButton
          onClick={() =>
            h.onAck(`Loaded ${s.id} resolution as proposed actions for ${i.id}. Needs approval before executing.`, {
              action: `Loaded ${s.id} resolution · ${i.id}`,
              result: "Allowed",
            })
          }
        >
          Apply known resolution
        </CardButton>
      </CardActions>
    </CardFrame>
  );
}

export function SlaCard({ i, h }: { i: Incident; h: CardHandlers }) {
  const r = i.sla;
  const label = r.risk === "high" ? "Breach risk high" : r.risk === "medium" ? "Breach risk medium" : "Within target";
  const note = r.risk === "high" ? "Acting now keeps you inside the window." : r.risk === "medium" ? "Some margin, but keep momentum." : "Comfortably within target.";
  return (
    <CardFrame eyebrow={`SLA / SLO · ${i.id}`} tag={<StatusTag label={label} tone={riskTone(r.risk) as Tone} />}>
      <CardTitle>{i.priority} resolution target</CardTitle>
      <KVRows rows={[["Time remaining", r.remaining, true], ["Target", r.target], ["Elapsed", r.elapsed, true]]} />
      <CardNote>{note}</CardNote>
      <CardActions>
        <CardButton kind="ghost" onClick={() => h.onToast(`Opening SLA / SLO · ${i.id}`)}>View SLA timeline →</CardButton>
      </CardActions>
    </CardFrame>
  );
}

export function WarroomCard({ i, h }: { i: Incident; h: CardHandlers }) {
  if (!i.warActive) {
    return (
      <CardFrame eyebrow={`War room · ${i.id}`}>
        <CardTitle>{i.service}</CardTitle>
        <CardNote>No active war room for {i.id} — it&apos;s at the {i.stage} stage.</CardNote>
        <CardActions>
          <CardButton
            onClick={() => {
              h.onToast(`Opening War Room · ${i.id}`, { action: `Requested war room · ${i.id}`, result: "Allowed" });
            }}
          >
            Open a war room
          </CardButton>
        </CardActions>
      </CardFrame>
    );
  }
  return (
    <CardFrame eyebrow={`War room · ${i.id}`} tag={<StatusTag label="Active" tone="ok" />}>
      <CardTitle>{i.service}</CardTitle>
      <KVRows rows={[["Participants", i.warParticipants], ["Stage", i.stage]]} />
      <BulletList items={i.warNotes} />
      <CardActions>
        <CardButton
          onClick={() => h.onToast(`Joining ${i.service} war room…`, { action: `Joined war room · ${i.id}`, result: "Allowed" })}
        >
          Join war room
        </CardButton>
        <CardButton
          kind="ghost"
          onClick={() =>
            h.onAck(`War room summary drafted and attached to ${i.id}.`, { action: `Generated war room summary · ${i.id}`, result: "Allowed" })
          }
        >
          Generate summary
        </CardButton>
      </CardActions>
    </CardFrame>
  );
}

export function DeployCard({ i, h }: { i: Incident; h: CardHandlers }) {
  const d = i.deployment;
  return (
    <CardFrame eyebrow={`Deployment ${d.id} · ${i.id}`} tag={<StatusTag label="Live" tone="warn" />}>
      <CardTitle>{i.service} release</CardTitle>
      <KVRows rows={[["Service", i.service], ["Released", d.released], ["Change request", d.change, true], ["Correlated with incident", d.correlated]]} />
      <CardActions>
        <CardButton kind="ghost" onClick={() => h.onToast(`Opening Change Intelligence · ${i.service}`)}>Compare with previous release →</CardButton>
      </CardActions>
    </CardFrame>
  );
}

export function WhyCard({ i, h }: { i: Incident; h: CardHandlers }) {
  return (
    <CardFrame eyebrow={`Causal reconstruction · ${i.id}`}>
      <CardTitle>{i.service} → deployment → impact</CardTitle>
      <BulletList items={i.causal} />
      <CardNote>Root cause confidence {i.confidence}%. Correlated to {i.deployment.change}.</CardNote>
      <CardActions>
        <CardButton kind="ghost" onClick={() => h.onToast(`Opening Causal Reconstruction · ${i.id}`)}>Open causal analysis →</CardButton>
      </CardActions>
    </CardFrame>
  );
}

export function RollbackAskCard({ i, h }: { i: Incident; h: CardHandlers }) {
  return (
    <CardFrame eyebrow={`Decision · ${i.id}`} tag={<StatusTag label="Recommended" tone="accent" />}>
      <CardTitle>Roll back {i.deployment.id}</CardTitle>
      <KVRows rows={[["Confidence", `${i.confidence - 2}%`, true], ["Blast radius", `${i.service} only`], ["Requires approval", i.rollback.rule.replace("Requires ", "")]]} />
      <CardNote>Rolling back {i.deployment.id} clears the {i.rootCause.toLowerCase()} the signals point to.</CardNote>
      <CardActions>
        <CardButton
          onClick={() =>
            h.onAck(`Rollback approved for ${i.id}. Emergency Approval created — tracking in Execution History and updating the war room.`, {
              action: `Approved rollback · ${i.id}`,
              result: "Allowed",
            })
          }
        >
          Approve
        </CardButton>
        <CardButton
          kind="danger"
          onClick={() =>
            h.onAck(`Rollback held for ${i.id}. I'll keep watching the error rate and flag you if it climbs.`, {
              action: `Rejected rollback · ${i.id}`,
              result: "Allowed",
            })
          }
        >
          Reject
        </CardButton>
      </CardActions>
    </CardFrame>
  );
}

export function RollbackDoCard({ i, h }: { i: Incident; h: CardHandlers }) {
  return (
    <CardFrame eyebrow={`Command · Rollback · ${i.id}`} tag={<StatusTag label="Approval required" tone="warn" />}>
      <KVRows rows={[["Deployment", i.deployment.id, true], ["Estimated downtime", i.rollback.downtime], ["Operational rule", i.rollback.rule]]} />
      <CardActions>
        <CardButton
          onClick={() =>
            h.onAck(`Approval created for ${i.deployment.id} (${i.id}) and routed to the on-call approver. I'll notify you when it's actioned.`, {
              action: `Opened approval for rollback · ${i.id}`,
              result: "Allowed",
            })
          }
        >
          Open approval
        </CardButton>
        <CardButton kind="ghost" onClick={() => h.onAck(`Holding the rollback for ${i.id}.`)}>Not now</CardButton>
      </CardActions>
    </CardFrame>
  );
}

export function PlaybookCard({ i, h }: { i: Incident; h: CardHandlers }) {
  return (
    <CardFrame eyebrow={`Recommended playbook · ${i.id}`} tag={<StatusTag label={`${i.playbook.confidence}% match`} tone="accent" />}>
      <CardTitle>{i.playbook.name}</CardTitle>
      <KVRows rows={[["Confidence", `${i.playbook.confidence}%`, true], ["For", `${i.service} · ${i.id}`]]} />
      <CardActions>
        <CardButton kind="ghost" onClick={() => h.onToast(`Opening Playbook Library · ${i.playbook.name}`)}>Open playbook</CardButton>
        <CardButton
          onClick={() =>
            h.onAck(`${i.playbook.name} loaded as a proposed action set for ${i.id}. Each step needs approval before it runs.`, {
              action: `Loaded playbook ${i.playbook.name} · ${i.id}`,
              result: "Allowed",
            })
          }
        >
          Apply now
        </CardButton>
      </CardActions>
    </CardFrame>
  );
}

export function ExecCard({ i, h }: { i: Incident; h: CardHandlers }) {
  return (
    <CardFrame eyebrow={`Executive summary · ${i.id}`}>
      <CardTitle>{i.title}</CardTitle>
      <BulletList
        items={[
          `Impact — ${i.execImpact}`,
          `Cause — ${i.rootCause} after deploy ${i.deployment.id}`,
          "Action — rollback proposed, awaiting approval",
          `Status — ${i.stage} · SLA ${i.sla.remaining} remaining`,
        ]}
      />
      <CardActions>
        <CardButton
          onClick={() =>
            h.onAck(`Executive update for ${i.id} queued in Incident Delivery. It'll send once the rollback approval is actioned.`, {
              action: `Queued executive update · ${i.id}`,
              result: "Allowed",
            })
          }
        >
          Send to stakeholders
        </CardButton>
        <CardButton kind="ghost" onClick={() => h.onSend("Export this to the incident record")}>Export →</CardButton>
      </CardActions>
    </CardFrame>
  );
}

export function OwnerCard({ s, h }: { s: Service; h: CardHandlers }) {
  const tone: Tone = s.health === "Healthy" ? "ok" : s.health === "Degraded" ? "warn" : "major";
  return (
    <CardFrame eyebrow="Service" tag={<StatusTag label={s.health} tone={tone} />}>
      <CardTitle>{s.name} Service</CardTitle>
      <KVRows rows={[["Owner", s.owner], ["Engineering Manager", s.em], ["Slack", s.slack, true], ["PagerDuty", s.pager, true], ["Dependencies", s.deps]]} />
      <CardActions>
        <CardButton kind="ghost" onClick={() => h.onToast(`Opening Service Catalog · ${s.name}`)}>View service →</CardButton>
      </CardActions>
    </CardFrame>
  );
}

export function DeniedCard({ h }: { h: CardHandlers }) {
  return (
    <CardFrame eyebrow="Governance · request blocked" tag={<StatusTag label="Denied" tone="major" />} deny>
      <KVRows rows={[["RBAC — Incident Commander", "No secrets scope"], ["Operational rule — Secrets Policy", "Deny by default"], ["Sensitive data policy", "Blocked"]]} />
      <CardNote>Logged to the audit trail. If you need this, request temporary elevated access — it routes to a tenant admin.</CardNote>
      <CardActions>
        <CardButton
          kind="ghost"
          onClick={() => h.onToast("Access request routed to tenant admin", { action: "Requested temporary secrets access", result: "Pending approval" })}
        >
          Request temporary access →
        </CardButton>
        <CardButton kind="ghost" onClick={h.onOpenAudit}>Open audit entry</CardButton>
      </CardActions>
    </CardFrame>
  );
}

export function AuditCard({ audit, h }: { audit: AuditEntry[]; h: CardHandlers }) {
  return (
    <CardFrame eyebrow="Audit trail · recent">
      <KVRows rows={audit.slice(0, 4).map((a): [string, string] => [a.action, a.result])} />
      <CardActions>
        <CardButton kind="ghost" onClick={h.onOpenAudit}>Open full audit log →</CardButton>
      </CardActions>
    </CardFrame>
  );
}

export function ExportCard({ h }: { h: CardHandlers }) {
  return (
    <CardFrame eyebrow="Export">
      <CardTitle>Share this conversation</CardTitle>
      <BulletList items={["PDF — full transcript and cards", "Incident record — attach to the focused incident", "Slack — post to #payments-platform"]} />
      <CardActions>
        <CardButton onClick={() => h.onToast("Preparing PDF…", { action: "Exported conversation to PDF", result: "Allowed" })}>Export to PDF</CardButton>
        <CardButton kind="ghost" onClick={() => h.onToast("Attached to incident record", { action: "Attached conversation to incident", result: "Allowed" })}>
          Attach to incident
        </CardButton>
        <CardButton kind="ghost" onClick={() => h.onToast("Posted to #payments-platform", { action: "Exported conversation to Slack", result: "Allowed" })}>
          Send to Slack
        </CardButton>
      </CardActions>
    </CardFrame>
  );
}

export function HealthCard({ h }: { h: CardHandlers }) {
  const open = openIncidentIds();
  return (
    <CardFrame eyebrow="Platform health" tag={<StatusTag label={`${open.length} open`} tone="warn" />}>
      <CardTitle>Your tenant · Production</CardTitle>
      <BulletList
        items={open
          .map((id) => {
            const i = INCIDENTS[id];
            return `${i.id} · ${i.title} · ${i.priority} (${i.service})`;
          })
          .concat(["Change freeze — inactive"])}
      />
      <CardActions>
        <CardButton kind="ghost" onClick={() => h.onToast("Opening Incident Library")}>View incidents →</CardButton>
      </CardActions>
    </CardFrame>
  );
}

export function RulesCard({ h }: { h: CardHandlers }) {
  return (
    <CardFrame eyebrow="Operational rules · active">
      <BulletList
        items={[
          "Emergency Approval — privileged actions",
          "Executive Notification — P0 / P1",
          "Deployment Freeze — currently inactive",
          "Change Validation — all production changes",
          "Secrets Policy — deny by default",
          "Major Incident — auto war room",
        ]}
      />
      <CardActions>
        <CardButton kind="ghost" onClick={() => h.onToast("Opening Operational Rules")}>Open Operational Rules →</CardButton>
      </CardActions>
    </CardFrame>
  );
}

export function RestartPreviewCard({ target, h }: { target: string; h: CardHandlers }) {
  return (
    <CardFrame eyebrow="Command · Restart" tag={<StatusTag label="Approval required" tone="warn" />}>
      <CardTitle>{target}</CardTitle>
      <KVRows rows={[["Estimated impact", "~12s connection drain"], ["Operational rule", "Requires Change Validation"]]} />
      <CardActions>
        <CardButton
          onClick={() =>
            h.onAck("Change Validation CV-0442 created for the restart. Routed to the service owner for approval.", {
              action: "Opened Change Validation (restart)",
              result: "Allowed",
            })
          }
        >
          Open approval
        </CardButton>
        <CardButton kind="ghost" onClick={() => h.onAck("Restart held.")}>Not now</CardButton>
      </CardActions>
    </CardFrame>
  );
}

// ── clarify flows ─────────────────────────────────────────────────────

export function EntityPickCard({ entityType, onPick }: { entityType: "incident" | "service"; onPick: (id: string, label: string) => void }) {
  const options =
    entityType === "incident"
      ? openIncidentIds().map((id) => ({ id, label: `${INCIDENTS[id].id} · ${INCIDENTS[id].title}`, meta: INCIDENTS[id].priority }))
      : Object.keys(SERVICES).map((n) => ({ id: n, label: n, meta: SERVICES[n].health }));
  return (
    <div className="my-3 max-w-md rounded-xl bg-white p-3 shadow-sm shadow-light dark:bg-zinc-900/40">
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onPick(o.id, o.label)}
            className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-[12.5px] text-black transition-colors hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-200 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
          >
            {o.label}
            <span className="ml-1.5 font-mono text-[10px] text-black dark:text-zinc-500">{o.meta}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function RestartClarifyCard({ target, onConfirm }: { target: string; onConfirm: (env: string, cluster: string) => void }) {
  const [env, setEnv] = useState<string | null>(null);
  return (
    <div className="my-3 max-w-md rounded-xl bg-white p-4 shadow-sm shadow-light dark:bg-zinc-900/40">
      <p className="mb-3 text-[13.5px] text-black dark:text-zinc-200">
        Restart <b>{target}</b>. Before I proceed —
      </p>
      <div className="mb-3">
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-black dark:text-zinc-500">Which environment?</div>
        <div className="flex flex-wrap gap-2">
          {["Production", "Staging", "Development"].map((o) => (
            <button
              key={o}
              onClick={() => setEnv(o)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[12.5px] transition-colors",
                env === o
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "border-zinc-300 bg-white text-black hover:border-emerald-400 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-200",
              )}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-black dark:text-zinc-500">Which cluster?</div>
        <div className="flex flex-wrap gap-2">
          {["Payment Cluster", "Checkout Cluster", "Entire Platform"].map((o) => (
            <button
              key={o}
              disabled={!env}
              onClick={() => env && onConfirm(env, o)}
              className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-[12.5px] text-black transition-colors hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-200"
            >
              {o}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
