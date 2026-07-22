"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  ReactNode,
} from "react";
import {
  AlertTriangle,
  Users,
  Activity,
  Clock,
  Calendar,
  RefreshCw,
  Zap,
  Shield,
  FileText,
  Trash2,
  GripVertical,
  Info,
  Plus,
  ChevronDown,
  Copy,
  Play,
  Check,
  X,
  Ban,
  Power,
  ArrowDown,
  VolumeX,
  Send,
  BookOpen,
  Pencil,
  Upload,
} from "lucide-react";
import { RuleLibraryModal, type LibraryRule } from "./RuleLibraryModal";
import { AddGuardPanel } from "./AddGuardPanel";
import Button from "@/components/ui/Button1";
import Modal from "@/components/ui/Modal";
import { ActionKey, FieldDef, FieldKey } from "./type";
import { ACT_GROUPS, ACTIONS, COND_GROUPS, FIELDS, VT } from "./rule-config";
import { useFetch } from "@/hooks/useFetch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { endpoint } from "@/lib/api/endpoint";
import { querykeys } from "@/lib/constant";

// ─── TYPES ───────────────────────────────────────────────────────────────────

type MatchType = "all" | "any" | "none";
type Connector = "AND" | "OR" | "NOT";
type RuleStatus = "enabled" | "draft" | "disabled";
type GuardMatch = "any" | "all";
type ControlPath =
  | "win.min"
  | "win.scope"
  | "max.count"
  | "max.per"
  | "retry"
  | "conc"
  | "approval"
  | "timeout";
type ScheduleMode = "always" | "at";
type RepeatOption = "Once" | "Daily" | "Weekly" | "Monthly";
type ScopeOption = "incident" | "service" | "service+priority";
type MaxPerOption = "hour" | "day" | "incident";
type RetryOption = "none" | "once" | "3x" | "5x";
type BtnVariant = "default" | "primary" | "ghost" | "danger" | "good";
type BtnSize = "sm" | "md";
type DropKey = "match" | "cond" | "action" | "guard" | null;

interface Condition {
  id: string;
  kind: "cond";
  connector: Connector;
  field: FieldKey;
  op: string;
  value: string;
  days: string[];
  t1: string;
  t2: string;
}
interface ConditionGroup {
  id: string;
  kind: "group";
  connector: Connector;
  matchType: MatchType;
  children: Condition[];
}
type AnyCondition = Condition | ConditionGroup;

interface RuleAction {
  id: string;
  key: ActionKey;
  detail: string;
}

interface GuardValDef {
  def: number;
  min: number;
  max: number;
  unit: string;
  pre: string;
  suf: string;
}
interface GuardItem {
  key: string;
  label: string;
  use: string;
  val?: GuardValDef;
  intel?: boolean;
}
interface GuardCatalogGroup {
  sec: string;
  items: GuardItem[];
}
interface Guard {
  id: string;
  key: string;
  value?: number;
}

interface ControlsState {
  window: { minutes: number; scope: ScopeOption };
  maxExecutions: { count: number; per: MaxPerOption };
  retry: RetryOption;
  concurrency: number;
  approval: string;
  timeout: number;
}
interface ScheduleState {
  mode: ScheduleMode;
  date: string;
  time: string;
  repeat: RepeatOption;
}
interface ToastItem {
  id: number;
  msg: string;
  kind: "good" | "info" | "error";
}
interface DropdownItem {
  type?: "sep" | "label";
  label?: string;
  onClick?: () => void;
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const GUARD_CATALOG: GuardCatalogGroup[] = [
  {
    sec: "HUMAN RESPONSE",
    items: [
      {
        key: "ack",
        label: "Incident acknowledged",
        use: "A human already picked it up.",
      },
      {
        key: "responderActive",
        label: "Responder active",
        use: "An engineer is already investigating.",
        val: {
          def: 5,
          min: 1,
          max: 1440,
          unit: "min",
          pre: "within last",
          suf: "min",
        },
      },
      {
        key: "ownerAssigned",
        label: "Owner assigned",
        use: "Don't route the incident again.",
      },
      {
        key: "teamAssigned",
        label: "Owning team assigned",
        use: "Team ownership is established.",
      },
      {
        key: "icAssigned",
        label: "Incident commander assigned",
        use: "Leadership is handling the incident.",
      },
    ],
  },
  {
    sec: "INCIDENT STATE",
    items: [
      {
        key: "warRoomExists",
        label: "War room already exists",
        use: "Prevent duplicate war rooms.",
      },
      {
        key: "playbookAttached",
        label: "Playbook already attached",
        use: "Prevent duplicate playbook runs.",
      },
      {
        key: "linkedToParent",
        label: "Linked to a parent incident",
        use: "Avoid duplicate investigations.",
      },
      {
        key: "statusChanged",
        label: "Status is no longer Open",
        use: "Investigation already started.",
      },
      {
        key: "approvalGranted",
        label: "Approval already granted",
        use: "Avoid duplicate approval requests.",
      },
    ],
  },
  {
    sec: "SYSTEM & SIGNAL",
    items: [
      {
        key: "automationRunning",
        label: "Another automation running",
        use: "Prevent automation collisions.",
      },
      {
        key: "similarActive",
        label: "Similar incident active",
        use: "Avoid duplicate incident creation.",
        val: {
          def: 90,
          min: 1,
          max: 100,
          unit: "%",
          pre: "similarity >",
          suf: "%",
        },
      },
      {
        key: "serviceHealthy",
        label: "Service is healthy",
        use: "Incident self-resolved.",
      },
      {
        key: "signalCleared",
        label: "Triggering signal cleared",
        use: "The metric spike disappeared.",
      },
      {
        key: "inChangeWindow",
        label: "Within approved change window",
        use: "Disruption is expected.",
      },
    ],
  },
  {
    sec: "OVERRIDE",
    items: [
      {
        key: "execOverride",
        label: "Executive override enabled",
        use: "Leadership intentionally paused automation.",
      },
    ],
  },
  {
    sec: "INTELLIGENT · EZRA",
    items: [
      {
        key: "opConfidence",
        label: "Humans are already in control",
        use: "Ezra weighs war-room activity, responders, fresh findings, timeline updates and a drafted resolution.",
        val: {
          def: 80,
          min: 1,
          max: 100,
          unit: "%",
          pre: "confidence >",
          suf: "%",
        },
        intel: true,
      },
    ],
  },
];

const GUARD_FLAT: Record<string, GuardItem> = {};
GUARD_CATALOG.forEach((g) =>
  g.items.forEach((it) => {
    GUARD_FLAT[it.key] = it;
  }),
);

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

let _uid = 1;
const nid = (): string => "n" + _uid++;

function defaultVal(f: FieldDef): string {
  switch (f.val.type) {
    case VT.PRIORITY:
      return "P1";
    case VT.SELECT:
      return (f.val as { type: "select"; options: string[] }).options[0] ?? "";
    case VT.NUM:
      return "";
    case VT.DURATION:
      return "15 minutes";
    case VT.BOOL:
      return (f.val as { type: "bool"; fixed?: boolean }).fixed ? "" : "Yes";
    default:
      return "";
  }
}

function mkCondition(
  field: FieldKey,
  over: Partial<Condition> = {},
): Condition {
  const f = FIELDS[field];
  return {
    id: nid(),
    kind: "cond",
    connector: "AND",
    field,
    op: f.ops[0],
    value: defaultVal(f),
    days: [],
    t1: "09:00",
    t2: "18:00",
    ...over,
  };
}

// ─── SEED STATE ──────────────────────────────────────────────────────────────

const SEED_CONDITIONS: Condition[] = [
  mkCondition("environment", { op: "equals", value: "Production" }),
  mkCondition("serviceTier", {
    connector: "AND",
    op: "is any of",
    value: "Tier-1",
  }),
  mkCondition("ezraConfidence", {
    connector: "AND",
    op: "less than",
    value: "90",
  }),
  mkCondition("remediationRisk", {
    connector: "AND",
    op: "equals",
    value: "High",
  }),
  mkCondition("blastRadius", {
    connector: "OR",
    op: "greater than",
    value: "10",
  }),
];

const SEED_ACTIONS: RuleAction[] = [
  { id: nid(), key: "disableAutonomy", detail: ACTIONS.disableAutonomy.detail },
  { id: nid(), key: "secondAgent", detail: ACTIONS.secondAgent.detail },
  { id: nid(), key: "requireApproval", detail: ACTIONS.requireApproval.detail },
  {
    id: nid(),
    key: "sendNotification",
    detail: ACTIONS.sendNotification.detail,
  },
];

const SEED_GUARDS: Guard[] = [
  { id: nid(), key: "ack" },
  { id: nid(), key: "responderActive", value: 5 },
  { id: nid(), key: "opConfidence", value: 80 },
];

// ─── RULE AS CODE ────────────────────────────────────────────────────────────

function slug(s: string): string {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fmtBytes(n: number): string {
  return n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`;
}

const JSON_TOKEN_RE =
  /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g;

/* tokenize JSON text into colored spans (keys / strings / numbers / booleans / null) */
function highlightJson(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  JSON_TOKEN_RE.lastIndex = 0;
  while ((match = JSON_TOKEN_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const m = match[0];
    let cls = "text-[#f2b779]"; // number
    if (m.startsWith('"')) cls = /:$/.test(m) ? "text-[#93b4ff]" : "text-[#7ee0b8]";
    else if (m === "true" || m === "false") cls = "text-[#84c5ff]";
    else if (m === "null") cls = "text-[#6b7280]";
    nodes.push(
      <span key={key++} className={cls}>
        {m}
      </span>,
    );
    lastIndex = match.index + m.length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

/* reusable, self-documenting starter a user can edit then Apply */
const REUSABLE_TEMPLATE = {
  $schema: "scrubbe.operational-rule/v1",
  _about:
    "Reusable rule-as-code template. Edit the values below, then click Apply. Keys starting with _ are helper notes only — Scrubbe ignores them on Apply.",
  name: "New governance rule",
  description:
    "Describe what this rule governs and when Scrubbe should act, require approval, or hand off to a human.",
  status: "draft",
  schedule: { mode: "always", date: "", time: "", repeat: "Once" },
  matchType: "all",
  conditions: [
    {
      kind: "cond",
      connector: "AND",
      field: "environment",
      op: "equals",
      value: "Production",
    },
    {
      kind: "cond",
      connector: "AND",
      field: "remediationRisk",
      op: "equals",
      value: "High",
    },
  ],
  actions: [
    {
      key: "requireApproval",
      detail:
        ACTIONS.requireApproval?.detail ?? "Hold actions for human approval",
    },
    {
      key: "sendNotification",
      detail: ACTIONS.sendNotification?.detail ?? "Notify the on-call team",
    },
  ],
  guardMatch: "any",
  guards: [{ key: "ack" }],
  controls: {
    window: { minutes: 30, scope: "incident" },
    maxExecutions: { count: 10, per: "hour" },
    retry: "once",
    concurrency: 1,
    approval: "None",
    timeout: 15,
  },
  _fields: `Condition fields — ${Object.keys(FIELDS).join(", ")}.`,
  _actions: `Action keys — ${Object.keys(ACTIONS).join(", ")}.`,
};

function isConnector(v: unknown): v is Connector {
  return v === "AND" || v === "OR" || v === "NOT";
}

/* normalize hand-authored / round-tripped JSON into a valid Condition */
function reviveCondition(c: any): Condition {
  const rawField = c?.field;
  const field: FieldKey =
    typeof rawField === "string" && rawField in FIELDS
      ? (rawField as FieldKey)
      : "priority";
  const f = FIELDS[field];
  return {
    id: nid(),
    kind: "cond",
    connector: isConnector(c?.connector) ? c.connector : "AND",
    field,
    op: f.ops.includes(c?.op) ? c.op : f.ops[0],
    value: c?.value !== undefined ? c.value : defaultVal(f),
    days: Array.isArray(c?.days) ? c.days : [],
    t1: typeof c?.t1 === "string" ? c.t1 : "09:00",
    t2: typeof c?.t2 === "string" ? c.t2 : "18:00",
  };
}
function reviveAnyCondition(c: any): AnyCondition {
  if (c && c.kind === "group") {
    return {
      id: nid(),
      kind: "group",
      connector: isConnector(c.connector) ? c.connector : "AND",
      matchType: c.matchType === "all" ? "all" : "any",
      children: Array.isArray(c.children)
        ? c.children.map(reviveCondition)
        : [],
    };
  }
  return reviveCondition(c);
}

// ─── BTN WRAPPER ─────────────────────────────────────────────────────────────

const VARIANT_CLS: Record<BtnVariant, string> = {
  default:
    "!bg-white !text-zinc-900 !border !border-zinc-300 shadow-sm hover:!bg-zinc-50",
  primary: "",
  ghost:
    "!bg-transparent !border-transparent !text-indigo-500 !shadow-none hover:!bg-indigo-50",
  danger: "!bg-white !text-red-500 !border !border-zinc-300 hover:!bg-red-50",
  good: "!bg-white !text-emerald-600 !border !border-zinc-300 hover:!bg-emerald-50",
};

interface BtnProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  size?: BtnSize;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}

function Btn({
  children,
  onClick,
  variant = "default",
  size = "md",
  type = "button",
  disabled,
  className = "",
}: BtnProps): React.JSX.Element {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      size="sm"
      className={`inline-flex items-center gap-2 font-semibold rounded-sm whitespace-nowrap transition-colors ${VARIANT_CLS[variant]} ${className}`}
    >
      {children}
    </Button>
  );
}

// ─── SHARED INPUT CLASS ───────────────────────────────────────────────────────

const inputCls =
  "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-900 bg-white font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors";
const selectCls = `${inputCls} cursor-pointer`;

// ─── TOAST ───────────────────────────────────────────────────────────────────

function Toast({ toasts }: { toasts: ToastItem[] }): React.JSX.Element {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2.5 items-center pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-2.5 bg-[#1d2027] text-white px-4 py-3 rounded-xl text-[13.5px] font-medium min-w-[260px] shadow-2xl"
        >
          {t.kind === "good" ? (
            <Check size={17} className="text-emerald-400" />
          ) : (
            <Info size={17} className="text-blue-400" />
          )}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── STATUS BADGE ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RuleStatus }): React.JSX.Element {
  const cls: Record<RuleStatus, string> = {
    enabled: "bg-indigo-50 text-indigo-600",
    draft: "bg-amber-50 text-amber-700",
    disabled: "bg-zinc-100 text-zinc-500",
  };
  const labels: Record<RuleStatus, string> = {
    enabled: "Enabled",
    draft: "Draft",
    disabled: "Disabled",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cls[status]}`}
    >
      <Shield size={13} /> {labels[status]}
    </span>
  );
}

