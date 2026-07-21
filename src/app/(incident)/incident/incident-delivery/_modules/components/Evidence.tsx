"use client";
import React from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { PAYLOAD } from "./incidentDelivery.data";

// Escapes the JSON text first, then wraps tokens in colored spans — safe to
// render because the source is our own JSON.stringify output, never raw HTML.
const jsonHTML = (obj: unknown) => {
  const escape = (s: string) =>
    s.replace(/[&<>]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m] as string));
  const json = escape(JSON.stringify(obj, null, 2));
  return json
    .replace(
      /("(?:\\.|[^"\\])*"(\s*:)?)|\b(true|false|null)\b|(-?\d+\.?\d*(?:[eE][+-]?\d+)?)/g,
      (match, str, colon, bool, num) => {
        if (str !== undefined) {
          return colon !== undefined
            ? `<span class="text-violet-600 dark:text-violet-400">${str.replace(/\s*:$/, "")}</span>${colon}`
            : `<span class="text-emerald-700 dark:text-emerald-400">${str}</span>`;
        }
        if (bool !== undefined) return `<span class="text-red-600 dark:text-red-400">${bool}</span>`;
        if (num !== undefined) return `<span class="text-indigo-600 dark:text-indigo-400">${num}</span>`;
        return match;
      },
    )
    .replace(/(\[\]|\{\})/g, '<span class="text-zinc-400 dark:text-zinc-600">$1</span>');
};

const Evidence = () => {
  const copyPayload = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(PAYLOAD.obj, null, 2));
      toast.success("Payload copied", { description: "Event JSON on clipboard" });
    } catch {
      toast.error("Couldn't copy payload");
    }
  };

  return (
    <div className="rounded-xl border border-[#DDDDDD] bg-white dark:bg-zinc-900/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="space-y-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
            Evidence
          </p>
          <p className="text-[14px] font-semibold text-black dark:text-zinc-100">
            Event payload
          </p>
          <p className="text-[12px] text-black dark:text-zinc-500">
            Raw evidence projected from the current incident context.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[11px] font-mono text-black dark:text-zinc-400 shrink-0">
          {PAYLOAD.tag}
        </span>
      </div>

      {PAYLOAD.warn && (
        <div className="px-5 py-2.5 border-b border-zinc-100 dark:border-zinc-800 bg-amber-50 dark:bg-amber-500/5">
          <p className="text-[11px] text-amber-700 dark:text-amber-400">{PAYLOAD.warn}</p>
        </div>
      )}

      {/* Code block */}
      <div className="relative group px-5 py-4 bg-zinc-50 dark:bg-zinc-950/60">
        <button
          type="button"
          onClick={copyPayload}
          title="Copy payload"
          className="absolute right-4 top-3.5 w-7 h-7 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center text-black dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
        >
          <Copy size={13} />
        </button>
        <pre
          className="overflow-x-auto text-[12px] font-mono leading-relaxed text-zinc-600 dark:text-zinc-300 pr-8"
          dangerouslySetInnerHTML={{ __html: jsonHTML(PAYLOAD.obj) }}
        />
      </div>
    </div>
  );
};

export default Evidence;
