"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Info,
  Lock,
  TriangleAlert,
  X,
  Check,
  ChevronDown,
  Copy,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import TextArea from "@/components/ui/text-area";
import Button from "@/components/ui/Button1";
import { TIER_LABELS, TIER_TONE, userName } from "./settings.data";

/* ───────────────────── layout ───────────────────── */

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg bg-white p-5 shadow-sm shadow-light dark:bg-zinc-900/40",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 last:mb-0">
      <div className="mb-3.5 text-[11px] font-bold uppercase tracking-wide text-black/40 dark:text-zinc-500">
        {title}
      </div>
      {children}
    </div>
  );
}

export function FieldWrap({
  label,
  help,
  children,
}: {
  label?: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      {label && (
        <label className="mb-1.5 block text-[13px] font-semibold text-black dark:text-zinc-200">
          {label}
        </label>
      )}
      {help && (
        <div className="mb-1.5 -mt-0.5 text-[12px] text-black/50 dark:text-zinc-500">
          {help}
        </div>
      )}
      {children}
    </div>
  );
}

function fieldHelp(help?: string) {
  return help ? (
    <p className="mt-1.5 text-[12px] text-black/50 dark:text-zinc-500">
      {help}
    </p>
  ) : null;
}

export function TextField({
  label,
  help,
  value,
  onChange,
  placeholder,
  type = "text",
  unit,
}: {
  label?: string;
  help?: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  unit?: string;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <Input
        label={unit ? `${label} (${unit})` : label}
        value={value}
        placeholder={placeholder}
        type={type}
        onChange={(e) => onChange(e.target.value)}
      />
      {fieldHelp(help)}
    </div>
  );
}

export function NumberField({
  label,
  help,
  value,
  onChange,
  unit,
  min,
  max,
  step,
}: {
  label?: string;
  help?: string;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <Input
        type="number"
        label={unit ? `${label} (${unit})` : label}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="font-ibm tabular-nums"
      />
      {fieldHelp(help)}
    </div>
  );
}

export function TextAreaField({
  label,
  help,
  value,
  onChange,
  mono,
  rows = 4,
}: {
  label?: string;
  help?: string;
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
  rows?: number;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <TextArea
        label={label}
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "resize-y leading-relaxed",
          mono && "font-ibm text-[13px]",
        )}
      />
      {fieldHelp(help)}
    </div>
  );
}

export function SelectField({
  label,
  help,
  value,
  onChange,
  options,
}: {
  label?: string;
  help?: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="mb-4 last:mb-0">
      <Select
        label={label}
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        options={options.map((o) => ({ value: o, label: o }))}
      />
      {fieldHelp(help)}
    </div>
  );
}

export function SecretField({
  label,
  help,
  value,
  onChange,
  placeholder,
}: {
  label?: string;
  help?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <Input
            type="password"
            label={label}
            value={value}
            placeholder={placeholder || "••••••••••••"}
            onChange={(e) => onChange(e.target.value)}
            className="font-ibm"
          />
        </div>
        <Button
          type="button"
          variant="outline-dark"
          size="sm"
          className="shrink-0"
          onClick={() => {
            navigator.clipboard?.writeText(value).catch(() => {});
          }}
        >
          <Copy size={14} />
        </Button>
      </div>
      {fieldHelp(help)}
    </div>
  );
}

