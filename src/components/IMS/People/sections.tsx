"use client";

import React, { useState } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import Switch from "@/components/ui/Switch";
import { PermLevel } from "./data";
import { genPassword, copyToClipboard } from "./utils";

type Tone = "ok" | "warn" | "major" | "neutral";

const toneText: Record<Tone, string> = {
  ok: "text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20",
  warn: "text-amber-700 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20",
  major:
    "text-rose-700 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20",
  neutral: "border-zinc-200 text-black dark:border-zinc-700 dark:text-zinc-400",
};
const toneDot: Record<Tone, string> = {
  ok: "bg-emerald-500",
  warn: "bg-amber-500",
  major: "bg-rose-500",
  neutral: "bg-zinc-400",
};

export function StatusTag({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1 text-[12.5px] font-semibold",
        toneText[tone],
      )}
    >
      {tone !== "neutral" && (
        <span className={cn("h-1.5 w-1.5 rounded-full", toneDot[tone])} />
      )}
      {label}
    </span>
  );
}

export function SectionCard({
  eyebrow,
  note,
  right,
  lock,
  span,
  danger,
  children,
}: {
  eyebrow: string;
  note?: string;
  right?: React.ReactNode;
  lock?: boolean;
  span?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg bg-white p-6 shadow-sm shadow-light dark:bg-zinc-900/40",
        span && "col-span-2 max-[640px]:col-span-1",
        danger && "border-l-4 border-l-rose-400 dark:border-l-rose-500/60",
      )}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-black/50 dark:text-zinc-500">
          {eyebrow}
        </span>
        {note && (
          <span className="text-[12px] text-black/40 dark:text-zinc-500">
            {note}
          </span>
        )}
        <span className="ml-auto" />
        {lock && (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-zinc-200 px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide text-black/50 dark:border-zinc-700 dark:text-zinc-500">
            Set by role
          </span>
        )}
        {right}
      </div>
      {children}
    </section>
  );
}

