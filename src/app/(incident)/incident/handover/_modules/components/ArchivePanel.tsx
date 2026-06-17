// components/ArchivePanel.tsx
"use client";
import React, { useState } from "react";
import Input from "@/components/ui/input";
import { mockArchive } from "../libs/handoverTickets";

export default function ArchivePanel() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArchive = mockArchive.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3.5 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-stone-900 dark:text-white">
          <svg
            width="15"
            height="15"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            className="text-stone-500 dark:text-zinc-400"
          >
            <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          Handover Archive
        </div>
        <span className="text-[11px] text-stone-500 dark:text-zinc-400">
          Reference past handovers from any shift
        </span>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 border-b border-stone-200 bg-stone-50 px-5 py-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
        <Input
          type="text"
          placeholder="Search by ID, incident, or team…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 flex-1 border-stone-200 bg-white text-xs placeholder:text-stone-400 focus-visible:ring-1 focus-visible:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500"
        />
        <select className="ml-2 h-8 rounded-[4px] border border-stone-200 bg-white px-2 text-xs text-stone-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
          <option value="all">All</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* List */}
      <div className="max-h-[320px] overflow-y-auto">
        {filteredArchive.map((item) => (
          <div
            key={item.id}
            className="flex cursor-pointer items-center gap-3 border-b border-stone-100 px-5 py-2.5 transition-colors hover:bg-stone-50 last:border-none dark:border-zinc-800 dark:hover:bg-zinc-800/40"
          >
            {/* ID */}
            <span className="w-20 shrink-0 font-mono text-[11px] font-medium text-blue-600">
              {item.id}
            </span>

            {/* Body */}
            <div className="flex-1">
              <div className="text-xs font-medium text-stone-900 dark:text-white">
                {item.title}
              </div>
              <div className="mt-[1px] flex items-center gap-2 text-[11px] text-stone-500 dark:text-zinc-400">
                <span>{item.team}</span>
                <span>·</span>
                <span>{item.incidentCount} incidents</span>
                <span>·</span>
                {/* Completed Badge */}
                <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-[1px] text-[10px] font-semibold text-green-600 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400">
                  <span className="h-1 w-1 rounded-full bg-current"></span>
                  {item.status}
                </span>
              </div>
            </div>

            {/* Date/Time */}
            <div className="shrink-0 text-right text-[10px] text-stone-500 dark:text-zinc-400">
              {item.date}
              <span className="mt-[2px] block font-mono">{item.time}</span>
            </div>
          </div>
        ))}

        {filteredArchive.length === 0 && (
          <div className="p-5 text-center text-xs text-stone-500 dark:text-zinc-400">
            No handovers match your search.
          </div>
        )}
      </div>
    </div>
  );
}