export function RangeField({
  label,
  help,
  value,
  onChange,
  min = 50,
  max = 99,
}: {
  label: string;
  help?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <FieldWrap>
      <label className="mb-1.5 block text-[13px] font-semibold text-black dark:text-zinc-200">
        {label}{" "}
        <span className="font-ibm font-bold text-IMSDarkGreen">{value}%</span>
      </label>
      {help && (
        <div className="mb-1.5 text-[12px] text-black/50 dark:text-zinc-500">
          {help}
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-IMSDarkGreen dark:bg-zinc-700"
      />
    </FieldWrap>
  );
}

/* ───────────────────── segmented control ───────────────────── */

export function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="inline-flex flex-wrap gap-0.5 rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-800/60">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={cn(
            "rounded-md px-3 py-1.5 text-[12.5px] font-semibold transition-all",
            o === value
              ? "bg-white text-IMSDarkGreen shadow-sm dark:bg-IMSDarkGreen dark:text-white"
              : "text-black/50 hover:text-black dark:text-zinc-500 dark:hover:text-zinc-300",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function SegmentedField({
  label,
  help,
  value,
  onChange,
  options,
}: {
  label?: string;
  help?: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="mb-4 last:mb-0">
      {label && (
        <label className="mb-1.5 block text-[13px] font-semibold text-black dark:text-zinc-200">
          {label}
        </label>
      )}
      <Segmented value={value} onChange={onChange} options={options} />
      {fieldHelp(help)}
    </div>
  );
}

/* ───────────────────── toggle ───────────────────── */

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-[42px] shrink-0 rounded-full transition-colors",
        checked ? "bg-IMSDarkGreen" : "bg-zinc-300 dark:bg-zinc-700",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked && "translate-x-[18px]",
        )}
      />
    </button>
  );
}

export function ToggleRow({
  title,
  desc,
  checked,
  onChange,
  last,
}: {
  title: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-3",
        !last && "border-b border-zinc-100 dark:border-zinc-800",
      )}
    >
      <div>
        <div className="text-[13.5px] font-semibold text-black dark:text-zinc-200">
          {title}
        </div>
        {desc && (
          <div className="mt-0.5 text-[12px] text-black/50 dark:text-zinc-500">
            {desc}
          </div>
        )}
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  );
}

/* ───────────────────── callouts ───────────────────── */

