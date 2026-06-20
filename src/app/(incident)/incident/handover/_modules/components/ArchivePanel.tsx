// components/ArchivePanel.tsx
"use client";
import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/input";
import { fetchHandovers } from "@/lib/handover/handover.api";

export default function ArchivePanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed">("all");
  const router = useRouter();

  const { data: handovers = [], isLoading } = useQuery({
    queryKey: ["handovers", "archive"],
    queryFn: () => fetchHandovers({ status: "COMPLETED" }),
  });

  const archive = useMemo(() => {
    const base = statusFilter === "completed" ? handovers.filter((h) => h.status === "COMPLETED") : handovers;
    return base.filter(
      (h) =>
        h.handoverRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.currentOwnerLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.nextOwnerLabel.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [handovers, searchQuery, statusFilter]);

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3.5 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-stone-900 dark:text-white">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-stone-500 dark:text-zinc-400">
            <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          Handover Archive
        </div>
        <span className="text-[11px] text-stone-500 dark:text-zinc-400">Reference past handovers from any shift</span>
      </div>

      <div className="flex items-center gap-2 border-b border-stone-200 bg-stone-50 px-5 py-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
        <Input
          type="text"
          placeholder="Search by ID or team…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 flex-1 border-stone-200 bg-white text-xs placeholder:text-stone-400 focus-visible:ring-1 focus-visible:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "completed")}
          className="ml-2 h-8 rounded-[4px] border border-stone-200 bg-white px-2 text-xs text-stone-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        >
          <option value="all">All</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="max-h-[320px] overflow-y-auto">
        {isLoading ? (
          <div className="p-5 text-center text-xs text-stone-500 dark:text-zinc-400">Loading archive…</div>
        ) : (
          <>
            {archive.map((item) => {
              const primary = item.incidents.find((i) => i.isPrimary) ?? item.incidents[0];
              return (
                <div
                  key={item.id}
                  onClick={() => router.push(`/incident/handover/${item.id}`)}
                  className="flex cursor-pointer items-center gap-3 border-b border-stone-100 px-5 py-2.5 transition-colors hover:bg-stone-50 last:border-none dark:border-zinc-800 dark:hover:bg-zinc-800/40"
                >
                  <span className="w-20 shrink-0 font-mono text-[11px] font-medium text-blue-600">{item.handoverRef}</span>

                  <div className="flex-1">
                    <div className="text-xs font-medium text-stone-900 dark:text-white">
                      {primary?.incident.summary ?? "No linked incidents"}
                    </div>
                    <div className="mt-[1px] flex items-center gap-2 text-[11px] text-stone-500 dark:text-zinc-400">
                      <span>{item.currentOwnerLabel}</span>
                      <span>·</span>
                      <span>{item.incidents.length} incidents</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-[1px] text-[10px] font-semibold text-green-600 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400">
                        <span className="h-1 w-1 rounded-full bg-current"></span>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right text-[10px] text-stone-500 dark:text-zinc-400">
                    {new Date(item.transferAt).toLocaleDateString()}
                    <span className="mt-[2px] block font-mono">
                      {new Date(item.transferAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })} UTC
                    </span>
                  </div>
                </div>
              );
            })}

            {archive.length === 0 && (
              <div className="p-5 text-center text-xs text-stone-500 dark:text-zinc-400">No handovers match your search.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
