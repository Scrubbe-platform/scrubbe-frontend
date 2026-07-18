// components/ICP/LiveFeed.tsx
"use client";

import React, { useState } from "react";
import { FEED_EVENTS, GOV_EVENTS } from "../libs/data";
import { Panel, LinkAction, feedDot } from "./shared";
import SideModal from "@/components/ui/SideModal";

const FILTERS = ["all", "remediation", "governance", "agent"] as const;

type FeedEvent = { type: string; title: string; detail: string; time: string };

interface Props {
  events?: FeedEvent[];
}

export default function LiveFeed({ events }: Props) {
  const [filter, setFilter] = useState<string>("all");
  const [showAuditTrail, setShowAuditTrail] = useState(false);

  const source = events ?? FEED_EVENTS;
  const filtered =
    filter === "all"
      ? source
      : source.filter((e) => e.type === filter);

  return (
    <>
      <Panel number="★" title="Live Activity Feed">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] text-zinc-400">
            Real-time orchestration activity
          </div>
          <div className="flex gap-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`text-[11px] px-2 py-1 rounded-md capitalize transition-colors ${filter === f ? "bg-zinc-200 text-zinc-800 font-semibold" : "text-zinc-500 hover:bg-zinc-100"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.map((ev, i) => (
          <div
            key={i}
            className="flex gap-2.5 py-2.5 border-t border-zinc-100 first:border-t-0 items-start"
          >
            <span
              className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${feedDot[ev.type]}`}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-zinc-800">
                {ev.title}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">
                {ev.detail}
              </div>
            </div>
            <span className="text-[10.5px] text-zinc-400 shrink-0">
              {ev.time}
            </span>
          </div>
        ))}

        <div className="mt-3">
          <button type="button" onClick={() => setShowAuditTrail(true)}>
            <LinkAction>View full audit trail →</LinkAction>
          </button>
        </div>
      </Panel>

      {showAuditTrail && (
        <SideModal
          isOpen={showAuditTrail}
          onClose={() => setShowAuditTrail(false)}
          title="Full Audit Trail"
          subTitle="Append-only record of all orchestration activity."
        >
          <div className="space-y-4">
            <div className="flex gap-1 mb-2">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`text-[11px] px-2.5 py-1 rounded-md capitalize transition-colors ${filter === f ? "bg-zinc-200 text-zinc-800 font-semibold" : "text-zinc-500 hover:bg-zinc-100"}`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-200">
                    <th className="text-left pb-2 pr-2">Type</th>
                    <th className="text-left pb-2 pr-2">Event</th>
                    <th className="text-left pb-2 pr-2">Detail</th>
                    <th className="text-left pb-2">When</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((ev, i) => (
                    <tr key={i} className="border-t border-zinc-100">
                      <td className="py-2.5 pr-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            ev.type === "remediation"
                              ? "bg-emerald-50 text-emerald-700"
                              : ev.type === "governance"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {ev.type}
                        </span>
                      </td>
                      <td className="py-2.5 pr-2 font-semibold text-zinc-800">
                        {ev.title}
                      </td>
                      <td className="py-2.5 pr-2 text-zinc-500">{ev.detail}</td>
                      <td className="py-2.5 text-zinc-400">{ev.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Every orchestration action, governance decision, and agent
              retraining event is written to an immutable audit record.
            </p>
          </div>
        </SideModal>
      )}
    </>
  );
}