export function Explain({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3.5 flex gap-2.5 rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-3 text-[12.5px] leading-relaxed text-black/70 dark:border-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-400">
      <Info size={15} className="mt-0.5 shrink-0 text-IMSDarkGreen" />
      <span>{children}</span>
    </div>
  );
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "lock" | "warn";
  children: React.ReactNode;
}) {
  const style = {
    info: "bg-IMSDarkGreen/10 text-IMSDarkGreen",
    lock: "bg-zinc-50 border border-zinc-200 text-black/70 dark:bg-zinc-800/40 dark:border-zinc-700 dark:text-zinc-400",
    warn: "bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400",
  }[tone];
  const Icon = tone === "lock" ? Lock : tone === "warn" ? TriangleAlert : Info;
  return (
    <div
      className={cn(
        "flex gap-2.5 rounded-md p-3 text-[12.5px] leading-relaxed",
        style,
      )}
    >
      <Icon size={15} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

/* ───────────────────── tag list ───────────────────── */

export function TagList({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  function add() {
    const v = draft.trim();
    if (!v) return;
    onChange([...items, v]);
    setDraft("");
  }
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {items.map((t, i) => (
          <span
            key={t + i}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 py-1 pl-3 pr-1.5 text-[12.5px] font-medium text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            {t}
            <button
              type="button"
              onClick={() => onChange(items.filter((_, ix) => ix !== i))}
              className="rounded-full p-0.5 text-black/40 hover:bg-rose-50 hover:text-rose-600 dark:text-zinc-500"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder={placeholder || "Add…"}
          />
        </div>
        <Button
          type="button"
          variant="solid"
          size="sm"
          className="shrink-0"
          onClick={add}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

/* ───────────────────── multi-select (people) ───────────────────── */

export interface PersonOption {
  value: string;
  label: string;
  sub?: string;
}
export function MultiSelectPeople({
  options,
  selected,
  onChange,
  placeholder,
}: {
  options: PersonOption[];
  selected: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  function toggle(v: string) {
    onChange(
      selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v],
    );
  }
  const summary = !selected.length ? (
    <span className="text-black/40 dark:text-zinc-500">
      {placeholder || "Select people…"}
    </span>
  ) : selected.length <= 2 ? (
    options
      .filter((o) => selected.includes(o.value))
      .map((o) => o.label)
      .join(", ")
  ) : (
    <>
      {options.find((o) => o.value === selected[0])?.label},{" "}
      {options.find((o) => o.value === selected[1])?.label}{" "}
      <span className="font-bold text-IMSDarkGreen">
        +{selected.length - 2} more
      </span>
    </>
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-left text-[13.5px] text-black focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100",
          open && "border-IMSDarkGreen ring-2 ring-IMSDarkGreen/20",
        )}
      >
        <span className="flex-1 truncate text-[13.5px]">{summary}</span>
        <ChevronDown
          size={15}
          className={cn(
            "shrink-0 text-black/40 transition-transform dark:text-zinc-500",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="absolute z-20 mt-1.5 max-h-64 w-full overflow-auto rounded-md border border-zinc-200 bg-white p-1.5 shadow-md dark:border-zinc-700 dark:bg-zinc-900">
          {options.map((o) => {
            const on = selected.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => toggle(o.value)}
                className="flex w-full items-center gap-2.5 rounded-md p-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <span
                  className={cn(
                    "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border",
                    on
                      ? "border-IMSDarkGreen bg-IMSDarkGreen text-white"
                      : "border-zinc-300 dark:border-zinc-600",
                  )}
                >
                  {on && <Check size={12} />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold text-black dark:text-zinc-200">
                    {o.label}
                  </span>
                  {o.sub && (
                    <span className="block truncate text-[11.5px] text-black/50 dark:text-zinc-500">
                      {o.sub}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
export function userOptions(
  users: { email: string; name?: string; role?: string }[],
): PersonOption[] {
  return users.map((u) => ({
    value: u.email,
    label: u.name || userName(users, u.email),
    sub: (u.role ? u.role + " · " : "") + u.email,
  }));
}

/* ───────────────────── collection (generic table editor) ───────────────────── */

export type ColType =
  | "text"
  | "select"
  | "toggle"
  | "check"
  | "tier"
  | "static";
export interface ColDef {
  key: string;
  label: string;
  type: ColType;
  options?: string[];
  width?: string;
  placeholder?: string;
}
export function Collection({
  columns,
  rows,
  onChange,
  addLabel,
  addable = true,
  newRow,
  dimColumn,
}: {
  columns: ColDef[];
  rows: Record<string, any>[];
  onChange: (rows: Record<string, any>[]) => void;
  addLabel?: string;
  addable?: boolean;
  newRow?: () => Record<string, any>;
  dimColumn?: string;
}) {
  const gtc =
    columns.map((c) => c.width || "1fr").join(" ") + (addable ? " 32px" : "");
  function setCell(i: number, key: string, val: any) {
    const next = rows.slice();
    next[i] = { ...next[i], [key]: val };
    onChange(next);
  }
  function removeRow(i: number) {
    onChange(rows.filter((_, ix) => ix !== i));
  }
  return (
    <div className="overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700">
      <div
        className="grid gap-2 border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-black/40 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-500"
        style={{ gridTemplateColumns: gtc }}
      >
        {columns.map((c) => (
          <div key={c.key}>{c.label}</div>
        ))}
        {addable && <div />}
      </div>
      {rows.map((row, i) => {
        const dimmed = dimColumn ? !row[dimColumn] : false;
        return (
          <div
            key={i}
            className={cn(
              "grid items-center gap-2 border-b border-zinc-100 px-3 py-2 last:border-b-0 dark:border-zinc-800",
              dimmed && "opacity-60",
            )}
            style={{ gridTemplateColumns: gtc }}
          >
            {columns.map((c) => (
              <div key={c.key} className="min-w-0">
                <CollCell
                  col={c}
                  value={row[c.key]}
                  onChange={(v) => setCell(i, c.key, v)}
                />
              </div>
            ))}
            {addable && (
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-black/40 hover:bg-rose-50 hover:text-rose-600 dark:text-zinc-500"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        );
      })}
      {addable && (
        <button
          type="button"
          onClick={() => onChange([...rows, newRow ? newRow() : {}])}
          className="flex w-full items-center justify-center gap-1.5 border-t border-dashed border-zinc-200 bg-zinc-50 py-2.5 text-[12.5px] font-bold text-IMSDarkGreen hover:bg-IMSDarkGreen/10 dark:border-zinc-700 dark:bg-zinc-800/40"
        >
          <Plus size={14} /> {addLabel || "Add"}
        </button>
      )}
    </div>
  );
}
function CollCell({
  col,
  value,
  onChange,
}: {
  col: ColDef;
  value: any;
  onChange: (v: any) => void;
}) {
  if (col.type === "text") {
    return (
      <input
        value={value ?? ""}
        placeholder={col.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-zinc-200 bg-white px-2 py-1.5 text-[13px] focus:border-IMSDarkGreen focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
    );
  }
  if (col.type === "select") {
    return (
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-zinc-200 bg-white px-2 py-1.5 text-[13px] focus:border-IMSDarkGreen focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      >
        {(col.options || []).map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }
  if (col.type === "tier") {
    const n = value ?? 3;
    return (
      <select
        value={n}
        onChange={(e) => onChange(+e.target.value)}
        className={cn(
          "w-full rounded border border-zinc-200 bg-white px-2 py-1.5 font-ibm text-[13px] font-bold focus:border-IMSDarkGreen focus:outline-none dark:border-zinc-700 dark:bg-zinc-900",
          TIER_TONE[n],
        )}
      >
        {[1, 2, 3, 4].map((t) => (
          <option key={t} value={t}>
            {TIER_LABELS[t]}
          </option>
        ))}
      </select>
    );
  }
  if (col.type === "toggle")
    return <Toggle checked={!!value} onChange={onChange} label={col.label} />;
  if (col.type === "check") {
    return (
      <label className="inline-flex cursor-pointer items-center justify-center">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="flex h-5 w-5 items-center justify-center rounded border border-zinc-300 text-white peer-checked:border-IMSDarkGreen peer-checked:bg-IMSDarkGreen dark:border-zinc-600">
          {value && <Check size={13} />}
        </span>
      </label>
    );
  }
  return (
    <span className="text-[13px] font-semibold text-black dark:text-zinc-200">
      {value}
    </span>
  );
}

/* ───────────────────── stat + health ───────────────────── */

export function StatTile({
  icon,
  label,
  value,
  delta,
  tint,
  down,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  delta?: string;
  tint: [string, string];
  down?: boolean;
}) {
  return (
    <div className="min-w-[138px] flex-1 rounded-md border border-zinc-200 bg-white p-3.5 transition-transform hover:-translate-y-0.5 dark:border-zinc-700 dark:bg-zinc-900/60">
      <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-black/50 dark:text-zinc-500">
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
            tint[0],
            tint[1],
          )}
        >
          {icon}
        </span>
        {label}
      </div>
      <div className="font-ibm text-[24px] font-bold leading-none text-black dark:text-zinc-100">
        {value}
      </div>
      {delta && (
        <div
          className={cn(
            "mt-1.5 text-[11.5px] font-semibold",
            down ? "text-rose-600" : "text-IMSDarkGreen",
          )}
        >
          {delta}
        </div>
      )}
    </div>
  );
}

export function CategoryCard({
  icon,
  tint,
  name,
  desc,
  cta,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  tint: [string, string];
  name: string;
  desc: string;
  cta: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-[148px] flex-col gap-3.5 rounded-lg border border-zinc-200 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900/60"
    >
      <div className="flex items-start justify-between gap-2.5">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            tint[0],
            tint[1],
          )}
        >
          {icon}
        </span>
        <div className="flex items-center gap-1.5">
          <ChevronDown
            size={17}
            className="-rotate-90 text-black/30 dark:text-zinc-600"
          />
        </div>
      </div>
      <div>
        <h3 className="text-[15px] font-bold text-black dark:text-zinc-100">
          {name}
        </h3>
        <p className="mt-1 text-[12.5px] leading-snug text-black/50 dark:text-zinc-500">
          {desc}
        </p>
      </div>
      <div className={cn("mt-auto text-[13px] font-bold", tint[1])}>{cta}</div>
    </button>
  );
}

export function GroupHeader({
  icon,
  tint,
  name,
  count,
}: {
  icon: React.ReactNode;
  tint: [string, string];
  name: string;
  count: number;
}) {
  return (
    <div className="mb-3.5 mt-8 flex items-center gap-2.5 first:mt-0">
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
        )}
      >
        {icon}
      </span>
      <h3 className="text-[15px] font-bold text-black dark:text-zinc-100">
        {name}
      </h3>
      <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 font-ibm text-[11px] font-bold text-black/40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500">
        {count}
      </span>
      <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}