// ─── CONNECTOR CHIP ──────────────────────────────────────────────────────────

function ConnectorChip({
  value,
  onChange,
}: {
  value: Connector;
  onChange: (v: Connector) => void;
}): React.JSX.Element {
  const cls: Record<Connector, string> = {
    AND: "bg-slate-100 text-slate-500 border-slate-200",
    OR: "bg-orange-50 text-orange-700 border-orange-200",
    NOT: "bg-red-50 text-red-600 border-red-200",
  };
  const seq: Connector[] = ["AND", "OR", "NOT"];
  return (
    <button
      type="button"
      onClick={() => onChange(seq[(seq.indexOf(value) + 1) % 3])}
      className={`inline-flex items-center gap-1 text-[11px] font-bold tracking-wider px-2 py-1 rounded-md border min-w-[48px] cursor-pointer ${cls[value]}`}
    >
      {value} <ChevronDown size={11} />
    </button>
  );
}

// ─── VALUE CELL ──────────────────────────────────────────────────────────────

interface ValueCellProps {
  cond: Condition;
  onChange: (patch: Partial<Condition>) => void;
}

function ValueCell({ cond, onChange }: ValueCellProps): React.JSX.Element {
  const f = FIELDS[cond.field];
  const t = f.val.type;

  if (t === VT.PRIORITY)
    return (
      <select
        value={cond.value}
        onChange={(e) => onChange({ value: e.target.value })}
        className={selectCls}
      >
        {["P0", "P1", "P2", "P3"].map((p) => (
          <option key={p}>{p}</option>
        ))}
      </select>
    );
  if (t === VT.SELECT)
    return (
      <select
        value={cond.value}
        onChange={(e) => onChange({ value: e.target.value })}
        className={selectCls}
      >
        {(f.val as { type: "select"; options: string[] }).options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    );
  if (t === VT.DURATION)
    return (
      <select
        value={cond.value}
        onChange={(e) => onChange({ value: e.target.value })}
        className={selectCls}
      >
        {[
          "5 minutes",
          "10 minutes",
          "15 minutes",
          "30 minutes",
          "60 minutes",
        ].map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    );
  if (t === VT.BOOL) {
    const bv = f.val as { type: "bool"; fixed?: boolean };
    if (bv.fixed)
      return (
        <input
          readOnly
          value={cond.op === "exists" ? "Yes" : "No"}
          className={`${inputCls} opacity-60 cursor-default`}
        />
      );
    return (
      <select
        value={cond.value}
        onChange={(e) => onChange({ value: e.target.value })}
        className={selectCls}
      >
        <option>Yes</option>
        <option>No</option>
      </select>
    );
  }
  if (t === VT.DAYS)
    return (
      <div className="flex flex-wrap gap-1.5 items-center border border-zinc-300 rounded-lg px-2 py-1.5 min-h-[42px] bg-white">
        {DAYS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() =>
              onChange({
                days: cond.days.includes(d)
                  ? cond.days.filter((x) => x !== d)
                  : [...cond.days, d],
              })
            }
            className={`text-[11.5px] font-semibold px-2 py-1 rounded-md border cursor-pointer transition-colors ${cond.days.includes(d) ? "bg-indigo-50 text-indigo-600 border-indigo-200" : "bg-zinc-50 text-zinc-400 border-transparent"}`}
          >
            {d}
          </button>
        ))}
      </div>
    );
  if (t === VT.TIMERANGE)
    return (
      <div className="flex items-center gap-2 border border-zinc-300 rounded-lg px-3 py-1.5 min-h-[42px] bg-white">
        <input
          type="time"
          value={cond.t1}
          onChange={(e) => onChange({ t1: e.target.value })}
          className="border-none bg-transparent font-semibold text-sm outline-none"
        />
        <span className="text-zinc-400">–</span>
        <input
          type="time"
          value={cond.t2}
          onChange={(e) => onChange({ t2: e.target.value })}
          className="border-none bg-transparent font-semibold text-sm outline-none"
        />
      </div>
    );
  const nv = f.val as { type: "num"; unit?: string; placeholder?: string };
  return (
    <input
      type={t === VT.NUM ? "number" : "text"}
      value={cond.value}
      placeholder={nv.placeholder ?? "Enter value"}
      onChange={(e) => onChange({ value: e.target.value })}
      className={inputCls}
    />
  );
}

// ─── CONDITION ROW ───────────────────────────────────────────────────────────

interface ConditionRowProps {
  cond: Condition;
  leading: ReactNode;
  onUpdate: (p: Partial<Condition>) => void;
  onRemove: () => void;
}

