"use client";

import React from "react";
import { toast } from "sonner";
import { ServiceRecord } from "./serviceCatalog.data";
import { auditLedgerToCsv, downloadCsv, downloadJson, servicesToCsv, servicesToJson } from "./csv";

const OPTIONS = [
  { key: "csv", title: "CSV", sub: "Spreadsheet" },
  { key: "json", title: "JSON", sub: "Machine-readable" },
  { key: "audit", title: "Audit ledger", sub: "Append-only" },
] as const;
type ExportKind = (typeof OPTIONS)[number]["key"];

export function ExportModal({
  services,
  onClose,
}: {
  services: ServiceRecord[];
  onClose: () => void;
}) {
  function doExport(kind: ExportKind) {
    const n = services.length;
    if (kind === "csv") {
      downloadCsv("services.csv", servicesToCsv(services));
      toast.success(`Exported ${n} service${n === 1 ? "" : "s"} as CSV`);
    } else if (kind === "json") {
      downloadJson("services.json", servicesToJson(services));
      toast.success(`Exported ${n} service${n === 1 ? "" : "s"} as JSON`);
    } else {
      downloadCsv("audit-ledger.csv", auditLedgerToCsv(services));
      toast.success(`Exported the audit ledger for ${n} service${n === 1 ? "" : "s"}`);
    }
    onClose();
  }

  return (
    <div className="p-4">
      <h3 className="text-[18px] font-bold text-black dark:text-zinc-100">Export</h3>
      <p className="mt-1 text-[13px] text-black/50 dark:text-zinc-500">
        {services.length} service{services.length === 1 ? "" : "s"} in the current view
      </p>

      <div className="my-4 border-t border-zinc-100 dark:border-zinc-800" />

      <p className="text-[13px] leading-relaxed text-black/60 dark:text-zinc-400">
        Exports carry the governance columns — readiness score, stored automation level, binding
        constraint, and evaluation ID — so the file matches what the console shows.
      </p>

      <div className="my-4 border-t border-zinc-100 dark:border-zinc-800" />

      <div className="grid grid-cols-2 gap-2.5">
        {OPTIONS.map((o) => (
          <button
            key={o.key}
            onClick={() => doExport(o.key)}
            className="flex items-center justify-between gap-2 rounded-md border border-zinc-200 px-4 py-3.5 text-left hover:border-emerald-400 hover:bg-emerald-50/40 dark:border-zinc-700 dark:hover:bg-emerald-500/5"
          >
            <span className="text-[14px] font-bold text-black dark:text-zinc-100">{o.title}</span>
            <span className="text-[12px] text-black/40 dark:text-zinc-500">{o.sub}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 flex justify-end border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <button
          onClick={onClose}
          className="rounded-lg border border-zinc-300 px-3.5 py-2 text-[12.5px] font-semibold text-black hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
