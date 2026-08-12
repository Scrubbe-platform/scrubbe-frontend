"use client";

import React, { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { PersonAvatar, SeverityPill, StatusBadge, KpiTile } from "./WarRoomPrimitives";
import { sevRank, tally, type WarRoom, type WarRoomStatus } from "./warRoomLibrary.data";

type SortKey = "date" | "sev" | "dur" | "fu";
type StatusFilter = "all" | WarRoomStatus;

export default function WarRoomList({ rooms, onOpen }: { rooms: WarRoom[]; onOpen: (wr: string) => void }) {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const total = rooms.length;
  const monitoring = rooms.filter((r) => r.status === "monitoring").length;
  const resolved = rooms.filter((r) => r.status === "resolved").length;
  const needsPerson = rooms.reduce((n, r) => n + tally(r).needs, 0);

  function toggleSort(key: SortKey) {
    if (sortKey === key) { setSortDir((d) => (d === "asc" ? "desc" : "asc")); return; }
    setSortKey(key);
    setSortDir(key === "fu" ? "desc" : key === "sev" ? "asc" : "desc");
  }

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = rooms.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (query && ![r.inc, r.wr, r.title, r.ic, r.service].join(" ").toLowerCase().includes(query)) return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      let av = 0, bv = 0;
      if (sortKey === "sev") { av = sevRank(a.sev); bv = sevRank(b.sev); }
      else if (sortKey === "fu") { const ta = tally(a), tb = tally(b); av = ta.needs * 1000 + ta.total; bv = tb.needs * 1000 + tb.total; }
      else if (sortKey === "dur") { av = a.durMin; bv = b.durMin; }
      else { av = a.dateSort; bv = b.dateSort; }
      return (av - bv) * dir;
    });
    return list;
  }, [rooms, q, statusFilter, sortKey, sortDir]);

  function SortHead({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k;
    const Icon = !active ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
    return (
      <th className="cursor-pointer select-none whitespace-nowrap px-3.5 py-2.5 text-left" onClick={() => toggleSort(k)}>
        <span className={cn("inline-flex items-center gap-1 hover:text-zinc-600 dark:hover:text-zinc-300", active && "text-zinc-600 dark:text-zinc-300")}>
          {label}
          <Icon size={11} className="text-zinc-400" />
        </span>
      </th>
    );
  }

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-7">
      <h1 className="font-ibm text-[22px] font-bold tracking-tight">War rooms</h1>
      <p className="mt-1.5 max-w-[76ch] text-[13.5px] leading-relaxed text-zinc-500">Every incident keeps a war room — the meeting record, the decisions, and the follow-ups Scrubbe&apos;s agents captured from the discussion and are carrying to done.</p>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiTile label="Total war rooms" value={total} sub="across all services" />
        <KpiTile label="Monitoring" value={monitoring} sub="still open" dot="#B7791F" />
        <KpiTile label="Resolved" value={resolved} sub="closed incidents" dot="#28A745" />
        <KpiTile label="Follow-ups need a person" value={needsPerson} sub="awaiting action" dot="#B7791F" />
      </div>

      <div className="mt-4 flex items-center gap-2.5">
        <div className="flex h-[38px] flex-1 items-center gap-2 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-grayscrubbe-900 px-3">
          <Search size={15} className="text-zinc-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by incident, service, or commander…" className="flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-zinc-400" />
        </div>
        <div className="inline-flex rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] p-[3px]">
          {(["all", "resolved", "monitoring"] as StatusFilter[]).map((s) => (
            <button key={s} type="button" onClick={() => setStatusFilter(s)} className={cn("h-7 rounded-md px-3 text-[12.5px] font-semibold capitalize transition-colors", statusFilter === s ? "bg-white dark:bg-grayscrubbe-900 text-black dark:text-white shadow-sm" : "text-zinc-500")}>{s}</button>
          ))}
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-grayscrubbe-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-[13px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] font-mono text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">
                <th className="px-3.5 py-2.5 text-left">War room</th>
                <SortHead label="Severity" k="sev" />
                <th className="px-3.5 py-2.5 text-left">Status</th>
                <SortHead label="When" k="date" />
                <SortHead label="Duration" k="dur" />
                <th className="px-3.5 py-2.5 text-left">Commander</th>
                <SortHead label="Follow-ups" k="fu" />
                <th className="w-8 px-3.5 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-3.5 py-9 text-center text-[13px] text-zinc-400">No war rooms match.</td></tr>
              ) : filtered.map((r) => {
                const t = tally(r);
                return (
                  <tr
                    key={r.wr}
                    onClick={() => onOpen(r.wr)}
                    className="cursor-pointer border-t border-zinc-100 dark:border-white/5 transition-colors hover:bg-zinc-50 dark:hover:bg-white/[0.03]"
                  >
                    <td className="px-3.5 py-3">
                      <div className="font-semibold text-[13.5px]">{r.title}</div>
                      <div className="mt-0.5 font-mono text-[10.5px] text-zinc-400">{r.wr} · {r.inc}</div>
                    </td>
                    <td className="px-3.5 py-3"><SeverityPill sev={r.sev} /></td>
                    <td className="px-3.5 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-3.5 py-3 tabular-nums text-zinc-600 dark:text-zinc-300 whitespace-nowrap">{r.date}</td>
                    <td className="px-3.5 py-3 tabular-nums text-zinc-600 dark:text-zinc-300 whitespace-nowrap">{r.duration}</td>
                    <td className="px-3.5 py-3"><span className="inline-flex items-center gap-2 whitespace-nowrap"><PersonAvatar name={r.ic} size={20} />{r.ic}</span></td>
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <span className="font-mono font-bold tabular-nums">{t.total}</span> <span className="text-zinc-400">follow-ups</span>
                    </td>
                    <td className="px-3.5 py-3 text-right text-zinc-400"><ChevronRight size={16} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