function ConditionRow({
  cond,
  leading,
  onUpdate,
  onRemove,
}: ConditionRowProps): React.JSX.Element {
  const f = FIELDS[cond.field];
  return (
    <div className="flex items-start gap-2.5 mb-2.5">
      <div className="w-14 flex justify-center pt-2.5 shrink-0">{leading}</div>
      <div
        className="flex-1 grid gap-2"
        style={{
          gridTemplateColumns:
            "minmax(150px,1.05fr) minmax(120px,.78fr) minmax(150px,1.25fr) auto",
        }}
      >
        <select
          value={cond.field}
          onChange={(e) => {
            const k = e.target.value as FieldKey;
            const nf = FIELDS[k];
            onUpdate({
              field: k,
              op: nf.ops[0],
              value: defaultVal(nf),
              days: [],
              t1: "09:00",
              t2: "18:00",
            });
          }}
          className={selectCls}
        >
          {COND_GROUPS.map((g) => (
            <optgroup key={g.sec} label={g.sec}>
              {g.fields.map((k) => (
                <option key={k} value={k}>
                  {FIELDS[k].label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <select
          value={cond.op}
          onChange={(e) => onUpdate({ op: e.target.value })}
          className={selectCls}
        >
          {f.ops.map((o: any) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <ValueCell cond={cond} onChange={onUpdate} />
        <div className="flex items-center gap-0.5 pt-0.5">
          <button
            type="button"
            onClick={onRemove}
            title="Remove"
            className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── GROUP ROW ───────────────────────────────────────────────────────────────

interface GroupRowProps {
  group: ConditionGroup;
  leading: ReactNode;
  onUpdateGroup: (patch: Partial<ConditionGroup>) => void;
  onRemoveGroup: () => void;
  onAddChild: () => void;
  onUpdateChild: (childId: string, patch: Partial<Condition>) => void;
  onRemoveChild: (childId: string) => void;
}

function GroupRow({
  group,
  leading,
  onUpdateGroup,
  onRemoveGroup,
  onAddChild,
  onUpdateChild,
  onRemoveChild,
}: GroupRowProps): React.JSX.Element {
  return (
    <div className="flex items-start gap-2.5 mb-2.5">
      <div className="w-14 flex justify-center pt-2.5 shrink-0">{leading}</div>
      <div className="flex-1 border border-dashed border-indigo-200 bg-indigo-50/40 rounded-2xl p-3.5 pb-2.5">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5 text-[12.5px] font-semibold text-zinc-600">
            <span className="text-[10.5px] font-bold tracking-wider text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-md">
              GROUP
            </span>
            <button
              type="button"
              onClick={() =>
                onUpdateGroup({
                  matchType: group.matchType === "all" ? "any" : "all",
                })
              }
              className="inline-flex items-center gap-1 text-zinc-600 cursor-pointer"
            >
              Match{" "}
              <span className="text-indigo-500">
                {group.matchType === "all" ? "all" : "any"}
              </span>{" "}
              <ChevronDown size={12} />
            </button>
          </div>
          <button
            type="button"
            onClick={onRemoveGroup}
            title="Remove group"
            className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {(group.children ?? []).map((cc, j) => (
          <ConditionRow
            key={cc.id}
            cond={cc}
            leading={
              j > 0 ? (
                <ConnectorChip
                  value={cc.connector}
                  onChange={(v) => onUpdateChild(cc.id, { connector: v })}
                />
              ) : null
            }
            onUpdate={(p) => onUpdateChild(cc.id, p)}
            onRemove={() => onRemoveChild(cc.id)}
          />
        ))}

        <Btn size="sm" variant="ghost" onClick={onAddChild}>
          <Plus size={14} /> Add to group
        </Btn>
      </div>
    </div>
  );
}

// ─── ACTION ROW ──────────────────────────────────────────────────────────────

function ActionRow({
  action,
  onUpdateDetail,
  onRemove,
}: {
  action: RuleAction;
  onUpdateDetail: (d: string) => void;
  onRemove: () => void;
}): React.JSX.Element {
  const meta = ACTIONS[action.key];
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 border border-zinc-200 rounded-xl bg-white mb-2">
      <div className="text-zinc-300 cursor-grab">
        <GripVertical size={16} />
      </div>

      <div className="w-48 font-semibold text-[13.5px] text-zinc-900 shrink-0 text-nowrap">
        {meta.name}
      </div>
      <div className="flex-1">
        <input
          value={action.detail}
          onChange={(e) => onUpdateDetail(e.target.value)}
          className="w-full border border-transparent rounded-lg px-2 py-1.5 text-sm text-zinc-500 bg-transparent outline-none focus:border-indigo-400 focus:bg-white transition-colors"
          onFocus={(e) => {
            e.currentTarget.className =
              "w-full border border-indigo-400 rounded-lg px-2 py-1.5 text-sm text-zinc-800 bg-white outline-none transition-colors";
          }}
          onBlur={(e) => {
            e.currentTarget.className =
              "w-full border border-transparent rounded-lg px-2 py-1.5 text-sm text-zinc-500 bg-transparent outline-none focus:border-indigo-400 focus:bg-white transition-colors";
          }}
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ─── GUARD ROW ───────────────────────────────────────────────────────────────

function GuardRow({
  guard,
  onUpdateVal,
  onRemove,
}: {
  guard: Guard;
  onUpdateVal: (v: string) => void;
  onRemove: () => void;
}): React.JSX.Element | null {
  const m = GUARD_FLAT[guard.key];
  if (!m) return null;
  return (
    <div
      className={`flex items-center gap-3 border rounded-xl px-3 py-2.5 mb-2 border-zinc-200 bg-white`}
    >
      <span className="flex-1 text-[13.5px] font-semibold text-zinc-900">
        {m.label}
      </span>
      {m.val && (
        <span className="inline-flex items-center gap-1.5 text-[12.5px] text-zinc-500 whitespace-nowrap">
          {m.val.pre}
          <input
            type="number"
            min={m.val.min}
            max={m.val.max}
            value={guard.value ?? m.val.def}
            onChange={(e) => onUpdateVal(e.target.value)}
            className="w-14 border border-zinc-300 rounded-md px-2 py-1 text-center font-mono font-semibold text-sm outline-none focus:border-indigo-500 bg-white"
          />
          {m.val.suf}
        </span>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="w-6 h-6 rounded-md flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ─── EXECUTION CONTROLS ──────────────────────────────────────────────────────

interface ExecControlsProps {
  controls: ControlsState;
  onChange: (path: ControlPath, value: string) => void;
}

function ExecControls({
  controls,
  onChange,
}: ExecControlsProps): React.JSX.Element {
  const SCOPES: [ScopeOption, string][] = [
    ["incident", "same incident"],
    ["service", "same service"],
    ["service+priority", "same service + priority"],
  ];
  const MAX_PER: [MaxPerOption, string][] = [
    ["hour", "/ hour"],
    ["day", "/ day"],
    ["incident", "/ incident"],
  ];
  const RETRIES: [RetryOption, string][] = [
    ["none", "No retry"],
    ["once", "Retry once"],
    ["3x", "Retry 3× (backoff)"],
    ["5x", "Retry 5× (backoff)"],
  ];
  const APPROVALS = [
    "None",
    "Auto-approved",
    "Manager approval",
    "Multi-stage approval",
    "CAB approval",
    "Emergency CAB (eCAB)",
    "Executive approval",
  ];

  const Cell = ({
    icon,
    title,
    help,
    children,
  }: {
    icon: ReactNode;
    title: string;
    help: string;
    children: ReactNode;
  }) => (
    <div className="bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-bold text-zinc-800 mb-2.5">
        {title}
      </div>
      {children}
      <p className="text-[11px] text-zinc-400 mt-2 leading-snug">{help}</p>
    </div>
  );

  return (
    <div className="mt-5 border border-zinc-200 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-200">
        <div>
          <div className="font-bold text-sm text-zinc-900">
            Execution controls
          </div>
          <div className="text-[11.5px] text-zinc-400">
            The run envelope applied once the rule clears its guards.
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-px bg-zinc-200">
        <Cell
          icon={<VolumeX size={13} className="text-zinc-400" />}
          title="Suppression window"
          help="Don't re-run for the same scope inside this window."
        >
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="number"
              min="1"
              max="1440"
              value={controls.window.minutes}
              onChange={(e) => onChange("win.min", e.target.value)}
              className="w-14 text-center border border-zinc-300 rounded-md px-2 py-1.5 text-sm font-semibold outline-none focus:border-indigo-500"
            />
            <span className="text-xs text-zinc-400">min ·</span>
            <select
              value={controls.window.scope}
              onChange={(e) => onChange("win.scope", e.target.value)}
              className={`${selectCls} flex-1`}
            >
              {SCOPES.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </Cell>
        <Cell
          icon={<Zap size={13} className="text-zinc-400" />}
          title="Maximum executions"
          help="Cap how often this rule can fire."
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="999"
              value={controls.maxExecutions.count}
              onChange={(e) => onChange("max.count", e.target.value)}
              className="w-14 text-center border border-zinc-300 rounded-md px-2 py-1.5 text-sm font-semibold outline-none focus:border-indigo-500"
            />
            <select
              value={controls.maxExecutions.per}
              onChange={(e) => onChange("max.per", e.target.value)}
              className={`${selectCls} flex-1`}
            >
              {MAX_PER.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </Cell>
        <Cell
          icon={<RefreshCw size={13} className="text-zinc-400" />}
          title="Retry policy"
          help="What happens when an action fails."
        >
          <select
            value={controls.retry}
            onChange={(e) => onChange("retry", e.target.value)}
            className={selectCls}
          >
            {RETRIES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Cell>
        <Cell
          icon={<Users size={13} className="text-zinc-400" />}
          title="Concurrency limit"
          help="Parallel runs allowed."
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="99"
              value={controls.concurrency}
              onChange={(e) => onChange("conc", e.target.value)}
              className="w-14 text-center border border-zinc-300 rounded-md px-2 py-1.5 text-sm font-semibold outline-none focus:border-indigo-500"
            />
            <span className="text-xs text-zinc-400">at a time</span>
          </div>
        </Cell>
        <Cell
          icon={<Check size={13} className="text-zinc-400" />}
          title="Approval requirement"
          help="Gate the actions behind sign-off before they run."
        >
          <select
            value={controls.approval}
            onChange={(e) => onChange("approval", e.target.value)}
            className={selectCls}
          >
            {APPROVALS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </Cell>
        <Cell
          icon={<Clock size={13} className="text-zinc-400" />}
          title="Execution timeout"
          help="Abort the run if it exceeds this."
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="1440"
              value={controls.timeout}
              onChange={(e) => onChange("timeout", e.target.value)}
              className="w-14 text-center border border-zinc-300 rounded-md px-2 py-1.5 text-sm font-semibold outline-none focus:border-indigo-500"
            />
            <span className="text-xs text-zinc-400">min</span>
          </div>
        </Cell>
      </div>
    </div>
  );
}

// ─── RULE SUMMARY ─────────────────────────────────────────────────────────────

function condPhrase(c: Condition): string {
  const f = FIELDS[c.field];
  if (f.val.type === VT.DAYS)
    return `${f.label} ${c.op} ${c.days.length ? c.days.join(", ") : "—"}`;
  if (f.val.type === VT.TIMERANGE) return `${f.label} ${c.op} ${c.t1}–${c.t2}`;
  if (
    f.val.type === VT.BOOL &&
    (f.val as { type: "bool"; fixed?: boolean }).fixed
  )
    return `${f.label} ${c.op}`;
  const v = c.value === "" || c.value == null ? "—" : String(c.value);
  return `${f.label} ${c.op} ${v}`;
}

interface RuleSummaryProps {
  conditions: AnyCondition[];
  actions: RuleAction[];
  matchType: MatchType;
  guards: Guard[];
  guardMatch: GuardMatch;
  controls: ControlsState;
  schedule: ScheduleState;
}

function RuleSummary({
  conditions,
  actions,
  matchType,
  guards,
  guardMatch,
  controls,
  schedule,
}: RuleSummaryProps): React.JSX.Element {
  const parts = conditions.map((c, i) => {
    const phrase =
      c.kind === "group"
        ? `(${c.children.map((cc) => condPhrase(cc)).join(c.matchType === "any" ? " OR " : " AND ")})`
        : condPhrase(c);
    return i > 0 ? `${c.connector} ${phrase}` : phrase;
  });
  const whenText =
    schedule.mode === "at" && schedule.date
      ? `Activates ${schedule.date}${schedule.time ? ` at ${schedule.time}` : ""}.`
      : "Evaluated continuously, in real time.";
  const guardLabels = guards
    .map((g) => GUARD_FLAT[g.key]?.label?.toLowerCase())
    .filter(Boolean);
  const unlessText = guardLabels.length
    ? `Skip when ${guardMatch} of these are active: ${guardLabels.slice(0, 3).join(", ")}${guardLabels.length > 3 ? ` +${guardLabels.length - 3} more` : ""}.`
    : "No suppression guards — actions always run when conditions match.";
  const ctrlText = `Re-runs held ${controls.window.minutes} min; max ${controls.maxExecutions.count}/${controls.maxExecutions.per}; timeout ${controls.timeout} min${controls.approval !== "None" ? `; ${controls.approval.toLowerCase()} required` : ""}.`;

  const Row = ({
    label,
    bg,
    text,
  }: {
    label: string;
    bg: string;
    text: string;
  }) => (
    <div className="flex gap-3 mb-3.5">
      <span
        className={`inline-block h-fit min-w-12 text-xs text-center font-black tracking-wider text-white px-2 py-0.5 rounded-md shrink-0 mt-0.5 ${bg}`}
      >
        {label}
      </span>
      <span className="text-[13px] leading-relaxed text-zinc-800">{text}</span>
    </div>
  );
  return (
    <div>
      <Row label="WHEN" bg="bg-violet-500" text={whenText} />
      <Row
        label="IF"
        bg="bg-indigo-500"
        text={parts.join(" ") || "No conditions defined."}
      />
      <Row
        label="THEN"
        bg="bg-emerald-500"
        text={
          actions.map((a) => ACTIONS[a.key].name).join(", ") ||
          "No actions defined."
        }
      />
      <Row label="UNLESS" bg="bg-teal-600" text={unlessText} />
      <Row label="RUN" bg="bg-slate-500" text={ctrlText} />
    </div>
  );
}

// ─── TEST PANEL ──────────────────────────────────────────────────────────────

type TestCtx = Record<string, string | number | boolean>;
interface TestResult {
  triggered: boolean;
  ctx: TestCtx;
  actNames: string[];
}

function TestPanel({
  conditions,
  actions,
  matchType,
}: {
  conditions: AnyCondition[];
  actions: RuleAction[];
  matchType: MatchType;
}): React.JSX.Element {
  const [result, setResult] = useState<TestResult | { error: string } | null>(
    null,
  );

  const run = (): void => {
    const leaves: Condition[] = [];
    conditions.forEach((c) => {
      if (c.kind === "group") c.children.forEach((cc) => leaves.push(cc));
      else leaves.push(c);
    });
    if (!leaves.length) {
      setResult({ error: "Add at least one condition first." });
      return;
    }
    const ctx: TestCtx = {
      service: "Checkout Service",
      priority: "P1",
      environment: "Production",
      serviceTier: "Tier-1",
      ezraConfidence: 75,
      remediationRisk: "High",
      blastRadius: 15,
    };
    leaves.forEach((c) => {
      const f = FIELDS[c.field];
      if (f.val.type === VT.NUM) ctx[c.field] = parseFloat(c.value) || 0;
      else if (f.val.type === VT.SELECT || f.val.type === VT.PRIORITY)
        ctx[c.field] = c.value;
      else if (f.val.type === VT.BOOL) ctx[c.field] = c.value === "Yes";
    });
    const evalC = (c: Condition): boolean => {
      const f = FIELDS[c.field];
      const v = ctx[c.field];
      if (v === undefined) return true;
      if (f.val.type === VT.NUM) {
        const a = Number(v),
          b = Number(c.value);
        if (c.op === "greater than") return a > b;
        if (c.op === "greater or equal") return a >= b;
        if (c.op === "less than") return a < b;
        if (c.op === "less or equal") return a <= b;
        return a === b;
      }
      if (f.val.type === VT.SELECT || f.val.type === VT.PRIORITY) {
        if (c.op === "not equals") return v !== c.value;
        if (c.op === "is any of")
          return c.value.split(/\s*,\s*/).includes(String(v));
        return v === c.value;
      }
      if (f.val.type === VT.BOOL) return (v === true) === (c.value === "Yes");
      return true;
    };
    const results = conditions.map((c) =>
      c.kind === "group"
        ? c.matchType === "any"
          ? c.children.some(evalC)
          : c.children.every(evalC)
        : evalC(c),
    );
    const triggered = !results.length
      ? true
      : matchType === "any"
        ? results.some(Boolean)
        : matchType === "none"
          ? !results.some(Boolean)
          : results.every(Boolean);
    setResult({
      triggered,
      ctx,
      actNames: actions.map((a) => ACTIONS[a.key].name),
    });
  };

  return (
    <div>
      <Btn onClick={run} variant="primary" className="w-full justify-center">
        <Play size={14} fill="currentColor" /> Run test
      </Btn>
      {result && (
        <div className="mt-4 border border-zinc-200 rounded-xl p-4">
          {"error" in result ? (
            <div className="flex items-center gap-2 text-red-500 font-semibold text-[13px]">
              <Info size={15} /> {result.error}
            </div>
          ) : (
            <>
              <div
                className={`flex items-center gap-2.5 font-bold text-sm mb-3 ${result.triggered ? "text-emerald-600" : "text-red-500"}`}
              >
                {result.triggered ? <Check size={18} /> : <X size={18} />}
                {result.triggered
                  ? "Rule will trigger"
                  : "Rule will not trigger"}
              </div>
              <p className="text-xs text-zinc-400 mb-1.5">
                Simulated event values:
              </p>
              <div className="border border-zinc-100 rounded-lg overflow-hidden bg-zinc-50 mb-3">
                {Object.entries(result.ctx)
                  .slice(0, 6)
                  .map(([k, v]) => (
                    <div
                      key={k}
                      className="flex justify-between px-3 py-1.5 text-[12.5px] border-b border-zinc-100 last:border-0"
                    >
                      <span className="text-zinc-500">
                        {FIELDS[k as FieldKey]?.label ?? k}
                      </span>
                      <b className="text-zinc-800">{String(v)}</b>
                    </div>
                  ))}
              </div>
              {result.triggered && (
                <>
                  <p className="text-xs text-zinc-400 mb-1.5">
                    Actions that would run:
                  </p>
                  <ul className="space-y-1 text-[13px]">
                    {result.actNames.length ? (
                      result.actNames.map((a) => (
                        <li
                          key={a}
                          className="flex items-center gap-2 text-zinc-600"
                        >
                          <Check size={14} className="text-emerald-500" /> {a}
                        </li>
                      ))
                    ) : (
                      <li className="text-zinc-400">No actions configured</li>
                    )}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── DROPDOWN ────────────────────────────────────────────────────────────────

function Dropdown({
  items,
  onClose,
}: {
  items: DropdownItem[];
  onClose: () => void;
}): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => document.addEventListener("click", fn, true), 0);
    return () => document.removeEventListener("click", fn, true);
  }, [onClose]);
  return (
    <div
      ref={ref}
      className="absolute z-50 bg-white border border-zinc-200 rounded-xl shadow-xl p-1.5 min-w-[240px] max-h-[340px] overflow-y-auto top-[calc(100%+6px)] left-0"
    >
      {items.map((item, i) => {
        if (item.type === "sep")
          return <div key={i} className="h-px bg-zinc-100 my-1" />;
        if (item.type === "label")
          return (
            <div
              key={i}
              className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase px-2 py-1.5"
            >
              {item.label}
            </div>
          );
        return (
          <button
            key={i}
            type="button"
            onClick={() => {
              item.onClick?.();
              onClose();
            }}
            className="flex items-center w-full text-left px-2.5 py-2 rounded-lg text-[13.5px] text-zinc-800 font-medium cursor-pointer hover:bg-zinc-50 transition-colors gap-2.5"
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function OperationalRuleBuilder(): React.JSX.Element {
  const [ruleName, setRuleName] = useState<string>(
    "Production agent autonomy guardrail",
  );
  const [ruleDesc, setRuleDesc] = useState<string>(
    "Force human-in-the-loop for autonomous agents on production, tier-1 services. When Ezra's diagnostic confidence is low, remediation risk is high, or the blast radius is wide, disable autonomous execution, add an independent verification agent, and hold remediation for human approval.",
  );
  const [status, setStatus] = useState<RuleStatus>("enabled");
  const [matchType, setMatchType] = useState<MatchType>("all");
  const [conditions, setConditions] = useState<AnyCondition[]>(SEED_CONDITIONS);
  const [actions, setActions] = useState<RuleAction[]>(SEED_ACTIONS);
  const [guards, setGuards] = useState<Guard[]>(SEED_GUARDS);
  const [guardMatch, setGuardMatch] = useState<GuardMatch>("any");
  const [showLibrary, setShowLibrary] = useState<boolean>(false);
  const [showGuardPanel, setShowGuardPanel] = useState<boolean>(false);
  const [controls, setControls] = useState<ControlsState>({
    window: { minutes: 30, scope: "incident" },
    maxExecutions: { count: 10, per: "hour" },
    retry: "once",
    concurrency: 1,
    approval: "None",
    timeout: 15,
  });
  const [schedule, setSchedule] = useState<ScheduleState>({
    mode: "always",
    date: "",
    time: "",
    repeat: "Once",
  });
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [openDrop, setOpenDrop] = useState<DropKey>(null);
  const [showSched, setShowSched] = useState<boolean>(false);
  const [lastMod, setLastMod] = useState<string>("05 Jan 2026, 14:15");
  const [savedRuleId, setSavedRuleId] = useState<string | null>(null);
  const [jsonEditing, setJsonEditing] = useState<boolean>(false);
  const [jsonDraft, setJsonDraft] = useState<string>("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const codeDetailsRef = useRef<HTMLDetailsElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const { get, post, patch, remove } = useFetch();
  const queryClient = useQueryClient();

  // Load existing guardrails list
  const { data: guardrailsData } = useQuery({
    queryKey: [querykeys.PLAYBOOKS, "guardrails"],
    queryFn: () => get(endpoint.guardrails.list),
  });
  const savedRules: any[] = guardrailsData?.data?.data ?? guardrailsData?.data ?? [];

  const saveMutation = useMutation({
    mutationFn: async (isActive: boolean) => {
      const payload = {
        name: ruleName,
        description: ruleDesc,
        type: "CUSTOM",
        config: {
          ruleType: "CUSTOM",
          matchType,
          conditions: conditions.map(({ id: _, ...r }) => r),
          actions: actions.map(({ id: _, ...r }) => r),
          guards: guards.map(({ id: _, ...r }) => r),
          guardMatch,
          controls,
          schedule,
        },
        isActive,
      };
      if (savedRuleId) {
        return patch(`${endpoint.guardrails.update}/${savedRuleId}`, payload);
      }
      return post(endpoint.guardrails.create, payload);
    },
    onSuccess: (res: any, isActive: boolean) => {
      const id = res?.data?.data?.id ?? res?.data?.id;
      if (id) setSavedRuleId(id);
      queryClient.invalidateQueries({ queryKey: [querykeys.PLAYBOOKS, "guardrails"] });
      setStatus(isActive ? "enabled" : "draft");
      stamp();
      toast(isActive ? "Rule saved and enabled" : "Saved as draft");
    },
    onError: () => {
      toast("Failed to save rule", "error");
    },
  });

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove(endpoint.guardrails.delete, id),
    onSuccess: (res: any, id: string) => {
      if (!res?.success) {
        toast("Failed to delete draft", "error");
        return;
      }
      queryClient.invalidateQueries({ queryKey: [querykeys.PLAYBOOKS, "guardrails"] });
      if (savedRuleId === id) setSavedRuleId(null);
      toast("Draft deleted");
      setDeleteTarget(null);
    },
    onError: () => {
      toast("Failed to delete draft", "error");
    },
  });

  const toast = useCallback(
    (msg: string, kind: ToastItem["kind"] = "good"): void => {
      const id = Date.now();
      setToasts((t) => [...t, { id, msg, kind }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
    },
    [],
  );

  const stamp = useCallback((): void => {
    const d = new Date();
    const mo = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ][d.getMonth()];
    setLastMod(
      `${String(d.getDate()).padStart(2, "0")} ${mo} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
    );
  }, []);

  /* hydrate the whole builder from a rule-shaped object — used by rule-as-code Apply */
  const applyRuleData = useCallback(
    (d: any): void => {
      if (typeof d?.name === "string") setRuleName(d.name);
      if (typeof d?.description === "string") setRuleDesc(d.description);
      setStatus(
        ["enabled", "draft", "disabled"].includes(d?.status)
          ? d.status
          : "enabled",
      );
      setMatchType(
        ["all", "any", "none"].includes(d?.matchType) ? d.matchType : "all",
      );
      setConditions(
        Array.isArray(d?.conditions) ? d.conditions.map(reviveAnyCondition) : [],
      );
      setActions(
        Array.isArray(d?.actions)
          ? d.actions
              .filter((a: any) => a && ACTIONS[a.key as ActionKey])
              .map((a: any) => ({
                id: nid(),
                key: a.key,
                detail: a.detail || ACTIONS[a.key as ActionKey].detail,
              }))
          : [],
      );
      const seenGuards = new Set<string>();
      setGuards(
        Array.isArray(d?.guards)
          ? d.guards
              .filter((g: any) => {
                if (!g || !GUARD_FLAT[g.key] || seenGuards.has(g.key))
                  return false;
                seenGuards.add(g.key);
                return true;
              })
              .map((g: any) => {
                const m = GUARD_FLAT[g.key];
                const gg: Guard = { id: nid(), key: g.key };
                if (m.val) gg.value = typeof g.value === "number" ? g.value : m.val.def;
                return gg;
              })
          : [],
      );
      setGuardMatch(d?.guardMatch === "all" ? "all" : "any");
      if (d?.controls && typeof d.controls === "object") {
        setControls((prev) => ({
          window: {
            minutes: Number(d.controls.window?.minutes) || prev.window.minutes,
            scope: d.controls.window?.scope ?? prev.window.scope,
          },
          maxExecutions: {
            count:
              Number(d.controls.maxExecutions?.count) ||
              prev.maxExecutions.count,
            per: d.controls.maxExecutions?.per ?? prev.maxExecutions.per,
          },
          retry: d.controls.retry ?? prev.retry,
          concurrency: Number(d.controls.concurrency) || prev.concurrency,
          approval: d.controls.approval ?? prev.approval,
          timeout: Number(d.controls.timeout) || prev.timeout,
        }));
      }
      if (d?.schedule && typeof d.schedule === "object") {
        setSchedule((prev) => ({
          mode: d.schedule.mode === "at" ? "at" : "always",
          date: typeof d.schedule.date === "string" ? d.schedule.date : prev.date,
          time: typeof d.schedule.time === "string" ? d.schedule.time : prev.time,
          repeat: ["Once", "Daily", "Weekly", "Monthly"].includes(
            d.schedule.repeat,
          )
            ? d.schedule.repeat
            : prev.repeat,
        }));
      }
      stamp();
    },
    [stamp],
  );

  const handleImportFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (): void => {
        try {
          const data = JSON.parse(String(reader.result));
          applyRuleData(data);
          toast("Rule imported");
        } catch {
          toast("That file isn't a valid rule", "info");
        }
      };
      reader.onerror = (): void => toast("Could not read that file", "info");
      reader.readAsText(file);
    },
    [applyRuleData, toast],
  );

  const addCondition = (field: FieldKey = "ezraConfidence"): void => {
    setConditions((cs) => [...cs, mkCondition(field, { connector: "AND" })]);
    stamp();
  };
  const updateCond = (id: string, patch: Partial<Condition>): void => {
    setConditions((cs: any) =>
      cs.map((c: AnyCondition) => (c.id === id ? { ...c, ...patch } : c)),
    );
    stamp();
  };
  const removeCond = (id: string): void => {
    setConditions((cs) => cs.filter((c) => c.id !== id));
    stamp();
  };
  const addGroup = (): void => {
    setConditions((cs) => [
      ...cs,
      {
        id: nid(),
        kind: "group",
        connector: "AND",
        matchType: "any",
        children: [
          mkCondition("environment", { op: "equals", value: "Production" }),
          mkCondition("serviceTier", {
            connector: "OR",
            op: "is any of",
            value: "Tier-1",
          }),
        ],
      },
    ]);
    toast("Condition group added");
    stamp();
  };
  const updateGroup = (id: string, patch: Partial<ConditionGroup>): void => {
    setConditions((cs) =>
      cs.map((c) =>
        c.id === id && c.kind === "group" ? { ...c, ...patch } : c,
      ),
    );
    stamp();
  };
  const removeGroup = (id: string): void => {
    setConditions((cs) => cs.filter((c) => c.id !== id));
    stamp();
  };
  const addGroupChild = (groupId: string): void => {
    setConditions((cs) =>
      cs.map((c) =>
        c.id === groupId && c.kind === "group"
          ? {
              ...c,
              children: [
                ...c.children,
                mkCondition("priority", { connector: "AND" }),
              ],
            }
          : c,
      ),
    );
    stamp();
  };
  const updateGroupChild = (
    groupId: string,
    childId: string,
    patch: Partial<Condition>,
  ): void => {
    setConditions((cs) =>
      cs.map((c) =>
        c.id === groupId && c.kind === "group"
          ? {
              ...c,
              children: c.children.map((cc) =>
                cc.id === childId ? { ...cc, ...patch } : cc,
              ),
            }
          : c,
      ),
    );
    stamp();
  };
  const removeGroupChild = (groupId: string, childId: string): void => {
    setConditions((cs) =>
      cs
        .map((c) =>
          c.id === groupId && c.kind === "group"
            ? { ...c, children: c.children.filter((cc) => cc.id !== childId) }
            : c,
        )
        .filter((c) => !(c.kind === "group" && c.children.length === 0)),
    );
    stamp();
  };
  const addAction = (key: ActionKey): void => {
    setActions((as) => [
      ...as,
      { id: nid(), key, detail: ACTIONS[key].detail },
    ]);
    stamp();
  };
  const removeAction = (id: string): void => {
    setActions((as) => as.filter((a) => a.id !== id));
    stamp();
  };
  const updateAction = (id: string, detail: string): void => {
    setActions((as) => as.map((a) => (a.id === id ? { ...a, detail } : a)));
  };
  const addGuard = (key: string): void => {
    if (guards.some((g) => g.key === key)) {
      toast("That guard is already added", "info");
      return;
    }
    const m = GUARD_FLAT[key];
    const g: Guard = { id: nid(), key };
    if (m?.val) g.value = m.val.def;
    setGuards((gs) => [...gs, g]);
    toast(`${m?.label ?? key} added`);
    stamp();
  };
  const removeGuard = (id: string): void => {
    setGuards((gs) => gs.filter((g) => g.id !== id));
    stamp();
  };
  const updateGuard = (id: string, v: string): void => {
    setGuards((gs) =>
      gs.map((g) =>
        g.id === id
          ? { ...g, value: parseInt(v, 10) || GUARD_FLAT[g.key]?.val?.def }
          : g,
      ),
    );
  };
  const updateControl = (path: ControlPath, v: string): void => {
    setControls((prev) => {
      const nc: ControlsState = JSON.parse(JSON.stringify(prev));
      switch (path) {
        case "win.min":
          nc.window.minutes = Math.max(1, Math.min(1440, parseInt(v, 10) || 1));
          break;
        case "win.scope":
          nc.window.scope = v as ScopeOption;
          break;
        case "max.count":
          nc.maxExecutions.count = Math.max(
            1,
            Math.min(999, parseInt(v, 10) || 1),
          );
          break;
        case "max.per":
          nc.maxExecutions.per = v as MaxPerOption;
          break;
        case "retry":
          nc.retry = v as RetryOption;
          break;
        case "conc":
          nc.concurrency = Math.max(1, Math.min(99, parseInt(v, 10) || 1));
          break;
        case "approval":
          nc.approval = v;
          break;
        case "timeout":
          nc.timeout = Math.max(1, Math.min(1440, parseInt(v, 10) || 1));
          break;
      }
      return nc;
    });
    stamp();
  };

  const loadLibraryRule = (rule: LibraryRule): void => {
    applyRuleData(rule);
    setShowLibrary(false);
    toast(`Loaded "${rule.name}"`);
  };

  const matchItems: DropdownItem[] = [
    {
      label: "All of the following conditions are true (AND)",
      onClick: () => {
        setMatchType("all");
        stamp();
      },
    },
    {
      label: "Any of the following conditions are true (OR)",
      onClick: () => {
        setMatchType("any");
        stamp();
      },
    },
    {
      label: "None of the following conditions are true (NOT)",
      onClick: () => {
        setMatchType("none");
        stamp();
      },
    },
  ];
  const actionItems: DropdownItem[] = ACT_GROUPS.flatMap((g, i) => [
    ...(i > 0 ? [{ type: "sep" as const }] : []),
    { type: "label" as const, label: g.sec },
    ...g.keys
      .filter((k) => k in ACTIONS)
      .map((k) => ({
        label: ACTIONS[k].name,
        onClick: () => {
          addAction(k);
          toast(`${ACTIONS[k].name} added`);
        },
      })),
  ]);
  const condFieldItems: DropdownItem[] = COND_GROUPS.flatMap((g, i) => [
    ...(i > 0 ? [{ type: "sep" as const }] : []),
    { type: "label" as const, label: g.sec },
    ...g.fields.map((f) => ({
      label: FIELDS[f].label,
      onClick: () => addCondition(f),
    })),
  ]);
  const addedKeys = new Set(guards.map((g) => g.key));
  const guardItems: DropdownItem[] = GUARD_CATALOG.flatMap((g, i) => [
    ...(i > 0 ? [{ type: "sep" as const }] : []),
    { type: "label" as const, label: g.sec },
    ...g.items
      .filter((it) => !addedKeys.has(it.key))
      .map((it) => ({ label: it.label, onClick: () => addGuard(it.key) })),
  ]);

  const ruleJson = JSON.stringify(
    {
      $schema: "scrubbe.operational-rule/v1",
      name: ruleName,
      description: ruleDesc,
      status,
      matchType,
      conditions: conditions.map(({ id: _, ...r }) => r),
      actions: actions.map(({ id: _, ...r }) => r),
      guards: guards.map(({ id: _, ...r }) => r),
      controls,
      schedule,
    },
    null,
    2,
  );

  const toggleJsonEdit = useCallback((): void => {
    setJsonEditing((editing) => {
      const next = !editing;
      if (next) setJsonDraft(ruleJson);
      return next;
    });
    setJsonError(null);
  }, [ruleJson]);

  const applyJsonEdit = useCallback((): void => {
    let data: any;
    try {
      data = JSON.parse(jsonDraft);
    } catch {
      setJsonError(
        "That isn't valid JSON — check for a missing comma, bracket or quote.",
      );
      return;
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      setJsonError(
        "This should be a single rule object with name, conditions and actions.",
      );
      return;
    }
    applyRuleData(data);
    setJsonEditing(false);
    setJsonError(null);
    toast("Applied changes from JSON");
  }, [jsonDraft, applyRuleData, toast]);

  const insertJsonTemplate = useCallback((): void => {
    setJsonEditing(true);
    setJsonDraft(JSON.stringify(REUSABLE_TEMPLATE, null, 2));
    setJsonError(null);
    if (codeDetailsRef.current) codeDetailsRef.current.open = true;
    toast("Reusable template inserted — edit it, then Apply");
  }, [toast]);

  const downloadRuleJson = useCallback((): void => {
    const blob = new Blob([ruleJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug(ruleName) || "operational-rule"}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast("Rule exported as JSON");
  }, [ruleJson, ruleName, toast]);

  const jsonMetaText = useMemo(() => {
    const txt = jsonEditing ? jsonDraft : ruleJson;
    const bytes = new TextEncoder().encode(txt).length;
    return `${txt.split("\n").length} lines · ${fmtBytes(bytes)}`;
  }, [jsonEditing, jsonDraft, ruleJson]);

  const highlightedRuleJson = useMemo(
    () => highlightJson(ruleJson),
    [ruleJson],
  );

  return (
    <div className="bg-zinc-50 min-h-screen font-ibm text-zinc-900 antialiased pb-20">
      <div className="max-w-[1480px] mx-auto px-7 py-6">
        {/* Breadcrumb */}

        {/* Page header */}
        <header className="flex flex-col gap-5 flex-wrap mb-6">
          <div>
            <h1 className="text-[27px] font-medium tracking-tight flex items-center gap-3 flex-wrap">
              Create operational rule
            </h1>
            <p className="text-zinc-500 text-sm mt-1 max-w-xl leading-relaxed">
              Govern how Scrubbe's autonomous agents investigate and remediate.
              Ezra evaluates every condition in real time and routes each event
              between automated action, human approval, and hand-off
            </p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <Btn onClick={() => setShowLibrary(true)}>
              <BookOpen size={16} /> Rule library
            </Btn>
            {/* Schedule button */}
            <div className="relative">
              <Btn onClick={() => setShowSched((s) => !s)}>
                <Calendar size={16} /> Schedule
                <span className="text-[11px] font-bold text-blue-600  rounded px-1.5 py-0.5">
                  {schedule.mode === "at" && schedule.date
                    ? schedule.date
                    : "Continuous"}
                </span>
              </Btn>
              {showSched && (
                <div className="absolute left-0 top-[calc(100%+8px)] z-[120] bg-white border border-zinc-200 rounded-2xl shadow-xl p-4 w-[340px]">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <Calendar size={15} className="text-indigo-500" />
                    </div>
                    <div>
                      <div className="font-bold text-[14.5px]">Schedule</div>
                      <div className="text-[11.5px] text-zinc-400">
                        {schedule.mode === "at"
                          ? "Activates at a scheduled time."
                          : "Evaluated continuously, in real time."}
                      </div>
                    </div>
                  </div>
                  <div className="flex bg-zinc-100 border border-zinc-200 rounded-xl p-1 gap-1 mb-3">
                    {(["always", "at"] as ScheduleMode[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSchedule((s) => ({ ...s, mode: m }))}
                        className={`flex-1 text-[12.5px] font-semibold py-1.5 rounded-lg border-none cursor-pointer transition-all ${schedule.mode === m ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-400 bg-transparent"}`}
                      >
                        {m === "always" ? "Continuous" : "Scheduled"}
                      </button>
                    ))}
                  </div>
                  {schedule.mode === "at" && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[12.5px] font-semibold text-zinc-500 block mb-1.5">
                          Date
                        </label>
                        <input
                          type="date"
                          value={schedule.date}
                          onChange={(e) =>
                            setSchedule((s) => ({ ...s, date: e.target.value }))
                          }
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="text-[12.5px] font-semibold text-zinc-500 block mb-1.5">
                          Time
                        </label>
                        <input
                          type="time"
                          value={schedule.time}
                          onChange={(e) =>
                            setSchedule((s) => ({ ...s, time: e.target.value }))
                          }
                          className={inputCls}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[12.5px] font-semibold text-zinc-500 block mb-1.5">
                          Repeat
                        </label>
                        <select
                          value={schedule.repeat}
                          onChange={(e) =>
                            setSchedule((s) => ({
                              ...s,
                              repeat: e.target.value as RepeatOption,
                            }))
                          }
                          className={selectCls}
                        >
                          {(
                            [
                              "Once",
                              "Daily",
                              "Weekly",
                              "Monthly",
                            ] as RepeatOption[]
                          ).map((r) => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <Btn onClick={() => importInputRef.current?.click()}>
              <Upload size={16} /> Import
            </Btn>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={handleImportFile}
            />
            <Btn onClick={downloadRuleJson}>
              <ArrowDown size={16} /> Export
            </Btn>
            <Btn
              onClick={async () => {
                const newActive = status === "disabled";
                if (savedRuleId) {
                  const res = await patch(`${endpoint.guardrails.update}/${savedRuleId}`, { isActive: newActive });
                  if (res.success) {
                    queryClient.invalidateQueries({ queryKey: [querykeys.PLAYBOOKS, "guardrails"] });
                    setStatus(newActive ? "enabled" : "disabled");
                    stamp();
                    toast(newActive ? "Rule enabled" : "Rule disabled", newActive ? "good" : "info");
                  } else {
                    toast("Failed to update rule status", "error");
                  }
                } else {
                  setStatus((s) => (s === "disabled" ? "enabled" : "disabled"));
                  stamp();
                  toast(status === "disabled" ? "Rule enabled" : "Rule disabled", status === "disabled" ? "good" : "info");
                }
              }}
              variant={status === "disabled" ? "good" : "danger"}
            >
              {status === "disabled" ? <Power size={16} /> : <Ban size={16} />}
              {status === "disabled" ? "Enable rule" : "Disable"}
            </Btn>
            <Btn
              onClick={() => {
                if (!ruleName.trim()) {
                  toast("Add a rule name first", "info");
                  return;
                }
                saveMutation.mutate(false);
              }}
            >
              <Clock size={16} /> {saveMutation.isPending && !saveMutation.variables ? "Saving…" : "Save as draft"}
            </Btn>
            <Btn
              variant="primary"
              onClick={() => {
                if (!ruleName.trim()) {
                  toast("Add a rule name first", "info");
                  return;
                }
                if (!conditions.length) {
                  toast("Add at least one condition", "info");
                  return;
                }
                if (!actions.length) {
                  toast("Add at least one action", "info");
                  return;
                }
                saveMutation.mutate(true);
              }}
            >
              <Send size={16} /> {saveMutation.isPending ? "Saving…" : "Save & enable"}
            </Btn>
          </div>
        </header>

        {/* Ezra banner */}
        {/* <div className="relative flex gap-4 items-start bg-gradient-to-b from-violet-50 to-white border border-indigo-100 rounded-2xl p-4 mb-5 overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full" />
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Activity size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="font-extrabold text-[14.5px]">Ezra</span>
              <span className="text-[10.5px] font-bold tracking-widest uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                Autonomy Intelligence
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                Advisory
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-zinc-500 mb-2">
              This rule constrains autonomous action on Production / Tier-1
              services. Ezra will flag each trigger with a confidence assessment
              and queue hold actions before any remediation executes. You have{" "}
              <b className="text-zinc-700">{conditions.length} conditions</b>{" "}
              and{" "}
              <b className="text-zinc-700">
                {guards.length} suppression guards
              </b>{" "}
              active.
            </p>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-start gap-2 text-[12px] text-zinc-500">
                <AlertTriangle
                  size={13}
                  className="text-amber-500 shrink-0 mt-0.5"
                />{" "}
                Blast-radius check uses the OR connector — a large radius alone
                can trigger this rule.
              </div>
              <div className="flex items-start gap-2 text-[12px] text-zinc-500">
                <Info size={13} className="text-indigo-500 shrink-0 mt-0.5" />{" "}
                Consider adding an <b>Evidence Quality</b> condition to filter
                low-signal alerts.
              </div>
              <div className="flex items-start gap-2 text-[12px] text-zinc-500">
                <Check size={13} className="text-emerald-500 shrink-0 mt-0.5" />{" "}
                Suppression guard coverage is strong — {guards.length} guards
                reduce false-positive automation.
              </div>
            </div>
          </div>
          <div className="text-center self-center pl-4 border-l border-indigo-100 min-w-[110px] shrink-0">
            <div className="text-[28px] font-black text-indigo-600 leading-none">
              91%
            </div>
            <div className="text-[10.5px] text-zinc-400 mt-1.5 leading-snug">
              Ezra diagnostic
              <br />
              confidence
            </div>
          </div>
        </div> */}

        {/* Main canvas */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-7 mb-5">
          {/* Rule details */}
          <div
            className="grid gap-5 mb-1"
            style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1.15fr)" }}
          >
            <div>
              <label className="text-sm text-zinc-500 block mb-1.5">
                Rule name
              </label>
              <input
                value={ruleName}
                onChange={(e) => {
                  setRuleName(e.target.value);
                  stamp();
                }}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-sm text-zinc-500 block mb-1.5">
                Description{" "}
                <span className="font-normal text-zinc-400">(optional)</span>
              </label>
              <textarea
                value={ruleDesc}
                onChange={(e) => {
                  setRuleDesc(e.target.value);
                  stamp();
                }}
                rows={3}
                className={`${inputCls} resize-y`}
              />
            </div>
          </div>

          <hr className="border-zinc-100 my-6" />

          {/* IF */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-xs font-black tracking-wider text-white px-3 py-1 rounded-lg bg-indigo-500">
              IF
            </span>
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDrop((d) => (d === "match" ? null : "match"))
                }
                className="inline-flex items-center gap-2 text-[14.5px] font-semibold text-zinc-800 bg-none border-none cursor-pointer px-1.5 py-1 rounded-sm hover:bg-zinc-50 transition-colors"
              >
                <span className="text-indigo-500">
                  {matchType === "all"
                    ? "All"
                    : matchType === "any"
                      ? "Any"
                      : "None"}
                </span>{" "}
                of the following conditions are true{" "}
                <ChevronDown size={15} className="text-zinc-400" />
              </button>
              {openDrop === "match" && (
                <Dropdown
                  items={matchItems}
                  onClose={() => setOpenDrop(null)}
                />
              )}
            </div>
          </div>

          {conditions.length === 0 && (
            <p className="text-[13px] text-zinc-400 italic py-3">
              No conditions yet. Add a condition below.
            </p>
          )}
          {conditions.map((c, i) => {
            const leading =
              i === 0 ? (
                <span className="text-[11px] text-zinc-400 font-semibold px-2 py-1">
                  IF
                </span>
              ) : (
                <ConnectorChip
                  value={c.connector}
                  onChange={(v) =>
                    c.kind === "group"
                      ? updateGroup(c.id, { connector: v })
                      : updateCond(c.id, { connector: v })
                  }
                />
              );
            return c.kind === "cond" ? (
              <ConditionRow
                key={c.id}
                cond={c}
                leading={leading}
                onUpdate={(p) => updateCond(c.id, p)}
                onRemove={() => removeCond(c.id)}
              />
            ) : (
              <GroupRow
                key={c.id}
                group={c}
                leading={leading}
                onUpdateGroup={(p) => updateGroup(c.id, p)}
                onRemoveGroup={() => removeGroup(c.id)}
                onAddChild={() => addGroupChild(c.id)}
                onUpdateChild={(childId, p) =>
                  updateGroupChild(c.id, childId, p)
                }
                onRemoveChild={(childId) => removeGroupChild(c.id, childId)}
              />
            );
          })}

          <div className="flex gap-2 mt-3 flex-wrap">
            <div className="relative">
              <Button
                size="sm"
                variant="outline-green"
                onClick={() =>
                  setOpenDrop((d) => (d === "cond" ? null : "cond"))
                }
              >
                <Plus size={14} /> Add condition
              </Button>
              {openDrop === "cond" && (
                <Dropdown
                  items={condFieldItems}
                  onClose={() => setOpenDrop(null)}
                />
              )}
            </div>
            <Button size="sm" variant="outline-dark" onClick={addGroup}>
              <Plus size={14} /> Add condition group
            </Button>
          </div>

          <div className="flex justify-center text-zinc-300 my-5">
            <ArrowDown size={20} />
          </div>

          {/* THEN */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-black tracking-wider text-white px-3 py-1 rounded-lg bg-emerald-500">
              THEN
            </span>
            <span className="text-[14.5px] font-semibold text-zinc-800">
              Perform the following actions
            </span>
          </div>

          {actions.length === 0 && (
            <p className="text-[13px] text-zinc-400 italic py-3">
              No actions yet. Add an action below.
            </p>
          )}
          {actions.map((a) => (
            <ActionRow
              key={a.id}
              action={a}
              onUpdateDetail={(d) => updateAction(a.id, d)}
              onRemove={() => removeAction(a.id)}
            />
          ))}

          <div className="relative inline-block mt-3">
            <Button
              size="sm"
              variant="outline-green"
              onClick={() =>
                setOpenDrop((d) => (d === "action" ? null : "action"))
              }
            >
              <Plus size={14} /> Add action
            </Button>
            {openDrop === "action" && (
              <Dropdown items={actionItems} onClose={() => setOpenDrop(null)} />
            )}
          </div>

          <div className="flex justify-center text-zinc-300 my-5">
            <ArrowDown size={20} />
          </div>

          {/* UNLESS */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-xs font-black tracking-wider text-white px-3 py-1 rounded-lg bg-teal-600">
              UNLESS
            </span>
            <div className="flex items-center gap-2 flex-wrap text-[13px] text-zinc-500">
              Skip the actions when
              <button
                type="button"
                onClick={() => {
                  setGuardMatch((m) => (m === "any" ? "all" : "any"));
                  stamp();
                }}
                className="inline-flex items-center gap-1.5 font-black text-xs text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-2.5 py-1 cursor-pointer hover:bg-teal-100 transition-colors"
              >
                {guardMatch} <ChevronDown size={12} />
              </button>
              of these guards are active{" "}
              {guards.length > 0 && (
                <b className="text-zinc-700">· {guards.length} set</b>
              )}
            </div>
          </div>

          {guards.length === 0 && (
            <div className="flex items-center gap-3 border border-dashed border-zinc-300 rounded-xl p-3.5 bg-zinc-50 text-zinc-500 text-[12.5px] leading-snug mb-2">
              <VolumeX size={18} className="text-teal-500 shrink-0" />
              No guards yet. Add one so this rule steps aside when a responder,
              war room, or Ezra is already handling the incident.
            </div>
          )}
          {guards.map((g) => (
            <GuardRow
              key={g.id}
              guard={g}
              onUpdateVal={(v) => updateGuard(g.id, v)}
              onRemove={() => removeGuard(g.id)}
            />
          ))}

          <div className="relative inline-block mt-3">
            <Btn
              size="sm"
              variant="ghost"
              onClick={() => setShowGuardPanel((p) => !p)}
            >
              <Plus size={14} /> Add suppression guard
            </Btn>
            <AddGuardPanel
              isOpen={showGuardPanel}
              addedKeys={new Set(guards.map((g) => g.key))}
              onAdd={(key) => {
                addGuard(key);
                setShowGuardPanel(false);
              }}
              onClose={() => setShowGuardPanel(false)}
            />
          </div>

          <ExecControls controls={controls} onChange={updateControl} />
        </div>

        {/* Bottom 3-col grid */}
        <div className="grid grid-cols-3 gap-5 mt-5">
          {/* Summary */}
          <section className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-5">
            <h3 className="text-[15px] font-extrabold mb-1">Rule summary</h3>
            <p className="text-[12.5px] text-zinc-400 mb-4">
              Plain-language read of what this rule does.
            </p>
            <RuleSummary
              conditions={conditions}
              actions={actions}
              matchType={matchType}
              guards={guards}
              guardMatch={guardMatch}
              controls={controls}
              schedule={schedule}
            />
          </section>

          {/* Test */}
          <section className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-5">
            <h3 className="text-[15px] font-extrabold mb-1">Test rule</h3>
            <p className="text-[12.5px] text-zinc-400 mb-4">
              Run this rule against its own conditions to confirm it triggers.
            </p>
            <TestPanel
              conditions={conditions}
              actions={actions}
              matchType={matchType}
            />
          </section>

          {/* Status */}
          <section className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-5">
            <h3 className="text-[15px] font-extrabold mb-1">Rule status</h3>
            <p className="text-[12.5px] text-zinc-400 mb-4">
              Lifecycle and recent activity.
            </p>
            {(
              [
                {
                  k: "Status",
                  v: (
                    <button
                      type="button"
                      onClick={() => {
                        setStatus((s) =>
                          s === "enabled" ? "disabled" : "enabled",
                        );
                        stamp();
                      }}
                      className={`relative w-9 h-[22px] rounded-full border-none cursor-pointer transition-colors ${status === "enabled" ? "bg-emerald-400" : "bg-zinc-300"}`}
                    >
                      <span
                        className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-all ${status === "enabled" ? "left-[18px]" : "left-0.5"}`}
                      />
                    </button>
                  ),
                },
                { k: "Last triggered", v: "2 hours ago" },
                {
                  k: "Times triggered",
                  v: <span className="font-mono">12</span>,
                },
                {
                  k: "Success rate",
                  v: <span className="text-emerald-600">96%</span>,
                },
                { k: "Created by", v: "Alex Singh" },
                {
                  k: "Created on",
                  v: <span className="font-mono">05 Jan 2026, 10:30</span>,
                },
                {
                  k: "Last modified",
                  v: <span className="font-mono">{lastMod}</span>,
                },
              ] satisfies { k: string; v: ReactNode }[]
            ).map(({ k, v }) => (
              <div
                key={k}
                className="flex items-center justify-between py-2.5 border-b border-zinc-100 text-[13px] last:border-0"
              >
                <span className="text-zinc-500">{k}</span>
                <span className="font-semibold text-zinc-800">{v}</span>
              </div>
            ))}
          </section>
        </div>

        {/* Rule as code */}
        <section className="bg-white border border-zinc-200 rounded-2xl shadow-sm mt-5 overflow-hidden">
          <details ref={codeDetailsRef}>
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none hover:bg-zinc-50 transition-colors">
              <span className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                  <FileText size={16} className="text-zinc-500" />
                </span>
                <span>
                  <span className="font-extrabold text-[15px] block">
                    Rule as code
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    scrubbe.operational-rule/v1 · {jsonMetaText}
                  </span>
                </span>
              </span>
              <span className="flex items-center gap-2 text-[12px] font-semibold text-zinc-400">
                Expand <ChevronDown size={17} />
              </span>
            </summary>
            <div className="border-t border-zinc-100 p-4">
              <div className="border border-[#1c2230] rounded-xl bg-[#0e1117] overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-[#0b0e14] border-b border-[#1c2230]">
                  <span className="flex items-center gap-2 text-[11.5px] text-[#8b93a6] font-mono">
                    <FileText size={13} color="#5d6577" /> operational-rule.json
                  </span>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={insertJsonTemplate}
                      title="Insert a reusable rule-as-code template"
                      className="inline-flex items-center gap-1.5 border-none bg-none text-[#aeb6c6] text-xs font-semibold cursor-pointer px-2 py-1 rounded-md hover:bg-white/10 transition-colors"
                    >
                      <FileText size={13} /> Template
                    </button>
                    <span className="w-px h-4 bg-[#262d3b] mx-1" />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(ruleJson);
                        toast("JSON copied");
                      }}
                      title="Copy JSON"
                      className="inline-flex items-center gap-1.5 border-none bg-none text-[#aeb6c6] text-xs font-semibold cursor-pointer px-2 py-1 rounded-md hover:bg-white/10 transition-colors"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={downloadRuleJson}
                      title="Download JSON"
                      className="inline-flex items-center gap-1.5 border-none bg-none text-[#aeb6c6] text-xs font-semibold cursor-pointer px-2 py-1 rounded-md hover:bg-white/10 transition-colors"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <span className="w-px h-4 bg-[#262d3b] mx-1" />
                    <button
                      type="button"
                      onClick={toggleJsonEdit}
                      title={jsonEditing ? "Cancel editing" : "Edit JSON"}
                      className="inline-flex items-center gap-1.5 border-none bg-none text-[#aeb6c6] text-xs font-semibold cursor-pointer px-2 py-1 rounded-md hover:bg-white/10 transition-colors"
                    >
                      {jsonEditing ? (
                        <>
                          <X size={13} /> Cancel
                        </>
                      ) : (
                        <>
                          <Pencil size={13} /> Edit
                        </>
                      )}
                    </button>
                    {jsonEditing && (
                      <button
                        type="button"
                        onClick={applyJsonEdit}
                        className="inline-flex items-center gap-1.5 border-none bg-indigo-500 text-white text-xs font-semibold cursor-pointer px-2.5 py-1 rounded-md hover:bg-indigo-600 transition-colors"
                      >
                        <Check size={13} /> Apply
                      </button>
                    )}
                  </div>
                </div>
                {jsonEditing ? (
                  <textarea
                    value={jsonDraft}
                    onChange={(e) => setJsonDraft(e.target.value)}
                    spellCheck={false}
                    className="w-full min-h-[300px] max-h-[460px] border-none outline-none p-4 bg-[#0e1117] text-[#e6e9f2] font-mono text-xs leading-relaxed resize-y"
                  />
                ) : (
                  <pre className="m-0 p-4 max-h-[420px] overflow-auto font-mono text-xs leading-relaxed text-[#c2c9d6] whitespace-pre">
                    <code>{highlightedRuleJson}</code>
                  </pre>
                )}
              </div>
              {jsonError ? (
                <div className="flex items-center gap-2 mt-2.5 text-[12.5px] text-red-500 font-medium">
                  <Info size={15} /> {jsonError}
                </div>
              ) : (
                <p className="flex items-start gap-2 mt-2.5 text-xs text-zinc-400 leading-relaxed">
                  <Info size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                  New to rule-as-code? Hit{" "}
                  <b className="text-zinc-500 font-semibold">Template</b> for a
                  reusable, self-documenting starter you can edit and{" "}
                  <b className="text-zinc-500 font-semibold">Apply</b>.
                </p>
              )}
            </div>
          </details>
        </section>

        {/* Saved rules list */}
        {savedRules.length > 0 && (
          <section className="bg-white border border-zinc-200 rounded-2xl shadow-sm mt-5 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <span className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                  <Shield size={16} className="text-zinc-500" />
                </span>
                <span>
                  <span className="font-extrabold text-[15px] block">Saved Guardrails</span>
                  <span className="text-[11px] text-zinc-400">{savedRules.length} rule{savedRules.length !== 1 ? "s" : ""} saved</span>
                </span>
              </span>
            </div>
            <div className="divide-y divide-zinc-100">
              {savedRules.map((rule: any) => (
                <div key={rule.id} className="flex items-center gap-4 px-5 py-3 hover:bg-zinc-50 transition-colors">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${rule.isActive ? "bg-emerald-500" : "bg-zinc-300"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold text-zinc-800 truncate">{rule.name}</div>
                    {rule.description && (
                      <div className="text-[11.5px] text-zinc-400 truncate">{rule.description}</div>
                    )}
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${rule.isActive ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                    {rule.isActive ? "Enabled" : "Draft"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const cfg = rule.config ?? {};
                      applyRuleData({
                        name: rule.name,
                        description: rule.description,
                        status: rule.isActive ? "enabled" : "draft",
                        matchType: cfg.matchType,
                        conditions: cfg.conditions,
                        actions: cfg.actions,
                        guards: cfg.guards,
                        guardMatch: cfg.guardMatch,
                        controls: cfg.controls,
                        schedule: cfg.schedule,
                      });
                      setSavedRuleId(rule.id);
                      toast(`Loaded "${rule.name}"`, "good");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ id: rule.id, name: rule.name })}
                    title="Delete draft"
                    className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <Toast toasts={toasts} />
      <RuleLibraryModal
        isOpen={showLibrary}
        onClose={() => setShowLibrary(false)}
        onLoad={loadLibraryRule}
        currentRuleJson={ruleJson}
        currentRuleName={ruleName}
      />
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteTarget(null);
        }}
        className="sm:max-w-sm"
      >
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <Trash2 size={18} className="text-red-500" />
            </div>
            <h3 className="font-bold text-[15px] text-zinc-900">
              Delete this draft?
            </h3>
          </div>
          <p className="text-sm text-zinc-500 mb-5 leading-relaxed">
            This will permanently delete{" "}
            <b className="text-zinc-800 font-semibold">
              &ldquo;{deleteTarget?.name}&rdquo;
            </b>
            . This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Btn
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Btn>
            <Btn
              variant="danger"
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              <Trash2 size={14} />
              {deleteMutation.isPending ? "Deleting…" : "Delete draft"}
            </Btn>
          </div>
        </div>
      </Modal>
      <style>{`
        details > summary::-webkit-details-marker { display:none }
        input:focus, select:focus, textarea:focus { outline:none; }
      `}</style>
    </div>
  );
}