export function KVRows({
  rows,
}: {
  rows: [string, React.ReactNode, boolean?][];
}) {
  return (
    <div>
      {rows.map(([k, v, mono], i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 border-b border-zinc-100 py-3.5 last:border-b-0 dark:border-zinc-800"
        >
          <span className="shrink-0 text-[13.5px] text-black/55 dark:text-zinc-500">
            {k}
          </span>
          <span
            className={cn(
              "inline-flex items-center justify-end gap-2.5 text-right text-[15px] font-semibold text-black dark:text-zinc-200",
              mono && "font-mono text-[13.5px]",
            )}
          >
            {v}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ManagedBadge() {
  return (
    <span className="rounded-md border border-zinc-200 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-black dark:border-zinc-700 dark:text-zinc-500">
      managed
    </span>
  );
}

export function InlineButton({
  children,
  onClick,
  muted,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  muted?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md border px-2.5 py-1 text-[11.5px] transition-colors",
        muted
          ? "border-zinc-300 text-black hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-400"
          : "border-sky-200 text-sky-600 hover:bg-sky-50 dark:border-sky-500/30 dark:text-sky-400 dark:hover:bg-sky-500/10",
      )}
    >
      {children}
    </button>
  );
}

export function ChipSet({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

export function Chip({
  children,
  level,
  accent,
  onClick,
}: {
  children: React.ReactNode;
  level?: string;
  accent?: boolean;
  onClick?: () => void;
}) {
  return (
    <span
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[14px] font-medium",
        accent
          ? "cursor-pointer border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-400"
          : "border-zinc-200 bg-white text-black dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200",
      )}
    >
      {children}
      {level && (
        <span className="border-l border-zinc-200 pl-2 font-mono text-[10px] text-black/50 dark:border-zinc-700 dark:text-zinc-500">
          {level}
        </span>
      )}
    </span>
  );
}

export function PermGrid({ perms }: { perms: [string, PermLevel, string?][] }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
      {perms.map(([name, level, label], i) => {
        const cls =
          level === "yes"
            ? "text-emerald-600 dark:text-emerald-400"
            : level === "limited"
              ? "text-amber-600 dark:text-amber-400"
              : "text-black dark:text-zinc-500";
        return (
          <div
            key={i}
            className="flex items-center justify-between gap-3 border-b border-zinc-100 py-2.5 text-[13px] last:border-b-0 dark:border-zinc-800"
          >
            <span className="text-black dark:text-zinc-200">{name}</span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 font-mono text-[11.5px]",
                cls,
              )}
            >
              {level === "yes" ? (
                <>
                  <Check size={13} /> Granted
                </>
              ) : (
                label || (level === "limited" ? "Limited" : "---")
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function StatBox({
  value,
  label,
  danger,
  reverse,
}: {
  value: React.ReactNode;
  label: string;
  danger?: boolean;
  reverse?: boolean;
}) {
  if (reverse) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm shadow-light dark:bg-zinc-900/40">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-black/50 dark:text-zinc-500">
          {label}
        </div>
        <div className="mt-2 text-[18px] font-semibold leading-none text-black dark:text-zinc-100">
          {value}
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm shadow-light dark:bg-zinc-900/40">
      <div
        className={cn(
          "text-[20px] font-bold leading-none text-black dark:text-zinc-100",
          danger && "text-rose-600 dark:text-rose-400",
        )}
      >
        {value}
      </div>
      <div className="mt-2.5 text-[13px] font-medium text-black/55 dark:text-zinc-500">
        {label}
      </div>
    </div>
  );
}

export function ToggleRow({
  on,
  title,
  subtitle,
  onClick,
}: {
  on: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <div className="mt-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[14px] font-semibold text-black dark:text-zinc-100">
          {title}
        </span>
        <Switch checked={on} onChange={onClick} />
      </div>
      <p className="mt-2.5 text-[12.5px] leading-relaxed text-black/50 dark:text-zinc-500">
        {subtitle}
      </p>
    </div>
  );
}

export function SessionRow({
  device,
  browser,
  loc,
  current,
  onTerminate,
}: {
  device: string;
  browser: string;
  loc: string;
  current: boolean;
  onTerminate: () => void;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-zinc-100 py-2.5 last:border-b-0 dark:border-zinc-800">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-black dark:bg-zinc-800 dark:text-zinc-400">
        <span className="text-[10px] font-mono">💻</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] text-black dark:text-zinc-200">
          {device} · {browser}
        </div>
        <div className="font-mono text-[10.5px] text-black dark:text-zinc-500">
          {loc}
        </div>
      </div>
      {current ? (
        <span className="whitespace-nowrap rounded-md border border-emerald-200 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wide text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400">
          This session
        </span>
      ) : (
        <InlineButton onClick={onTerminate} muted>
          Terminate
        </InlineButton>
      )}
    </div>
  );
}

export function PasswordField({
  value,
  onChange,
  onGenerate,
  placeholder,
  reveal,
}: {
  value: string;
  onChange: (v: string) => void;
  onGenerate?: (v: string) => void;
  placeholder?: string;
  reveal?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-stretch gap-2">
      <input
        type={reveal ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 font-mono text-[12.5px] text-black focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      <button
        type="button"
        onClick={() => {
          const pw = genPassword();
          onChange(pw);
          onGenerate?.(pw);
        }}
        className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-zinc-300 px-2.5 text-[11.5px] font-semibold text-black transition-colors hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-300"
      >
        <RefreshCw size={13} /> Generate
      </button>
      <button
        type="button"
        onClick={async () => {
          const ok = await copyToClipboard(value);
          if (ok) {
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }
        }}
        className={cn(
          "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 text-[11.5px] font-semibold transition-colors",
          copied
            ? "border-emerald-300 text-emerald-600 dark:border-emerald-500/40 dark:text-emerald-400"
            : "border-zinc-300 text-black hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-300",
        )}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
